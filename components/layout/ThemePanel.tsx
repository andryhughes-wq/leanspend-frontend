'use client'

const THEMES = [
  { name: 'Forest',   p: '#6BCB77', p2: '#42B24E', pl: '#E8F9E9', pd: '#2A6B30', s: '#4ECDC4', sl: '#E0FAF8', sd: '#0F6E56', bg: '#F7FEF9', border: '#D4EDD6', acc: '#FFE66D', acd: '#F0A500' },
  { name: 'Coral',    p: '#FF6B6B', p2: '#FF8E53', pl: '#FFE8E8', pd: '#C62A2A', s: '#4ECDC4', sl: '#E0FAF8', sd: '#0F6E56', bg: '#FFF9F5', border: '#F0EBE3', acc: '#FFE66D', acd: '#F0A500' },
  { name: 'Ocean',    p: '#3B82F6', p2: '#60A5FA', pl: '#EFF6FF', pd: '#1D4ED8', s: '#06B6D4', sl: '#ECFEFF', sd: '#0E7490', bg: '#F0F9FF', border: '#BFDBFE', acc: '#FCD34D', acd: '#D97706' },
  { name: 'Berry',    p: '#DB2777', p2: '#EC4899', pl: '#FDF2F8', pd: '#831843', s: '#9333EA', sl: '#FAF5FF', sd: '#581C87', bg: '#FFF5F7', border: '#FBCFE8', acc: '#FDE68A', acd: '#B45309' },
  { name: 'Sunset',   p: '#F97316', p2: '#FB923C', pl: '#FFF7ED', pd: '#C2410C', s: '#EAB308', sl: '#FEFCE8', sd: '#854D0E', bg: '#FFFBF5', border: '#FED7AA', acc: '#FDE68A', acd: '#92400E' },
  { name: 'Lavender', p: '#7C3AED', p2: '#8B5CF6', pl: '#F5F3FF', pd: '#4C1D95', s: '#EC4899', sl: '#FDF2F8', sd: '#9D174D', bg: '#FAFAF9', border: '#DDD6FE', acc: '#FDE68A', acd: '#B45309' },
  { name: 'Slate',    p: '#475569', p2: '#64748B', pl: '#F8FAFC', pd: '#1E293B', s: '#0EA5E9', sl: '#F0F9FF', sd: '#0C4A6E', bg: '#F8FAFC', border: '#CBD5E1', acc: '#FCD34D', acd: '#D97706' },
  { name: 'Rose',     p: '#E11D48', p2: '#F43F5E', pl: '#FFF1F2', pd: '#9F1239', s: '#F59E0B', sl: '#FFFBEB', sd: '#92400E', bg: '#FFF5F6', border: '#FECDD3', acc: '#FDE68A', acd: '#B45309' },
]

function applyTheme(t: typeof THEMES[0]) {
  const r = document.documentElement
  r.style.setProperty('--p',      t.p)
  r.style.setProperty('--p2',     t.p2)
  r.style.setProperty('--p-light',t.pl)
  r.style.setProperty('--p-dark', t.pd)
  r.style.setProperty('--s',      t.s)
  r.style.setProperty('--s-light',t.sl)
  r.style.setProperty('--s-dark', t.sd)
  r.style.setProperty('--bg',     t.bg)
  r.style.setProperty('--border', t.border)
  r.style.setProperty('--acc',    t.acc)
  r.style.setProperty('--acc-dark',t.acd)
  localStorage.setItem('ls-theme', JSON.stringify(t))
}

export function ThemePanel({ onClose }: { onClose: () => void }) {
  return (
    <div style={{
      background: 'var(--card)',
      border: '2px solid var(--border)',
      borderRadius: 20,
      margin: '8px 16px',
      padding: 18,
      animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--text)' }}>🎨 Customize your theme</div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--muted)' }}>✕</button>
      </div>

      <div style={{
        background: 'var(--s-light)',
        border: '2px solid var(--s)',
        borderRadius: 12,
        padding: '10px 14px',
        fontSize: 11,
        fontWeight: 700,
        color: 'var(--s-dark)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 14,
      }}>
        🔄 Theme syncs across web app, Telegram bot, and Android app instantly.
      </div>

      <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.4px', marginBottom: 10 }}>
        Preset themes
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
        {THEMES.map(t => (
          <button
            key={t.name}
            onClick={() => applyTheme(t)}
            style={{
              background: 'var(--bg)',
              border: '2px solid var(--border)',
              borderRadius: 12,
              padding: '10px 6px',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'border-color 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = t.p)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
          >
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: t.p, margin: '0 auto 6px' }} />
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text)' }}>{t.name}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
