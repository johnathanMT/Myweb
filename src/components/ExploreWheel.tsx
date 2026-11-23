import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionStyle, type MotionValue,
} from 'framer-motion'
import { ArrowRight, ArrowUpRight, ChevronDown, ChevronUp, type LucideIcon } from 'lucide-react'
import { prefetchRoute } from '../routes'
import { useInView } from '../hooks/useInView'
import './ExploreWheel.css'

/** `tone` picks the accent hue — see the [data-tone] palette in index.css. */
export type Tone = 'cyan' | 'violet' | 'emerald' | 'amber' | 'rose' | 'sky' | 'indigo' | 'silver' | 'teal'
/** `to` is an internal route, or an https:// URL for a site living elsewhere. */
export interface Destination { to: string; title: string; blurb: string; Icon: LucideIcon; tone: Tone }

const DRAG_THRESHOLD = 6      // px before a press becomes a drag
const WHEEL_STEP = 60         // scroll distance per notch
const WHEEL_COOLDOWN = 170    // ms between notches

const mod = (n: number, m: number) => ((n % m) + m) % m
/** Signed angle in (-180, 180]: 0 = the 3 o'clock slot, negative = above it. */
const wrapAngle = (deg: number) => 180 - mod(180 - deg, 360)

/** Outline of a gear centred on 0,0. */
function gearPath(teeth: number, outer: number, inner: number): string {
  const step = (Math.PI * 2) / teeth
  const at = (r: number, a: number) => `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`
  let d = ''
  for (let i = 0; i < teeth; i++) {
    const a = i * step
    d += `${i ? 'L' : 'M'}${at(inner, a)}L${at(inner, a + step * 0.3)}L${at(outer, a + step * 0.42)}L${at(outer, a + step * 0.78)}L${at(inner, a + step * 0.9)}`
  }
  return `${d}Z`
}
const OUTER_GEAR = gearPath(54, 99, 93)
const INNER_GEAR = gearPath(22, 47, 40)
const HUB_GEAR = gearPath(12, 20, 15.5)
const TICKS = Array.from({ length: 72 }, (_, i) => i * 5)

interface NodeProps {
  item: Destination
  angle: number
  rot: MotionValue<number>
  active: boolean
  onSelect: () => void
  buttonRef: (el: HTMLButtonElement | null) => void
}

/** A cabin: travels with the rim, counter-rotated so it always hangs upright. */
function WheelNode({ item, angle, rot, active, onSelect, buttonRef }: NodeProps) {
  const transform = useTransform(rot, (r) => {
    const a = angle + r
    const lift = Math.max(0, Math.cos((wrapAngle(a) * Math.PI) / 180))
    const scale = 0.72 + 0.4 * lift ** 2
    return `rotate(${a}deg) translateX(var(--R)) rotate(${-a}deg) scale(${scale.toFixed(4)})`
  })
  // Dim the contents, not the cabin: it stays opaque so the gear never shows
  // through. Only past the top / bottom of the arc does the whole cabin fade.
  const dim = useTransform(rot, (r) => 1 - 0.4 * Math.min(1, Math.abs(wrapAngle(angle + r)) / 80))
  const opacity = useTransform(rot, (r) => {
    const d = Math.abs(wrapAngle(angle + r))
    return d > 82 ? Math.max(0, 1 - (d - 82) / 16) : 1
  })
  // the off-screen half of the wheel must not catch clicks
  const pointerEvents = useTransform(rot, (r) => (Math.abs(wrapAngle(angle + r)) > 90 ? 'none' : 'auto'))

  const { title, Icon, tone } = item
  return (
    <motion.button
      ref={buttonRef}
      type="button"
      role="tab"
      id={`explore-tab-${tone}`}
      aria-selected={active}
      aria-controls="explore-panel"
      tabIndex={active ? 0 : -1}
      data-tone={tone}
      className={`wheel-node ${active ? 'is-active' : ''}`}
      style={{ transform, opacity, pointerEvents, '--dim': dim } as MotionStyle}
      onClick={onSelect}
    >
      <span className="emboss-icon" aria-hidden><Icon size={22} strokeWidth={1.9} /></span>
      <span className="wheel-node-label">{title}</span>
    </motion.button>
  )
}

/**
 * ExploreWheel — half a Ferris wheel anchored to the left edge. The node at
 * 3 o'clock is selected and described in the spotlight card.
 *
 * Input: drag / swipe, node click, buttons, arrow keys. The mouse wheel only
 * turns it after the visitor has pressed the wheel, and is handed back to the
 * page at the first / last item, so scrolling past never gets stuck.
 */
