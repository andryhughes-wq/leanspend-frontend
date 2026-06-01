'use client'
import { geoApi } from '@/lib/api'
import { useAppStore } from '@/store/appStore'
import { useState, useRef, useEffect } from 'react'

const STORES = ['Kroger','Walmart','HEB','Target','Aldi','Costco',"Sam's Club",'Safeway','Randalls']
const STORAGE_KEY = 'leanspend-scans'

type Scan = {
  id: string; barcode: string; name: string; brand: string;
  price: number; store: string; nutrition: string; at: string;
}

function loadScans(): Scan[] {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function saveScans(list: Scan[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)) } catch {}
}

export function ScannerTab() {
  const [scanning, setScanning] = useState(false)
  const [status, setStatus] = useState('')
  const [barcode, setBarcode] = useState('')
  const [product, setProduct] = useState<{name:string;brand:string;nutrition:string} | null>(null)
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState('')
  const [store, setStore] = useState(STORES[0])
  const [saved, setSaved] = useState<Scan[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<any>(null)

  useEffect(() => { setSaved(loadScans()) }, [])

  const stopCamera = () => {
    try { controlsRef.current?.stop() } catch {}
    controlsRef.current = null
    setScanning(false)
  }

  const startCamera = async () => {
    setStatus('Starting camera...')
    setScanning(true)
    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()
      controlsRef.current = await reader.decodeFromVideoDevice(undefined, videoRef.current!, (result, err) => {
        if (result) {
          const code = result.getText()
          setBarcode(code)
          stopCamera()
          lookup(code)
        }
      })
      setStatus('Point the camera at a barcode')
    } catch (e: any) {
      setStatus('Camera unavailable. You can type the barcode manually below.')
      setScanning(false)
    }
  }

  useEffect(() => () => stopCamera(), [])

  const lookup = async (code: string) => {
    if (!code) return
    setLoading(true); setProduct(null); setStatus('')
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json?fields=product_name,brands,nutriments`, {
        headers: { 'User-Agent': 'LeanSpend/1.0 (leanspend app)' }
      })
      const data = await res.json()
      if (data.status === 1 && data.product) {
        const p = data.product
        const n = p.nutriments || {}
        const cal = n['energy-kcal_100g'] ?? n['energy-kcal'] ?? null
        const prot = n['proteins_100g'] ?? null
        const parts: string[] = []
        if (cal != null) parts.push(`${Math.round(cal)} cal`)
        if (prot != null) parts.push(`${prot}g protein`)
        setProduct({
          name: p.product_name || 'Unknown product',
          brand: p.brands || '',
          nutrition: parts.length ? `Per 100g: ${parts.join(', ')}` : 'No nutrition data available',
        })
      } else {
        setProduct({ name: 'Product not found in database', brand: '', nutrition: 'You can still record the price and store below.' })
      }
    } catch {
      setProduct({ name: 'Lookup failed', brand: '', nutrition: 'Check your connection, or record the price manually.' })
    }
    setLoading(false)
  }

  const { auth } = useAppStore()
  const save = () => {
    if (barcode && price) {
      const send = (lat, lng) => geoApi.submit({
        productName: product?.name || 'Unknown',
        brand: product?.brand || undefined,
        storeName: store,
        price: parseFloat(price),
        barcode,
        latitude: lat,
        longitude: lng,
      }).then(() => setStatus('✓ Shared to community')).catch((e: any) => setStatus('✗ Submit failed (' + (e?.response?.status || e?.message || 'network') + ')'))
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => send(pos.coords.latitude, pos.coords.longitude),
          () => setStatus('⚠ Location blocked'),
          { timeout: 8000 }
        )
      } else { send(undefined, undefined) }
    }
    if (!barcode || !price) { setStatus('Enter a barcode and price first.'); return }
    const scan: Scan = {
      id: Date.now().toString(), barcode,
      name: product?.name || 'Unknown', brand: product?.brand || '',
      price: parseFloat(price), store, nutrition: product?.nutrition || '',
      at: new Date().toISOString(),
    }
    const next = [scan, ...saved]
    setSaved(next); saveScans(next)
    setBarcode(''); setPrice(''); setProduct(null); setStatus('Saved! (stored on this device for now)')
  }

  const remove = (id: string) => {
    const next = saved.filter(s => s.id !== id)
    setSaved(next); saveScans(next)
  }

  const card: React.CSSProperties = {
    background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, padding:'1rem',
  }
  const input: React.CSSProperties = {
    width:'100%', padding:'10px 12px', borderRadius:10, fontSize:14, boxSizing:'border-box',
    background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', color:'white',
  }

  return (
    <div style={{ padding:'0 0 40px', maxWidth:560 }}>
      <div style={{ marginBottom:16 }}>
        <div style={{ fontSize:22, fontWeight:800, color:'white', fontFamily:'Nunito,sans-serif' }}>Scanner</div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}>Scan a barcode, check the product, log the price you see in store</div>
      </div>

      <div style={{ ...card, marginBottom:12 }}>
        <video ref={videoRef} style={{ width:'100%', borderRadius:12, background:'#000', display:scanning?'block':'none', maxHeight:280, objectFit:'cover' }} />
        {!scanning ? (
          <button onClick={startCamera} style={{
            width:'100%', padding:'12px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700,
            background:'rgba(0,255,200,0.1)', border:'1px solid rgba(0,255,200,0.35)', color:'#00ffcc',
          }}>Start Camera Scan</button>
        ) : (
          <button onClick={stopCamera} style={{
            width:'100%', marginTop:10, padding:'10px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700,
            background:'rgba(255,107,107,0.1)', border:'1px solid rgba(255,107,107,0.35)', color:'#ff6b6b',
          }}>Stop Camera</button>
        )}
        {status && <div style={{ marginTop:10, fontSize:12, color:'rgba(255,255,255,0.5)', textAlign:'center' }}>{status}</div>}
      </div>

      <div style={{ ...card, marginBottom:12, display:'flex', flexDirection:'column', gap:10 }}>
        <div style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.5)' }}>Or enter a barcode manually</div>
        <div style={{ display:'flex', gap:8 }}>
          <input style={input} value={barcode} onChange={e=>setBarcode(e.target.value)} placeholder="Barcode number" inputMode="numeric" />
          <button onClick={()=>lookup(barcode)} style={{
            padding:'0 16px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:700, whiteSpace:'nowrap',
            background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.15)', color:'white',
          }}>{loading?'...':'Look up'}</button>
        </div>

        {product && (
          <div style={{ padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize:15, fontWeight:800, color:'white' }}>{product.name}</div>
            {product.brand && <div style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{product.brand}</div>}
            <div style={{ fontSize:12, color:'#6BCB77', marginTop:4 }}>{product.nutrition}</div>
          </div>
        )}

        <div style={{ display:'flex', gap:8 }}>
          <input style={{ ...input, flex:1 }} value={price} onChange={e=>setPrice(e.target.value)} placeholder="Price ($)" inputMode="decimal" />
          <select style={{ ...input, flex:1 }} value={store} onChange={e=>setStore(e.target.value)}>
            {STORES.map(s => <option key={s} value={s} style={{ background:'#0a1220' }}>{s}</option>)}
          </select>
        </div>
        <button onClick={save} style={{
          width:'100%', padding:'12px', borderRadius:10, cursor:'pointer', fontSize:14, fontWeight:800,
          background:'rgba(0,255,200,0.12)', border:'1px solid rgba(0,255,200,0.4)', color:'#00ffcc',
        }}>Save This Price</button>
      </div>

      {saved.length > 0 && (
        <div style={card}>
          <div style={{ fontSize:12, fontWeight:800, color:'rgba(255,255,255,0.4)', letterSpacing:'0.6px', textTransform:'uppercase', marginBottom:10 }}>Your Saved Scans</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {saved.map(s => (
              <div key={s.id} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 10px', borderRadius:10, background:'rgba(255,255,255,0.03)' }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:'white' }}>{s.name}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{s.store} - {s.barcode}</div>
                </div>
                <div style={{ fontSize:15, fontWeight:800, color:'#6BCB77' }}>${s.price.toFixed(2)}</div>
                <button onClick={()=>remove(s.id)} style={{ background:'none', border:'none', color:'rgba(255,107,107,0.7)', cursor:'pointer', fontSize:16 }}>x</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop:16, fontSize:11, color:'rgba(255,255,255,0.3)', textAlign:'center', lineHeight:1.5 }}>
        Scans are saved on this device for now. Once accounts are live, confirmed prices from multiple shoppers will power a shared community deals feed. Nutrition data from Open Food Facts.
      </div>
    </div>
  )
}
