/**
 * battleEngine — a dependency-free Canvas 2D battle between pearl-white AI
 * robots and crimson creatures, painted behind the homepage hero.
 *
 * Performance model:
 *  • Two canvases. `bg` (sky auras, ruined skyline, ground grid) is painted
 *    only on resize; `fx` (units, shots, sparks, beams) is painted per frame.
 *  • Every glowing silhouette is rasterised ONCE into an offscreen sprite with
 *    its shadow-blur aura baked in, so frames are just drawImage calls — no
 *    per-frame blur.
 *  • Pooled particles with a hard cap, DPR capped at 1.5, the loop stops when
 *    the hero is off-screen or the tab is hidden, and quality drops itself if
 *    the device can't hold ~40 fps.
 *  • `static` mode (reduced motion) paints a single dramatic frame.
 */

// ── palette (the scene is always a night stage, whatever the site theme) ──
const PEARL = '#F7F5EF'
const PEARL_GLOW = 'rgba(236, 242, 255, 0.95)'
const PEARL_RGB = '240, 244, 255'
const CRIMSON = '#FF1E3C'
const CRIMSON_GLOW = 'rgba(255, 24, 56, 0.95)'
const CRIMSON_RGB = '255, 30, 60'

type Faction = 'bot' | 'beast'
type Kind = 'mech' | 'drone' | 'beast' | 'wraith'

interface Blueprint {
  w: number; h: number               // design box (units)
  ground: boolean                    // anchored at feet vs. centred
  muzzle: [number, number]           // firing point inside the box
  draw: (c: CanvasRenderingContext2D) => void
  glow: string
}

interface Unit {
  kind: Kind; faction: Faction
  x: number; y: number               // anchor (feet or centre), CSS px
  k: number                          // design-unit → px scale
  phase: number
  sprite: HTMLCanvasElement; pad: number
  cool: number; flash: number; recoil: number
  dx: number; dy: number             // live offset from anchor (bob / sway)
  depth: number                      // 0.6 back row … 1 front row
}

interface Shot {
  x: number; y: number; vx: number; vy: number
  faction: Faction; target: Unit; life: number
}

interface Spark {
  x: number; y: number; vx: number; vy: number
  life: number; max: number; size: number; faction: Faction
}

interface Ring { x: number; y: number; r: number; life: number; max: number }

interface Beam { t: number; dur: number; bot: Unit; beast: Unit }

// ── silhouettes (design boxes; bots face right, creatures face left) ──────
function poly(c: CanvasRenderingContext2D, pts: number[]) {
  c.beginPath(); c.moveTo(pts[0], pts[1])
  for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1])
  c.closePath()
}

function armour(c: CanvasRenderingContext2D, top: string, bottom: string, h: number) {
  const g = c.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, top); g.addColorStop(1, bottom)
  return g
}

