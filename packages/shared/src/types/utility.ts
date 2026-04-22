export type UtilityType = 'power' | 'fiber' | 'water' | 'wastewater' | 'gas'

export type UtilityStatus =
  | 'unavailable'
  | 'under_study'
  | 'pending'
  | 'committed'
  | 'active'
  | 'decommissioned'

export interface Utility {
  id: string
  siteId: string
  utilityType: UtilityType
  providerName: string | null
  status: UtilityStatus
  availableCapacity: number | null
  committedCapacity: number | null
  unit: string | null
  estimatedDeliveryDate: string | null
  actualDeliveryDate: string | null
  confidenceScore: number | null
  riskLevel: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  powerDetails?: PowerDetails | null
}

export interface PowerDetails {
  utilityId: string
  voltageLevel: string | null
  substationName: string | null
  feederStatus: string | null
  queuePosition: string | null
  interconnectionRequired: boolean | null
  energizationDependency: string | null
}

export interface CreateUtilityDto {
  utilityType: UtilityType
  providerName?: string
  status?: UtilityStatus
  availableCapacity?: number
  committedCapacity?: number
  unit?: string
  estimatedDeliveryDate?: string
  confidenceScore?: number
  riskLevel?: string
  notes?: string
  powerDetails?: Partial<Omit<PowerDetails, 'utilityId'>>
}

export interface UpdateUtilityDto extends Partial<CreateUtilityDto> {}
