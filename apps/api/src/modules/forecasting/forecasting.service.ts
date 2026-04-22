import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import dayjs from 'dayjs'

@Injectable()
export class ForecastingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Deterministic v1 forecast: find the latest blocking constraint date
   * and project capacity online after that point.
   */
  async forecastSite(tenantId: string, siteId: string) {
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, tenantId, deletedAt: null },
      include: {
        utilities: { where: { utilityType: 'power' } },
        permits: { where: { blocking: true } },
        tasks: { where: { critical: true } },
      },
    })

    if (!site) throw new NotFoundException(`Site ${siteId} not found`)

    const constraintDates: Date[] = []

    // Power delivery constraint
    const powerUtil = site.utilities[0]
    if (powerUtil?.estimatedDeliveryDate) {
      constraintDates.push(powerUtil.estimatedDeliveryDate)
    }

    // Blocking permit expected approvals
    for (const permit of site.permits) {
      if (permit.expectedApprovalDate) constraintDates.push(permit.expectedApprovalDate)
    }

    // Critical task end dates
    for (const task of site.tasks) {
      if (task.plannedEndDate) constraintDates.push(task.plannedEndDate)
    }

    const latestConstraint =
      constraintDates.length > 0
        ? constraintDates.reduce((a, b) => (a > b ? a : b))
        : null

    // Add 30-day commissioning buffer if we have a date
    const expectedOnlineDate = latestConstraint
      ? dayjs(latestConstraint).add(30, 'day').toDate()
      : null

    const expectedOnlineMw = Number(site.deliverableMw ?? site.targetMw ?? 0)

    let forecast = null
    if (expectedOnlineDate && expectedOnlineMw > 0) {
      forecast = await this.prisma.capacityForecast.create({
        data: {
          siteId,
          forecastDate: expectedOnlineDate,
          expectedOnlineMw,
          confidenceLow: expectedOnlineMw * 0.75,
          confidenceHigh: expectedOnlineMw,
          assumptionSet: {
            latestConstraintDate: latestConstraint?.toISOString(),
            commissioningBufferDays: 30,
            powerStatus: powerUtil?.status,
            openBlockingPermits: site.permits.filter((p) => p.status !== 'approved').length,
          },
          computedAt: new Date(),
        },
      })
    }

    return {
      siteId,
      siteName: site.name,
      expectedOnlineDate,
      expectedOnlineMw,
      confidenceLow: forecast?.confidenceLow,
      confidenceHigh: forecast?.confidenceHigh,
      blockingFactors: {
        powerNotCommitted: !powerUtil || !['committed', 'active'].includes(powerUtil.status),
        openBlockingPermits: site.permits.filter((p) => p.status !== 'approved').length,
        incompleteCriticalTasks: site.tasks.filter((t) => t.status !== 'completed').length,
      },
      forecast,
    }
  }

  async getPortfolioForecast(tenantId: string) {
    const forecasts = await this.prisma.capacityForecast.findMany({
      where: { site: { tenantId, deletedAt: null }, scenarioId: null },
      include: { site: { select: { name: true, region: true } } },
      orderBy: { forecastDate: 'asc' },
    })

    // Group by quarter
    const byQuarter = new Map<string, { mw: number; count: number }>()
    for (const f of forecasts) {
      const quarter = dayjs(f.forecastDate).format('YYYY-[Q]Q')
      const entry = byQuarter.get(quarter) ?? { mw: 0, count: 0 }
      entry.mw += Number(f.expectedOnlineMw)
      entry.count++
      byQuarter.set(quarter, entry)
    }

    // Group by region
    const byRegion = new Map<string, { mw: number; count: number }>()
    for (const f of forecasts) {
      const region = f.site.region ?? 'Unknown'
      const entry = byRegion.get(region) ?? { mw: 0, count: 0 }
      entry.mw += Number(f.expectedOnlineMw)
      entry.count++
      byRegion.set(region, entry)
    }

    return {
      totalExpectedMw: forecasts.reduce((sum, f) => sum + Number(f.expectedOnlineMw), 0),
      forecastCount: forecasts.length,
      byQuarter: Array.from(byQuarter.entries()).map(([quarter, v]) => ({
        quarter,
        expectedMw: Math.round(v.mw * 10) / 10,
        siteCount: v.count,
      })),
      byRegion: Array.from(byRegion.entries()).map(([region, v]) => ({
        region,
        expectedMw: Math.round(v.mw * 10) / 10,
        siteCount: v.count,
      })),
    }
  }
}
