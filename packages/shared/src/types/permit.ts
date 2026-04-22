export type PermitStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'approved'
  | 'denied'
  | 'withdrawn'

export interface Permit {
  id: string
  siteId: string
  permitType: string
  agencyName: string | null
  status: PermitStatus
  required: boolean
  blocking: boolean
  ownerUserId: string | null
  dueDate: string | null
  expectedApprovalDate: string | null
  actualApprovalDate: string | null
  riskLevel: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface EnvironmentalConstraint {
  id: string
  siteId: string
  constraintType: string
  status: string | null
  severity: string | null
  blocking: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePermitDto {
  permitType: string
  agencyName?: string
  status?: PermitStatus
  required?: boolean
  blocking?: boolean
  ownerUserId?: string
  dueDate?: string
  expectedApprovalDate?: string
  riskLevel?: string
  notes?: string
}

export interface UpdatePermitDto extends Partial<CreatePermitDto> {}

export interface CreateEnvironmentalConstraintDto {
  constraintType: string
  status?: string
  severity?: string
  blocking?: boolean
  notes?: string
}

export interface UpdateEnvironmentalConstraintDto
  extends Partial<CreateEnvironmentalConstraintDto> {}
