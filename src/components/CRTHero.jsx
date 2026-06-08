import '../crt.css'

/**
 * CRTHero — an immersive curved "CRT screen" frame that renders ANY children
 * (your text/graphics) inside a distorted, scanline + flicker environment.
 * Pure CSS/SVG: accessible, responsive, GPU-cheap (transform/opacity only).
 *
 * For TRUE geometric barrel distortion you'd switch to React Three Fiber
 * (a curved plane + shader) or an SVG <filter feDisplacementMap> — heavier and
 * unnecessary for a content-led hero, so this CSS approach is recommended.
 *
 * Usage:
 *   <CRTHero>
 *     <h1 className="crt-chroma text-5xl font-black text-white">MYO THANT NAING</h1>
 *     <p className="text-cyan">From caregiver to coder in Japan</p>
 *     <button>…</button>
 *   </CRTHero>
 */
export default function CRTHero({ children }) {
  return (
    <section id="home" className="crt-stage bg-space">
      <div className="crt-screen">
        <div className="crt-content">
          {children ?? (
            <>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-light">// portfolio · 2026</p>
              <h1 className="crt-chroma text-4xl font-black uppercase text-white sm:text-6xl">
                Myo Thant Naing
              </h1>
              <p className="max-w-md text-gray-300">
                From <span className="text-accent-light">caring</span> to{' '}
                <span className="text-coral">coding</span> in Japan 🇯🇵
              </p>
              <div className="mt-2 flex gap-3">
                <a href="#projects" className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-light">
                  View Work
                </a>
                <a href="#about" className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:border-accent-light hover:text-accent-light">
                  My Story
                </a>
              </div>
            </>
          )}
        </div>

        {/* effect layers (pointer-events-none, never block content) */}
        <div className="crt-scanlines" />
        <div className="crt-vignette" />
        <div className="crt-flicker" />
      </div>
    </section>
  )
}
