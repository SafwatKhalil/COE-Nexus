import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

export interface Utility {
  id: string
  siteId: string
  utilityType: string
  providerName: string | null
  status: string
  availableCapacity: number | null
  committedCapacity: number | null
  unit: string | null
  estimatedDeliveryDate: string | null
  confidenceScore: number | null
  riskLevel: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  site?: { id: string; name: string; region: string }
  powerDetails?: {
    voltageLevel: string | null
    substationName: string | null
    feederStatus: string | null
    queuePosition: string | null
    interconnectionRequired: boolean | null
  } | null
}

export function useUtilities(params?: { type?: string; status?: string }) {
  return useQuery({
    queryKey: ['utilities', params],
    queryFn: async () => {
      const { data } = await api.get<Utility[]>('/utilities', { params })
      return data
    },
  })
}

export function useUpdateUtility() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...dto }: Partial<Utility> & { id: string }) => {
      const { data } = await api.patch(`/utilities/${id}`, dto)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['utilities'] }),
  })
}
