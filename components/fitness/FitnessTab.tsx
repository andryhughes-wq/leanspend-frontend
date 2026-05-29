'use client'
import { ChatWidget } from '@/components/chat/ChatWidget'

export function FitnessTab() {
  return (
    <div style={{ padding: '28px', color: 'white' }}>
      <div style={{ fontSize: 24, fontWeight: 900, marginBottom: 16 }}>Fitness Tracker</div>
      <div style={{ opacity: 0.5, fontSize: 14 }}>Coming soon — Daily macro logging, TDEE calculator, weight tracking</div>
      <div style={{ marginTop: 24 }}><ChatWidget context="budget" /></div>
    </div>
  )
}