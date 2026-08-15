import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import RemembranceScene from './RemembranceScene'

/**
 * Remembrance — a standalone, full-screen 3D memorial route (/remembrance).
 * A serene sunset world honouring a beloved aerospace engineer & mentor.
 * Clicking the Airbus or the memorial stone opens a glassmorphism "bento" tribute.
 */
export default function Remembrance() {
  const [showMemorialCard, setShowMemorialCard] = useState(false)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1024]">
      {/* Back to the portfolio */}
      <Link
        to="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-black/50"
      >
        <ArrowLeft size={16} /> Home
      </Link>

      {/* ── The 3D world ── */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [9, 4, 12], fov: 45, near: 0.1, far: 200 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <RemembranceScene
            focused={showMemorialCard}
            onMemorialClick={() => setShowMemorialCard(true)}
          />
        </Suspense>
      </Canvas>

      {/* Load progress (drei) */}
      <Loader />

      {/* Gentle hint */}
      {!showMemorialCard && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
          Tap the aircraft or the memorial stone
        </div>
      )}

      {/* ── Bento memorial card (HTML overlay outside the Canvas) ── */}
      <AnimatePresence>
        {showMemorialCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/30 p-4"
            onClick={() => setShowMemorialCard(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-8 text-white shadow-2xl backdrop-blur-xl"
            >
              {/* gold accent line */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

              <button
                onClick={() => setShowMemorialCard(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full p-1.5 text-white/60 transition hover:bg-white/10 hover:text-white"
              >
                <X size={18} />
              </button>

              <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-amber-300/90">
                In Loving Memory
              </p>
              <h2 className="mt-2 font-serif text-3xl font-bold leading-tight">
                Aerospace Engineer &amp; Mentor
              </h2>
              <p className="mt-1 font-mono text-sm text-white/60">1945 – 2026</p>

              <p className="mt-5 text-[15px] leading-relaxed text-white/85">
                A guiding light and a father figure. Your wisdom and kindness shaped paths that
                will forever reach for the stars.
              </p>

              <button
                onClick={() => setShowMemorialCard(false)}
                className="mt-7 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
