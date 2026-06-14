// ============================================================================
//  NeonCity — cinematic skyline from THREE Draco+WebP models:
//    • london-opt.glb   → sprawling FOREGROUND city
//    • pagoda-opt.glb   → gold pagoda, LEFT background tower
//    • osaka_castle.glb → castle, RIGHT background tower
//
//  WHY THE SCALES DIFFER SO MUCH (measured world-space maxDim of each file):
//    london ≈ 36  ·  pagoda ≈ 7.6 (tiny)  ·  osaka ≈ 2856 (huge, ~80× london)
//  A single "1–5" scale can't fit all three — osaka at scale 1 would be 2,856
//  units wide and bury the camera. So each model gets its OWN measured scale.
//
//  Y-SEATING: every model uses <Center> (bbox-centre → group origin), and each
//  POS.y below is pre-computed so the model's BASE rests on the shared GROUND
//  line (≈ -16). That's why nothing floats or sinks. Tune from there.
//
//  PERF: ambient + 1 directional only, no shadows, matrixAutoUpdate off on the
//  static meshes, models under <Suspense>, all geometry Draco-compressed.
//
//  Requires:  npm i three @react-three/fiber @react-three/drei
// ============================================================================
import { useMemo, useRef, useEffect, Suspense, Component } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF, Center } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/cyberScroll'

const BASE = import.meta.env.BASE_URL || '/'
const TRACK = 200
const isLow = typeof window !== 'undefined' && window.innerWidth < 820

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  CENTRALIZED TUNING BLOCK — edit everything here, no code-hunting needed.  ║
// ║  POS = [x (left/right), y (up/down), z (depth, more negative = further)].  ║
// ╚══════════════════════════════════════════════════════════════════════════╝
const GROUND = -10   // shared ground line; each POS.y below seats the base here

// ── LONDON CITY — native maxDim ≈ 36, already centred → small multiplier ──────
const LONDON_URL = BASE + 'london-opt.glb'
const LONDON_SCALE = isLow ? 0.9 : 5.8
const LONDON_POS = [0, 11, -290]        // FOREGROUND, centred
const LONDON_ROT = [0, 0, 0]          // sideways? → [-Math.PI/2, 0, 0]

// ── PAGODA — native maxDim ≈ 7.6 (tiny) → needs a BIG multiplier ──────────────
const PAGODA_URL = BASE + 'pagoda-opt.glb'
const PAGODA_SCALE = isLow ? 2.5 : 4
const PAGODA_POS = [-40, 7, -90]     // LEFT background, towering
const PAGODA_ROT = [0, 0, 0]

// ── OSAKA CASTLE — native maxDim ≈ 2856 (HUGE) → needs a TINY multiplier ──────
const OSAKA_URL = BASE + 'osaka_castle.glb'
const OSAKA_SCALE = isLow ? 0.017 : 0.012
const OSAKA_POS = [50, 3, -70]      // RIGHT background, towering
const OSAKA_ROT = [0, 0, 0]

/* Error boundary so one model/decoder failure can't blank the rest of the scene. */
class Safe extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() { }
  render() { return this.state.failed ? null : this.props.children }
}

// ── Per-model material "tints" (defined at module scope = stable identity) ────
// Deep OLD-GOLD for the pagoda. metalness 0.5 so it reads as gold without an env
// map; emissive + toneMapped:false makes it bloom.
function goldTint(m) {
  m.color = new THREE.Color('#DAA520')
  m.emissive = new THREE.Color('#B8860B')
  m.emissiveIntensity = 0.5
  m.metalness = 0.5
  m.roughness = 0.4
  m.toneMapped = false
}
// Subtle CYBERPUNK neon rim for the castle — keeps its own base colour/texture,
// just adds a cool electric-blue glow so it matches the theme.
function neonTint(m) {
  m.emissive = new THREE.Color('#1e90ff')
  m.emissiveIntensity = 0.28
  m.metalness = 0.55
  m.roughness = 0.45
  m.toneMapped = false
}

