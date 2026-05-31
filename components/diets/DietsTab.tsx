'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'

type Card = {
  name: string; tag: string; color: string; sign?: string; glyph?: string;
  approach: string; macros: string; foods: string; bestFor: string;
  goals?: string[]; catch?: string;
}

const ARCHETYPES: Card[] = [
  { sign:'Aries', glyph:'\u2648', name:'The Firestarter', tag:'High-energy', color:'#ff6b6b',
    approach:'Fast-burning fuel for explosive effort. Carbs timed around hard workouts, protein to rebuild after.',
    macros:'~30% protein, 45% carbs, 25% fat', foods:'Oats, bananas, chicken, rice, eggs, berries, peanut butter.',
    bestFor:'High-intensity training and big energy output.', goals:['endurance','muscle_gain'] },
  { sign:'Taurus', glyph:'\u2649', name:'The Comfort Builder', tag:'Sustainable', color:'#6BCB77',
    approach:'Steady, satisfying whole foods. Built to be enjoyable and easy to stick with long term.',
    macros:'Balanced, whole-food based', foods:'Roasted vegetables, beans, whole grains, olive oil, cheese, fruit.',
    bestFor:'A calm, sustainable routine you actually look forward to.', goals:['balanced'] },
  { sign:'Gemini', glyph:'\u264A', name:'The Variety Seeker', tag:'Flexible', color:'#FFE66D',
    approach:'Constant variety to fight boredom. Rotates cuisines and ingredients to keep eating interesting.',
    macros:'Balanced, varied', foods:'Stir-fries, grain bowls, wraps, mixed proteins, lots of different veg.',
    bestFor:'People who get bored eating the same thing twice.', goals:['balanced'] },
  { sign:'Cancer', glyph:'\u264B', name:'The Nourisher', tag:'Wholesome', color:'#60a5fa',
    approach:'Home-cooked, gut-friendly meals. Emphasis on comfort, hydration, and feeling cared for.',
    macros:'Balanced, fiber-rich', foods:'Soups, stews, yogurt, oats, leafy greens, fish, herbal tea.',
    bestFor:'Cozy, gentle eating and digestion.', goals:['balanced'] },
  { sign:'Leo', glyph:'\u264C', name:'The Red-Carpet Lean', tag:'Cutting', color:'#f97316',
    approach:'Moderate deficit, high protein to keep muscle, high-volume veg to stay full and defined.',
    macros:'~40% protein, 30% carbs, 30% fat', foods:'White fish, egg whites, greens, berries, lean poultry.',
    bestFor:'A lean, camera-ready look.', goals:['weight_loss'] },
  { sign:'Virgo', glyph:'\u264D', name:'The Clean Eater', tag:'Precise', color:'#4ECDC4',
    approach:'Minimal processed food, careful portions, consistent meals. Structure and detail are the point.',
    macros:'Balanced, measured', foods:'Lean protein, quinoa, vegetables, nuts, fruit, plain whole foods.',
    bestFor:'People who like a precise, organized plan.', goals:['balanced'] },
  { sign:'Libra', glyph:'\u264E', name:'The Balanced Plate', tag:'Even-keeled', color:'#f472b6',
    approach:'Everything in moderation, nothing off-limits. Aims for harmony rather than extremes.',
    macros:'~25% protein, 45% carbs, 30% fat', foods:'A bit of everything: grains, protein, veg, fruit, the occasional treat.',
    bestFor:'A no-extremes, livable approach.', goals:['balanced'] },
  { sign:'Scorpio', glyph:'\u264F', name:'The Action-Hero Bulk', tag:'Lean mass', color:'#a78bfa',
    approach:'High protein with a calorie surplus and heavy lifting. Intense, focused, built for growth.',
    macros:'~40% protein, 35% carbs, 25% fat', foods:'Chicken, eggs, lean beef, rice, oats, sweet potato, whey.',
    bestFor:'Serious muscle building.', goals:['muscle_gain'] },
  { sign:'Sagittarius', glyph:'\u2650', name:'The Endurance Engine', tag:'Performance', color:'#34d399',
    approach:'Carb-forward fuel for going long. Strategic timing around training to keep stamina high.',
    macros:'~20% protein, 55% carbs, 25% fat', foods:'Rice, pasta, oats, bananas, dates, salmon, nuts, greens.',
    bestFor:'Running, cycling, and high training volume.', goals:['endurance'] },
  { sign:'Capricorn', glyph:'\u2651', name:'The Disciplined Climber', tag:'Consistent', color:'#94a3b8',
    approach:'Repeatable meals, meal-prepped and dependable. Discipline over novelty, results over hype.',
    macros:'~35% protein, 35% carbs, 30% fat', foods:'Batch-cooked chicken, rice, eggs, frozen veg, oats.',
    bestFor:'People who thrive on routine and prep.', goals:['muscle_gain','weight_loss'] },
  { sign:'Aquarius', glyph:'\u2652', name:'The Plant-Based Performer', tag:'Plant-based', color:'#22d3ee',
    approach:'All energy from plants, combining sources for complete protein, watching B12 and iron.',
    macros:'~20% protein, 55% carbs, 25% fat', foods:'Beans, lentils, tofu, tempeh, quinoa, nuts, seeds, veg.',
    bestFor:'Plant-only eating without losing performance.', goals:['plant_based','balanced'] },
  { sign:'Pisces', glyph:'\u2653', name:'The Pescatarian Dreamer', tag:'Seafood-forward', color:'#818cf8',
    approach:'Fish and plants at the center, rich in omega-3s. Light, brain-and-heart-friendly eating.',
    macros:'~30% protein, 40% carbs, 30% fat', foods:'Salmon, sardines, shrimp, vegetables, whole grains, olive oil.',
    bestFor:'Heart and brain health with a lighter feel.', goals:['balanced'] },
]

