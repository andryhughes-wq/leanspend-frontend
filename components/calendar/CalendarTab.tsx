'use client'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, addMonths, subMonths, startOfMonth, getDaysInMonth, getDay } from 'date-fns'
import { dealsApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'

export function CalendarTab() {
  const [current, setCurrent]     = useState(new Date())
  const [activeStore, setActiveStore] = useState<string|null>(null)
  const [refreshing, setRefreshing]   = useState(false)
  const { profile } = useAppStore()
  const month = current.getMonth()+1
  const year  = current.getFullYear()

  const { data: calData } = useQuery({
    queryKey: ['cal', month, year],
    queryFn:  () => dealsApi.getCalendar(month, year),
  })

  const { data: activeData, refetch: refetchActive } = useQuery({
    queryKey: ['deals-active', profile.preferredStores.join(',')],
    queryFn:  () => dealsApi.getActive({ limit: 40 }),
    staleTime: 1000 * 60 * 30,
  })

  // Live weekly ad data from store websites
  const { data: liveAds, refetch: refetchAds, isFetching: loadingAds } = useQuery({
    queryKey: ['weekly-ads', profile.preferredStores.join(',')],
    queryFn:  () => dealsApi.getWeeklyAds(profile.preferredStores.slice(0,4)),
    staleTime: 1000 * 60 * 60 * 6, // 6 hours
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    try {
      await dealsApi.refresh(profile.preferredStores)
      await refetchActive()
      await refetchAds()
    } finally {
      setRefreshing(false)
    }
  }

  const daysInMonth = getDaysInMonth(current)
  const firstDay    = getDay(startOfMonth(current))
  const today       = new Date()
  const isCurMonth  = month===today.getMonth()+1 && year===today.getFullYear()
  const dealDays    = new Set(Object.keys(calData?.calendar||{}).map(d=>parseInt(d.split('-')[2])))
  const bestDays    = new Set([7,14,21,28])

  // Merge DB deals and live scraped deals
  const allDeals = [
    ...(activeData?.deals || []),
    ...(liveAds?.deals || []).filter((d:any) => d.live).slice(0,20),
  ]

  const filteredDeals = activeStore ? allDeals.filter((d:any)=>(d.store_slug||d.store)===activeStore) : allDeals

  const STORE_COLORS: Record<string,{bg:string,color:string}> = {
    kroger:  {bg:'#EAF3DE',color:'#2A6B30'},
    walmart: {bg:'#FAEEDA',color:'#633806'},
    heb:     {bg:'#FAECE7',color:'#993C1D'},
    target:  {bg:'#FCEBEB',color:'#A32D2D'},
    aldi:    {bg:'#EDE9FE',color:'#4C1D95'},
  }

  const stores = [...new Set(allDeals.map((d:any)=>d.store_slug||d.store))].filter(Boolean)

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

      {/* Header with refresh */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div className="font-display" style={{ fontSize:22 }}>{format(current,'MMMM yyyy')}</div>
        <div style={{ display:'flex', gap:6, alignItems:'center' }}>
          <button onClick={handleRefresh} disabled={refreshing||loadingAds}
            style={{ padding:'5px 12px', border:'2px solid var(--p)', borderRadius:10, cursor:'pointer', fontSize:11, fontWeight:800, background:'var(--p-light)', color:'var(--p-dark)', fontFamily:'Nunito,sans-serif' }}>
            {refreshing||loadingAds ? '⏳' : '🔄 Refresh Ads'}
          </button>
          {[['‹',()=>setCurrent(subMonths(current,1))],['›',()=>setCurrent(addMonths(current,1))]].map(([lbl,fn],i)=>(
            <button key={i} onClick={fn as any}
              style={{ padding:'5px 12px', border:'2px solid var(--border)', borderRadius:10, cursor:'pointer', fontSize:15, fontWeight:800, background:'var(--card)', color:'var(--text)', fontFamily:'Nunito,sans-serif' }}>
              {lbl as string}
            </button>
          ))}
        </div>
      </div>

      {/* Live ad status banner */}
      {liveAds && (
        <div style={{ background:'var(--s-light)', border:'2px solid var(--s)', borderRadius:12, padding:'8px 14px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
          <div style={{ fontSize:11, fontWeight:700, color:'var(--s-dark)' }}>
            📡 <strong>{liveAds.deals?.length || 0} live deals</strong> scraped from {liveAds.storeCount||0} store websites · Updated just now
          </div>
          {liveAds.errors?.length > 0 && (
            <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700 }}>⚠️ {liveAds.errors.length} stores unavailable</div>
          )}
        </div>
      )}

      {/* Legend */}
      <div style={{ display:'flex', gap:14, flexWrap:'wrap', fontSize:10, fontWeight:800, color:'var(--muted)' }}>
        {[['var(--p)','Today'],['var(--acc-dark)','Deal day'],['var(--s)','Best buy']].map(([c,l])=>(
          <span key={l as string} style={{ display:'flex', alignItems:'center', gap:4 }}>
            <span style={{ width:9, height:9, borderRadius:'50%', background:c as string, display:'inline-block' }}/>{l}
          </span>
        ))}
      </div>

      {/* Calendar */}
      <div className="card" style={{ padding:14 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2, marginBottom:4 }}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>(
            <div key={d} style={{ textAlign:'center', fontSize:9, fontWeight:900, color:'var(--muted)', padding:'3px 0', textTransform:'uppercase' }}>{d}</div>
          ))}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:2 }}>
          {Array(firstDay).fill(null).map((_,i)=><div key={`e${i}`}/>)}
          {Array.from({length:daysInMonth},(_,i)=>i+1).map(d=>{
            const isToday = isCurMonth && d===today.getDate()
            const isBest  = bestDays.has(d)
            const isDeal  = dealDays.has(d)
            return (
              <div key={d} style={{
                aspectRatio:'1', borderRadius:9,
                background:isToday?'var(--p)':'var(--card)',
                border:`${isBest?'2':'1.5'}px solid ${isToday?'var(--p)':isBest?'var(--s)':isDeal?'var(--acc-dark)':'var(--border)'}`,
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                fontSize:11, fontWeight:800, cursor:'pointer', color:isToday?'#fff':'var(--text)',
                transition:'transform 0.12s',
              }}
              onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.08)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
                {d}
                {(isDeal||isBest)&&!isToday&&(
                  <div style={{ width:5, height:5, borderRadius:'50%', marginTop:2, background:isBest?'var(--s)':'var(--acc-dark)' }}/>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Store filter chips */}
      {stores.length > 0 && (
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          <button onClick={()=>setActiveStore(null)}
            className={`chip ${!activeStore?'s-active':''}`}>All stores</button>
          {stores.map((s:string)=>(
            <button key={s} onClick={()=>setActiveStore(activeStore===s?null:s)}
              className={`chip ${activeStore===s?'s-active':''}`}>
              {s.charAt(0).toUpperCase()+s.slice(1)}
            </button>
          ))}
        </div>
      )}

      {/* Deals list */}
      <div style={{ fontSize:13, fontWeight:900, color:'var(--text)' }}>
        🏷️ {activeStore ? `${activeStore.charAt(0).toUpperCase()+activeStore.slice(1)} Deals` : 'All Active Deals'}
        <span style={{ fontSize:11, color:'var(--muted)', fontWeight:700, marginLeft:6 }}>({filteredDeals.length})</span>
      </div>

      {filteredDeals.length === 0 ? (
        <div className="card" style={{ padding:20, textAlign:'center', color:'var(--muted)', fontWeight:700 }}>
          No deals loaded yet. Click 🔄 Refresh Ads to pull live data from store websites!
        </div>
      ) : (
        filteredDeals.slice(0,15).map((deal:any, i:number)=>{
          const store = deal.store_slug || deal.store || 'store'
          const sc    = STORE_COLORS[store] || {bg:'var(--p-light)',color:'var(--p-dark)'}
          const savings = deal.savings_amount || (deal.original_price && deal.deal_price ? (deal.original_price - deal.deal_price).toFixed(2) : null)
          return (
            <div key={i} className="card-hover" style={{ padding:'10px 14px', display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ fontSize:10, fontWeight:900, padding:'5px 9px', borderRadius:9, background:sc.bg, color:sc.color, minWidth:60, textAlign:'center', flexShrink:0 }}>
                {store.toUpperCase()}
                {deal.live && <div style={{ fontSize:8, opacity:0.7 }}>LIVE</div>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:800, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {deal.product_name || deal.name}
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', fontWeight:700, marginTop:1 }}>
                  {deal.deal_description || deal.dealType || 'Weekly Special'}
                  {deal.valid_from && !deal.live && ` · ${format(new Date(deal.valid_from),'MMM d')}–${format(new Date(deal.valid_to),'MMM d')}`}
                </div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                {deal.deal_price && <div className="font-display" style={{ fontSize:16, color:'var(--p-dark)' }}>${deal.deal_price}</div>}
                {savings && <div style={{ fontSize:10, fontWeight:800, color:'var(--p)' }}>-${savings}</div>}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
