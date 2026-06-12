// ============================================================================
//  NeonCity — an endless neon Tokyo corridor you fly through on scroll.
//
//  • Two rows of emissive "buildings" recede into fog along -Z.
//  • <NeonSigns> attaches glowing Japanese signage to the building faces
//    (drei <Text>, troika SDF text) for a realistic Tokyo-night feel.
//  • <Drone> is a JARVIS-style AI companion built from primitives (glowing
//    core + counter-rotating rings) that floats and follows the camera.
//  • <Rig> dollies the camera forward via the shared scrollState.progress.
//  • meshBasicMaterial + toneMapped={false} keeps neon bright so <Bloom> glows.
//
//  Requires:  npm i three @react-three/fiber @react-three/drei
// ============================================================================
import { useMemo, useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Instances, Instance, Text } from '@react-three/drei'
import * as THREE from 'three'
import { scrollState } from '../lib/cyberScroll'

const PALETTE = ['#00e5ff', '#ff1e6b', '#7c3aed', '#19ffe0', '#ff8a00']
const ROWS = 64          // depth segments
const DEPTH = 8          // spacing between segments (world units)
const TRACK = ROWS * DEPTH

// SELF-HOSTED Japanese font (same-origin → no CDN, no CSP exception, never
// rate-limited). Put a Noto Sans JP .woff at public/fonts/NotoSansJP.woff and
// it loads from here. If the file is missing, the signs automatically fall back
// to the Latin/romaji label below (rendered with troika's built-in font), so
// the scene NEVER shows tofu boxes.  BASE_URL handles the /Myweb/ vs / path.
const JP_FONT = `${import.meta.env.BASE_URL}fonts/NotoSansJP.woff`

// Each sign carries BOTH a Japanese label and a guaranteed-renderable Latin
// fallback. When the JP font is present we show `jp`; otherwise `latin`.
const SIGN_DATA = [
  { jp: 'サイバー', latin: 'CYBER' },
  { jp: '東京', latin: 'TOKYO' },
  { jp: 'ラーメン', latin: 'RAMEN' },
  { jp: '未来', latin: 'FUTURE' },
  { jp: 'ナイン+ニンナンダー', latin: 'NINE+HNIN_NANDA' },
  { jp: '電脳', latin: 'CYBERBRAIN' },
  { jp: '寿司', latin: 'SUSHI' },
  { jp: '夜の街', latin: 'NIGHT CITY' },
  { jp: '龍', latin: 'RYU' },
  { jp: 'バー', latin: 'BAR' },
  { jp: '二四時間', latin: '24H' },
  { jp: '居酒屋', latin: 'IZAKAYA' },
]

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

/* Glowing Japanese signs on the inner building faces — with an automatic Latin
   fallback so a missing font never produces tofu boxes. */
function NeonSigns() {
  // Probe the self-hosted font once; show Japanese only if it actually loads.
  const [fontReady, setFontReady] = useState(false)
  useEffect(() => {
    let alive = true
    fetch(JP_FONT, { method: 'GET' })
      .then((r) => { if (alive && r.ok) setFontReady(true) })
      .catch(() => { })   // missing/blocked → keep Latin fallback
    return () => { alive = false }
  }, [])

  const signs = useMemo(() => {
    const out = []
    for (let i = 0; i < 26; i++) {
      const side = Math.random() < 0.5 ? -1 : 1
      out.push({
        data: SIGN_DATA[(Math.random() * SIGN_DATA.length) | 0],
        color: PALETTE[(Math.random() * PALETTE.length) | 0],
        position: [side * 4.6, THREE.MathUtils.randFloat(1, 11), -THREE.MathUtils.randFloat(6, TRACK - 10)],
        rotY: side === -1 ? Math.PI / 2 : -Math.PI / 2,
        size: THREE.MathUtils.randFloat(0.9, 1.7),
      })
    }
    return out
  }, [])

  return (
    <group>
      {signs.map((s, i) => (
        <Text
          key={i}
          // font prop only when the JP font is confirmed loaded; otherwise
          // undefined → troika's built-in Latin font renders the fallback.
          font={fontReady ? JP_FONT : undefined}
          position={s.position}
          rotation={[0, s.rotY, 0]}
          fontSize={s.size}
          color={s.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.012}
          outlineColor={s.color}
          material-toneMapped={false}   // stay bright → blooms
        >
          {fontReady ? s.data.jp : s.data.latin}
        </Text>
      ))}
    </group>
  )
}

/* JARVIS-style AI drone: glowing core + counter-rotating rings; floats and
   follows the camera as you scroll. Swap for a <primitive object={gltf.scene}/>
   later when you have a .glb model. */
function Drone() {
  const root = useRef()
  const ringA = useRef()
  const ringB = useRef()
  const core = useRef()
  const { camera } = useThree()

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime
    if (root.current) {
      // hover ahead of the camera, weaving gently
      root.current.position.x = THREE.MathUtils.damp(root.current.position.x, Math.sin(t * 0.5) * 3.2, 2, dt)
      root.current.position.y = THREE.MathUtils.damp(root.current.position.y, 2.4 + Math.cos(t * 0.7) * 1.1, 2, dt)
      root.current.position.z = THREE.MathUtils.damp(root.current.position.z, camera.position.z - 9, 2, dt)
    }
    if (ringA.current) { ringA.current.rotation.x += dt * 1.4; ringA.current.rotation.y += dt * 0.6 }
    if (ringB.current) { ringB.current.rotation.y += dt * 2.0; ringB.current.rotation.z += dt * 0.8 }
    if (core.current) { const s = 1 + Math.sin(t * 4) * 0.12; core.current.scale.setScalar(s) }
  })

  return (
    <group ref={root}>
      {/* glowing core */}
      <mesh ref={core}>
        <icosahedronGeometry args={[0.45, 1]} />
        <meshBasicMaterial color="#00e5ff" toneMapped={false} />
      </mesh>
      {/* counter-rotating rings */}
      <mesh ref={ringA}>
        <torusGeometry args={[0.95, 0.03, 12, 64]} />
        <meshBasicMaterial color="#ff1e6b" toneMapped={false} />
      </mesh>
      <mesh ref={ringB}>
        <torusGeometry args={[1.25, 0.025, 12, 64]} />
        <meshBasicMaterial color="#7c3aed" toneMapped={false} />
      </mesh>
      {/* it casts its own light into the scene */}
      <pointLight color="#00e5ff" intensity={6} distance={18} />
    </group>
  )
}

function Rig() {
  const { camera, pointer } = useThree()
  useFrame((_, dt) => {
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

      <NeonSigns />
      <Drone />

      {/* neon floor + ceiling grids for speed/depth cues */}
      <gridHelper args={[60, 60, '#ff1e6b', '#10203a']} position={[0, -2, -TRACK / 2]} scale={[1, 1, TRACK / 60]} />
      <gridHelper args={[60, 60, '#00e5ff', '#10203a']} position={[0, 16, -TRACK / 2]} scale={[1, 1, TRACK / 60]} />

      <Rig />
    </group>
  )
}
