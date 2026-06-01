import axios from 'axios'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export const api = axios.create({
  baseURL: API,
  timeout: 60000,
  withCredentials: true,
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
  generateWeek: (body: object) => api.post('/meals/generate-week', body).then(r => r.data),
  addFood: (body: object) => api.post('/meals/add-food', body).then(r => r.data),
  getPresets: () => api.get('/meals/presets').then(r => r.data),
  getPreset: (goal: string) => api.get(`/meals/presets/${goal}`).then(r => r.data),
  getPlan: (userId: string, month: number, year: number) =>
    api.get(`/meals/plan/${userId}`, { params: { month, year } }).then(r => r.data),
  getDay: (userId: string, date: string) =>
    api.get(`/meals/day/${userId}`, { params: { date } }).then(r => r.data),
}

export const dealsApi = {
  getWeeklyAds: (stores?: string[]) =>
    api.get('/deals/weekly-ads', { params: stores ? { stores: stores.join(',') } : {} }).then(r => r.data),
  getStoreAd: (store: string) =>
    api.get(`/deals/weekly-ads/${store}`).then(r => r.data),
  getAdStatus: () =>
    api.get('/deals/ad-status').then(r => r.data),
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

export const authApi = {
  register: (email: string, password: string, displayName?: string) =>
    api.post('/auth/register', { email, password, displayName }).then(r => r.data),
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then(r => r.data),
  me: () => api.get('/auth/me').then(r => r.data),
  logout: () => api.post('/auth/logout', {}).then(r => r.data),
}

export const geoApi = {
  submit: (body: { productName: string; price: number; storeName?: string; brand?: string; barcode?: string; latitude?: number; longitude?: number; zip?: string }) =>
    api.post('/deals/submit', body).then(r => r.data),
  nearby: (lat: number, lng: number, radius: number) =>
    api.get('/deals/nearby', { params: { lat, lng, radius } }).then(r => r.data),
}