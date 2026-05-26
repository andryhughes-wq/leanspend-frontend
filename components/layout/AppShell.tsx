'use client'
import { useState } from 'react'
import { type TabId } from '@/app/page'
import { ThemePanel } from './ThemePanel'

const TABS: { id: TabId; label: string; icon: string }[] = [
  { id: 'budget',    label: 'Budget',    icon: '' },
  { id: 'calendar',  label: 'Calendar',  icon: '' },
  { id: 'meals',     label: 'Meals',     icon: '' },
  { id: 'nutrition', label: 'Nutrition', icon: '' },
  { id: 'tips',      label: 'Tips',      icon: '' },
]

export function AppShell({ activeTab, onTabChange, children }: {
  activeTab: TabId; onTabChange: (t: TabId) => void; children: React.ReactNode
}) {
  const [themeOpen, setThemeOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>

      {/* Header  full width */}
      <header style={{
        background: 'var(--p)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 58,
        position: 'sticky',
        top: 0,
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(107,203,119,0.25)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}></span>
          <div className="font-display" style={{ fontSize: 24, color: '#fff', letterSpacing: 1 }}>
            Lean<span style={{ color: 'var(--acc)' }}>Spend</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {['', ''].map((ic, i) => (
            <button key={i} style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)', border: 'none',
              color: '#fff', fontSize: 16, cursor: 'pointer',
            }}>{ic}</button>
          ))}
          <button
            onClick={() => setThemeOpen(o => !o)}
            title="Customize theme"
            style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,0.25)',
              border: '1.5px solid rgba(255,255,255,0.5)',
              color: '#fff', fontSize: 16, cursor: 'pointer',
            }}></button>
        </div>
      </header>

      {/* Theme Panel */}
      {themeOpen && (
        <div style={{ padding: '0 32px' }}>
          <ThemePanel onClose={() => setThemeOpen(false)} />
        </div>
      )}

      {/* Nav  full width */}
      <nav style={{
        display: 'flex',
        background: 'var(--card)',
        borderBottom: '2px solid var(--border)',
        position: 'sticky',
        top: 58,
        zIndex: 40,
        padding: '0 24px',
        flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            style={{
              padding: '0 24px',
              height: 50,
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: 800,
              fontFamily: 'Nunito, sans-serif',
              color: activeTab === t.id ? 'var(--p-dark)' : 'var(--muted)',
              borderBottom: `3px solid ${activeTab === t.id ? 'var(--p)' : 'transparent'}`,
              display: 'flex',
              alignItems: 'center',
              gap: 7,
              transition: 'all 0.15s',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Content  full width with max 1400px */}
      <main style={{
        flex: 1,
        padding: '24px 32px',
        maxWidth: 1400,
        width: '100%',
        margin: '0 auto',
        boxSizing: 'border-box',
      }} className="animate-fade-in">
        {children}
      </main>

      <footer style={{ textAlign: 'center', padding: '14px 0', fontSize: 12, color: 'var(--faint)', fontWeight: 700 }}>
        LeanSpend  Eat lean. Spend less. Live fit. 
      </footer>
    </div>
  )
}
