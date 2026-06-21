"use client"
import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { dealsApi } from '@/lib/api'

const card: React.CSSProperties = { background: 'var(--card)', border: '2px solid var(--border)', borderRadius: 16, fontFamily: 'Nunito,sans-serif' }

export function ListTab() {
  const { shoppingList, addListItem, removeListItem, toggleListItem, clearList, setListItemDeal } = useAppStore()
  const [input, setInput] = useState('')
  const [scanning, setScanning] = useState(false)
  const [scanMsg, setScanMsg] = useState<string | null>(null)

  const add = () => { if (input.trim()) { addListItem(input); setInput('') } }

  const scan = async () => {
    if (shoppingList.length === 0 || scanning) return
    setScanning(true); setScanMsg(null)
    try {
      const data: any = await dealsApi.getActive({ limit: 300 })
      const deals: any[] = data?.deals || []
      let found = 0
      for (const item of shoppingList) {
        const q = item.name.toLowerCase()
        const matches = deals.filter(d => {
          const n = String(d.product_name || '').toLowerCase()
          return n && (n.includes(q) || q.includes(n))
        })
        if (matches.length) {
          const best = matches.reduce((a, b) => (Number(a.deal_price) <= Number(b.deal_price) ? a : b))
          setListItemDeal(item.id, { price: Number(best.deal_price), store: best.store_name || best.store_slug || 'Store', product: best.product_name })
          found++
        } else {
          setListItemDeal(item.id, null)
        }
      }
      setScanMsg(found > 0
        ? `Found current deals for ${found} of ${shoppingList.length} item${shoppingList.length > 1 ? 's' : ''}.`
        : 'No current store deals matched your list. Try the Near Me or Scanner tabs for more prices.')
    } catch {
      setScanMsg('Could not scan for deals right now - please try again.')
    } finally {
      setScanning(false)
    }
  }

  // auto-scan once when arriving with unscanned items
  useEffect(() => {
    if (shoppingList.length > 0 && shoppingList.every(i => i.deal === undefined)) scan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const withDeals = shoppingList.filter(i => i.deal)
  const total = withDeals.reduce((sum, i) => sum + (i.deal ? i.deal.price : 0), 0)

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 26, fontWeight: 900, color: 'var(--text)', margin: 0 }}>My Shopping List</h2>
        <p style={{ color: 'var(--muted)', fontWeight: 700, margin: '4px 0 0', fontSize: 14 }}>
          Add what you need, then scan your stores for the best current price on each item.
        </p>
      </div>

      <div style={{ ...card, padding: 14, display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add an item (e.g. chicken breast, eggs, rice)..."
          style={{ flex: 1, padding: '11px 14px', border: '2px solid var(--border)', borderRadius: 12, fontSize: 14, fontWeight: 700, background: 'var(--bg)', color: 'var(--text)', outline: 'none', fontFamily: 'Nunito,sans-serif' }}
        />
        <button onClick={add} disabled={!input.trim()}
          style={{ background: 'var(--p)', color: '#04121a', border: 'none', borderRadius: 12, padding: '0 20px', fontSize: 14, fontWeight: 900, cursor: input.trim() ? 'pointer' : 'default', opacity: input.trim() ? 1 : 0.5, fontFamily: 'Nunito,sans-serif' }}>
          Add
        </button>
      </div>

      {shoppingList.length > 0 && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={scan} disabled={scanning}
            style={{ background: 'var(--pu)', color: '#fff', border: 'none', borderRadius: 12, padding: '10px 18px', fontSize: 13, fontWeight: 900, cursor: scanning ? 'default' : 'pointer', opacity: scanning ? 0.6 : 1, fontFamily: 'Nunito,sans-serif' }}>
            {scanning ? 'Scanning deals...' : 'Find deals'}
          </button>
          <button onClick={() => { clearList(); setScanMsg(null) }}
            style={{ background: 'transparent', color: 'var(--muted)', border: '2px solid var(--border)', borderRadius: 12, padding: '10px 16px', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito,sans-serif' }}>
            Clear list
          </button>
          <span style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 700, marginLeft: 'auto' }}>
            {shoppingList.length} item{shoppingList.length > 1 ? 's' : ''}
          </span>
        </div>
      )}

      {scanMsg && <div style={{ color: 'var(--muted)', fontSize: 13, fontWeight: 700 }}>{scanMsg}</div>}

      {shoppingList.length === 0 ? (
        <div style={{ ...card, padding: 40, textAlign: 'center', color: 'var(--muted)', fontWeight: 700 }}>
          Your list is empty. Add items above, or ask LeanBot to "make a shopping list of chicken, rice, and broccoli".
        </div>
      ) : (
        <div style={{ ...card, overflow: 'hidden' }}>
          {shoppingList.map(item => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
              <input type="checkbox" checked={item.checked} onChange={() => toggleListItem(item.id)}
                style={{ width: 18, height: 18, accentColor: 'var(--p)', cursor: 'pointer', flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--text)', textDecoration: item.checked ? 'line-through' : 'none', opacity: item.checked ? 0.55 : 1 }}>
                  {item.name}
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 2,
                  color: item.deal ? 'var(--p)' : (item.deal === null ? 'var(--muted)' : 'var(--faint)') }}>
                  {item.deal
                    ? `$${item.deal.price.toFixed(2)} at ${item.deal.store}`
                    : (item.deal === null ? 'No current deal found' : 'Not scanned yet')}
                </div>
              </div>
              <button onClick={() => removeListItem(item.id)}
                style={{ background: 'none', border: 'none', color: 'var(--muted)', fontSize: 20, lineHeight: 1, cursor: 'pointer', flexShrink: 0, padding: 4 }}
                title="Remove">&times;</button>
            </div>
          ))}
          {withDeals.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '13px 16px', fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>
              <span>Best-price total ({withDeals.length} with deals)</span>
              <span style={{ color: 'var(--p)' }}>${total.toFixed(2)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
