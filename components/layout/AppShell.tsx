'use client'
import { useState } from 'react'
import { type TabId } from '@/app/page'
import WalkBackground from '@/components/budget/WalkBackground'
import { AuthButton } from './AuthButton'

const NAV: { group: string; items: { id: TabId; label: string; icon: string }[] }[] = [
  { group: 'Spend less', items: [
    { id:'budget', label:'Budget', icon:'💰' },
    { id:'deals',  label:'Deals',  icon:'🏷️' },
    { id:'tips',   label:'Tips',   icon:'💡' },
  ]},
  { group: 'Eat lean', items: [
    { id:'meals',     label:'Meals',     icon:'🍽️' },
    { id:'nutrition', label:'Nutrition', icon:'🍎' },
  ]},
  { group: 'Live fit', items: [
    { id:'fitness', label:'Fitness', icon:'🏋️' },
  ]},
]

const ALL = NAV.flatMap(g => g.items.map(it => ({ ...it, group: g.group })))

const PALETTES = [
  { name:'Ocean',   vars:{ '--p':'#4ECDC4','--s':'#38bdf8','--acc':'#7ecfff','--pu':'#a78bfa' } },
  { name:'Forest',  vars:{ '--p':'#6BCB77','--s':'#4ECDC4','--acc':'#FFE66D','--pu':'#A78BFA' } },
  { name:'Sunset',  vars:{ '--p':'#f97316','--s':'#ec4899','--acc':'#FFE66D','--pu':'#a78bfa' } },
  { name:'Aurora',  vars:{ '--p':'#a78bfa','--s':'#38bdf8','--acc':'#34d399','--pu':'#f472b6' } },
  { name:'Coral',   vars:{ '--p':'#ff6b6b','--s':'#ffd93d','--acc':'#6bcb77','--pu':'#c084fc' } },
  { name:'Ice',     vars:{ '--p':'#60a5fa','--s':'#a5f3fc','--acc':'#e0f2fe','--pu':'#c7d2fe' } },
]

