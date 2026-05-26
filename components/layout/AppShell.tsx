'use client'
import { useState } from 'react'
import { type TabId } from '@/app/page'

const TABS: { id: TabId; label: string }[] = [
  { id: 'budget',    label: 'Budget'    },
  { id: 'calendar',  label: 'Calendar'  },
  { id: 'meals',     label: 'Meals'     },
  { id: 'nutrition', label: 'Nutrition' },
  { id: 'tips',      label: 'Tips'      },
]

export function AppShell({ activeTab, onTabChange, children }: {
  activeTab: TabId; onTabChange: (t: TabId) => void; children: React.ReactNode
}) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative' }}>

      {/* Header */}
      <header style={{
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 56,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(5,10,18,0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #b8f4ff, #40caf0 40%, #1a7fd4 70%, #060f2e)',
            boxShadow: '0 0 18px rgba(0,200,255,0.55)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 900, color: 'white',
          }}>L</div>
          <div className="font-display" style={{ fontSize: 22, color: '#fff', letterSpacing: 0.5 }}>
            Lean<span style={{ color: 'var(--acc)' }}>Spend</span>
          </div>
        </div>

        {/* Nav tabs inline */}
        <nav style={{ display: 'flex', gap: 2 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => onTabChange(t.id)} style={{
              padding: '6px 22px',
              height: 36,
              border: 'none',
              borderRadius: 22,
              background: activeTab === t.id ? 'rgba(255,255,255,0.1)' : 'transparent',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
              color: activeTab === t.id ? 'white' : 'rgba(255,255,255,0.45)',
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
              outline: activeTab === t.id ? '1px solid rgba(255,255,255,0.18)' : 'none',
            }}>{t.label}</button>
          ))}
        </nav>

        {/* Right icons */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['=', 'share', 'bell'].map((ic, i) => (
            <button key={i} style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.6)', fontSize: 14, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{ic === '=' ? '\u2630' : ic === 'share' ? '\u21A5' : '\uD83D\uDD14'}</button>
          ))}
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(167,139,250,0.4))',
            border: '1px solid rgba(255,255,255,0.3)',
            cursor: 'pointer',
          }} />
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, maxWidth: 1400, width: '100%', margin: '0 auto', boxSizing: 'border-box' }} className="animate-fade-in">
        {children}
      </main>

      <footer style={{ textAlign: 'center', padding: '14px 0', fontSize: 12, color: 'rgba(255,255,255,0.2)', fontWeight: 700 }}>
        LeanSpend  Eat lean. Spend less. Live fit.
      </footer>
    </div>
  )
}
