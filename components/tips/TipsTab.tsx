'use client'
import { useState } from 'react'
import { ChatWidget } from '@/components/chat/ChatWidget'
import { RealisticBubble } from '@/components/layout/RealisticBubble'

const BUDGET_TIPS = [
  { title:'Read weekly ads first',    text:'Most stores reset deals Wednesday. Plan meals around sales, not habits.',    color:'#FFE66D' },
  { title:'Buy protein on BOGO',      text:'Freeze the second portion. Chicken goes BOGO on predictable 12-day cycles.', color:'#6BCB77' },
  { title:'Stack digital coupons',    text:'Kroger Plus, HEB app, and Walmart+ stack coupons on top of sale prices.',    color:'#4ECDC4' },
  { title:'Bulk buy staples',         text:'Rice, beans, oats, pasta. Bulk cost per serving by up to 60%.',              color:'#A78BFA' },
  { title:'Frozen = same nutrition',  text:'Flash-frozen at peak freshness. 40-60% cheaper than fresh produce.',         color:'#6BCB77' },
  { title:'Meal prep Sundays',        text:'Batch cooking reduces food waste 35% and prevents costly weekday takeout.',   color:'#FFE66D' },
  { title:'Protein first',            text:'Fill half your plate with protein and veg. Add carbs to fuel workouts.',     color:'#4ECDC4' },
  { title:'Plant protein saves money',text:'Replacing 2 meat meals/week with beans or lentils saves $40-60/month.',      color:'#ff8fab' },
]

