import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class PermitsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tenantId: string, siteId: string, dto: any) {
    await this.verifySiteOwnership(tenantId, siteId)
    const { dueDate, expectedApprovalDate, actualApprovalDate, ...rest } = dto
    return this.prisma.permit.create({
      data: {
        ...rest,
        siteId,
        status: dto.status ?? 'not_started',
        required: dto.required ?? true,
        blocking: dto.blocking ?? false,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        expectedApprovalDate: expectedApprovalDate ? new Date(expectedApprovalDate) : undefined,
        actualApprovalDate: actualApprovalDate ? new Date(actualApprovalDate) : undefined,
      },
    })
  }

  async findBySite(tenantId: string, siteId: string) {
    await this.verifySiteOwnership(tenantId, siteId)
    return this.prisma.permit.findMany({
      where: { siteId },
      orderBy: [{ blocking: 'desc' }, { dueDate: 'asc' }],
    })
  }

  async findOne(id: string) {
    const permit = await this.prisma.permit.findUnique({ where: { id } })
    if (!permit) throw new NotFoundException(`Permit ${id} not found`)
    return permit
  }

  async update(tenantId: string, id: string, dto: any) {
    const permit = await this.findOne(id)
    await this.verifySiteOwnership(tenantId, permit.siteId)
    const { dueDate, expectedApprovalDate, actualApprovalDate, ...rest } = dto
    return this.prisma.permit.update({
      where: { id },
      data: {
        ...rest,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        expectedApprovalDate: expectedApprovalDate ? new Date(expectedApprovalDate) : undefined,
        actualApprovalDate: actualApprovalDate ? new Date(actualApprovalDate) : undefined,
      },
    })
  }

  private async verifySiteOwnership(tenantId: string, siteId: string) {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId, deletedAt: null } })
    if (!site) throw new NotFoundException(`Site ${siteId} not found`)
    return site
  }
}
