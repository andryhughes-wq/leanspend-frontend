'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { dealsApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { RealisticBubble } from '@/components/layout/RealisticBubble'

const STORE_COLORS: Record<string,{bg:string,color:string,accent:string}> = {
  kroger:     {bg:'rgba(255,107,107,0.15)',color:'#ff6b6b',accent:'rgba(255,107,107,0.4)'},
  walmart:    {bg:'rgba(59,130,246,0.15)', color:'#3b82f6',accent:'rgba(59,130,246,0.4)'},
  heb:        {bg:'rgba(249,115,22,0.15)', color:'#f97316',accent:'rgba(249,115,22,0.4)'},
  target:     {bg:'rgba(239,68,68,0.15)',  color:'#ef4444',accent:'rgba(239,68,68,0.4)'},
  aldi:       {bg:'rgba(16,185,129,0.15)', color:'#10b981',accent:'rgba(16,185,129,0.4)'},
  wholefoods: {bg:'rgba(107,203,119,0.15)',color:'#6BCB77',accent:'rgba(107,203,119,0.4)'},
  sprouts:    {bg:'rgba(52,211,153,0.15)', color:'#34d399',accent:'rgba(52,211,153,0.4)'},
  costco:     {bg:'rgba(99,102,241,0.15)', color:'#6366f1',accent:'rgba(99,102,241,0.4)'},
  samsclub:   {bg:'rgba(168,85,247,0.15)', color:'#a855f7',accent:'rgba(168,85,247,0.4)'},
  default:    {bg:'rgba(255,255,255,0.08)',color:'rgba(255,255,255,0.6)',accent:'rgba(255,255,255,0.2)'},
}

const FILTERS = ['All','Near Me','Best Savings','Expiring Soon','Verified','Flash Deals']
const DAYS_OF_WEEK = ['Su','Mo','Tu','We','Th','Fr','Sa']

function getDaysInMonth(year:number,month:number){return new Date(year,month+1,0).getDate()}
function getFirstDay(year:number,month:number){return new Date(year,month,1).getDay()}

