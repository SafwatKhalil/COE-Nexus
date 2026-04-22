import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SitesService } from './sites.service'
import { CreateSiteDto } from './dto/create-site.dto'
import { UpdateSiteDto } from './dto/update-site.dto'
import { QuerySiteDto } from './dto/query-site.dto'
import { TenantId, CurrentUser } from '../../common/decorators/tenant.decorator'

@ApiTags('Sites')
@ApiBearerAuth()
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new site' })
  create(
    @TenantId() tenantId: string,
    @CurrentUser() user: { id: string },
    @Body() dto: CreateSiteDto,
  ) {
    return this.sitesService.create(tenantId, user.id, dto)
  }

  @Get()
  @ApiOperation({ summary: 'List all sites with filters and pagination' })
  findAll(@TenantId() tenantId: string, @Query() query: QuerySiteDto) {
    return this.sitesService.findAll(tenantId, query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get site details with all related data' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.sitesService.findOne(tenantId, id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update site fields' })
  update(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSiteDto,
  ) {
    return this.sitesService.update(tenantId, id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Soft-delete a site' })
  remove(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.sitesService.remove(tenantId, id)
  }
}
