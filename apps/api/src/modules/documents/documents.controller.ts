import {
  Controller, Post, Get, Body, Param, ParseUUIDPipe,
  UseInterceptors, UploadedFile, Query,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { DocumentsService } from './documents.service'
import { TenantId, CurrentUser } from '../../common/decorators/tenant.decorator'

@ApiTags('Documents')
@ApiBearerAuth()
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload a document file' })
  upload(
    @TenantId() tenantId: string,
    @CurrentUser() user: { id: string },
    @UploadedFile() file: Express.Multer.File,
    @Body('documentType') documentType?: string,
  ) {
    return this.documentsService.create(tenantId, user.id, file, documentType)
  }

  @Post(':id/link')
  @ApiOperation({ summary: 'Link a document to an entity (site, permit, utility, task)' })
  link(
    @TenantId() tenantId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { entityType: string; entityId: string },
  ) {
    return this.documentsService.link(tenantId, id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document metadata and links' })
  findOne(@TenantId() tenantId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.findOne(tenantId, id)
  }
}
