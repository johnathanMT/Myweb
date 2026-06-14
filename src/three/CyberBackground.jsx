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
import { Suspense, useState, useEffect } from 'react'
import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor, AdaptiveDpr } from '@react-three/drei'
import NeonCity from './NeonCity'
import Effects from './Effects'
import { initCyberScroll } from '../lib/cyberScroll'

export default function CyberBackground() {
  useEffect(() => initCyberScroll(), [])

  // Phone vs laptop, decided once. Phones get a lower pixel-ratio cap (a fragment-
  // heavy Bloom pass at full retina DPR melts mobile GPUs) and lighter effects.
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 820

  // Dynamic pixel-ratio ceiling: starts high, drops automatically if the GPU
  // can't keep up, climbs back when it recovers (see PerformanceMonitor below).
  const [dpr, setDpr] = useState(isMobile ? 1.2 : 1.75)

  return (
    <div className="cyber-bg" aria-hidden="true">
      <Canvas
        dpr={dpr}
        gl={{ antialias: false, powerPreference: 'high-performance' }}
        camera={{ position: [0, 1.2, 6], fov: 72, near: 0.1, far: 900 }}
      >
        {/* deep near-black base → crisp high-contrast blacks */}
        <color attach="background" args={['#040309']} />
        {/* fog starts far (crisp near city) and reaches the distant pagoda so it
            shows as a faint beacon from the top, then sharpens as you approach */}
        <fog attach="fog" args={['#040309', 40, 760]} />

        {/* ADAPTIVE PERFORMANCE: if FPS dips, lower the render resolution; when it
            recovers, raise it back. This is what keeps the scene smooth on weaker
            GPUs instead of locking everyone to a fixed (possibly too-high) DPR. */}
        <PerformanceMonitor
          onIncline={() => setDpr(isMobile ? 1.2 : 1.75)}
          onDecline={() => setDpr(isMobile ? 0.8 : 1)}
        >
          <Suspense fallback={null}>
            <NeonCity />
            {/* lighter post-processing on phones (no glitch, gentler bloom) */}
            <Effects glitch={!isMobile} low={isMobile} />
          </Suspense>
          {/* drops DPR for a frame during heavy moments (scroll/interaction) */}
          <AdaptiveDpr pixelated />
        </PerformanceMonitor>
      </Canvas>
    </div>
  )
}
