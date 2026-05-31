'use client'
import { useState } from 'react'
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

export type TabId = 'budget' | 'orbit' | 'diets' | 'scanner' | 'calendar' | 'meals' | 'nutrition' | 'fitness' | 'tips'

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('budget')
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
    </AppShell>
  )
}
