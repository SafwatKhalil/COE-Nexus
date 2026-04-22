import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { AuditService } from './audit.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Audit')
@ApiBearerAuth()
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @ApiOperation({ summary: 'List audit events for the tenant with filters' })
  findForTenant(
    @TenantId() tenantId: string,
    @Query('entityType') entityType?: string,
    @Query('action') action?: string,
    @Query('fromDate') fromDate?: string,
    @Query('toDate') toDate?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.auditService.findForTenant(tenantId, { entityType, action, fromDate, toDate }, page, pageSize)
  }

  @Get(':entityType/:entityId')
  @ApiOperation({ summary: 'Get audit history for a specific entity' })
  findForEntity(
    @TenantId() tenantId: string,
    @Param('entityType') entityType: string,
    @Param('entityId', ParseUUIDPipe) entityId: string,
    @Query('limit') limit?: number,
  ) {
    return this.auditService.findForEntity(tenantId, entityType, entityId, limit)
  }
}
