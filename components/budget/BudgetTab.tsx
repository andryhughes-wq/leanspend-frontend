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

function Bubble({ size, style, onPop }: { size: number; style: React.CSSProperties; onPop: (x:number,y:number)=>void }) {
  const [alive, setAlive] = useState(true)
  if (!alive) return null
  return (
    <div onClick={e => { setAlive(false); onPop(e.clientX, e.clientY) }} style={{
      width: size, height: size, borderRadius: '50%', cursor: 'pointer',
      background: 'radial-gradient(circle at 30% 26%, rgba(255,255,255,0.78) 0%, rgba(160,230,255,0.38) 32%, rgba(167,139,250,0.22) 62%, rgba(78,205,196,0.1) 100%)',
      border: '1px solid rgba(255,255,255,0.42)',
      boxShadow: '0 0 '+(size*0.45).toFixed(0)+'px rgba(126,207,255,0.28), inset 0 0 '+(size*0.3).toFixed(0)+'px rgba(255,255,255,0.15)',
      animation: 'floatBubble '+(3.8+(size%7)*0.4).toFixed(1)+'s ease-in-out infinite',
      transition: 'transform 0.12s',
      ...style,
    }} />
  )
}

export function BudgetTab() {
  const { profile, setProfile } = useAppStore()
  const [income, setIncome] = useState(profile.monthlyIncome ? String(profile.monthlyIncome) : '')
  const [mode, setMode]     = useState<'individual'|'family'>(profile.householdSize > 1 ? 'family' : 'individual')
  const [pops, setPops]     = useState<{id:number,x:number,y:number,text:string}[]>([])
  const pid = useRef(0)

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

  const addPop = (x:number, y:number, text:string) => {
    const id = ++pid.current
    setPops(p => [...p, {id,x,y,text}])
    setTimeout(() => setPops(p => p.filter(t => t.id !== id)), 950)
  }

  const g = { background:'rgba(255,255,255,0.055)', backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:18, padding:18 } as React.CSSProperties
  const lbl = { fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.45)', textTransform:'uppercase' as const, letterSpacing:'0.65px', marginBottom:11 }

  const BUBBLE_DEFS = [
    { size:46, style:{ position:'fixed' as const, left:'5%',  top:'20%', animationDelay:'0s' } },
    { size:28, style:{ position:'fixed' as const, left:'89%', top:'16%', animationDelay:'1.3s' } },
    { size:36, style:{ position:'fixed' as const, left:'3%',  top:'52%', animationDelay:'0.6s' } },
    { size:20, style:{ position:'fixed' as const, left:'92%', top:'58%', animationDelay:'2.2s' } },
    { size:32, style:{ position:'fixed' as const, left:'11%', top:'74%', animationDelay:'1.8s' } },
    { size:17, style:{ position:'fixed' as const, left:'82%', top:'80%', animationDelay:'0.2s' } },
    { size:14, style:{ position:'fixed' as const, left:'47%', top:'90%', animationDelay:'3s'   } },
    { size:40, style:{ position:'fixed' as const, left:'94%', top:'38%', animationDelay:'1.5s' } },
    { size:22, style:{ position:'fixed' as const, left:'1%',  top:'36%', animationDelay:'2.6s' } },
    { size:16, style:{ position:'fixed' as const, left:'72%', top:'10%', animationDelay:'1s'   } },
  ]
  const POP_WORDS = ['Pop!','Save!','Deal!','Yes!','Win!','Nice!','Boom!','Free!','$$$','Low!']

  return (
    <div style={{ position:'relative' }}>
      {/* Floating bubbles */}
      {BUBBLE_DEFS.map((b,i) => (
        <Bubble key={i} size={b.size} style={{ ...b.style, zIndex:3 }} onPop={(x,y) => addPop(x,y,POP_WORDS[i])} />
      ))}

      {/* Pop text fx */}
      {pops.map(p => (
        <div key={p.id} style={{
          position:'fixed', left:p.x-22, top:p.y-50, pointerEvents:'none', zIndex:9999,
          color:'#7ecfff', fontWeight:900, fontSize:22, fontFamily:'Nunito,sans-serif',
          textShadow:'0 0 14px rgba(126,207,255,0.95)',
          animation:'floatUp 0.95s ease-out forwards',
        }}>{p.text}</div>
      ))}

      <div style={{ position:'relative', zIndex:10, padding:'0 28px 36px' }}>

        {/* Top controls */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 0 24px' }}>
          <div style={{ fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.5)', letterSpacing:'0.2px' }}>Budget Dashboard</div>
          <div style={{ display:'flex', gap:10, alignItems:'center' }}>
            <button style={{ padding:'8px 18px', borderRadius:22, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.13)', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
              1 Pay/Month
            </button>
            <div style={{ position:'relative' }}>
              <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.32)', fontSize:14, fontWeight:800, pointerEvents:'none' }}>$</span>
              <input type="number" value={income} onChange={e=>setIncome(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&income&&calculate()}
                placeholder="Ultra Calc Salary"
                style={{ padding:'8px 14px 8px 27px', borderRadius:22, width:175, background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.13)', color:'white', fontSize:12, fontWeight:700, outline:'none', fontFamily:'Nunito,sans-serif' }} />
            </div>
            <button onClick={()=>income&&calculate()} disabled={isPending||!income} style={{
              padding:'8px 20px', borderRadius:22,
              background:isPending||!income?'rgba(107,203,119,0.22)':'var(--p)',
              border:'none', color:'white', fontSize:12, fontWeight:800, cursor:isPending||!income?'not-allowed':'pointer',
              opacity:isPending||!income?0.5:1, fontFamily:'Nunito,sans-serif',
            }}>{isPending?'...':'Ultra Calc'}</button>
          </div>
        </div>

        {/* ORB HERO */}
        <div style={{ position:'relative', display:'flex', alignItems:'center', justifyContent:'center', height:370, marginBottom:30 }}>
          {/* Orbital rings */}
          {[
            { w:530, h:162, d:'22s', rev:false, extra:'' },
            { w:450, h:135, d:'16s', rev:true,  extra:' rotateZ(55deg)' },
            { w:610, h:192, d:'32s', rev:false,  extra:' rotateZ(110deg)' },
          ].map((r,i) => (
            <div key={i} style={{
              position:'absolute', borderRadius:'50%', pointerEvents:'none',
              width:r.w, height:r.h,
              border:'1px solid rgba(0,210,255,'+(0.13-i*0.03)+')',
              transform:'rotateX(76deg)'+r.extra,
              animation:(r.rev?'orbitSpinRev':'orbitSpin')+' '+r.d+' linear infinite',
            }} />
          ))}

          {/* Glow halo */}
          <div style={{ position:'absolute', width:300, height:300, borderRadius:'50%', background:'radial-gradient(circle, rgba(0,200,255,0.14) 0%, transparent 70%)', pointerEvents:'none', animation:'orbPulse 3s ease-in-out infinite' }} />

          {/* Stats */}
          {[
            { label:'Savings',      val:savings||540, pos:{ left:'7%',  top:'15%' } },
            { label:'Over Budget',  val:budget||950,  pos:{ right:'7%', top:'15%' } },
            { label:'Over Budget',  val:perDay||522,  pos:{ left:'9%',  bottom:'13%' } },
            { label:'Over Budget',  val:perWeek||455, pos:{ right:'7%', bottom:'13%' } },
          ].map((s,i) => (
            <div key={i} style={{ position:'absolute', textAlign:'center', ...s.pos }}>
              <div style={{ fontSize:12, color:'rgba(255,255,255,0.42)', fontWeight:700, marginBottom:3 }}>{s.label}</div>
              <div style={{ fontSize:32, fontWeight:900, color:'white', lineHeight:1 }}>{s.val}</div>
            </div>
          ))}

          {/* Main orb */}
          <div onClick={e => addPop(e.clientX, e.clientY, '$'+(budget||490)+'!')} style={{
            position:'relative', zIndex:20,
            width:215, height:215, borderRadius:'50%',
            background:'radial-gradient(circle at 28% 25%, #c2f5ff 0%, #44ccf2 18%, #1a80d8 46%, #0c3882 70%, #040e2a 100%)',
            boxShadow:'0 0 90px rgba(0,200,255,0.62), 0 0 180px rgba(0,150,255,0.3), 0 0 260px rgba(0,100,200,0.13), inset 0 0 70px rgba(255,255,255,0.16)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            cursor:'pointer', animation:'orbPulse 3s ease-in-out infinite',
            userSelect:'none',
          }}>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.68)', fontWeight:700, letterSpacing:2, textTransform:'uppercase', marginBottom:5 }}>Lean Core Oro</div>
            <div style={{ fontSize:52, fontWeight:900, color:'white', lineHeight:1, textShadow:'0 0 30px rgba(255,255,255,0.45)' }}>${budget||490}</div>
            <div style={{ fontSize:13, color:'rgba(255,255,255,0.6)', fontWeight:700, marginTop:5 }}>Food Budget</div>
          </div>
        </div>

        {/* 4 bottom glass cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:22 }}>

          {/* Who budgeting for */}
          <div style={g}>
            <div style={lbl}>Who are you budgeting for?</div>
            {[
              { id:'individual', label:'Profile',      sub:'' },
              { id:'family',     label:'Access Store', sub:'' },
            ].map(m => (
              <button key={m.id} onClick={() => {
                setMode(m.id as any)
                if (m.id==='individual') setProfile({ householdSize:1 })
                else if (profile.householdSize < 2) setProfile({ householdSize:2 })
              }} style={{
                display:'flex', alignItems:'center', justifyContent:'space-between',
                width:'100%', padding:'9px 12px', marginBottom:7, borderRadius:11,
                background:mode===m.id?'rgba(107,203,119,0.16)':'rgba(255,255,255,0.03)',
                border:'1px solid '+(mode===m.id?'rgba(107,203,119,0.42)':'rgba(255,255,255,0.07)'),
                color:'rgba(255,255,255,0.78)', fontSize:12, fontWeight:700,
                cursor:'pointer', fontFamily:'Nunito,sans-serif', textAlign:'left',
              }}>
                <span>{m.label}</span><span style={{ color:'rgba(255,255,255,0.3)' }}>&#62;</span>
              </button>
            ))}
            {mode==='family' && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
                {[2,3,4,5,6,7,8].map(n=>(
                  <button key={n} onClick={()=>setProfile({householdSize:n})} style={{
                    width:28, height:28, borderRadius:8, fontSize:11, fontWeight:800,
                    border:'1px solid '+(profile.householdSize===n?'var(--p)':'rgba(255,255,255,0.12)'),
                    background:profile.householdSize===n?'rgba(107,203,119,0.2)':'transparent',
                    color:profile.householdSize===n?'var(--p)':'rgba(255,255,255,0.45)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{n}</button>
                ))}
              </div>
            )}
            <div style={{ marginTop:10, display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700 }}>?</div>
            </div>
          </div>

          {/* Fitness Goal */}
          <div style={g}>
            <div style={lbl}>Fitness Goal</div>
            <div style={{ display:'flex', flexDirection:'column', gap:11 }}>
              {GOALS.slice(0,2).map(gl => (
                <div key={gl.id} style={{ display:'flex', alignItems:'center', gap:11 }}>
                  <div onClick={()=>setProfile({fitnessGoal:gl.id})} style={{
                    width:38, height:21, borderRadius:11, cursor:'pointer', position:'relative', flexShrink:0,
                    background:profile.fitnessGoal===gl.id?'var(--p)':'rgba(255,255,255,0.14)', transition:'background 0.2s',
                  }}>
                    <div style={{ position:'absolute', top:2.5, left:profile.fitnessGoal===gl.id?18:3, width:16, height:16, borderRadius:'50%', background:'white', transition:'left 0.2s', boxShadow:'0 1px 4px rgba(0,0,0,0.25)' }} />
                  </div>
                  <span style={{ fontSize:12, color:'rgba(255,255,255,0.65)', fontWeight:700 }}>{gl.label}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop:12, display:'flex', flexWrap:'wrap', gap:5 }}>
              {GOALS.map(gl => (
                <button key={gl.id} onClick={()=>setProfile({fitnessGoal:gl.id})} style={{
                  padding:'3px 10px', borderRadius:14, fontSize:10, fontWeight:800,
                  border:'1px solid '+(profile.fitnessGoal===gl.id?'var(--p)':'rgba(255,255,255,0.13)'),
                  background:profile.fitnessGoal===gl.id?'rgba(107,203,119,0.18)':'transparent',
                  color:profile.fitnessGoal===gl.id?'var(--p)':'rgba(255,255,255,0.4)',
                  cursor:'pointer', fontFamily:'Nunito,sans-serif',
                }}>{gl.label}</button>
              ))}
            </div>
          </div>

          {/* Allergy & Dye */}
          <div style={g}>
            <div style={lbl}>Allergy & Dye Filters</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:7, marginBottom:12 }}>
              {ALLERGENS.map(a => {
                const key = a.toLowerCase()
                const on  = profile.allergies.includes(key)
                return (
                  <div key={a} onClick={()=>toggle('allergies',key)} title={a} style={{
                    width:26, height:26, borderRadius:'50%', cursor:'pointer', flexShrink:0,
                    background:on
                      ? 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.88), rgba(126,207,255,0.55) 48%, rgba(78,205,196,0.28))'
                      : 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.52), rgba(167,139,250,0.2) 48%, rgba(78,205,196,0.1))',
                    border:'1px solid rgba(255,255,255,'+(on?'0.52':'0.22')+')',
                    boxShadow:on?'0 0 10px rgba(126,207,255,0.42)':'none',
                    transition:'all 0.18s',
                  }} />
                )
              })}
            </div>
            <div style={{ fontSize:10, color:'rgba(255,255,255,0.32)', fontWeight:700, marginBottom:6, letterSpacing:'0.5px', textTransform:'uppercase' }}>Synthetic Dyes</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {DYES.map(d => {
                const key = d.toLowerCase().replace(/\s/g,'_').replace(/#/g,'')
                const on  = profile.dyeFilters.includes(key)
                return (
                  <button key={d} onClick={()=>toggle('dyeFilters',key)} style={{
                    padding:'3px 9px', borderRadius:14, fontSize:10, fontWeight:800,
                    border:'1px solid '+(on?'rgba(255,230,109,0.55)':'rgba(255,255,255,0.13)'),
                    background:on?'rgba(255,230,109,0.14)':'transparent',
                    color:on?'#FFE66D':'rgba(255,255,255,0.38)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{d}</button>
                )
              })}
            </div>
          </div>

          {/* Store Deal Tracking */}
          <div style={g}>
            <div style={lbl}>Store Deal Tracking</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:11 }}>
              {[
                { slug:'kroger',  color:'linear-gradient(90deg,#ef4444,#dc2626)', label:'Kroger' },
                { slug:'walmart', color:'linear-gradient(90deg,#3b82f6,#2563eb)', label:'Walmart' },
                { slug:'heb',     color:'linear-gradient(90deg,#f97316,#ea580c)', label:'HEB' },
              ].map(s => {
                const on = profile.preferredStores.includes(s.slug)
                return (
                  <div key={s.slug} onClick={()=>toggleStore(s.slug)} style={{ cursor:'pointer' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:'rgba(255,255,255,0.48)', fontWeight:700, marginBottom:3 }}>
                      <span>{s.label}</span>
                      <span style={{ color:on?'var(--p)':'rgba(255,255,255,0.22)' }}>{on?'Active':'Off'}</span>
                    </div>
                    <div style={{ height:6, borderRadius:3, background:'rgba(255,255,255,0.07)', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:on?'100%':'25%', background:s.color, borderRadius:3, transition:'width 0.4s', opacity:on?1:0.25 }} />
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
              {STORES.map(s => {
                const on = profile.preferredStores.includes(s.slug)
                return (
                  <button key={s.slug} onClick={()=>toggleStore(s.slug)} style={{
                    padding:'3px 9px', borderRadius:14, fontSize:10, fontWeight:800,
                    border:'1px solid '+(on?'var(--s)':'rgba(255,255,255,0.13)'),
                    background:on?'rgba(78,205,196,0.16)':'transparent',
                    color:on?'var(--s)':'rgba(255,255,255,0.38)',
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
