'use client'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '@/store/appStore'
import { authApi } from '@/lib/api'

export function AuthModal({ onClose }: { onClose: () => void }) {
  const { setAuth } = useAppStore()
  const [mode, setMode]         = useState<'login' | 'register'>('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [name, setName]         = useState('')
  const [busy, setBusy]         = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [mounted, setMounted]   = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function submit() {
    setError(null)
    if (!email || !password) { setError('Email and password are required'); return }
    if (mode === 'register' && password.length < 8) { setError('Password must be at least 8 characters'); return }
    setBusy(true)
    try {
      const res = mode === 'login'
        ? await authApi.login(email, password)
        : await authApi.register(email, password, name || undefined)
      setAuth(res.user, res.token)
      onClose()
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const field: React.CSSProperties = {
    width:'100%', padding:'11px 14px', marginBottom:10, borderRadius:10,
    border:'1px solid rgba(255,255,255,0.12)', background:'rgba(255,255,255,0.05)',
    color:'white', fontSize:14, fontFamily:'Nunito,sans-serif', outline:'none', boxSizing:'border-box',
  }

  if (!mounted) return null

  const overlay = (
    <div
      onClick={onClose}
      style={{
        position:'fixed', top:0, left:0, right:0, bottom:0, zIndex:99999, display:'flex',
        alignItems:'center', justifyContent:'center',
        background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:'90%', maxWidth:380, padding:28, borderRadius:20,
          background:'rgba(10,16,28,0.98)', backdropFilter:'blur(24px)',
          border:'1px solid rgba(0,255,200,0.2)',
          boxShadow:'0 30px 80px rgba(0,0,0,0.7)', fontFamily:'Nunito,sans-serif',
        }}
      >
        <div style={{ fontSize:22, fontWeight:900, color:'white', marginBottom:4 }}>
          {mode === 'login' ? 'Welcome back' : 'Create your account'}
        </div>
        <div style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:20 }}>
          {mode === 'login' ? 'Sign in to sync your budget and deals.' : 'Join LeanSpend - eat lean, spend less.'}
        </div>

        {mode === 'register' && (
          <input style={field} placeholder="Name (optional)" value={name}
            onChange={e => setName(e.target.value)} />
        )}
        <input style={field} type="email" placeholder="Email" value={email}
          onChange={e => setEmail(e.target.value)} autoComplete="email" />
        <input style={field} type="password" placeholder="Password" value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') submit() }}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />

        {error && (
          <div style={{ fontSize:12, color:'#ff8a8a', marginBottom:10 }}>{error}</div>
        )}

        <button
          onClick={submit}
          disabled={busy}
          style={{
            width:'100%', padding:'12px', borderRadius:10, cursor: busy ? 'wait' : 'pointer',
            border:'none', background: busy ? 'rgba(0,255,200,0.3)' : '#00ffcc',
            color:'#04121a', fontSize:14, fontWeight:900, fontFamily:'Nunito,sans-serif',
            marginBottom:14,
          }}
        >
          {busy ? 'Please wait...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>

        <div style={{ textAlign:'center', fontSize:12, color:'rgba(255,255,255,0.5)' }}>
          {mode === 'login' ? "No account yet? " : 'Already have an account? '}
          <span
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            style={{ color:'#00ffcc', fontWeight:800, cursor:'pointer' }}
          >
            {mode === 'login' ? 'Create one' : 'Sign in'}
          </span>
        </div>
      </div>
    </div>
  )

  return createPortal(overlay, document.body)
}