const VITAMINS = [
  {
    name:'Vitamin A', emoji:'🟠', category:'Fat-Soluble',
    benefits:'Vision, immune function, skin health, cell growth',
    deficiencySigns:'Night blindness, dry skin, frequent infections, poor wound healing',
    foodSources:['Sweet potatoes','Carrots','Leafy greens','Eggs','Dairy'],
    supplements:'Retinol, Beta-carotene',
    tooLittle:'Night blindness, weakened immunity, stunted growth',
    tooMuch:'Nausea, dizziness, liver damage, birth defects (avoid high doses in pregnancy)',
    dailyValue:'900mcg men / 700mcg women',
    budgetFoods:'Carrots ($0.89/lb), Sweet potato ($1.29/lb)',
  },
  {
    name:'Vitamin B12', emoji:'🔴', category:'Water-Soluble',
    benefits:'Red blood cell formation, nerve function, DNA synthesis, energy metabolism',
    deficiencySigns:'Fatigue, weakness, tingling in hands/feet, memory problems, pale skin',
    foodSources:['Beef','Salmon','Eggs','Dairy','Fortified cereals'],
    supplements:'Cyanocobalamin, Methylcobalamin',
    tooLittle:'Anemia, nerve damage, cognitive decline, depression',
    tooMuch:'Generally safe — excess is excreted (water-soluble)',
    dailyValue:'2.4mcg adults',
    budgetFoods:'Eggs ($3/dozen), Canned sardines ($1.50/can)',
  },
  {
    name:'Vitamin C', emoji:'🍊', category:'Water-Soluble',
    benefits:'Immune support, collagen production, antioxidant, iron absorption',
    deficiencySigns:'Fatigue, bleeding gums, slow wound healing, bruising easily',
    foodSources:['Bell peppers','Citrus fruits','Strawberries','Broccoli','Kiwi'],
    supplements:'Ascorbic acid, Sodium ascorbate',
    tooLittle:'Scurvy, poor immunity, slow healing, joint pain',
    tooMuch:'Digestive upset, kidney stones at very high doses (>2000mg)',
    dailyValue:'90mg men / 75mg women',
    budgetFoods:'Bell peppers ($1.50 each), Broccoli ($1.99/lb)',
  },
  {
    name:'Vitamin D', emoji:'☀️', category:'Fat-Soluble',
    benefits:'Bone health, immune function, mood regulation, calcium absorption',
    deficiencySigns:'Fatigue, bone pain, muscle weakness, depression, frequent illness',
    foodSources:['Fatty fish','Egg yolks','Fortified milk','Mushrooms (UV-exposed)'],
    supplements:'D3 (cholecalciferol), D2 (ergocalciferol)',
    tooLittle:'Rickets, osteoporosis, depression, weakened immunity',
    tooMuch:'Hypercalcemia, nausea, kidney damage (toxicity rare from sun/food)',
    dailyValue:'600-800 IU adults',
    budgetFoods:'Canned tuna ($1.29/can), Fortified milk ($3.50/gallon)',
  },
  {
    name:'Vitamin E', emoji:'🌻', category:'Fat-Soluble',
    benefits:'Antioxidant, immune function, skin health, prevents cell damage',
    deficiencySigns:'Nerve/muscle damage, weakened immunity, vision problems',
    foodSources:['Almonds','Sunflower seeds','Spinach','Avocado','Olive oil'],
    supplements:'Alpha-tocopherol',
    tooLittle:'Nerve damage, muscle weakness, immune dysfunction',
    tooMuch:'Increased bleeding risk, interferes with blood clotting',
    dailyValue:'15mg adults',
    budgetFoods:'Sunflower seeds ($2.99/lb), Spinach ($2.49/bag)',
  },
  {
    name:'Vitamin K', emoji:'🥦', category:'Fat-Soluble',
    benefits:'Blood clotting, bone metabolism, heart health',
    deficiencySigns:'Excessive bleeding, easy bruising, weak bones',
    foodSources:['Kale','Spinach','Broccoli','Brussels sprouts','Fermented foods'],
    supplements:'K1 (phylloquinone), K2 (menaquinone)',
    tooLittle:'Bleeding disorders, weak bones, cardiovascular issues',
    tooMuch:'Interferes with blood thinners — consult doctor if on Warfarin',
    dailyValue:'120mcg men / 90mcg women',
    budgetFoods:'Kale ($1.99/bunch), Broccoli ($1.99/lb)',
  },
  {
    name:'Iron', emoji:'🔩', category:'Mineral',
    benefits:'Oxygen transport, energy production, immune function, cognitive performance',
    deficiencySigns:'Fatigue, pale skin, shortness of breath, cold hands/feet, brittle nails',
    foodSources:['Red meat','Spinach','Lentils','Fortified cereals','Pumpkin seeds'],
    supplements:'Ferrous sulfate, Ferrous gluconate',
    tooLittle:'Iron-deficiency anemia, fatigue, impaired immunity, poor focus',
    tooMuch:'Constipation, nausea, organ damage at very high doses',
    dailyValue:'8mg men / 18mg women',
    budgetFoods:'Lentils ($1.99/lb dry), Canned beans ($0.89/can)',
  },
  {
    name:'Magnesium', emoji:'💎', category:'Mineral',
    benefits:'300+ enzyme reactions, muscle/nerve function, blood sugar, sleep quality',
    deficiencySigns:'Muscle cramps, fatigue, anxiety, insomnia, headaches, irregular heartbeat',
    foodSources:['Dark chocolate','Avocado','Nuts','Legumes','Whole grains'],
    supplements:'Magnesium glycinate, Magnesium citrate',
    tooLittle:'Muscle cramps, anxiety, poor sleep, high blood pressure, type 2 diabetes risk',
    tooMuch:'Diarrhea, nausea (from supplements; food sources are safe)',
    dailyValue:'400-420mg men / 310-320mg women',
    budgetFoods:'Pumpkin seeds ($3.99/lb), Black beans ($0.99/can)',
  },
  {
    name:'Zinc', emoji:'⚡', category:'Mineral',
    benefits:'Immune function, wound healing, taste/smell, protein synthesis, testosterone',
    deficiencySigns:'Frequent illness, slow wound healing, hair loss, loss of taste/smell',
    foodSources:['Oysters','Beef','Pumpkin seeds','Chickpeas','Cashews'],
    supplements:'Zinc gluconate, Zinc picolinate',
    tooLittle:'Weakened immunity, poor wound healing, hair loss, growth issues',
    tooMuch:'Nausea, reduced copper absorption, impaired immunity at high doses',
    dailyValue:'11mg men / 8mg women',
    budgetFoods:'Pumpkin seeds ($3.99/lb), Canned chickpeas ($0.99/can)',
  },
  {
    name:'Omega-3', emoji:'🐟', category:'Essential Fat',
    benefits:'Heart health, brain function, inflammation reduction, eye health, mood',
    deficiencySigns:'Dry skin, joint pain, poor concentration, depression, dry eyes',
    foodSources:['Salmon','Sardines','Walnuts','Flaxseed','Chia seeds'],
    supplements:'Fish oil, Algae oil (vegan), Krill oil',
    tooLittle:'Cardiovascular risk, cognitive decline, inflammation, dry skin',
    tooMuch:'Blood thinning at very high doses (>3g/day), fishy aftertaste',
    dailyValue:'1.1-1.6g ALA / 250-500mg EPA+DHA',
    budgetFoods:'Canned sardines ($1.50/can), Canned salmon ($2.99/can)',
  },
]

