'use client'
import { useEffect, useRef } from 'react'

function rnd(a: number, b: number) { return a + Math.random() * (b - a) }

function fillLayer(el: HTMLDivElement, count: number, minS: number, maxS: number) {
  for (let i = 0; i < count; i++) {
    const r = document.createElement('div')
    r.className = 'rock'
    const s = rnd(minS, maxS)
    r.style.width = s + 'px'
    r.style.height = rnd(s * 0.72, s * 0.95) + 'px'
    r.style.left = rnd(-2, 100) + '%'
    r.style.top = rnd(40, 60) + '%'
    r.style.animation = 'rock-spin ' + rnd(18, 50).toFixed(0) + 's linear infinite'
    r.style.opacity = rnd(0.35, 0.85).toFixed(2)
    el.appendChild(r)
  }
}

export function BeltBackground() {
  const far = useRef<HTMLDivElement>(null)
  const mid = useRef<HTMLDivElement>(null)
  const near = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (far.current && far.current.childElementCount === 0) fillLayer(far.current, 60, 2, 5)
    if (mid.current && mid.current.childElementCount === 0) fillLayer(mid.current, 45, 4, 9)
    if (near.current && near.current.childElementCount === 0) fillLayer(near.current, 30, 9, 18)
  }, [])

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'none' }} aria-hidden="true">
      <div className="belt-band" />
      <div ref={far} className="belt-layer belt-far" />
      <div ref={mid} className="belt-layer belt-mid" />
      <div ref={near} className="belt-layer belt-near" />
    </div>
  )
}