// ============================================================================
//  CyberBackground — fixed full-screen WebGL layer that lives BEHIND your site.
//
//  Mount it once near the top of App, then make your page content sit above it
//  (App wrapper: position:relative; z-index:10; background:transparent).
//  It initialises the GSAP scroll bridge and renders the neon corridor + FX.
//
//  Performance / a11y built in:
//   • DPR clamped to 1.75, antialias off (Bloom hides aliasing anyway)
//   • frameloop="demand" is NOT used here because we animate every frame;
//     instead we pause work via prefers-reduced-motion + a mobile opt-out.
//   • Lazy-load this component (React.lazy) so the heavy three bundle is split.
//
//  Requires:  npm i three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing gsap
// ============================================================================
import { Suspense, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import NeonCity from './NeonCity'
import Effects from './Effects'
import { initCyberScroll } from '../lib/cyberScroll'

export default function CyberBackground() {
  useEffect(() => initCyberScroll(), [])

  // Phone vs laptop, decided once. Phones get a lower pixel-ratio cap (a fragment-
  // heavy Bloom pass at full retina DPR melts mobile GPUs) and lighter effects.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 820

  return (
    <div className="cyber-bg" aria-hidden="true">
      <Canvas
        dpr={[1, isMobile ? 1.2 : 1.75]}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.2, 6], fov: 72, near: 0.1, far: 600 }}
      >
        <color attach="background" args={['#05030c']} />
        <fog attach="fog" args={['#05030c', 14, 95]} />
        <Suspense fallback={null}>
          <NeonCity />
          {/* lighter post-processing on phones (no glitch, gentler bloom) */}
          <Effects glitch={!isMobile} low={isMobile} />
        </Suspense>
      </Canvas>
    </div>
  )
}
