import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { PermitsService } from './permits.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Permits')
@ApiBearerAuth()
@Controller()
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

  @Get('permits')
  @ApiOperation({ summary: 'List all permits for the tenant' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'riskLevel', required: false })
  @ApiQuery({ name: 'blocking', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @TenantId() tenantId: string,
    @Query('status') status?: string,
    @Query('riskLevel') riskLevel?: string,
    @Query('blocking') blocking?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.permitsService.findAll(tenantId, {
      status,
      riskLevel,
      blocking: blocking === 'true' ? true : blocking === 'false' ? false : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    })
  }

  @Post('sites/:siteId/permits')
  @ApiOperation({ summary: 'Add a permit record to a site' })
  create(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Body() dto: any,
  ) {
    return this.permitsService.create(tenantId, siteId, dto)
  }

  @Get('sites/:siteId/permits')
  @ApiOperation({ summary: 'List permits for a site' })
  findBySite(@TenantId() tenantId: string, @Param('siteId', ParseUUIDPipe) siteId: string) {
    return this.permitsService.findBySite(tenantId, siteId)
  }

  @Patch('permits/:id')
  @ApiOperation({ summary: 'Update a permit' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: any,
  ) {
    return this.permitsService.update(tenantId, id, dto)
  }
}
