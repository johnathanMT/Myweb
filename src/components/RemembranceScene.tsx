import { Suspense, useEffect, useMemo, useRef, useState, Component, type ReactNode, type RefObject } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import {
  useGLTF, Sky, Sparkles, CameraControls, ContactShadows, Html,
  PerformanceMonitor, AdaptiveDpr, BakeShadows,
} from '@react-three/drei'
import type { Sky as SkyImpl } from 'three-stdlib'

// All Remembrance models are served directly from Cloudinary (full https URLs),
// so there's no BASE_URL/public-path helper here anymore.
// Foreground memorial assets:
const GARDEN = 'https://res.cloudinary.com/dhlhzmmtt/image/upload/v1787586676/garden_y1rpnc.glb'
const GRAVE = 'https://res.cloudinary.com/dhlhzmmtt/image/upload/v1787586700/grave_b0dolk.glb'
const GRANDPA = 'https://res.cloudinary.com/dhlhzmmtt/image/upload/v1787587200/grandpa_statue_bcyymt.glb'  // Draco-compressed statue of Grandpa U Hlaing Bwa

// Background architecture — served directly from Cloudinary (full URLs, so they
// are NOT passed through the BASE_URL helper). The YAECO hangar anchors the left
// of the composition; the Air Bagan aircraft holds the right.
const HANGAR = 'https://res.cloudinary.com/dhlhzmmtt/image/upload/v1787587801/yaeco_hangar_bvoch3.glb'
const AIRBAGAN = 'https://res.cloudinary.com/dhlhzmmtt/image/upload/v1787587806/air_bagan_aircraft_clv3xw.glb'

// The `true` flag turns on Draco + Meshopt decoding (drei wires up DRACOLoader
// with the gstatic decoder automatically), so the optimized .glb files load fine.
;[GARDEN, GRAVE, GRANDPA, HANGAR, AIRBAGAN].forEach((url) => useGLTF.preload(url, true))

const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')

// ── Target real-world sizes (largest dimension, in scene units) ──────────────
// garden.glb is NOT a ground plane — it is a memorial stone / urn monument, so it
// is sized human-scale, and a real floor is added below for shadows.
const GARDEN_STONE_SIZE = 2.5   // garden.glb = a memorial stone, human height
const HANGAR_SIZE = 36          // YAECO hangar — a massive backdrop anchoring the left
const AIRBAGAN_SIZE = 30        // Air Bagan aircraft — balances the hangar on the right
const GRAVE_SIZE = 1.8          // a human-readable headstone
const GRANDPA_SIZE = 2.0        // a life-scale memorial statue beside the tombstone

// Distinct hover captions for each memorial object.
const GRAVE_LABEL = 'Aba U Hlaing Bwa · 1945–2026'
const GRANDPA_LABEL = 'In loving memory of Grandpa U Hlaing Bwa'

// Eleven lanterns scattered organically around the memorials, forming a gentle
// path toward the grounded Airbus in the background.
const LANTERN_POSITIONS: [number, number, number][] = [
  [-3, 0, 4], [3, 0, 4], [0, 0, 1], [-5, 0, -5], [4, 0, -8], [0, 0, -12],
  [6, 0, -2], [-7, 0, 2], [2, 0, -3], [-2, 0, -8], [8, 0, -10],
]

// Camera framing presets: [posX, posY, posZ, targetX, targetY, targetZ].
const OVERVIEW: [number, number, number, number, number, number] = [0, 2, 8, 0, 0.9, 3]   // eye-level, on the memorial
// When a card opens: lift up and pull back to a wide establishing shot that frames
// the whole majestic backdrop — YAECO hangar (left) + Air Bagan aircraft (right) —
// while keeping the centred memorial respectfully in the lower foreground.
const SCENE_GAZE: [number, number, number, number, number, number] = [0, 7, 16, 0, 2.5, -13]

/** Loads a GLTF (Draco/Meshopt-aware), enables shadows, and normalises it to `targetSize`. */
function useNormalizedModel(url: string, targetSize: number, groundAlign = true) {
  const { scene } = useGLTF(url, true) // `true` → decode Draco-compressed geometry
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

/** A small screen-space caption that floats above a memorial object on hover. */
function HoverLabel({ text, y }: { text: string; y: number }) {
  return (
    <Html position={[0, y, 0]} center zIndexRange={[100, 0]} pointerEvents="none">
      <div className="-translate-y-2 whitespace-nowrap rounded-full border border-amber-300/40 bg-black/70 px-3 py-1.5 text-xs font-medium text-amber-100 shadow-lg backdrop-blur-md">
        {text}
      </div>
    </Html>
  )
}

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

// ── YAECO hangar — the heavier mass, anchoring the LEFT background. Pushed far
// out and back, turned to a 3/4 diagonal so we read its depth and volume (never
// flat-on), with its opening angled back toward the memorial at centre. ──
function HangarModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(HANGAR, HANGAR_SIZE, true)
  return (
    <group position={[-24, 0, -34]} rotation={[0, Math.PI * 0.22, 0]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor} onPointerOut={outCursor} />
    </group>
  )
}