export function AppShell({ activeTab, onTabChange, children }: {
  activeTab: TabId; onTabChange: (t: TabId) => void; children: React.ReactNode
}) {
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [activePalette, setActivePalette] = useState(1)

  const applyPalette = (idx: number) => {
    setActivePalette(idx)
    const vars = PALETTES[idx].vars
    Object.entries(vars).forEach(([k,v]) => document.documentElement.style.setProperty(k, v))
    setPaletteOpen(false)
  }

  const current = ALL.find(t => t.id === activeTab) || ALL[0]
  const pick = (id: TabId) => { onTabChange(id); setNavOpen(false) }

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', position:'relative', background:'transparent' }}>
      <WalkBackground />

      <header style={{
        padding:'0 22px', display:'flex', alignItems:'center',
        justifyContent:'space-between', height:60,
        position:'sticky', top:0, zIndex:50,
        background:'linear-gradient(180deg, rgba(12,16,30,0.86), rgba(8,11,22,0.72))',
        backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)',
        borderBottom:'1px solid rgba(255,255,255,0.08)', flexShrink:0,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:0 }}>
          <img src="/images/leanspend-logo.png" alt="LeanSpend" style={{ height:40, width:'auto', display:'block' }} />
        </div>

        <div style={{ position:'relative', flex:1, display:'flex', justifyContent:'center' }}>
          <button onClick={() => setNavOpen(o=>!o)} style={{
            display:'flex', alignItems:'center', gap:10, cursor:'pointer',
            height:40, padding:'0 13px 0 15px', minWidth:200,
            borderRadius:13, fontFamily:'Nunito,sans-serif',
            border: navOpen ? '1px solid var(--s)' : '1px solid rgba(255,255,255,0.12)',
            background: navOpen ? 'rgba(78,205,196,0.14)' : 'rgba(255,255,255,0.05)',
            boxShadow: navOpen ? '0 0 18px rgba(78,205,196,0.25)' : 'none',
            transition:'all 0.18s',
          }}>
            <span style={{ fontSize:16 }}>{current.icon}</span>
            <span style={{ flex:1, textAlign:'left', lineHeight:1.1 }}>
              <span style={{ display:'block', fontSize:14, fontWeight:900, color:'#fff' }}>{current.label}</span>
              <span style={{ display:'block', fontSize:9.5, fontWeight:800, color:'rgba(255,255,255,0.45)', textTransform:'uppercase', letterSpacing:'0.6px', marginTop:-1 }}>{current.group}</span>
            </span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.55)', transform: navOpen ? 'rotate(180deg)' : 'none', transition:'transform 0.2s' }}>▼</span>
          </button>

          {navOpen && (
            <>
              <div onClick={() => setNavOpen(false)} style={{ position:'fixed', inset:0, zIndex:90 }} />
              <div style={{
                position:'absolute', top:50, left:'50%', transform:'translateX(-50%)',
                width:320, padding:8, zIndex:100, fontFamily:'Nunito,sans-serif',
                background:'linear-gradient(160deg, rgba(18,22,40,0.98), rgba(10,13,26,0.99))',
                border:'1px solid rgba(255,255,255,0.14)', borderRadius:18,
                boxShadow:'0 28px 70px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)',
              }}>
                {NAV.map(group => (
                  <div key={group.group}>
                    <div style={{ fontSize:9.5, fontWeight:900, color:'rgba(255,255,255,0.34)', textTransform:'uppercase', letterSpacing:'1px', padding:'10px 12px 5px' }}>{group.group}</div>
                    {group.items.map(t => {
                      const on = t.id === activeTab
                      return (
                        <button key={t.id} onClick={() => pick(t.id)} style={{
                          display:'flex', alignItems:'center', gap:12, width:'100%',
                          padding:'9px 12px', borderRadius:11, cursor:'pointer', position:'relative',
                          border:'none', textAlign:'left', fontFamily:'Nunito,sans-serif',
                          background: on ? 'rgba(78,205,196,0.13)' : 'transparent',
                          transition:'background 0.14s',
                        }}
                        onMouseEnter={e => { if(!on) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)' }}
                        onMouseLeave={e => { if(!on) (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                          {on && <span style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', width:3, height:20, borderRadius:3, background:'var(--s)', boxShadow:'0 0 10px var(--s)' }} />}
                          <span style={{ fontSize:16, width:22, textAlign:'center' }}>{t.icon}</span>
                          <span style={{ fontSize:13.5, fontWeight:800, color: on ? 'var(--s)' : 'rgba(255,255,255,0.85)' }}>{t.label}</span>
                        </button>
                      )
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div style={{ display:'flex', gap:8, alignItems:'center', position:'relative' }}>
          <button onClick={() => setPaletteOpen(o=>!o)} style={{
            width:34, height:34, borderRadius:'50%', cursor:'pointer', border:'none',
            background:'conic-gradient(#ff6b6b, #FFE66D, #6BCB77, #4ECDC4, #60a5fa, #A78BFA, #ff6b6b)',
            boxShadow: paletteOpen ? '0 0 18px rgba(255,255,255,0.3)' : '0 0 8px rgba(255,255,255,0.1)',
          }} title="Change theme" />

          {paletteOpen && (
            <div style={{
              position:'absolute', top:44, right:0, zIndex:200,
              background:'rgba(8,14,26,0.96)', backdropFilter:'blur(24px)',
              border:'1px solid rgba(255,255,255,0.12)', borderRadius:16,
              padding:16, minWidth:220,
              boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
            }}>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.4)',
                letterSpacing:'0.6px',textTransform:'uppercase',marginBottom:12}}>Color Theme</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                {PALETTES.map((p,i) => (
                  <button key={p.name} onClick={()=>applyPalette(i)} style={{
                    padding:'8px 12px', borderRadius:10, cursor:'pointer',
                    border:'1px solid '+(activePalette===i?'rgba(255,255,255,0.35)':'rgba(255,255,255,0.1)'),
                    background:activePalette===i?'rgba(255,255,255,0.1)':'rgba(255,255,255,0.04)',
                    display:'flex', alignItems:'center', gap:8, fontFamily:'Nunito,sans-serif',
                  }}>
                    <div style={{display:'flex',gap:3}}>
                      {Object.values(p.vars).slice(0,3).map((c,ci) => (
                        <div key={ci} style={{width:11,height:11,borderRadius:'50%',background:c}}/>
                      ))}
                    </div>
                    <span style={{fontSize:11,fontWeight:800,color:'rgba(255,255,255,0.75)'}}>{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {['\u2630','\u21A5'].map((ic,i) => (
            <button key={i} style={{
              width:32, height:32, borderRadius:'50%',
              background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.1)',
              color:'rgba(255,255,255,0.5)', fontSize:13, cursor:'pointer',
              display:'flex', alignItems:'center', justifyContent:'center',
            }}>{ic}</button>
          ))}
          <AuthButton />
        </div>
      </header>

      <main style={{
        flex:1, maxWidth:1400, width:'100%', margin:'0 auto',
        boxSizing:'border-box', position:'relative', zIndex:10,
      }} className="animate-tab-in">
        {children}
      </main>

      <footer style={{textAlign:'center',padding:'14px 0',fontSize:12,
        color:'rgba(255,255,255,0.15)',fontWeight:700,position:'relative',zIndex:10}}>
        LeanSpend  Eat lean. Spend less. Live fit.
      </footer>
    </div>
  )
}
