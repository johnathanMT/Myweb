import { useMemo } from 'react'
import * as THREE from 'three'
import { type ThreeEvent } from '@react-three/fiber'
import { useGLTF, Sky, OrbitControls, ContactShadows } from '@react-three/drei'

// Vite serves /public at BASE_URL (base = "/Myweb/"), so every model URL must be
// prefixed — otherwise the .glb files 404 in production.
const BASE = import.meta.env.BASE_URL || '/'
const u = (f: string): string => `${BASE}${f}`

const GARDEN = u('garden.glb')
const AIRBUS = u('airbus.glb')
const GRAVE = u('grave.glb')

// Warm the cache before first paint so the scene resolves in one go.
;[GARDEN, AIRBUS, GRAVE].forEach((url) => useGLTF.preload(url))

/** Loads a GLTF and returns a clone with shadow casting/receiving enabled on
 *  every mesh (cloning keeps each placement independent + memo-stable). */
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
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
  const out = () => { document.body.style.cursor = 'auto' }
  return (
    <primitive
      object={scene}
      position={[0, 3, -10]}
      rotation={[0, Math.PI * 0.12, 0]}
      onClick={click}
      onPointerOver={over}
      onPointerOut={out}
    />
  )
}

// ── The memorial stone — intimate, in the foreground ──
function GraveModel({ onSelect }: Clickable) {
  const scene = useShadowedScene(GRAVE)
  const click = (e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }
  const over = (e: ThreeEvent<PointerEvent>) => { e.stopPropagation(); document.body.style.cursor = 'pointer' }
  const out = () => { document.body.style.cursor = 'auto' }
  return (
    <primitive
      object={scene}
      position={[0, 0, 4]}
      onClick={click}
      onPointerOver={over}
      onPointerOut={out}
    />
  )
}

// ── A small lantern beside the stone, glowing warmly against the sunset ──
function Lantern() {
  return (
    <group position={[1, 0, 4]}>
      {/* localized warm light — the flame */}
      <pointLight position={[0, 1, 0]} color="#ffaa00" intensity={2} distance={6} />
      {/* simple lantern body placeholder */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <boxGeometry args={[0.24, 0.42, 0.24]} />
        <meshStandardMaterial color="#3a2a17" emissive="#ffaa00" emissiveIntensity={0.5} />
      </mesh>
      {/* glowing flame bulb (unlit by tone mapping so it stays bright) */}
      <mesh position={[0, 0.55, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color="#fff3c4" emissive="#ffcc55" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

/**
 * RemembranceScene — the serene sunset memorial scene graph (everything that
 * lives inside <Canvas>). Clicking the Airbus or the stone calls onMemorialClick.
 */
export default function RemembranceScene({ onMemorialClick }: { onMemorialClick: () => void }) {
  return (
    <>
      {/* Sunset / twilight sky (sun dipping below the horizon → warm orange/pink/purple) */}
      <Sky sunPosition={[0, -0.1, -1]} turbidity={9} rayleigh={2.2} mieCoefficient={0.02} mieDirectionalG={0.92} />
      {/* warm haze that fades the horizon into the sky */}
      <fog attach="fog" args={['#e0966b', 20, 60]} />

      {/* ── Lighting — warm sunset ── */}
      <ambientLight intensity={0.4} color="#ffb77a" />
      <hemisphereLight args={['#ffd9a0', '#5a4030', 0.35]} />
      {/* the setting sun — low angle, casts soft long shadows */}
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

      {/* ── The composition ── */}
      <GardenModel />
      <AirbusModel onSelect={onMemorialClick} />
      <GraveModel onSelect={onMemorialClick} />
      <Lantern />

      {/* soft grounding shadow beneath the memorial */}
      <ContactShadows position={[0, -0.49, 4]} opacity={0.45} scale={16} blur={2.8} far={6} color="#2a1a10" />

      {/* ── Peaceful, restricted camera ── */}
      <OrbitControls
        makeDefault
        enablePan={false}
        autoRotate
        autoRotateSpeed={0.3}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={5}
        maxDistance={20}
        target={[0, 0.5, 2]}
      />
    </>
  )
}
