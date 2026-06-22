'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { dealsApi } from '@/lib/api'

const ICON_KW: [string, string][] = [
  ['chicken', '🍗'], ['turkey', '🦃'], ['beef', '🥩'], ['steak', '🥩'], ['pork', '🥓'], ['bacon', '🥓'], ['fish', '🐟'], ['salmon', '🐟'], ['tuna', '🐟'], ['shrimp', '🦐'],
  ['egg', '🥚'], ['milk', '🥛'], ['yogurt', '🥛'], ['cheese', '🧀'], ['butter', '🧈'], ['bread', '🍞'], ['rice', '🍚'], ['pasta', '🍝'], ['oat', '🥣'], ['cereal', '🥣'],
  ['banana', '🍌'], ['apple', '🍎'], ['orange', '🍊'], ['berry', '🫐'], ['grape', '🍇'], ['avocado', '🥑'], ['potato', '🥔'], ['tomato', '🍅'], ['carrot', '🥕'], ['broccoli', '🥦'],
  ['spinach', '🥬'], ['pepper', '🫑'], ['onion', '🧅'], ['corn', '🌽'], ['bean', '🫘'], ['nut', '🥜'], ['oil', '🫒'], ['coffee', '☕'], ['tea', '🍵'], ['water', '💧'],
  ['protein', '💪'], ['vitamin', '💊'], ['snack', '🍪'], ['chip', '🍟'], ['fitness', '🏋️'], ['util', '⚡'],
]
function guessIcon(n: string) { const l = (n || '').toLowerCase(); for (const [k, e] of ICON_KW) if (l.includes(k)) return e; return '🛒' }

