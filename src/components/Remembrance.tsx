import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import RemembranceScene from './RemembranceScene'

/**
 * MEMORIAL_DATA — edit the tribute here (text + image) without touching the JSX.
 * Swap `image` for a personal photo when ready.
 */
const MEMORIAL_DATA = {
  eyebrow: 'In Loving Memory',
  title: 'Aerospace Engineer & Mentor',
  years: '1945 – 2026',
  image: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?q=80&w=800&auto=format&fit=crop',
  imageAlt: 'A warm sunset sky',
  tags: ['Aerospace', 'Mentor', 'Father Figure'],
  story:
    'A guiding light and a father figure. Across decades in aerospace he turned complex engineering ' +
    'into clear purpose — and turned students into engineers. His patience, precision, and quiet ' +
    'warmth shaped every path around him.',
  legacy:
    'The aircraft he helped bring to life still cross the sky; the people he mentored still reach for ' +
    'the stars. His kindness is the quiet engine behind a hundred careers — and it flies on.',
}

/**
 * Remembrance — a standalone, full-screen 3D memorial route (/remembrance).
 * A serene sunset world honouring a beloved aerospace engineer & mentor.
 * Clicking the Airbus, grave, or memorial stone opens a premium tribute card.
 */
export default function Remembrance() {
  const [showMemorialCard, setShowMemorialCard] = useState(false)
  const close = () => setShowMemorialCard(false)

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
        camera={{ position: [0, 2, 8], fov: 45, near: 0.1, far: 300 }}
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
          Tap the aircraft or the memorial stones
        </div>
      )}

      {/* ── Premium tribute card (HTML overlay outside the Canvas) ── */}
      <AnimatePresence>
        {showMemorialCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 p-4"
            onClick={close}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-black/50 text-white shadow-2xl backdrop-blur-xl"
            >
              {/* gold accent line */}
              <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

              {/* Close */}
              <button
                onClick={close}
                aria-label="Close"
                className="absolute right-4 top-4 z-20 rounded-full bg-black/40 p-1.5 text-white/70 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
              >
                <X size={18} />
              </button>

              <div className="grid md:grid-cols-2">
                {/* Left — image */}
                <div className="relative min-h-[200px] md:min-h-[440px]">
                  <img
                    src={MEMORIAL_DATA.image}
                    alt={MEMORIAL_DATA.imageAlt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* soft blend into the card body */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-black/50" />
                </div>

                {/* Right — content */}
                <div className="relative p-7 sm:p-9">
                  {/* tags */}
                  <div className="flex flex-wrap gap-2">
                    {MEMORIAL_DATA.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium tracking-wide text-amber-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.35em] text-amber-300/90">
                    {MEMORIAL_DATA.eyebrow}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-bold leading-tight sm:text-4xl">
                    {MEMORIAL_DATA.title}
                  </h2>
                  <p className="mt-1 font-mono text-sm text-white/55">{MEMORIAL_DATA.years}</p>

                  <div className="mt-6 space-y-5">
                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                        <span aria-hidden>🌿</span> The Story
                      </h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-white/80">
                        {MEMORIAL_DATA.story}
                      </p>
                    </section>

                    <section>
                      <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-100">
                        <span aria-hidden>📜</span> Legacy
                      </h3>
                      <p className="mt-1.5 text-[14px] leading-relaxed text-white/80">
                        {MEMORIAL_DATA.legacy}
                      </p>
                    </section>
                  </div>

                  <button
                    onClick={close}
                    className="mt-7 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-5 py-2.5 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
