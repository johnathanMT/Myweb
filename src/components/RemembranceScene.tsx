import { Suspense, useEffect, useMemo, useRef, Component, type ReactNode } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import { useGLTF, Sky, Sparkles, CameraControls, ContactShadows, Html } from '@react-three/drei'

// Vite serves /public at BASE_URL (base = "/Myweb/"), so every model URL MUST be
// prefixed — otherwise the .glb files 404 in production (and the scene stays blank).
const BASE = import.meta.env.BASE_URL || '/'
const u = (f: string): string => `${BASE}${f}`

const GARDEN = u('garden.glb')
const AIRBUS = u('airbus.glb')
const GRAVE = u('grave.glb')

;[GARDEN, AIRBUS, GRAVE].forEach((url) => useGLTF.preload(url))

// ── Target real-world sizes (largest dimension, in scene units) ──────────────
// Because every .glb is authored in different units, we normalise each model to a
// target size from its own bounding box. This fixes the "giant ground / tiny
// airbus" problem deterministically — tune these numbers, not raw scale factors.
const GARDEN_SIZE = 60   // a broad ground the composition sits on
const AIRBUS_SIZE = 34   // a full-sized, majestic aircraft
const GRAVE_SIZE = 1.8   // a human-readable memorial stone

// Camera framing presets: [posX, posY, posZ, targetX, targetY, targetZ].
const OVERVIEW: [number, number, number, number, number, number] = [0, 2, 8, 0, 0.8, 2]   // eye-level, on the grave
const AIRBUS_GAZE: [number, number, number, number, number, number] = [3, 6, -6, 0, 5, -20]

/**
 * Loads a GLTF, enables shadows, and normalises it to `targetSize` (its largest
 * dimension). Returns the clone plus the scale + offset that centres it on X/Z and
 * (when groundAlign) drops its base onto y=0 — so the outer <group position> is the
 * spot where the model's feet land.
 */
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

// ── The garden — the ground the memorial rests on ──
function GardenModel() {
  const { object, scale, offset } = useNormalizedModel(GARDEN, GARDEN_SIZE, true)
  return (
    <group position={[0, -0.5, 0]}>
      <primitive object={object} scale={scale} position={offset} />
    </group>
  )
}

// ── The Airbus — full-sized, framing the background ──
function AirbusModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(AIRBUS, AIRBUS_SIZE, false)
  return (
    <group position={[0, 5, -20]} rotation={[0, Math.PI * 0.12, 0]}>
      <primitive
        object={object}
        scale={scale}
        position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor}
        onPointerOut={outCursor}
      />
    </group>
  )
}

// ── The memorial stone — intimate, in the immediate foreground ──
function GraveModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(GRAVE, GRAVE_SIZE, true)
  return (
    <group position={[0, 0, 2]}>
      <primitive
        object={object}
        scale={scale}
        position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor}
        onPointerOut={outCursor}
      />
    </group>
  )
}

// ── A small lantern beside the stone, glowing warmly against the sunset ──
function Lantern() {
  return (
    <group position={[0.8, 0, 2.6]}>
      <pointLight position={[0, 0.7, 0]} color="#ffaa00" intensity={2} distance={6} />
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.18, 0.34, 0.18]} />
        <meshStandardMaterial color="#3a2a17" emissive="#ffaa00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
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
 * Clicking the Airbus or the stone calls onMemorialClick; when `focused` is true
 * the camera glides to gaze at the Airbus and returns to the overview otherwise.
 */
export default function RemembranceScene({
  onMemorialClick,
  focused,
}: {
  onMemorialClick: () => void
  focused: boolean
}) {
  const controls = useRef<CameraControls>(null)

  // Start at human eye-level looking at the grave, then glide on open/close.
  useEffect(() => {
    const c = controls.current
    if (!c) return
    const [px, py, pz, tx, ty, tz] = focused ? AIRBUS_GAZE : OVERVIEW
    c.setLookAt(px, py, pz, tx, ty, tz, true)
  }, [focused])

  // Gentle idle drift when not focused and not mid-transition — the peaceful rotate.
  useFrame((_, delta) => {
    const c = controls.current
    if (c && !focused && !c.active) c.rotate(0.045 * delta, 0, false)
  })

  return (
    <>
      {/* Sunset / twilight sky (sun dipping below the horizon → warm orange/pink/purple) */}
      <Sky sunPosition={[0, -0.1, -1]} turbidity={9} rayleigh={2.2} mieCoefficient={0.02} mieDirectionalG={0.92} />
      {/* haze pushed out so the distant Airbus stays visible */}
      <fog attach="fog" args={['#e0966b', 30, 95]} />

      {/* ── Lighting — warm sunset ── */}
      <ambientLight intensity={0.4} color="#ffb77a" />
      <hemisphereLight args={['#ffd9a0', '#5a4030', 0.35]} />
      <directionalLight
        position={[8, 9, -6]}
        intensity={0.85}
        color="#ff9e5e"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40, 0.1, 120]} />
      </directionalLight>

      {/* Floating fireflies / embers, spanning the grave → Airbus depth */}
      <Sparkles count={150} scale={26} size={3} speed={0.2} opacity={0.6} color="#ffb77a" position={[0, 5, -8]} />

      {/* ── The composition — its own Suspense so sky + lights render immediately
          and a "Loading…" label shows while the .glb files stream in; the error
          boundary keeps a bad file from blanking the page. ── */}
      <ModelBoundary>
        <Suspense fallback={<LoadingLabel />}>
          <GardenModel />
          <AirbusModel onSelect={onMemorialClick} />
          <GraveModel onSelect={onMemorialClick} />
          <Lantern />
          <ContactShadows position={[0, 0.02, 2]} opacity={0.5} scale={10} blur={2.6} far={5} color="#2a1a10" />
        </Suspense>
      </ModelBoundary>

      {/* ── Smooth, restricted camera (starts at eye-level on the grave) ── */}
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={2}
        maxDistance={40}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  )
}
