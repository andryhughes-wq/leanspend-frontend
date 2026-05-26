'use client'
import { useEffect, useRef } from 'react'

export function GalaxyBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let raf = 0
    let W = 0, H = 0

    const resize = () => {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Stars
    const NUM_STARS = 320
    const stars = Array.from({ length: NUM_STARS }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.6 + 0.2,
      speed: Math.random() * 0.00008 + 0.00002,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.04 + 0.01,
      color: ['#ffffff','#cce8ff','#ffe8cc','#e8ccff','#ccffe8'][Math.floor(Math.random()*5)],
    }))

    // Nebula clouds
    const nebulas = [
      { cx:0.18, cy:0.42, rx:0.28, ry:0.32, color:'rgba(0,160,120,0.055)',  rot:0,    speed:0.00008 },
      { cx:0.78, cy:0.22, rx:0.32, ry:0.24, color:'rgba(120,30,180,0.06)',  rot:0.5,  speed:-0.00006 },
      { cx:0.62, cy:0.75, rx:0.26, ry:0.30, color:'rgba(0,100,200,0.055)', rot:1.2,  speed:0.00007 },
      { cx:0.88, cy:0.60, rx:0.22, ry:0.28, color:'rgba(180,40,80,0.045)',  rot:2.1,  speed:-0.00005 },
      { cx:0.35, cy:0.82, rx:0.30, ry:0.20, color:'rgba(0,180,200,0.04)',   rot:0.8,  speed:0.00009 },
      { cx:0.50, cy:0.12, rx:0.35, ry:0.18, color:'rgba(80,0,160,0.04)',    rot:1.6,  speed:-0.00007 },
    ]

    // Shooting stars
    const shoots: {x:number,y:number,vx:number,vy:number,life:number,maxLife:number,size:number}[] = []
    let nextShoot = 200

    // Galaxy spiral
    const spiralPoints: {x:number,y:number,r:number,a:number,speed:number}[] = []
    for (let i = 0; i < 180; i++) {
      const arm   = i % 3
      const t     = (i / 180) * Math.PI * 6
      const dist  = 0.04 + (i / 180) * 0.18
      const angle = t + (arm * Math.PI * 2 / 3)
      spiralPoints.push({
        x: 0.5 + Math.cos(angle) * dist,
        y: 0.5 + Math.sin(angle) * dist * 0.45,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.5 + 0.2,
        speed: 0.00003 + Math.random() * 0.00004,
      })
    }
    let spiralAngle = 0

    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0, 0, W, H)

      // Deep space base
      const bg = ctx.createRadialGradient(W*0.5, H*0.5, 0, W*0.5, H*0.5, Math.max(W,H)*0.8)
      bg.addColorStop(0, '#080d18')
      bg.addColorStop(0.5, '#050a12')
      bg.addColorStop(1, '#020508')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Nebula clouds
      nebulas.forEach(n => {
        n.rot += n.speed
        ctx.save()
        ctx.translate(n.cx * W, n.cy * H)
        ctx.rotate(n.rot)
        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, n.rx * W)
        grad.addColorStop(0, n.color.replace(')', ',1.0)').replace('rgba', 'rgba').replace(',1.0)', ',1)'))
        grad.addColorStop(0.4, n.color)
        grad.addColorStop(1, 'transparent')
        ctx.scale(1, n.ry / n.rx)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(0, 0, n.rx * W, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })

      // Galaxy spiral
      spiralAngle += 0.001
      spiralPoints.forEach((p, i) => {
        const t     = i / spiralPoints.length
        const ang   = spiralAngle * (1 + t * 2)
        const cos   = Math.cos(ang)
        const sin   = Math.sin(ang)
        const ox    = p.x - 0.5
        const oy    = p.y - 0.5
        const rx    = ox * cos - oy * sin + 0.5
        const ry    = ox * sin + oy * cos + 0.5
        const alpha = p.a * (0.4 + 0.6 * Math.sin(frame * p.speed * 800 + i))
        ctx.beginPath()
        ctx.arc(rx * W, ry * H, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(160,220,255,${alpha * 0.6})`
        ctx.fill()
      })

      // Stars
      stars.forEach(s => {
        s.y -= s.speed
        if (s.y < 0) { s.y = 1; s.x = Math.random() }
        s.twinkle += s.twinkleSpeed
        const alpha = 0.4 + 0.6 * Math.abs(Math.sin(s.twinkle))
        const glow  = ctx.createRadialGradient(s.x*W, s.y*H, 0, s.x*W, s.y*H, s.r*3)
        glow.addColorStop(0, s.color)
        glow.addColorStop(0.3, s.color.replace(')', `,${alpha*0.3})`).replace('#', 'rgba(').replace(/([0-9a-f]{2})/gi, (m,p)=>(parseInt(p,16)+',').replace(',',', ')))
        glow.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2)
        ctx.fillStyle = `${s.color}${Math.round(alpha*255).toString(16).padStart(2,'0')}`
        ctx.fill()
        // Glow halo for brighter stars
        if (s.r > 1.2) {
          ctx.beginPath()
          ctx.arc(s.x*W, s.y*H, s.r*3, 0, Math.PI*2)
          ctx.fillStyle = `rgba(200,230,255,${alpha*0.08})`
          ctx.fill()
        }
      })

      // Shooting stars
      nextShoot--
      if (nextShoot <= 0) {
        nextShoot = 280 + Math.random() * 400
        const ang = Math.PI * 0.18 + Math.random() * 0.2
        const spd = 14 + Math.random() * 10
        shoots.push({
          x: Math.random() * W * 0.7,
          y: Math.random() * H * 0.4,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0,
          maxLife: 40 + Math.random() * 20,
          size: 1.2 + Math.random() * 1.2,
        })
      }
      for (let i = shoots.length - 1; i >= 0; i--) {
        const s = shoots[i]
        s.x += s.vx; s.y += s.vy; s.life++
        const progress = s.life / s.maxLife
        const alpha    = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
        const tailLen  = s.size * 60 * (1 - progress * 0.5)
        const grad     = ctx.createLinearGradient(s.x, s.y, s.x - s.vx/spd * tailLen, s.y - s.vy/spd * tailLen)
        grad.addColorStop(0, `rgba(255,255,255,${alpha})`)
        grad.addColorStop(0.3, `rgba(180,230,255,${alpha*0.5})`)
        grad.addColorStop(1, 'transparent')
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx/spd * tailLen, s.y - s.vy/spd * tailLen)
        ctx.strokeStyle = grad
        ctx.lineWidth = s.size
        ctx.lineCap = 'round'
        ctx.stroke()
        if (s.life >= s.maxLife) shoots.splice(i, 1)
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas ref={canvasRef} style={{
      position: 'fixed',
      inset: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
      pointerEvents: 'none',
      display: 'block',
    }} />
  )
}
