'use client'
import { useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { AppShell } from '@/components/layout/AppShell'
import { BudgetTab }    from '@/components/budget/BudgetTab'
import { OrbitTab }    from '@/components/budget/OrbitTab'
import { DietsTab }    from '@/components/diets/DietsTab'
import { ScannerTab } from '@/components/scanner/ScannerTab'
import { CalendarTab }  from '@/components/calendar/CalendarTab'
import { MealsTab }     from '@/components/meals/MealsTab'
import { NutritionTab } from '@/components/nutrition/NutritionTab'
import { TipsTab }      from '@/components/tips/TipsTab'
import { FitnessTab }   from '@/components/fitness/FitnessTab'
import { NearbyTab }    from '@/components/nearby/NearbyTab'
import { ListTab }      from '@/components/list/ListTab'

export type TabId = 'budget' | 'orbit' | 'diets' | 'scanner' | 'calendar' | 'meals' | 'nutrition' | 'fitness' | 'tips' | 'nearby' | 'list'

export default function HomePage() {
  const tab = useAppStore(s => s.activeTab) as TabId
  const setTab = useAppStore(s => s.setActiveTab)
  const setAuth = useAppStore(s => s.setAuth)
  useEffect(() => {
    authApi.me()
      .then((data: any) => { if (data && data.user) setAuth(data.user, data.token || '') })
      .catch(() => {})
  }, [setAuth])
  return (
    <AppShell activeTab={tab} onTabChange={setTab}>
      {tab === 'budget'    && <BudgetTab />}
        {tab === 'orbit'    && <OrbitTab />}
        {tab === 'diets'    && <DietsTab />}
        {tab === 'scanner'  && <ScannerTab />}
      {tab === 'calendar'  && <CalendarTab />}
      {tab === 'meals'     && <MealsTab />}
      {tab === 'nutrition' && <NutritionTab />}
      {tab === 'fitness'   && <FitnessTab />}
      {tab === 'tips'      && <TipsTab />}
        {tab === 'nearby'    && <NearbyTab />}
        {tab === 'list'      && <ListTab />}
    </AppShell>
  )
}
