import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'

const SCORING_VERSION = '1.0'

interface ScoringWeights {
  land: number
  utility: number
  permits: number
  environmental: number
  schedule: number
  strategic: number
}

const DEFAULT_WEIGHTS: ScoringWeights = {
  land: 0.25,
  utility: 0.30,
  permits: 0.20,
  environmental: 0.10,
  schedule: 0.10,
  strategic: 0.05,
}

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async recompute(tenantId: string, siteId: string) {
    const site = await this.prisma.site.findFirst({
      where: { id: siteId, tenantId, deletedAt: null },
      include: {
        utilities: { include: { powerDetails: true } },
        permits: true,
        environmentalConstraints: true,
        tasks: true,
      },
    })

    if (!site) throw new NotFoundException(`Site ${siteId} not found`)

    const weights = await this.getWeights(tenantId)
    const landScore = this.computeLandScore(site.controlStatus)
    const utilityScore = this.computeUtilityScore(site.utilities)
    const permittingScore = this.computePermittingScore(site.permits)
    const environmentalScore = this.computeEnvironmentalScore(site.environmentalConstraints)
    const scheduleScore = this.computeScheduleScore(site.tasks)
    const strategicScore = this.computeStrategicScore(site.strategicPriority)

    const totalScore =
      weights.land * landScore +
      weights.utility * utilityScore +
      weights.permits * permittingScore +
      weights.environmental * environmentalScore +
      weights.schedule * scheduleScore +
      weights.strategic * strategicScore

    const explanation = {
      totalScore: Math.round(totalScore * 10) / 10,
      components: {
        land: { score: landScore, reason: this.landReason(site.controlStatus) },
        utility: { score: utilityScore, reason: this.utilityReason(site.utilities) },
        permits: { score: permittingScore, reason: this.permitReason(site.permits) },
        environmental: {
          score: environmentalScore,
          reason: this.environmentalReason(site.environmentalConstraints),
        },
        schedule: { score: scheduleScore, reason: this.scheduleReason(site.tasks) },
        strategic: {
          score: strategicScore,
          reason: `Strategic priority: ${site.strategicPriority ?? 'not set'}`,
        },
      },
    }

    const snapshot = await this.prisma.readinessSnapshot.create({
      data: {
        siteId,
        score: totalScore,
        landScore,
        utilityScore,
        permittingScore,
        environmentalScore,
        scheduleScore,
        strategicScore,
        scoringVersion: SCORING_VERSION,
        explanation,
      },
    })

    return snapshot
  }

  async getHistory(tenantId: string, siteId: string, limit = 10) {
    const site = await this.prisma.site.findFirst({ where: { id: siteId, tenantId, deletedAt: null } })
    if (!site) throw new NotFoundException(`Site ${siteId} not found`)

    return this.prisma.readinessSnapshot.findMany({
      where: { siteId },
      orderBy: { computedAt: 'desc' },
      take: limit,
    })
  }

  private computeLandScore(controlStatus: string): number {
    const scores: Record<string, number> = {
      owned: 100,
      leased: 80,
      optioned: 60,
      loi: 40,
      prospect: 20,
      active: 100,
    }
    return scores[controlStatus] ?? 0
  }

  private computeUtilityScore(utilities: any[]): number {
    if (!utilities.length) return 0

    const powerUtil = utilities.find((u) => u.utilityType === 'power')
    const fiberUtil = utilities.find((u) => u.utilityType === 'fiber')

    const powerScore = powerUtil ? this.utilityStatusScore(powerUtil.status) : 0
    const fiberScore = fiberUtil ? this.utilityStatusScore(fiberUtil.status) : 50

    const confidencePenalty = powerUtil?.confidenceScore
      ? (1 - Number(powerUtil.confidenceScore)) * 10
      : 0

    return Math.max(0, Math.round((powerScore * 0.7 + fiberScore * 0.3) - confidencePenalty))
  }

  private utilityStatusScore(status: string): number {
    const scores: Record<string, number> = {
      active: 100,
      committed: 85,
      pending: 60,
      under_study: 35,
      unavailable: 0,
      decommissioned: 0,
    }
    return scores[status] ?? 0
  }

  private computePermittingScore(permits: any[]): number {
    if (!permits.length) return 50

    const blockingPermits = permits.filter((p) => p.blocking)
    if (!blockingPermits.length) return 80

    const approved = blockingPermits.filter((p) => p.status === 'approved')
    const approvalRate = approved.length / blockingPermits.length
    const riskPenalty = blockingPermits.filter(
      (p) => p.status !== 'approved' && p.riskLevel === 'high',
    ).length * 10

    return Math.max(0, Math.round(approvalRate * 100 - riskPenalty))
  }

  private computeEnvironmentalScore(constraints: any[]): number {
    if (!constraints.length) return 100

    const blocking = constraints.filter((c) => c.blocking)
    if (!blocking.length) return 80

    const critical = blocking.filter((c) => c.severity === 'critical').length
    const high = blocking.filter((c) => c.severity === 'high').length

    return Math.max(0, 100 - critical * 30 - high * 15)
  }

  private computeScheduleScore(tasks: any[]): number {
    if (!tasks.length) return 50

    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const blocked = tasks.filter((t) => t.status === 'blocked').length

    const completionRate = completed / total
    const blockPenalty = (blocked / total) * 30

    return Math.max(0, Math.round(completionRate * 100 - blockPenalty))
  }

  private computeStrategicScore(priority: number | null): number {
    if (priority === null) return 50
    // priority 1-5, 1=highest
    return Math.round(((6 - priority) / 5) * 100)
  }

  private landReason(controlStatus: string): string {
    const reasons: Record<string, string> = {
      owned: 'Site is fully owned',
      leased: 'Site is under lease',
      optioned: 'Site is under option agreement',
      loi: 'Site has Letter of Intent',
      prospect: 'Site is a prospect only',
      active: 'Site is active',
    }
    return reasons[controlStatus] ?? 'Unknown control status'
  }

  private utilityReason(utilities: any[]): string {
    const power = utilities.find((u) => u.utilityType === 'power')
    const fiber = utilities.find((u) => u.utilityType === 'fiber')
    const parts = []
    if (power) parts.push(`Power: ${power.status}`)
    if (fiber) parts.push(`Fiber: ${fiber.status}`)
    return parts.length ? parts.join(', ') : 'No utility records'
  }

  private permitReason(permits: any[]): string {
    const blocking = permits.filter((p) => p.blocking)
    const approved = blocking.filter((p) => p.status === 'approved')
    return `${approved.length}/${blocking.length} blocking permits approved`
  }

  private environmentalReason(constraints: any[]): string {
    const blocking = constraints.filter((c) => c.blocking)
    if (!blocking.length) return 'No blocking environmental constraints'
    return `${blocking.length} blocking environmental constraint(s)`
  }

  private scheduleReason(tasks: any[]): string {
    const total = tasks.length
    const completed = tasks.filter((t) => t.status === 'completed').length
    const blocked = tasks.filter((t) => t.status === 'blocked').length
    return `${completed}/${total} tasks completed, ${blocked} blocked`
  }

  private async getWeights(tenantId: string): Promise<ScoringWeights> {
    const tenantWeights = await this.prisma.tenantScoringWeights.findUnique({
      where: { tenantId },
    })

    if (!tenantWeights) return DEFAULT_WEIGHTS

    return {
      land: Number(tenantWeights.weightLand),
      utility: Number(tenantWeights.weightUtility),
      permits: Number(tenantWeights.weightPermits),
      environmental: Number(tenantWeights.weightEnvironmental),
      schedule: Number(tenantWeights.weightSchedule),
      strategic: Number(tenantWeights.weightStrategic),
    }
  }
}
