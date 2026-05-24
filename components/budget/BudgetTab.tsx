'use client'
import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { budgetApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { ChatWidget } from '@/components/chat/ChatWidget'

const ALLERGENS = ['Gluten','Dairy','Eggs','Peanuts','Soy','Shellfish','Fish','Wheat']
const DYES      = ['Red #40','Yellow #5','Yellow #6','Blue #1','Red #3']
const STORES    = [
  { slug:'kroger',     label:'🏪 Kroger' },
  { slug:'walmart',    label:'🟡 Walmart' },
  { slug:'heb',        label:'🌮 HEB' },
  { slug:'target',     label:'🎯 Target' },
  { slug:'aldi',       label:'🛒 Aldi' },
  { slug:'wholefoods', label:'🌿 Whole Foods' },
  { slug:'sprouts',    label:'🌱 Sprouts' },
]
const GOALS = [
  { id:'balanced',    label:'⚖️ Balanced',    desc:'General health' },
  { id:'muscle-gain', label:'💪 Muscle Gain',  desc:'High protein 140g+' },
  { id:'weight-loss', label:'🔥 Weight Loss',  desc:'Low cal 1,400/day' },
  { id:'endurance',   label:'🏃 Endurance',    desc:'High carb fuel' },
  { id:'plant-based', label:'🌱 Plant-Based',  desc:'No meat or dairy' },
]

export function BudgetTab() {
  const { profile, setProfile } = useAppStore()
  const [income, setIncome]     = useState(profile.monthlyIncome ? String(profile.monthlyIncome) : '')
  const [mode, setMode]         = useState<'individual'|'family'>(profile.householdSize > 1 ? 'family' : 'individual')

  const { mutate: calculate, isPending, data } = useMutation({
    mutationFn: () => budgetApi.calculate({
      monthlyIncome: Number(income),
      householdSize: profile.householdSize,
      fitnessGoal:   profile.fitnessGoal,
    }),
    onSuccess: d => {
      setProfile({ monthlyIncome: Number(income), foodBudget: d.recommendedFoodBudget })
      toast.success(`Budget set! $${d.recommendedFoodBudget}/mo for ${profile.householdSize} person${profile.householdSize>1?'s':''} 💪`)
    },
    onError: (e:Error) => toast.error(e.message),
  })

  const budget  = data?.recommendedFoodBudget || profile.foodBudget || 0
  const withD   = Math.round(budget * 0.74)
  const savings = budget - withD
  const perPerson = profile.householdSize > 1 && budget ? (budget / profile.householdSize).toFixed(0) : null

  const toggle = (list:'allergies'|'dyeFilters', key:string) => {
    const cur = profile[list]
    setProfile({ [list]: cur.includes(key) ? cur.filter(a=>a!==key) : [...cur, key] })
  }
  const toggleStore = (slug:string) => {
    const cur = profile.preferredStores
    setProfile({ preferredStores: cur.includes(slug) ? cur.filter(s=>s!==slug) : [...cur, slug] })
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* Individual / Family Toggle */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ fontSize:13, fontWeight:900, marginBottom:10, color:'var(--text)' }}>👤 Who are you budgeting for?</div>
        <div style={{ display:'flex', gap:8, marginBottom:12 }}>
          {[
            { id:'individual', label:'👤 Just Me',    sub:'Individual plan' },
            { id:'family',     label:'👨‍👩‍👧 Family',      sub:'2–10 people' },
          ].map(m=>(
            <button key={m.id} onClick={()=>{
              setMode(m.id as any)
              if (m.id==='individual') setProfile({ householdSize:1 })
              else if (profile.householdSize < 2) setProfile({ householdSize:2 })
            }}
              style={{
                flex:1, padding:'10px 8px', borderRadius:14, cursor:'pointer',
                border:`2px solid ${mode===m.id?'var(--p)':'var(--border)'}`,
                background: mode===m.id?'var(--p-light)':'var(--bg)',
                fontFamily:'Nunito,sans-serif',
              }}>
              <div style={{ fontSize:18, marginBottom:3 }}>{m.label.split(' ')[0]}</div>
              <div style={{ fontSize:12, fontWeight:900, color:mode===m.id?'var(--p-dark)':'var(--text)' }}>
                {m.label.split(' ').slice(1).join(' ')}
              </div>
              <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>{m.sub}</div>
            </button>
          ))}
        </div>

        {/* Household size picker */}
        {mode === 'family' && (
          <div>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>
              Number of people
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:6 }}>
              {[2,3,4,5,6,7,8,9,10].map(n=>(
                <button key={n} onClick={()=>setProfile({ householdSize:n })}
                  style={{
                    padding:'8px 4px', borderRadius:12, fontSize:14, fontWeight:900,
                    border:`2px solid ${profile.householdSize===n?'var(--p)':'var(--border)'}`,
                    background: profile.householdSize===n?'var(--p-light)':'var(--bg)',
                    color: profile.householdSize===n?'var(--p-dark)':'var(--muted)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>
                  {n}
                </button>
              ))}
            </div>
            {profile.householdSize > 1 && (
              <div style={{ marginTop:8, fontSize:11, color:'var(--p-dark)', fontWeight:700 }}>
                👨‍👩‍👧 Planning for a family of {profile.householdSize}
                {data?.householdTip && <span> · {data.householdTip}</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Income Input */}
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ position:'relative', flex:1 }}>
          <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:17, fontWeight:900, color:'var(--faint)' }}>$</span>
          <input type="number" value={income}
            onChange={e=>setIncome(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&income&&calculate()}
            placeholder="Monthly household income"
            style={{ width:'100%', padding:'12px 12px 12px 28px', border:'2px solid var(--border)', borderRadius:14, fontSize:17, fontWeight:800, background:'var(--card)', color:'var(--text)', outline:'none', fontFamily:'Nunito,sans-serif' }}
          />
        </div>
        <button className="btn-primary" onClick={()=>income&&calculate()} disabled={isPending||!income} style={{ whiteSpace:'nowrap' }}>
          {isPending ? '⏳' : 'Plan It! 🚀'}
        </button>
      </div>

      {/* Hero Card */}
      <div style={{ background:'var(--p)', borderRadius:22, padding:'20px 22px', color:'#fff', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-20, width:100, height:100, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
        <div style={{ fontSize:12, fontWeight:700, opacity:0.8 }}>
          Monthly food budget {profile.householdSize > 1 ? `(family of ${profile.householdSize})` : '(individual)'}
        </div>
        <div className="font-display" style={{ fontSize:46, lineHeight:1, margin:'4px 0' }}>${budget||'—'}</div>
        <div style={{ fontSize:11, opacity:0.75, fontWeight:700 }}>
          {data ? `${data.foodBudgetPercent}% of $${Number(income).toLocaleString()} income` : 'Enter your income above'}
        </div>
        {perPerson && (
          <div style={{ marginTop:6, fontSize:12, opacity:0.85, fontWeight:700, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'3px 12px', display:'inline-block' }}>
            ${perPerson}/person/month
          </div>
        )}
      </div>

      {/* Deal savings */}
      {budget > 0 && (
        <div style={{ background:'var(--s)', borderRadius:14, padding:'12px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ fontSize:26 }}>🏷️</span>
          <div style={{ fontSize:12, fontWeight:700 }}>
            Potential deal savings: <strong>${savings}</strong> with tracked store deals!
            {profile.householdSize > 1 && <span> · That's ${(savings/profile.householdSize).toFixed(0)}/person</span>}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
        {[
          { ico:'🛒', label:'Without deals',   val:`$${budget||'—'}`,              sub:'Full price' },
          { ico:'💚', label:'With deals',       val:`$${withD||'—'}`,              sub:'Active stores', hi:true },
          { ico:'🍎', label:'Per day',          val:budget?`$${(withD/30).toFixed(2)}`:'—', sub:profile.householdSize>1?`for ${profile.householdSize} people`:'3 meals' },
          { ico:'💳', label:'Weekly budget',    val:budget?`$${(budget/4).toFixed(0)}`:'—', sub:'Per week' },
        ].map(c=>(
          <div key={c.label} className="card" style={{ padding:14, borderColor:c.hi?'var(--s)':'var(--border)' }}>
            <div style={{ fontSize:26, marginBottom:6 }}>{c.ico}</div>
            <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{c.label}</div>
            <div className="font-display" style={{ fontSize:22, color:c.hi?'var(--s-dark)':'var(--text)', marginTop:2 }}>{c.val}</div>
            <div style={{ fontSize:10, color:'var(--faint)', marginTop:1 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Fitness Goal */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ fontSize:14, fontWeight:900, marginBottom:10 }}>🎯 Fitness Goal</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
          {GOALS.map(g=>(
            <button key={g.id} onClick={()=>setProfile({ fitnessGoal:g.id })}
              style={{
                padding:'7px 13px', borderRadius:20, fontSize:11, fontWeight:800,
                border:`2px solid ${profile.fitnessGoal===g.id?'var(--p)':'var(--border)'}`,
                background:profile.fitnessGoal===g.id?'var(--p-light)':'var(--bg)',
                color:profile.fitnessGoal===g.id?'var(--p-dark)':'var(--muted)',
                cursor:'pointer', fontFamily:'Nunito,sans-serif',
              }}>
              {g.label}
            </button>
          ))}
        </div>
        {data?.fitnessNotes && (
          <div style={{ marginTop:10, padding:'8px 12px', background:'var(--p-light)', borderRadius:10, fontSize:11, fontWeight:700, color:'var(--p-dark)' }}>
            💡 {data.fitnessNotes}
          </div>
        )}
      </div>

      {/* Progress bars */}
      {budget > 0 && (
        <div className="card" style={{ padding:14 }}>
          {[
            { label:'Budget allocated', pct:Math.round((withD/budget)*100), color:'var(--p)' },
            { label:'Deal savings captured', pct:72, color:'var(--acc-dark)' },
          ].map(b=>(
            <div key={b.label} style={{ marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:800, marginBottom:4 }}>
                <span>{b.label}</span><span style={{ color:'var(--muted)' }}>{b.pct}%</span>
              </div>
              <div style={{ height:10, background:'var(--border)', borderRadius:20, overflow:'hidden' }}>
                <div style={{ height:'100%', width:`${b.pct}%`, background:b.color, borderRadius:20, transition:'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Allergies */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ fontSize:14, fontWeight:900, marginBottom:10 }}>🚨 Allergy & Dye Filters</div>
        <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', marginBottom:7 }}>Allergens</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
          {ALLERGENS.map(a=>{ const key=a.toLowerCase(); const on=profile.allergies.includes(key); return <button key={a} className={`chip ${on?'active':''}`} onClick={()=>toggle('allergies',key)}>{a}</button> })}
        </div>
        <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', marginBottom:7 }}>Synthetic Dyes</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {DYES.map(d=>{ const key=d.toLowerCase().replace(/\s/g,'_').replace(/#/g,''); const on=profile.dyeFilters.includes(key); return <button key={d} className={`chip ${on?'active':''}`} onClick={()=>toggle('dyeFilters',key)}>{d}</button> })}
        </div>
      </div>

      {/* Stores */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ fontSize:14, fontWeight:900, marginBottom:4 }}>🏪 Store Deal Tracking</div>
        <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginBottom:10 }}>Live weekly ads scraped from each store's website</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
          {STORES.map(s=>{ const on=profile.preferredStores.includes(s.slug); return <button key={s.slug} className={`chip ${on?'s-active':''}`} onClick={()=>toggleStore(s.slug)}>{s.label}</button> })}
        </div>
      </div>

      <ChatWidget context="budget" />
    </div>
  )
}
