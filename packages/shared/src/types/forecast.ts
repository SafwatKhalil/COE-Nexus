export interface CapacityForecast {
  id: string
  siteId: string
  scenarioId: string | null
  forecastDate: string
  expectedOnlineMw: number
  confidenceLow: number | null
  confidenceHigh: number | null
  assumptionSet: Record<string, unknown> | null
  computedAt: string | null
}

export interface Scenario {
  id: string
  tenantId: string
  name: string
  description: string | null
  baseType: 'site' | 'region' | 'portfolio'
  createdById: string | null
  createdAt: string
  updatedAt: string
}

export interface PortfolioForecast {
  byQuarter: QuarterlyForecast[]
  byRegion: RegionForecast[]
  totalExpectedMw: number
  atRiskSiteCount: number
}

export interface QuarterlyForecast {
  quarter: string
  expectedMw: number
  confidenceLow: number
  confidenceHigh: number
  siteCount: number
}

export interface RegionForecast {
  region: string
  expectedMw: number
  siteCount: number
  atRiskSiteCount: number
}

export interface CreateScenarioDto {
  name: string
  description?: string
  baseType: 'site' | 'region' | 'portfolio'
}
