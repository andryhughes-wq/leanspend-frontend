'use client'
import { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from 'react'

export type CalcAnimationHandle = { play: (amount: number) => void }

type CalcAnimationProps = {
  lite?: boolean
  onDone?: () => void
}

const FLIGHT_MS = 1900
const PLANET_DELAY = 2130
const AUTO_DISMISS_MS = 5200

const money = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(n)))

export const CalcAnimation = forwardRef<CalcAnimationHandle, CalcAnimationProps>(
  function CalcAnimation({ lite = false, onDone }, ref) {
    const [visible, setVisible] = useState(false)
    const [out, setOut] = useState(false)
    const [amount, setAmount] = useState(0)
    const [planetOn, setPlanetOn] = useState(false)

    const stageRef = useRef<HTMLDivElement | null>(null)
    const cometRef = useRef<HTMLDivElement | null>(null)
    const timers = useRef<number[]>([])
    const sparkInt = useRef<number | null>(null)

    const clearAll = useCallback(() => {
      timers.current.forEach((t) => window.clearTimeout(t))
      timers.current = []
      if (sparkInt.current !== null) {
        window.clearInterval(sparkInt.current)
        sparkInt.current = null
      }
      const stage = stageRef.current
      if (stage) {
        stage
          .querySelectorAll('.calc-spark,.calc-flash,.calc-shock,.calc-frag')
          .forEach((el) => el.remove())
      }
    }, [])

    const dismiss = useCallback(() => {
      clearAll()
      setOut(true)
      const t = window.setTimeout(() => {
        setVisible(false)
        setOut(false)
        setPlanetOn(false)
        if (onDone) onDone()
      }, 400)
      timers.current.push(t)
    }, [clearAll, onDone])

    const spawn = useCallback(
      (cls: string, css: Record<string, string>, vars?: Record<string, string>, life = 900) => {
        const stage = stageRef.current
        if (!stage) return
        const el = document.createElement('div')
        el.className = cls
        Object.entries(css).forEach(([k, v]) => el.style.setProperty(k, v))
        if (vars) Object.entries(vars).forEach(([k, v]) => el.style.setProperty(k, v))
        stage.appendChild(el)
        const t = window.setTimeout(() => el.remove(), life)
        timers.current.push(t)
      },
      [],
    )

    const explode = useCallback(() => {
      spawn('calc-flash', {}, undefined, 600)
      spawn('calc-shock', {}, undefined, 800)
      const t = window.setTimeout(() => spawn('calc-shock', {}, undefined, 800), 130)
      timers.current.push(t)
      for (let i = 0; i < 26; i++) {
        const ang = (Math.PI * 2 * i) / 26 + Math.random() * 0.5
        const dist = 90 + Math.random() * 160
        const size = 4 + Math.random() * 9
        spawn(
          'calc-frag',
          { width: size + 'px', height: size + 'px' },
          { '--fx': Math.cos(ang) * dist + 'px', '--fy': Math.sin(ang) * dist + 'px' },
          900,
        )
      }
    }, [spawn])

    const shedSpark = useCallback(() => {
      const stage = stageRef.current
      const comet = cometRef.current
      if (!stage || !comet) return
      const sr = stage.getBoundingClientRect()
      const cr = comet.getBoundingClientRect()
      const x = cr.left - sr.left + cr.width / 2
      const y = cr.top - sr.top + cr.height / 2
      for (let k = 0; k < 2; k++) {
        spawn(
          'calc-spark',
          { left: x + (Math.random() * 8 - 4) + 'px', top: y + (Math.random() * 8 - 4) + 'px' },
          { '--sx': Math.random() * 40 - 20 + 'px', '--sy': Math.random() * 40 - 20 + 'px' },
          600,
        )
      }
    }, [spawn])

    const runFull = useCallback(() => {
      const comet = cometRef.current
      if (comet) {
        comet.classList.remove('go')
        void comet.offsetWidth
        comet.classList.add('go')
      }
      sparkInt.current = window.setInterval(shedSpark, 28)
      const tBoom = window.setTimeout(() => {
        if (sparkInt.current !== null) {
          window.clearInterval(sparkInt.current)
          sparkInt.current = null
        }
        if (comet) comet.classList.remove('go')
        explode()
      }, FLIGHT_MS)
      const tPlanet = window.setTimeout(() => setPlanetOn(true), PLANET_DELAY)
      const tAuto = window.setTimeout(() => dismiss(), PLANET_DELAY + AUTO_DISMISS_MS)
      timers.current.push(tBoom, tPlanet, tAuto)
    }, [shedSpark, explode, dismiss])

    const runLite = useCallback(() => {
      const tPlanet = window.setTimeout(() => setPlanetOn(true), 40)
      const tAuto = window.setTimeout(() => dismiss(), 40 + AUTO_DISMISS_MS)
      timers.current.push(tPlanet, tAuto)
    }, [dismiss])

    const play = useCallback(
      (value: number) => {
        clearAll()
        setOut(false)
        setPlanetOn(false)
        setAmount(value)
        setVisible(true)
        const reduced =
          typeof window !== 'undefined' &&
          !!window.matchMedia &&
          window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const go = lite || reduced ? runLite : runFull
        const t = window.setTimeout(() => go(), 30)
        timers.current.push(t)
      },
      [clearAll, lite, runLite, runFull],
    )

    useImperativeHandle(ref, () => ({ play }), [play])
    useEffect(() => () => clearAll(), [clearAll])

    if (!visible) return null

    return (
      <div
        className={out ? 'calc-overlay out' : 'calc-overlay'}
        onClick={dismiss}
        role="dialog"
        aria-label="Calculating your food budget"
      >
        <div className="calc-stage" ref={stageRef}>
          <div className="calc-comet" ref={cometRef}>
            <div className="ct ct2" />
            <div className="ct" />
            <div className="ch" />
          </div>
          <div className={planetOn ? 'calc-planet show' : 'calc-planet'}>
            <span className="pnum">{money(amount)}</span>
            <span className="plbl">Food budget</span>
          </div>
          {planetOn && <div className="calc-ring" />}
          {planetOn && <div className="calc-dismiss">tap to dismiss</div>}
        </div>
      </div>
    )
  },
)