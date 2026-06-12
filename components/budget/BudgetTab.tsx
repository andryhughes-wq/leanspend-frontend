'use client'
import { useState, useRef, useEffect } from 'react'
import { useMutation } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { budgetApi } from '@/lib/api'
import { useAppStore, type Expense } from '@/store/appStore'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { BeltBackground } from '@/components/budget/BeltBackground'
import { useSurface } from '@/lib/useSurface'

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
const EXPENSE_PRESETS = [
  { label:'Rent / Mortgage', category:'Housing',       default:1200 },
  { label:'Car Payment',     category:'Transport',     default:350  },
  { label:'Utilities',       category:'Utilities',     default:150  },
  { label:'Insurance',       category:'Insurance',     default:200  },
  { label:'Subscriptions',   category:'Subscriptions', default:50   },
]
const QUICK_ADD = [
  { label:'Student Loans', category:'Debt',       default:300 },
  { label:'Phone Bill',    category:'Utilities',  default:80  },
  { label:'Internet',      category:'Utilities',  default:60  },
  { label:'Gym',           category:'Health',     default:45  },
  { label:'Childcare',     category:'Family',     default:800 },
  { label:'Medical',       category:'Health',     default:100 },
  { label:'Savings',       category:'Savings',    default:200 },
  { label:'Debt Payment',  category:'Debt',       default:250 },
  { label:'Entertainment', category:'Lifestyle',  default:100 },
  { label:'Clothing',      category:'Lifestyle',  default:80  },
]
const CAT_COLORS: Record<string,string> = {
  Housing:'#ff6b6b', Transport:'#f97316', Utilities:'#FFE66D',
  Insurance:'#A78BFA', Subscriptions:'#4ECDC4', Debt:'#ff8fab',
  Health:'#6BCB77', Family:'#38bdf8', Savings:'#34d399',
  Lifestyle:'#c084fc', Other:'#94a3b8',
}