export default function ExploreWheel({ items, header }: { items: Destination[]; header: ReactNode }) {
  const count = items.length
  const stepDeg = 360 / count
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const [stageRef, inView] = useInView<HTMLDivElement>({ threshold: 0.05 })

  const rot = useMotionValue(0)
  const innerRot = useTransform(rot, (r) => r * -2)
  const notch = useRef(0)                       // unbounded index; active = notch mod count
  const zoneRef = useRef<HTMLDivElement>(null)
  const discRef = useRef<HTMLDivElement>(null)
  const nodeRefs = useRef<(HTMLButtonElement | null)[]>([])
  const enterRef = useRef<HTMLAnchorElement>(null)
  const drag = useRef<{ id: number; y: number; rot: number; radius: number; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const engaged = useRef(false)

  const turnTo = (n: number, velocity = 0) => {
    notch.current = n
    setActive(mod(n, count))
    rot.stop()
    const target = -n * stepDeg
    if (reduced) rot.set(target)
    else animate(rot, target, { type: 'spring', stiffness: 110, damping: 17, mass: 0.9, velocity })
  }
  const stepBy = (d: number) => turnTo(notch.current + d)
  /** Spin to an item the short way round. */
  const select = (i: number) => {
    const ahead = mod(i - notch.current, count)
    stepBy(ahead > count / 2 ? ahead - count : ahead)
  }

  // The scroll listener is bound once but must see the current render's closure.
  const stepRef = useRef(stepBy)
  useEffect(() => { stepRef.current = stepBy })

  // Native listener: React's onWheel is passive, so it could not preventDefault.
  useEffect(() => {
    const zone = zoneRef.current
    if (!zone) return
    let acc = 0
    let last = 0
    const onWheel = (e: WheelEvent) => {
      if (!engaged.current || e.ctrlKey || Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return
      const dir = Math.sign(e.deltaY)
      const at = mod(notch.current, count)
      if ((dir < 0 && at === 0) || (dir > 0 && at === count - 1)) { engaged.current = false; acc = 0; return }
      e.preventDefault()
      if (e.timeStamp - last < WHEEL_COOLDOWN) return
      if (Math.sign(acc) !== dir) acc = 0
      acc += e.deltaY * (e.deltaMode === 1 ? 20 : 1)
      if (Math.abs(acc) < WHEEL_STEP) return
      acc = 0
      last = e.timeStamp
      stepRef.current(dir)
    }
    zone.addEventListener('wheel', onWheel, { passive: false })
    return () => zone.removeEventListener('wheel', onWheel)
  }, [count])

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!e.isPrimary || e.button !== 0) return
    engaged.current = true
    suppressClick.current = false
    const radius = (discRef.current?.offsetWidth ?? 600) / 2
    drag.current = { id: e.pointerId, y: e.clientY, rot: rot.get(), radius, moved: false }
  }
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dy = e.clientY - d.y
    if (!d.moved) {
      if (Math.abs(dy) < DRAG_THRESHOLD) return
      d.moved = true
      rot.stop()
      d.rot = rot.get()
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const next = d.rot + (dy / d.radius) * (180 / Math.PI)
    const n = Math.round(-next / stepDeg)
    rot.set(reduced ? -n * stepDeg : next)
    if (n !== notch.current) { notch.current = n; setActive(mod(n, count)) }
  }
  const onPointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.moved) return
    // the click that follows a drag must not also select a node
    suppressClick.current = true
    setTimeout(() => { suppressClick.current = false }, 0)
    if (reduced) { turnTo(notch.current); return }
    const v = e.type === 'pointercancel' ? 0 : rot.getVelocity()
    // a flick carries the wheel on, capped so it never whips all the way round
    const projected = rot.get() + Math.max(-stepDeg * 3, Math.min(stepDeg * 3, v * 0.18))
    turnTo(Math.round(-projected / stepDeg), v)
  }

  const onKeyDown = (e: KeyboardEvent) => {
    let to: number
    if (e.key === 'ArrowDown') to = notch.current + 1
    else if (e.key === 'ArrowUp') to = notch.current - 1
    else if (e.key === 'Home') to = notch.current - mod(notch.current, count)
    else if (e.key === 'End') to = notch.current - mod(notch.current, count) + count - 1
    else return
    e.preventDefault()
    turnTo(to)
    nodeRefs.current[mod(to, count)]?.focus({ preventScroll: true })
  }

  const item = items[active]
  const { Icon } = item
  const external = item.to.startsWith('https://')
  const enter = {
    ref: enterRef,
    className: 'wheel-enter',
    'aria-label': `Enter ${item.title}${external ? ' (opens in a new tab)' : ''}`,
    children: <>Enter {external ? <ArrowUpRight size={16} aria-hidden /> : <ArrowRight size={16} aria-hidden />}</>,
  }

  return (
    <div className={`wheel ${inView ? 'is-live' : ''}`} ref={stageRef}>
      <div className="wheel-header">{header}</div>
      <div className="wheel-stage">
        <span className="wheel-beam" aria-hidden />
        <div
          ref={zoneRef}
          className="wheel-zone"
          role="tablist"
          aria-label="Explore destinations"
          aria-orientation="vertical"
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerEnd}
          onPointerCancel={onPointerEnd}
          onPointerLeave={() => { engaged.current = false; if (!drag.current?.moved) drag.current = null }}
        >
          <div ref={discRef} className="wheel-disc" role="presentation">
            <motion.svg viewBox="-100 -100 200 200" className="wheel-layer" style={{ rotate: rot }} aria-hidden>
              <path d={OUTER_GEAR} className="wheel-gear" />
              <circle r="84" className="wheel-ring" />
              <circle r="70" className="wheel-ring is-faint" />
              {TICKS.map((a) => (
                <path key={a} d={a % 15 ? 'M86 0H88.5' : 'M86 0H91'} transform={`rotate(${a})`} className={a % 15 ? 'wheel-tick' : 'wheel-tick is-major'} />
              ))}
              {items.map(({ tone }, i) => (
                <g key={tone} data-tone={tone} transform={`rotate(${i * stepDeg})`} className={`wheel-spoke ${i === active ? 'is-active' : ''}`}>
                  <path d="M48 -2.2L84 -0.9M48 2.2L84 0.9M58 -1.8L66 1.5M66 -1.5L74 1.2" />
                  <circle cx="70" r="1.8" />
                </g>
              ))}
            </motion.svg>
            <motion.svg viewBox="-100 -100 200 200" className="wheel-layer" style={{ rotate: innerRot }} aria-hidden>
              <path d={INNER_GEAR} className="wheel-gear" />
              <circle r="33" className="wheel-ring" strokeDasharray="10 4 2 4" />
              <path d={HUB_GEAR} className="wheel-gear is-hub" />
              <circle r="8" className="wheel-core" />
            </motion.svg>
            <svg viewBox="-100 -100 200 200" className="wheel-layer wheel-idle" aria-hidden>
              <circle r="62" className="wheel-orbit" strokeDasharray="46 18 4 18" />
              <circle r="54" className="wheel-orbit is-thin" strokeDasharray="2 5" />
            </svg>
          </div>

          {items.map((it, i) => (
            <WheelNode
              key={it.to}
              item={it}
              angle={i * stepDeg}
              rot={rot}
              active={i === active}
              buttonRef={(el) => { nodeRefs.current[i] = el }}
              onSelect={() => {
                if (suppressClick.current) return
                if (i === active) enterRef.current?.click()   // pressing the active node goes in
                else select(i)
              }}
            />
          ))}
        </div>
      </div>

      <div className="wheel-side">
        <div className="wheel-controls">
          <button type="button" className="wheel-btn" aria-label="Previous destination" onClick={() => stepBy(-1)}><ChevronUp size={20} aria-hidden /></button>
          <button type="button" className="wheel-btn" aria-label="Next destination" onClick={() => stepBy(1)}><ChevronDown size={20} aria-hidden /></button>
          <span className="wheel-hint">Drag the wheel or pick a node</span>
        </div>

        <div id="explore-panel" role="tabpanel" aria-labelledby={`explore-tab-${item.tone}`} className="wheel-panel">
          <motion.div
            key={item.to}
            className="explore-card wheel-spotlight"
            data-tone={item.tone}
            initial={reduced ? false : { opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <span className="flex items-center justify-between">
              <span className="emboss-icon" aria-hidden><Icon size={28} strokeWidth={1.9} /></span>
              <span className="wheel-count" aria-hidden>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
            </span>
            <h3 className="wheel-title">{item.title}</h3>
            <p className="wheel-blurb">{item.blurb}</p>
            {external
              ? <a href={item.to} target="_blank" rel="noopener noreferrer" {...enter} />
              : <Link to={item.to} onMouseEnter={() => prefetchRoute(item.to)} onFocus={() => prefetchRoute(item.to)} {...enter} />}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