export function CalendarTab() {
  const { profile } = useAppStore()
  const today = new Date()
  const [viewYear,  setViewYear]  = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [selDay,    setSelDay]    = useState<number|null>(today.getDate())
  const [activeFilter, setActiveFilter] = useState('All')
  const [radius, setRadius] = useState<number>(0)
  const [pops, setPops] = useState<{id:number,x:number,y:number}[]>([])
  const popId = {current:0}

  const addPop = (x:number,y:number) => {
    const id = ++popId.current
    setPops(p=>[...p,{id,x,y}])
    setTimeout(()=>setPops(p=>p.filter(t=>t.id!==id)),900)
  }

  const { data: dealsData, refetch, isFetching } = useQuery({
    queryKey: ['weekly-ads', profile.preferredStores],
    queryFn: () => dealsApi.getWeeklyAds(profile.preferredStores?.length ? profile.preferredStores : ['kroger','walmart','heb','target','aldi','costco','samsclub','safeway','randalls']),
    staleTime: 1000*60*30,
  })

  const deals = dealsData?.deals || dealsData?.allDeals || []
  const stores = [...new Set(deals.map((d:any)=>d.store_slug||d.store||'').filter(Boolean))] as string[]

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
    background:'rgba(255,255,255,0.055)', backdropFilter:'blur(22px)',
    WebkitBackdropFilter:'blur(22px)', border:'1px solid rgba(255,255,255,0.11)',
    borderTop:'1px solid rgba(255,255,255,0.18)', borderRadius:18,
  }

  return (
    <div style={{position:'relative',padding:'0 28px 36px'}}>

      {/* Floating bubbles — gold tint for calendar */}
      {[
        {size:34,style:{position:'fixed' as const,left:'4%', top:'25%',animationDelay:'0s'},    color:'gold'  as const},
        {size:20,style:{position:'fixed' as const,left:'90%',top:'20%',animationDelay:'1.4s'},  color:'gold'  as const},
        {size:28,style:{position:'fixed' as const,left:'93%',top:'55%',animationDelay:'2.1s'},  color:'teal'  as const},
        {size:16,style:{position:'fixed' as const,left:'3%', top:'68%',animationDelay:'0.8s'},  color:'coral' as const},
      ].map((b,i)=>(
        <RealisticBubble key={i} size={b.size} color={b.color} style={{...b.style,zIndex:3}} onPop={addPop} />
      ))}

      {pops.map(p=>(
        <div key={p.id} style={{position:'fixed',left:p.x-16,top:p.y-40,pointerEvents:'none',zIndex:9999,
          color:'#FFE66D',fontWeight:900,fontSize:18,fontFamily:'Nunito,sans-serif',
          textShadow:'0 0 12px rgba(255,230,109,0.9)',animation:'floatUp 0.9s ease-out forwards'}}>Pop!</div>
      ))}

      {/* Top bar */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 0 24px'}}>
        <div style={{fontSize:17,fontWeight:700,color:'rgba(255,255,255,0.5)'}}>Deal Calendar</div>
        <div style={{display:'flex',gap:10,alignItems:'center'}}>
          <div style={{display:'flex',alignItems:'center',gap:8,background:'rgba(255,255,255,0.07)',
            border:'1px solid rgba(255,255,255,0.12)',borderRadius:22,padding:'6px 14px'}}>
            <span style={{fontSize:11,color:'rgba(255,255,255,0.5)',fontWeight:700}}>Radius</span>
          <button onClick={()=>refetch()} disabled={isFetching} style={{
            padding:'8px 18px',borderRadius:22,
            background:isFetching?'rgba(255,230,109,0.2)':'rgba(255,230,109,0.15)',
            border:'1px solid rgba(255,230,109,0.35)',color:'#FFE66D',
            fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'Nunito,sans-serif',
          }}>{isFetching?'Loading...':'Refresh Ads'}</button>
        </div>
      </div>

      {/* Main layout */}
      <div style={{display:'grid',gridTemplateColumns:'300px 1fr',gap:20}}>

        {/* LEFT: Compact Calendar */}
        <div style={{...g,padding:20}}>

          {/* Month nav */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <button onClick={prevMonth} style={{
              width:28,height:28,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.15)',
              background:'transparent',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:14,
              display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif',
            }}>&#8249;</button>
            <div style={{textAlign:'center'}}>
              <div style={{fontSize:18,fontWeight:900,color:'white',lineHeight:1}}>{monthName}</div>
              <div style={{fontSize:11,color:'rgba(255,255,255,0.4)',fontWeight:700,marginTop:2}}>{viewYear}</div>
            </div>
            <button onClick={nextMonth} style={{
              width:28,height:28,borderRadius:'50%',border:'1px solid rgba(255,255,255,0.15)',
              background:'transparent',color:'rgba(255,255,255,0.6)',cursor:'pointer',fontSize:14,
              display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'Nunito,sans-serif',
            }}>&#8250;</button>
          </div>

          {/* Day headers */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2,marginBottom:6}}>
            {DAYS_OF_WEEK.map(d=>(
              <div key={d} style={{textAlign:'center',fontSize:9,fontWeight:800,
                color:'rgba(255,255,255,0.3)',letterSpacing:'0.5px',padding:'2px 0'}}>{d}</div>
            ))}
          </div>

          {/* Day grid */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:3}}>
            {Array.from({length:firstDay}).map((_,i)=>(
              <div key={`empty-${i}`} />
            ))}
            {Array.from({length:daysInMonth}).map((_,i)=>{
              const day     = i+1
              const isToday = day===today.getDate()&&viewMonth===today.getMonth()&&viewYear===today.getFullYear()
              const isSel   = day===selDay
              const hasDeal = deals.length>0 && day%3===0
              const isPast  = new Date(viewYear,viewMonth,day)<new Date(today.getFullYear(),today.getMonth(),today.getDate())
              return (
                <button key={day} onClick={()=>setSelDay(isSel?null:day)} style={{
                  width:'100%',aspectRatio:'1',borderRadius:'50%',
                  border:isToday?'1.5px solid rgba(255,230,109,0.7)':isSel?'1.5px solid rgba(78,205,196,0.7)':'1px solid transparent',
                  background:isSel?'rgba(78,205,196,0.18)':isToday?'rgba(255,230,109,0.12)':'transparent',
                  color:isPast?'rgba(255,255,255,0.25)':isToday?'#FFE66D':isSel?'var(--s)':'rgba(255,255,255,0.75)',
                  fontSize:11,fontWeight:isSel||isToday?900:700,cursor:'pointer',
                  fontFamily:'Nunito,sans-serif',position:'relative',
                  display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',
                  transition:'all 0.15s',
                  boxShadow:isToday?'0 0 12px rgba(255,230,109,0.3)':isSel?'0 0 10px rgba(78,205,196,0.3)':'none',
                }}>
                  {day}
                  {hasDeal&&!isPast&&(
                    <div style={{
                      width:4,height:4,borderRadius:'50%',marginTop:1,flexShrink:0,
                      background:isSel?'var(--s)':'rgba(107,203,119,0.8)',
                    }}/>
                  )}
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div style={{marginTop:16,paddingTop:14,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
            {[
              {color:'#6BCB77',label:'Deals available'},
              {color:'#FFE66D',label:'Today'},
              {color:'var(--s)',label:'Selected day'},
            ].map(l=>(
              <div key={l.label} style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <div style={{width:7,height:7,borderRadius:'50%',background:l.color,flexShrink:0}}/>
                <span style={{fontSize:10,color:'rgba(255,255,255,0.4)',fontWeight:700}}>{l.label}</span>
              </div>
            ))}
          </div>

          {/* Store filters */}
          {stores.length>0&&(
            <div style={{marginTop:14,paddingTop:12,borderTop:'1px solid rgba(255,255,255,0.07)'}}>
              <div style={{fontSize:10,fontWeight:800,color:'rgba(255,255,255,0.35)',
                textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>Stores</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:5}}>
                {stores.map((s:string)=>{
                  const sc = STORE_COLORS[s]||STORE_COLORS.default
                  return (
                    <div key={s} style={{padding:'3px 10px',borderRadius:12,fontSize:10,fontWeight:800,
                      background:sc.bg,border:`1px solid ${sc.accent}`,color:sc.color}}>
                      {s.charAt(0).toUpperCase()+s.slice(1)}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Deal Feed */}
        <div>
          {/* Filter pills */}
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:16}}>
            <div style={{display:'flex',alignItems:'center',gap:6,flexWrap:'wrap'}}>
        <span style={{fontSize:12,color:'rgba(255,255,255,0.5)',marginRight:4}}>Radius:</span>
        {([0,5,10,25,50] as number[]).map(r=>(
          <button key={r} onClick={()=>setRadius(r)} style={{
            padding:'5px 12px',borderRadius:20,fontSize:12,cursor:'pointer',
            border:radius===r?'1px solid rgba(0,255,200,0.5)':'1px solid rgba(255,255,255,0.15)',
            background:radius===r?'rgba(0,255,200,0.12)':'transparent',
            color:radius===r?'#00ffcc':'rgba(255,255,255,0.4)',
            transition:'all 0.2s'
          }}>
            {r===0?'Any':`${r}mi`}
          </button>
        ))}
      </div>
      {FILTERS.map(f=>(
              <button key={f} onClick={()=>setActiveFilter(f)} style={{
                padding:'6px 14px',borderRadius:20,fontSize:11,fontWeight:800,
                border:'1px solid '+(activeFilter===f?'rgba(255,230,109,0.55)':'rgba(255,255,255,0.12)'),
                background:activeFilter===f?'rgba(255,230,109,0.12)':'transparent',
                color:activeFilter===f?'#FFE66D':'rgba(255,255,255,0.45)',
                cursor:'pointer',fontFamily:'Nunito,sans-serif',transition:'all 0.15s',
              }}>{f}</button>
            ))}
          </div>

          {/* Deal count header */}
          <div style={{fontSize:14,fontWeight:900,color:'white',marginBottom:14}}>
            {activeFilter==='All'?'All Active Deals':`${activeFilter}`}
            <span style={{fontSize:12,color:'rgba(255,255,255,0.4)',fontWeight:700,marginLeft:8}}>
              {filteredDeals.length} deals
            </span>
          </div>

          {/* Deal cards */}
          {filteredDeals.length===0?(
            <div style={{...g,padding:32,textAlign:'center'}}>
              <div style={{fontSize:32,marginBottom:12}}>🏪</div>
              <div style={{fontSize:14,fontWeight:700,color:'rgba(255,255,255,0.5)'}}>
                No deals loaded yet.
              </div>
              <button onClick={()=>refetch()} style={{
                marginTop:14,padding:'9px 22px',borderRadius:16,
                background:'rgba(255,230,109,0.15)',border:'1px solid rgba(255,230,109,0.35)',
                color:'#FFE66D',fontSize:12,fontWeight:800,cursor:'pointer',fontFamily:'Nunito,sans-serif',
              }}>Refresh Ads</button>
            </div>
          ):(
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              {filteredDeals.slice(0,20).map((deal:any,i:number)=>{
                const store   = deal.store_slug||deal.store||'default'
                const sc      = STORE_COLORS[store]||STORE_COLORS.default
                const origPrice = deal.original_price
                const dealPrice = deal.deal_price
                const savings  = deal.savings_amount||(origPrice&&dealPrice?(origPrice-dealPrice).toFixed(2):null)
                const pctOff   = origPrice&&dealPrice?Math.round((1-dealPrice/origPrice)*100):null

                return (
                  <div key={i} style={{
                    ...g, padding:'16px 18px',
                    transition:'transform 0.2s,box-shadow 0.2s',
                    cursor:'pointer',
                  }}
                    onMouseEnter={e=>{
                      (e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow=`0 8px 32px rgba(0,0,0,0.3),0 0 0 1px ${sc.accent}`
                    }}
                    onMouseLeave={e=>{
                      (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'
                      ;(e.currentTarget as HTMLDivElement).style.boxShadow='none'
                    }}
                  >
                    <div style={{display:'flex',alignItems:'flex-start',gap:14}}>
                      {/* Store badge */}
                      <div style={{
                        padding:'6px 12px',borderRadius:10,flexShrink:0,
                        background:sc.bg,border:`1px solid ${sc.accent}`,
                        fontSize:11,fontWeight:900,color:sc.color,
                        minWidth:72,textAlign:'center',lineHeight:1.2,
                      }}>
                        {store.charAt(0).toUpperCase()+store.slice(1)}
                        {deal.live&&<div style={{fontSize:8,opacity:0.7,marginTop:2}}>LIVE</div>}
                      </div>

                      {/* Deal info */}
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:14,fontWeight:800,color:'white',
                          overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',marginBottom:4}}>
                          {deal.product_name||deal.name||'Weekly Special'}
                        </div>
                        <div style={{fontSize:11,color:'rgba(255,255,255,0.45)',fontWeight:700,marginBottom:8}}>
                          {deal.deal_description||deal.dealType||'Store Deal'}
                          {deal.valid_from&&!deal.live&&(
                            <span style={{marginLeft:8,color:'rgba(255,230,109,0.6)'}}>
                              {new Date(deal.valid_from).toLocaleDateString('en',{month:'short',day:'numeric'})}
                              {' - '}
                              {new Date(deal.valid_to).toLocaleDateString('en',{month:'short',day:'numeric'})}
                            </span>
                          )}
                        </div>

                        {/* BEFORE / AFTER PRICE */}
                        {(origPrice||dealPrice)&&(
                          <div style={{display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
                            {origPrice&&(
                              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                                <div style={{fontSize:9,fontWeight:800,color:'rgba(255,100,100,0.6)',
                                  textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:1}}>Was</div>
                                <div style={{fontSize:16,fontWeight:700,color:'rgba(255,100,100,0.7)',
                                  textDecoration:'line-through',textDecorationColor:'rgba(255,100,100,0.6)',
                                  textDecorationThickness:'2px'}}>
                                  ${Number(origPrice).toFixed(2)}
                                </div>
                              </div>
                            )}
                            {origPrice&&dealPrice&&(
                              <div style={{fontSize:18,color:'rgba(255,255,255,0.2)',fontWeight:300}}>→</div>
                            )}
                            {dealPrice&&(
                              <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                                <div style={{fontSize:9,fontWeight:800,color:'rgba(107,203,119,0.8)',
                                  textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:1}}>Now</div>
                                <div style={{fontSize:22,fontWeight:900,color:'#6BCB77',lineHeight:1}}>
                                  ${Number(dealPrice).toFixed(2)}
                                </div>
                              </div>
                            )}
                            {savings&&(
                              <div style={{
                                marginLeft:'auto',padding:'6px 12px',borderRadius:12,
                                background:pctOff&&pctOff>=40?'rgba(255,107,107,0.18)':pctOff&&pctOff>=25?'rgba(255,230,109,0.15)':'rgba(107,203,119,0.15)',
                                border:`1px solid ${pctOff&&pctOff>=40?'rgba(255,107,107,0.4)':pctOff&&pctOff>=25?'rgba(255,230,109,0.4)':'rgba(107,203,119,0.3)'}`,
                                textAlign:'center',
                              }}>
                                <div style={{fontSize:14,fontWeight:900,
                                  color:pctOff&&pctOff>=40?'#ff6b6b':pctOff&&pctOff>=25?'#FFE66D':'#6BCB77'}}>
                                  Save ${savings}
                                </div>
                                {pctOff&&(
                                  <div style={{fontSize:10,fontWeight:800,
                                    color:pctOff>=40?'rgba(255,107,107,0.7)':pctOff>=25?'rgba(255,230,109,0.7)':'rgba(107,203,119,0.7)'}}>
                                    {pctOff}% off
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                        {!origPrice&&!dealPrice&&deal.deal_price&&(
                          <div style={{fontSize:20,fontWeight:900,color:'var(--p-dark)',marginTop:4}}>
                            {deal.deal_price}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