// ════════════════════════════════════════════════════════════════════════════
//  ONE reusable model loader for all three. <Center> guarantees the bbox-centre
//  lands exactly on `position`, so placement is predictable. Shadows off,
//  matrices frozen (static), optional material `tint`.
// ════════════════════════════════════════════════════════════════════════════
function Model({ url, scale, position, rotation = [0, 0, 0], tint }) {
  const { scene } = useGLTF(url, true)   // true = decode Draco-compressed geometry
  const model = useMemo(() => scene.clone(true), [scene])

  useEffect(() => {
    model.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = false
      o.receiveShadow = false
      o.frustumCulled = true
      if (o.material && tint) { o.material = o.material.clone(); tint(o.material) }
      o.matrixAutoUpdate = false        // static geometry → skip per-frame matrix math
    })
  }, [model, tint])

  return (
    <group position={position} rotation={rotation}>
      <Center>
        <primitive object={model} scale={scale} />
      </Center>
    </group>
  )
}

// ── Canvas-texture neon sign (built once, no font file needed) ──────────────
function makeSignTexture(text, color) {
  const fontSize = 120, pad = 36
  const c = document.createElement('canvas')
  let ctx = c.getContext('2d')
  const fam = 'bold ' + fontSize + 'px "Noto Sans JP","Hiragino Sans","Noto Sans Myanmar",system-ui,sans-serif'
  ctx.font = fam
  const w = Math.ceil(ctx.measureText(text).width) + pad * 2
  const h = fontSize + pad * 2
  c.width = w; c.height = h
  ctx = c.getContext('2d')
  ctx.font = fam
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.shadowColor = color; ctx.shadowBlur = 28
  ctx.fillStyle = color
  ctx.fillText(text, w / 2, h / 2); ctx.fillText(text, w / 2, h / 2)
  ctx.shadowBlur = 6; ctx.fillStyle = '#ffffff'
  ctx.fillText(text, w / 2, h / 2)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4
  return { tex, aspect: w / h }
}

// ── Grand archway + "SHWEDAGON PAGODA" signboard (lightweight basic materials) ──
function Archway({ x = 0, z, scale = 1 }) {
  const sign = useMemo(() => makeSignTexture('SHWEDAGON PAGODA', '#00e5ff'), [])
  useEffect(() => () => sign.tex.dispose(), [sign])
  return (
    <group position={[x, GROUND, z]} scale={scale}>
      <mesh position={[-11, 8, 0]}><boxGeometry args={[1.6, 20, 1.6]} /><meshBasicMaterial color="#ff1e6b" toneMapped={false} /></mesh>
      <mesh position={[11, 8, 0]}><boxGeometry args={[1.6, 20, 1.6]} /><meshBasicMaterial color="#ff1e6b" toneMapped={false} /></mesh>
      <mesh position={[0, 18.4, 0]}><boxGeometry args={[24, 1.8, 1.8]} /><meshBasicMaterial color="#7c3aed" toneMapped={false} /></mesh>
      <mesh position={[0, 22, 0]}>
        <planeGeometry args={[4 * sign.aspect, 4]} />
        <meshBasicMaterial map={sign.tex} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  )
}

// ════════════════════════════════════════════════════════════════════════════
//  Holographic clickable menu (unchanged)
// ════════════════════════════════════════════════════════════════════════════
const MENU = [
  { label: 'ABOUT', target: '#about', color: '#00e5ff', pos: [-8.5, 6.5, -30], rotY: 0.5 },
  { label: 'PROJECTS', target: '#projects', color: '#ff1e6b', pos: [8.8, 2.0, -34], rotY: -0.5 },
  { label: 'EXPLORE', target: '#exploring', color: '#19ffe0', pos: [-9.0, -1.5, -38], rotY: 0.5 },
  { label: 'BLOG', external: true, href: `${BASE}blog.html`, color: '#ff8a00', pos: [8.5, 7.5, -42], rotY: -0.5 },
]
let MENU_MESHES = []

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
        <mesh key={i} ref={(el) => { if (el) { el.userData.base = 1; refs.current[i] = el } }} position={it.pos} rotation={[0, it.rotY, 0]}>
          <planeGeometry args={[3.4 * it.aspect, 3.4]} />
          <meshBasicMaterial map={it.tex} transparent toneMapped={false} side={THREE.DoubleSide} depthWrite={false} />
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

