'use client'
import { ChatWidget } from '@/components/chat/ChatWidget'

const TIPS = [
  { ico:'', title:'Read weekly ads first',    text:'Most stores reset deals Wednesday. Plan meals around sales, not habits.',     border:'var(--acc-dark)' },
  { ico:'', title:'Buy protein on BOGO',       text:'Freeze the second portion. Chicken goes BOGO on predictable 12-day cycles.', border:'var(--s)' },
  { ico:'', title:'Stack digital coupons',     text:'Kroger Plus, HEB app, and Walmart+ stack coupons on top of sale prices.',    border:'var(--pu)' },
  { ico:'', title:'Bulk buy staples',          text:'Rice, beans, oats, pasta. Bulk cuts cost per serving by up to 60%.',         border:'var(--p)' },
  { ico:'', title:'Frozen = same nutrition',   text:'Flash-frozen at peak freshness. 40-60% cheaper than fresh produce.',         border:'var(--p)' },
  { ico:'', title:'Meal prep Sundays',         text:'Batch cooking reduces food waste 35% and prevents costly weekday takeout.',   border:'var(--s)' },
  { ico:'', title:'Protein first, then carbs', text:'Fill half your plate with protein and veg. Add carbs to fuel workouts.',     border:'var(--acc-dark)' },
  { ico:'', title:'Plant protein saves money', text:'Replacing 2 meat meals/week with beans or lentils saves $40-60/month.',     border:'var(--pu)' },
]

export function TipsTab() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
      <div className="font-display" style={{ fontSize:22 }}> Smart Budget Tips</div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
        {TIPS.map(t=>(
          <div key={t.title} className="card" style={{ padding:14, borderColor:t.border, transition:'transform 0.15s' }}
            onMouseEnter={e=>(e.currentTarget.style.transform='translateY(-2px)')}
            onMouseLeave={e=>(e.currentTarget.style.transform='translateY(0)')}>
            <div style={{ fontSize:26, marginBottom:6 }}>{t.ico}</div>
            <div style={{ fontSize:12, fontWeight:900, marginBottom:3, color:'var(--text)' }}>{t.title}</div>
            <div style={{ fontSize:10, color:'var(--muted)', lineHeight:1.55, fontWeight:700 }}>{t.text}</div>
          </div>
        ))}
      </div>

      <div style={{ background:'var(--pu)', borderRadius:20, padding:'16px 18px', color:'#fff' }}>
        <div style={{ fontSize:15, fontWeight:900, marginBottom:6 }}> Inflation Tracker</div>
        <div style={{ display:'flex', gap:7, flexWrap:'wrap' }}>
          {['Eggs +12% YoY','Chicken -4% YoY','Oats stable','Beef +8% YoY'].map(t=>(
            <span key={t} style={{ background:'rgba(255,255,255,.2)', borderRadius:20, padding:'3px 9px', fontSize:10, fontWeight:800 }}>{t}</span>
          ))}
        </div>
      </div>

      <ChatWidget context="tips" />
    </div>
  )
}
