'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { nutritionApi } from '@/lib/api'

const INGREDIENTS = [
  { key:'chicken', ico:'🍗', name:'Chicken Breast', mac:'165 cal · 31g protein · 3.6g fat per 100g',
    pos:['Complete protein with all 9 essential amino acids — ideal for muscle building','Low in saturated fat supporting heart health','Rich in B vitamins for energy metabolism during workouts'],
    neg:['Conventionally raised may have antibiotic residues — choose organic when possible'] },
  { key:'broccoli',ico:'🥦', name:'Broccoli',       mac:'34 cal · 2.8g protein per 100g',
    pos:['Sulforaphane — powerful cancer-protective antioxidant','High in Vitamin C, K, and folate for recovery'],
    neg:['May cause bloating — those on blood thinners should monitor Vitamin K'] },
  { key:'eggs',    ico:'🥚', name:'Eggs (large)',   mac:'78 cal · 6g protein · 5g fat per egg',
    pos:['All 9 essential amino acids — perfect for muscle repair','Choline supports brain function and liver health'],
    neg:['Common allergen — consult doctor about cholesterol if cardiovascular risk present'] },
  { key:'oats',    ico:'🌾', name:'Rolled Oats',   mac:'389 cal · 17g protein · 66g carbs per 100g',
    pos:['Beta-glucan fiber reduces LDL cholesterol','Perfect slow-burning pre-workout carb source'],
    neg:['May contain gluten cross-contamination — choose certified GF if celiac'] },
  { key:'salmon',  ico:'🐟', name:'Salmon',        mac:'208 cal · 20g protein · 13g fat per 100g',
    pos:['Omega-3s reduce muscle soreness and inflammation after training','25g high-quality protein per 100g'],
    neg:['Higher cost — canned salmon is nutritionally equivalent at lower price'] },
]

export function NutritionTab() {
  const [q, setQ]         = useState('')
  const [dq, setDq]       = useState('')
  const [open, setOpen]   = useState<string|null>(null)

  const { data: searchData, isFetching } = useQuery({
    queryKey: ['nut-search', dq],
    queryFn:  () => nutritionApi.search(dq),
    enabled:  dq.length > 2,
  })

  const { data: benefits } = useQuery({
    queryKey: ['benefits', open],
    queryFn:  () => nutritionApi.getBenefits(open!),
    enabled:  !!open,
  })

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
      <div className="font-display" style={{ fontSize:22 }}>🥗 Nutrition Facts</div>

      <div style={{ position:'relative' }}>
        <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:16, color:'var(--muted)' }}>🔍</span>
        <input type="text" value={q}
          onChange={e=>{ setQ(e.target.value); clearTimeout((window as any).__nt); (window as any).__nt=setTimeout(()=>setDq(e.target.value),400) }}
          placeholder="Search any food or ingredient..."
          style={{ width:'100%', padding:'12px 12px 12px 38px', border:'2px solid var(--border)', borderRadius:14, fontSize:13, fontWeight:700, background:'var(--card)', color:'var(--text)', outline:'none', fontFamily:'Nunito,sans-serif' }}
        />
        {isFetching && <span style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', fontSize:12 }}>⏳</span>}
      </div>

      {searchData?.results?.length > 0 && (
        <div className="card" style={{ overflow:'hidden' }}>
          {searchData.results.slice(0,6).map((f:any)=>(
            <div key={f.fdcId} style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10, borderBottom:'1.5px solid var(--border)', cursor:'pointer' }}
              onClick={()=>{ setQ(''); setDq('') }}>
              <span style={{ fontSize:22 }}>🥫</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'var(--text)' }}>{f.description}</div>
                <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>{f.brandOwner}</div>
              </div>
              <div style={{ fontSize:11, fontWeight:800, color:'var(--p-dark)', whiteSpace:'nowrap' }}>
                {f.nutrients?.calories||'—'} cal
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ fontFamily:'Arial,sans-serif', border:'2px solid var(--text)', borderRadius:4, padding:'10px 14px', maxWidth:280, margin:'0 auto', background:'var(--card)', color:'var(--text)' }}>
        <div style={{ fontSize:24, fontWeight:900, borderBottom:'8px solid var(--text)', paddingBottom:2, marginBottom:2 }}>Nutrition Facts</div>
        <div style={{ fontSize:11 }}>8 servings per container</div>
        <div style={{ fontSize:11, fontWeight:900, marginBottom:4 }}>Serving size 2/3 cup (55g)</div>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', borderBottom:'4px solid var(--text)', paddingBottom:2, marginBottom:3 }}>
          <div><div style={{ fontSize:12, fontWeight:900 }}>Amount per serving</div><div style={{ fontSize:14, fontWeight:900 }}>Calories</div></div>
          <div style={{ fontSize:40, fontWeight:900, lineHeight:1 }}>230</div>
        </div>
        {[['Total Fat 8g','10%',false],['Saturated Fat 1g','5%',true],['Trans Fat 0g','',true],['Cholesterol 0mg','0%',false],['Sodium 160mg','7%',false],['Total Carbohydrate 37g','13%',false],['Dietary Fiber 4g','14%',true],['Total Sugars 12g','',true],['Protein 3g','',false]].map(([lbl,pct,ind])=>(
          <div key={String(lbl)} style={{ display:'flex', justifyContent:'space-between', fontSize:10, borderBottom:'.5px solid #ccc', padding:'1.5px 0', paddingLeft:ind?14:0 }}>
            <span>{lbl}</span>{pct&&<span style={{ fontWeight:700 }}>{pct}</span>}
          </div>
        ))}
        <div style={{ fontSize:9, color:'var(--muted)', textAlign:'center', borderTop:'1px solid var(--text)', marginTop:4, paddingTop:3 }}>
          *% Daily Value based on 2,000 calorie diet.
        </div>
      </div>

      <div style={{ fontSize:14, fontWeight:900, color:'var(--text)' }}>🫐 Click an ingredient for health info</div>

      {INGREDIENTS.map(ing=>(
        <div key={ing.key} className="card" style={{ overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer' }}
            onClick={()=>setOpen(open===ing.key?null:ing.key)}>
            <span style={{ fontSize:26 }}>{ing.ico}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12, fontWeight:800, color:'var(--text)' }}>{ing.name}</div>
              <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>{ing.mac}</div>
            </div>
            <span style={{ fontSize:14, color:'var(--muted)', transition:'transform 0.2s', transform:open===ing.key?'rotate(180deg)':'rotate(0deg)' }}>▼</span>
          </div>
          {open===ing.key && (
            <div style={{ padding:'8px 14px 14px', background:'var(--pu-light)' }}>
              {ing.pos.map((t,i)=>(
                <div key={i} style={{ display:'flex', gap:7, marginTop:6, alignItems:'flex-start' }}>
                  <span style={{ fontSize:9, fontWeight:900, padding:'2px 7px', borderRadius:20, background:'var(--p-light)', color:'var(--p-dark)', whiteSpace:'nowrap', marginTop:1 }}>✓ Benefit</span>
                  <span style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5, fontWeight:700 }}>{t}</span>
                </div>
              ))}
              {ing.neg.map((t,i)=>(
                <div key={i} style={{ display:'flex', gap:7, marginTop:6, alignItems:'flex-start' }}>
                  <span style={{ fontSize:9, fontWeight:900, padding:'2px 7px', borderRadius:20, background:'#FFE8E8', color:'#C62A2A', whiteSpace:'nowrap', marginTop:1 }}>⚠ Caution</span>
                  <span style={{ fontSize:11, color:'var(--muted)', lineHeight:1.5, fontWeight:700 }}>{t}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
