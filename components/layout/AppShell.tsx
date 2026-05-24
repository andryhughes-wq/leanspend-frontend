'use client'
import { useState } from 'react'
import { type TabId } from '@/app/page'
import { ThemePanel } from './ThemePanel'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'budget',    label: 'Budget',    icon: '💰' },
  { id: 'calendar',  label: 'Calendar',  icon: '📅' },
  { id: 'meals',     label: 'Meals',     icon: '🍽️' },
  { id: 'nutrition', label: 'Nutrition', icon: '🥗' },
  { id: 'tips',      label: 'Tips',      icon: '💡' },
]

export function AppShell({ activeTab, onTabChange, children }: {
  activeTab: TabId; onTabChange: (t: TabId) => void; children: React.ReactNode
}) {
  const [themeOpen, setThemeOpen] = useState(false)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <header style={{
        background: 'var(--p)',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderRadius: '0 0 20px 20px',
        boxShadow: '0 4px 20px rgba(107,203,119,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 26 }}>💪</span>
          <div className="font-display" style={{ fontSize: 22, color: '#fff', letterSpacing: 1 }}>
            Lean<span style={{ color: 'var(--acc)' }}>Spend</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['📱', '🔔'].map((ic, i) => (
            <button key={i} style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: '#fff', fontSize: 15, cursor: 'pointer',
            }}>{ic}</button>
          ))}
          <button
            onClick={() => setThemeOpen(o => !o)}
            title="Customize theme"
            style={{
              width: 34, height: 34, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: '#fff', fontSize: 15, cursor: 'pointer',
            }}>🎨</button>
        </div>
      </header>

      {/* Theme Panel */}
      {themeOpen && <ThemePanel onClose={() => setThemeOpen(false)} />}

      {/* Nav */}
      <nav style={{
        display: 'flex',
        background: 'var(--card)',
        borderBottom: '2px solid var(--border)',
        position: 'sticky',
        top: 68,
        zIndex: 40,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              flex: 1,
              padding: '10px 4px 8px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 10,
              fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
              color: activeTab === t.id ? 'var(--p-dark)' : 'var(--muted)',
              borderBottom: `3px solid ${activeTab === t.id ? 'var(--p)' : 'transparent'}`,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: 19 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main style={{ padding: 16, flex: 1 }} className="animate-fade-in">
        {children}
      </main>

      <footer style={{ textAlign: 'center', padding: '12px 0', fontSize: 11, color: 'var(--faint)', fontWeight: 700 }}>
        LeanSpend · Eat lean. Spend less. Live fit. 💪
      </footer>
    </div>
  )
}
