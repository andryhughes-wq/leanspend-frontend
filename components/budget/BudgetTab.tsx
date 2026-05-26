'use client'
import { useState, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { budgetApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { ChatWidget } from '@/components/chat/ChatWidget'

const ALLERGENS = ['Gluten','Dairy','Eggs','Peanuts','Soy','Shellfish','Fish','Wheat']
const DYES      = ['Red #40','Yellow #5','Yellow #6','Blue #1','Red #3']
const STORES = [
  { slug:'kroger',     label:'Kroger' },
  { slug:'walmart',    label:'Walmart' },
  { slug:'heb',        label:'HEB' },
  { slug:'target',     label:'Target' },
  { slug:'aldi',       label:'Aldi' },
  { slug:'wholefoods', label:'Whole Foods' },
  { slug:'sprouts',    label:'Sprouts' },
  { slug:'randalls',   label:'Randalls' },
  { slug:'safeway',    label:'Safeway' },
  { slug:'costco',     label:'Costco' },
  { slug:'samsclub',   label:'Sams Club' },
]
const GOALS = [
  { id:'balanced',    label:'Balanced',    desc:'Balanced macros ~2,000 cal/day 30% protein, 45% carbs, 25% fat' },
  { id:'muscle-gain', label:'Muscle Gain', desc:'High protein 140g+/day chicken, eggs, Greek yogurt, cottage cheese' },
  { id:'weight-loss', label:'Weight Loss', desc:'Low calorie 1,400/day high fiber, lean protein, lots of vegetables' },
  { id:'endurance',   label:'Endurance',   desc:'High carb 55-60% oats, sweet potato, brown rice, bananas' },
  { id:'plant-based', label:'Plant-Based', desc:'Plant proteins only beans, lentils, tofu, tempeh, no meat or dairy' },
]

function FloatBubble({ size, left, top, delay, onPop }: { size:number, left:string, top:string, delay:number, onPop:(x:number,y:number)=>void }) {
  const [alive, setAlive] = useState(true)
  const ref = useRef<HTMLDivElement>(null)
  if (!alive) return null
  return (
    <div ref={ref} onClick={e => { setAlive(false); onPop(e.clientX, e.clientY) }}
      style={{
        position:'fixed', left, top,
        width:size, height:size, borderRadius:'50%',
        background:'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.75) 0%, rgba(160,230,255,0.35) 35%, rgba(167,139,250,0.2) 65%, rgba(78,205,196,0.1) 100%)',
        border:'1px solid rgba(255,255,255,0.45)',
        boxShadow:'0 0 '+Math.round(size*0.4)+'px rgba(126,207,255,0.25), inset 0 0 '+Math.round(size*0.3)+'px rgba(255,255,255,0.15)',
        cursor:'pointer', zIndex:3,
        animation:'floatBubble '+(3.5+delay)+'s ease-in-out '+delay+'s infinite',
        transition:'transform 0.1s',
        pointerEvents:'all',
      }} />
  )
}

export function BudgetTab() {
  const { profile, setProfile } = useAppStore()
  const [income, setIncome] = useState(profile.monthlyIncome ? String(profile.monthlyIncome) : '')
  const [mode, setMode]     = useState<'individual'|'family'>(profile.householdSize > 1 ? 'family' : 'individual')
  const [showSettings, setShowSettings] = useState(false)
  const [pops, setPops] = useState<{id:number,x:number,y:number,text:string}[]>([])
  const popId = useRef(0)

  const { mutate: calculate, isPending, data } = useMutation({
    mutationFn: () => budgetApi.calculate({
      monthlyIncome: Number(income),
      householdSize: profile.householdSize,
      fitnessGoal:   profile.fitnessGoal,
    }),
    onSuccess: d => {
      setProfile({ monthlyIncome: Number(income), foodBudget: d.recommendedFoodBudget })
      toast.success('Budget set! $'+d.recommendedFoodBudget+'/mo')
    },
    onError: (e:Error) => toast.error(e.message),
  })

  const budget  = data?.recommendedFoodBudget || profile.foodBudget || 0
  const withD   = Math.round(budget * 0.74)
  const savings = budget - withD
  const perDay  = budget ? Number((withD/30).toFixed(2)) : 0
  const perWeek = budget ? Math.round(budget/4) : 0

  const toggle = (list:'allergies'|'dyeFilters', key:string) => {
    const cur = profile[list]
    setProfile({ [list]: cur.includes(key) ? cur.filter((a:string)=>a!==key) : [...cur, key] })
  }
  const toggleStore = (slug:string) => {
    const cur = profile.preferredStores
    setProfile({ preferredStores: cur.includes(slug) ? cur.filter((s:string)=>s!==slug) : [...cur, slug] })
  }
  const goalInfo = GOALS.find(g => g.id === (profile.fitnessGoal || 'balanced'))

  const addPop = (x:number, y:number, text:string) => {
    const id = ++popId.current
    setPops(p => [...p, { id, x, y, text }])
    setTimeout(() => setPops(p => p.filter(t => t.id !== id)), 900)
  }

  const bubbles = [
    { size:44, left:'6%',  top:'22%', delay:0 },
    { size:26, left:'88%', top:'18%', delay:1.4 },
    { size:34, left:'4%',  top:'55%', delay:0.7 },
    { size:20, left:'91%', top:'60%', delay:2.3 },
    { size:30, left:'12%', top:'72%', delay:1.9 },
    { size:18, left:'80%', top:'78%', delay:0.3 },
    { size:15, left:'48%', top:'88%', delay:3.1 },
    { size:38, left:'93%', top:'40%', delay:1.6 },
    { size:22, left:'2%',  top:'38%', delay:2.7 },
    { size:16, left:'70%', top:'12%', delay:1.1 },
  ]
  const popLabels = ['Pop!','Save!','Deal!','Yes!','$$$','Nice!','Boom!','Free!','Win!','Low!']

  const glassCard: React.CSSProperties = {
    background:'rgba(255,255,255,0.06)',
    backdropFilter:'blur(24px)',
    WebkitBackdropFilter:'blur(24px)',
    border:'1px solid rgba(255,255,255,0.13)',
    borderRadius:18,
    padding:'18px 18px',
  }
  const secLabel: React.CSSProperties = {
    fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.5)',
    textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:12,
  }

  return (
    <div style={{ position:'relative', minHeight:'100vh' }}>

      {/* Floating bubbles */}
      {bubbles.map((b,i) => (
        <FloatBubble key={i} {...b} onPop={(x,y) => addPop(x, y, popLabels[i])} />
      ))}

      {/* Pop fx */}
      {pops.map(p => (
        <div key={p.id} style={{
          position:'fixed', left:p.x-20, top:p.y-40,
          color:'#7ecfff', fontWeight:900, fontSize:22, zIndex:999,
          animation:'floatUp 0.9s ease-out forwards', pointerEvents:'none',
          textShadow:'0 0 12px rgba(126,207,255,0.9)',
          fontFamily:'Nunito,sans-serif',
        }}>{p.text}</div>
      ))}

      {/* Content wrapper */}
      <div style={{ position:'relative', zIndex:10, padding:'0 28px 32px' }}>

        {/* Top bar */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 0 22px' }}>
          <div style={{ fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.55)', letterSpacing:'0.3px' }}>Budget Dashboard</div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button onClick={() => setShowSettings(!showSettings)} style={{
              padding:'8px 18px', borderRadius:22, cursor:'pointer',
              background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
              color:'rgba(255,255,255,0.75)', fontSize:12, fontWeight:700, fontFamily:'Nunito,sans-serif',
            }}>1 Pay/Month</button>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.35)', fontSize:15, fontWeight:800, pointerEvents:'none' }}>$</span>
              <input type="number" value={income} onChange={e=>setIncome(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&income&&calculate()}
                placeholder="Monthly income"
                style={{
                  padding:'8px 14px 8px 28px', borderRadius:22, width:170,
                  background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
                  color:'white', fontSize:12, fontWeight:700, outline:'none', fontFamily:'Nunito,sans-serif',
                }} />
            </div>
            <button onClick={()=>income&&calculate()} disabled={isPending||!income} style={{
              padding:'8px 20px', borderRadius:22, cursor:isPending||!income?'not-allowed':'pointer',
              background:isPending||!income?'rgba(107,203,119,0.25)':'var(--p)',
              border:'none', color:'white', fontSize:12, fontWeight:800, fontFamily:'Nunito,sans-serif',
              opacity:isPending||!income?0.5:1,
            }}>{isPending ? '...' : 'Ultra Calc'}</button>
          </div>
        </div>

        {/* ORB HERO */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', height:360, marginBottom:28 }}>

          {/* Orbital rings */}
          <div style={{
            position:'absolute', width:520, height:160, borderRadius:'50%',
            border:'1px solid rgba(0,210,255,0.12)',
            transform:'rotateX(76deg)',
            animation:'orbitSpin 22s linear infinite',
            pointerEvents:'none',
          }} />
          <div style={{
            position:'absolute', width:440, height:130, borderRadius:'50%',
            border:'1px solid rgba(126,207,255,0.08)',
            transform:'rotateX(76deg) rotateZ(55deg)',
            animation:'orbitSpinRev 16s linear infinite',
            pointerEvents:'none',
          }} />
          <div style={{
            position:'absolute', width:600, height:190, borderRadius:'50%',
            border:'1px solid rgba(78,205,196,0.07)',
            transform:'rotateX(76deg) rotateZ(110deg)',
            animation:'orbitSpin 30s linear infinite',
            pointerEvents:'none',
          }} />

          {/* Glow backdrop */}
          <div style={{
            position:'absolute', width:280, height:280, borderRadius:'50%',
            background:'radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 70%)',
            pointerEvents:'none',
            animation:'orbPulse 3s ease-in-out infinite',
          }} />

          {/* Stat floats */}
          <div style={{ position:'absolute', left:'7%', top:'14%', textAlign:'center' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:700, marginBottom:2 }}>Savings</div>
            <div style={{ fontSize:30, fontWeight:900, color:'white', lineHeight:1 }}>{savings || 540}</div>
          </div>
          <div style={{ position:'absolute', right:'7%', top:'14%', textAlign:'center' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:700, marginBottom:2 }}>Over Budget</div>
            <div style={{ fontSize:30, fontWeight:900, color:'white', lineHeight:1 }}>{budget || 950}</div>
          </div>
          <div style={{ position:'absolute', left:'9%', bottom:'14%', textAlign:'center' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:700, marginBottom:2 }}>Over Budget</div>
            <div style={{ fontSize:30, fontWeight:900, color:'white', lineHeight:1 }}>{perDay || 522}</div>
          </div>
          <div style={{ position:'absolute', right:'7%', bottom:'14%', textAlign:'center' }}>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.45)', fontWeight:700, marginBottom:2 }}>Over Budget</div>
            <div style={{ fontSize:30, fontWeight:900, color:'white', lineHeight:1 }}>{perWeek || 455}</div>
          </div>

          {/* Main Orb */}
          <div onClick={e => addPop(e.clientX, e.clientY, '$'+(budget||490)+'!')} style={{
            position:'relative', zIndex:20,
            width:210, height:210, borderRadius:'50%',
            background:'radial-gradient(circle at 28% 26%, #b8f4ff 0%, #40caf0 20%, #1a7fd4 48%, #0d3a80 72%, #060f2e 100%)',
            boxShadow:'0 0 90px rgba(0,200,255,0.65), 0 0 180px rgba(0,150,255,0.32), 0 0 260px rgba(0,100,200,0.15), inset 0 0 70px rgba(255,255,255,0.18)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            cursor:'pointer',
            animation:'orbPulse 3s ease-in-out infinite',
          }}>
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>Lean Core Oro</div>
            <div style={{ fontSize:50, fontWeight:900, color:'white', lineHeight:1, textShadow:'0 0 30px rgba(255,255,255,0.5)' }}>${budget||490}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.65)', fontWeight:700, marginTop:4 }}>Food Budget</div>
          </div>
        </div>

        {/* Bottom glass cards row */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:20 }}>

          {/* Who are you budgeting for */}
          <div style={glassCard}>
            <div style={secLabel}>Who are you budgeting for?</div>
            {[
              { id:'individual', label:'Profile',      sub:'Individual' },
              { id:'family',     label:'Access Store', sub:'Family' },
            ].map(m => (
              <button key={m.id} onClick={() => {
                setMode(m.id as any)
                if (m.id==='individual') setProfile({ householdSize:1 })
                else if (profile.householdSize < 2) setProfile({ householdSize:2 })
              }} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                width:'100%', padding:'9px 12px', marginBottom:7, borderRadius:11,
                background:mode===m.id?'rgba(107,203,119,0.18)':'rgba(255,255,255,0.04)',
                border:'1px solid '+(mode===m.id?'rgba(107,203,119,0.45)':'rgba(255,255,255,0.08)'),
                color:'rgba(255,255,255,0.8)', fontSize:12, fontWeight:700,
                cursor:'pointer', fontFamily:'Nunito,sans-serif', textAlign:'left',
              }}>
                <span>{m.label}</span>
                <span style={{ color:'rgba(255,255,255,0.35)', fontSize:14 }}>{'>'}</span>
              </button>
            ))}
            {mode==='family' && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:6 }}>
                {[2,3,4,5,6,7,8].map(n => (
                  <button key={n} onClick={() => setProfile({ householdSize:n })} style={{
                    width:28, height:28, borderRadius:8, fontSize:12, fontWeight:800,
                    border:'1px solid '+(profile.householdSize===n?'var(--p)':'rgba(255,255,255,0.15)'),
                    background:profile.householdSize===n?'rgba(107,203,119,0.2)':'transparent',
                    color:profile.householdSize===n?'var(--p)':'rgba(255,255,255,0.5)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{n}</button>
                ))}
              </div>
            )}
          </div>

          {/* Fitness Goal */}
          <div style={glassCard}>
            <div style={secLabel}>Fitness Goal</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {GOALS.slice(0,2).map(g => (
                <div key={g.id} style={{ display:'flex', alignItems:'center', gap:12 }}>
                  <div onClick={() => setProfile({ fitnessGoal:g.id })} style={{
                    width:38, height:21, borderRadius:11, cursor:'pointer', position:'relative', flexShrink:0,
                    background:profile.fitnessGoal===g.id?'var(--p)':'rgba(255,255,255,0.15)',
                    transition:'background 0.2s', border:'none',
                  }}>
                    <div style={{
                      position:'absolute', top:2.5,
                      left:profile.fitnessGoal===g.id?18:3,
                      width:16, height:16, borderRadius:'50%', background:'white',
                      transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.3)',
                    }} />
                  </div>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.7)', fontWeight:700 }}>{g.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12 }}>
              <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                {GOALS.map(g => (
                  <button key={g.id} onClick={() => setProfile({ fitnessGoal:g.id })} style={{
                    padding:'3px 10px', borderRadius:14, fontSize:10, fontWeight:800,
                    border:'1px solid '+(profile.fitnessGoal===g.id?'var(--p)':'rgba(255,255,255,0.15)'),
                    background:profile.fitnessGoal===g.id?'rgba(107,203,119,0.2)':'transparent',
                    color:profile.fitnessGoal===g.id?'var(--p)':'rgba(255,255,255,0.45)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{g.label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Allergy & Dye Filters */}
          <div style={glassCard}>
            <div style={secLabel}>Allergy & Dye Filters</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:10 }}>
              {ALLERGENS.map(a => {
                const key = a.toLowerCase()
                const on  = profile.allergies.includes(key)
                return (
                  <div key={a} onClick={() => toggle('allergies', key)} style={{
                    width:26, height:26, borderRadius:'50%', cursor:'pointer',
                    background:on
                      ? 'radial-gradient(circle at 33% 30%, rgba(255,255,255,0.85), rgba(126,207,255,0.55) 50%, rgba(78,205,196,0.3))'
                      : 'radial-gradient(circle at 33% 30%, rgba(255,255,255,0.5), rgba(167,139,250,0.2) 50%, rgba(78,205,196,0.1))',
                    border:'1px solid rgba(255,255,255,'+(on?'0.55':'0.25')+')',
                    boxShadow:on?'0 0 12px rgba(126,207,255,0.45)':'none',
                    transition:'all 0.2s',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:8, color:'rgba(0,0,0,0.6)', fontWeight:800,
                  }} title={a}></div>
                )
              })}
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700, marginBottom:6, letterSpacing:'0.4px', textTransform:'uppercase' }}>Dyes</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {DYES.map(d => {
                const key = d.toLowerCase().replace(/\s/g,'_').replace(/#/g,'')
                const on  = profile.dyeFilters.includes(key)
                return (
                  <button key={d} onClick={() => toggle('dyeFilters', key)} style={{
                    padding:'3px 9px', borderRadius:14, fontSize:10, fontWeight:800,
                    border:'1px solid '+(on?'rgba(255,230,109,0.6)':'rgba(255,255,255,0.15)'),
                    background:on?'rgba(255,230,109,0.15)':'transparent',
                    color:on?'#FFE66D':'rgba(255,255,255,0.4)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{d}</button>
                )
              })}
            </div>
          </div>

          {/* Store Deal Tracking */}
          <div style={glassCard}>
            <div style={secLabel}>Store Deal Tracking</div>
            <div style={{ display:'flex', flexDirection:'column', gap:7, marginBottom:10 }}>
              {[
                { slug:'kroger',  color:'linear-gradient(90deg, #ef4444, #dc2626)', label:'Kroger' },
                { slug:'walmart', color:'linear-gradient(90deg, #3b82f6, #2563eb)', label:'Walmart' },
                { slug:'heb',     color:'linear-gradient(90deg, #f97316, #ea580c)', label:'HEB' },
              ].map(s => {
                const on = profile.preferredStores.includes(s.slug)
                return (
                  <div key={s.slug} onClick={() => toggleStore(s.slug)} style={{ cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.5)', fontWeight:700, marginBottom:3 }}>
                      <span>{s.label}</span>
                      <span style={{ color:on?'var(--p)':'rgba(255,255,255,0.25)' }}>{on?'Active':'Off'}</span>
                    </div>
                    <div style={{ height:7, borderRadius:4, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:on?'100%':'30%', borderRadius:4, background:s.color, transition:'width 0.4s', opacity:on?1:0.3 }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {STORES.map(s => {
                const on = profile.preferredStores.includes(s.slug)
                return (
                  <button key={s.slug} onClick={() => toggleStore(s.slug)} style={{
                    padding:'3px 9px', borderRadius:14, fontSize:10, fontWeight:800,
                    border:'1px solid '+(on?'var(--s)':'rgba(255,255,255,0.15)'),
                    background:on?'rgba(78,205,196,0.18)':'transparent',
                    color:on?'var(--s)':'rgba(255,255,255,0.4)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{s.label}</button>
                )
              })}
            </div>
          </div>
        </div>

        {/* LeanBot */}
        <ChatWidget context="budget" />
      </div>
    </div>
  )
}
