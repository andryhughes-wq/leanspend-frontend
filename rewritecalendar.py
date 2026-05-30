content = r"""'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dealsApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { RealisticBubble } from '@/components/layout/RealisticBubble'

const STORE_COLORS: Record<string, {bg:string,color:string,accent:string}> = {
  kroger:     {bg:'rgba(255,107,107,0.15)', color:'#ff6b6b', accent:'rgba(255,107,107,0.4)'},
  walmart:    {bg:'rgba(59,130,246,0.15)',  color:'#3b82f6', accent:'rgba(59,130,246,0.4)'},
  heb:        {bg:'rgba(249,115,22,0.15)',  color:'#f97316', accent:'rgba(249,115,22,0.4)'},
  target:     {bg:'rgba(239,68,68,0.15)',   color:'#ef4444', accent:'rgba(239,68,68,0.4)'},
  aldi:       {bg:'rgba(16,185,129,0.15)',  color:'#10b981', accent:'rgba(16,185,129,0.4)'},
  wholefoods: {bg:'rgba(107,203,119,0.15)', color:'#6BCB77', accent:'rgba(107,203,119,0.4)'},
  sprouts:    {bg:'rgba(52,211,153,0.15)',  color:'#34d399', accent:'rgba(52,211,153,0.4)'},
  costco:     {bg:'rgba(99,102,241,0.15)',  color:'#6366f1', accent:'rgba(99,102,241,0.4)'},
  samsclub:   {bg:'rgba(168,85,247,0.15)',  color:'#a855f7', accent:'rgba(168,85,247,0.4)'},
  default:    {bg:'rgba(255,255,255,0.08)', color:'rgba(255,255,255,0.6)', accent:'rgba(255,255,255,0.2)'},
}

const FILTERS = ['All','Near Me','Best Savings','Expiring Soon','Verified','Flash Deals']
const DAYS_OF_WEEK = ['Su','Mo','Tu','We','Th','Fr','Sa']
const ALL_STORES = ['kroger','walmart','heb','target','aldi','costco','samsclub','safeway','randalls']

function getDaysInMonth(year:number,month:number){return new Date(year,month+1,0).getDate()}
function getFirstDay(year:number,month:number){return new Date(year,month,1).getDay()}

export function CalendarTab() {
  const { profile } = useAppStore()
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selDay,    setSelDay]    = useState<number|null>(today.getDate())
  const [activeFilter, setActiveFilter] = useState('All')
  const [radius,    setRadius]    = useState(0)
  const [pops,      setPops]      = useState<{id:number,x:number,y:number}[]>([])
  const popId = {current:0}

  const addPop = (x:number,y:number) => {
    const id = ++popId.current
    setPops(p=>[...p,{id,x,y}])
    setTimeout(()=>setPops(p=>p.filter(t=>t.id!==id)),900)
  }

  const stores = profile.preferredStores?.length ? profile.preferredStores : ALL_STORES

  const { data:dealsData, refetch, isFetching } = useQuery({
    queryKey: ['weekly-ads', stores],
    queryFn: () => dealsApi.getWeeklyAds(stores),
    staleTime: 1000*60*30,
    retry: 2,
  })

  const deals = dealsData?.deals || dealsData?.allDeals || []

  const filteredDeals = deals.filter((d:any) => {
    if (activeFilter==='Best Savings') return (d.savings_amount||0)>2
    if (activeFilter==='Expiring Soon') return d.valid_to && new Date(d.valid_to)<new Date(Date.now()+3*86400000)
    if (activeFilter==='Flash Deals') return d.live
    return true
  })

  const daysInMonth = getDaysInMonth(viewYear,viewMonth)
  const firstDay    = getFirstDay(viewYear,viewMonth)
  const monthName   = new Date(viewYear,viewMonth,1).toLocaleString('default',{month:'long'})

  const prevMonth = () => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1)}else setViewMonth(m=>m-1) }
  const nextMonth = () => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1)}else setViewMonth(m=>m+1) }

  const g: React.CSSProperties = {
    display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:8
  }

  return (
    <div style={{display:'flex',gap:16,flexWrap:'wrap',padding:'0 0 40px'}}>
      {pops.map(p=>(
        <RealisticBubble key={p.id} x={p.x} y={p.y} color="teal" />
      ))}

      {/* Left: Calendar */}
      <div style={{flex:'0 0 280px',minWidth:260}}>
        <div style={{
          background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',
          borderRadius:16,padding:'1rem'
        }}>
          {/* Month nav */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:12}}>
            <button onClick={prevMonth} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>{'<'}</button>
            <div style={{textAlign:'center'}}>
              <div style={{fontWeight:700,color:'white',fontSize:15}}>{monthName}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)'}}>{viewYear}</div>
            </div>
            <button onClick={nextMonth} style={{background:'none',border:'none',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:18}}>{'>'}</button>
          </div>

          {/* Day headers */}
          <div style={g}>
            {DAYS_OF_WEEK.map(d=>(
              <div key={d} style={{textAlign:'center',fontSize:10,color:'rgba(255,255,255,0.3)',padding:'4px 0'}}>{d}</div>
            ))}
          </div>

          {/* Calendar days */}
          <div style={g}>
            {Array.from({length:firstDay}).map((_,i)=><div key={'e'+i}/>)}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day = i+1
              const isToday = day===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear()
              const isSel = day===selDay
              return (
                <button
                  key={day}
                  onClick={(e)=>{setSelDay(day);addPop(e.clientX,e.clientY)}}
                  style={{
                    aspectRatio:'1',borderRadius:'50%',border:'none',cursor:'pointer',
                    fontSize:12,fontWeight:isSel?700:400,
                    background:isSel?'rgba(0,255,200,0.2)':isToday?'rgba(0,255,200,0.08)':'transparent',
                    color:isSel?'#00ffcc':isToday?'rgba(0,255,200,0.8)':'rgba(255,255,255,0.7)',
                    outline:isSel?'1px solid rgba(0,255,200,0.5)':'none'
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{marginTop:12,display:'flex',flexDirection:'column',gap:4}}>
            {[
              {color:'rgba(0,255,200,0.5)',label:'Deals available'},
              {color:'rgba(0,255,200,0.3)',label:'Today'},
              {color:'rgba(0,255,200,0.8)',label:'Selected day'},
            ].map(l=>(
              <div key={l.label} style={{display:'flex',alignItems:'center',gap:6,fontSize:11,color:'rgba(255,255,255,0.4)'}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:l.color}}/>
                {l.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Deals panel */}
      <div style={{flex:1,minWidth:300}}>
        {/* Radius buttons */}
        <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:10,flexWrap:'wrap'}}>
          <span style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>Radius:</span>
          {[0,5,10,25,50].map(r=>(
            <button
              key={r}
              onClick={()=>setRadius(r)}
              style={{
                padding:'4px 12px',borderRadius:20,fontSize:12,cursor:'pointer',
                border:radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)',
                background:radius===r?'rgba(0,255,200,0.1)':'transparent',
                color:radius===r?'#00ffcc':'rgba(255,255,255,0.4)',
                transition:'all 0.2s'
              }}
            >
              {r===0?'Any':`${r}mi`}
            </button>
          ))}
          <button
            onClick={()=>refetch()}
            style={{
              marginLeft:'auto',padding:'5px 14px',borderRadius:20,fontSize:12,cursor:'pointer',
              border:'1px solid rgba(0,255,200,0.3)',background:'rgba(0,255,200,0.08)',
              color:'#00ffcc',fontWeight:600
            }}
          >
            {isFetching?'Loading...':'Refresh Ads'}
          </button>
        </div>

        {/* Filter tabs */}
        <div style={{display:'flex',gap:6,marginBottom:12,flexWrap:'wrap'}}>
          {FILTERS.map(f=>(
            <button
              key={f}
              onClick={()=>setActiveFilter(f)}
              style={{
                padding:'5px 14px',borderRadius:20,fontSize:12,cursor:'pointer',
                border:activeFilter===f?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.12)',
                background:activeFilter===f?'rgba(0,255,200,0.1)':'transparent',
                color:activeFilter===f?'#00ffcc':'rgba(255,255,255,0.45)'
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Deals header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:10}}>
          <div style={{fontSize:14,fontWeight:600,color:'white'}}>
            All Active Deals
            <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',marginLeft:8,fontWeight:400}}>
              {filteredDeals.length} deals
            </span>
          </div>
        </div>

        {/* Deals list */}
        {isFetching ? (
          <div style={{
            background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:14,padding:'3rem',textAlign:'center',color:'rgba(255,255,255,0.4)',fontSize:13
          }}>
            Loading deals...
          </div>
        ) : filteredDeals.length === 0 ? (
          <div style={{
            background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:14,padding:'3rem',textAlign:'center'
          }}>
            <div style={{fontSize:32,marginBottom:8}}>🏪</div>
            <div style={{color:'rgba(255,255,255,0.5)',fontSize:14,marginBottom:12}}>No deals loaded yet.</div>
            <button
              onClick={()=>refetch()}
              style={{
                padding:'10px 24px',borderRadius:10,cursor:'pointer',
                background:'rgba(0,255,200,0.1)',border:'1px solid rgba(0,255,200,0.35)',
                color:'#00ffcc',fontWeight:600,fontSize:14
              }}
            >
              Refresh Ads
            </button>
          </div>
        ) : (
          <div style={{display:'flex',flexDirection:'column',gap:8,maxHeight:600,overflowY:'auto'}}>
            {filteredDeals.map((deal:any,i:number)=>{
              const storeKey = (deal.store_slug||deal.store||'').toLowerCase()
              const sc = STORE_COLORS[storeKey] || STORE_COLORS.default
              const origPrice = deal.original_price
              const dealPrice = deal.deal_price
              const savings = deal.savings_amount
              const pctOff = origPrice&&dealPrice ? Math.round((1-dealPrice/origPrice)*100) : 0
              return (
                <div key={i} style={{
                  background:sc.bg,border:`1px solid ${sc.accent}`,
                  borderRadius:12,padding:'12px 14px',
                  display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'
                }}>
                  <div style={{flex:1,minWidth:120}}>
                    <div style={{fontSize:14,fontWeight:600,color:'white',marginBottom:2}}>
                      {deal.product_name||deal.name||'Deal'}
                    </div>
                    <div style={{fontSize:12,color:sc.color}}>{deal.store_name||deal.store||storeKey}</div>
                    {deal.valid_to && (
                      <div style={{fontSize:10,color:'rgba(255,255,255,0.3)',marginTop:2}}>
                        Until {new Date(deal.valid_to).toLocaleDateString('en',{month:'short',day:'numeric'})}
                      </div>
                    )}
                  </div>
                  <div style={{display:'flex',flexDirection:'column',alignItems:'flex-end',gap:2}}>
                    {origPrice && (
                      <div style={{fontSize:11,color:'rgba(255,100,100,0.7)',textDecoration:'line-through'}}>
                        ${Number(origPrice).toFixed(2)}
                      </div>
                    )}
                    {dealPrice && (
                      <div style={{fontSize:20,fontWeight:900,color:'#6BCB77',lineHeight:1}}>
                        ${Number(dealPrice).toFixed(2)}
                      </div>
                    )}
                    {savings && (
                      <div style={{
                        padding:'2px 8px',borderRadius:10,fontSize:11,fontWeight:700,
                        background:pctOff>=25?'rgba(255,230,109,0.15)':'rgba(107,203,119,0.15)',
                        border:`1px solid ${pctOff>=25?'rgba(255,230,109,0.3)':'rgba(107,203,119,0.3)'}`,
                        color:pctOff>=25?'#FFE66D':'#6BCB77'
                      }}>
                        Save ${savings} {pctOff>0&&`(${pctOff}% off)`}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
"""

with open('components/calendar/CalendarTab.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Rewrote CalendarTab.tsx')
