'use client'
import { useState } from 'react'
import { useAppStore } from '@/store/appStore'
import { authApi } from '@/lib/api'
import { AuthModal } from './AuthModal'

export function AuthButton() {
  const { auth, clearAuth } = useAppStore()
  const [open, setOpen]   = useState(false)
  const [modal, setModal] = useState(false)

  async function signOut() {
    try { await authApi.logout() } catch (_) {}
    clearAuth()
    setOpen(false)
  }

  if (!auth.user) {
    return (
      <>
        <button
          onClick={() => setModal(true)}
          style={{
            padding:'7px 16px', height:34, borderRadius:99, cursor:'pointer',
            border:'1px solid rgba(0,255,200,0.4)', background:'rgba(0,255,200,0.1)',
            color:'#00ffcc', fontSize:12, fontWeight:800, fontFamily:'Nunito,sans-serif',
            whiteSpace:'nowrap', transition:'all 0.2s',
          }}
        >
          Sign In
        </button>
        {modal && <AuthModal onClose={() => setModal(false)} />}
      </>
    )
  }

  const initial = (auth.user.name || auth.user.email || '?').charAt(0).toUpperCase()

  return (
    <div style={{ position:'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:8, height:34, padding:'0 6px 0 6px',
          borderRadius:99, cursor:'pointer', border:'1px solid rgba(255,255,255,0.12)',
          background:'rgba(255,255,255,0.06)', fontFamily:'Nunito,sans-serif',
        }}
      >
        <div style={{
          width:26, height:26, borderRadius:'50%',
          background:'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.6), rgba(167,139,250,0.4))',
          border:'1px solid rgba(255,255,255,0.25)', display:'flex',
          alignItems:'center', justifyContent:'center',
          fontSize:12, fontWeight:900, color:'white',
        }}>{initial}</div>
        <span style={{ fontSize:12, fontWeight:700, color:'rgba(255,255,255,0.8)', paddingRight:4 }}>
          {auth.user.name || auth.user.email}
        </span>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:42, right:0, zIndex:200, minWidth:160,
          background:'rgba(8,14,26,0.96)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(255,255,255,0.12)', borderRadius:14,
          padding:8, boxShadow:'0 20px 60px rgba(0,0,0,0.6)',
        }}>
          <div style={{ padding:'6px 10px', fontSize:11, color:'rgba(255,255,255,0.4)', wordBreak:'break-all' }}>
            {auth.user.email}
          </div>
          <button
            onClick={signOut}
            style={{
              width:'100%', textAlign:'left', padding:'8px 10px', borderRadius:8,
              cursor:'pointer', border:'none', background:'transparent',
              color:'#ff8a8a', fontSize:12, fontWeight:700, fontFamily:'Nunito,sans-serif',
            }}
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
