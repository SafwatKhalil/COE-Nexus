import { Controller, Get, Post, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ParcelsService, CreateParcelDto } from './parcels.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Parcels')
@ApiBearerAuth()
@Controller('sites/:siteId/parcels')
export class ParcelsController {
  constructor(private readonly parcelsService: ParcelsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a parcel to a site' })
  create(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Body() dto: CreateParcelDto,
  ) {
    return this.parcelsService.create(tenantId, siteId, dto)
  }

  @Get()
  @ApiOperation({ summary: 'List parcels for a site' })
  findAll(@TenantId() tenantId: string, @Param('siteId', ParseUUIDPipe) siteId: string) {
    return this.parcelsService.findAll(tenantId, siteId)
  }

  @Patch(':parcelId')
  @ApiOperation({ summary: 'Update a parcel' })
  update(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Param('parcelId', ParseUUIDPipe) parcelId: string,
    @Body() dto: Partial<CreateParcelDto>,
  ) {
    return this.parcelsService.update(tenantId, siteId, parcelId, dto)
  }

  @Delete(':parcelId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a parcel' })
  remove(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Param('parcelId', ParseUUIDPipe) parcelId: string,
  ) {
    return this.parcelsService.remove(tenantId, siteId, parcelId)
  }
}