const DIABETES_TIPS = [
  { title:'Low glycemic index foods', text:'Choose foods with GI under 55. Oats, lentils, sweet potato, and most non-starchy vegetables stabilize blood sugar.', icon:'📊' },
  { title:'Portion control matters', text:'Even healthy carbs spike blood sugar in large amounts. Use the plate method: 50% veggies, 25% protein, 25% complex carbs.', icon:'🍽️' },
  { title:'Fiber is your friend', text:'Fiber slows glucose absorption. Aim for 25-35g/day from beans, vegetables, and whole grains.', icon:'🌾' },
  { title:'Avoid sugary drinks', text:'A single 12oz soda contains 39g of sugar — nearly your entire daily added sugar limit.', icon:'🚫' },
  { title:'Eat at consistent times', text:'Irregular eating patterns cause blood sugar swings. Try to eat within the same 30-minute window each day.', icon:'⏰' },
  { title:'Budget-friendly options', text:'Beans ($0.89/can), lentils ($1.99/lb), and frozen vegetables ($1.50/bag) are among the cheapest low-GI foods available.', icon:'💰' },
]

const BP_TIPS = {
  high: [
    { title:'DASH diet approach', text:'Dietary Approaches to Stop Hypertension — emphasizes fruits, vegetables, whole grains, lean protein, and low-fat dairy. Can reduce systolic BP by 8-14mmHg.', icon:'💚' },
    { title:'Reduce sodium', text:'Aim for under 1,500mg/day (high risk) or 2,300mg/day (general). Avoid processed foods, canned soups, and fast food.', icon:'🧂' },
    { title:'Potassium-rich foods', text:'Potassium helps counteract sodium. Bananas, sweet potatoes, spinach, avocado, and beans are excellent sources.', icon:'🍌' },
    { title:'Limit alcohol', text:'More than 1-2 drinks per day significantly raises blood pressure. Alcohol also adds empty calories.', icon:'🍷' },
    { title:'Budget DASH foods', text:'Frozen spinach ($1.50), canned beans ($0.89), bananas ($0.25 each), and oats ($3.99/canister) cover most DASH requirements cheaply.', icon:'💰' },
  ],
  low: [
    { title:'Increase salt carefully', text:'Slightly more sodium can help raise low blood pressure. Talk to your doctor about appropriate amounts.', icon:'🧂' },
    { title:'Stay hydrated', text:'Dehydration reduces blood volume and drops pressure. Aim for 8+ glasses of water daily.', icon:'💧' },
    { title:'Small frequent meals', text:'Large meals divert blood to digestion. Eating smaller meals more frequently prevents post-meal pressure drops.', icon:'🍽️' },
    { title:'Compression foods', text:'Caffeine in moderation, licorice root (consult doctor), and salty snacks may temporarily raise pressure.', icon:'⚡' },
    { title:'Avoid alcohol', text:'Alcohol is a vasodilator and can worsen low blood pressure, especially in combination with standing quickly.', icon:'🚫' },
  ],
}

