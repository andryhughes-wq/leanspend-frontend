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
  { slug:'randalls',   label:'🏬 Randalls' },
  { slug:'safeway',    label:'🛍️ Safeway' },
  { slug:'costco',     label:'🏭 Costco' },
  { slug:'samsclub',   label:'🏬 Sam's Club' },
]
const GOALS = [
  { id:'balanced',    label:'⚖️ Balanced',   desc:'Balanced macros ~2,000 cal/day — 30% protein, 45% carbs, 25% fat' },
  { id:'muscle-gain', label:'💪 Muscle Gain', desc:'High protein 140g+/day — chicken, eggs, Greek yogurt, cottage cheese' },
  { id:'weight-loss', label:'🔥 Weight Loss', desc:'Low calorie 1,400/day — high fiber, lean protein, lots of vegetables' },
  { id:'endurance',   label:'🏃 Endurance',   desc:'High carb 55–60% — oats, sweet potato, brown rice, bananas' },
  { id:'plant-based', label:'🌱 Plant-Based', desc:'Plant proteins only — beans, lentils, tofu, tempeh, no meat or dairy' },
]

const card: React.CSSProperties = {
  background:'var(--card)', border:'2px solid var(--border)',
  borderRadius:18, padding:18, marginBottom:16,
}
const secTitle: React.CSSProperties = {
  fontSize:15, fontWeight:900, color:'var(--text)', marginBottom:12,
}
const chipBase: React.CSSProperties = {
  padding:'5px 13px', borderRadius:20, fontSize:11, fontWeight:800,
  border:'2px solid var(--border)', cursor:'pointer', fontFamily:'Nunito,sans-serif',
  transition:'all 0.15s',
}

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
      toast.success(`Budget set! $${d.recommendedFoodBudget}/mo 💪`)
    },
    onError: (e:Error) => toast.error(e.message),
  })

  const budget  = data?.recommendedFoodBudget || profile.foodBudget || 0
  const withD   = Math.round(budget * 0.74)
  const savings = budget - withD

  const toggle = (list:'allergies'|'dyeFilters', key:string) => {
    const cur = profile[list]
    setProfile({ [list]: cur.includes(key) ? cur.filter(a=>a!==key) : [...cur, key] })
  }
  const toggleStore = (slug:string) => {
    const cur = profile.preferredStores
    setProfile({ preferredStores: cur.includes(slug) ? cur.filter(s=>s!==slug) : [...cur, slug] })
  }

  const goalInfo = GOALS.find(g => g.id === (profile.fitnessGoal || 'balanced'))

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, alignItems:'start' }}>

      {/* LEFT COLUMN */}
      <div>
        {/* Individual / Family */}
        <div style={card}>
          <div style={secTitle}>👤 Who are you budgeting for?</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14 }}>
            {[
              { id:'individual', label:'👤 Just Me',   sub:'Individual plan' },
              { id:'family',     label:'👨‍👩‍👧 Family',    sub:'2–10 people' },
            ].map(m => (
              <button key={m.id} onClick={() => {
                setMode(m.id as any)
                if (m.id==='individual') setProfile({ householdSize:1 })
                else if (profile.householdSize < 2) setProfile({ householdSize:2 })
              }} style={{
                padding:'12px 8px', borderRadius:14, cursor:'pointer',
                border:`2px solid ${mode===m.id?'var(--p)':'var(--border)'}`,
                background: mode===m.id?'var(--p-light)':'var(--bg)',
                fontFamily:'Nunito,sans-serif', textAlign:'center',
              }}>
                <div style={{ fontSize:20, marginBottom:4 }}>{m.label.split(' ')[0]}</div>
                <div style={{ fontSize:13, fontWeight:900, color:mode===m.id?'var(--p-dark)':'var(--text)' }}>
                  {m.label.split(' ').slice(1).join(' ')}
                </div>
                <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700 }}>{m.sub}</div>
              </button>
            ))}
          </div>
          {mode === 'family' && (
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>
                Number of people
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(9,1fr)', gap:5 }}>
                {[2,3,4,5,6,7,8,9,10].map(n => (
                  <button key={n} onClick={() => setProfile({ householdSize:n })}
                    style={{ padding:'8px 4px', borderRadius:11, fontSize:14, fontWeight:900,
                      border:`2px solid ${profile.householdSize===n?'var(--p)':'var(--border)'}`,
                      background: profile.householdSize===n?'var(--p-light)':'var(--bg)',
                      color: profile.householdSize===n?'var(--p-dark)':'var(--muted)',
                      cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ position:'relative', flex:1 }}>
              <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', fontSize:17, fontWeight:900, color:'var(--faint)' }}>$</span>
              <input type="number" value={income} onChange={e=>setIncome(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&income&&calculate()}
                placeholder="Monthly household income"
                style={{ width:'100%', padding:'12px 12px 12px 28px', border:'2px solid var(--border)', borderRadius:14, fontSize:17, fontWeight:800, background:'var(--card)', color:'var(--text)', outline:'none', fontFamily:'Nunito,sans-serif' }} />
            </div>
            <button onClick={()=>income&&calculate()} disabled={isPending||!income}
              style={{ background:'var(--p)', color:'#fff', border:'none', borderRadius:13, padding:'12px 20px', fontSize:13, fontWeight:800, cursor:'pointer', whiteSpace:'nowrap', fontFamily:'Nunito,sans-serif', opacity:isPending||!income?0.5:1 }}>
              {isPending ? '⏳...' : 'Plan It! 🚀'}
            </button>
          </div>
        </div>

        {/* Hero */}
        <div style={{ background:'var(--p)', borderRadius:20, padding:'22px 26px', color:'#fff', position:'relative', overflow:'hidden', marginBottom:16 }}>
          <div style={{ position:'absolute', right:-20, top:-20, width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.1)' }} />
          <div style={{ fontSize:12, fontWeight:700, opacity:0.8 }}>
            Monthly food budget {profile.householdSize > 1 ? `(family of ${profile.householdSize})` : '(individual)'}
          </div>
          <div style={{ fontSize:52, fontWeight:900, lineHeight:1, margin:'4px 0' }}>${budget||'—'}</div>
          <div style={{ fontSize:12, opacity:0.75, fontWeight:700 }}>
            {data ? `${data.foodBudgetPercent}% of $${Number(income).toLocaleString()} income` : 'Enter your income above'}
          </div>
          {profile.householdSize > 1 && budget > 0 && (
            <div style={{ marginTop:8, fontSize:12, opacity:0.85, fontWeight:700, background:'rgba(255,255,255,0.15)', borderRadius:20, padding:'3px 14px', display:'inline-block' }}>
              ${(budget/profile.householdSize).toFixed(0)}/person/month
            </div>
          )}
        </div>

        {/* Savings banner */}
        {budget > 0 && (
          <div style={{ background:'var(--s)', borderRadius:14, padding:'13px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
            <span style={{ fontSize:26 }}>🏷️</span>
            <div style={{ fontSize:13, fontWeight:700 }}>
              Potential deal savings: <strong>${savings}</strong> with tracked store deals!
              {profile.householdSize > 1 && <span> · ${(savings/profile.householdSize).toFixed(0)}/person</span>}
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:16 }}>
          {[
            { ico:'🛒', label:'Without deals', val:`$${budget||'—'}`,   sub:'Full price' },
            { ico:'💚', label:'With deals',    val:`$${withD||'—'}`,    sub:'Active stores', hi:true },
            { ico:'🍎', label:'Per day',       val:budget?`$${(withD/30).toFixed(2)}`:'—', sub:'3 meals' },
            { ico:'📅', label:'Per week',      val:budget?`$${Math.round(budget/4)}`:'—', sub:'Weekly budget' },
          ].map(c => (
            <div key={c.label} style={{ ...card, marginBottom:0, borderColor:c.hi?'var(--s)':'var(--border)' }}>
              <div style={{ fontSize:28, marginBottom:8 }}>{c.ico}</div>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px' }}>{c.label}</div>
              <div style={{ fontSize:24, fontWeight:900, color:c.hi?'var(--s-dark)':'var(--text)', marginTop:2 }}>{c.val}</div>
              <div style={{ fontSize:11, color:'var(--faint)', marginTop:2 }}>{c.sub}</div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {budget > 0 && (
          <div style={card}>
            {[
              { label:'Budget allocated', pct:Math.round((withD/budget)*100), color:'var(--p)' },
              { label:'Deal savings captured', pct:72, color:'var(--acc-dark)' },
            ].map(b => (
              <div key={b.label} style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, fontWeight:800, marginBottom:5 }}>
                  <span>{b.label}</span><span style={{ color:'var(--muted)' }}>{b.pct}%</span>
                </div>
                <div style={{ height:10, background:'var(--border)', borderRadius:20, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${b.pct}%`, background:b.color, borderRadius:20, transition:'width 0.7s cubic-bezier(0.34,1.56,0.64,1)' }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN */}
      <div>
        {/* Fitness Goal */}
        <div style={card}>
          <div style={secTitle}>🎯 Fitness Goal</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:10 }}>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setProfile({ fitnessGoal:g.id })}
                style={{ ...chipBase,
                  border:`2px solid ${profile.fitnessGoal===g.id?'var(--p)':'var(--border)'}`,
                  background: profile.fitnessGoal===g.id?'var(--p-light)':'var(--bg)',
                  color: profile.fitnessGoal===g.id?'var(--p-dark)':'var(--muted)',
                }}>
                {g.label}
              </button>
            ))}
          </div>
          <div style={{ padding:'10px 13px', background:'var(--p-light)', borderRadius:11, fontSize:12, fontWeight:700, color:'var(--p-dark)' }}>
            💡 {goalInfo?.desc || 'Select a fitness goal above'}
          </div>
        </div>

        {/* Allergies */}
        <div style={card}>
          <div style={secTitle}>🚨 Allergy & Dye Filters</div>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Allergens</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:12 }}>
            {ALLERGENS.map(a => {
              const key = a.toLowerCase()
              const on  = profile.allergies.includes(key)
              return <button key={a} onClick={() => toggle('allergies', key)}
                style={{ ...chipBase, background:on?'var(--p-light)':'var(--bg)', borderColor:on?'var(--p)':'var(--border)', color:on?'var(--p-dark)':'var(--muted)' }}>
                {a}
              </button>
            })}
          </div>
          <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', letterSpacing:'0.4px', marginBottom:8 }}>Synthetic Dyes</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {DYES.map(d => {
              const key = d.toLowerCase().replace(/\s/g,'_').replace(/#/g,'')
              const on  = profile.dyeFilters.includes(key)
              return <button key={d} onClick={() => toggle('dyeFilters', key)}
                style={{ ...chipBase, background:on?'var(--p-light)':'var(--bg)', borderColor:on?'var(--p)':'var(--border)', color:on?'var(--p-dark)':'var(--muted)' }}>
                {d}
              </button>
            })}
          </div>
        </div>

        {/* Stores */}
        <div style={card}>
          <div style={secTitle}>🏪 Store Deal Tracking</div>
          <div style={{ fontSize:12, color:'var(--muted)', fontWeight:700, marginBottom:10 }}>Live weekly ads scraped from each store's website</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
            {STORES.map(s => {
              const on = profile.preferredStores.includes(s.slug)
              return <button key={s.slug} onClick={() => toggleStore(s.slug)}
                style={{ ...chipBase, background:on?'var(--s-light)':'var(--bg)', borderColor:on?'var(--s)':'var(--border)', color:on?'var(--s-dark)':'var(--muted)' }}>
                {s.label}
              </button>
            })}
          </div>
        </div>

        <ChatWidget context="budget" />
      </div>
    </div>
  )
}
