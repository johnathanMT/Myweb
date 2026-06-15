// ============================================================================
//  GlbModel — drop-in loader for ANY .glb model in the Immersive (Cyber) scene.
//
//  WHY: NeonCity.jsx already loads the city/pagoda/castle via a bespoke <Model>.
//  Use THIS component for quick additions (characters, props, vehicles) without
//  touching that tuning block — duplicate one <GlbModel .../> line per model.
//
//  ── HOW TO USE ──────────────────────────────────────────────────────────────
//  1. Put your file in   public/          e.g.  public/robot.glb
//     (Draco/Meshopt compress it first — see scripts in the playbook.)
//  2. In NeonCity.jsx, import it:
//         import GlbModel from './GlbModel'
//     and drop it inside the scene <group> (near <Drone />):
//
//         <Suspense fallback={null}>
//           <GlbModel
//             url={import.meta.env.BASE_URL + 'robot.glb'}
//             position={[8, -4, -40]}   // [x, y, z]  (more -z = further back)
//             scale={3}                  // bump until it looks right
//             rotation={[0, -0.5, 0]}    // radians
//             float                      // gentle bob + slow spin (optional)
//             glow="#00e5ff"             // optional cyber emissive tint
//           />
//         </Suspense>
//
//  3. Tune position/scale by eye. If it loads on its side, try rotation
//     [-Math.PI/2, 0, 0]. If it's tiny/huge, the .glb's native units differ —
//     just change `scale` (powers of ~10 if wildly off).
//
//  PERF: shadows off + matrixAutoUpdate off (static). For an ANIMATED character
//  with skeletal animation, say the word — that needs useAnimations(), which is
//  a small variant of this component.
//  Requires:  three @react-three/fiber @react-three/drei  (already installed)
// ============================================================================
import { useMemo, useRef, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function GlbModel({
  url,
  position = [0, 0, 0],
  scale = 1,
  rotation = [0, 0, 0],
  glow,                 // optional emissive hex (e.g. '#00e5ff'); omit to keep original materials
  float = false,        // gentle vertical bob + slow Y-spin
  floatSpeed = 0.5,
  floatHeight = 0.4,
}) {
  const { scene } = useGLTF(url, true)   // true = supports Draco-compressed .glb
  // Clone so multiple instances of the same file don't share/mutate one object.
  const model = useMemo(() => scene.clone(true), [scene])
  const ref = useRef()

  useEffect(() => {
    model.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = false
      o.receiveShadow = false
      o.frustumCulled = true
      if (glow && o.material) {
        o.material = o.material.clone()
        o.material.emissive = new THREE.Color(glow)
        o.material.emissiveIntensity = 0.6
        o.material.toneMapped = false      // lets the bloom pass turn it into a real glow
      }
      if (!float) o.matrixAutoUpdate = false   // freeze matrices only when static
    })
  }, [model, glow, float])

  useFrame((state) => {
    if (!float || !ref.current) return
    const t = state.clock.elapsedTime
    ref.current.position.y = position[1] + Math.sin(t * floatSpeed) * floatHeight
    ref.current.rotation.y = rotation[1] + t * floatSpeed * 0.4
  })

  return (
    <group ref={ref} position={position} rotation={rotation} scale={scale}>
      <primitive object={model} />
    </group>
  )
}

// Optional: preload so the model starts fetching before it mounts.
// GlbModel.preload = (url) => useGLTF.preload(url, true)
