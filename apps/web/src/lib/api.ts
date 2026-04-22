import axios from 'axios'

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('coe_nexus_auth')
      if (raw) {
        const parsed = JSON.parse(raw)
        const token = parsed?.state?.token
        if (token) config.headers.Authorization = `Bearer ${token}`
      }
    } catch {}
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('coe_nexus_auth')
      window.location.href = '/auth/login'
    }
    return Promise.reject(err)
  },
)
