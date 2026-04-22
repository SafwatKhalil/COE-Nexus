import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { TenantId } from '../../common/decorators/tenant.decorator'

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('portfolio-summary')
  @ApiOperation({ summary: 'Portfolio-level summary: MW by stage/region, bottlenecks, avg readiness' })
  getPortfolioSummary(@TenantId() tenantId: string) {
    return this.dashboardService.getPortfolioSummary(tenantId)
  }

  @Get('capacity-by-region')
  @ApiOperation({ summary: 'MW capacity breakdown by region with readiness scores' })
  getCapacityByRegion(@TenantId() tenantId: string) {
    return this.dashboardService.getCapacityByRegion(tenantId)
  }

  @Get('bottlenecks')
  @ApiOperation({ summary: 'Active blockers: power, permits, environmental, task blocks' })
  getBottlenecks(@TenantId() tenantId: string) {
    return this.dashboardService.getBottlenecks(tenantId)
  }
}