// ── Air Bagan aircraft — occupies the RIGHT background where the old airbus was
// parked. A touch more forward and inboard than the hangar, nose angled toward
// centre, so its lighter mass counterbalances the hangar's heavier volume and
// the pair frames the foreground without crowding it. ──
function AirBaganModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(AIRBAGAN, AIRBAGAN_SIZE, true)
  return (
    <group position={[15, 0, -30]} rotation={[0, -Math.PI * 0.16, 0]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={overCursor} onPointerOut={outCursor} />
    </group>
  )
}

// ── The grave — foreground, beside the memorial stone ──
function GraveModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(GRAVE, GRAVE_SIZE, true)
  const [hovered, setHovered] = useState(false)
  return (
    <group position={[-2, 0, 3]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { overCursor(e); setHovered(true) }}
        onPointerOut={() => { outCursor(); setHovered(false) }} />
      {hovered && <HoverLabel text={GRAVE_LABEL} y={GRAVE_SIZE + 0.4} />}
    </group>
  )
}

// ── Grandpa U Hlaing Bwa — a memorial statue standing centred between the grave
// (x=-2) and the garden urn (x=+2), i.e. at x=0, facing straight toward the
// camera/front view. Its hover caption is distinct from the grave's. ──
function GrandpaModel({ onSelect }: Clickable) {
  const { object, scale, offset } = useNormalizedModel(GRANDPA, GRANDPA_SIZE, true)
  const [hovered, setHovered] = useState(false)
  return (
    <group position={[0, 0, 3]} rotation={[0, 0, 0]}>
      <primitive object={object} scale={scale} position={offset}
        onClick={(e: ThreeEvent<MouseEvent>) => { e.stopPropagation(); onSelect() }}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => { overCursor(e); setHovered(true) }}
        onPointerOut={() => { outCursor(); setHovered(false) }} />
      {hovered && <HoverLabel text={GRANDPA_LABEL} y={GRANDPA_SIZE + 0.4} />}
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

/* ════════════ Automatic day ⇄ night lighting cycle ════════════ */
// A full loop takes CYCLE_SECONDS; `day` runs 0 (deep night) → 1 (bright noon),
// starting at 1 so the scene opens in clear daylight (statue fully visible). Only
// the sky, ambient/hemisphere/sun lights, and fog are animated — the candle
// point-lights keep their own warm flicker, so they glow beautifully at night.
const CYCLE_SECONDS = 60

const DAY_AMBIENT = new THREE.Color('#fff1dd')
const NIGHT_AMBIENT = new THREE.Color('#ffb77a')
const DAY_SUN = new THREE.Color('#fff3e0')
const NIGHT_SUN = new THREE.Color('#ff9e5e')
const DAY_FOG = new THREE.Color('#cbbfa6')
const NIGHT_FOG = new THREE.Color('#241a33')

function DayNightCycle({
  ambient,
  hemisphere,
  directional,
  sky,
  paused,
}: {
  ambient: RefObject<THREE.AmbientLight | null>
  hemisphere: RefObject<THREE.HemisphereLight | null>
  directional: RefObject<THREE.DirectionalLight | null>
  sky: RefObject<SkyImpl | null>
  paused: boolean
}) {
  const { scene } = useThree()
  const lerp = THREE.MathUtils.lerp
  const phase = useRef(0)   // cycle time; advances only while running, frozen when paused
  const dayVal = useRef(1)  // eased day factor (0 night → 1 day); opens in daylight
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.1) // clamp so a tab-refocus spike can't jump the cycle
    if (!paused) phase.current += dt * ((Math.PI * 2) / CYCLE_SECONDS)

    // Natural cycle value; when a card is open we hold at full day (1) and freeze
    // `phase`, so on close it eases back to exactly where the cycle left off.
    const cycleDay = 0.5 + 0.5 * Math.sin(phase.current + Math.PI / 2)
    const target = paused ? 1 : cycleDay
    dayVal.current = THREE.MathUtils.damp(dayVal.current, target, 1.4, dt)
    const day = dayVal.current

    if (ambient.current) {
      ambient.current.intensity = lerp(0.28, 0.95, day)
      ambient.current.color.lerpColors(NIGHT_AMBIENT, DAY_AMBIENT, day)
    }
    if (hemisphere.current) hemisphere.current.intensity = lerp(0.18, 0.6, day)
    if (directional.current) {
      directional.current.intensity = lerp(0.3, 1.6, day)
      directional.current.color.lerpColors(NIGHT_SUN, DAY_SUN, day)
    }
    if (scene.fog instanceof THREE.Fog) scene.fog.color.lerpColors(NIGHT_FOG, DAY_FOG, day)

    const s = sky.current
    if (s) {
      const u = (s.material as THREE.ShaderMaterial).uniforms
      if (u?.sunPosition) (u.sunPosition.value as THREE.Vector3).set(0, lerp(-0.28, 0.4, day), -1)
      if (u?.rayleigh) u.rayleigh.value = lerp(0.5, 2.4, day)
      if (u?.turbidity) u.turbidity.value = lerp(6, 10, day)
      if (u?.mieCoefficient) u.mieCoefficient.value = lerp(0.004, 0.02, day)
    }
  })
  return null
}

