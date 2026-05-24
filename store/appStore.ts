import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Profile {
  id?: string
  monthlyIncome: number
  foodBudget: number
  householdSize: number
  fitnessGoal: string
  allergies: string[]
  dyeFilters: string[]
  preferredStores: string[]
}

interface AppState {
  profile: Profile
  mealPlan: any
  setProfile: (p: Partial<Profile>) => void
  setMealPlan: (plan: any) => void
}

const DEFAULT: Profile = {
  monthlyIncome: 0, foodBudget: 0, householdSize: 1,
  fitnessGoal: 'balanced', allergies: [], dyeFilters: [],
  preferredStores: ['kroger', 'walmart', 'heb'],
}

export const useAppStore = create<AppState>()(
  persist(
    set => ({
      profile: DEFAULT,
      mealPlan: null,
      setProfile: p => set(s => ({ profile: { ...s.profile, ...p } })),
      setMealPlan: plan => set({ mealPlan: plan }),
    }),
    { name: 'leanspend-store' }
  )
)
