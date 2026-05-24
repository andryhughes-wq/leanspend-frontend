import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  r => r,
  err => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export const budgetApi = {
  calculate: (body: object) => api.post('/budget/calculate', body).then(r => r.data),
  createUser: (body: object) => api.post('/budget/users', body).then(r => r.data),
}

export const mealsApi = {
  // Weekly generation (new)
  generateWeek: (body: object) => api.post('/meals/generate-week', body).then(r => r.data),
  // Add custom food to plan
  addFood: (body: object) => api.post('/meals/add-food', body).then(r => r.data),
  // Preset plans
  getPresets: () => api.get('/meals/presets').then(r => r.data),
  getPreset: (goal: string) => api.get(`/meals/presets/${goal}`).then(r => r.data),
  // Saved plans
  getPlan: (userId: string, month: number, year: number) =>
    api.get(`/meals/plan/${userId}`, { params: { month, year } }).then(r => r.data),
  getDay: (userId: string, date: string) =>
    api.get(`/meals/day/${userId}`, { params: { date } }).then(r => r.data),
}

export const dealsApi = {
  // Live weekly ads from store websites
  getWeeklyAds: (stores?: string[]) =>
    api.get('/deals/weekly-ads', { params: stores ? { stores: stores.join(',') } : {} }).then(r => r.data),
  getStoreAd: (store: string) =>
    api.get(`/deals/weekly-ads/${store}`).then(r => r.data),
  getAdStatus: () =>
    api.get('/deals/ad-status').then(r => r.data),
  // DB deals + live merged
  getActive: (params?: object) => api.get('/deals/active', { params }).then(r => r.data),
  getCalendar: (month: number, year: number) =>
    api.get('/deals/calendar', { params: { month, year } }).then(r => r.data),
  refresh: (stores?: string[]) =>
    api.post('/deals/refresh', { stores }).then(r => r.data),
}

export const nutritionApi = {
  search:      (q: string) => api.get('/nutrition/search', { params: { q } }).then(r => r.data),
  getFacts:    (id: string) => api.get(`/nutrition/facts/${id}`).then(r => r.data),
  getBenefits: (ingredient: string) =>
    api.get('/nutrition/benefits', { params: { ingredient } }).then(r => r.data),
}

export const chatApi = {
  send: (message: string, history: object[] = [], context?: string, userContext?: object) =>
    api.post('/chat', { message, history, context, userContext }).then(r => r.data),
}

export const themeApi = {
  save: (userId: string, themeColor: string, themeName?: string) =>
    api.post('/theme/save', { userId, themeColor, themeName }).then(r => r.data),
}
