import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { TasksService } from './tasks.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Tasks & Schedule')
@ApiBearerAuth()
@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post('sites/:siteId/tasks')
  @ApiOperation({ summary: 'Create a task for a site' })
  create(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Body() dto: any,
  ) {
    return this.tasksService.create(tenantId, siteId, dto)
  }

  @Get('sites/:siteId/schedule')
  @ApiOperation({ summary: 'Get full schedule with CPM analysis for a site' })
  getSchedule(@TenantId() tenantId: string, @Param('siteId', ParseUUIDPipe) siteId: string) {
    return this.tasksService.getSchedule(tenantId, siteId)
  }

  @Patch('tasks/:id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.tasksService.update(tenantId, id, dto)
  }

  @Post('tasks/:taskId/dependencies')
  @ApiOperation({ summary: 'Add a predecessor dependency to a task' })
  addDependency(
    @TenantId() tenantId: string,
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() dto: { predecessorTaskId: string; dependencyType?: string; lagDays?: number },
  ) {
    return this.tasksService.addDependency(tenantId, taskId, dto)
  }
}
