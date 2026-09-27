/**
 * warpIntro — Canvas 2D hyperspace intro: a glowing portal opens, the star
 * field stretches into warp streaks, and three AI-piloted spacecraft burst out
 * of the portal past the camera. Calls `onLand` at the moment of impact.
 *
 * Cheap by construction: the ship and glow sprites are rasterised once (aura
 * baked in), stars are plain line strokes, DPR is capped, and the whole thing
 * runs for ~3 seconds once per session.
 */

export const INTRO_MS = 2900         // warp → impact
const PEARL = '#F7F5EF'
const CYAN_RGB = '34, 211, 238'
const PEARL_RGB = '240, 244, 255'

const ease = {
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
}
const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

/** Sleek interceptor, nose pointing +x, robot pilot in the canopy. Box 120×56. */
function drawShip(c: CanvasRenderingContext2D) {
  const hull = c.createLinearGradient(0, 0, 0, 56)
  hull.addColorStop(0, '#1C2A4C'); hull.addColorStop(1, '#070C1C')
  c.fillStyle = hull; c.strokeStyle = PEARL; c.lineWidth = 2; c.lineJoin = 'round'
  // swept wings
  c.beginPath(); c.moveTo(40, 28); c.lineTo(14, 2); c.lineTo(30, 2); c.lineTo(70, 24); c.closePath(); c.fill(); c.stroke()
  c.beginPath(); c.moveTo(40, 28); c.lineTo(14, 54); c.lineTo(30, 54); c.lineTo(70, 32); c.closePath(); c.fill(); c.stroke()
  // fuselage
  c.beginPath(); c.moveTo(118, 28); c.lineTo(78, 18); c.lineTo(22, 20); c.lineTo(10, 28); c.lineTo(22, 36); c.lineTo(78, 38); c.closePath(); c.fill(); c.stroke()
  // canopy with a robot pilot (head + glowing visor)
  c.fillStyle = 'rgba(34,211,238,0.18)'
  c.beginPath(); c.ellipse(76, 28, 14, 7, 0, 0, Math.PI * 2); c.fill(); c.stroke()
  c.fillStyle = PEARL
  c.fillRect(70, 23, 10, 10)
  c.fillStyle = `rgb(${CYAN_RGB})`; c.fillRect(74, 26, 6, 2.4)
  // engine bells
  c.fillStyle = `rgb(${CYAN_RGB})`
  c.fillRect(8, 24, 5, 8)
  // hull seams
  c.strokeStyle = 'rgba(247,245,239,0.5)'; c.lineWidth = 1
  c.beginPath(); c.moveTo(30, 28); c.lineTo(62, 28); c.stroke()
}

function sprite(w: number, h: number, pad: number, draw: (c: CanvasRenderingContext2D) => void, glow: string) {
  const cv = document.createElement('canvas')
  cv.width = w + pad * 2; cv.height = h + pad * 2
  const c = cv.getContext('2d')
  if (!c) return cv
  c.translate(pad, pad)
  c.shadowColor = glow; c.shadowBlur = pad * 0.9; draw(c)
  c.shadowBlur = pad * 0.3; draw(c)
  return cv
}

function glow(rgb: string) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 64
  const c = cv.getContext('2d')
  if (!c) return cv
  const g = c.createRadialGradient(32, 32, 0, 32, 32, 32)
  g.addColorStop(0, '#fff'); g.addColorStop(0.2, `rgba(${rgb},0.9)`); g.addColorStop(0.5, `rgba(${rgb},0.25)`); g.addColorStop(1, `rgba(${rgb},0)`)
  c.fillStyle = g; c.fillRect(0, 0, 64, 64)
  return cv
}