const BLUEPRINTS: Record<Kind, Blueprint> = {
  mech: {
    w: 150, h: 200, ground: true, muzzle: [148, 76], glow: PEARL_GLOW,
    draw(c) {
      c.fillStyle = armour(c, '#18233F', '#070B18', 200)
      c.strokeStyle = PEARL; c.lineWidth = 2.2; c.lineJoin = 'round'
      const parts = [
        [22, 58, 44, 54, 46, 80, 24, 84],                                   // rear pauldron
        [40, 120, 58, 120, 56, 170, 62, 197, 32, 197, 40, 170],             // rear leg
        [70, 120, 88, 120, 92, 170, 100, 197, 70, 197, 74, 170],            // front leg
        [38, 106, 92, 106, 90, 126, 40, 126],                               // pelvis
        [34, 62, 96, 62, 106, 86, 90, 112, 40, 112, 28, 86],                // torso
        [50, 32, 82, 32, 90, 46, 82, 60, 50, 60, 44, 46],                   // head
        [92, 69, 148, 71, 148, 81, 92, 83],                                 // arm cannon
        [84, 54, 110, 60, 106, 84, 84, 80],                                 // front pauldron
      ]
      for (const p of parts) { poly(c, p); c.fill(); c.stroke() }
      c.beginPath(); c.moveTo(54, 32); c.lineTo(46, 16); c.stroke()      // antenna
      // lit details
      c.fillStyle = PEARL
      poly(c, [64, 41, 90, 44, 88, 50, 64, 50]); c.fill()                 // visor
      c.beginPath(); c.arc(65, 86, 7, 0, Math.PI * 2); c.fill()           // reactor core
      c.fillRect(140, 70, 8, 12)                                          // barrel tip
      c.beginPath(); c.arc(46, 15, 2.5, 0, Math.PI * 2); c.fill()
      c.strokeStyle = 'rgba(247,245,239,0.55)'; c.lineWidth = 1.2
      c.beginPath(); c.moveTo(40, 96); c.lineTo(90, 96); c.moveTo(46, 150); c.lineTo(56, 150); c.moveTo(76, 150); c.lineTo(88, 150); c.stroke()
    },
  },
  drone: {
    w: 76, h: 44, ground: false, muzzle: [70, 25], glow: PEARL_GLOW,
    draw(c) {
      c.fillStyle = armour(c, '#1A2644', '#070B18', 44)
      c.strokeStyle = PEARL; c.lineWidth = 1.8
      poly(c, [10, 22, 22, 12, 54, 12, 70, 22, 54, 32, 22, 32]); c.fill(); c.stroke()
      poly(c, [26, 12, 34, 3, 48, 3, 52, 12]); c.fill(); c.stroke()
      poly(c, [4, 30, 18, 28, 16, 40]); c.fill(); c.stroke()
      c.fillStyle = PEARL
      c.beginPath(); c.arc(56, 22, 4, 0, Math.PI * 2); c.fill()
      c.fillRect(24, 21, 20, 2)
    },
  },
  beast: {
    w: 270, h: 190, ground: true, muzzle: [30, 124], glow: CRIMSON_GLOW,
    draw(c) {
      c.fillStyle = armour(c, '#2A0710', '#08020A', 190)
      c.strokeStyle = CRIMSON; c.lineJoin = 'round'
      // legs: thick jointed strokes, drawn under the body
      c.lineWidth = 8; c.lineCap = 'round'
      const legs = [[118, 112, 92, 66, 70, 188], [148, 116, 132, 58, 118, 188], [186, 116, 196, 58, 206, 188], [214, 112, 240, 70, 256, 188]]
      for (const [hx, hy, kx, ky, fx, fy] of legs) {
        c.strokeStyle = '#3A0B14'; c.lineWidth = 9
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke()
        c.strokeStyle = CRIMSON; c.lineWidth = 1.6
        c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(fx, fy); c.stroke()
      }
      c.lineWidth = 2.2
      // body with dorsal spikes
      poly(c, [96, 116, 118, 94, 134, 70, 146, 92, 162, 62, 176, 92, 192, 66, 204, 94, 220, 78, 226, 102, 244, 112, 236, 132, 200, 146, 140, 148, 104, 138])
      c.fill(); c.stroke()
      // tail + stinger
      c.beginPath(); c.moveTo(240, 116); c.quadraticCurveTo(268, 100, 262, 70); c.stroke()
      poly(c, [262, 70, 256, 58, 270, 64]); c.fill(); c.stroke()
      // head + open jaw (facing left)
      poly(c, [110, 104, 72, 94, 34, 108, 44, 120, 74, 118, 36, 136, 66, 146, 110, 136]); c.fill(); c.stroke()
      // teeth
      c.fillStyle = 'rgba(255,190,200,0.85)'
      poly(c, [48, 119, 52, 126, 56, 119]); c.fill()
      poly(c, [60, 119, 64, 127, 68, 119]); c.fill()
      // eyes
      c.fillStyle = '#FF6A7C'
      c.beginPath(); c.arc(62, 104, 3.4, 0, Math.PI * 2); c.arc(76, 101, 2.8, 0, Math.PI * 2); c.fill()
      // bioluminescent veins
      c.strokeStyle = 'rgba(255,30,60,0.6)'; c.lineWidth = 1.2
      c.beginPath(); c.moveTo(120, 124); c.quadraticCurveTo(160, 112, 214, 124); c.moveTo(130, 136); c.quadraticCurveTo(170, 130, 206, 136); c.stroke()
    },
  },
  wraith: {
    w: 120, h: 64, ground: false, muzzle: [40, 36], glow: CRIMSON_GLOW,
    draw(c) {
      c.fillStyle = armour(c, '#2A0710', '#08020A', 64)
      c.strokeStyle = CRIMSON; c.lineWidth = 1.8; c.lineJoin = 'round'
      // bat wings
      poly(c, [60, 30, 84, 6, 96, 18, 118, 10, 108, 30, 116, 44, 96, 38, 80, 46])
      c.fill(); c.stroke()
      poly(c, [60, 30, 36, 8, 26, 20, 6, 14, 14, 32, 6, 46, 26, 38, 42, 46])
      c.fill(); c.stroke()
      // body + head
      poly(c, [50, 26, 70, 26, 74, 40, 60, 58, 46, 40]); c.fill(); c.stroke()
      c.fillStyle = '#FF6A7C'
      c.beginPath(); c.arc(55, 34, 2.4, 0, Math.PI * 2); c.arc(64, 34, 2.4, 0, Math.PI * 2); c.fill()
    },
  },
}