function ChibiModal({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div onClick={onClose} style={{
      position:'fixed', inset:0, zIndex:9999,
      display:'flex', alignItems:'center', justifyContent:'center',
      background:'rgba(0,0,0,0.5)', backdropFilter:'blur(4px)',
      animation:'fadeIn 0.3s ease-out',
      cursor:'pointer',
    }}>
      <div style={{
        background:'rgba(10,18,35,0.95)',
        border:'1px solid rgba(255,255,255,0.15)',
        borderRadius:24, padding:'28px 36px',
        textAlign:'center',
        boxShadow:'0 0 80px rgba(107,203,119,0.3)',
        animation:'bounceSoft 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
        <svg width="200" height="200" viewBox="0 0 200 200" style={{ display:'block', margin:'0 auto' }}>
          {/* Bowl */}
          <ellipse cx="100" cy="168" rx="55" ry="16" fill="#2a1a0a" stroke="#8B4513" strokeWidth="2"/>
          <path d="M46 155 Q46 175 100 178 Q154 175 154 155 L148 140 Q100 150 52 140 Z" fill="#4a2c0a" stroke="#8B4513" strokeWidth="1.5"/>
          {/* Spaghetti swirls */}
          <g style={{ animation:'spin 1.5s linear infinite', transformOrigin:'100px 148px' }}>
            <path d="M70 148 Q80 138 90 148 Q100 158 110 148 Q120 138 130 148" fill="none" stroke="#f4a460" strokeWidth="3" strokeLinecap="round"/>
            <path d="M65 155 Q78 143 88 155 Q100 165 112 155 Q122 143 135 155" fill="none" stroke="#daa520" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M75 142 Q88 132 98 142 Q108 152 118 142 Q128 132 138 142" fill="none" stroke="#f4a460" strokeWidth="2" strokeLinecap="round"/>
            <circle cx="85" cy="150" r="3" fill="#cc2200"/>
            <circle cx="105" cy="143" r="3" fill="#cc2200"/>
            <circle cx="118" cy="152" r="3" fill="#cc2200"/>
            <circle cx="95" cy="158" r="2.5" fill="#cc2200"/>
          </g>
          {/* Chibi body */}
          <ellipse cx="100" cy="125" rx="22" ry="18" fill="#ffe0bd" stroke="#e8c4a0" strokeWidth="1.5"/>
          {/* Chibi head */}
          <circle cx="100" cy="88" r="32" fill="#ffe0bd" stroke="#e8c4a0" strokeWidth="2"/>
          <path d="M68 80 Q72 58 100 56 Q128 58 132 80 Q120 65 100 64 Q80 65 68 80 Z" fill="#3d2b1f"/>
          <path d="M68 80 Q62 75 64 65 Q66 60 72 62 Z" fill="#3d2b1f"/>
          <path d="M132 80 Q138 75 136 65 Q134 60 128 62 Z" fill="#3d2b1f"/>
          {/* Eyes - happy squint */}
          <path d="M85 88 Q88 84 91 88" fill="none" stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round"/>
          <path d="M109 88 Q112 84 115 88" fill="none" stroke="#3d2b1f" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Rosy cheeks */}
          <circle cx="82" cy="94" r="7" fill="rgba(255,150,150,0.35)"/>
          <circle cx="118" cy="94" r="7" fill="rgba(255,150,150,0.35)"/>
          {/* Smile */}
          <path d="M90 100 Q100 108 110 100" fill="none" stroke="#c0706a" strokeWidth="2.5" strokeLinecap="round"/>
          {/* Left arm + fork */}
          <line x1="78" y1="118" x2="58" y2="140" stroke="#ffe0bd" strokeWidth="10" strokeLinecap="round"/>
          <line x1="58" y1="140" x2="55" y2="155" stroke="#aaa" strokeWidth="3" strokeLinecap="round"/>
          <line x1="52" y1="155" x2="50" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          <line x1="55" y1="155" x2="53" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          <line x1="58" y1="155" x2="56" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          <line x1="61" y1="155" x2="59" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          {/* Right arm + fork */}
          <line x1="122" y1="118" x2="142" y2="140" stroke="#ffe0bd" strokeWidth="10" strokeLinecap="round"/>
          <line x1="142" y1="140" x2="145" y2="155" stroke="#aaa" strokeWidth="3" strokeLinecap="round"/>
          <line x1="139" y1="155" x2="137" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          <line x1="142" y1="155" x2="140" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          <line x1="145" y1="155" x2="143" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          <line x1="148" y1="155" x2="146" y2="165" stroke="#aaa" strokeWidth="2" strokeLinecap="round"/>
          {/* Stars around */}
          <text x="30" y="70" fontSize="16" fill="#FFE66D" style={{ animation:'pulse 1s infinite' }}>*</text>
          <text x="158" y="65" fontSize="12" fill="#4ECDC4">*</text>
          <text x="22" y="110" fontSize="10" fill="#ff6b6b">*</text>
          <text x="168" y="105" fontSize="14" fill="#A78BFA">*</text>
        </svg>
        <div style={{ marginTop:12, fontSize:18, fontWeight:900, color:'white', fontFamily:'Nunito,sans-serif' }}>
          Cooking up your budget!
        </div>
        <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', fontWeight:700, marginTop:4, fontFamily:'Nunito,sans-serif' }}>
          Click to dismiss
        </div>
      </div>
    </div>
  )
}

function Bubble({ size, style, onPop }: { size:number; style:React.CSSProperties; onPop:(x:number,y:number)=>void }) {
  const [alive, setAlive] = useState(true)
  if (!alive) return null
  return (
    <div onClick={e => { setAlive(false); onPop(e.clientX, e.clientY) }} style={{
      width:size, height:size, borderRadius:'50%', cursor:'pointer',
      background:'radial-gradient(circle at 30% 26%, rgba(255,255,255,0.78) 0%, rgba(160,230,255,0.38) 32%, rgba(167,139,250,0.22) 62%, rgba(78,205,196,0.1) 100%)',
      border:'1px solid rgba(255,255,255,0.42)',
      boxShadow:'0 0 '+(size*0.45).toFixed(0)+'px rgba(126,207,255,0.28), inset 0 0 '+(size*0.3).toFixed(0)+'px rgba(255,255,255,0.15)',
      animation:'floatBubble '+(3.8+(size%7)*0.4).toFixed(1)+'s ease-in-out infinite',
      ...style,
    }} />
  )
}

export function BudgetTab() {
  const { profile, setProfile } = useAppStore()
  const [isMobile, setIsMobile] = useState(false)
  const surface = useSurface()
  useEffect(() => { const c = () => setIsMobile(window.innerWidth < 768); c(); window.addEventListener('resize', c); return () => window.removeEventListener('resize', c) }, [])
  const [income, setIncome]   = useState(profile.monthlyIncome ? String(profile.monthlyIncome) : '')
  const [mode, setMode]       = useState<'individual'|'family'>(profile.householdSize > 1 ? 'family' : 'individual')
  const [expenses, setExpenses] = useState<Expense[]>(
    profile.expenses?.length
      ? profile.expenses
      : EXPENSE_PRESETS.map((e,i) => ({ id:String(i), label:e.label, amount:0, category:e.category }))
  )
  const [customLabel, setCustomLabel] = useState('')
  const [showCustom, setShowCustom]   = useState(false)
  const [showChibi, setShowChibi]     = useState(false)
  const [pops, setPops] = useState<{id:number,x:number,y:number,text:string}[]>([])
  const pid = useRef(0)

  const totalExpenses  = expenses.reduce((s,e) => s+(e.amount||0), 0)
  const incomeNum      = Number(income) || 0
  const disposable     = Math.max(0, incomeNum - totalExpenses)
  const overBudget     = incomeNum > 0 && totalExpenses > incomeNum
  const calculatedFood = Math.round(disposable * 0.28)
  const budget         = calculatedFood || profile.foodBudget || 0
  const withDeals      = Math.round(budget * 0.74)
  const dealSavings    = budget - withDeals
  const perDay         = budget ? Number((withDeals/30).toFixed(2)) : 0
  const perWeek        = budget ? Math.round(budget/4) : 0
  const foodOfIncome   = incomeNum > 0 ? Math.round((budget/incomeNum)*100) : 0

  const { mutate: calculate, isPending } = useMutation({
    mutationFn: () => budgetApi.calculate({
      monthlyIncome: incomeNum, totalExpenses, disposableIncome: disposable,
      householdSize: profile.householdSize, fitnessGoal: profile.fitnessGoal,
    }),
    onSuccess: d => {
      setProfile({ monthlyIncome:incomeNum, foodBudget:d.recommendedFoodBudget||calculatedFood, expenses })
      setShowChibi(true)
      toast.success('Budget set! $'+(d.recommendedFoodBudget||calculatedFood)+'/mo')
    },
    onError: () => {
      setProfile({ monthlyIncome:incomeNum, foodBudget:calculatedFood, expenses })
      setShowChibi(true)
      toast.success('Budget set! $'+calculatedFood+'/mo')
    },
  })

  const updateExpense = (id:string, amount:number) => setExpenses(p => p.map(e => e.id===id?{...e,amount}:e))
  const removeExpense = (id:string) => setExpenses(p => p.filter(e => e.id!==id))
  const addQuick = (label:string, category:string, def:number) =>
    setExpenses(p => [...p, { id:Date.now().toString(), label, amount:def, category }])
  const addCustomExpense = () => {
    if (!customLabel.trim()) return
    addQuick(customLabel.trim(), 'Other', 0)
    setCustomLabel(''); setShowCustom(false)
  }
  const toggle = (list:'allergies'|'dyeFilters', key:string) => {
    const cur = profile[list]
    setProfile({ [list]: cur.includes(key) ? cur.filter((a:string)=>a!==key) : [...cur,key] })
  }
  const toggleStore = (slug:string) => {
    const cur = profile.preferredStores
    setProfile({ preferredStores: cur.includes(slug) ? cur.filter((s:string)=>s!==slug) : [...cur,slug] })
  }
  const addPop = (x:number, y:number, text:string) => {
    const id = ++pid.current
    setPops(p => [...p,{id,x,y,text}])
    setTimeout(() => setPops(p => p.filter(t=>t.id!==id)), 950)
  }

  const BUBBLES = [
    {size:46,style:{position:'fixed' as const,left:'5%', top:'22%',animationDelay:'0s'}},
    {size:28,style:{position:'fixed' as const,left:'89%',top:'17%',animationDelay:'1.3s'}},
    {size:36,style:{position:'fixed' as const,left:'3%', top:'53%',animationDelay:'0.6s'}},
    {size:20,style:{position:'fixed' as const,left:'92%',top:'60%',animationDelay:'2.2s'}},
    {size:32,style:{position:'fixed' as const,left:'11%',top:'75%',animationDelay:'1.8s'}},
    {size:17,style:{position:'fixed' as const,left:'82%',top:'81%',animationDelay:'0.2s'}},
    {size:40,style:{position:'fixed' as const,left:'94%',top:'39%',animationDelay:'1.5s'}},
    {size:22,style:{position:'fixed' as const,left:'1%', top:'37%',animationDelay:'2.6s'}},
  ]
  const POP_W = ['Pop!','Save!','Deal!','Yes!','Win!','Nice!','Boom!','Free!']

  const g: React.CSSProperties = {
    background:'rgba(255,255,255,0.055)',
    backdropFilter:'blur(22px)', WebkitBackdropFilter:'blur(22px)',
    border:'1px solid rgba(255,255,255,0.12)', borderRadius:18, padding:18,
  }
  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.42)',
    textTransform:'uppercase', letterSpacing:'0.65px', marginBottom:11,
  }
  const inputStyle: React.CSSProperties = {
    background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
    borderRadius:10, padding:'7px 10px 7px 22px', color:'white',
    fontSize:13, fontWeight:700, outline:'none', fontFamily:'Nunito,sans-serif', width:'100%',
  }
  const catGroups = expenses.reduce((acc,e) => {
    acc[e.category] = (acc[e.category]||0)+(e.amount||0); return acc
  }, {} as Record<string,number>)

  return (
    <div style={{ position:'relative' }}>
      {surface === 'web' && <BeltBackground />}
      {showChibi && <ChibiModal onClose={() => setShowChibi(false)} />}

      {BUBBLES.map((b,i) => (
        <Bubble key={i} size={b.size} style={{...b.style,zIndex:3}} onPop={(x,y)=>addPop(x,y,POP_W[i])} />
      ))}
      {pops.map(p => (
        <div key={p.id} style={{
          position:'fixed',left:p.x-22,top:p.y-50,pointerEvents:'none',zIndex:9999,
          color:'#7ecfff',fontWeight:900,fontSize:22,fontFamily:'Nunito,sans-serif',
          textShadow:'0 0 14px rgba(126,207,255,0.95)',
          animation:'floatUp 0.95s ease-out forwards',
        }}>{p.text}</div>
      ))}

      <div style={{ position:'relative', zIndex:10, padding:'0 28px 36px' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 0 26px' }}>
          <div className="gloss-head" style={{ fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.5)' }}>Budget Dashboard</div>
          <button onClick={()=>calculate()} disabled={isPending||!income} style={{
            padding:'9px 28px', borderRadius:22,
            background:isPending||!income?'rgba(107,203,119,0.2)':'var(--p)',
            border:'none', color:'white', fontSize:13, fontWeight:800,
            cursor:isPending||!income?'not-allowed':'pointer',
            opacity:isPending||!income?0.5:1, fontFamily:'Nunito,sans-serif',
            boxShadow:budget?'0 0 20px rgba(107,203,119,0.35)':'none',
            transition:'all 0.2s',
          }}>{isPending?'Cooking...\u{1F35D}':'Calculate Budget'}</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '420px 1fr', gap:20, marginBottom:22 }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={g}>
              <div style={lbl}>Monthly Income</div>
              <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                <div style={{ position:'relative', flex:1 }}>
                  <span style={{ position:'absolute', left:9, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.3)', fontSize:16, fontWeight:900, pointerEvents:'none' }}>$</span>
                  <input type="number" value={income} onChange={e=>setIncome(e.target.value)}
                    onKeyDown={e=>e.key==='Enter'&&income&&calculate()}
                    placeholder="e.g. 4000"
                    style={{ ...inputStyle, fontSize:22, fontWeight:900, padding:'10px 12px 10px 26px' }} />
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700, marginBottom:2 }}>After expenses</div>
                  <div style={{ fontSize:20, fontWeight:900, color:overBudget?'#ff6b6b':'#6BCB77' }}>
                    ${disposable.toLocaleString()}
                  </div>
                </div>
              </div>
              {overBudget && (
                <div style={{ marginTop:10, padding:'8px 12px', borderRadius:10, background:'rgba(255,107,107,0.12)', border:'1px solid rgba(255,107,107,0.25)', fontSize:11, fontWeight:700, color:'rgba(255,160,160,0.9)' }}>
                  Expenses exceed income by ${(totalExpenses-incomeNum).toLocaleString()}
                </div>
              )}
            </div>

            <div style={g}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                <div style={lbl}>Monthly Expenses</div>
                <div style={{ fontSize:14, fontWeight:900, color:'#ff6b6b' }}>-${totalExpenses.toLocaleString()}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {expenses.map(exp => (
                  <div key={exp.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:CAT_COLORS[exp.category]||'#94a3b8', flexShrink:0 }} />
                    <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.65)', minWidth:130, flex:1 }}>{exp.label}</div>
                    <div style={{ position:'relative', width:110 }}>
                      <span style={{ position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', color:'rgba(255,255,255,0.28)', fontSize:12, fontWeight:800, pointerEvents:'none' }}>$</span>
                      <input type="number" value={exp.amount||''} placeholder="0"
                        onChange={e=>updateExpense(exp.id, Number(e.target.value))}
                        style={{ ...inputStyle, padding:'6px 8px 6px 20px', fontSize:12, width:'100%' }} />
                    </div>
                    <button onClick={()=>removeExpense(exp.id)} style={{
                      width:22, height:22, borderRadius:'50%', flexShrink:0,
                      border:'1px solid rgba(255,100,100,0.28)', background:'transparent',
                      color:'rgba(255,100,100,0.55)', fontSize:14, cursor:'pointer',
                      display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Nunito,sans-serif',
                    }}>x</button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, paddingTop:12, borderTop:'1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ ...lbl, marginBottom:8 }}>Quick Add</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {QUICK_ADD.filter(q => !expenses.find(e=>e.label===q.label)).map(q => (
                    <button key={q.label} onClick={()=>addQuick(q.label,q.category,q.default)} style={{
                      padding:'4px 11px', borderRadius:12, fontSize:10, fontWeight:800,
                      border:'1px solid rgba(255,255,255,0.14)', background:'transparent',
                      color:'rgba(255,255,255,0.45)', cursor:'pointer', fontFamily:'Nunito,sans-serif',
                    }}>{q.label}</button>
                  ))}
                  <button onClick={()=>setShowCustom(s=>!s)} style={{
                    padding:'4px 11px', borderRadius:12, fontSize:10, fontWeight:800,
                    border:'1px solid rgba(107,203,119,0.35)', background:'rgba(107,203,119,0.1)',
                    color:'#6BCB77', cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>+ Custom</button>
                </div>
                {showCustom && (
                  <div style={{ display:'flex', gap:8, marginTop:10 }}>
                    <input value={customLabel} onChange={e=>setCustomLabel(e.target.value)}
                      onKeyDown={e=>e.key==='Enter'&&addCustomExpense()}
                      placeholder="Expense name..."
                      style={{ ...inputStyle, flex:1, padding:'7px 12px', fontSize:12 }} />
                    <button onClick={addCustomExpense} style={{
                      padding:'7px 16px', borderRadius:10, background:'var(--p)',
                      border:'none', color:'white', fontSize:12, fontWeight:800,
                      cursor:'pointer', fontFamily:'Nunito,sans-serif',
                    }}>Add</button>
                  </div>
                )}
              </div>
            </div>

            <div style={g}>
              <div style={lbl}>Spending Breakdown</div>
              {incomeNum > 0 ? (
                <>
                  {Object.entries(catGroups).filter(([,v])=>v>0).map(([cat,val]) => {
                    const pct = Math.min(100, Math.round((val/incomeNum)*100))
                    return (
                      <div key={cat} style={{ marginBottom:9 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.5)', marginBottom:3 }}>
                          <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                            <span style={{ width:7,height:7,borderRadius:'50%',background:CAT_COLORS[cat]||'#94a3b8',display:'inline-block' }} />
                            {cat}
                          </span>
                          <span>${val.toLocaleString()} ({pct}%)</span>
                        </div>
                        <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
                          <div style={{ height:'100%', width:pct+'%', background:CAT_COLORS[cat]||'#94a3b8', borderRadius:3, transition:'width .5s' }} />
                        </div>
                      </div>
                    )
                  })}
                  {budget > 0 && (
                    <div style={{ marginBottom:9 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, fontWeight:700, color:'rgba(78,205,196,0.7)', marginBottom:3 }}>
                        <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <span style={{ width:7,height:7,borderRadius:'50%',background:'#4ECDC4',display:'inline-block' }} />
                          Food Budget
                        </span>
                        <span>${budget.toLocaleString()} ({foodOfIncome}%)</span>
                      </div>
                      <div style={{ height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden' }}>
                        <div style={{ height:'100%', width:Math.min(100,foodOfIncome)+'%', background:'#4ECDC4', borderRadius:3, transition:'width .5s' }} />
                      </div>
                    </div>
                  )}
                  <div style={{ marginTop:10, padding:'9px 12px', borderRadius:11, background:'rgba(78,205,196,0.07)', border:'1px solid rgba(78,205,196,0.15)', fontSize:11, fontWeight:700, color:'rgba(78,205,196,0.8)', lineHeight:1.5 }}>
                    {overBudget
                      ? 'Expenses exceed income. Reduce fixed costs to free up budget.'
                      : foodOfIncome < 8
                        ? 'Food budget is tight. Consider reducing other expenses.'
                        : 'With store deals you could save an extra $'+Math.round(budget*0.22)+'/mo on groceries.'}
                  </div>
                </>
              ) : (
                <div style={{ fontSize:12, color:'rgba(255,255,255,0.28)', fontWeight:700, textAlign:'center', padding:'16px 0' }}>Enter your income to see breakdown</div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Orb */}
            <div style={{ ...g, position:'relative', display:'flex', alignItems:'center', justifyContent:'center', minHeight:320 }}>
              {[{w:380,h:115,d:'22s',rev:false,z:''},{w:320,h:95,d:'16s',rev:true,z:' rotateZ(55deg)'},{w:440,h:135,d:'32s',rev:false,z:' rotateZ(110deg)'}].map((r,i)=>(
                <div key={i} style={{
                  position:'absolute', borderRadius:'50%', pointerEvents:'none',
                  width:r.w, height:r.h,
                  border:'1px solid rgba(0,210,255,'+(0.13-i*0.03)+')',
                  transform:'rotateX(76deg)'+r.z,
                  animation:(r.rev?'orbitSpinRev':'orbitSpin')+' '+r.d+' linear infinite',
                }} />
              ))}
              <div style={{ position:'absolute', width:220, height:220, borderRadius:'50%', background:'radial-gradient(circle,rgba(0,200,255,0.12) 0%,transparent 70%)', pointerEvents:'none', animation:'orbPulse 3s ease-in-out infinite' }} />
              {[
                {label:'Disposable',val:'$'+(disposable||0).toLocaleString(),pos:{left:'2%',top:'15%'},color:'#6BCB77'},
                {label:'Expenses',val:'$'+totalExpenses.toLocaleString(),pos:{right:'2%',top:'15%'},color:'#ff6b6b'},
                {label:'Per Day',val:'$'+perDay,pos:{left:'2%',bottom:'12%'},color:'rgba(255,255,255,0.7)'},
                {label:'Per Week',val:'$'+perWeek,pos:{right:'2%',bottom:'12%'},color:'rgba(255,255,255,0.7)'},
              ].map((s,i)=>(
                <div key={i} style={{ position:'absolute', textAlign:'center', ...s.pos }}>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.38)', fontWeight:700, marginBottom:2 }}>{s.label}</div>
                  <div style={{ fontSize:24, fontWeight:900, color:s.color, lineHeight:1 }}>{s.val}</div>
                </div>
              ))}
              <div onClick={e=>addPop(e.clientX,e.clientY,'$'+(budget||490)+'!')} style={{
                position:'relative', zIndex:20, width:180, height:180, borderRadius:'50%',
                background:'radial-gradient(circle at 28% 25%, #c2f5ff 0%, #44ccf2 18%, #1a80d8 46%, #0c3882 70%, #040e2a 100%)',
                boxShadow:'0 0 80px rgba(0,200,255,0.6), 0 0 160px rgba(0,150,255,0.28), inset 0 0 60px rgba(255,255,255,0.15)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                cursor:'pointer', animation:'orbPulse 3s ease-in-out infinite', userSelect:'none',
              }}>
                <div style={{ fontSize:9, color:'rgba(255,255,255,0.65)', fontWeight:700, letterSpacing:1.5, textTransform:'uppercase', marginBottom:4 }}>Food Budget</div>
                <div className="gloss-num" style={{ fontSize:42, fontWeight:900, color:'white', lineHeight:1, textShadow:'0 0 24px rgba(255,255,255,0.4)' }}>${budget||490}</div>
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.55)', fontWeight:700, marginTop:4 }}>
                  {incomeNum>0?foodOfIncome+'% of income':'Monthly'}
                </div>
              </div>
            </div>

            {/* Who budgeting */}
            <div style={g}>
              <div style={lbl}>Who are you budgeting for?</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {[{id:'individual',label:'Just Me',sub:'Individual plan'},{id:'family',label:'Family',sub:'2+ people'}].map(m=>(
                  <button key={m.id} onClick={()=>{
                    setMode(m.id as any)
                    if(m.id==='individual') setProfile({householdSize:1})
                    else if(profile.householdSize<2) setProfile({householdSize:2})
                  }} style={{
                    padding:'10px 8px', borderRadius:12, cursor:'pointer',
                    border:'1px solid '+(mode===m.id?'rgba(107,203,119,0.45)':'rgba(255,255,255,0.1)'),
                    background:mode===m.id?'rgba(107,203,119,0.12)':'rgba(255,255,255,0.03)',
                    fontFamily:'Nunito,sans-serif', textAlign:'center',
                  }}>
                    <div style={{ fontSize:12, fontWeight:900, color:mode===m.id?'#6BCB77':'rgba(255,255,255,0.7)' }}>{m.label}</div>
                    <div style={{ fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700, marginTop:2 }}>{m.sub}</div>
                  </button>
                ))}
              </div>
              {mode==='family' && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginTop:10 }}>
                  {[2,3,4,5,6,7,8,9,10].map(n=>(
                    <button key={n} onClick={()=>setProfile({householdSize:n})} style={{
                      width:30, height:30, borderRadius:8, fontSize:12, fontWeight:800,
                      border:'1px solid '+(profile.householdSize===n?'var(--p)':'rgba(255,255,255,0.12)'),
                      background:profile.householdSize===n?'rgba(107,203,119,0.2)':'transparent',
                      color:profile.householdSize===n?'var(--p)':'rgba(255,255,255,0.45)',
                      cursor:'pointer', fontFamily:'Nunito,sans-serif',
                    }}>{n}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Fitness goal */}
            <div style={g}>
              <div style={lbl}>Fitness Goal</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:10 }}>
                {GOALS.map(gl=>(
                  <button key={gl.id} onClick={()=>setProfile({fitnessGoal:gl.id})} style={{
                    padding:'5px 13px', borderRadius:20, fontSize:11, fontWeight:800,
                    border:'1px solid '+(profile.fitnessGoal===gl.id?'var(--p)':'rgba(255,255,255,0.13)'),
                    background:profile.fitnessGoal===gl.id?'rgba(107,203,119,0.18)':'transparent',
                    color:profile.fitnessGoal===gl.id?'var(--p)':'rgba(255,255,255,0.4)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif',
                  }}>{gl.label}</button>
                ))}
              </div>
              <div style={{ padding:'9px 12px', background:'rgba(107,203,119,0.07)', borderRadius:10, fontSize:11, fontWeight:700, color:'rgba(107,203,119,0.8)', lineHeight:1.5 }}>
                {GOALS.find(gl=>gl.id===(profile.fitnessGoal||'balanced'))?.desc}
              </div>
            </div>

            {/* Allergy + Store */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div style={g}>
                <div style={lbl}>Allergy & Dye Filters</div>
                <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:7 }}>Allergens</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:11 }}>
                  {ALLERGENS.map(a => {
                    const key = a.toLowerCase()
                    const on  = profile.allergies.includes(key)
                    return (
                      <button key={a} onClick={()=>toggle('allergies',key)} style={{
                        padding:'4px 10px', borderRadius:14, fontSize:11, fontWeight:800,
                        border:'1px solid '+(on?'rgba(255,107,107,0.6)':'rgba(255,255,255,0.14)'),
                        background:on?'rgba(255,107,107,0.18)':'rgba(255,255,255,0.04)',
                        color:on?'#ff8fab':'rgba(255,255,255,0.5)',
                        cursor:'pointer', fontFamily:'Nunito,sans-serif',
                        boxShadow:on?'0 0 8px rgba(255,107,107,0.3)':'none',
                        transition:'all 0.18s',
                      }}>{a}</button>
                    )
                  })}
                </div>
                <div style={{ fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:7 }}>Synthetic Dyes</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {DYES.map(d => {
                    const key = d.toLowerCase().replace(/\s/g,'_').replace(/#/g,'')
                    const on  = profile.dyeFilters.includes(key)
                    return (
                      <button key={d} onClick={()=>toggle('dyeFilters',key)} style={{
                        padding:'3px 9px', borderRadius:12, fontSize:10, fontWeight:800,
                        border:'1px solid '+(on?'rgba(255,230,109,0.55)':'rgba(255,255,255,0.12)'),
                        background:on?'rgba(255,230,109,0.14)':'transparent',
                        color:on?'#FFE66D':'rgba(255,255,255,0.38)',
                        cursor:'pointer', fontFamily:'Nunito,sans-serif',
                      }}>{d}</button>
                    )
                  })}
                </div>
              </div>

              <div style={g}>
                <div style={lbl}>Store Deal Tracking</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                  {STORES.map(s => {
                    const on = profile.preferredStores.includes(s.slug)
                    return (
                      <button key={s.slug} onClick={()=>toggleStore(s.slug)} style={{
                        padding:'4px 10px', borderRadius:12, fontSize:10, fontWeight:800,
                        border:'1px solid '+(on?'var(--s)':'rgba(255,255,255,0.12)'),
                        background:on?'rgba(78,205,196,0.15)':'transparent',
                        color:on?'var(--s)':'rgba(255,255,255,0.35)',
                        cursor:'pointer', fontFamily:'Nunito,sans-serif',
                      }}>{s.label}</button>
                    )
                  })}
                </div>
                {dealSavings > 0 && (
                  <div style={{ marginTop:12, padding:'9px 12px', borderRadius:10, background:'rgba(78,205,196,0.08)', border:'1px solid rgba(78,205,196,0.18)', fontSize:11, fontWeight:700, color:'rgba(78,205,196,0.8)' }}>
                    Potential savings: ${dealSavings}/mo with active stores
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ChatWidget context="budget" />
      </div>
    </div>
  )
}
