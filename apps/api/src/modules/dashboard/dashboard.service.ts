import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getPortfolioSummary(tenantId: string) {
    const [sites, utilities, permits] = await Promise.all([
      this.prisma.site.findMany({
        where: { tenantId, deletedAt: null },
        include: {
          readinessSnapshots: {
            orderBy: { computedAt: 'desc' },
            take: 1,
            select: { score: true },
          },
        },
      }),
      this.prisma.utility.findMany({
        where: { site: { tenantId, deletedAt: null } },
      }),
      this.prisma.permit.findMany({
        where: { site: { tenantId, deletedAt: null }, blocking: true },
      }),
    ])

    const mwByStage = sites.reduce(
      (acc, s) => {
        const stage = s.lifecycleStage
        acc[stage] = (acc[stage] ?? 0) + Number(s.targetMw ?? 0)
        return acc
      },
      {} as Record<string, number>,
    )

    const mwByRegion = sites.reduce(
      (acc, s) => {
        const region = s.region ?? 'Unknown'
        acc[region] = (acc[region] ?? 0) + Number(s.targetMw ?? 0)
        return acc
      },
      {} as Record<string, number>,
    )

    const totalTargetMw = sites.reduce((sum, s) => sum + Number(s.targetMw ?? 0), 0)
    const totalDeliverableMw = sites.reduce((sum, s) => sum + Number(s.deliverableMw ?? 0), 0)

    const scores = sites
      .filter((s) => s.readinessSnapshots[0])
      .map((s) => Number(s.readinessSnapshots[0].score))

    const avgReadiness = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : null

    const bottlenecks = {
      powerPending: utilities.filter((u) => u.utilityType === 'power' && u.status === 'pending').length,
      powerUnder: utilities.filter((u) => u.utilityType === 'power' && u.status === 'under_study').length,
      fiberPending: utilities.filter((u) => u.utilityType === 'fiber' && u.status !== 'committed' && u.status !== 'active').length,
      blockingPermitsOpen: permits.filter((p) => p.status !== 'approved').length,
    }

    return {
      totalSites: sites.length,
      totalTargetMw,
      totalDeliverableMw,
      avgReadinessScore: avgReadiness ? Math.round(avgReadiness * 10) / 10 : null,
      mwByStage,
      mwByRegion,
      bottlenecks,
      sitesByStage: sites.reduce((acc, s) => {
        acc[s.lifecycleStage] = (acc[s.lifecycleStage] ?? 0) + 1
        return acc
      }, {} as Record<string, number>),
    }
  }

  async getCapacityByRegion(tenantId: string) {
    const sites = await this.prisma.site.findMany({
      where: { tenantId, deletedAt: null },
      select: {
        region: true,
        metro: true,
        lifecycleStage: true,
        targetMw: true,
        deliverableMw: true,
        readinessSnapshots: {
          orderBy: { computedAt: 'desc' },
          take: 1,
          select: { score: true },
        },
      },
    })

    const byRegion = new Map<string, {
      region: string
      totalTargetMw: number
      totalDeliverableMw: number
      siteCount: number
      avgReadiness: number[]
      stages: Record<string, number>
    }>()

    for (const site of sites) {
      const region = site.region ?? 'Unknown'
      if (!byRegion.has(region)) {
        byRegion.set(region, {
          region,
          totalTargetMw: 0,
          totalDeliverableMw: 0,
          siteCount: 0,
          avgReadiness: [],
          stages: {},
        })
      }
      const entry = byRegion.get(region)!
      entry.totalTargetMw += Number(site.targetMw ?? 0)
      entry.totalDeliverableMw += Number(site.deliverableMw ?? 0)
      entry.siteCount++
      entry.stages[site.lifecycleStage] = (entry.stages[site.lifecycleStage] ?? 0) + 1
      if (site.readinessSnapshots[0]) {
        entry.avgReadiness.push(Number(site.readinessSnapshots[0].score))
      }
    }

    return Array.from(byRegion.values()).map((r) => ({
      ...r,
      avgReadinessScore: r.avgReadiness.length
        ? Math.round((r.avgReadiness.reduce((a, b) => a + b, 0) / r.avgReadiness.length) * 10) / 10
        : null,
      avgReadiness: undefined,
    }))
  }

  async getBottlenecks(tenantId: string) {
    const [powerIssues, permitsBlocking, envIssues, tasksBlocked] = await Promise.all([
      this.prisma.utility.findMany({
        where: {
          site: { tenantId, deletedAt: null },
          utilityType: 'power',
          status: { in: ['unavailable', 'under_study', 'pending'] },
        },
        include: { site: { select: { id: true, name: true, region: true } } },
      }),
      this.prisma.permit.findMany({
        where: {
          site: { tenantId, deletedAt: null },
          blocking: true,
          status: { in: ['not_started', 'in_progress', 'submitted'] },
        },
        include: { site: { select: { id: true, name: true, region: true } } },
      }),
      this.prisma.environmentalConstraint.findMany({
        where: {
          site: { tenantId, deletedAt: null },
          blocking: true,
        },
        include: { site: { select: { id: true, name: true, region: true } } },
      }),
      this.prisma.task.findMany({
        where: {
          site: { tenantId, deletedAt: null },
          status: 'blocked',
        },
        include: { site: { select: { id: true, name: true, region: true } } },
      }),
    ])

    return {
      power: {
        count: powerIssues.length,
        items: powerIssues.map((u) => ({
          siteId: u.site.id,
          siteName: u.site.name,
          region: u.site.region,
          status: u.status,
          provider: u.providerName,
          estimatedDelivery: u.estimatedDeliveryDate,
        })),
      },
      permits: {
        count: permitsBlocking.length,
        items: permitsBlocking.map((p) => ({
          siteId: p.site.id,
          siteName: p.site.name,
          region: p.site.region,
          permitType: p.permitType,
          status: p.status,
          riskLevel: p.riskLevel,
          dueDate: p.dueDate,
        })),
      },
      environmental: {
        count: envIssues.length,
        items: envIssues.map((e) => ({
          siteId: e.site.id,
          siteName: e.site.name,
          region: e.site.region,
          constraintType: e.constraintType,
          severity: e.severity,
        })),
      },
      tasksBlocked: {
        count: tasksBlocked.length,
        items: tasksBlocked.map((t) => ({
          siteId: t.site.id,
          siteName: t.site.name,
          region: t.site.region,
          taskName: t.name,
          critical: t.critical,
        })),
      },
    }
  }
}
