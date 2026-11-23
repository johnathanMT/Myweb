/**
 * neuralFieldEngine — a dependency-free Canvas 2D "latent space": nodes drift
 * along a smooth vector field, near neighbours share whisper-thin edges, and an
 * attention focus (the pointer, or a slow wander when there is none) lights the
 * nodes around it and sends occasional signals outward along their edges.
 *
 * Nothing touches window/document at import time, so it is safe to prerender.
 */
export type FieldTheme = 'dark' | 'light'
export interface FieldOptions { theme: FieldTheme; static?: boolean }

interface Palette { node: string; node2: string; edge: string; path: string; signal: string; edgeA: number; nodeA: number; pathA: number }
const PALETTES: Record<FieldTheme, Palette> = {
  dark:  { node: '148,178,204', node2: '139,146,220', edge: '120,156,188', path: '214,232,248', signal: '240,248,255', edgeA: 0.34, nodeA: 0.65, pathA: 0.75 },
  light: { node: '63,72,132',   node2: '38,116,122',  edge: '72,84,140',   path: '38,52,128',   signal: '15,104,112',  edgeA: 0.3,  nodeA: 0.6,  pathA: 0.7 },
}

interface Node { x: number; y: number; vx: number; vy: number; r: number; alt: boolean; fade: number; lit: number }
interface Signal { from: Node; to: Node; t: number; hops: number }

const LEVELS = 6            // edges are batched into this many opacity steps
const HEADS = 12            // attention pathways drawn at once
const MAX_SIGNALS = 10
const MARGIN = 70           // nodes wrap this far outside the canvas

