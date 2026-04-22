import { Controller, Post, Get, Param, ParseUUIDPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ForecastingService } from './forecasting.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Forecasting')
@ApiBearerAuth()
@Controller()
export class ForecastingController {
  constructor(private readonly forecastingService: ForecastingService) {}

  @Post('sites/:siteId/forecast')
  @ApiOperation({ summary: 'Run deterministic capacity forecast for a site' })
  forecastSite(
    @TenantId() tenantId: string,
    @Param('siteId', ParseUUIDPipe) siteId: string,
  ) {
    return this.forecastingService.forecastSite(tenantId, siteId)
  }

  @Get('portfolio/forecast')
  @ApiOperation({ summary: 'Get portfolio-wide capacity forecast by quarter and region' })
  getPortfolioForecast(@TenantId() tenantId: string) {
    return this.forecastingService.getPortfolioForecast(tenantId)
  }
}
