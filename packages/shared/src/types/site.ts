export type LifecycleStage =
  | 'prospect'
  | 'feasibility'
  | 'entitlement'
  | 'development'
  | 'construction'
  | 'commissioning'
  | 'operational'
  | 'decommissioned'

export type ControlStatus = 'prospect' | 'loi' | 'optioned' | 'leased' | 'owned' | 'active'

export type ZoningStatus =
  | 'unknown'
  | 'non_conforming'
  | 'pending_rezoning'
  | 'conditionally_approved'
  | 'approved'

export interface Site {
  id: string
  tenantId: string
  siteCode: string | null
  name: string
  country: string | null
  region: string | null
  metro: string | null
  latitude: number | null
  longitude: number | null
  address: string | null
  lifecycleStage: LifecycleStage
  controlStatus: ControlStatus
  zoningStatus: ZoningStatus | null
  strategicPriority: number | null
  targetMw: number | null
  deliverableMw: number | null
  notes: string | null
  createdById: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface Parcel {
  id: string
  siteId: string
  apn: string | null
  acreage: number | null
  ownershipType: string | null
  acquisitionDate: string | null
  saleOptionExpiration: string | null
  zoningClassification: string | null
  environmentalStatus: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateSiteDto {
  siteCode?: string
  name: string
  country?: string
  region?: string
  metro?: string
  latitude?: number
  longitude?: number
  address?: string
  lifecycleStage?: LifecycleStage
  controlStatus?: ControlStatus
  zoningStatus?: ZoningStatus
  strategicPriority?: number
  targetMw?: number
  notes?: string
}

export interface UpdateSiteDto extends Partial<CreateSiteDto> {}

export interface CreateParcelDto {
  apn?: string
  acreage?: number
  ownershipType?: string
  acquisitionDate?: string
  saleOptionExpiration?: string
  zoningClassification?: string
  environmentalStatus?: string
}

export interface UpdateParcelDto extends Partial<CreateParcelDto> {}

export interface SiteWithRelations extends Site {
  parcels?: Parcel[]
  latestReadinessScore?: number | null
}
