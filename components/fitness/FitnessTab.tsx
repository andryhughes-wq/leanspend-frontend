'use client'
import { useState, useRef } from 'react'
import { useAppStore } from '@/store/appStore'
import { RealisticBubble } from '@/components/layout/RealisticBubble'
import { ChatWidget } from '@/components/chat/ChatWidget'

const FOOD_DB = {
  'Chicken Breast (100g)':{cal:165,protein:31,carbs:0,fat:3.6,fiber:0},
  'Salmon (100g)':{cal:208,protein:20,carbs:0,fat:13,fiber:0},
  'Eggs (1 large)':{cal:72,protein:6,carbs:0.4,fat:5,fiber:0},
  'Greek Yogurt (100g)':{cal:59,protein:10,carbs:3.6,fat:0.4,fiber:0},
  'Brown Rice (100g cooked)':{cal:216,protein:5,carbs:45,fat:1.8,fiber:3.5},
  'Oats (100g dry)':{cal:389,protein:17,carbs:66,fat:7,fiber:10},
  'Sweet Potato (100g)':{cal:86,protein:1.6,carbs:20,fat:0.1,fiber:3},
  'Broccoli (100g)':{cal:34,protein:2.8,carbs:7,fat:0.4,fiber:2.6},
  'Banana (1 medium)':{cal:105,protein:1.3,carbs:27,fat:0.4,fiber:3.1},
  'Almonds (30g)':{cal:174,protein:6,carbs:6,fat:15,fiber:3.5},
  'Lentils (100g cooked)':{cal:116,protein:9,carbs:20,fat:0.4,fiber:8},
  'Canned Tuna (100g)':{cal:116,protein:26,carbs:0,fat:1,fiber:0},
  'Cottage Cheese (100g)':{cal:98,protein:11,carbs:3.4,fat:4.3,fiber:0},
  'Spinach (100g)':{cal:23,protein:2.9,carbs:3.6,fat:0.4,fiber:2.2},
  'Black Beans (100g cooked)':{cal:132,protein:8.9,carbs:24,fat:0.5,fiber:8.7},
  'Avocado (100g)':{cal:160,protein:2,carbs:9,fat:15,fiber:7},
  'Apple (1 medium)':{cal:95,protein:0.5,carbs:25,fat:0.3,fiber:4.4},
  'Beef 85% lean (100g)':{cal:215,protein:26,carbs:0,fat:12,fiber:0},
}

const ACTIVITY_LEVELS = [
  {id:'sedentary',label:'Sedentary',sub:'Little/no exercise',multiplier:1.2},
  {id:'light',label:'Light',sub:'1-3 days/week',multiplier:1.375},
  {id:'moderate',label:'Moderate',sub:'3-5 days/week',multiplier:1.55},
  {id:'active',label:'Very Active',sub:'6-7 days/week',multiplier:1.725},
  {id:'extra',label:'Extra Active',sub:'Athlete/physical job',multiplier:1.9},
]

const MACRO_PRESETS = {
  'balanced':{protein:30,carbs:45,fat:25},
  'muscle-gain':{protein:40,carbs:40,fat:20},
  'weight-loss':{protein:35,carbs:35,fat:30},
  'endurance':{protein:25,carbs:55,fat:20},
  'plant-based':{protein:25,carbs:55,fat:20},
}

