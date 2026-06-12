// ============================================================================
//  NeonCity — neon Tokyo corridor you fly through on scroll.
//
//  Signs use a CANVAS TEXTURE (not a font file) so they ALWAYS render — no
//  troika font fetch, no CSP issue, no tofu. Plus living city: trees, moving
//  cars, a train, and drifting clouds. Performance auto-scales for mobile.
//
//  Requires:  npm i three @react-three/fiber @react-three/drei
// ============================================================================
import { useMemo, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/cyberScroll'

// Richer neon spectrum — cyan, hot-pink, violet, mint, orange, electric-green,
// magenta, sky-blue, gold, coral — for a much more colourful city (all bloom).
const PALETTE = ['#00e5ff', '#ff1e6b', '#7c3aed', '#19ffe0', '#ff8a00', '#39ff14', '#ff3df0', '#00b3ff', '#ffd400', '#ff5d5d']
const DEPTH = 8

const SIGN_WORDS = ['サイバー', '東京', 'ラーメン', '未来', '電脳', '寿司', '夜の街', '龍', 'バー', '居酒屋', 'CYBER', 'TOKYO']

// ── Clickable 3D holo-menu ──────────────────────────────────────────────────
// Holographic signs near the start of the corridor act as navigation. Each
// scrolls to a section (or opens the blog). Populated at runtime for the raycaster.
const BASE = import.meta.env.BASE_URL || '/'
// Pushed well back (z) and spread wide (x) + vertically (y) so they frame the
// HTML hero name instead of overlapping it. Bigger planes keep them readable.
const MENU = [
  { label: 'ABOUT',    target: '#about',     color: '#00e5ff', pos: [-8.5,  6.5, -30], rotY: 0.5 },
  { label: 'PROJECTS', target: '#projects',  color: '#ff1e6b', pos: [ 8.8,  2.0, -34], rotY: -0.5 },
  { label: 'EXPLORE',  target: '#exploring', color: '#19ffe0', pos: [-9.0, -1.5, -38], rotY: 0.5 },
  { label: 'BLOG',     external: true, href: `${BASE}blog.html`, color: '#ff8a00', pos: [ 8.5,  7.5, -42], rotY: -0.5 },
]
let MENU_MESHES = []   // [{ mesh, item }] — filled by <MenuPortals>, read by the camera raycaster

// ── Performance tiers ──────────────────────────────────────────────────────
// Decided once from viewport width; lighter geometry + fewer objects on phones.
function makeTier() {
  const w = typeof window !== 'undefined' ? window.innerWidth : 1280
  const low = w < 820
  return low
    ? { low: true,  rows: 40, signs: 12, cars: 5, trees: 10, clouds: 5, trains: 1 }
    : { low: false, rows: 64, signs: 26, cars: 10, trees: 20, clouds: 9, trains: 2 }
}

// ── Canvas-texture neon sign (renders ANY system glyph; needs no font file) ──
function makeSignTexture(text, color) {
  const fontSize = 120, pad = 36
  const c = document.createElement('canvas')
  let ctx = c.getContext('2d')
  const fam = 'bold ' + fontSize + 'px "Noto Sans JP","Hiragino Sans","Yu Gothic","Noto Sans Myanmar",system-ui,sans-serif'
  ctx.font = fam
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2
  const h = fontSize + pad * 2
  c.width = w; c.height = h
  ctx = c.getContext('2d')
  ctx.font = fam
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  // glow pass
  ctx.shadowColor = color; ctx.shadowBlur = 28
  ctx.fillStyle = color
  ctx.fillText(text, w / 2, h / 2)
  ctx.fillText(text, w / 2, h / 2)
  // bright white core
  ctx.shadowBlur = 6
  ctx.fillStyle = '#ffffff'
  ctx.fillText(text, w / 2, h / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return { tex, aspect: w / h }
}

function NeonSigns({ tier, track }) {
  // Build one texture per unique word (cached), reuse across many signs.
  const textures = useMemo(() => {
    const map = {}
    SIGN_WORDS.forEach((word, i) => { map[word] = makeSignTexture(word, PALETTE[i % PALETTE.length]) })
    return map
  }, [])

  const signs = useMemo(() => {
    const out = []
    for (let i = 0; i < tier.signs; i++) {
      const side = Math.random() < 0.5 ? -1 : 1
      const word = SIGN_WORDS[(Math.random() * SIGN_WORDS.length) | 0]
      out.push({
        word,
        position: [side * 4.55, THREE.MathUtils.randFloat(1.5, 11), -THREE.MathUtils.randFloat(6, track - 10)],
        rotY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
        height: THREE.MathUtils.randFloat(1.1, 2.0),
      })
    }
    return out
  }, [tier, track])

  useEffect(() => () => { Object.values(textures).forEach((t) => t.tex.dispose()) }, [textures])

  return (
    <group>
      {signs.map((s, i) => {
        const { tex, aspect } = textures[s.word]
        return (
          <mesh key={i} position={s.position} rotation={[0, s.rotY, 0]}>
            <planeGeometry args={[s.height * aspect, s.height]} />
            <meshBasicMaterial map={tex} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )
      })}
    </group>
  )
}

// ── Soft cloud texture (one, reused) ───────────────────────────────────────
function makeCloudTexture() {
  const s = 256
  const c = document.createElement('canvas'); c.width = c.height = s
  const ctx = c.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,0.9)')
  g.addColorStop(0.5, 'rgba(180,200,255,0.35)')
  g.addColorStop(1, 'rgba(180,200,255,0)')
  ctx.fillStyle = g; ctx.fillRect(0, 0, s, s)
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace
  return t
}

function Clouds({ tier, track }) {
  const tex = useMemo(makeCloudTexture, [])
  const data = useMemo(() => Array.from({ length: tier.clouds }).map(() => ({
    x: THREE.MathUtils.randFloatSpread(28),
    y: THREE.MathUtils.randFloat(14, 24),
    z: -THREE.MathUtils.randFloat(10, track),
    s: THREE.MathUtils.randFloat(8, 16),
    drift: THREE.MathUtils.randFloat(0.2, 0.6) * (Math.random() < 0.5 ? -1 : 1),
    tint: PALETTE[(Math.random() * PALETTE.length) | 0],
  })), [tier, track])
  const refs = useRef([])
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => { if (m) { m.position.x += data[i].drift * dt; if (m.position.x > 30) m.position.x = -30; if (m.position.x < -30) m.position.x = 30 } })
  })
  return (
    <group>
      {data.map((c, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[c.x, c.y, c.z]}>
          <planeGeometry args={[c.s, c.s * 0.6]} />
          <meshBasicMaterial map={tex} color={c.tint} transparent opacity={0.16} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// ── Low-poly neon trees along the kerb ─────────────────────────────────────
function Trees({ tier, track }) {
  const trees = useMemo(() => Array.from({ length: tier.trees }).map(() => ({
    x: (Math.random() < 0.5 ? -1 : 1) * THREE.MathUtils.randFloat(3.4, 4.2),
    z: -THREE.MathUtils.randFloat(4, track),
    h: THREE.MathUtils.randFloat(1.6, 2.8),
    c: Math.random() < 0.5 ? '#19ff6a' : '#19ffe0',
  })), [tier, track])
  const seg = tier.low ? 5 : 7
  return (
    <group>
      {trees.map((t, i) => (
        <group key={i} position={[t.x, -2, t.z]}>
          <mesh position={[0, t.h * 0.35, 0]}>
            <cylinderGeometry args={[0.08, 0.12, t.h * 0.7, 5]} />
            <meshBasicMaterial color="#3a2a4a" toneMapped={false} />
          </mesh>
          <mesh position={[0, t.h * 0.85, 0]}>
            <coneGeometry args={[t.h * 0.4, t.h * 0.9, seg]} />
            <meshBasicMaterial color={t.c} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Moving cars (glowing streaks) ──────────────────────────────────────────
function Cars({ tier, track }) {
  const cars = useMemo(() => Array.from({ length: tier.cars }).map(() => {
    const dir = Math.random() < 0.5 ? -1 : 1
    return {
      lane: dir * THREE.MathUtils.randFloat(1.6, 2.6),
      speed: THREE.MathUtils.randFloat(18, 34),
      offset: Math.random() * track,
      color: PALETTE[(Math.random() * PALETTE.length) | 0],
      dir,
    }
  }), [tier, track])
  const refs = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    cars.forEach((c, i) => {
      const m = refs.current[i]; if (!m) return
      const p = ((t * c.speed + c.offset) % track)
      m.position.z = c.dir < 0 ? -p : -(track - p)
    })
  })
  return (
    <group>
      {cars.map((c, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[c.lane, -1.55, 0]} scale={[0.4, 0.3, 2.4]}>
          <boxGeometry />
          <meshBasicMaterial color={c.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

// ── Elevated trains ────────────────────────────────────────────────────────
function Trains({ tier, track }) {
  const trains = useMemo(() => Array.from({ length: tier.trains }).map((_, i) => ({
    x: i % 2 === 0 ? -7.5 : 7.5,
    y: THREE.MathUtils.randFloat(5.5, 8),
    speed: THREE.MathUtils.randFloat(40, 55),
    offset: Math.random() * track,
    dir: i % 2 === 0 ? -1 : 1,
    color: i % 2 === 0 ? '#00e5ff' : '#ff1e6b',
  })), [tier, track])
  const refs = useRef([])
  useFrame((state) => {
    const t = state.clock.elapsedTime
    trains.forEach((tr, i) => {
      const m = refs.current[i]; if (!m) return
      const p = ((t * tr.speed + tr.offset) % track)
      m.position.z = tr.dir < 0 ? -p : -(track - p)
    })
  })
  return (
    <group>
      {trains.map((tr, i) => (
        <mesh key={i} ref={(el) => (refs.current[i] = el)} position={[tr.x, tr.y, 0]} scale={[0.6, 0.7, 9]}>
          <boxGeometry />
          <meshBasicMaterial color={tr.color} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Drone() {
  const root = useRef(), ringA = useRef(), ringB = useRef(), core = useRef()
  const { camera } = useThree()
  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (root.current) {
      root.current.position.x = THREE.MathUtils.damp(root.current.position.x, Math.sin(t * 0.5) * 3.2, 2, dt)
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, 2.4 + Math.cos(t * 0.7) * 1.1, 2, dt)
      root.current.position.z = THREE.MathUtils.damp(root.current.position.z, camera.position.z - 9, 2, dt)
    }
    if (ringA.current) { ringA.current.rotation.x += dt * 1.4; ringA.current.rotation.y += dt * 0.6 }
    if (ringB.current) { ringB.current.rotation.y += dt * 2.0; ringB.current.rotation.z += dt * 0.8 }
    if (core.current) core.current.scale.setScalar(1 + Math.sin(t * 4) * 0.12)
  })
  return (
    <group ref={root}>
      <mesh ref={core}><icosahedronGeometry args={[0.45, 1]} /><meshBasicMaterial color="#00e5ff" toneMapped={false} /></mesh>
      <mesh ref={ringA}><torusGeometry args={[0.95, 0.03, 10, 48]} /><meshBasicMaterial color="#ff1e6b" toneMapped={false} /></mesh>
      <mesh ref={ringB}><torusGeometry args={[1.25, 0.025, 10, 48]} /><meshBasicMaterial color="#7c3aed" toneMapped={false} /></mesh>
      <pointLight color="#00e5ff" intensity={6} distance={18} />
    </group>
  )
}

/* Clickable holographic menu signs (canvas textures, no font file). */
function MenuPortals() {
  const items = useMemo(() => MENU.map((m) => ({ ...m, ...makeSignTexture(m.label, m.color) })), [])
  const refs = useRef([])
  useEffect(() => {
    MENU_MESHES = refs.current.filter(Boolean).map((mesh, i) => ({ mesh, item: items[i] }))
    return () => { MENU_MESHES = [] }
  }, [items])
  return (
    <group>
      {items.map((it, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) { el.userData.base = 1; refs.current[i] = el } }}
          position={it.pos}
          rotation={[0, it.rotY, 0]}
        >
          <planeGeometry args={[3.4 * it.aspect, 3.4]} />
          <meshBasicMaterial map={it.tex} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

/* Interactive camera: forward scroll + mouse/gyro "look around" + a manual
   raycaster that hovers/clicks the holo-menu WITHOUT stealing real DOM clicks. */
function InteractiveCamera({ track }) {
  const { camera, size } = useThree()
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const aim = useRef({ x: 0, y: 0 })     // raw target from mouse / gyro (-1..1)
  const look = useRef({ x: 0, y: 0 })    // smoothed
  const hovered = useRef(null)

  // Portrait fit: widen FOV when taller than wide (phones).
  useEffect(() => {
    camera.fov = size.height > size.width ? 95 : 72
    camera.updateProjectionMatrix()
  }, [size.width, size.height, camera])

  useEffect(() => {
    const setHover = (mesh) => {
      if (hovered.current === mesh) return
      hovered.current = mesh
      const ring = document.querySelector('.cyber-cursor')
      if (mesh) ring?.classList.add('is-active'); else ring?.classList.remove('is-active')
    }
    const raycast = (cx, cy) => {
      if (!MENU_MESHES.length) return null
      ndc.set((cx / window.innerWidth) * 2 - 1, -((cy / window.innerHeight) * 2 - 1))
      ray.setFromCamera(ndc, camera)
      return ray.intersectObjects(MENU_MESHES.map((m) => m.mesh), false)[0] || null
    }

    // DESKTOP: mouse drives look + hover
    const onMouse = (e) => {
      aim.current.x = (e.clientX / window.innerWidth) * 2 - 1
      aim.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
      setHover(raycast(e.clientX, e.clientY)?.object || null)
    }
    // MOBILE: gyroscope drives look (gamma=left/right, beta=front/back)
    const onOrient = (e) => {
      if (e.gamma == null) return
      aim.current.x = THREE.MathUtils.clamp(e.gamma / 35, -1, 1)
      aim.current.y = THREE.MathUtils.clamp((e.beta - 45) / 35, -1, 1)
    }
    // CLICK / TAP: navigate if a sign is hit — but never hijack real controls
    const onClick = (e) => {
      const el = document.elementFromPoint(e.clientX, e.clientY)
      if (el && el.closest('a,button,input,textarea,select,[role="button"]')) return
      const hit = raycast(e.clientX, e.clientY)
      if (!hit) return
      const item = MENU_MESHES.find((m) => m.mesh === hit.object)?.item
      if (!item) return
      if (item.external) { window.location.href = item.href; return }
      document.querySelector(item.target)?.scrollIntoView({ behavior: 'smooth' })
    }

    window.addEventListener('pointermove', onMouse)
    window.addEventListener('click', onClick)

    // iOS needs a user gesture to grant gyro; Android can listen directly.
    const iOS = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'
    if (iOS) {
      const req = () => DeviceOrientationEvent.requestPermission()
        .then((s) => { if (s === 'granted') window.addEventListener('deviceorientation', onOrient) })
        .catch(() => {})
      window.addEventListener('touchend', req, { once: true })
    } else {
      window.addEventListener('deviceorientation', onOrient)
    }

    return () => {
      window.removeEventListener('pointermove', onMouse)
      window.removeEventListener('click', onClick)
      window.removeEventListener('deviceorientation', onOrient)
    }
  }, [camera, ray, ndc])

  useFrame((_, dt) => {
    look.current.x = THREE.MathUtils.damp(look.current.x, aim.current.x, 3, dt)
    look.current.y = THREE.MathUtils.damp(look.current.y, aim.current.y, 3, dt)

    const targetZ = 6 - scrollState.progress * (track - 24)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, dt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, look.current.x * 2.2, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.2 + look.current.y * 1.2, 2.5, dt)
    // pan/tilt the view toward the pointer/tilt for the "look-around" feel
    camera.lookAt(look.current.x * 6, 1 + look.current.y * 4, camera.position.z - 10)

    // hover feedback: scale up + over-brighten the hovered sign
    for (const { mesh } of MENU_MESHES) {
      if (!mesh) continue
      const on = hovered.current === mesh
      const s = THREE.MathUtils.damp(mesh.scale.x, on ? 1.25 : 1, 8, dt)
      mesh.scale.setScalar(s)
      if (mesh.material) {
        const c = THREE.MathUtils.damp(mesh.material.color.r, on ? 1.9 : 1, 8, dt)
        mesh.material.color.setScalar(c)
      }
    }
  })
  return null
}

export default function NeonCity() {
  const tier = useMemo(makeTier, [])
  const track = tier.rows * DEPTH

  const buildings = useMemo(() => {
    const out = []
    for (let i = 0; i < tier.rows; i++) {
      for (const side of [-1, 1]) {
        const h = THREE.MathUtils.randFloat(3, 18)
        out.push({
          position: [side * THREE.MathUtils.randFloat(5, 9.5), h / 2 - 2, -i * DEPTH - THREE.MathUtils.randFloat(0, DEPTH)],
          scale: [THREE.MathUtils.randFloat(1.3, 3), h, THREE.MathUtils.randFloat(1.3, 3)],
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
        })
      }
    }
    return out
  }, [tier])

  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 12, 0]} intensity={50} distance={70} color="#7c3aed" />

      <Instances limit={buildings.length} range={buildings.length}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
        {buildings.map((b, i) => (
          <Instance key={i} position={b.position} scale={b.scale} color={b.color} />
        ))}
      </Instances>

      <NeonSigns tier={tier} track={track} />
      <MenuPortals />
      <Trees tier={tier} track={track} />
      <Cars tier={tier} track={track} />
      <Trains tier={tier} track={track} />
      <Clouds tier={tier} track={track} />
      <Drone />

      <gridHelper args={[60, 60, '#ff1e6b', '#10203a']} position={[0, -2, -track / 2]} scale={[1, 1, track / 60]} />
      <gridHelper args={[60, 60, '#00e5ff', '#10203a']} position={[0, 16, -track / 2]} scale={[1, 1, track / 60]} />

      <InteractiveCamera track={track} />
    </group>
  )
}
