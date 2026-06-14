// ============================================================================
//  CustomFloatingModel — drop ANY downloaded .glb into the 3D scene, give it a
//  glowing neon material, and have it float. Duplicate the <CustomFloatingModel>
//  tag as many times as you like (a car, a drone, a satellite, …).
//
//  Requires:  npm i three @react-three/fiber @react-three/drei
//  Must be rendered INSIDE a <Canvas> (e.g. the NeonCity scene).
// ============================================================================
import { useRef, useMemo, useEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function CustomFloatingModel({
  // ── 1) THE FILE ──────────────────────────────────────────────────────────
  //    Put your .glb in the /public folder, then pass its path here.
  //    e.g. url={import.meta.env.BASE_URL + 'flying-car.glb'}
  url,

  // ── 2) SIZE & PLACEMENT ──────────────────────────────────────────────────
  position = [0, 2, -20],   // [x, y, z]  — left/right, up/down, depth (more -z = further away)
  scale = 2,                // bigger number = bigger model
  rotation = [0, 0, 0],     // starting rotation in radians  [x, y, z]

  // ── 3) GLOWING NEON COLOUR ───────────────────────────────────────────────
  //    Overrides the model's boring default material. Try:
  //    '#00e5ff' cyber-blue · '#ff1e6b' neon-pink · '#ffd400' gold · '#39ff14' matrix-green
  color = '#00e5ff',
  emissiveIntensity = 0.85, // how strongly it glows (Bloom amplifies this)
  metalness = 0.6,
  roughness = 0.25,

  // ── 4) MOTION ────────────────────────────────────────────────────────────
  float = true,             // gentle bob + slow spin
  spinSpeed = 0.3,
}) {
  const { scene } = useGLTF(url, true)   // 2nd arg true = supports Draco-compressed .glb too
  const ref = useRef()

  // Clone so multiple <CustomFloatingModel> using the same file don't share /
  // mutate one another's meshes.
  const model = useMemo(() => scene.clone(true), [scene])

  // Replace every material with a glowing neon one.  ← change `color` prop to recolour.
  useEffect(() => {
    model.traverse((o) => {
      if (o.isMesh) {
        o.material = new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          emissive: new THREE.Color(color),
          emissiveIntensity,
          metalness,
          roughness,
          toneMapped: false,   // lets it exceed 1.0 → the Bloom pass turns it into a real glow
        })
      }
    })
  }, [model, color, emissiveIntensity, metalness, roughness])

  // Float: gentle vertical bob + slow Y spin.
  useFrame((state, dt) => {
    if (!ref.current) return
    if (float) {
      ref.current.rotation.y += dt * spinSpeed
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.4
    }
  })

  return <primitive ref={ref} object={model} position={position} scale={scale} rotation={rotation} />
}
