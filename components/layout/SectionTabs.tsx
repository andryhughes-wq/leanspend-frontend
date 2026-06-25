'use client'
import { useState } from 'react'

export function SectionTabs({ views }: { views: { label: string; node: React.ReactNode }[] }) {
  const [i, setI] = useState(0)
  return (
    <div>
      <div style={{ display:'flex', gap:8, padding:'18px 16px 0', flexWrap:'wrap', position:'relative', zIndex:5 }}>
        {views.map((v, idx) => {
          const on = idx === i
          return (
            <button key={v.label} onClick={() => setI(idx)} style={{
              padding:'7px 16px', borderRadius:12, fontSize:12.5, fontWeight:800, cursor:'pointer',
              fontFamily:'Nunito,sans-serif',
              border: on ? '1px solid var(--s)' : '1px solid rgba(255,255,255,0.12)',
              background: on ? 'rgba(78,205,196,0.16)' : 'rgba(255,255,255,0.04)',
              color: on ? 'var(--s)' : 'rgba(255,255,255,0.6)',
              boxShadow: on ? '0 0 14px rgba(78,205,196,0.22)' : 'none',
              transition:'all 0.15s',
            }}>{v.label}</button>
          )
        })}
      </div>
      <div>{views[i].node}</div>
    </div>
  )
}