const FAMOUS: Card[] = [
  { name:'Mediterranean', tag:'Balanced', color:'#4ECDC4',
    approach:'Whole foods centered on vegetables, olive oil, fish, and whole grains. One of the most studied eating patterns.',
    macros:'Balanced, fat mostly from olive oil', foods:'Olive oil, fish, vegetables, legumes, nuts, whole grains, fruit.',
    bestFor:'Heart health and a sustainable everyday pattern.', catch:'Calories still count - olive oil and nuts are dense.' },
  { name:'Keto', tag:'Low-carb', color:'#ff6b6b',
    approach:'Very low carb, high fat, to shift the body into burning fat for fuel (ketosis).',
    macros:'~70% fat, 25% protein, 5% carbs', foods:'Eggs, meat, fish, cheese, avocado, oils, low-carb vegetables.',
    bestFor:'Some find it useful for appetite control and fat loss.', catch:'Restrictive and hard to sustain; an early adjustment period is common.' },
  { name:'Whole30', tag:'Elimination', color:'#FFE66D',
    approach:'A 30-day reset cutting sugar, grains, dairy, legumes, and alcohol to identify what affects you.',
    macros:'Whole-food based, no set ratios', foods:'Meat, seafood, eggs, vegetables, fruit, healthy fats.',
    bestFor:'A short reset and spotting food sensitivities.', catch:'It is a 30-day program, not a long-term diet.' },
  { name:'Paleo', tag:'Whole-food', color:'#f97316',
    approach:'Eats foods presumed available to early humans; skips processed foods, grains, and dairy.',
    macros:'Higher protein and fat, lower carb', foods:'Meat, fish, eggs, vegetables, fruit, nuts, seeds.',
    bestFor:'Cutting processed food and added sugar.', catch:'Excluding whole grains and dairy is debated nutritionally.' },
  { name:'DASH', tag:'Heart-health', color:'#60a5fa',
    approach:'Designed to lower blood pressure - rich in produce and low-fat dairy, low in sodium.',
    macros:'Balanced, low sodium', foods:'Vegetables, fruit, whole grains, lean protein, low-fat dairy.',
    bestFor:'Blood pressure and overall heart health.', catch:'Requires watching sodium, which takes label-reading.' },
  { name:'Intermittent Fasting', tag:'Timing', color:'#a78bfa',
    approach:'Cycles eating and fasting windows (e.g. 16:8) rather than changing what you eat.',
    macros:'Depends on food choices', foods:'No restricted foods - timing is the lever.',
    bestFor:'Simplifying meals and managing total intake.', catch:'Not ideal for everyone; can clash with some schedules or conditions.' },
]