const CSS = `
.sbl-wrap{position:fixed;top:92px;right:18px;width:340px;max-width:calc(100vw - 24px);z-index:60;font-family:Nunito,sans-serif;}
.sbl-card{background:linear-gradient(160deg,rgba(20,18,44,0.78),rgba(10,9,24,0.82));backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border:1.5px solid rgba(255,255,255,0.16);border-radius:24px;overflow:hidden;position:relative;box-shadow:0 24px 70px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.08);}
.sbl-head{display:flex;align-items:center;justify-content:space-between;padding:14px 18px;cursor:pointer;transition:background .15s;position:relative;z-index:2;}
.sbl-head:hover{background:rgba(255,255,255,0.05);}
.sbl-title{font-size:15px;font-weight:900;color:#fff;letter-spacing:-.2px;text-shadow:0 1px 8px rgba(0,0,0,0.7);}
.sbl-sub{font-size:10px;color:rgba(255,255,255,0.62);margin-top:-1px;font-weight:700;text-shadow:0 1px 6px rgba(0,0,0,0.6);}
.sbl-chev{color:rgba(255,255,255,0.6);font-size:11px;}
.sbl-body{padding:0 16px 16px;position:relative;z-index:2;}
.sbl-search{width:100%;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:13px;font-weight:700;border-radius:14px;padding:9px 14px;margin-bottom:12px;outline:none;font-family:Nunito,sans-serif;box-sizing:border-box;}
.sbl-search:focus{border-color:#00e0ff;}
.sbl-search::placeholder{color:rgba(255,255,255,0.4);}
.sbl-list{max-height:300px;overflow:auto;display:flex;flex-direction:column;gap:6px;padding-right:2px;}
.sbl-row{background:rgba(10,12,28,0.55);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:7px 11px;display:flex;align-items:center;gap:9px;}
.sbl-ico{font-size:15px;flex-shrink:0;}
.sbl-name{flex:1;min-width:0;font-size:12.5px;font-weight:600;color:#fff;letter-spacing:.1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer;}
.sbl-name.checked{text-decoration:line-through;opacity:.5;}
.sbl-price{font-size:11.5px;font-weight:700;color:#00e0ff;font-variant-numeric:tabular-nums;flex-shrink:0;}
.sbl-price.none{color:rgba(255,255,255,0.4);font-weight:700;}
.sbl-x{background:none;border:none;color:rgba(255,255,255,0.35);font-size:17px;line-height:1;cursor:pointer;flex-shrink:0;padding:0 2px;}
.sbl-x:hover{color:#ff4d6d;}
.sbl-empty{padding:22px 8px;text-align:center;color:rgba(255,255,255,0.45);font-size:12px;font-weight:700;line-height:1.5;}
.sbl-addrow{display:flex;gap:8px;margin-top:12px;}
.sbl-addinput{flex:1;background:rgba(0,0,0,0.4);border:1px solid rgba(255,255,255,0.1);color:#fff;font-size:13px;font-weight:700;border-radius:14px;padding:9px 13px;outline:none;font-family:Nunito,sans-serif;min-width:0;}
.sbl-addinput:focus{border-color:#00e0ff;}
.sbl-addinput::placeholder{color:rgba(255,255,255,0.4);}
.sbl-btn{border:none;border-radius:14px;font-size:12px;font-weight:900;cursor:pointer;font-family:Nunito,sans-serif;padding:9px 14px;color:#04121a;background:linear-gradient(135deg,#00e0ff,#7fd8ff);white-space:nowrap;}
.sbl-btn:disabled{opacity:.55;cursor:default;}
.sbl-tools{display:flex;gap:8px;margin-top:10px;}
.sbl-ghost{flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.8);border-radius:12px;font-size:11px;font-weight:800;padding:8px;cursor:pointer;font-family:Nunito,sans-serif;}
.sbl-ghost:disabled{opacity:.5;cursor:default;}
.sbl-msg{font-size:11px;color:rgba(255,255,255,0.55);font-weight:700;margin-top:8px;line-height:1.4;}
.sbl-launch{background:rgba(15,15,35,0.74);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.12);border-radius:18px;padding:11px 16px;color:#fff;font-weight:800;font-size:13px;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 12px 40px rgba(0,0,0,0.4);font-family:Nunito,sans-serif;}
.sbl-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;opacity:.95;pointer-events:none;}
.sbl-bgtint{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(8,8,20,0.42),rgba(8,8,20,0.14) 38%,rgba(8,8,20,0.30));}
.sbl-comet{position:absolute;top:0;right:-3%;width:82%;max-width:310px;z-index:6;pointer-events:none;}
@keyframes sblShoot{0%{transform:translate(0,0) scale(.6);opacity:0;}12%{opacity:1;transform:translate(-25px,15px) scale(1);}100%{transform:translate(-285px,170px) scale(.25);opacity:0;}}
.sbl-materialize{animation:sblMat 1300ms cubic-bezier(.23,1,.32,1) forwards;}
@keyframes sblMat{0%{opacity:0;transform:translateY(12px) scale(.92);box-shadow:0 0 0 0 rgba(0,224,255,.25);}40%{opacity:1;transform:translateY(0) scale(1);box-shadow:0 0 0 12px rgba(0,224,255,.06);}100%{box-shadow:0 0 0 0 rgba(0,224,255,0);}}
.sbl-shim{position:relative;overflow:hidden;}
.sbl-shim::after{content:'';position:absolute;top:0;left:-100%;width:45%;height:100%;background:linear-gradient(90deg,transparent,rgba(0,224,255,.6),transparent);animation:sblShim 900ms 350ms linear forwards;pointer-events:none;}
@keyframes sblShim{0%{left:-100%;}100%{left:250%;}}
@media (max-width:768px){.sbl-wrap{top:auto;bottom:14px;right:12px;left:12px;width:auto;max-width:none;}.sbl-list{max-height:210px;}}
`

