// ============================================================================
//  NeonCity — an endless neon corridor you fly through on scroll.
//
//  • Two rows of emissive "buildings" recede into fog along -Z.
//  • <Rig> dollies the camera forward based on the shared scrollState.progress
//    (set by GSAP ScrollTrigger), with damping + subtle mouse parallax.
//  • meshBasicMaterial + toneMapped={false} keeps the neon colours bright so
//    the <Bloom> pass makes them glow.
//
//  Requires:  npm i three @react-three/fiber @react-three/drei
// ============================================================================
import { useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Instances, Instance } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/cyberScroll'

const PALETTE = ['#00e5ff', '#ff1e6b', '#7c3aed', '#19ffe0', '#ff8a00']
const ROWS = 64          // depth segments
const DEPTH = 8          // spacing between segments (world units)
const TRACK = ROWS * DEPTH

function useBuildings() {
  return useMemo(() => {
    const out = []
    for (let i = 0; i < ROWS; i++) {
      for (const side of [-1, 1]) {
        const h = THREE.MathUtils.randFloat(3, 18)
        out.push({
          position: [
            side * THREE.MathUtils.randFloat(5, 9.5),
            h / 2 - 2,
            -i * DEPTH - THREE.MathUtils.randFloat(0, DEPTH),
          ],
          scale: [THREE.MathUtils.randFloat(1.3, 3), h, THREE.MathUtils.randFloat(1.3, 3)],
          color: PALETTE[(Math.random() * PALETTE.length) | 0],
        })
      }
    }
    return out
  }, [])
}

function Rig() {
  const { camera, pointer } = useThree()
  useFrame((_, dt) => {
    // fly from the mouth of the corridor to near its end
    const targetZ = 6 - scrollState.progress * (TRACK - 24)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 3, dt)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.x * 1.6, 2.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, 1.2 + pointer.y * 0.6, 2.5, dt)
    camera.lookAt(0, 1, camera.position.z - 10)
  })
  return null
}

export default function NeonCity() {
  const buildings = useBuildings()
  return (
    <group>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 12, 0]} intensity={50} distance={70} color="#7c3aed" />

      {/* emissive neon buildings (bright + unlit so Bloom makes them glow) */}
      <Instances limit={buildings.length} range={buildings.length}>
        <boxGeometry />
        <meshBasicMaterial toneMapped={false} />
        {buildings.map((b, i) => (
          <Instance key={i} position={b.position} scale={b.scale} color={b.color} />
        ))}
      </Instances>

      {/* neon floor + ceiling grids for speed/depth cues */}
      <gridHelper args={[60, 60, '#ff1e6b', '#10203a']} position={[0, -2, -TRACK / 2]} rotation={[0, 0, 0]} scale={[1, 1, TRACK / 60]} />
      <gridHelper args={[60, 60, '#00e5ff', '#10203a']} position={[0, 16, -TRACK / 2]} scale={[1, 1, TRACK / 60]} />

      <Rig />
    </group>
  )
}
