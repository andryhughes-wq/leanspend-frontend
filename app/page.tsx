'use client'
import { useEffect } from 'react'
import { authApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { AppShell } from '@/components/layout/AppShell'
import { SectionTabs } from '@/components/layout/SectionTabs'
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

export type TabId = 'budget' | 'deals' | 'tips' | 'meals' | 'nutrition' | 'fitness'

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
      {tab === 'budget' && <SectionTabs views={[
        { label:'Dashboard', node:<BudgetTab /> },
        { label:'Orbit',     node:<OrbitTab /> },
      ]} />}
      {tab === 'deals' && <SectionTabs views={[
        { label:'Scan',     node:<ScannerTab /> },
        { label:'Near Me',  node:<NearbyTab /> },
        { label:'Calendar', node:<CalendarTab /> },
      ]} />}
      {tab === 'tips'      && <TipsTab />}
      {tab === 'meals'     && <MealsTab />}
      {tab === 'nutrition' && <SectionTabs views={[
        { label:'Browse', node:<NutritionTab /> },
        { label:'Diets',  node:<DietsTab /> },
      ]} />}
      {tab === 'fitness'   && <FitnessTab />}
    </AppShell>
  )
}
