export interface ReadinessScoreComponent {
  score: number
  reason: string
}

export interface ReadinessScoreExplanation {
  totalScore: number
  components: {
    land: ReadinessScoreComponent
    utility: ReadinessScoreComponent
    permits: ReadinessScoreComponent
    environmental: ReadinessScoreComponent
    schedule: ReadinessScoreComponent
    strategic: ReadinessScoreComponent
  }
}

export interface ReadinessSnapshot {
  id: string
  siteId: string
  score: number
  landScore: number | null
  utilityScore: number | null
  permittingScore: number | null
  environmentalScore: number | null
  scheduleScore: number | null
  strategicScore: number | null
  computedAt: string
  scoringVersion: string
  explanation: ReadinessScoreExplanation | null
}

export interface ScoringWeights {
  land: number
  utility: number
  permits: number
  environmental: number
  schedule: number
  strategic: number
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  land: 0.25,
  utility: 0.30,
  permits: 0.20,
  environmental: 0.10,
  schedule: 0.10,
  strategic: 0.05,
}