export function StellarList() {
  const { shoppingList, pushListItem, removeListItem, toggleListItem, clearList, setListItemDeal } = useAppStore()
  const [open, setOpen] = useState(true)
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [animating, setAnimating] = useState(false)
  const [newId, setNewId] = useState<string | null>(null)
  const [scanning, setScanning] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [starKey, setStarKey] = useState(0)

  const filtered = shoppingList.filter(i => i.name.toLowerCase().includes(search.toLowerCase()))

  const addWithStar = () => {
    const name = input.trim()
    if (!name || animating) return
    setInput('')
    setAnimating(true)
    setStarKey(k => k + 1)
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
    // let the star streak across, then materialize the item behind its light
    setTimeout(() => {
      pushListItem({ id, name, checked: false, deal: undefined })
      setNewId(id)
    }, 600)
    setTimeout(() => { setAnimating(false); setNewId(null) }, 1600)
  }

  const scan = async () => {
    if (shoppingList.length === 0 || scanning) return
    setScanning(true); setMsg(null)
    try {
      const data: any = await dealsApi.getActive({ limit: 300 })
      const deals: any[] = data?.deals || []
      let found = 0
      for (const item of shoppingList) {
        const q = item.name.toLowerCase()
        const matches = deals.filter(d => { const n = String(d.product_name || '').toLowerCase(); return n && (n.includes(q) || q.includes(n)) })
        if (matches.length) {
          const best = matches.reduce((a, b) => (Number(a.deal_price) <= Number(b.deal_price) ? a : b))
          setListItemDeal(item.id, { price: Number(best.deal_price), store: best.store_name || best.store_slug || 'Store', product: best.product_name })
          found++
        } else { setListItemDeal(item.id, null) }
      }
      setMsg(found > 0 ? `Found deals for ${found} of ${shoppingList.length} item${shoppingList.length > 1 ? 's' : ''}.` : 'No current store deals matched. Try Near Me or Scanner.')
    } catch { setMsg('Could not scan deals right now - try again.') }
    finally { setScanning(false) }
  }

  return (
    <div className="sbl-wrap">
      <style>{CSS}</style>
      {!open ? (
        <button className="sbl-launch" onClick={() => setOpen(true)}>
          <span>🌌</span> Stellar List{shoppingList.length ? ` (${shoppingList.length})` : ''}
        </button>
      ) : (
        <div className="sbl-card">
          <video className="sbl-bg" src="/videos/list-bg.mp4" autoPlay loop muted playsInline />
          <div className="sbl-bgtint" />
          <div className="sbl-head" onClick={() => setOpen(false)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18 }}>✨</span>
              <div>
                <div className="sbl-title">Stellar Budget List</div>
                <div className="sbl-sub">Mission Control</div>
              </div>
            </div>
            <span className="sbl-chev">▼</span>
          </div>

          <div className="sbl-body">
            {shoppingList.length > 2 && (
              <input className="sbl-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search list..." />
            )}

            <div className="sbl-list">
              {filtered.length === 0 ? (
                <div className="sbl-empty">
                  {shoppingList.length === 0
                    ? 'Your list is empty. Add an item below, or ask LeanBot to "make a list of chicken, rice and eggs".'
                    : 'No matches.'}
                </div>
              ) : filtered.map(item => (
                <div key={item.id} className={'sbl-row' + (item.id === newId ? ' sbl-materialize' : '')}>
                  <span className="sbl-ico">{guessIcon(item.name)}</span>
                  <span className={'sbl-name' + (item.checked ? ' checked' : '') + (item.id === newId ? ' sbl-shim' : '')} onClick={() => toggleListItem(item.id)}>
                    {item.name}
                  </span>
                  <span className={'sbl-price' + (item.deal ? '' : ' none')}>
                    {item.deal ? `$${item.deal.price.toFixed(2)}` : (item.deal === null ? '—' : '·')}
                  </span>
                  <button className="sbl-x" onClick={() => removeListItem(item.id)} title="Remove">×</button>
                </div>
              ))}
            </div>

            <div className="sbl-addrow">
              <input className="sbl-addinput" value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addWithStar()} placeholder="Add an item..." />
              <button className="sbl-btn" onClick={addWithStar} disabled={!input.trim() || animating}>✨ Add</button>
            </div>

            <div className="sbl-tools">
              <button className="sbl-ghost" onClick={scan} disabled={scanning || shoppingList.length === 0}>
                {scanning ? 'Scanning…' : 'Find deals'}
              </button>
              {shoppingList.length > 0 && (
                <button className="sbl-ghost" onClick={() => { clearList(); setMsg(null) }}>Clear</button>
              )}
            </div>

            {msg && <div className="sbl-msg">{msg}</div>}

            {animating && <img key={starKey} className="sbl-comet" src="/videos/star.gif" alt="" />}
          </div>
        </div>
      )}
    </div>
  )
}
