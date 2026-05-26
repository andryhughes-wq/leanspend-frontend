'use client'
import { useState, useEffect } from 'react'
import { type TabId } from '@/app/page'
import { GalaxyBackground } from './GalaxyBackground'

const TABS: { id: TabId; label: string }[] = [
  { id:'budget',    label:'Budget'    },
  { id:'calendar',  label:'Calendar'  },
  { id:'meals',     label:'Meals'     },
  { id:'nutrition', label:'Nutrition' },
  { id:'tips',      label:'Tips'      },
]

const PALETTES = [
  { name:'Ocean',   vars:{ '--p':'#4ECDC4','--s':'#38bdf8','--acc':'#7ecfff','--pu':'#a78bfa' } },
  { name:'Forest',  vars:{ '--p':'#6BCB77','--s':'#4ECDC4','--acc':'#FFE66D','--pu':'#A78BFA' } },
  { name:'Sunset',  vars:{ '--p':'#f97316','--s':'#ec4899','--acc':'#FFE66D','--pu':'#a78bfa' } },
  { name:'Aurora',  vars:{ '--p':'#a78bfa','--s':'#38bdf8','--acc':'#34d399','--pu':'#f472b6' } },
  { name:'Coral',   vars:{ '--p':'#ff6b6b','--s':'#ffd93d','--acc':'#6bcb77','--pu':'#c084fc' } },
  { name:'Ice',     vars:{ '--p':'#60a5fa','--s':'#a5f3fc','--acc':'#e0f2fe','--pu':'#c7d2fe' } },
]

const TAB_COLORS = ['#6BCB77','#4ECDC4','#A78BFA','#FFE66D','#ff6b6b']

