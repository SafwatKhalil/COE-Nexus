import { Controller, Get, Post, Patch, Body, Param, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { PermitsService } from './permits.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Permits')
@ApiBearerAuth()
@Controller()
export class PermitsController {
  constructor(private readonly permitsService: PermitsService) {}

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