/** Small seeded PRNG, so the reduced-motion still is the same on every visit. */
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function createNeuralField(canvas: HTMLCanvasElement, opts: FieldOptions) {
  const ctx = canvas.getContext('2d')
  const rand = seeded(20260707)
  let pal = PALETTES[opts.theme]
  let w = 0
  let h = 0
  let link = 130
  let reach = 220
  let nodes: Node[] = []
  let signals: Signal[] = []
  let raf = 0
  let last = 0
  let time = 40
  let nextSignal = 1.2
  const pointer = { x: 0, y: 0, on: false }
  const focus = { x: 0, y: 0, strength: 0.4 }

  const makeNode = (): Node => ({
    x: -MARGIN + rand() * (w + MARGIN * 2),
    y: -MARGIN + rand() * (h + MARGIN * 2),
    vx: 0, vy: 0,
    r: 0.9 + rand() * 1.1,
    alt: rand() < 0.35,
    fade: 1,
    lit: 0,
  })

  function resize() {
    if (!ctx) return
    const pw = w
    const ph = h
    w = canvas.clientWidth
    h = canvas.clientHeight
    if (!w || !h) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const small = w < 700
    link = small ? 104 : 138
    reach = small ? 150 : 235
    if (pw && ph) for (const n of nodes) { n.x *= w / pw; n.y *= h / ph }
    const target = Math.round(Math.max(38, Math.min(small ? 84 : 250, (w * h) / (small ? 4600 : 5600))))
    while (nodes.length < target) nodes.push(makeNode())
    if (nodes.length > target) {
      nodes.length = target
      signals = []
    }
    if (!pw) home(focus)
    if (!raf) draw()
  }

  /** Where attention rests with no pointer: a slow loop, clear of the copy. */
  function home(out: { x: number; y: number }) {
    const wide = w >= 900
    out.x = w * (wide ? 0.76 : 0.6) + Math.cos(time * 0.11) * w * (wide ? 0.11 : 0.22)
    out.y = h * (wide ? 0.48 : 0.2) + Math.sin(time * 0.15) * h * (wide ? 0.2 : 0.06)
  }

  const goal = { x: 0, y: 0 }
  function step(dt: number) {
    time += dt
    for (const n of nodes) {
      // two slow sine layers make a continuous, swirl-like current
      const a = Math.sin(n.x * 0.0031 + time * 0.05) * 1.7 + Math.cos(n.y * 0.0037 - time * 0.04) * 1.7 + Math.sin((n.x + n.y) * 0.0017) * 1.2
      const k = Math.min(1, dt * 0.8)
      n.vx += (Math.cos(a) * 9 - n.vx) * k
      n.vy += (Math.sin(a) * 9 - n.vy) * k
      n.x += n.vx * dt
      n.y += n.vy * dt
      let wrapped = false
      if (n.x < -MARGIN) { n.x = w + MARGIN; wrapped = true } else if (n.x > w + MARGIN) { n.x = -MARGIN; wrapped = true }
      if (n.y < -MARGIN) { n.y = h + MARGIN; wrapped = true } else if (n.y > h + MARGIN) { n.y = -MARGIN; wrapped = true }
      if (wrapped) {
        n.fade = 0
        signals = signals.filter((s) => s.from !== n && s.to !== n)
      }
      n.fade = Math.min(1, n.fade + dt * 0.5)
    }

    if (pointer.on) { goal.x = pointer.x; goal.y = pointer.y } else home(goal)
    const ease = 1 - Math.exp(-dt * (pointer.on ? 7 : 1.2))
    focus.x += (goal.x - focus.x) * ease
    focus.y += (goal.y - focus.y) * ease
    focus.strength += ((pointer.on ? 1 : 0.45) - focus.strength) * (1 - Math.exp(-dt * 2.5))

    const glow = 1 - Math.exp(-dt * 5)
    for (const n of nodes) n.lit += (attention(n) - n.lit) * glow

    nextSignal -= dt
    if (nextSignal <= 0) {
      nextSignal = (pointer.on ? 0.35 : 1.1) + Math.random() * 0.7
      spawnSignal()
    }
    for (const s of signals) s.t += dt / 1.15
    signals = signals.filter((s) => {
      if (s.t < 1) return true
      const next = s.hops > 0 ? outward(s.to) : undefined
      if (!next) return false
      s.from = s.to; s.to = next; s.t = 0; s.hops--
      return true
    })
  }

  const fromFocus = (n: Node) => Math.hypot(n.x - focus.x, n.y - focus.y)
  function attention(n: Node) {
    const d = fromFocus(n) / reach
    return d >= 1 ? 0 : (1 - d * d) ** 2 * focus.strength
  }

  /** A linked neighbour further from the focus than `n`. */
  function outward(n: Node): Node | undefined {
    const d = fromFocus(n)
    const options = nodes.filter((m) => m !== n && fromFocus(m) > d + 8 && Math.hypot(m.x - n.x, m.y - n.y) < link)
    return options[Math.floor(Math.random() * options.length)]
  }
  function spawnSignal() {
    if (signals.length >= MAX_SIGNALS) return
    const lit = nodes.filter((n) => n.lit > 0.12)
    const from = lit[Math.floor(Math.random() * lit.length)]
    const to = from && outward(from)
    if (to) signals.push({ from, to, t: 0, hops: 2 })
  }

  function draw() {
    if (!ctx || !w) return
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'

    // synaptic edges, batched by opacity so each level is a single stroke
    const calm: number[][] = Array.from({ length: LEVELS }, () => [])
    const active: number[][] = Array.from({ length: LEVELS }, () => [])
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const dx = a.x - b.x
        const dy = a.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 > link * link) continue
        const fall = (1 - Math.sqrt(d2) / link) * Math.min(a.fade, b.fade)
        calm[Math.min(LEVELS - 1, Math.floor(fall * LEVELS))].push(a.x, a.y, b.x, b.y)
        const hot = Math.sqrt(fall) * Math.min(a.lit, b.lit) * 1.5
        if (hot > 0.04) active[Math.min(LEVELS - 1, Math.floor(hot * LEVELS))].push(a.x, a.y, b.x, b.y)
      }
    }
    strokeLevels(calm, pal.edge, pal.edgeA, 0.7)
    strokeLevels(active, pal.path, pal.pathA, 0.9)

    // attention pathways: focus → its strongest nodes, gently bowed
    const heads = nodes.filter((n) => n.lit > 0.05).sort((p, q) => q.lit - p.lit).slice(0, HEADS)
    for (const n of heads) {
      const dx = n.x - focus.x
      const dy = n.y - focus.y
      const g = ctx.createLinearGradient(focus.x, focus.y, n.x, n.y)
      g.addColorStop(0, `rgba(${pal.path},0)`)
      g.addColorStop(1, `rgba(${pal.path},${(n.lit * pal.pathA * n.fade).toFixed(3)})`)
      ctx.strokeStyle = g
      ctx.lineWidth = 0.6 + n.lit * 0.7
      ctx.beginPath()
      ctx.moveTo(focus.x, focus.y)
      ctx.quadraticCurveTo(focus.x + dx * 0.5 - dy * 0.12, focus.y + dy * 0.5 + dx * 0.12, n.x, n.y)
      ctx.stroke()
    }

    for (const n of nodes) {
      const rgb = n.alt ? pal.node2 : pal.node
      if (n.lit > 0.04) {
        ctx.fillStyle = `rgba(${rgb},${(n.lit * 0.16 * n.fade).toFixed(3)})`
        dot(n.x, n.y, n.r + 5.5 * n.lit)
      }
      ctx.fillStyle = `rgba(${n.lit > 0.35 ? pal.path : rgb},${((pal.nodeA + (1 - pal.nodeA) * n.lit) * n.fade).toFixed(3)})`
      dot(n.x, n.y, n.r + n.lit * 0.9)
    }

    for (const s of signals) {
      const t = s.t * s.t * (3 - 2 * s.t)
      const alpha = Math.sin(Math.PI * Math.min(1, s.t)) * 0.95
      const x = s.from.x + (s.to.x - s.from.x) * t
      const y = s.from.y + (s.to.y - s.from.y) * t
      ctx.fillStyle = `rgba(${pal.signal},${(alpha * 0.2).toFixed(3)})`
      dot(x, y, 4.5)
      ctx.fillStyle = `rgba(${pal.signal},${alpha.toFixed(3)})`
      dot(x, y, 1.5)
    }
  }

  function strokeLevels(levels: number[][], rgb: string, peak: number, width: number) {
    if (!ctx) return
    ctx.lineWidth = width
    levels.forEach((pts, level) => {
      if (!pts.length) return
      ctx.strokeStyle = `rgba(${rgb},${(((level + 0.5) / LEVELS) * peak).toFixed(3)})`
      ctx.beginPath()
      for (let i = 0; i < pts.length; i += 4) { ctx.moveTo(pts[i], pts[i + 1]); ctx.lineTo(pts[i + 2], pts[i + 3]) }
      ctx.stroke()
    })
  }
  function dot(x: number, y: number, r: number) {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)   // no jump after a pause
    last = now
    step(dt)
    draw()
  }

  function setActive(on: boolean) {
    if (opts.static || on === !!raf) return
    if (on) {
      last = performance.now()
      raf = requestAnimationFrame(frame)
    } else {
      cancelAnimationFrame(raf)
      raf = 0
    }
  }

  resize()
  for (const n of nodes) n.lit = attention(n)   // the first (or only) frame is already composed
  draw()

  return {
    resize() {
      resize()
      if (opts.static) { home(focus); for (const n of nodes) n.lit = attention(n); draw() }
    },
    setActive,
    setTheme(theme: FieldTheme) { pal = PALETTES[theme]; if (!raf) draw() },
    /** Canvas-space pointer, or null to hand attention back to the idle wander. */
    attend(p: { x: number; y: number } | null) {
      pointer.on = !!p
      if (p) { pointer.x = p.x; pointer.y = p.y }
    },
    destroy() { cancelAnimationFrame(raf); raf = 0 },
  }
}
