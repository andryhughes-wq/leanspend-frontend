'use client'
import { useState, useEffect, useRef } from 'react'
import { geoApi } from '@/lib/api'

type Deal = {
  id: string
  product_name: string
  brand?: string
  store_name?: string
  price: number
  zip?: string
  latitude?: number | null
  longitude?: number | null
  distance_miles: number
  status: string
}

type Store = { id: number; name: string; lat: number; lng: number; brand?: string; distance: number }

const escHtml = (v: any) => String(v ?? '').replace(/[&<>"]/g, (c: string) => (({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as any)[c]))
const milesBetween = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const R = 3959, dLat = (bLat - aLat) * Math.PI / 180, dLng = (bLng - aLng) * Math.PI / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * Math.PI / 180) * Math.cos(bLat * Math.PI / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
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
  const [stores, setStores] = useState<Store[]>([])
  const [storesBusy, setStoresBusy] = useState(false)
  const [storesErr, setStoresErr] = useState<string | null>(null)
  const mapDivRef = useRef<HTMLDivElement>(null); const mapObj = useRef<any>(null); const mapLayer = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)
  const [mapErr, setMapErr] = useState<string | null>(null)

  useEffect(() => {
    if ((window as any).L) { setMapReady(true); return }
    if (!document.getElementById('leaflet-css')) {
      const css = document.createElement('link'); css.id = 'leaflet-css'; css.rel = 'stylesheet'
      css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css)
    }
    if (!document.getElementById('leaflet-js')) {
      const js = document.createElement('script'); js.id = 'leaflet-js'
      js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; js.async = true
      js.onload = () => setMapReady(true); document.body.appendChild(js)
    }
  }, [])

  useEffect(() => () => {
    if (mapObj.current) { try { mapObj.current.remove() } catch {} ; mapObj.current = null }
  }, [])

  // Fetch all grocery stores in radius from OpenStreetMap (Overpass, no key)
  useEffect(() => {
    if (lat == null || lng == null) return
    let cancelled = false
    setStoresBusy(true); setStoresErr(null)
    const meters = Math.round(radius * 1609.34)
    const ql = `[out:json][timeout:25];(node["shop"~"supermarket|grocery|greengrocer"](around:${meters},${lat},${lng});way["shop"~"supermarket|grocery|greengrocer"](around:${meters},${lat},${lng}););out center 120 tags;`
    const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']
    const tryFetch = async () => {
      let lastErr: any = null
      for (const url of endpoints) {
        try {
          const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(ql) })
          if (!r.ok) { lastErr = new Error('status ' + r.status); continue }
          return await r.json()
        } catch (e) { lastErr = e }
      }
      throw lastErr || new Error('all endpoints failed')
    }
    tryFetch()
      .then(j => {
        if (cancelled) return
        const out: Store[] = (j.elements || []).map((e: any) => {
          const elat = e.lat ?? e.center?.lat, elng = e.lon ?? e.center?.lon
          return { id: e.id, name: e.tags?.name || e.tags?.brand || 'Grocery store', brand: e.tags?.brand, lat: elat, lng: elng, distance: (elat != null && elng != null) ? milesBetween(lat, lng, elat, elng) : 999 }
        }).filter((s: Store) => s.lat != null && s.lng != null).sort((a: Store, b: Store) => a.distance - b.distance).slice(0, 80)
        setStores(out); setStoresBusy(false)
      })
      .catch(() => { if (!cancelled) { setStoresErr('Could not load grocery stores right now - try again.'); setStoresBusy(false) } })
    return () => { cancelled = true }
  }, [lat, lng, radius])

  // ONE lightweight canvas map: radius circle + grocery-store pins + deal pins
  useEffect(() => {
    const L = (window as any).L
    if (!mapReady || !L || lat == null || lng == null || !mapDivRef.current) return
    try {
      if (!mapObj.current) {
        mapObj.current = L.map(mapDivRef.current, { preferCanvas: true, scrollWheelZoom: true, zoomAnimation: false, fadeAnimation: false, markerZoomAnimation: false, maxZoom: 16 })
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', { maxZoom: 16, crossOrigin: true, attribution: '&copy; OpenStreetMap &copy; CARTO' }).addTo(mapObj.current)
        mapLayer.current = L.layerGroup().addTo(mapObj.current)
      }
      const m = mapObj.current; mapLayer.current.clearLayers()
      const center: [number, number] = [lat, lng]
      const c = L.circle(center, { radius: radius * 1609.34, color: '#00ffcc', weight: 1.5, fillColor: '#00ffcc', fillOpacity: 0.05 }).addTo(mapLayer.current)
      L.circleMarker(center, { radius: 7, color: '#fff', weight: 2, fillColor: '#00ffcc', fillOpacity: 1 }).addTo(mapLayer.current).bindPopup('You are here')
      stores.forEach(s2 => {
        L.circleMarker([s2.lat, s2.lng], { radius: 6, color: '#04121a', weight: 1, fillColor: '#5b9cff', fillOpacity: 0.95 }).addTo(mapLayer.current)
          .bindPopup('<b>' + escHtml(s2.name) + '</b><br>' + s2.distance.toFixed(1) + ' mi away')
      })
      deals.forEach(d => {
        if (d.latitude == null || d.longitude == null) return
        L.circleMarker([d.latitude, d.longitude], { radius: 6, color: '#04121a', weight: 1, fillColor: '#ffd54a', fillOpacity: 0.95 }).addTo(mapLayer.current)
          .bindPopup('<b>' + escHtml(d.store_name || 'Store') + '</b><br>' + escHtml(d.product_name) + ' &mdash; $' + Number(d.price).toFixed(2) + '<br>' + d.distance_miles.toFixed(1) + ' mi away')
      })
      m.fitBounds(c.getBounds(), { padding: [24, 24] })
      setTimeout(() => { try { m.invalidateSize() } catch {} }, 120)
      setMapErr(null)
    } catch {
      setMapErr('Map could not load on this device.')
    }
  }, [mapReady, lat, lng, radius, deals, stores])

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

      {lat != null && lng != null && (
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>Stores &amp; deals near you</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)' }}>
              <span style={{ color: '#5b9cff' }}>&#9679;</span> {storesBusy ? 'stores...' : stores.length + ' stores'} &nbsp;&nbsp; <span style={{ color: '#ffd54a' }}>&#9679;</span> {deals.length} deals
            </span>
          </div>
          <div ref={mapDivRef} style={{ width: '100%', height: 340, background: 'rgba(255,255,255,0.03)' }} />
          {mapErr && <div style={{ padding: '10px 16px', color: '#ff8a8a', fontSize: 12 }}>{mapErr}</div>}
          {storesErr && <div style={{ padding: '10px 16px', color: '#ff8a8a', fontSize: 12 }}>{storesErr}</div>}
          {stores.length > 0 && (
            <div style={{ maxHeight: 168, overflowY: 'auto', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              {stores.map(s2 => (
                <div key={s2.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: 13 }}>
                  <span style={{ color: 'white', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s2.name}</span>
                  <span style={{ color: '#00ffcc', fontWeight: 800, flexShrink: 0, marginLeft: 10 }}>{s2.distance.toFixed(1)} mi</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
