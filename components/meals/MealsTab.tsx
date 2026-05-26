'use client'
import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { format, parseISO, addWeeks, startOfWeek } from 'date-fns'
import toast from 'react-hot-toast'
import { mealsApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'

const MEAL_ICONS: Record<string,string> = { breakfast:'', lunch:'', dinner:'', snack:'' }

const PRESET_DESCRIPTIONS: Record<string,{icon:string,desc:string}> = {
  'muscle-gain':  { icon:'', desc:'High protein 140g+/day  eggs, chicken, Greek yogurt' },
  'weight-loss':  { icon:'', desc:'Low calorie 1,400/day  lean protein, high fiber veg' },
  'endurance':    { icon:'', desc:'High carb fuel  oats, sweet potato, brown rice, bananas' },
  'balanced':     { icon:'', desc:'2,000 cal/day  balanced macros, whole foods' },
  'plant-based':  { icon:'', desc:'No meat/dairy  beans, lentils, tofu, tempeh' },
}

export function MealsTab() {
  const { profile, mealPlan, setMealPlan } = useAppStore()
  const now = new Date()

  // Week navigation
  const [weekOffset, setWeekOffset]   = useState(0)
  const [customFood, setCustomFood]   = useState('')
  const [addedMeals, setAddedMeals]   = useState<any[]>([])
  const [showPresets, setShowPresets] = useState(false)
  const [activeDay, setActiveDay]     = useState<string|null>(null)

  const weekStart = format(addWeeks(startOfWeek(now, { weekStartsOn: 1 }), weekOffset), 'yyyy-MM-dd')
  const weekLabel = format(parseISO(weekStart), 'MMM d') + '  ' + format(addWeeks(parseISO(weekStart), 1), 'MMM d, yyyy')

  // Fetch presets
  const { data: presets } = useQuery({ queryKey:['presets'], queryFn: mealsApi.getPresets })

  // Generate weekly plan
  const { mutate: generate, isPending } = useMutation({
    mutationFn: () => mealsApi.generateWeek({
      foodBudget:      profile.foodBudget,
      allergies:       profile.allergies,
      dyeFilters:      profile.dyeFilters,
      preferredStores: profile.preferredStores,
      householdSize:   profile.householdSize,
      fitnessGoal:     profile.fitnessGoal,
      weekStartDate:   weekStart,
      customFoods:     addedMeals.map(m => m.food),
    }),
    onSuccess: d => { setMealPlan({ ...mealPlan, [weekStart]: d.plan }); toast.success('Week generated! ') },
    onError:  (e:Error) => toast.error(e.message),
  })

  // Add custom food
  const { mutate: addFood, isPending: addingFood } = useMutation({
    mutationFn: () => mealsApi.addFood({
      existingPlan: currentWeekPlan || { fitnessGoal: profile.fitnessGoal },
      foodItem: customFood,
    }),
    onSuccess: d => {
      setAddedMeals(prev => [...prev, { food: customFood, suggestion: d }])
      toast.success(`${customFood} added to your plan! `)
      setCustomFood('')
    },
    onError: (e:Error) => toast.error(e.message),
  })

  const currentWeekPlan = mealPlan?.[weekStart]
  const days = currentWeekPlan?.days || []
  const goalInfo = PRESET_DESCRIPTIONS[profile.fitnessGoal || 'balanced']

  if (!profile.foodBudget && !currentWeekPlan) return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', padding:'60px 20px', textAlign:'center', gap:12 }}>
      <div style={{ fontSize:60 }}></div>
      <div className="font-display" style={{ fontSize:24 }}>Set Your Budget First</div>
      <p style={{ color:'var(--muted)', fontWeight:700, maxWidth:280 }}>Go to the Budget tab and enter your monthly income to get started!</p>
    </div>
  )

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* Week Navigator */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', background:'var(--card)', border:'2px solid var(--border)', borderRadius:16, padding:'12px 16px' }}>
        <button onClick={()=>setWeekOffset(o=>o-1)}
          style={{ background:'var(--p-light)', border:'none', borderRadius:10, padding:'6px 12px', fontSize:16, cursor:'pointer', fontWeight:800 }}></button>
        <div style={{ textAlign:'center' }}>
          <div style={{ fontSize:13, fontWeight:900, color:'var(--text)' }}> Week of {weekLabel}</div>
          <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>
            Weekly budget: ${profile.foodBudget ? (profile.foodBudget/4).toFixed(0) : ''}
            {profile.householdSize > 1 ? `  ${profile.householdSize} people` : ''}
          </div>
        </div>
        <button onClick={()=>setWeekOffset(o=>o+1)}
          style={{ background:'var(--p-light)', border:'none', borderRadius:10, padding:'6px 12px', fontSize:16, cursor:'pointer', fontWeight:800 }}></button>
      </div>

      {/* Goal badge */}
      <div style={{ background:'var(--p)', borderRadius:16, padding:'13px 16px', color:'#fff', display:'flex', alignItems:'center', gap:10 }}>
        <span style={{ fontSize:28 }}>{goalInfo?.icon}</span>
        <div>
          <div style={{ fontSize:14, fontWeight:900 }}>{currentWeekPlan ? ' Week Plan Ready!' : 'Generate This Week'}</div>
          <div style={{ fontSize:11, opacity:0.85, fontWeight:700 }}>{goalInfo?.desc}</div>
        </div>
        {currentWeekPlan && (
          <div style={{ marginLeft:'auto', textAlign:'right' }}>
            <div className="font-display" style={{ fontSize:18 }}>${currentWeekPlan.totalEstimatedCost}</div>
            <div style={{ fontSize:10, opacity:0.8 }}>this week</div>
          </div>
        )}
      </div>

      {/* Stats row */}
      {currentWeekPlan && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8 }}>
          {[
            { ico:'', val:`$${currentWeekPlan.totalEstimatedCost}`,  label:'week total' },
            { ico:'', val:`$${currentWeekPlan.totalSavings}`,         label:'saved' },
            { ico:'', val:`${currentWeekPlan.avgDailyProteinG}g`,    label:'protein/day' },
          ].map(s=>(
            <div key={s.label} className="card" style={{ padding:12, textAlign:'center' }}>
              <div style={{ fontSize:22, marginBottom:3 }}>{s.ico}</div>
              <div className="font-display" style={{ fontSize:18 }}>{s.val}</div>
              <div style={{ fontSize:10, fontWeight:800, color:'var(--muted)', textTransform:'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Generate button */}
      <button className="btn-primary" onClick={()=>generate()} disabled={isPending}
        style={{ width:'100%', padding:15, fontSize:14 }}>
        {isPending ? ' Generating... (2040 sec)' : currentWeekPlan ? ' Regenerate This Week' : ' Generate This Week\'s Meals'}
      </button>

      {/* Preset Plans */}
      <div className="card" style={{ padding:14 }}>
        <button onClick={()=>setShowPresets(o=>!o)}
          style={{ width:'100%', background:'none', border:'none', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', fontFamily:'Nunito,sans-serif' }}>
          <div style={{ fontSize:14, fontWeight:900, color:'var(--text)' }}> Preset Meal Plans</div>
          <span style={{ fontSize:13, color:'var(--muted)', transition:'transform 0.2s', display:'inline-block', transform:showPresets?'rotate(180deg)':'none' }}></span>
        </button>
        {showPresets && (
          <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8 }}>
            <p style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginBottom:4 }}>
              Tap a preset to instantly load a sample day for your goal  no generation needed!
            </p>
            {Object.entries(PRESET_DESCRIPTIONS).map(([goal, info])=>(
              <div key={goal} className="card-hover" style={{ padding:'12px 14px', cursor:'pointer' }}
                onClick={()=>{
                  mealsApi.getPreset(goal).then(preset=>{
                    const today = new Date().toISOString().split('T')[0]
                    setMealPlan({ ...mealPlan, [weekStart]: {
                      days:[{ date:today, totalCost: preset.meals.reduce((a:number,m:any)=>a+m.cost,0), meals:preset.meals }],
                      totalEstimatedCost: preset.meals.reduce((a:number,m:any)=>a+m.cost,0) * 7,
                      totalSavings:0, avgDailyProteinG:0, avgDailyCalories:0,
                      fitnessGoal:goal, preset:true, name:preset.name,
                    }})
                    toast.success(`Loaded ${preset.name} preset! `)
                    setShowPresets(false)
                  }).catch(()=>toast.error('Could not load preset'))
                }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:26 }}>{info.icon}</span>
                  <div>
                    <div style={{ fontSize:13, fontWeight:900, color:'var(--text)' }}>
                      {goal.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' ')}
                      {profile.fitnessGoal===goal && <span style={{ marginLeft:6, fontSize:9, background:'var(--p)', color:'#fff', borderRadius:20, padding:'2px 7px' }}>YOUR GOAL</span>}
                    </div>
                    <div style={{ fontSize:11, color:'var(--muted)', fontWeight:700 }}>{info.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Food Input */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ fontSize:14, fontWeight:900, marginBottom:10, color:'var(--text)' }}> Add a Food to Your Plan</div>
        <p style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginBottom:10 }}>
          Type any food or ingredient  AI will work it into your plan!
        </p>
        <div style={{ display:'flex', gap:8 }}>
          <input
            value={customFood}
            onChange={e=>setCustomFood(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&customFood&&addFood()}
            placeholder="e.g. salmon, sweet potato, kale..."
            style={{ flex:1, padding:'10px 14px', border:'2px solid var(--border)', borderRadius:12, fontSize:13, fontWeight:700, background:'var(--bg)', color:'var(--text)', outline:'none', fontFamily:'Nunito,sans-serif' }}
          />
          <button className="btn-primary" onClick={()=>customFood&&addFood()} disabled={!customFood||addingFood}
            style={{ padding:'10px 16px', whiteSpace:'nowrap' }}>
            {addingFood ? '' : 'Add '}
          </button>
        </div>

        {/* Added foods */}
        {addedMeals.length > 0 && (
          <div style={{ marginTop:12 }}>
            <div style={{ fontSize:11, fontWeight:800, color:'var(--muted)', textTransform:'uppercase', marginBottom:6 }}>Added foods</div>
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {addedMeals.map((m,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'center', gap:5, background:'var(--p-light)', border:'1.5px solid var(--p)', borderRadius:20, padding:'4px 10px' }}>
                  <span style={{ fontSize:11, fontWeight:800, color:'var(--p-dark)' }}> {m.food}</span>
                  <button onClick={()=>setAddedMeals(prev=>prev.filter((_,j)=>j!==i))}
                    style={{ background:'none', border:'none', cursor:'pointer', fontSize:12, color:'var(--p-dark)', padding:0, lineHeight:1 }}></button>
                </div>
              ))}
            </div>
            {addedMeals.map((m,i)=>m.suggestion && (
              <div key={i} style={{ marginTop:8, padding:'10px 12px', background:'var(--s-light)', border:'1.5px solid var(--s)', borderRadius:12 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'var(--s-dark)' }}> {m.suggestion.suggestion}</div>
                {m.suggestion.nutritionNote && (
                  <div style={{ fontSize:11, color:'var(--muted)', marginTop:4, fontWeight:700 }}>{m.suggestion.nutritionNote}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Week days */}
      {days.map((day:any, i:number)=>(
        <div key={day.date||i} className="card" style={{ overflow:'hidden' }}>
          <div
            onClick={()=>setActiveDay(activeDay===day.date?null:day.date)}
            style={{ padding:'11px 16px', background:'var(--p-light)', display:'flex', justifyContent:'space-between', alignItems:'center', cursor:'pointer' }}>
            <div style={{ fontSize:13, fontWeight:900, color:'var(--p-dark)' }}>
               {day.date ? format(parseISO(day.date), 'EEEE, MMM d') : `Day ${i+1}`}
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--p)' }}>${Number(day.totalCost||0).toFixed(2)}</div>
              <span style={{ fontSize:12, color:'var(--muted)', transition:'transform 0.2s', display:'inline-block', transform:activeDay===day.date?'rotate(180deg)':'none' }}></span>
            </div>
          </div>
          {(activeDay===null||activeDay===day.date) && (day.meals||[]).map((meal:any, j:number)=>(
            <div key={j} style={{ padding:'9px 16px', display:'flex', alignItems:'center', gap:10, borderTop:'1.5px solid var(--border)' }}>
              <div style={{ fontSize:24, width:30, textAlign:'center', flexShrink:0 }}>{MEAL_ICONS[meal.type]||''}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:800, display:'flex', alignItems:'center', flexWrap:'wrap', gap:4 }}>
                  {meal.name}
                  {meal.usesDeals && <span style={{ fontSize:9, fontWeight:900, background:'var(--acc)', color:'#7A6300', padding:'2px 6px', borderRadius:20 }}>DEAL</span>}
                </div>
                {meal.description && <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700, marginTop:1 }}>{meal.description}</div>}
                <div style={{ fontSize:10, color:'var(--faint)', marginTop:1, fontWeight:700 }}>
                  {meal.calories} cal  {meal.proteinG}g protein
                </div>
              </div>
              <div style={{ fontSize:14, fontWeight:900 }}>${Number(meal.cost||0).toFixed(2)}</div>
            </div>
          ))}
        </div>
      ))}

      {/* Shopping list */}
      {currentWeekPlan?.shoppingList?.length > 0 && (
        <div className="card" style={{ padding:14 }}>
          <div style={{ fontSize:14, fontWeight:900, marginBottom:10, color:'var(--text)' }}> Weekly Shopping List</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
            {currentWeekPlan.shoppingList.map((item:any, i:number)=>(
              <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', background:item.onDeal?'var(--p-light)':'var(--bg)', border:`1.5px solid ${item.onDeal?'var(--p)':'var(--border)'}`, borderRadius:10 }}>
                {item.onDeal && <span style={{ fontSize:11 }}></span>}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:11, fontWeight:800, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.ingredient}</div>
                  <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>{item.qty}  ${item.estimatedCost}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
