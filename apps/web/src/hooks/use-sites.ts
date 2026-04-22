import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import type { CreateSiteDto, UpdateSiteDto, PaginatedResponse } from '@coe-nexus/shared'

export function useSites(params?: {
  region?: string
  lifecycleStage?: string
  search?: string
  page?: number
  pageSize?: number
}) {
  return useQuery({
    queryKey: ['sites', params],
    queryFn: async () => {
      const { data } = await api.get<PaginatedResponse<any>>('/sites', { params })
      return data
    },
  })
}

export function useSite(id: string) {
  return useQuery({
    queryKey: ['sites', id],
    queryFn: async () => {
      const { data } = await api.get(`/sites/${id}`)
      return data
    },
    enabled: !!id,
  })
}

export function useCreateSite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: CreateSiteDto) => {
      const { data } = await api.post('/sites', dto)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites'] }),
  })
}

export function useUpdateSite(id: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (dto: UpdateSiteDto) => {
      const { data } = await api.patch(`/sites/${id}`, dto)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sites', id] })
      qc.invalidateQueries({ queryKey: ['sites'] })
    },
  })
}

export function useRecomputeReadiness(siteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/sites/${siteId}/recompute-readiness`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sites', siteId] }),
  })
}

export function useReadinessHistory(siteId: string) {
  return useQuery({
    queryKey: ['readiness-history', siteId],
    queryFn: async () => {
      const { data } = await api.get(`/sites/${siteId}/readiness-history`)
      return data
    },
    enabled: !!siteId,
  })
}
