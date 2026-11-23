/**
 * neuralFieldEngine — a dependency-free Canvas 2D golden "latent space":
 *  • neurons drift on a divergence-free current, so the lattice never clumps;
 *  • near neighbours share gold edges, with signals gliding along them;
 *  • harmonic filaments (long sine arcs) flow behind the lattice;
 *  • an attention focus (the pointer, or a slow wander) lights what is near it;
 *  • wide screens add a few faint technical glyphs anchored to neurons.
 *
 * Nothing touches window/document at import time, so it is safe to prerender.
 */
export type FieldTheme = 'dark' | 'light'
export interface FieldOptions { theme: FieldTheme; static?: boolean }

interface Palette {
  node: string; node2: string; hot: string; edge: string; path: string; wave: string
  edgeA: number; nodeA: number; pathA: number; waveA: number; glowA: number; glyphA: number
}
const PALETTES: Record<FieldTheme, Palette> = {
  dark: {
    node: '245,208,97', node2: '229,184,75', hot: '255,242,178', edge: '212,175,55', path: '245,208,97', wave: '229,184,75',
    edgeA: 0.62, nodeA: 0.92, pathA: 0.95, waveA: 0.34, glowA: 0.5, glyphA: 0.34,
  },
  light: {
    node: '154,107,22', node2: '184,134,11', hot: '122,82,12', edge: '154,107,22', path: '140,94,14', wave: '201,151,44',
    edgeA: 0.5, nodeA: 0.88, pathA: 0.85, waveA: 0.46, glowA: 0.3, glyphA: 0.42,
  },
}

interface Node { x: number; y: number; r: number; alt: boolean; fade: number; lit: number; glyph: string }
interface Signal { from: Node; to: Node; t: number; hops: number }

