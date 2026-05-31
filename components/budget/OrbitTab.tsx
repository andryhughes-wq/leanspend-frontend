'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'

const PLANET_COLORS = ['#ff6b6b','#f97316','#FFE66D','#6BCB77','#4ECDC4','#60a5fa','#a78bfa','#f472b6']

export function OrbitTab() {
  const { profile } = useAppStore()
  const [hover, setHover] = useState<number | null>(null)

  const expenses = (profile.expenses || []).filter(e => e.amount > 0)
  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0)
  const income = profile.monthlyIncome || 0
  const disposable = income - totalExpenses
  const ratio = income > 0 ? totalExpenses / income : 0

  // Sun color shifts green -> amber -> red as expenses eat into income
  const sunColor = ratio < 0.6 ? '#6BCB77' : ratio < 0.85 ? '#FFE66D' : '#ff6b6b'
  const sunGlow  = ratio < 0.6 ? 'rgba(107,203,119,0.6)' : ratio < 0.85 ? 'rgba(255,230,109,0.6)' : 'rgba(255,107,107,0.6)'

  const maxAmt = Math.max(1, ...expenses.map(e => e.amount))
  const SIZE = 560
  const CX = SIZE / 2
  const CY = SIZE / 2

  return (
    <div style={{ padding:'0 0 40px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16, flexWrap:'wrap', gap:12 }}>
        <div>
          <div style={{ fontSize:22, fontWeight:800, color:'white', fontFamily:'Nunito,sans-serif' }}>Orbit</div>
          <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>Your money as a living system</div>
        </div>
        <div style={{ display:'flex', gap:20 }}>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Income</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#4ECDC4' }}>${income.toFixed(0)}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Expenses</div>
            <div style={{ fontSize:18, fontWeight:800, color:'#ff6b6b' }}>${totalExpenses.toFixed(0)}</div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>Disposable</div>
            <div style={{ fontSize:18, fontWeight:800, color:disposable>=0?'#6BCB77':'#ff6b6b' }}>${disposable.toFixed(0)}</div>
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div style={{
          background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:16, padding:'4rem', textAlign:'center', color:'rgba(255,255,255,0.45)', fontSize:14
        }}>
          Add some expenses on the Budget tab to see your system come to life.
        </div>
      ) : (
        <div style={{ display:'flex', gap:20, flexWrap:'wrap', alignItems:'flex-start' }}>
          {/* Orbit system */}
          <div style={{ flex:'1 1 560px', minWidth:320, display:'flex', justifyContent:'center' }}>
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ width:'100%', maxWidth:SIZE }}>
              {/* habitable zone ring - shrinks as ratio grows */}
              <circle cx={CX} cy={CY} r={Math.max(60, 200*(1-ratio))} fill="none"
                stroke={sunGlow} strokeWidth="1.5" strokeDasharray="4 6" opacity="0.5" />

              {/* orbital rings + planets */}
              {expenses.map((e, i) => {
                const orbitR = 90 + (i * (200 / Math.max(1, expenses.length)))
                const angle = (i / expenses.length) * Math.PI * 2 - Math.PI / 2
                const px = CX + orbitR * Math.cos(angle)
                const py = CY + orbitR * Math.sin(angle)
                const pr = 8 + 26 * Math.sqrt(e.amount / maxAmt)
                const col = PLANET_COLORS[i % PLANET_COLORS.length]
                const isHover = hover === i
                return (
                  <g key={e.id || i}>
                    <circle cx={CX} cy={CY} r={orbitR} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                    <g style={{ transformOrigin:`${CX}px ${CY}px`, animation:`orbit-spin ${24 + i*6}s linear infinite` }}>
                      <circle
                        cx={px} cy={py} r={pr}
                        fill={col}
                        opacity={isHover ? 1 : 0.85}
                        style={{ filter:`drop-shadow(0 0 ${isHover?14:8}px ${col})`, cursor:'pointer', transition:'opacity 0.2s' }}
                        onMouseEnter={() => setHover(i)}
                        onMouseLeave={() => setHover(null)}
                      />
                    </g>
                  </g>
                )
              })}

              {/* the sun = disposable income */}
              <circle cx={CX} cy={CY} r="58" fill={sunColor}
                style={{ filter:`drop-shadow(0 0 30px ${sunGlow})` }} opacity="0.9" />
              <circle cx={CX} cy={CY} r="58" fill="url(#sunGrad)" />
              <defs>
                <radialGradient id="sunGrad" cx="38%" cy="32%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.7)" />
                  <stop offset="60%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <text x={CX} y={CY-6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,0.7)" fontWeight="700">DISPOSABLE</text>
              <text x={CX} y={CY+18} textAnchor="middle" fontSize="22" fill="white" fontWeight="900">${disposable.toFixed(0)}</text>
            </svg>
          </div>

          {/* Legend / breakdown */}
          <div style={{ flex:'1 1 240px', minWidth:240, display:'flex', flexDirection:'column', gap:8 }}>
            {expenses.map((e, i) => {
              const col = PLANET_COLORS[i % PLANET_COLORS.length]
              const pct = totalExpenses > 0 ? Math.round((e.amount / totalExpenses) * 100) : 0
              return (
                <div key={e.id || i}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:12,
                    background: hover===i ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                    border:`1px solid ${hover===i ? col+'88' : 'rgba(255,255,255,0.08)'}`,
                    transition:'all 0.2s', cursor:'default'
                  }}>
                  <div style={{ width:12, height:12, borderRadius:'50%', background:col, flexShrink:0, boxShadow:`0 0 8px ${col}` }} />
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{e.label || e.category}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{pct}% of expenses</div>
                  </div>
                  <div style={{ fontSize:15, fontWeight:800, color:col }}>${e.amount.toFixed(0)}</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes orbit-spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
