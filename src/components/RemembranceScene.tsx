import { Suspense, useEffect, useMemo, useRef, Component, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import {
  useGLTF, Sky, Sparkles, CameraControls, ContactShadows, Html,
  PerformanceMonitor, AdaptiveDpr, BakeShadows,
} from '@react-three/drei'

// Vite serves /public at BASE_URL (base = "/Myweb/"), so every model URL MUST be
// prefixed — otherwise the .glb files 404 in production (and the scene stays blank).
const BASE = import.meta.env.BASE_URL || '/'
const u = (f: string): string => `${BASE}${f}`

const GARDEN = u('garden.glb')
const AIRBUS = u('airbus.glb')
const GRAVE = u('grave.glb')

;[GARDEN, AIRBUS, GRAVE].forEach((url) => useGLTF.preload(url))

const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')

// ── Target real-world sizes (largest dimension, in scene units) ──────────────
// garden.glb is NOT a ground plane — it is a memorial stone / urn monument, so it
// is sized human-scale, and a real floor is added below for shadows.
const GARDEN_STONE_SIZE = 2.5   // garden.glb = a memorial stone, human height
const AIRBUS_SIZE = 35          // a full-sized, majestic aircraft in the distance
const GRAVE_SIZE = 1.8          // a human-readable headstone

// Eleven lanterns scattered organically around the memorials, forming a gentle
// path toward the grounded Airbus in the background.
const LANTERN_POSITIONS: [number, number, number][] = [
  [-3, 0, 4], [3, 0, 4], [0, 0, 1], [-5, 0, -5], [4, 0, -8], [0, 0, -12],
  [6, 0, -2], [-7, 0, 2], [2, 0, -3], [-2, 0, -8], [8, 0, -10],
]

// Camera framing presets: [posX, posY, posZ, targetX, targetY, targetZ].
const OVERVIEW: [number, number, number, number, number, number] = [0, 2, 8, 0, 0.9, 3]   // eye-level, on the memorial
const AIRBUS_GAZE: [number, number, number, number, number, number] = [0, 4, -6, 0, 4, -25]

/** Loads a GLTF, enables shadows, and normalises it to `targetSize`. */
function useNormalizedModel(url: string, targetSize: number, groundAlign = true) {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const object = scene.clone(true)
    object.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true }
    })
    object.updateWorldMatrix(true, true)

    const box = new THREE.Box3().setFromObject(object)
    const size = new THREE.Vector3(); box.getSize(size)
    const center = new THREE.Vector3(); box.getCenter(center)
    const maxDim = Math.max(size.x, size.y, size.z) || 1
    const scale = targetSize / maxDim

    const offset: [number, number, number] = groundAlign
      ? [-center.x * scale, -box.min.y * scale, -center.z * scale]  // feet on the ground
      : [-center.x * scale, -center.y * scale, -center.z * scale]   // centred (airborne)

    return { object, scale, offset }
  }, [scene, targetSize, groundAlign])
}

interface Clickable { onSelect: () => void }

const overCursor = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
const outCursor = () => { document.body.style.cursor = 'auto' }

// ── garden.glb → a Memorial Stone (foreground, human height) ──
function GardenModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(GARDEN, GARDEN_STONE_SIZE, true)
  return (
    <group position={[2, 0, 3]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor} onPointerOut={outCursor} />
    </group>
  )
}

// ── The Airbus — full-sized, resting peacefully on the ground in the background ──
function AirbusModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(AIRBUS, AIRBUS_SIZE, true)
  return (
    <group position={[0, 0, -25]} rotation={[0, Math.PI * 0.12, 0]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor} onPointerOut={outCursor} />
    </group>
  )
}

// ── The grave — foreground, beside the memorial stone ──
function GraveModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(GRAVE, GRAVE_SIZE, true)
  return (
    <group position={[-2, 0, 3]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor} onPointerOut={outCursor} />
    </group>
  )
}

/**
 * A realistic trembling candle/fire light: a smooth sine wobble plus a random
 * jitter each frame, with a per-instance phase so no two lanterns flicker in sync.
 */
function FlickeringLight() {
  const lightRef = useRef<THREE.PointLight>(null)
  const phase = useMemo(() => Math.random() * 100, [])
  useFrame(({ clock }) => {
    const l = lightRef.current
    if (!l) return
    const t = clock.elapsedTime
    const flicker = 1.8 + Math.sin(t * 10 + phase) * 0.35 + (Math.random() - 0.5) * 0.9
    l.intensity = Math.max(0.5, flicker)
  })
  return <pointLight ref={lightRef} position={[0, 0.55, 0]} color="#ffaa00" distance={8} intensity={2} />
}