export function runWarpIntro(canvas: HTMLCanvasElement, onLand: () => void) {
  const ctx = canvas.getContext('2d')
  if (!ctx) { onLand(); return () => {} }

  const shipSprite = sprite(120, 56, 22, drawShip, 'rgba(236,242,255,0.95)')
  const cyanGlow = glow(CYAN_RGB)
  const pearlGlow = glow(PEARL_RGB)

  let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, f = 0
  const fit = () => {
    W = window.innerWidth; H = window.innerHeight
    dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr)
    cx = W / 2; cy = H * 0.46; f = Math.min(W, H) * 0.9
  }
  fit()
  window.addEventListener('resize', fit)

  // stars in a tube around the camera axis; z = depth (1 far … 0 at camera)
  const STAR_N = W < 640 ? 170 : 340
  const stars = Array.from({ length: STAR_N }, () => {
    const a = Math.random() * Math.PI * 2, r = 0.15 + Math.random() * 1.6
    return { x: Math.cos(a) * r, y: Math.sin(a) * r, z: Math.random(), pz: 0, tint: Math.random() < 0.3 }
  })
  for (const s of stars) s.pz = s.z

  // three ships leave the portal in a staggered V, each on its own heading
  const ships = [
    { launch: 0.95, dur: 1.15, ang: -2.55, off: 0.34 },
    { launch: 1.25, dur: 1.1, ang: -0.45, off: 0.3 },
    { launch: 1.55, dur: 1.05, ang: 1.9, off: 0.26 },
  ]

  let raf = 0, t0 = 0, last = 0, landed = false

  const frame = (now: number) => {
    if (!t0) t0 = last = now
    const t = (now - t0) / 1000
    // real frame time, so 120 Hz screens don't warp twice as fast
    const dt = Math.min(0.05, (now - last) / 1000 || 1 / 60)
    last = now
    const c = ctx
    c.setTransform(dpr, 0, 0, dpr, 0, 0)

    // warp speed: idle drift → full hyperspace → brake just before landing
    const speed = t < 0.6 ? 0.08 : t < 2.3 ? 0.08 + ease.inCubic(clamp01((t - 0.6) / 1.2)) * 1.9 : 1.98 * (1 - clamp01((t - 2.3) / 0.6))
    // motion-blur trail: translucent clear keeps a hint of the last frame
    c.globalCompositeOperation = 'source-over'
    c.fillStyle = `rgba(2, 5, 15, ${speed > 1 ? 0.5 : 0.85})`
    c.fillRect(0, 0, W, H)

    // tunnel tint
    const tunnel = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7)
    tunnel.addColorStop(0, `rgba(30, 64, 175, ${0.18 + speed * 0.08})`)
    tunnel.addColorStop(1, 'rgba(2, 5, 15, 0)')
    c.fillStyle = tunnel; c.fillRect(0, 0, W, H)

    c.globalCompositeOperation = 'lighter'
    for (const s of stars) {
      s.pz = s.z
      s.z -= speed * dt * 1.4
      if (s.z <= 0.02) { s.z = 1; s.pz = 1 }
      const x1 = cx + (s.x / s.pz) * f * 0.12, y1 = cy + (s.y / s.pz) * f * 0.12
      const x2 = cx + (s.x / s.z) * f * 0.12, y2 = cy + (s.y / s.z) * f * 0.12
      const a = clamp01(1 - s.z) * 0.9
      c.strokeStyle = s.tint ? `rgba(${CYAN_RGB},${a})` : `rgba(${PEARL_RGB},${a})`
      c.lineWidth = (1 - s.z) * 2.2 + 0.3
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke()
    }

    // portal: opens, spins, flares as each ship punches through
    const open = ease.outCubic(clamp01(t / 0.7))
    const R = Math.min(W, H) * (0.1 + 0.05 * open + (t > 2.3 ? ease.inCubic(clamp01((t - 2.3) / 0.5)) * 1.2 : 0))
    const pulse = 1 + 0.06 * Math.sin(t * 14)
    c.globalAlpha = open
    c.drawImage(cyanGlow, cx - R * 2 * pulse, cy - R * 2 * pulse, R * 4 * pulse, R * 4 * pulse)
    for (let i = 0; i < 3; i++) {
      c.strokeStyle = i === 1 ? `rgba(${PEARL_RGB},0.9)` : `rgba(${CYAN_RGB},0.8)`
      c.lineWidth = 2.5 - i * 0.6
      c.setLineDash([R * 0.5, R * 0.18 + i * 6])
      c.lineDashOffset = -t * (160 + i * 90) * (i % 2 ? -1 : 1)
      c.beginPath(); c.ellipse(cx, cy, R * (1 + i * 0.16) * pulse, R * (1 + i * 0.16) * pulse * 0.92, 0, 0, Math.PI * 2); c.stroke()
    }
    c.setLineDash([])
    c.globalAlpha = 1

    // ships
    for (const s of ships) {
      const p = (t - s.launch) / s.dur
      if (p < 0 || p > 1) continue
      const z = 1 - p * p * 0.96                      // far → at the camera
      const scale = (0.2 / z) * (Math.min(W, H) / 700)
      const dist = (s.off / z) * f * 0.35
      const x = cx + Math.cos(s.ang) * dist
      const y = cy + Math.sin(s.ang) * dist
      // engine trail back toward the portal
      c.strokeStyle = `rgba(${CYAN_RGB},0.55)`; c.lineWidth = Math.max(1, 10 * scale)
      c.beginPath(); c.moveTo(cx + Math.cos(s.ang) * dist * 0.55, cy + Math.sin(s.ang) * dist * 0.55); c.lineTo(x, y); c.stroke()
      const gz = 90 * scale
      c.drawImage(pearlGlow, x - gz, y - gz, gz * 2, gz * 2)
      c.save()
      c.globalCompositeOperation = 'source-over'
      c.translate(x, y); c.rotate(s.ang); c.scale(scale, scale)
      c.drawImage(shipSprite, -shipSprite.width / 2, -shipSprite.height / 2)
      c.restore()
      // flare the portal on exit
      if (p < 0.12) {
        const fl = (1 - p / 0.12) * R * 2.2
        c.drawImage(pearlGlow, cx - fl, cy - fl, fl * 2, fl * 2)
      }
    }

    // arrival flash
    const flashT = (t * 1000 - (INTRO_MS - 250)) / 250
    if (flashT > 0) {
      c.globalCompositeOperation = 'source-over'
      c.fillStyle = `rgba(240,244,255,${clamp01(flashT)})`
      c.fillRect(0, 0, W, H)
    }

    if (!landed && t * 1000 >= INTRO_MS) { landed = true; onLand(); return }
    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', fit) }
}
