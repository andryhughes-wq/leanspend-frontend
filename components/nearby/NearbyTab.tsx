'use client'
import { useState } from 'react'
import { geoApi } from '@/lib/api'

type Deal = {
  id: string
  product_name: string
  brand?: string
  store_name?: string
  price: number
  zip?: string
  distance_miles: number
  status: string
}

export function NearbyTab() {
  const [lat, setLat]       = useState<number | null>(null)
  const [lng, setLng]       = useState<number | null>(null)
  const [zip, setZip]       = useState('')
  const [radius, setRadius] = useState(25)
  const [deals, setDeals]   = useState<Deal[]>([])
  const [busy, setBusy]     = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [searched, setSearched] = useState(false)

  function useMyLocation() {
    setError(null)
    if (!navigator.geolocation) { setError('Geolocation is not supported by your browser'); return }
    setBusy(true)
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
        setBusy(false)
        runSearch(pos.coords.latitude, pos.coords.longitude, radius)
      },
      () => { setBusy(false); setError('Could not get your location. Try entering a ZIP instead.') },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function searchByZip() {
    setError(null)
    if (!/^\d{5}$/.test(zip)) { setError('Enter a valid 5-digit ZIP code'); return }
    setBusy(true)
    try {
      // Free ZIP-to-coordinates via Zippopotam (no key required)
      const res = await fetch(`https://api.zippopotam.us/us/${zip}`)
      if (!res.ok) throw new Error('ZIP not found')
      const data = await res.json()
      const place = data.places[0]
      const zlat = parseFloat(place.latitude)
      const zlng = parseFloat(place.longitude)
      setLat(zlat); setLng(zlng)
      await runSearch(zlat, zlng, radius)
    } catch (e: any) {
      setError('Could not find that ZIP code')
      setBusy(false)
    }
  }

  async function runSearch(searchLat: number, searchLng: number, r: number) {
    setBusy(true)
    setError(null)
    try {
      const data = await geoApi.nearby(searchLat, searchLng, r)
      setDeals(data.deals || [])
      setSearched(true)
    } catch (e: any) {
      setError(e.message || 'Search failed')
    } finally {
      setBusy(false)
    }
  }

  function changeRadius(r: number) {
    setRadius(r)
    if (lat != null && lng != null) runSearch(lat, lng, r)
  }

  const card: React.CSSProperties = {
    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.1)',
    borderRadius:16, padding:20, marginBottom:16,
  }
  const radii = [5, 10, 25, 50]

  return (
    <div style={{ maxWidth:760, margin:'0 auto', padding:'8px 0', fontFamily:'Nunito,sans-serif' }}>
      <div style={{ fontSize:26, fontWeight:900, color:'white', marginBottom:4 }}>Deals Near You</div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', marginBottom:20 }}>
        Find community-submitted prices around you. The more people scan, the better it gets.
      </div>

      <div style={card}>
        <button
          onClick={useMyLocation}
          disabled={busy}
          style={{
            width:'100%', padding:'13px', borderRadius:12, marginBottom:14,
            border:'none', cursor: busy ? 'wait' : 'pointer', background:'#00ffcc',
            color:'#04121a', fontSize:15, fontWeight:900, fontFamily:'Nunito,sans-serif',
          }}
        >
          {busy ? 'Locating...' : 'Use my location'}
        </button>

        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          <input
            value={zip}
            onChange={e => setZip(e.target.value.replace(/\D/g, '').slice(0,5))}
            onKeyDown={e => { if (e.key === 'Enter') searchByZip() }}
            placeholder="Or enter ZIP code"
            style={{
              flex:1, padding:'11px 14px', borderRadius:10, outline:'none',
              border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)',
              color:'white', fontSize:14, fontFamily:'Nunito,sans-serif',
            }}
          />
          <button
            onClick={searchByZip}
            disabled={busy}
            style={{
              padding:'0 20px', borderRadius:10, cursor:'pointer',
              border:'1px solid rgba(0,255,200,0.4)', background:'rgba(0,255,200,0.1)',
              color:'#00ffcc', fontSize:14, fontWeight:800, fontFamily:'Nunito,sans-serif',
            }}
          >
            Go
          </button>
        </div>

        <div style={{ display:'flex', gap:8 }}>
          {radii.map(r => (
            <button
              key={r}
              onClick={() => changeRadius(r)}
              style={{
                flex:1, padding:'8px', borderRadius:99, cursor:'pointer',
                border: radius === r ? '1px solid #00ffcc' : '1px solid rgba(255,255,255,0.12)',
                background: radius === r ? 'rgba(0,255,200,0.15)' : 'transparent',
                color: radius === r ? '#00ffcc' : 'rgba(255,255,255,0.6)',
                fontSize:13, fontWeight:800, fontFamily:'Nunito,sans-serif',
              }}
            >
              {r} mi
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ ...card, borderColor:'rgba(255,138,138,0.4)', color:'#ff8a8a', fontSize:13 }}>
          {error}
        </div>
      )}

      {searched && !busy && deals.length === 0 && !error && (
        <div style={{ ...card, textAlign:'center', color:'rgba(255,255,255,0.5)', fontSize:14 }}>
          No deals submitted within {radius} miles yet. Be the first - scan a product on the Scanner tab!
        </div>
      )}

      {deals.map(d => (
        <div key={d.id} style={{ ...card, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:800, color:'white' }}>{d.product_name}</div>
            <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>
              {d.store_name || 'Unknown store'} - {d.distance_miles.toFixed(1)} mi away
              {d.status === 'pending' && ' - unconfirmed'}
            </div>
          </div>
          <div style={{ fontSize:22, fontWeight:900, color:'#00ffcc' }}>
            ${Number(d.price).toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  )
}
