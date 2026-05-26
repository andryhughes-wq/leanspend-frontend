'use client'
import { useState, useRef, useEffect } from 'react'
import { chatApi, mealsApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import toast from 'react-hot-toast'

interface Msg { role:'user'|'bot'; text:string; id:number; action?:any }

const GREETINGS: Record<string,string> = {
  budget:    "Hey! I'm LeanBot  I can help calculate your budget, suggest meals, or add foods to your plan. Try asking: 'Add salmon to my dinner' or 'Generate a muscle gain plan'!",
  tips:      " I'm your budget coach! Ask me: 'How do I cut my grocery bill?' or 'Best protein deals this week?'",
  nutrition: " Ask me anything about food! 'How much protein in chicken?' or 'Best foods for weight loss?'",
  meals:     " I can help manage your meal plan! Try: 'Add sweet potato to Tuesday dinner' or 'Generate a weight loss week' or 'Show me a plant-based plan'!",
  general:   "Hey! I'm LeanBot  your fitness budgeting AI! Ask about meals, deals, nutrition, or say 'add [food] to my plan'! ",
}

export function ChatWidget({ context='general' }: { context?:string }) {
  const [msgs, setMsgs]     = useState<Msg[]>([{ role:'bot', text:GREETINGS[context]||GREETINGS.general, id:0 }])
  const [input, setInput]   = useState('')
  const [typing, setTyping] = useState(false)
  const endRef              = useRef<HTMLDivElement>(null)
  const { profile, mealPlan, setMealPlan } = useAppStore()

  useEffect(()=>{ endRef.current?.scrollIntoView({ behavior:'smooth' }) }, [msgs, typing])

  const handleAction = async (action: { type:string; data:any }) => {
    if (action.type === 'ADD_FOOD') {
      try {
        const suggestion = await mealsApi.addFood({
          existingPlan: Object.values(mealPlan||{})[0] || { fitnessGoal: profile.fitnessGoal },
          foodItem: action.data.food,
          mealType: action.data.mealType,
        })
        toast.success(`${action.data.food} added to your plan! `)
        setMsgs(p => [...p, {
          role: 'bot',
          text: ` I've added **${action.data.food}** to your plan! ${suggestion?.suggestion || ''} ${suggestion?.nutritionNote || ''}`,
          id: Date.now() + 2,
        }])
      } catch { toast.error('Could not add food  try again') }
    }

    if (action.type === 'NEW_PLAN') {
      const weekStart = new Date().toISOString().split('T')[0]
      setMsgs(p => [...p, {
        role: 'bot',
        text: ` Generating a ${action.data.goal} meal plan for you now! Check the Meals tab in 20-30 seconds...`,
        id: Date.now() + 2,
      }])
      try {
        const resp = await mealsApi.generateWeek({
          foodBudget:      profile.foodBudget || 120,
          allergies:       profile.allergies,
          dyeFilters:      profile.dyeFilters,
          preferredStores: profile.preferredStores,
          householdSize:   profile.householdSize,
          fitnessGoal:     action.data.goal || profile.fitnessGoal,
          weekStartDate:   weekStart,
        })
        setMealPlan({ ...mealPlan, [weekStart]: resp.plan })
        toast.success('New meal plan ready in the Meals tab! ')
        setMsgs(p => [...p, {
          role: 'bot',
          text: ` Done! Your ${action.data.goal} meal plan is ready! Go to the  Meals tab to see all 7 days. Total cost: $${resp.plan?.totalEstimatedCost}`,
          id: Date.now() + 3,
        }])
      } catch (e:any) {
        toast.error('Plan generation failed  try again')
      }
    }
  }

  const send = async () => {
    const text = input.trim()
    if (!text || typing) return
    setInput('')
    setMsgs(p => [...p, { role:'user', text, id:Date.now() }])
    setTyping(true)
    try {
      const history = msgs.slice(-6).map(m => ({ role:m.role==='bot'?'assistant':'user', content:m.text }))
      const res = await chatApi.send(text, history, context, {
        monthlyIncome:   profile.monthlyIncome,
        foodBudget:      profile.foodBudget,
        fitnessGoal:     profile.fitnessGoal,
        householdSize:   profile.householdSize,
        preferredStores: profile.preferredStores,
      })

      const replyText = typeof res === 'string' ? res : (res.reply || 'Try asking about deals, meals, or nutrition! ')
      setMsgs(p => [...p, { role:'bot', text:replyText, id:Date.now()+1, action: res.action }])

      // Handle action from bot
      if (res.action) await handleAction(res.action)

    } catch {
      setMsgs(p => [...p, { role:'bot', text:"Give me a moment and try again! ", id:Date.now()+1 }])
    } finally {
      setTyping(false)
    }
  }

  return (
    <div className="card" style={{ overflow:'hidden' }}>
      <div style={{ background:'var(--pu)', padding:'11px 14px', display:'flex', alignItems:'center', gap:9 }}>
        <div style={{ width:32, height:32, borderRadius:'50%', background:'rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:17, flexShrink:0 }}></div>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:'#fff' }}>LeanBot AI</div>
          <div style={{ fontSize:10, color:'rgba(255,255,255,0.7)', fontWeight:700 }}>Can add foods & generate plans</div>
        </div>
        <div style={{ width:7, height:7, borderRadius:'50%', background:'var(--p)', marginLeft:'auto' }} className="animate-pulse-dot" />
      </div>

      <div style={{ height:150, overflowY:'auto', padding:12, background:'var(--bg)', display:'flex', flexDirection:'column', gap:8 }}>
        {msgs.map(m=>(
          <div key={m.id} style={{
            maxWidth:'85%', padding:'8px 11px', borderRadius:16, fontSize:11, lineHeight:1.5, fontWeight:700,
            background:   m.role==='user'?'var(--pu)':'var(--card)',
            color:        m.role==='user'?'#fff':'var(--text)',
            border:       m.role==='bot'?'1.5px solid var(--border)':'none',
            alignSelf:    m.role==='user'?'flex-end':'flex-start',
            borderBottomRightRadius: m.role==='user'?4:16,
            borderBottomLeftRadius:  m.role==='bot'?4:16,
          }}>{m.text}</div>
        ))}
        {typing && (
          <div style={{ alignSelf:'flex-start', background:'var(--card)', border:'1.5px solid var(--border)', borderRadius:16, borderBottomLeftRadius:4, padding:'10px 14px', display:'flex', gap:4 }}>
            {[0,1,2].map(i=>(
              <div key={i} style={{ width:7, height:7, borderRadius:'50%', background:'var(--faint)', animation:`pulseDot 1.2s ease-in-out ${i*0.2}s infinite` }}/>
            ))}
          </div>
        )}
        <div ref={endRef}/>
      </div>

      {/* Quick action chips */}
      <div style={{ padding:'6px 10px', display:'flex', gap:5, flexWrap:'wrap', borderTop:'1px solid var(--border)', background:'var(--bg)' }}>
        {['Add salmon ','Make it high protein ','Show me deals ','Plant-based week '].map(q=>(
          <button key={q} onClick={()=>{ setInput(q); setTimeout(()=>{ setInput(''); send() },100) }}
            style={{ fontSize:10, fontWeight:800, padding:'3px 9px', borderRadius:20, border:'1.5px solid var(--border)', background:'var(--card)', color:'var(--muted)', cursor:'pointer', fontFamily:'Nunito,sans-serif' }}>
            {q}
          </button>
        ))}
      </div>

      <div style={{ display:'flex', gap:6, padding:8, borderTop:'2px solid var(--border)', background:'var(--card)' }}>
        <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&send()}
          placeholder="Add a food, ask about deals, generate a plan..."
          style={{ flex:1, padding:'7px 12px', border:'1.5px solid var(--border)', borderRadius:20, fontSize:11, fontWeight:700, background:'var(--bg)', color:'var(--text)', outline:'none', fontFamily:'Nunito,sans-serif' }}
        />
        <button onClick={send} disabled={!input.trim()||typing}
          style={{ background:'var(--pu)', border:'none', borderRadius:'50%', width:30, height:30, color:'#fff', cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
          
        </button>
      </div>
    </div>
  )
}
