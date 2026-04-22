import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function usePortfolioSummary() {
  return useQuery({
    queryKey: ['dashboard', 'portfolio-summary'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/portfolio-summary')
      return data
    },
    refetchInterval: 5 * 60 * 1000, // refresh every 5 min
  })
}

export function useCapacityByRegion() {
  return useQuery({
    queryKey: ['dashboard', 'capacity-by-region'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/capacity-by-region')
      return data
    },
  })
}

export function useBottlenecks() {
  return useQuery({
    queryKey: ['dashboard', 'bottlenecks'],
    queryFn: async () => {
      const { data } = await api.get('/dashboard/bottlenecks')
      return data
    },
  })
}

export function usePortfolioForecast() {
  return useQuery({
    queryKey: ['forecast', 'portfolio'],
    queryFn: async () => {
      const { data } = await api.get('/portfolio/forecast')
      return data
    },
  })
}
