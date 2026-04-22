import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { UtilitiesService, CreateUtilityDto } from './utilities.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Utilities')
@ApiBearerAuth()
@Controller()
export class UtilitiesController {
  constructor(private readonly utilitiesService: UtilitiesService) {}

  @Get('utilities')
  @ApiOperation({ summary: 'List all utilities for the tenant' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'status', required: false })
  findAll(
    @TenantId() tenantId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
  ) {
    return this.utilitiesService.findAll(tenantId, { type, status })
  }

  @Post('sites/:siteId/utilities')
  @ApiOperation({ summary: 'Add utility record to a site' })
  create(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Body() dto: CreateUtilityDto,
  ) {
    return this.utilitiesService.create(tenantId, siteId, dto)
  }

  @Get('sites/:siteId/utilities')
  @ApiOperation({ summary: 'List utilities for a site' })
  findBySite(@TenantId() tenantId: string, @Param('siteId', ParseUUIDPipe) siteId: string) {
    return this.utilitiesService.findBySite(tenantId, siteId)
  }

  @Patch('utilities/:id')
  @ApiOperation({ summary: 'Update a utility record' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: Partial<CreateUtilityDto>,
  ) {
    return this.utilitiesService.update(tenantId, id, dto)
  }
}
