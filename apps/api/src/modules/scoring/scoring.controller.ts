import { Controller, Post, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ScoringService } from './scoring.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Scoring')
@ApiBearerAuth()
@Controller('sites/:siteId')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('recompute-readiness')
  @ApiOperation({ summary: 'Trigger readiness score recomputation for a site' })
  recompute(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
  ) {
    return this.scoringService.recompute(tenantId, siteId)
  }

  @Get('readiness-history')
  @ApiOperation({ summary: 'Get historical readiness scores for a site' })
  getHistory(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
    @Query('limit') limit?: number,
  ) {
    return this.scoringService.getHistory(tenantId, siteId, limit)
  }
}
