'use client'
import { useEffect, useRef, useState } from 'react'

interface BubbleProps {
  size: number
  style?: React.CSSProperties
  onPop?: (x:number,y:number) => void
  color?: 'default'|'gold'|'coral'|'teal'|'lavender'
}

export function RealisticBubble({ size, style, onPop, color='default' }: BubbleProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [alive, setAlive] = useState(true)
  const rafRef = useRef(0)
  const frameRef = useRef(0)
  const hueMap = { default:200, gold:45, coral:15, teal:175, lavender:270 }
  const hue = hueMap[color]

  useEffect(() => {
    if (!alive) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = window.devicePixelRatio||1
    const S = size * dpr
    canvas.width = S; canvas.height = S
    const R = S/2

    const draw = () => {
      frameRef.current++
      const f = frameRef.current
      ctx.clearRect(0,0,S,S)
      const base = ctx.createRadialGradient(R,R,0,R,R,R)
      base.addColorStop(0,`hsla(${hue},40%,90%,0.06)`)
      base.addColorStop(0.7,`hsla(${hue},60%,70%,0.04)`)
      base.addColorStop(1,`hsla(${hue},80%,60%,0.02)`)
      ctx.beginPath(); ctx.arc(R,R,R*0.97,0,Math.PI*2)
      ctx.fillStyle=base; ctx.fill()
      const phase = f*0.018
      const iri = ctx.createConicGradient(phase,R,R)
      const stops:[number,string][] = [
        [0,`hsla(${hue},85%,72%,0.22)`],[0.14,`hsla(${hue+40},90%,78%,0.18)`],
        [0.28,`hsla(${hue+80},88%,74%,0.20)`],[0.42,`hsla(${hue+130},86%,70%,0.18)`],
        [0.57,`hsla(${hue+180},90%,76%,0.22)`],[0.71,`hsla(${hue+220},88%,72%,0.18)`],
        [0.85,`hsla(${hue+280},85%,68%,0.20)`],[1,`hsla(${hue},85%,72%,0.22)`],
      ]
      stops.forEach(([p,c]) => iri.addColorStop(p,c))
      ctx.beginPath(); ctx.arc(R,R,R*0.97,0,Math.PI*2)
      ctx.fillStyle=iri; ctx.fill()
      const rim = ctx.createRadialGradient(R,R,R*0.62,R,R,R*0.97)
      rim.addColorStop(0,'transparent')
      rim.addColorStop(0.6,`hsla(${hue},60%,88%,0.08)`)
      rim.addColorStop(0.85,`hsla(${hue},70%,92%,0.18)`)
      rim.addColorStop(1,`hsla(${hue},80%,96%,0.28)`)
      ctx.beginPath(); ctx.arc(R,R,R*0.97,0,Math.PI*2)
      ctx.fillStyle=rim; ctx.fill()
      const sx=R*0.62,sy=R*0.3
      const spec1=ctx.createRadialGradient(sx,sy,0,sx,sy,R*0.32)
      spec1.addColorStop(0,'rgba(255,255,255,0.92)')
      spec1.addColorStop(0.25,'rgba(255,255,255,0.6)')
      spec1.addColorStop(0.6,'rgba(255,255,255,0.15)')
      spec1.addColorStop(1,'transparent')
      ctx.save(); ctx.translate(sx,sy); ctx.scale(1.4,0.85); ctx.translate(-sx,-sy)
      ctx.beginPath(); ctx.arc(sx,sy,R*0.32,0,Math.PI*2)
      ctx.fillStyle=spec1; ctx.fill(); ctx.restore()
      const sx2=R*1.32,sy2=R*1.48
      const spec2=ctx.createRadialGradient(sx2,sy2,0,sx2,sy2,R*0.18)
      spec2.addColorStop(0,'rgba(255,255,255,0.35)')
      spec2.addColorStop(0.5,'rgba(255,255,255,0.12)')
      spec2.addColorStop(1,'transparent')
      ctx.save(); ctx.translate(sx2,sy2); ctx.scale(1,0.7); ctx.translate(-sx2,-sy2)
      ctx.beginPath(); ctx.arc(sx2,sy2,R*0.18,0,Math.PI*2)
      ctx.fillStyle=spec2; ctx.fill(); ctx.restore()
      const env=ctx.createRadialGradient(R,R,0,R,R,R*0.55)
      env.addColorStop(0,`hsla(${hue},50%,85%,0.05)`)
      env.addColorStop(1,'transparent')
      ctx.beginPath(); ctx.arc(R,R,R*0.55,0,Math.PI*2)
      ctx.fillStyle=env; ctx.fill()
      ctx.beginPath(); ctx.arc(R,R,R*0.96,0,Math.PI*2)
      const rimS=ctx.createLinearGradient(0,0,S,S)
      rimS.addColorStop(0,`hsla(${hue},80%,88%,0.45)`)
      rimS.addColorStop(0.33,`hsla(${hue+90},85%,85%,0.35)`)
      rimS.addColorStop(0.66,`hsla(${hue+180},80%,90%,0.45)`)
      rimS.addColorStop(1,`hsla(${hue+270},85%,88%,0.35)`)
      ctx.strokeStyle=rimS; ctx.lineWidth=S*0.016; ctx.stroke()
      rafRef.current=requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(rafRef.current)
  },[alive,size,hue])

  if (!alive) return null
  return (
    <canvas ref={canvasRef} width={size} height={size}
      onClick={e=>{setAlive(false);cancelAnimationFrame(rafRef.current);onPop?.(e.clientX,e.clientY)}}
      style={{width:size,height:size,cursor:'pointer',
        filter:`drop-shadow(0 ${Math.round(size*0.08)}px ${Math.round(size*0.15)}px rgba(0,0,0,0.22))`,
        animation:`floatBubble ${(3.5+(size%9)*0.35).toFixed(1)}s ease-in-out infinite`,
        ...style}}
      onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.1)')}
      onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}
    />
  )
}
