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

// Warm the cache before first paint so the scene resolves in one pass.
;[GARDEN, AIRBUS, GRAVE].forEach((url) => useGLTF.preload(url))

// Framing presets for the camera (position xyz → look-at target xyz).
const OVERVIEW: [number, number, number, number, number, number] = [9, 4, 12, 0, 0.5, 2]
const AIRBUS_GAZE: [number, number, number, number, number, number] = [2.6, 4.6, -1.5, 0, 3, -10]

/** Loads a GLTF and returns a clone with shadows enabled on every mesh
 *  (cloning keeps each placement independent + memo-stable). */
function useShadowedScene(url: string): THREE.Object3D {
  const { scene } = useGLTF(url)
  return useMemo(() => {
    const clone = scene.clone(true)
    clone.traverse((o) => {
      const mesh = o as THREE.Mesh
      if (mesh.isMesh) { mesh.castShadow = true; mesh.receiveShadow = true }
    })
    return clone
  }, [scene])
}

interface Clickable { onSelect: () => void }

// ── The garden — the base the whole memorial rests on ──
function GardenModel() {
  const scene = useShadowedScene(GARDEN)
  return <primitive object={scene} position={[0, -0.5, 0]} />
}

// ── The Airbus — resting majestically in the background ──
function AirbusModel({ onSelect }: Clickable) {
  const scene = useShadowedScene(AIRBUS)
  return (
    <primitive
      object={scene}
      position={[0, 3, -10]}
      rotation={[0, Math.PI * 0.12, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    />
  )
}

// ── The memorial stone — intimate, in the foreground ──
function GraveModel({ onSelect }: Clickable) {
  const scene = useShadowedScene(GRAVE)
  return (
    <primitive
      object={scene}
      position={[0, 0, 4]}
      onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    />
  )
}

// ── A small lantern beside the stone, glowing warmly against the sunset ──
function Lantern() {
  return (
    <group position={[1, 0, 4]}>
      <pointLight position={[0, 1, 0]} color="#ffaa00" intensity={2} distance={6} />
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.24, 0.42, 0.24]} />
        <meshStandardMaterial color="#3a2a17" emissive="#ffaa00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
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
 * RemembranceScene — the serene sunset memorial scene graph (everything inside
 * <Canvas>). Clicking the Airbus or the stone calls onMemorialClick; when
 * `focused` is true the camera smoothly glides to gaze at the Airbus, and
 * returns to the overview when it goes false.
 */
export default function RemembranceScene({
  onMemorialClick,
  focused,
}: {
  onMemorialClick: () => void
  focused: boolean
}) {
  const controls = useRef<CameraControls>(null)

  // Smooth camera glide on open/close (the `true` flag = animated transition).
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
      <fog attach="fog" args={['#e0966b', 20, 60]} />

      {/* ── Lighting — warm sunset ── */}
      <ambientLight intensity={0.4} color="#ffb77a" />
      <hemisphereLight args={['#ffd9a0', '#5a4030', 0.35]} />
      <directionalLight
        position={[5, 5, -10]}
        intensity={0.8}
        color="#ff9e5e"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-24, 24, 24, -24, 0.1, 70]} />
      </directionalLight>

      {/* Floating fireflies / embers */}
      <Sparkles count={150} scale={15} size={3} speed={0.2} opacity={0.6} color="#ffb77a" position={[0, 4, -3]} />

      {/* ── The composition — gated behind its own Suspense so the sky + lights
          render immediately and a "Loading…" label shows while the .glb files
          stream in; an error boundary keeps a bad file from blanking the page. ── */}
      <ModelBoundary>
        <Suspense fallback={<LoadingLabel />}>
          <GardenModel />
          <AirbusModel onSelect={onMemorialClick} />
          <GraveModel onSelect={onMemorialClick} />
          <Lantern />
          <ContactShadows position={[0, -0.49, 4]} opacity={0.45} scale={16} blur={2.8} far={6} color="#2a1a10" />
        </Suspense>
      </ModelBoundary>

      {/* ── Smooth, restricted camera ── */}
      <CameraControls
        ref={controls}
        makeDefault
        minDistance={5}
        maxDistance={20}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </>
  )
}
