'use client'
import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { BudgetTab }    from '@/components/budget/BudgetTab'
import { CalendarTab }  from '@/components/calendar/CalendarTab'
import { MealsTab }     from '@/components/meals/MealsTab'
import { NutritionTab } from '@/components/nutrition/NutritionTab'
import { TipsTab }      from '@/components/tips/TipsTab'
import { FitnessTab }   from '@/components/fitness/FitnessTab'

export type TabId = 'budget' | 'calendar' | 'meals' | 'nutrition' | 'fitness' | 'tips'

export default function HomePage() {
  const [tab, setTab] = useState<TabId>('budget')
  return (
    <AppShell activeTab={tab} onTabChange={setTab}>
      {tab === 'budget'    && <BudgetTab />}
      {tab === 'calendar'  && <CalendarTab />}
      {tab === 'meals'     && <MealsTab />}
      {tab === 'nutrition' && <NutritionTab />}
      {tab === 'fitness'   && <FitnessTab />}
      {tab === 'tips'      && <TipsTab />}
    </AppShell>
  )
}