export function DietsTab() {
  const { profile } = useAppStore()
  const goal = (profile.fitnessGoal || '').toLowerCase().replace(/[\s-]/g,'_')
  const [open, setOpen] = useState<string | null>(null)

  const renderCard = (c: Card, key: string) => {
    const isOpen = open === key
    const matches = c.goals?.includes(goal)
    return (
      <div key={key}
        onClick={() => setOpen(isOpen ? null : key)}
        style={{
          background:'rgba(255,255,255,0.03)',
          border:`1px solid ${matches ? c.color+'88' : 'rgba(255,255,255,0.08)'}`,
          borderRadius:14, padding:'14px 16px', cursor:'pointer', transition:'all 0.2s',
          boxShadow: matches ? `0 0 16px ${c.color}33` : 'none',
        }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          {c.glyph ? (
            <div style={{
              width:30, height:30, borderRadius:'50%', flexShrink:0, display:'flex',
              alignItems:'center', justifyContent:'center', fontSize:16,
              background:c.color+'22', border:`1px solid ${c.color}55`, color:c.color,
              boxShadow:`0 0 10px ${c.color}33`
            }}>{c.glyph}</div>
          ) : (
            <div style={{ width:10, height:10, borderRadius:'50%', background:c.color, flexShrink:0, boxShadow:`0 0 8px ${c.color}` }} />
          )}
          <div style={{ flex:1 }}>
            <div style={{ fontSize:15, fontWeight:800, color:'white', fontFamily:'Nunito,sans-serif' }}>{c.name}</div>
            <div style={{ fontSize:11, color:c.color, fontWeight:700 }}>{c.sign ? `${c.sign} - ${c.tag}` : c.tag}</div>
          </div>
          {matches && (
            <div style={{ fontSize:10, fontWeight:800, color:c.color, padding:'3px 8px', borderRadius:10,
              background:c.color+'22', border:`1px solid ${c.color}55` }}>MATCHES YOUR GOAL</div>
          )}
          <div style={{ fontSize:16, color:'rgba(255,255,255,0.35)', transform:isOpen?'rotate(180deg)':'none', transition:'transform 0.2s' }}>v</div>
        </div>
        {isOpen && (
          <div style={{ marginTop:12, display:'flex', flexDirection:'column', gap:8, fontSize:13, lineHeight:1.5 }}>
            <div style={{ color:'rgba(255,255,255,0.75)' }}>{c.approach}</div>
            <div><span style={{ color:'rgba(255,255,255,0.4)' }}>Typical balance: </span><span style={{ color:'white' }}>{c.macros}</span></div>
            <div><span style={{ color:'rgba(255,255,255,0.4)' }}>Foods: </span><span style={{ color:'white' }}>{c.foods}</span></div>
            <div><span style={{ color:'rgba(255,255,255,0.4)' }}>Best for: </span><span style={{ color:'white' }}>{c.bestFor}</span></div>
            {c.catch && <div style={{ color:'#FFE66D' }}>The catch: {c.catch}</div>}
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{ padding:'0 0 40px' }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:22, fontWeight:800, color:'white', fontFamily:'Nunito,sans-serif' }}>Diets</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>A star-sign diet persona for everyone, plus the diets everyone is talking about</div>
      </div>

      <div style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.6px', textTransform:'uppercase', margin:'8px 0 10px' }}>Zodiac Archetypes</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:10, marginBottom:24 }}>
        {ARCHETYPES.map((c,i) => renderCard(c, 'a'+i))}
      </div>

      <div style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.6px', textTransform:'uppercase', margin:'8px 0 10px' }}>Famous Diets</div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))', gap:10 }}>
        {FAMOUS.map((c,i) => renderCard(c, 'f'+i))}
      </div>

      <div style={{ marginTop:20, fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center', lineHeight:1.5 }}>
        For fun and general information only - not medical or nutrition advice, and the star signs are just for flavor. Talk to a doctor or registered dietitian before making big diet changes.
      </div>
    </div>
  )
}
