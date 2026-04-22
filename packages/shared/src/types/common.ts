export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical'
export type ConfidenceLevel = 'low' | 'medium' | 'high'
