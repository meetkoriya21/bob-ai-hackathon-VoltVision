import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL })

export const getDashboard    = ()           => api.get('/api/dashboard').then(r => r.data)
export const getAssets       = (params)     => api.get('/api/assets', { params }).then(r => r.data)
export const getAsset        = (id)         => api.get(`/api/assets/${id}`).then(r => r.data)
export const getWeather      = ()           => api.get('/api/weather').then(r => r.data)
export const getWeatherZone  = (zoneId)     => api.get(`/api/weather/${zoneId}`).then(r => r.data)
export const getIncidents    = (params)     => api.get('/api/incidents', { params }).then(r => r.data)
export const getRecommendation = (id)       => api.get(`/api/recommendations/${id}`).then(r => r.data)