export function FitnessTab() {
  const { profile } = useAppStore()
  const [activeView, setActiveView] = useState('tracker')
  const [search, setSearch] = useState('')
  const [log, setLog] = useState([])
  const [selectedMeal, setSelectedMeal] = useState('breakfast')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('male')
  const [activityLevel, setActivityLevel] = useState('moderate')
  const [weightLog, setWeightLog] = useState([])
  const [weightEntry, setWeightEntry] = useState('')
  const [pops, setPops] = useState([])
  const popId = useRef(0)

  const addPop = (x, y) => {
    const id = ++popId.current
    setPops(p => [...p, {id, x, y}])
    setTimeout(() => setPops(p => p.filter(t => t.id !== id)), 900)
  }

  const fitnessGoal = profile.fitnessGoal || 'balanced'
  const macroPreset = MACRO_PRESETS[fitnessGoal] || MACRO_PRESETS['balanced']

  const calcTDEE = () => {
    const w = Number(weight), h = Number(height), a = Number(age)
    if (!w || !h || !a) return 0
    const bmr = gender === 'male'
      ? 88.362 + (13.397 * w) + (4.799 * h) - (5.677 * a)
      : 447.593 + (9.247 * w) + (3.098 * h) - (4.330 * a)
    const mult = ACTIVITY_LEVELS.find(al => al.id === activityLevel)?.multiplier || 1.55
    return Math.round(bmr * mult)
  }

  const tdee = calcTDEE()
  const goalCalories = fitnessGoal === 'weight-loss' ? Math.round(tdee * 0.8) : fitnessGoal === 'muscle-gain' ? Math.round(tdee * 1.1) : tdee || 2000
  const goalProtein = Math.round((goalCalories * (macroPreset.protein / 100)) / 4)
  const goalCarbs = Math.round((goalCalories * (macroPreset.carbs / 100)) / 4)
  const goalFat = Math.round((goalCalories * (macroPreset.fat / 100)) / 9)

  const totals = log.reduce((acc, e) => {
    const food = FOOD_DB[e.food]
    if (!food) return acc
    return {
      cal: acc.cal + food.cal * e.quantity,
      protein: acc.protein + food.protein * e.quantity,
      carbs: acc.carbs + food.carbs * e.quantity,
      fat: acc.fat + food.fat * e.quantity,
      fiber: acc.fiber + food.fiber * e.quantity,
    }
  }, {cal:0, protein:0, carbs:0, fat:0, fiber:0})

  const addFood = (foodName) => {
    setLog(prev => [...prev, {id: Date.now().toString(), food: foodName, quantity: 1, meal: selectedMeal}])
    setSearch('')
  }
  const removeFood = (id) => setLog(prev => prev.filter(e => e.id !== id))
  const updateQty = (id, qty) => setLog(prev => prev.map(e => e.id === id ? {...e, quantity: qty} : e))
  const filteredFoods = Object.keys(FOOD_DB).filter(f => f.toLowerCase().includes(search.toLowerCase())).slice(0, 8)

  const g = {
    background: 'rgba(255,255,255,0.055)',
    backdropFilter: 'blur(22px)',
    WebkitBackdropFilter: 'blur(22px)',
    border: '1px solid rgba(255,255,255,0.11)',
    borderTop: '1px solid rgba(255,255,255,0.18)',
    borderRadius: 18,
  }

  const MacroRing = ({label, current, goal, color, unit = 'g'}) => {
    const pct = goal > 0 ? Math.min(100, Math.round((current / goal) * 100)) : 0
    const over = current > goal
    return (
      <div style={{textAlign:'center'}}>
        <div style={{position:'relative', width:72, height:72, margin:'0 auto 6px'}}>
          <svg width={72} height={72} style={{transform:'rotate(-90deg)'}}>
            <circle cx={36} cy={36} r={28} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={5}/>
            <circle cx={36} cy={36} r={28} fill="none" stroke={over ? '#ff6b6b' : color} strokeWidth={5}
              strokeDasharray={`${Math.PI*56*pct/100} ${Math.PI*56*(1-pct/100)}`}
              strokeLinecap="round"/>
          </svg>
          <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center'}}>
            <div style={{fontSize:12, fontWeight:900, color: over ? '#ff6b6b' : color}}>{pct}%</div>
          </div>
        </div>
        <div style={{fontSize:10, fontWeight:900, color:'white'}}>{label}</div>
        <div style={{fontSize:9, color:'rgba(255,255,255,0.4)', fontWeight:700, marginTop:1}}>
          {Math.round(current)}{unit}/{goal}{unit}
        </div>
      </div>
    )
  }

  return (
    <div style={{position:'relative', padding:'0 28px 36px'}}>
      {[
        {size:30, style:{position:'fixed', left:'4%', top:'25%', animationDelay:'0s'}, color:'teal'},
        {size:18, style:{position:'fixed', left:'91%', top:'20%', animationDelay:'1.2s'}, color:'default'},
      ].map((b, i) => (
        <RealisticBubble key={i} size={b.size} color={b.color} style={{...b.style, zIndex:3}} onPop={addPop}/>
      ))}
      {pops.map(p => (
        <div key={p.id} style={{position:'fixed', left:p.x-16, top:p.y-40, pointerEvents:'none', zIndex:9999,
          color:'#6BCB77', fontWeight:900, fontSize:18, fontFamily:'Nunito,sans-serif',
          animation:'floatUp 0.9s ease-out forwards'}}>Pop!</div>
      ))}

      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 0 24px'}}>
        <div style={{fontSize:17, fontWeight:700, color:'rgba(255,255,255,0.5)'}}>Fitness Tracker</div>
        <div style={{display:'flex', gap:8}}>
          {['tracker', 'calculator', 'progress'].map(v => (
            <button key={v} onClick={() => setActiveView(v)} style={{
              padding:'7px 18px', borderRadius:22, fontSize:12, fontWeight:800,
              border:'1px solid '+(activeView===v?'rgba(107,203,119,0.5)':'rgba(255,255,255,0.12)'),
              background:activeView===v?'rgba(107,203,119,0.15)':'transparent',
              color:activeView===v?'#6BCB77':'rgba(255,255,255,0.45)',
              cursor:'pointer', fontFamily:'Nunito,sans-serif',
            }}>
              {v === 'tracker' ? 'Daily Log' : v === 'calculator' ? 'TDEE Calc' : 'Progress'}
            </button>
          ))}
        </div>
      </div>

      {activeView === 'tracker' && (
        <div className="animate-tab-in" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            <div style={{...g, padding:20}}>
              <div style={{fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:14}}>
                Today's Macros
              </div>
              <div style={{display:'flex', justifyContent:'space-around'}}>
                <MacroRing label="Calories" current={totals.cal} goal={goalCalories} color="#FFE66D" unit=""/>
                <MacroRing label="Protein" current={totals.protein} goal={goalProtein} color="#ff6b6b"/>
                <MacroRing label="Carbs" current={totals.carbs} goal={goalCarbs} color="#4ECDC4"/>
                <MacroRing label="Fat" current={totals.fat} goal={goalFat} color="#A78BFA"/>
                <MacroRing label="Fiber" current={totals.fiber} goal={30} color="#6BCB77"/>
              </div>
            </div>
            <div style={{...g, padding:18}}>
              <div style={{fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:12}}>
                Log Food
              </div>
              <div style={{display:'flex', gap:6, marginBottom:12, flexWrap:'wrap'}}>
                {['breakfast', 'lunch', 'dinner', 'snack'].map(m => (
                  <button key={m} onClick={() => setSelectedMeal(m)} style={{
                    padding:'5px 12px', borderRadius:14, fontSize:11, fontWeight:800,
                    border:'1px solid '+(selectedMeal===m?'rgba(107,203,119,0.5)':'rgba(255,255,255,0.12)'),
                    background:selectedMeal===m?'rgba(107,203,119,0.15)':'transparent',
                    color:selectedMeal===m?'#6BCB77':'rgba(255,255,255,0.45)',
                    cursor:'pointer', fontFamily:'Nunito,sans-serif', textTransform:'capitalize',
                  }}>{m}</button>
                ))}
              </div>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search foods to log..."
                style={{width:'100%', padding:'9px 14px', borderRadius:12,
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                  color:'white', fontSize:12, fontWeight:700, outline:'none',
                  fontFamily:'Nunito,sans-serif', marginBottom: search ? 8 : 0}}/>
              {search && filteredFoods.map(f => (
                <button key={f} onClick={() => addFood(f)} style={{
                  width:'100%', padding:'8px 12px', borderRadius:10, textAlign:'left',
                  cursor:'pointer', background:'rgba(255,255,255,0.04)',
                  border:'1px solid rgba(255,255,255,0.08)',
                  fontFamily:'Nunito,sans-serif', display:'flex',
                  justifyContent:'space-between', marginBottom:4,
                }}>
                  <span style={{fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.8)'}}>{f}</span>
                  <span style={{fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)'}}>{FOOD_DB[f].cal}cal</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{...g, padding:18}}>
            <div style={{fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:14}}>
              Today's Log ({log.length} items)
            </div>
            {log.length === 0 ? (
              <div style={{textAlign:'center', padding:'32px 0', color:'rgba(255,255,255,0.25)', fontSize:12, fontWeight:700}}>
                Search and add foods above to start tracking
              </div>
            ) : (
              <div style={{display:'flex', flexDirection:'column', gap:6}}>
                {log.map(entry => {
                  const food = FOOD_DB[entry.food]
                  return (
                    <div key={entry.id} style={{display:'flex', alignItems:'center', gap:8,
                      padding:'8px 10px', borderRadius:10,
                      background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                      <div style={{flex:1, minWidth:0}}>
                        <div style={{fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.8)',
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{entry.food}</div>
                        {food && <div style={{fontSize:9, color:'rgba(255,255,255,0.35)', fontWeight:700, marginTop:1}}>
                          {Math.round(food.cal*entry.quantity)}cal | {Math.round(food.protein*entry.quantity)}g P | {Math.round(food.carbs*entry.quantity)}g C
                        </div>}
                      </div>
                      <input type="number" value={entry.quantity} min={0.25} step={0.25}
                        onChange={e => updateQty(entry.id, Number(e.target.value))}
                        style={{width:40, padding:'4px 6px', borderRadius:8, textAlign:'center',
                          background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)',
                          color:'white', fontSize:11, fontWeight:800, outline:'none', fontFamily:'Nunito,sans-serif'}}/>
                      <button onClick={() => removeFood(entry.id)} style={{
                        width:20, height:20, borderRadius:'50%',
                        border:'1px solid rgba(255,100,100,0.3)', background:'transparent',
                        color:'rgba(255,100,100,0.6)', fontSize:12, cursor:'pointer',
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontFamily:'Nunito,sans-serif', flexShrink:0}}>x</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'calculator' && (
        <div className="animate-tab-in" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
          <div style={{...g, padding:22}}>
            <div style={{fontSize:14, fontWeight:900, color:'white', marginBottom:16}}>TDEE Calculator</div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:14}}>
              {[
                {label:'Weight (kg)', val:weight, set:setWeight, ph:'70'},
                {label:'Height (cm)', val:height, set:setHeight, ph:'175'},
                {label:'Age', val:age, set:setAge, ph:'28'},
              ].map(f => (
                <div key={f.label}>
                  <div style={{fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)',
                    textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5}}>{f.label}</div>
                  <input type="number" value={f.val} onChange={e => f.set(e.target.value)}
                    placeholder={f.ph} style={{width:'100%', padding:'9px 12px', borderRadius:10,
                      background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                      color:'white', fontSize:13, fontWeight:700, outline:'none', fontFamily:'Nunito,sans-serif'}}/>
                </div>
              ))}
              <div>
                <div style={{fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)',
                  textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:5}}>Gender</div>
                <div style={{display:'flex', gap:6}}>
                  {['male', 'female'].map(g => (
                    <button key={g} onClick={() => setGender(g)} style={{
                      flex:1, padding:'9px 4px', borderRadius:10, fontSize:11, fontWeight:800,
                      border:'1px solid '+(gender===g?'rgba(107,203,119,0.5)':'rgba(255,255,255,0.12)'),
                      background:gender===g?'rgba(107,203,119,0.15)':'transparent',
                      color:gender===g?'#6BCB77':'rgba(255,255,255,0.45)',
                      cursor:'pointer', fontFamily:'Nunito,sans-serif', textTransform:'capitalize',
                    }}>{g}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{fontSize:10, fontWeight:800, color:'rgba(255,255,255,0.4)',
              textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:8}}>Activity Level</div>
            {ACTIVITY_LEVELS.map(al => (
              <button key={al.id} onClick={() => setActivityLevel(al.id)} style={{
                width:'100%', padding:'9px 14px', borderRadius:10, textAlign:'left',
                cursor:'pointer', marginBottom:6,
                border:'1px solid '+(activityLevel===al.id?'rgba(107,203,119,0.45)':'rgba(255,255,255,0.08)'),
                background:activityLevel===al.id?'rgba(107,203,119,0.12)':'rgba(255,255,255,0.03)',
                fontFamily:'Nunito,sans-serif', display:'flex',
                justifyContent:'space-between', alignItems:'center',
              }}>
                <div>
                  <div style={{fontSize:12, fontWeight:800, color:activityLevel===al.id?'#6BCB77':'rgba(255,255,255,0.75)'}}>{al.label}</div>
                  <div style={{fontSize:10, color:'rgba(255,255,255,0.35)', fontWeight:700}}>{al.sub}</div>
                </div>
                <div style={{fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.3)'}}>x{al.multiplier}</div>
              </button>
            ))}
          </div>
          <div style={{display:'flex', flexDirection:'column', gap:14}}>
            {tdee > 0 ? (
              <div style={{...g, padding:22}}>
                <div style={{fontSize:11, fontWeight:800, color:'rgba(255,255,255,0.4)',
                  textTransform:'uppercase', letterSpacing:'0.6px', marginBottom:14}}>Your Results</div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
                  {[
                    {label:'Maintenance', cal:tdee, color:'#4ECDC4'},
                    {label:'Weight Loss', cal:Math.round(tdee*0.8), color:'#6BCB77'},
                    {label:'Muscle Gain', cal:Math.round(tdee*1.1), color:'#A78BFA'},
                    {label:'Your Goal', cal:goalCalories, color:'#FFE66D'},
                  ].map(r => (
                    <div key={r.label} style={{padding:'14px 16px', borderRadius:14,
                      background:`${r.color}12`, border:`1px solid ${r.color}28`, textAlign:'center'}}>
                      <div style={{fontSize:10, fontWeight:800, color:`${r.color}aa`,
                        textTransform:'uppercase', marginBottom:4}}>{r.label}</div>
                      <div style={{fontSize:26, fontWeight:900, color:r.color, lineHeight:1}}>{r.cal}</div>
                      <div style={{fontSize:9, color:'rgba(255,255,255,0.3)', fontWeight:700, marginTop:3}}>cal/day</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div style={{...g, padding:32, textAlign:'center'}}>
                <div style={{fontSize:13, color:'rgba(255,255,255,0.4)', fontWeight:700}}>
                  Fill in your stats to calculate daily calorie needs
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeView === 'progress' && (
        <div className="animate-tab-in" style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20}}>
          <div style={{...g, padding:20}}>
            <div style={{fontSize:13, fontWeight:900, color:'white', marginBottom:14}}>Weight Log</div>
            <div style={{display:'flex', gap:8, marginBottom:14}}>
              <input type="number" value={weightEntry} onChange={e => setWeightEntry(e.target.value)}
                placeholder="Weight in kg..."
                style={{flex:1, padding:'8px 12px', borderRadius:10,
                  background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
                  color:'white', fontSize:12, fontWeight:700, outline:'none', fontFamily:'Nunito,sans-serif'}}/>
              <button onClick={() => {
                if (!weightEntry) return
                setWeightLog(prev => [...prev, {date: new Date().toLocaleDateString(), weight: Number(weightEntry)}])
                setWeightEntry('')
              }} style={{padding:'8px 16px', borderRadius:10, background:'var(--p)',
                border:'none', color:'white', fontSize:12, fontWeight:800,
                cursor:'pointer', fontFamily:'Nunito,sans-serif'}}>Log</button>
            </div>
            {weightLog.length === 0 ? (
              <div style={{textAlign:'center', padding:'24px 0', color:'rgba(255,255,255,0.25)', fontSize:11, fontWeight:700}}>
                Log your weight daily to track progress
              </div>
            ) : (
              [...weightLog].reverse().slice(0, 10).map((entry, i) => (
                <div key={i} style={{display:'flex', justifyContent:'space-between',
                  padding:'8px 12px', borderRadius:10,
                  background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', marginBottom:5}}>
                  <span style={{fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.6)'}}>{entry.date}</span>
                  <span style={{fontSize:13, fontWeight:900, color:'#6BCB77'}}>{entry.weight} kg</span>
                </div>
              ))
            )}
          </div>
          <div style={{...g, padding:20}}>
            <div style={{fontSize:13, fontWeight:900, color:'white', marginBottom:14}}>Today's Progress</div>
            {[
              {label:'Calories', current:Math.round(totals.cal), goal:goalCalories, color:'#FFE66D'},
              {label:'Protein', current:Math.round(totals.protein), goal:goalProtein, color:'#ff6b6b'},
              {label:'Carbs', current:Math.round(totals.carbs), goal:goalCarbs, color:'#4ECDC4'},
              {label:'Fat', current:Math.round(totals.fat), goal:goalFat, color:'#A78BFA'},
              {label:'Fiber', current:Math.round(totals.fiber), goal:30, color:'#6BCB77'},
            ].map(item => {
              const pct = item.goal > 0 ? Math.min(100, Math.round((item.current/item.goal)*100)) : 0
              const over = item.current > item.goal
              return (
                <div key={item.label} style={{marginBottom:12}}>
                  <div style={{display:'flex', justifyContent:'space-between',
                    fontSize:11, fontWeight:800, marginBottom:5}}>
                    <span style={{color:'rgba(255,255,255,0.6)'}}>{item.label}</span>
                    <span style={{color:over?'#ff6b6b':item.color}}>{item.current}/{item.goal}</span>
                  </div>
                  <div style={{height:6, background:'rgba(255,255,255,0.07)', borderRadius:3, overflow:'hidden'}}>
                    <div style={{height:'100%', width:`${pct}%`,
                      background:over?'#ff6b6b':item.color, borderRadius:3, transition:'width 0.5s'}}/>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div style={{marginTop:24}}><ChatWidget context="budget"/></div>
    </div>
  )
}
