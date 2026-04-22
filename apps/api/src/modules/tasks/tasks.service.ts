import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CriticalPathService } from './critical-path.service'

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cpmService: CriticalPathService,
  ) {}

  async create(tenantId: string, siteId: string, dto: any) {
    await this.verifySiteOwnership(tenantId, siteId)
    const { plannedStartDate, plannedEndDate, ...rest } = dto
    return this.prisma.task.create({
      data: {
        ...rest,
        siteId,
        status: dto.status ?? 'not_started',
        critical: dto.critical ?? false,
        plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : undefined,
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
      },
    })
  }

  async getSchedule(tenantId: string, siteId: string) {
    await this.verifySiteOwnership(tenantId, siteId)

    const tasks = await this.prisma.task.findMany({
      where: { siteId },
      include: {
        predecessorDependencies: true,
        successorDependencies: true,
      },
      orderBy: { plannedStartDate: 'asc' },
    })

    const dependencies = await this.prisma.taskDependency.findMany({
      where: { predecessorTask: { siteId } },
    })

    const cpmResult = this.cpmService.compute(
      tasks.map((t) => ({
        id: t.id,
        durationDays: t.durationDays ?? 1,
        plannedStartDate: t.plannedStartDate,
        plannedEndDate: t.plannedEndDate,
      })),
      dependencies.map((d) => ({
        predecessorTaskId: d.predecessorTaskId,
        successorTaskId: d.successorTaskId,
        dependencyType: d.dependencyType,
        lagDays: d.lagDays,
      })),
    )

    return {
      tasks: tasks.map((t) => ({
        ...t,
        critical: cpmResult.criticalTasks.has(t.id),
        totalFloat: cpmResult.totalFloat.get(t.id) ?? null,
        earlyStart: cpmResult.earlyStart.get(t.id) ?? null,
        earlyFinish: cpmResult.earlyFinish.get(t.id) ?? null,
        lateStart: cpmResult.lateStart.get(t.id) ?? null,
        lateFinish: cpmResult.lateFinish.get(t.id) ?? null,
      })),
      dependencies,
      summary: {
        totalTasks: tasks.length,
        criticalTaskCount: cpmResult.criticalTasks.size,
        completedCount: tasks.filter((t) => t.status === 'completed').length,
        blockedCount: tasks.filter((t) => t.status === 'blocked').length,
      },
    }
  }

  async update(tenantId: string, id: string, dto: any) {
    const task = await this.prisma.task.findUnique({ where: { id } })
    if (!task) throw new NotFoundException(`Task ${id} not found`)
    await this.verifySiteOwnership(tenantId, task.siteId)

    const { plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, ...rest } = dto
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        plannedStartDate: plannedStartDate ? new Date(plannedStartDate) : undefined,
        plannedEndDate: plannedEndDate ? new Date(plannedEndDate) : undefined,
        actualStartDate: actualStartDate ? new Date(actualStartDate) : undefined,
        actualEndDate: actualEndDate ? new Date(actualEndDate) : undefined,
      },
    })
  }

  async addDependency(tenantId: string, taskId: string, dto: {
    predecessorTaskId: string
    dependencyType?: string
    lagDays?: number
  }) {
    const task = await this.prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw new NotFoundException(`Task ${taskId} not found`)
    await this.verifySiteOwnership(tenantId, task.siteId)

    // Check for cycles before creating
    const allTasks = await this.prisma.task.findMany({ where: { siteId: task.siteId } })
    const allDeps = await this.prisma.taskDependency.findMany({
      where: { predecessorTask: { siteId: task.siteId } },
    })

    const wouldHaveCycle = this.cpmService.detectCycles(allTasks, [
      ...allDeps.map((d) => ({
        predecessorTaskId: d.predecessorTaskId,
        successorTaskId: d.successorTaskId,
        dependencyType: d.dependencyType,
        lagDays: d.lagDays,
      })),
      {
        predecessorTaskId: dto.predecessorTaskId,
        successorTaskId: taskId,
        dependencyType: dto.dependencyType ?? 'FS',
        lagDays: dto.lagDays ?? 0,
      },
    ])

    if (wouldHaveCycle) {
      throw new BadRequestException('Adding this dependency would create a cycle in the schedule graph')
    }

    return this.prisma.taskDependency.create({
      data: {
        predecessorTaskId: dto.predecessorTaskId,
        successorTaskId: taskId,
        dependencyType: dto.dependencyType ?? 'FS',
        lagDays: dto.lagDays ?? 0,
      },
    })
  }

  private async verifySiteOwnership(tenantId: string, siteId: string) {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId, deletedAt: null } })
    if (!site) throw new NotFoundException(`Site ${siteId} not found`)
    return site
  }
}