// ── A lantern: a flickering flame + a small visual body so it reads as a lantern ──
function Lantern({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <FlickeringLight />
      {/* lantern body */}
      <mesh position={[0, 0.28, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.34, 8]} />
        <meshStandardMaterial color="#3a2a17" emissive="#ffaa00" emissiveIntensity={0.5} />
      </mesh>
      {/* glowing flame (unlit by tone mapping so it stays bright) */}
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.06, 12, 12]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffcc55" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Keeps a single failed model (404 / bad file) from blanking the whole route. */
class ModelBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err: unknown) { console.error('[Remembrance] model failed to load:', err) }
  render() {
    if (this.state.failed) {
      return <Html center><div className="rounded-lg bg-black/60 px-3 py-2 text-xs text-white/80">A model could not load.</div></Html>
    }
    return this.props.children
  }
}

function LoadingLabel() {
  return (
    <Html center>
      <div className="rounded-full border border-white/15 bg-black/50 px-4 py-2 text-sm text-white/85 backdrop-blur-md">
        Loading…
      </div>
    </Html>
  )
}

/**
 * RemembranceScene — the serene sunset memorial (everything inside <Canvas>).
 * Clicking the Airbus, grave, or memorial stone calls onMemorialClick; when
 * `focused` the camera glides to gaze at the Airbus, else the overview.
 * Wrapped in PerformanceMonitor + AdaptiveDpr so lower-end phones stay smooth.
 */
export default function RemembranceScene({
  onMemorialClick,
  focused,
}: {
  onMemorialClick: () => void
  focused: boolean
}) {
  const controls = useRef<CameraControls>(null)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const [px, py, pz, tx, ty, tz] = focused ? AIRBUS_GAZE : OVERVIEW
    c.setLookAt(px, py, pz, tx, ty, tz, true)
  }, [focused])

  useFrame((_, delta) => {
    const c = controls.current
    if (c && !focused && !c.active) c.rotate(0.045 * delta, 0, false)
  })

  return (
    <PerformanceMonitor>
      {/* Deeper twilight sky — sun lower + softer scattering, so the flames and
          portrait read against a dimmer backdrop. */}
      <Sky sunPosition={[0, -0.18, -1]} turbidity={10} rayleigh={1.3} mieCoefficient={0.02} mieDirectionalG={0.9} />
      <fog attach="fog" args={['#b56a4a', 26, 90]} />

      {/* ── Lighting — dimmed warm dusk (lets the lantern flames glow) ── */}
      <ambientLight intensity={0.25} color="#ffb77a" />
      <hemisphereLight args={['#e8b483', '#2e2018', 0.22]} />
      <directionalLight
        position={[8, 9, -6]}
        intensity={0.55}
        color="#ff9e5e"
        castShadow
        shadow-mapSize={IS_MOBILE ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40, 0.1, 120]} />
      </directionalLight>

      {/* Floating embers (fewer on mobile) */}
      <Sparkles count={IS_MOBILE ? 80 : 150} scale={28} size={3} speed={0.2} opacity={0.6} color="#ffb77a" position={[0, 4, -10]} />

      {/* Dark ground so shadows have a place to land */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
      </mesh>

      {/* The composition — own Suspense + error boundary so a slow/bad .glb never blanks the page */}
      <ModelBoundary>
        <Suspense fallback={<LoadingLabel />}>
          <AirbusModel onSelect={onMemorialClick} />
          <GraveModel onSelect={onMemorialClick} />
          <GardenModel onSelect={onMemorialClick} />
          {LANTERN_POSITIONS.map((p, i) => <Lantern key={i} position={p} />)}
          <ContactShadows position={[0, 0.02, 3]} opacity={0.55} scale={12} blur={2.6} far={5} color="#000000" />
        </Suspense>
      </ModelBoundary>

      {/* ── Smooth, restricted camera ── */}
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={2}
        maxDistance={40}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />

      {/* ── Performance: shadows are static (only light *intensity* flickers) so bake
          them once; drop resolution automatically if the framerate falls. ── */}
      <BakeShadows />
      <AdaptiveDpr pixelated />
    </PerformanceMonitor>
  )
}
