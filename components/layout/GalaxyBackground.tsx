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
    const resize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    // Star types
    const stars = Array.from({ length: 400 }, () => ({
      x: Math.random(), y: Math.random(),
      r: Math.random() * 2.2 + 0.2,
      speed: Math.random() * 0.00006 + 0.00001,
      twinkle: Math.random() * Math.PI * 2,
      twinkleSpeed: Math.random() * 0.035 + 0.008,
      type: Math.floor(Math.random() * 4),
      color: ['#ffffff','#ddeeff','#ffeedd','#eeddff','#ddffee','#fff8dd'][Math.floor(Math.random()*6)],
      brightness: Math.random() * 0.6 + 0.4,
    }))

    // Brighter nebulas
    const nebulas = [
      { cx:0.15, cy:0.38, rx:0.32, ry:0.28, r:0, speed:0.00006,  colors:['rgba(0,200,180,0.12)','rgba(0,180,160,0.06)'] },
      { cx:0.80, cy:0.20, rx:0.28, ry:0.22, r:0.5, speed:-0.00005, colors:['rgba(140,60,220,0.1)','rgba(120,40,200,0.05)'] },
      { cx:0.60, cy:0.78, rx:0.24, ry:0.28, r:1.2, speed:0.00007,  colors:['rgba(0,130,255,0.1)','rgba(0,100,220,0.05)'] },
      { cx:0.85, cy:0.58, rx:0.20, ry:0.26, r:2.1, speed:-0.00004, colors:['rgba(220,60,120,0.09)','rgba(200,40,100,0.04)'] },
      { cx:0.32, cy:0.85, rx:0.28, ry:0.18, r:0.8, speed:0.00008,  colors:['rgba(0,220,240,0.08)','rgba(0,200,220,0.04)'] },
      { cx:0.50, cy:0.10, rx:0.38, ry:0.16, r:1.6, speed:-0.00006, colors:['rgba(100,20,200,0.09)','rgba(80,0,180,0.04)'] },
      { cx:0.25, cy:0.60, rx:0.18, ry:0.22, r:0.3, speed:0.00005,  colors:['rgba(255,160,60,0.07)','rgba(240,140,40,0.03)'] },
    ]

    // Galaxy spiral - brighter
    const spiral = Array.from({ length: 240 }, (_,i) => {
      const arm = i % 3
      const t   = (i/240)*Math.PI*7
      const d   = 0.03 + (i/240)*0.22
      const ang = t + arm*Math.PI*2/3
      return {
        x: 0.5 + Math.cos(ang)*d,
        y: 0.5 + Math.sin(ang)*d*0.42,
        r: Math.random()*1.4+0.3,
        a: Math.random()*0.7+0.3,
        s: 0.00002+Math.random()*0.00005,
        hue: [180,220,260,300][Math.floor(Math.random()*4)],
      }
    })
    let spiralAngle = 0

    interface Shoot { x:number;y:number;vx:number;vy:number;life:number;maxLife:number;size:number;spd:number;hue:number }
    const shoots: Shoot[] = []
    let nextShoot = 180
    let frame = 0

    const draw = () => {
      frame++
      ctx.clearRect(0,0,W,H)

      // Lighter base — deep navy not black
      const bg = ctx.createRadialGradient(W*0.5,H*0.45,0,W*0.5,H*0.45,Math.max(W,H)*0.85)
      bg.addColorStop(0,'#0e1a2e')
      bg.addColorStop(0.4,'#0a1220')
      bg.addColorStop(0.8,'#070d18')
      bg.addColorStop(1,'#040810')
      ctx.fillStyle = bg
      ctx.fillRect(0,0,W,H)

      // Galaxy core glow
      const core = ctx.createRadialGradient(W*0.5,H*0.5,0,W*0.5,H*0.5,W*0.18)
      core.addColorStop(0,'rgba(160,220,255,0.06)')
      core.addColorStop(0.5,'rgba(100,160,255,0.03)')
      core.addColorStop(1,'transparent')
      ctx.fillStyle = core
      ctx.fillRect(0,0,W,H)

      // Nebulas
      nebulas.forEach(n => {
        n.r += n.speed
        ctx.save()
        ctx.translate(n.cx*W, n.cy*H)
        ctx.rotate(n.r)
        n.colors.forEach((color, ci) => {
          const g = ctx.createRadialGradient(0,0,0,0,0,n.rx*W*(1+ci*0.3))
          g.addColorStop(0, color)
          g.addColorStop(0.5, color)
          g.addColorStop(1, 'transparent')
          ctx.save()
          ctx.scale(1, n.ry/n.rx)
          ctx.fillStyle = g
          ctx.beginPath()
          ctx.arc(0,0,n.rx*W*(1+ci*0.4),0,Math.PI*2)
          ctx.fill()
          ctx.restore()
        })
        ctx.restore()
      })

      // Spiral
      spiralAngle += 0.0008
      spiral.forEach((p,i) => {
        const t   = i/spiral.length
        const ang = spiralAngle*(1+t*1.8)
        const cos = Math.cos(ang), sin = Math.sin(ang)
        const ox  = p.x-0.5, oy = p.y-0.5
        const rx  = ox*cos-oy*sin+0.5
        const ry  = ox*sin+oy*cos+0.5
        const a   = p.a*(0.45+0.55*Math.sin(frame*p.s*900+i))
        ctx.beginPath()
        ctx.arc(rx*W,ry*H,p.r,0,Math.PI*2)
        ctx.fillStyle = `hsla(${p.hue},80%,75%,${a*0.55})`
        ctx.fill()
      })

      // Stars
      stars.forEach(s => {
        s.y -= s.speed
        if (s.y < 0) { s.y = 1; s.x = Math.random() }
        s.twinkle += s.twinkleSpeed
        const a = s.brightness*(0.45+0.55*Math.abs(Math.sin(s.twinkle)))

        ctx.globalAlpha = a
        ctx.fillStyle = s.color
        ctx.beginPath()
        ctx.arc(s.x*W, s.y*H, s.r, 0, Math.PI*2)
        ctx.fill()

        // Type 2: sparkle cross
        if (s.type === 2 && s.r > 1.4) {
          const glow = ctx.createRadialGradient(s.x*W,s.y*H,0,s.x*W,s.y*H,s.r*5)
          glow.addColorStop(0,`rgba(220,240,255,${a*0.4})`)
          glow.addColorStop(1,'transparent')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(s.x*W,s.y*H,s.r*5,0,Math.PI*2)
          ctx.fill()
        }

        // Type 3: bright star with cross flare
        if (s.type === 3 && s.r > 1.8) {
          ctx.globalAlpha = a*0.5
          ctx.strokeStyle = s.color
          ctx.lineWidth = 0.5
          const len = s.r*8
          ctx.beginPath()
          ctx.moveTo(s.x*W-len,s.y*H); ctx.lineTo(s.x*W+len,s.y*H)
          ctx.moveTo(s.x*W,s.y*H-len); ctx.lineTo(s.x*W,s.y*H+len)
          ctx.stroke()
        }

        ctx.globalAlpha = 1
      })

      // Shooting stars
      nextShoot--
      if (nextShoot <= 0) {
        nextShoot = 220+Math.random()*350
        const spd = 12+Math.random()*12
        const ang = Math.PI*0.16+Math.random()*0.25
        const hue = [180,200,220,260,300][Math.floor(Math.random()*5)]
        shoots.push({ x:Math.random()*W*0.65, y:Math.random()*H*0.38, vx:Math.cos(ang)*spd, vy:Math.sin(ang)*spd, life:0, maxLife:45+Math.random()*25, size:1.4+Math.random()*1.4, spd, hue })
      }
      for (let i=shoots.length-1;i>=0;i--) {
        const s = shoots[i]
        s.x+=s.vx; s.y+=s.vy; s.life++
        const prog = s.life/s.maxLife
        const a    = prog<0.2?prog/0.2:1-(prog-0.2)/0.8
        const tail = s.size*70*(1-prog*0.4)
        const g    = ctx.createLinearGradient(s.x,s.y,s.x-(s.vx/s.spd)*tail,s.y-(s.vy/s.spd)*tail)
        g.addColorStop(0,`rgba(255,255,255,${a})`)
        g.addColorStop(0.2,`hsla(${s.hue},100%,85%,${a*0.6})`)
        g.addColorStop(0.6,`hsla(${s.hue},80%,70%,${a*0.2})`)
        g.addColorStop(1,'transparent')
        ctx.beginPath()
        ctx.moveTo(s.x,s.y)
        ctx.lineTo(s.x-(s.vx/s.spd)*tail,s.y-(s.vy/s.spd)*tail)
        ctx.strokeStyle=g; ctx.lineWidth=s.size; ctx.lineCap='round'; ctx.stroke()
        // Head glow
        const hg = ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,s.size*4)
        hg.addColorStop(0,`rgba(255,255,255,${a*0.8})`)
        hg.addColorStop(1,'transparent')
        ctx.fillStyle=hg; ctx.beginPath(); ctx.arc(s.x,s.y,s.size*4,0,Math.PI*2); ctx.fill()
        if (s.life>=s.maxLife) shoots.splice(i,1)
      }

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize',resize) }
  },[])

  return <canvas ref={canvasRef} style={{ position:'fixed',inset:0,width:'100%',height:'100%',zIndex:0,pointerEvents:'none',display:'block' }} />
}
