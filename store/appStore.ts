import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Expense {
  id: string
  label: string
  amount: number
  category: string
}

interface Profile {
  id?: string
  monthlyIncome: number
  foodBudget: number
  householdSize: number
  fitnessGoal: string
  allergies: string[]
  dyeFilters: string[]
  preferredStores: string[]
  expenses: Expense[]
}

export interface ListItem {
  id: string
  name: string
  checked: boolean
  deal?: { price: number; store: string; product: string } | null
}

export interface AuthUser {
  id: string
  name: string
  email: string
}

interface AppState {
  profile: Profile
  mealPlan: any
  auth: { user: AuthUser | null; token: string | null }
  shoppingList: ListItem[]
  activeTab: string
  setProfile: (p: Partial<Profile>) => void
  setMealPlan: (plan: any) => void
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  setActiveTab: (t: string) => void
  addListItem: (name: string) => void
  addListItems: (names: string[]) => void
  removeListItem: (id: string) => void
  toggleListItem: (id: string) => void
  clearList: () => void
  setListItemDeal: (id: string, deal: ListItem['deal']) => void
}

const DEFAULT: Profile = {
  monthlyIncome: 0,
  foodBudget: 0,
  householdSize: 1,
  fitnessGoal: 'balanced',
  allergies: [],
  dyeFilters: [],
  preferredStores: ['kroger', 'walmart', 'heb'],
  expenses: [],
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      profile: DEFAULT,
      mealPlan: null,
      auth: { user: null, token: null },
      shoppingList: [],
      activeTab: 'budget',
      setProfile: p => set(s => ({ profile: { ...s.profile, ...p } })),
      setMealPlan: plan => set({ mealPlan: plan }),
      setAuth: (user, token) => set({ auth: { user, token } }),
      clearAuth: () => set({ auth: { user: null, token: null } }),
      setActiveTab: t => set({ activeTab: t }),
      addListItem: name => set(s => (name.trim() ? { shoppingList: [...s.shoppingList, { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 7), name: name.trim(), checked: false, deal: undefined }] } : {})),
      addListItems: names => set(s => ({ shoppingList: [...s.shoppingList, ...names.map(n => n.trim()).filter(Boolean).map((n, i) => ({ id: Date.now().toString(36) + i + Math.random().toString(36).slice(2, 6), name: n, checked: false, deal: undefined }))] })),
      removeListItem: id => set(s => ({ shoppingList: s.shoppingList.filter(i => i.id !== id) })),
      toggleListItem: id => set(s => ({ shoppingList: s.shoppingList.map(i => i.id === id ? { ...i, checked: !i.checked } : i) })),
      clearList: () => set({ shoppingList: [] }),
      setListItemDeal: (id, deal) => set(s => ({ shoppingList: s.shoppingList.map(i => i.id === id ? { ...i, deal } : i) })),
    }),
    { name: 'leanspend-store' }
  )
)