// ════════════════════════════════════════════════════════════════════════════
//  Interactive camera — scroll approach + mouse/gyro look + responsive framing.
//  No allocations inside useFrame (temporaries created once via useMemo).
// ════════════════════════════════════════════════════════════════════════════
function InteractiveCamera({ track }) {
  const { camera, size } = useThree()
  const ray = useMemo(() => new THREE.Raycaster(), [])
  const ndc = useMemo(() => new THREE.Vector2(), [])
  const aim = useRef({ x: 0, y: 0 })
  const look = useRef({ x: 0, y: 0 })
  const hovered = useRef(null)

  const portrait = size.height > size.width
  useEffect(() => {
    camera.fov = portrait ? 100 : 72
    camera.updateProjectionMatrix()
  }, [portrait, camera])

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
    const onMouse = (e) => {
      aim.current.x = (e.clientX / window.innerWidth) * 2 - 1
      aim.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
      setHover(raycast(e.clientX, e.clientY)?.object || null)
    }
    const onOrient = (e) => {
      if (e.gamma == null) return
      aim.current.x = THREE.MathUtils.clamp(e.gamma / 35, -1, 1)
      aim.current.y = THREE.MathUtils.clamp((e.beta - 45) / 35, -1, 1)
    }
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
    const iOS = typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function'
    if (iOS) {
      const req = () => DeviceOrientationEvent.requestPermission().then((s) => { if (s === 'granted') window.addEventListener('deviceorientation', onOrient) }).catch(() => { })
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
    const startZ = portrait ? 12 : 6
    const targetZ = startZ - scrollState.progress * (track - 24)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, dt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, look.current.x * 2.2, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 2 + look.current.y * 0.3, 2.5, dt)
    camera.lookAt(look.current.x * 6, 2 + scrollState.progress * 0 + look.current.y * 0.8, camera.position.z - 10)

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

// ════════════════════════════════════════════════════════════════════════════
//  SCENE — minimal, high-performance lighting (1 ambient + 1 directional).
// ════════════════════════════════════════════════════════════════════════════
export default function NeonCity() {
  return (
    <group>
      {/* Simple, cheap lighting: fill + key. No shadows, no env map. */}
      <ambientLight intensity={0.85} />
      <directionalLight position={[40, 80, 30]} intensity={1.5} color="#fff1e6" castShadow={false} />

      {/* Glowing neon grid (NO solid floor) on the shared ground line. */}
      <gridHelper args={[1800, 180, '#00e5ff', '#0e2444']} position={[0, GROUND, -90]} />

      {/* ════════ LONDON CITY — sprawling foreground ════════ */}
      <Safe>
        <Suspense fallback={null}>
          <Model url={LONDON_URL} scale={LONDON_SCALE} position={LONDON_POS} rotation={LONDON_ROT} />
        </Suspense>
      </Safe>

      {/* ════════ PAGODA — left-background tower (gold) + gateway archway ════════ */}
      {!isLow && (
        <Safe>
          <Suspense fallback={null}>
            <group>
              <Model url={PAGODA_URL} scale={PAGODA_SCALE} position={PAGODA_POS} rotation={PAGODA_ROT} tint={goldTint} />
              <Archway x={PAGODA_POS[0]} z={PAGODA_POS[2] + 40} scale={1.3} />
            </group>
          </Suspense>
        </Safe>
      )}

      {/* ════════ OSAKA CASTLE — right-background tower (cyber-neon tint) ════════ */}
      {!isLow && (
        <Safe>
          <Suspense fallback={null}>
            <Model url={OSAKA_URL} scale={OSAKA_SCALE} position={OSAKA_POS} rotation={OSAKA_ROT} tint={neonTint} />
          </Suspense>
        </Safe>
      )}

      <MenuPortals />
      <Drone />
      <InteractiveCamera track={TRACK} />
    </group>
  )
}

// Warm the cache so the GLBs start downloading/decoding before first paint.
useGLTF.preload(LONDON_URL, true)
if (!isLow) {
  useGLTF.preload(PAGODA_URL, true)
  useGLTF.preload(OSAKA_URL, true)
}