export function AppShell({ activeTab, onTabChange, children }: {
  activeTab: TabId; onTabChange: (t: TabId) => void; children: React.ReactNode
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [activePalette, setActivePalette] = useState(1)
  const [colorCycle, setColorCycle] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setColorCycle(c => (c+1) % 360), 50)
    return () => clearInterval(id)
  }, [])

  const applyPalette = (idx: number) => {
    setActivePalette(idx)
    const vars = PALETTES[idx].vars
    Object.entries(vars).forEach(([k,v]) => {
      document.documentElement.style.setProperty(k, v)
    })
    setPaletteOpen(false)
  }

  const getTabColor = (i: number) => {
    const offset = (colorCycle + i * 72) % 360
    return `hsl(${offset}, 75%, 68%)`
  }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', background:'#050a12' }}>
      <GalaxyBackground />

      <header style={{
        padding:'0 24px', display:'flex', alignItems:'center',
        justifyContent:'space-between', height:58,
        position:'sticky', top:0, zIndex:50,
        background:'rgba(5,10,18,0.65)',
        backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
        borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0,
      }}>

        {/* LOGO: Lean [EKG] Spend */}
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          <div style={{
            width:36, height:36, borderRadius:'50%', marginRight:10,
            background:'radial-gradient(circle at 35% 30%, #b8f4ff, #40caf0 40%, #1a7fd4 70%, #060f2e)',
            boxShadow:'0 0 18px rgba(0,200,255,0.55)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:14, fontWeight:900, color:'white', flexShrink:0,
          }}>L</div>
          <span className="font-display" style={{ fontSize:22, color:'#fff', letterSpacing:0.3 }}>Lean</span>
          <svg width="54" height="28" viewBox="0 0 54 28" style={{ margin:'0 2px', display:'block' }}>
            <polyline
              points="0,14 8,14 12,4 16,24 20,8 24,20 28,14 36,14 40,6 44,22 48,14 54,14"
              fill="none" stroke="#ff6b6b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
              style={{ filter:'drop-shadow(0 0 4px rgba(255,107,107,0.8))' }}
            />
            <polyline
              points="0,14 8,14 12,4 16,24 20,8 24,20 28,14 36,14 40,6 44,22 48,14 54,14"
              fill="none" stroke="rgba(255,107,107,0.3)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
          <span className="font-display" style={{ fontSize:22, color:'var(--acc)', letterSpacing:0.3 }}>Spend</span>
        </div>

        {/* COLOR-CYCLING BUBBLE TABS */}
        <nav style={{ display:'flex', gap:6 }}>
          {TABS.map((t,i) => {
            const active = activeTab === t.id
            const col    = getTabColor(i)
            return (
              <button key={t.id} onClick={() => onTabChange(t.id)} style={{
                padding:'7px 22px', height:38, border:'none',
                borderRadius:99,
                background: active
                  ? `${col}28`
                  : 'rgba(255,255,255,0.05)',
                boxShadow: active
                  ? `0 0 16px ${col}55, inset 0 0 12px ${col}18`
                  : 'none',
                outline: active
                  ? `1.5px solid ${col}88`
                  : '1px solid rgba(255,255,255,0.1)',
                cursor:'pointer', fontSize:13, fontWeight:800,
                fontFamily:'Nunito,sans-serif',
                color: active ? col : 'rgba(255,255,255,0.42)',
                transition:'background 0.2s, box-shadow 0.2s, color 0.2s',
                whiteSpace:'nowrap',
                textShadow: active ? `0 0 10px ${col}99` : 'none',
              }}>{t.label}</button>
            )
          })}
        </nav>

        {/* RIGHT: color palette + icons */}
        <div style={{ display:'flex', gap:8, alignItems:'center', position:'relative' }}>

          {/* Palette button */}
          <button onClick={() => setPaletteOpen(o=>!o)} style={{
            width:36, height:36, borderRadius:'50%', cursor:'pointer', border:'none',
            background:'conic-gradient(#ff6b6b, #FFE66D, #6BCB77, #4ECDC4, #60a5fa, #A78BFA, #ff6b6b)',
            boxShadow: paletteOpen ? '0 0 18px rgba(255,255,255,0.3)' : '0 0 8px rgba(255,255,255,0.1)',
            transition:'box-shadow 0.2s',
          }} title="Change theme" />

          {/* Palette popup */}
          {paletteOpen && (
            <div style={{
              position:'absolute', top:46, right:0, zIndex:200,
              background:'rgba(8,14,26,0.95)', backdropFilter:'blur(24px)',
              border:'1px solid rgba(255,255,255,0.12)', borderRadius:16,
              padding:16, minWidth:220,
              boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
            }}>
              <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.6px', textTransform:'uppercase', marginBottom:12 }}>Color Theme</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {PALETTES.map((p,i) => (
                  <button key={p.name} onClick={()=>applyPalette(i)} style={{
                    padding:'8px 12px', borderRadius:10, cursor:'pointer',
                    border:'1px solid '+(activePalette===i?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.1)'),
                    background:activePalette===i?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',
                    display:'flex', alignItems:'center', gap:8,
                    fontFamily:'Nunito,sans-serif',
                  }}>
                    <div style={{ display:'flex', gap:3 }}>
                      {Object.values(p.vars).slice(0,3).map((c,ci) => (
                        <div key={ci} style={{ width:12, height:12, borderRadius:'50%', background:c, flexShrink:0 }} />
                      ))}
                    </div>
                    <span style={{ fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.75)' }}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {['\u2630','\u21A5'].map((ic,i) => (
            <button key={i} style={{
              width:34, height:34, borderRadius:'50%',
              background:'rgba(255,255,255,0.07)',
              border:'1px solid rgba(255,255,255,0.11)',
              color:'rgba(255,255,255,0.55)', fontSize:14, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{ic}</button>
          ))}
          <div style={{
            width:34, height:34, borderRadius:'50%',
            background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(167,139,250,0.4))',
            border:'1px solid rgba(255,255,255,0.28)', cursor:'pointer',
          }} />
        </div>
      </header>

      <main style={{
        flex:1, maxWidth:1400, width:'100%', margin:'0 auto',
        boxSizing:'border-box', position:'relative', zIndex:10,
      }} className="animate-fade-in">
        {children}
      </main>

      <footer style={{ textAlign:'center', padding:'14px 0', fontSize:12, color:'rgba(255,255,255,0.18)', fontWeight:700, position:'relative', zIndex:10 }}>
        LeanSpend  Eat lean. Spend less. Live fit.
      </footer>
    </div>
  )
}
