export type UserRole =
  | 'admin'
  | 'portfolio_planner'
  | 'program_manager'
  | 'real_estate_manager'
  | 'utility_specialist'
  | 'permit_specialist'
  | 'executive_viewer'
  | 'external_partner'

export interface User {
  id: string
  tenantId: string
  email: string
  name: string | null
  role: UserRole
  authProvider: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserDto {
  email: string
  name?: string
  role: UserRole
}

export interface UpdateUserDto {
  name?: string
  role?: UserRole
}