// ── sprite factory ──────────────────────────────────────────────────────────
function makeSprite(bp: Blueprint, k: number, dpr: number): { cv: HTMLCanvasElement; pad: number } {
  const pad = Math.ceil(26 * k + 6)
  const cv = document.createElement('canvas')
  cv.width = Math.ceil((bp.w * k + pad * 2) * dpr)
  cv.height = Math.ceil((bp.h * k + pad * 2) * dpr)
  const c = cv.getContext('2d')
  if (!c) return { cv, pad }
  c.scale(dpr, dpr); c.translate(pad, pad); c.scale(k, k)
  // aura pass (blurred), then a crisp pass on top
  c.shadowColor = bp.glow; c.shadowBlur = 22 * k * dpr
  bp.draw(c)
  c.shadowBlur = 8 * k * dpr
  bp.draw(c)
  return { cv, pad }
}

function glowSprite(rgb: string, core: string): HTMLCanvasElement {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64
  const c = cv.getContext('2d')
  if (!c) return cv
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, core); g.addColorStop(0.18, `rgba(${rgb},0.9)`); g.addColorStop(0.45, `rgba(${rgb},0.28)`); g.addColorStop(1, `rgba(${rgb},0)`)
  c.fillStyle = g; c.fillRect(0, 0, 64, 64)
  return cv
}

const rand = (a: number, b: number) => a + Math.random() * (b - a)
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

// ── engine ──────────────────────────────────────────────────────────────────
export interface BattleOptions { static?: boolean }