export function TipsTab() {
  const [activeSection, setActiveSection] = useState<'tips'|'diabetes'|'bp-high'|'bp-low'|'vitamins'>('tips')
  const [activeVitamin, setActiveVitamin] = useState<number|null>(null)
  const [bpType, setBpType] = useState<'high'|'low'>('high')
  const [pops, setPops] = useState<{id:number,x:number,y:number}[]>([])
  const popId = {current:0}

  const addPop = (x:number,y:number) => {
    const id = ++popId.current
    setPops(p=>[...p,{id,x,y}])
    setTimeout(()=>setPops(p=>p.filter(t=>t.id!==id)),900)
  }

  const g: React.CSSProperties = {
    background:'rgba(255,255,255,0.055)', backdropFilter:'blur(22px)',
    WebkitBackdropFilter:'blur(22px)', border:'1px solid rgba(255,255,255,0.11)',
    borderTop:'1px solid rgba(255,255,255,0.18)', borderRadius:18,
  }

  const SECTIONS = [
    { id:'tips',     label:'Budget Tips',    color:'#FFE66D' },
    { id:'vitamins', label:'Vitamins A-Z',   color:'#A78BFA' },
    { id:'diabetes', label:'Diabetes',       color:'#6BCB77' },
    { id:'bp-high',  label:'High Blood Pressure', color:'#ff6b6b' },
    { id:'bp-low',   label:'Low Blood Pressure',  color:'#38bdf8' },
  ]

  return (
    <div style={{position:'relative',padding:'0 28px 36px'}}>

      {/* Floating bubbles — lavender tint for tips */}
      {[
        {size:30,style:{position:'fixed' as const,left:'4%', top:'28%',animationDelay:'0s'},    color:'lavender' as const},
        {size:18,style:{position:'fixed' as const,left:'91%',top:'22%',animationDelay:'1.6s'},  color:'lavender' as const},
        {size:24,style:{position:'fixed' as const,left:'94%',top:'62%',animationDelay:'0.9s'},  color:'teal'     as const},
      ].map((b,i)=>(
        <RealisticBubble key={i} size={b.size} color={b.color} style={{...b.style,zIndex:3}} onPop={addPop} />
      ))}

      {pops.map(p=>(
        <div key={p.id} style={{position:'fixed',left:p.x-16,top:p.y-40,pointerEvents:'none',zIndex:9999,
          color:'#A78BFA',fontWeight:900,fontSize:18,fontFamily:'Nunito,sans-serif',
          textShadow:'0 0 12px rgba(167,139,250,0.9)',animation:'floatUp 0.9s ease-out forwards'}}>Pop!</div>
      ))}

      {/* Health disclaimer */}
      <div style={{...g,padding:'12px 18px',marginTop:20,marginBottom:20,
        background:'rgba(255,107,107,0.06)',border:'1px solid rgba(255,107,107,0.2)'}}>
        <div style={{fontSize:11,fontWeight:800,color:'rgba(255,160,160,0.9)',lineHeight:1.6}}>
          <strong style={{color:'#ff8fab'}}>Health Disclaimer:</strong> The information on this page is for general informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider before making dietary changes, especially if you have a medical condition. Sources: NIH, Mayo Clinic, CDC.
        </div>
      </div>

      {/* Section nav */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:24}}>
        {SECTIONS.map(s=>(
          <button key={s.id} onClick={()=>setActiveSection(s.id as any)} style={{
            padding:'8px 18px',borderRadius:22,fontSize:12,fontWeight:800,
            border:'1px solid '+(activeSection===s.id?s.color+'88':'rgba(255,255,255,0.12)'),
            background:activeSection===s.id?s.color+'18':'transparent',
            color:activeSection===s.id?s.color:'rgba(255,255,255,0.45)',
            cursor:'pointer',fontFamily:'Nunito,sans-serif',transition:'all 0.2s',
            boxShadow:activeSection===s.id?`0 0 16px ${s.color}33`:'none',
          }}>{s.label}</button>
        ))}
      </div>

      {/* BUDGET TIPS */}
      {activeSection==='tips'&&(
        <div className="animate-tab-in">
          <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:20}}>Smart Budget Tips</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14,marginBottom:24}}>
            {BUDGET_TIPS.map((t,i)=>(
              <div key={i} style={{...g,padding:18,transition:'transform 0.2s,box-shadow 0.2s',cursor:'default'}}
                onMouseEnter={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(-3px)';(e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 32px rgba(0,0,0,0.3),0 0 0 1px ${t.color}44`}}
                onMouseLeave={e=>{(e.currentTarget as HTMLDivElement).style.transform='translateY(0)';(e.currentTarget as HTMLDivElement).style.boxShadow='none'}}
              >
                <div style={{width:36,height:36,borderRadius:10,background:t.color+'22',border:`1px solid ${t.color}44`,
                  display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                  <div style={{width:12,height:12,borderRadius:'50%',background:t.color}}/>
                </div>
                <div style={{fontSize:13,fontWeight:900,color:'white',marginBottom:6}}>{t.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.55)',lineHeight:1.6,fontWeight:700}}>{t.text}</div>
              </div>
            ))}
          </div>
          <div style={{...g,padding:'14px 18px',background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.2)'}}>
            <div style={{fontSize:12,fontWeight:900,color:'#A78BFA',marginBottom:6}}>Inflation Tracker</div>
            <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
              {['Eggs +12% YoY','Chicken -4% YoY','Oats stable','Beef +8% YoY'].map(t=>(
                <span key={t} style={{background:'rgba(255,255,255,0.08)',borderRadius:20,padding:'3px 10px',fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.6)'}}>{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DIABETES */}
      {activeSection==='diabetes'&&(
        <div className="animate-tab-in">
          <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:6}}>Diabetes & Blood Sugar Management</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',fontWeight:700,marginBottom:20}}>
            General dietary guidance — always work with your healthcare provider for personalized advice.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:14}}>
            {DIABETES_TIPS.map((t,i)=>(
              <div key={i} style={{...g,padding:18}}>
                <div style={{fontSize:24,marginBottom:10}}>{t.icon}</div>
                <div style={{fontSize:13,fontWeight:900,color:'#6BCB77',marginBottom:6}}>{t.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',lineHeight:1.65,fontWeight:700}}>{t.text}</div>
              </div>
            ))}
          </div>

          {/* Low GI food table */}
          <div style={{...g,padding:20,marginTop:20}}>
            <div style={{fontSize:14,fontWeight:900,color:'white',marginBottom:14}}>Low Glycemic Index Foods by Budget</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
              {[
                {food:'Lentils',gi:'GI 29',price:'$1.99/lb',color:'#6BCB77'},
                {food:'Sweet Potato',gi:'GI 44',price:'$1.29/lb',color:'#f97316'},
                {food:'Oats (rolled)',gi:'GI 55',price:'$3.99/42oz',color:'#FFE66D'},
                {food:'Chickpeas',gi:'GI 28',price:'$0.99/can',color:'#6BCB77'},
                {food:'Barley',gi:'GI 28',price:'$2.49/lb',color:'#4ECDC4'},
                {food:'Greek Yogurt',gi:'GI 11',price:'$1.25/cup',color:'#A78BFA'},
              ].map(item=>(
                <div key={item.food} style={{padding:'12px 14px',borderRadius:12,
                  background:`${item.color}12`,border:`1px solid ${item.color}33`}}>
                  <div style={{fontSize:13,fontWeight:900,color:'white'}}>{item.food}</div>
                  <div style={{fontSize:10,fontWeight:800,color:`${item.color}`,marginTop:3}}>{item.gi}</div>
                  <div style={{fontSize:10,fontWeight:700,color:'rgba(255,255,255,0.45)',marginTop:2}}>{item.price}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BLOOD PRESSURE */}
      {(activeSection==='bp-high'||activeSection==='bp-low')&&(
        <div className="animate-tab-in">
          <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:6}}>Blood Pressure Management</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',fontWeight:700,marginBottom:16}}>
            Dietary guidance only — always consult your doctor before changing treatment.
          </div>
          <div style={{display:'flex',gap:8,marginBottom:20}}>
            <button onClick={()=>{setBpType('high');setActiveSection('bp-high')}} style={{
              padding:'8px 20px',borderRadius:20,fontSize:12,fontWeight:800,
              border:'1px solid '+(bpType==='high'?'rgba(255,107,107,0.5)':'rgba(255,255,255,0.12)'),
              background:bpType==='high'?'rgba(255,107,107,0.15)':'transparent',
              color:bpType==='high'?'#ff6b6b':'rgba(255,255,255,0.45)',
              cursor:'pointer',fontFamily:'Nunito,sans-serif',
            }}>High Blood Pressure</button>
            <button onClick={()=>{setBpType('low');setActiveSection('bp-low')}} style={{
              padding:'8px 20px',borderRadius:20,fontSize:12,fontWeight:800,
              border:'1px solid '+(bpType==='low'?'rgba(56,189,248,0.5)':'rgba(255,255,255,0.12)'),
              background:bpType==='low'?'rgba(56,189,248,0.15)':'transparent',
              color:bpType==='low'?'#38bdf8':'rgba(255,255,255,0.45)',
              cursor:'pointer',fontFamily:'Nunito,sans-serif',
            }}>Low Blood Pressure</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {BP_TIPS[bpType].map((t,i)=>(
              <div key={i} style={{...g,padding:18}}>
                <div style={{fontSize:24,marginBottom:10}}>{t.icon}</div>
                <div style={{fontSize:13,fontWeight:900,
                  color:bpType==='high'?'#ff8fab':'#38bdf8',marginBottom:6}}>{t.title}</div>
                <div style={{fontSize:11,color:'rgba(255,255,255,0.6)',lineHeight:1.65,fontWeight:700}}>{t.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VITAMINS */}
      {activeSection==='vitamins'&&(
        <div className="animate-tab-in">
          <div style={{fontSize:22,fontWeight:900,color:'white',marginBottom:6}}>Vitamins & Minerals Guide</div>
          <div style={{fontSize:12,color:'rgba(255,255,255,0.45)',fontWeight:700,marginBottom:20}}>
            Complete guide to essential nutrients — signs of deficiency, food sources, supplements, and safety. Sources: NIH Office of Dietary Supplements.
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))',gap:10,marginBottom:20}}>
            {VITAMINS.map((v,i)=>(
              <button key={i} onClick={()=>setActiveVitamin(activeVitamin===i?null:i)} style={{
                padding:'14px 12px',borderRadius:14,cursor:'pointer',textAlign:'left',
                border:'1px solid '+(activeVitamin===i?'rgba(167,139,250,0.5)':'rgba(255,255,255,0.1)'),
                background:activeVitamin===i?'rgba(167,139,250,0.15)':'rgba(255,255,255,0.04)',
                fontFamily:'Nunito,sans-serif',transition:'all 0.2s',
                boxShadow:activeVitamin===i?'0 0 20px rgba(167,139,250,0.2)':'none',
              }}>
                <div style={{fontSize:20,marginBottom:6}}>{v.emoji}</div>
                <div style={{fontSize:12,fontWeight:900,color:'white'}}>{v.name}</div>
                <div style={{fontSize:9,fontWeight:700,color:'rgba(167,139,250,0.7)',marginTop:2}}>{v.category}</div>
              </button>
            ))}
          </div>

          {activeVitamin!==null&&(()=>{
            const v = VITAMINS[activeVitamin]
            return (
              <div style={{...g,padding:24}} className="animate-bounce-in">
                <div style={{display:'flex',alignItems:'center',gap:14,marginBottom:20}}>
                  <div style={{fontSize:40}}>{v.emoji}</div>
                  <div>
                    <div style={{fontSize:22,fontWeight:900,color:'white'}}>{v.name}</div>
                    <div style={{fontSize:11,fontWeight:800,color:'rgba(167,139,250,0.7)'}}>{v.category} · {v.dailyValue}</div>
                  </div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  {[
                    {label:'Benefits',      content:v.benefits,          color:'#6BCB77',bg:'rgba(107,203,119,0.08)'},
                    {label:'Signs of Deficiency', content:v.deficiencySigns, color:'#FFE66D',bg:'rgba(255,230,109,0.08)'},
                    {label:'Too Little',    content:v.tooLittle,         color:'#ff8fab', bg:'rgba(255,107,107,0.08)'},
                    {label:'Too Much',      content:v.tooMuch,           color:'#f97316', bg:'rgba(249,115,22,0.08)'},
                  ].map(item=>(
                    <div key={item.label} style={{padding:'14px 16px',borderRadius:14,
                      background:item.bg,border:`1px solid ${item.color}22`}}>
                      <div style={{fontSize:10,fontWeight:800,color:item.color,
                        textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:6}}>{item.label}</div>
                      <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',lineHeight:1.6,fontWeight:700}}>{item.content}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
                  <div style={{padding:'14px 16px',borderRadius:14,
                    background:'rgba(78,205,196,0.08)',border:'1px solid rgba(78,205,196,0.22)'}}>
                    <div style={{fontSize:10,fontWeight:800,color:'#4ECDC4',
                      textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:8}}>Best Food Sources</div>
                    <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                      {v.foodSources.map(f=>(
                        <span key={f} style={{padding:'3px 10px',borderRadius:12,fontSize:10,fontWeight:800,
                          background:'rgba(78,205,196,0.12)',border:'1px solid rgba(78,205,196,0.25)',
                          color:'rgba(78,205,196,0.9)'}}>{f}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{padding:'14px 16px',borderRadius:14,
                    background:'rgba(167,139,250,0.08)',border:'1px solid rgba(167,139,250,0.22)'}}>
                    <div style={{fontSize:10,fontWeight:800,color:'#A78BFA',
                      textTransform:'uppercase',letterSpacing:'0.6px',marginBottom:8}}>Supplements</div>
                    <div style={{fontSize:12,color:'rgba(255,255,255,0.7)',fontWeight:700,marginBottom:10}}>{v.supplements}</div>
                    <div style={{fontSize:10,fontWeight:800,color:'rgba(255,230,109,0.7)',
                      textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>Budget Food Sources</div>
                    <div style={{fontSize:11,color:'rgba(255,230,109,0.8)',fontWeight:700}}>{v.budgetFoods}</div>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
      )}

      <div style={{marginTop:24}}>
        <ChatWidget context="tips" />
      </div>
    </div>
  )
}
