import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Permit {
  id: string
  siteId: string
  permitType: string
  agencyName: string | null
  status: string
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
  site?: { id: string; name: string; region: string }
}

export interface PermitsResponse {
  items: Permit[]
  total: number
  page: number
  limit: number
  pages: number
}

export function usePermits(params?: {
  status?: string
  riskLevel?: string
  blocking?: boolean
  page?: number
  limit?: number
}) {
  return useQuery({
    queryKey: ['permits', params],
    queryFn: async () => {
      const { data } = await api.get<PermitsResponse>('/permits', { params })
      return data
    },
  })
}

export function useCreatePermit(siteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: Partial<Permit>) => {
      const { data } = await api.post(`/sites/${siteId}/permits`, dto)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permits'] }),
  })
}

export function useUpdatePermit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<Permit> & { id: string }) => {
      const { data } = await api.patch(`/permits/${id}`, dto)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['permits'] }),
  })
}