/**
 * RemembranceScene — the serene memorial (everything inside <Canvas>) with an
 * automatic day ⇄ night cycle. Clicking the Airbus, grave, or memorial stone
 * calls onMemorialClick, the statue calls onStatueClick; when `focused` the
 * camera glides to a wide SCENE_GAZE framing the whole backdrop, else the
 * eye-level OVERVIEW. Wrapped in
 * PerformanceMonitor + AdaptiveDpr so lower-end phones stay smooth.
 */
export default function RemembranceScene({
  onMemorialClick,
  onStatueClick,
  focused,
}: {
  onMemorialClick: () => void
  onStatueClick: () => void
  focused: boolean
}) {
  const controls = useRef<CameraControls>(null)

  // Lights + sky animated by the day/night cycle.
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const skyRef = useRef<SkyImpl>(null)

  useEffect(() => {
    const c = controls.current
    if (!c) return
    const [px, py, pz, tx, ty, tz] = focused ? SCENE_GAZE : OVERVIEW
    c.setLookAt(px, py, pz, tx, ty, tz, true)
  }, [focused])

  useFrame((_, delta) => {
    const c = controls.current
    if (c && !focused && !c.active) c.rotate(0.045 * delta, 0, false)
  })

  return (
    <PerformanceMonitor>
      {/* Sky + lights: initial values are a warm golden hour; the DayNightCycle
          below drives them smoothly between bright day and serene night. */}
      <Sky ref={skyRef} sunPosition={[0, 0.35, -1]} turbidity={10} rayleigh={2.4} mieCoefficient={0.02} mieDirectionalG={0.9} />
      <fog attach="fog" args={['#cbbfa6', 26, 90]} />

      {/* ── Lighting (animated) ── */}
      <ambientLight ref={ambientRef} intensity={0.95} color="#fff1dd" />
      <hemisphereLight ref={hemiRef} args={['#e8b483', '#2e2018', 0.6]} />
      <directionalLight
        ref={dirRef}
        position={[8, 9, -6]}
        intensity={1.6}
        color="#fff3e0"
        castShadow
        shadow-mapSize={IS_MOBILE ? [1024, 1024] : [2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-40, 40, 40, -40, 0.1, 120]} />
      </directionalLight>

      {/* Smooth automatic day ⇄ night transition (candles keep their warm glow).
          `paused={focused}` → holds bright daytime while a tribute card is open,
          then resumes the cycle smoothly once it closes. */}
      <DayNightCycle ambient={ambientRef} hemisphere={hemiRef} directional={dirRef} sky={skyRef} paused={focused} />

      {/* Magical floating fireflies — visible on both mobile and desktop */}
      <Sparkles count={150} scale={20} size={3} speed={0.4} opacity={0.6} color="#ffb77a" position={[0, 2, 0]} />

      {/* Dark ground so shadows have a place to land */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#111111" roughness={1} metalness={0} />
      </mesh>

      {/* The composition — own Suspense + error boundary so a slow/bad .glb never blanks the page */}
      <ModelBoundary>
        <Suspense fallback={<LoadingLabel />}>
          <HangarModel onSelect={onMemorialClick} />
          <AirBaganModel onSelect={onMemorialClick} />
          <GraveModel onSelect={onMemorialClick} />
          <GrandpaModel onSelect={onStatueClick} />
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