const LEVELS = 6            // edges are batched into this many opacity steps
const HEADS = 12            // attention pathways drawn at once
const MARGIN = 60           // nodes wrap this far outside the canvas
const GLYPHS = ['attn(Q,K,V)', 'λ', '0x7F', '∇θ', 'softmax', 'h·W', 'λ₂', '0xA1']
const WAVES = [
  { y: 0.16, amp: 0.06, len: 1.25, speed: 0.16, phase: 0.4 },
  { y: 0.36, amp: 0.09, len: 0.95, speed: -0.12, phase: 2.1 },
  { y: 0.58, amp: 0.08, len: 1.4, speed: 0.1, phase: 4.0 },
  { y: 0.8, amp: 0.07, len: 1.05, speed: -0.15, phase: 5.2 },
]

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
  let theme = opts.theme
  let pal = PALETTES[theme]
  let halo: HTMLCanvasElement | null = null
  let w = 0
  let h = 0
  let small = false
  let link = 130
  let reach = 220
  let nodes: Node[] = []
  let signals: Signal[] = []
  let raf = 0
  let last = 0
  let time = 40
  let nextSignal = 0.4
  const pointer = { x: 0, y: 0, on: false }
  const focus = { x: 0, y: 0, strength: 0.6 }
  const goal = { x: 0, y: 0 }

  /** Soft glow drawn once and stamped: far cheaper per frame than shadowBlur. */
  function makeHalo() {
    halo = document.createElement('canvas')
    halo.width = halo.height = 64
    const g2 = halo.getContext('2d')
    if (!g2) return
    const g = g2.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, `rgba(${pal.hot},0.9)`)
    g.addColorStop(0.25, `rgba(${pal.node},0.42)`)
    g.addColorStop(1, `rgba(${pal.node2},0)`)
    g2.fillStyle = g
    g2.fillRect(0, 0, 64, 64)
  }

  /** Jittered grid: every part of the screen gets its share of neurons. */
  function seedNodes(count: number) {
    const W = w + MARGIN * 2
    const H = h + MARGIN * 2
    const cols = Math.max(3, Math.round(Math.sqrt((count * W) / H)))
    const rows = Math.max(3, Math.ceil(count / cols))
    nodes = []
    signals = []
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        nodes.push({
          x: -MARGIN + ((i + 0.5 + (rand() - 0.5) * 0.85) * W) / cols,
          y: -MARGIN + ((j + 0.5 + (rand() - 0.5) * 0.85) * H) / rows,
          r: (small ? 1.5 : 1.25) + rand() * (small ? 1.3 : 1.35),
          alt: rand() < 0.4,
          fade: 1,
          lit: 0,
          glyph: !small && rand() < 0.07 ? GLYPHS[Math.floor(rand() * GLYPHS.length)] : '',
        })
      }
    }
  }

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

    const wasSmall = small
    small = w < 700
    link = small ? 112 : 142
    reach = small ? 170 : 245
    if (!pw || wasSmall !== small) {
      seedNodes(Math.round(Math.max(46, Math.min(small ? 110 : 230, (w * h) / (small ? 4000 : 6600)))))
    } else {
      for (const n of nodes) { n.x *= w / pw; n.y *= h / ph }
    }
    if (!pw) { home(goal); focus.x = goal.x; focus.y = goal.y }
    if (!raf) settle()
  }

  /** Where attention rests with no pointer: a slow loop — down the whole phone, or clear of the desktop copy. */
  function home(out: { x: number; y: number }) {
    const wide = w >= 900
    out.x = w * (wide ? 0.77 : 0.55) + Math.cos(time * 0.13) * w * (wide ? 0.12 : 0.3)
    out.y = h * 0.48 + Math.sin(time * 0.17) * h * (wide ? 0.24 : 0.36)
  }

  function step(dt: number) {
    time += dt
    for (const n of nodes) {
      // velocity is the curl of a stream function, hence divergence-free
      const shear = 4.5 * Math.sin((n.x + n.y) * 0.0032 + time * 0.03)
      n.x += (7 * Math.sin(n.y * 0.0061 + time * 0.06) + shear) * dt
      n.y += (7 * Math.sin(n.x * 0.0053 - time * 0.05) - shear) * dt
      let wrapped = false
      if (n.x < -MARGIN) { n.x = w + MARGIN; wrapped = true } else if (n.x > w + MARGIN) { n.x = -MARGIN; wrapped = true }
      if (n.y < -MARGIN) { n.y = h + MARGIN; wrapped = true } else if (n.y > h + MARGIN) { n.y = -MARGIN; wrapped = true }
      if (wrapped) {
        n.fade = 0
        signals = signals.filter((s) => s.from !== n && s.to !== n)
      }
      n.fade = Math.min(1, n.fade + dt * 0.6)
    }

    if (pointer.on) { goal.x = pointer.x; goal.y = pointer.y } else home(goal)
    const ease = 1 - Math.exp(-dt * (pointer.on ? 7 : 1.2))
    focus.x += (goal.x - focus.x) * ease
    focus.y += (goal.y - focus.y) * ease
    focus.strength += ((pointer.on ? 1 : 0.6) - focus.strength) * (1 - Math.exp(-dt * 2.5))

    const glow = 1 - Math.exp(-dt * 5)
    for (const n of nodes) n.lit += (attention(n) - n.lit) * glow

    nextSignal -= dt
    if (nextSignal <= 0) {
      nextSignal = 0.16 + Math.random() * 0.3
      spawnSignal()
    }
    for (const s of signals) s.t += dt / 1.1
    signals = signals.filter((s) => {
      if (s.t < 1) return true
      const next = s.hops > 0 ? neighbour(s.to, s.from) : undefined
      if (!next) return false
      s.from = s.to; s.to = next; s.t = 0; s.hops--
      return true
    })
  }

  function attention(n: Node) {
    const d = Math.hypot(n.x - focus.x, n.y - focus.y) / reach
    return d >= 1 ? 0 : (1 - d * d) ** 2 * focus.strength
  }

  function neighbour(n: Node, not?: Node): Node | undefined {
    const options = nodes.filter((m) => m !== n && m !== not && Math.hypot(m.x - n.x, m.y - n.y) < link * 0.85)
    return options[Math.floor(Math.random() * options.length)]
  }
  function spawnSignal() {
    if (signals.length >= (small ? 12 : 22)) return
    // half start near the focus, half anywhere, so the whole lattice stays alive
    const lit = nodes.filter((n) => n.lit > 0.12)
    const pool = Math.random() < 0.5 && lit.length ? lit : nodes
    const from = pool[Math.floor(Math.random() * pool.length)]
    const to = from && neighbour(from)
    if (to) signals.push({ from, to, t: 0, hops: 3 })
  }

  function draw() {
    if (!ctx || !w) return
    ctx.globalCompositeOperation = 'source-over'
    ctx.clearRect(0, 0, w, h)
    ctx.lineCap = 'round'
    const additive: GlobalCompositeOperation = theme === 'dark' ? 'lighter' : 'source-over'
    ctx.globalCompositeOperation = additive

    drawWaves()

    // synaptic edges, batched by opacity so each level is a single stroke
    const calm: number[][] = Array.from({ length: LEVELS }, () => [])
    const active: number[][] = Array.from({ length: LEVELS }, () => [])
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i]
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j]
        const dx = a.x - b.x
        if (dx > link || dx < -link) continue
        const dy = a.y - b.y
        const d2 = dx * dx + dy * dy
        if (d2 > link * link) continue
        // phones: a flatter falloff, so long edges stay visible across the screen
        const near = 1 - Math.sqrt(d2) / link
        const fall = (small ? near ** 0.6 : near ** 0.85) * Math.min(a.fade, b.fade)
        calm[Math.min(LEVELS - 1, Math.floor(fall * LEVELS))].push(a.x, a.y, b.x, b.y)
        const hot = Math.sqrt(fall) * Math.min(a.lit, b.lit) * 1.5
        if (hot > 0.04) active[Math.min(LEVELS - 1, Math.floor(hot * LEVELS))].push(a.x, a.y, b.x, b.y)
      }
    }
    strokeLevels(calm, pal.edge, pal.edgeA * (small ? 1.5 : 1), small ? 1.3 : 0.95)
    strokeLevels(active, pal.path, pal.pathA * 0.16, 5)     // soft bloom under the lit edges
    strokeLevels(active, pal.path, pal.pathA, small ? 1.4 : 1.25)

    // attention pathways: focus → its strongest nodes, gently bowed
    const heads = nodes.filter((n) => n.lit > 0.05).sort((p, q) => q.lit - p.lit).slice(0, HEADS)
    for (const n of heads) {
      const dx = n.x - focus.x
      const dy = n.y - focus.y
      const g = ctx.createLinearGradient(focus.x, focus.y, n.x, n.y)
      g.addColorStop(0, `rgba(${pal.path},0)`)
      g.addColorStop(1, `rgba(${pal.path},${(n.lit * pal.pathA * n.fade).toFixed(3)})`)
      ctx.strokeStyle = g
      ctx.lineWidth = 0.8 + n.lit * 0.9
      ctx.beginPath()
      ctx.moveTo(focus.x, focus.y)
      ctx.quadraticCurveTo(focus.x + dx * 0.5 - dy * 0.12, focus.y + dy * 0.5 + dx * 0.12, n.x, n.y)
      ctx.stroke()
    }

    for (const n of nodes) {
      const size = (n.r * 6 + n.lit * 26) * (small ? 1.1 : 1)
      stamp(n.x, n.y, size, (pal.glowA * 0.55 + n.lit * pal.glowA) * n.fade)
      ctx.fillStyle = `rgba(${n.lit > 0.3 ? pal.hot : n.alt ? pal.node2 : pal.node},${((pal.nodeA + (1 - pal.nodeA) * n.lit) * n.fade).toFixed(3)})`
      dot(n.x, n.y, n.r + n.lit * 1.1)
    }

    for (const s of signals) {
      const t = s.t * s.t * (3 - 2 * s.t)
      const alpha = Math.sin(Math.PI * Math.min(1, s.t))
      const dx = s.to.x - s.from.x
      const dy = s.to.y - s.from.y
      const x = s.from.x + dx * t
      const y = s.from.y + dy * t
      const t0 = Math.max(0, t - 0.28)
      ctx.strokeStyle = `rgba(${pal.hot},${(alpha * 0.8).toFixed(3)})`
      ctx.lineWidth = small ? 1.9 : 1.7
      ctx.beginPath()
      ctx.moveTo(s.from.x + dx * t0, s.from.y + dy * t0)
      ctx.lineTo(x, y)
      ctx.stroke()
      stamp(x, y, 20, alpha * 0.9)
      ctx.fillStyle = `rgba(${pal.hot},${alpha.toFixed(3)})`
      dot(x, y, 1.9)
    }

    if (w >= 1000) drawGlyphs()
    ctx.globalCompositeOperation = 'source-over'
  }

  /** Long harmonic filaments: each is a pair of near-parallel sine arcs. */
  function drawWaves() {
    if (!ctx) return
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, `rgba(${pal.wave},${(pal.waveA * 0.35).toFixed(3)})`)
    g.addColorStop(0.65, `rgba(${pal.wave},${pal.waveA})`)
    g.addColorStop(1, `rgba(${pal.wave},${(pal.waveA * 0.5).toFixed(3)})`)
    ctx.strokeStyle = g
    const span = Math.max(w, 620)
    for (const wave of WAVES) {
      for (let strand = 0; strand < 2; strand++) {
        ctx.lineWidth = strand ? 0.7 : small ? 1.3 : 1.1
        ctx.beginPath()
        for (let x = -10; x <= w + 10; x += 12) {
          const k = (x / span) * Math.PI * 2 * wave.len
          const y = h * wave.y
            + Math.sin(k + wave.phase + time * wave.speed) * h * wave.amp
            + Math.sin(k * 2.1 - time * wave.speed * 1.4 + strand * 0.9) * h * wave.amp * 0.32
            + strand * 9
          if (x < 0) ctx.moveTo(x, y); else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    }
  }

  /** Right-hand side only, easing in, so they never sit under the copy. */
  function drawGlyphs() {
    if (!ctx) return
    ctx.font = '11px "Fira Code", ui-monospace, monospace'
    for (const n of nodes) {
      if (!n.glyph) continue
      const side = Math.min(1, Math.max(0, (n.x / w - 0.62) / 0.1))
      if (!side) continue
      ctx.fillStyle = `rgba(${pal.node},${(pal.glyphA * side * n.fade).toFixed(3)})`
      ctx.fillText(n.glyph, n.x + 9, n.y - 8)
    }
  }

  function strokeLevels(levels: number[][], rgb: string, peak: number, width: number) {
    if (!ctx) return
    ctx.lineWidth = width
    levels.forEach((pts, level) => {
      if (!pts.length) return
      ctx.strokeStyle = `rgba(${rgb},${Math.min(1, ((level + 0.7) / LEVELS) * peak).toFixed(3)})`
      ctx.beginPath()
      for (let i = 0; i < pts.length; i += 4) { ctx.moveTo(pts[i], pts[i + 1]); ctx.lineTo(pts[i + 2], pts[i + 3]) }
      ctx.stroke()
    })
  }
  function stamp(x: number, y: number, size: number, alpha: number) {
    if (!ctx || !halo || alpha < 0.02) return
    ctx.globalAlpha = Math.min(1, alpha)
    ctx.drawImage(halo, x - size / 2, y - size / 2, size, size)
    ctx.globalAlpha = 1
  }
  function dot(x: number, y: number, r: number) {
    if (!ctx) return
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  /** Compose a finished still: the first frame, or the only one. */
  function settle() {
    for (const n of nodes) n.lit = attention(n)
    if (opts.static && !signals.length) {
      // a fixed handful of mid-flight pulses, so the still reads as alive
      for (let i = 3; i < nodes.length; i += 11) {
        const from = nodes[i]
        const to = nodes.find((m) => m !== from && Math.hypot(m.x - from.x, m.y - from.y) < link * 0.8)
        if (to) signals.push({ from, to, t: 0.5, hops: 0 })
      }
    }
    draw()
  }

  function frame(now: number) {
    raf = requestAnimationFrame(frame)
    const dt = Math.min((now - last) / 1000, 0.05)   // no jump after a pause
    last = now
    step(dt)
    draw()
  }

  makeHalo()
  resize()

  return {
    resize,
    setActive(on: boolean) {
      if (opts.static || on === !!raf) return
      if (on) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      } else {
        cancelAnimationFrame(raf)
        raf = 0
      }
    },
    setTheme(next: FieldTheme) {
      theme = next
      pal = PALETTES[next]
      makeHalo()
      if (!raf) draw()
    },
    /** Canvas-space pointer, or null to hand attention back to the idle wander. */
    attend(p: { x: number; y: number } | null) {
      pointer.on = !!p
      if (p) { pointer.x = p.x; pointer.y = p.y }
    },
    destroy() { cancelAnimationFrame(raf); raf = 0 },
  }
}