export function createBattle(bg: HTMLCanvasElement, fx: HTMLCanvasElement, opts: BattleOptions = {}) {
  const bctx = bg.getContext('2d')
  const ctx = fx.getContext('2d')
  if (!bctx || !ctx) return { destroy() {}, surge() {}, impact() {}, setParallax() {}, setActive() {} }

  const pearlGlow = glowSprite(PEARL_RGB, '#FFFFFF')
  const redGlow = glowSprite(CRIMSON_RGB, '#FFD6DC')

  let W = 0, H = 0, dpr = 1, s = 1, groundY = 0, mobile = false
  let units: Unit[] = []
  const shots: Shot[] = []
  const sparks: Spark[] = []
  const rings: Ring[] = []
  let embers: { x: number; y: number; v: number; a: number; f: Faction }[] = []
  let beam: Beam | null = null
  let nextBeam = 3.5
  let t = 0, last = 0, raf = 0, active = true
  let quality = 1, frameAcc = 0, frameN = 0
  let px = 0, py = 0, tpx = 0, tpy = 0     // parallax (current / target)
  let shake = 0

  const SPARK_CAP = () => (mobile ? 110 : 220) * quality

  // ── layout ──
  function layout() {
    const rect = fx.getBoundingClientRect()
    W = Math.max(1, rect.width); H = Math.max(1, rect.height)
    mobile = W < 640
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5)
    s = mobile ? clamp(W / 820, 0.36, 0.55) : clamp(Math.min(W / 1300, H / 820), 0.5, 1.1)
    // phones: keep the fighters' feet above the floating dock
    groundY = mobile ? H - 104 : H * 0.86
    for (const cv of [bg, fx]) {
      const r = cv.getBoundingClientRect()
      cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr)
    }
    bctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)

    const spec: [Kind, number, number, number][] = mobile
      ? [
          ['mech', 0.16, 0, 1], ['drone', 0.2, 0.2, 0.9], ['drone', 0.1, 0.36, 0.8],
          ['beast', 0.82, 0, 1], ['wraith', 0.8, 0.24, 0.9], ['wraith', 0.92, 0.4, 0.8],
        ]
      : [
          ['mech', 0.24, -0.035, 0.7], ['mech', 0.1, 0, 1],
          ['drone', 0.2, 0.2, 0.9], ['drone', 0.33, 0.34, 0.75], ['drone', 0.08, 0.44, 0.8],
          ['beast', 0.77, -0.035, 0.7], ['beast', 0.9, 0, 1],
          ['wraith', 0.8, 0.18, 0.9], ['wraith', 0.66, 0.32, 0.75], ['wraith', 0.93, 0.42, 0.8],
        ]
    const cache = new Map<string, { cv: HTMLCanvasElement; pad: number }>()
    units = spec.map(([kind, fxr, fy, depth]) => {
      const bp = BLUEPRINTS[kind]
      const k = s * depth * (bp.ground ? 1 : 0.9)
      const key = `${kind}:${k.toFixed(3)}`
      if (!cache.has(key)) cache.set(key, makeSprite(bp, k, dpr))
      const { cv, pad } = cache.get(key)!
      return {
        kind, faction: kind === 'mech' || kind === 'drone' ? 'bot' : 'beast',
        x: W * fxr, y: bp.ground ? groundY + fy * H : H * fy + H * 0.08,
        k, phase: Math.random() * Math.PI * 2, sprite: cv, pad,
        cool: rand(0.4, 2.2), flash: 0, recoil: 0, dx: 0, dy: 0, depth,
      } satisfies Unit
    })
    // back row first so the front row overlaps it
    units.sort((a, b) => a.depth - b.depth)

    embers = Array.from({ length: mobile ? 22 : 44 }, () => spawnEmber(true))
    shots.length = 0; sparks.length = 0; rings.length = 0; beam = null
    paintBackdrop()
  }

  function spawnEmber(anywhere = false) {
    const x = Math.random() * W
    return { x, y: anywhere ? Math.random() * H : H + 10, v: rand(10, 34), a: rand(0.25, 0.8), f: (x < W / 2 ? 'bot' : 'beast') as Faction }
  }

  // ── static backdrop: faction auras, ruined skyline, perspective ground ──
  function paintBackdrop() {
    const c = bctx!
    c.clearRect(0, 0, W, H)

    const aura = (x: number, rgb: string, a: number) => {
      const g = c.createRadialGradient(x, groundY - H * 0.1, 0, x, groundY - H * 0.1, Math.max(W, H) * 0.55)
      g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`)
      c.fillStyle = g; c.fillRect(0, 0, W, H)
    }
    aura(W * 0.12, PEARL_RGB, 0.16)
    aura(W * 0.88, CRIMSON_RGB, 0.2)

    // skyline: deterministic blocky ruins, lit windows in faction colours
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    let x = -20
    while (x < W + 20) {
      const bw = (28 + rnd() * 70) * s
      const bh = (40 + rnd() * 190) * s * (0.7 + 0.6 * Math.abs(x / W - 0.5))
      const top = groundY - bh
      c.fillStyle = '#060B1C'
      c.beginPath(); c.moveTo(x, groundY); c.lineTo(x, top + rnd() * 10 * s); c.lineTo(x + bw * 0.6, top)
      c.lineTo(x + bw * 0.75, top + (rnd() * 26 + 6) * s); c.lineTo(x + bw, top + rnd() * 18 * s); c.lineTo(x + bw, groundY); c.fill()
      const leftSide = x + bw / 2 < W / 2
      c.fillStyle = leftSide ? 'rgba(240,244,255,0.5)' : 'rgba(255,40,70,0.55)'
      for (let i = 0; i < 4; i++) if (rnd() > 0.45) c.fillRect(x + rnd() * bw * 0.8, top + 14 * s + rnd() * bh * 0.7, 2, 2)
      x += bw + rnd() * 14 * s
    }

    // ground plane
    const gg = c.createLinearGradient(0, groundY, 0, H)
    gg.addColorStop(0, '#081028'); gg.addColorStop(1, '#02040C')
    c.fillStyle = gg; c.fillRect(0, groundY, W, H - groundY)

    // horizon — pearl on the left, crimson on the right
    const hz = c.createLinearGradient(0, 0, W, 0)
    hz.addColorStop(0, 'rgba(240,244,255,0.85)'); hz.addColorStop(0.45, 'rgba(120,160,255,0.25)')
    hz.addColorStop(0.55, 'rgba(255,60,90,0.25)'); hz.addColorStop(1, 'rgba(255,30,60,0.9)')
    c.fillStyle = hz; c.fillRect(0, groundY - 1, W, 1.6)

    // perspective grid
    c.strokeStyle = 'rgba(90,140,255,0.10)'; c.lineWidth = 1
    const vx = W / 2
    for (let i = -14; i <= 14; i++) {
      c.beginPath(); c.moveTo(vx + i * 18 * s, groundY); c.lineTo(vx + i * W * 0.14, H); c.stroke()
    }
    for (let i = 1; i < 7; i++) {
      const yy = groundY + (H - groundY) * Math.pow(i / 7, 1.8)
      c.beginPath(); c.moveTo(0, yy); c.lineTo(W, yy); c.stroke()
    }
  }

  // ── combat helpers ──
  const center = (u: Unit): [number, number] => {
    const bp = BLUEPRINTS[u.kind]
    return bp.ground
      ? [u.x + u.dx, u.y + u.dy - bp.h * u.k * 0.55]
      : [u.x + u.dx, u.y + u.dy]
  }
  const muzzle = (u: Unit): [number, number] => {
    const bp = BLUEPRINTS[u.kind]
    const ox = (bp.muzzle[0] - bp.w / 2) * u.k
    const oy = bp.ground ? (bp.muzzle[1] - bp.h) * u.k : (bp.muzzle[1] - bp.h / 2) * u.k
    return [u.x + u.dx + ox, u.y + u.dy + oy]
  }

  function fire(u: Unit) {
    const foes = units.filter((o) => o.faction !== u.faction)
    if (!foes.length) return
    const target = foes[(Math.random() * foes.length) | 0]
    const [mx, my] = muzzle(u)
    const [tx, ty] = center(target)
    const speed = (u.faction === 'bot' ? 1500 : 640) * Math.max(s, 0.45)
    const d = Math.hypot(tx - mx, ty - my) || 1
    shots.push({ x: mx, y: my, vx: ((tx - mx) / d) * speed, vy: ((ty - my + rand(-12, 12)) / d) * speed, faction: u.faction, target, life: 3 })
    u.recoil = 1
    burst(mx, my, u.faction, 4, 0.5)
  }

  function burst(x: number, y: number, f: Faction, n: number, power = 1) {
    const cap = SPARK_CAP()
    for (let i = 0; i < n && sparks.length < cap; i++) {
      const a = Math.random() * Math.PI * 2
      const v = rand(60, 360) * power * Math.max(s, 0.5)
      const max = rand(0.25, 0.7)
      sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: max, max, size: rand(1, 2.6), faction: f })
    }
  }

  function startBeam() {
    const bots = units.filter((u) => u.kind === 'mech')
    const beasts = units.filter((u) => u.kind === 'beast')
    if (!bots.length || !beasts.length) return
    // the front-row champions duel
    beam = { t: 0, dur: 1.8, bot: bots[bots.length - 1], beast: beasts[beasts.length - 1] }
  }

  function surge() {
    for (const u of units) u.cool = Math.min(u.cool, rand(0, 0.25))
    if (!beam) startBeam()
  }

  // ── simulation ──
  function step(dt: number) {
    t += dt
    px += (tpx - px) * Math.min(1, dt * 4); py += (tpy - py) * Math.min(1, dt * 4)
    shake = Math.max(0, shake - dt * 3)

    for (const u of units) {
      const bp = BLUEPRINTS[u.kind]
      if (bp.ground) {
        u.dx = Math.sin(t * 0.45 + u.phase) * 16 * s * (u.faction === 'bot' ? 1 : -1) - u.recoil * 7 * s * (u.faction === 'bot' ? 1 : -1)
        u.dy = -Math.abs(Math.sin(t * 1.6 + u.phase)) * 2 * s
      } else {
        u.dx = Math.sin(t * 0.7 + u.phase) * 34 * s
        u.dy = Math.sin(t * 1.3 + u.phase * 1.7) * 18 * s
      }
      u.recoil = Math.max(0, u.recoil - dt * 5)
      u.flash = Math.max(0, u.flash - dt * 4)
      const duelling = beam && (beam.bot === u || beam.beast === u)
      if (!duelling) {
        u.cool -= dt
        if (u.cool <= 0) { fire(u); u.cool = rand(1.1, 2.9) }
      }
    }

    for (let i = shots.length - 1; i >= 0; i--) {
      const p = shots[i]
      p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt
      const [tx, ty] = center(p.target)
      const hitR = BLUEPRINTS[p.target.kind].ground ? 40 * p.target.k : 22 * p.target.k
      if (Math.hypot(tx - p.x, ty - p.y) < hitR + 6) {
        burst(p.x, p.y, p.faction, mobile ? 8 : 14)
        p.target.flash = 1
        shots.splice(i, 1)
      } else if (p.life <= 0 || p.x < -60 || p.x > W + 60 || p.y < -60 || p.y > H + 60) {
        shots.splice(i, 1)
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i]
      p.life -= dt
      if (p.life <= 0) { sparks.splice(i, 1); continue }
      p.vy += 420 * dt * Math.max(s, 0.5)
      p.vx *= 1 - dt * 1.5
      p.x += p.vx * dt; p.y += p.vy * dt
    }

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i]
      r.life -= dt; r.r += dt * 520 * Math.max(s, 0.5)
      if (r.life <= 0) rings.splice(i, 1)
    }

    if (quality > 0.5) {
      for (const e of embers) {
        e.y -= e.v * dt; e.x += Math.sin(t + e.y * 0.02) * 6 * dt
        if (e.y < -10) Object.assign(e, spawnEmber())
      }
    }

    if (beam) {
      beam.t += dt
      const cp = clashPoint()
      if (cp && Math.random() < (mobile ? 0.5 : 0.9)) burst(cp[0], cp[1], Math.random() < 0.5 ? 'bot' : 'beast', mobile ? 2 : 4, 0.8)
      if (beam.t >= beam.dur) {
        if (cp) {
          rings.push({ x: cp[0], y: cp[1], r: 8, life: 0.7, max: 0.7 })
          burst(cp[0], cp[1], 'bot', mobile ? 14 : 26, 1.4)
          burst(cp[0], cp[1], 'beast', mobile ? 14 : 26, 1.4)
        }
        beam.bot.flash = beam.beast.flash = 1
        beam.bot.recoil = beam.beast.recoil = 1
        shake = 1
        beam = null
        nextBeam = t + rand(6, 10)
      }
    } else if (t >= nextBeam) {
      startBeam()
    }
  }

  function clashPoint(): [number, number] | null {
    if (!beam) return null
    const [ax, ay] = muzzle(beam.bot)
    const [bx, by] = muzzle(beam.beast)
    // the struggle: the meeting point shoves back and forth
    const m = 0.5 + 0.09 * Math.sin(beam.t * 7) + 0.04 * Math.sin(beam.t * 19)
    return [ax + (bx - ax) * m, ay + (by - ay) * m]
  }

  // ── render ──
  function render() {
    const c = ctx!
    c.setTransform(dpr, 0, 0, dpr, 0, 0)
    c.clearRect(0, 0, W, H)
    const sx = shake ? rand(-3, 3) * shake : 0
    const sy = shake ? rand(-3, 3) * shake : 0
    c.translate(px * 14 + sx, py * 8 + sy)

    // embers (behind units)
    if (quality > 0.5) {
      c.globalCompositeOperation = 'lighter'
      for (const e of embers) {
        c.globalAlpha = e.a * (0.6 + 0.4 * Math.sin(t * 3 + e.x))
        c.drawImage(e.f === 'bot' ? pearlGlow : redGlow, e.x - 3, e.y - 3, 6, 6)
      }
      c.globalAlpha = 1
      c.globalCompositeOperation = 'source-over'
    }

    // units
    for (const u of units) {
      const bp = BLUEPRINTS[u.kind]
      const sw = u.sprite.width / dpr, sh = u.sprite.height / dpr
      const ax = u.x + u.dx - sw / 2
      const ay = bp.ground ? u.y + u.dy - sh + u.pad : u.y + u.dy - sh / 2
      c.globalAlpha = 0.55 + 0.45 * u.depth
      if (u.kind === 'wraith') {
        // wing-beat: squash the sprite vertically around its centre
        const flap = 0.72 + 0.28 * Math.abs(Math.sin(t * 5 + u.phase))
        c.save(); c.translate(ax + sw / 2, ay + sh / 2); c.scale(1, flap)
        c.drawImage(u.sprite, -sw / 2, -sh / 2, sw, sh); c.restore()
      } else {
        c.drawImage(u.sprite, ax, ay, sw, sh)
      }
      // hit flash: re-add the sprite additively
      if (u.flash > 0) {
        c.globalCompositeOperation = 'lighter'; c.globalAlpha = u.flash * 0.7
        c.drawImage(u.sprite, ax, ay, sw, sh)
        c.globalCompositeOperation = 'source-over'
      }
      c.globalAlpha = 1
    }

    c.globalCompositeOperation = 'lighter'

    // beam duel
    if (beam) {
      const [ax, ay] = muzzle(beam.bot)
      const [bx, by] = muzzle(beam.beast)
      const cp = clashPoint()!
      const grow = Math.min(1, beam.t / 0.25)
      const fade = beam.t > beam.dur - 0.2 ? (beam.dur - beam.t) / 0.2 : 1
      const flick = 0.85 + 0.15 * Math.sin(t * 60)
      const wBeam = 9 * Math.max(s, 0.5) * grow * fade * flick
      c.lineCap = 'round'
      const lane = (x1: number, y1: number, x2: number, y2: number, rgb: string) => {
        c.strokeStyle = `rgba(${rgb},0.35)`; c.lineWidth = wBeam * 2.6
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
        c.strokeStyle = `rgba(${rgb},0.95)`; c.lineWidth = wBeam
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
        c.strokeStyle = 'rgba(255,255,255,0.9)'; c.lineWidth = wBeam * 0.3
        c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
      }
      lane(ax, ay, cp[0], cp[1], PEARL_RGB)
      lane(bx, by, cp[0], cp[1], CRIMSON_RGB)
      const flare = (60 + 30 * Math.sin(t * 23)) * Math.max(s, 0.5) * grow * fade
      c.drawImage(pearlGlow, cp[0] - flare, cp[1] - flare, flare * 2, flare * 2)
      c.drawImage(redGlow, cp[0] - flare * 0.8, cp[1] - flare * 0.8, flare * 1.6, flare * 1.6)
      c.drawImage(pearlGlow, ax - 18, ay - 18, 36, 36)
      c.drawImage(redGlow, bx - 18, by - 18, 36, 36)
    }

    // shots
    for (const p of shots) {
      if (p.faction === 'bot') {
        const sp = Math.hypot(p.vx, p.vy) || 1
        const len = 46 * Math.max(s, 0.5)
        c.strokeStyle = 'rgba(240,244,255,0.95)'; c.lineWidth = 2.4 * Math.max(s, 0.6)
        c.beginPath(); c.moveTo(p.x - (p.vx / sp) * len, p.y - (p.vy / sp) * len); c.lineTo(p.x, p.y); c.stroke()
        c.drawImage(pearlGlow, p.x - 10, p.y - 10, 20, 20)
      } else {
        const r = 15 * Math.max(s, 0.55)
        if (quality > 0.5) {
          c.globalAlpha = 0.35; c.drawImage(redGlow, p.x - p.vx * 0.03 - r, p.y - p.vy * 0.03 - r, r * 2, r * 2)
          c.globalAlpha = 0.18; c.drawImage(redGlow, p.x - p.vx * 0.06 - r, p.y - p.vy * 0.06 - r, r * 2, r * 2)
          c.globalAlpha = 1
        }
        c.drawImage(redGlow, p.x - r * 1.3, p.y - r * 1.3, r * 2.6, r * 2.6)
      }
    }

    // sparks
    for (const p of sparks) {
      const a = p.life / p.max
      c.globalAlpha = a
      const g = p.faction === 'bot' ? pearlGlow : redGlow
      const z = p.size * 4
      c.drawImage(g, p.x - z / 2, p.y - z / 2, z, z)
    }
    c.globalAlpha = 1

    // shockwaves (pearl + crimson double ring)
    for (const r of rings) {
      const a = r.life / r.max
      c.lineWidth = 3 * a + 0.5
      c.strokeStyle = `rgba(${PEARL_RGB},${a * 0.8})`
      c.beginPath(); c.arc(r.x, r.y, r.r, 0, Math.PI * 2); c.stroke()
      c.strokeStyle = `rgba(${CRIMSON_RGB},${a * 0.7})`
      c.beginPath(); c.arc(r.x, r.y, r.r * 0.8, 0, Math.PI * 2); c.stroke()
    }

    c.globalCompositeOperation = 'source-over'
    // mirror the parallax on the static layer (compositor-only transform)
    bg.style.transform = `translate3d(${px * 6}px, ${py * 4}px, 0)`
  }

  function frame(now: number) {
    raf = 0
    if (!active) return
    const dt = Math.min(0.05, last ? (now - last) / 1000 : 0.016)
    last = now
    // adaptive quality: if the device averages under ~40 fps, thin the effects
    frameAcc += dt; frameN++
    if (frameN === 90) {
      if (frameAcc / frameN > 1 / 40 && quality > 0.5) quality = 0.5
      frameAcc = 0; frameN = 0
    }
    step(dt)
    render()
    raf = requestAnimationFrame(frame)
  }

  function setActive(on: boolean) {
    if (opts.static) return
    active = on
    if (on && !raf) { last = 0; raf = requestAnimationFrame(frame) }
    if (!on && raf) { cancelAnimationFrame(raf); raf = 0 }
  }

  let resizeTimer = 0
  const ro = new ResizeObserver(() => {
    clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(() => { layout(); if (opts.static) paintStill() }, 120)
  })

  function paintStill() {
    // freeze mid-duel for a dramatic single frame
    t = 2; step(0.016); startBeam()
    if (beam) beam.t = 0.9
    for (let i = 0; i < 20; i++) step(0.016)
    if (beam) beam.t = 0.9
    render()
  }

  layout()
  ro.observe(fx)
  if (opts.static) paintStill()
  else raf = requestAnimationFrame(frame)

  return {
    /** Everyone fires now and the champions lock beams (tap / click). */
    surge,
    /** Intro landing: a shockwave from the centre, a jolt, then a surge. */
    impact() {
      rings.push({ x: W / 2, y: H * 0.46, r: 10, life: 0.9, max: 0.9 })
      burst(W / 2, H * 0.46, 'bot', mobile ? 18 : 36, 1.8)
      shake = 1.4
      for (const u of units) u.flash = 1
      surge()
    },
    /** Pointer position in [-1, 1] for the subtle depth parallax. */
    setParallax(x: number, y: number) { tpx = clamp(x, -1, 1); tpy = clamp(y, -1, 1) },
    /** Pause/resume (off-screen, hidden tab). */
    setActive,
    destroy() { setActive(false); ro.disconnect(); clearTimeout(resizeTimer) },
  }
}
