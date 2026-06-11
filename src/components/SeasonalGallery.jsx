import { useEffect, useRef } from 'react'
import { MONTHS } from '../data/content'

/**
 * SeasonalGallery — "Year in Focus" as a solar system.
 * The 12 month images orbit a glowing core along a full-width elliptical path
 * (CSS Motion Path / offset-path), looping endlessly like planets. Each body
 * scales + brightens as it swings to the front for a 3D depth illusion.
 * Theme: deep-space "Milky Way" — stardust gradients, nebula glow, starfield.
 * Hover the stage to pause the orbit; hover a planet for its month label.
 */
export default function SeasonalGallery() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="seasonal" ref={sectionRef} className="orbit-galaxy relative py-28 border-t border-white/5 overflow-hidden">
      {/* nebula glows */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(60% 50% at 20% 20%, rgba(124,58,237,0.18), transparent 60%), radial-gradient(55% 45% at 85% 75%, rgba(0,212,255,0.14), transparent 60%), radial-gradient(50% 40% at 60% 110%, rgba(236,72,153,0.12), transparent 60%)' }} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="reveal mb-6 text-center">
          <span className="section-badge">Gallery</span>
          <h2 className="section-title">
            <span className="bg-gradient-to-r from-cyan via-white to-accent-light bg-clip-text text-transparent">Year in Focus</span>
          </h2>
          <p className="text-gray-400 text-sm">12 Myanmar Festivals · one for every month · orbiting in deep space</p>
        </div>

        {/* Orbit */}
        <div className="reveal orbit-viewport">
          <div className="orbit-stage">
            {/* central sun / core */}
            <div className="orbit-sun" aria-hidden />
            <div className="orbit-sun-label">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/70">12 / 12</span>
            </div>

            {/* orbiting planets */}
            {MONTHS.map((m, i) => (
              <div key={m.name} className="orbit-planet" style={{ '--i': i }}>
                <div className="orbit-body" style={{ '--c': m.color }}>
                  <img src={m.img} alt={`${m.festival} — ${m.name}`} loading="lazy" />
                  <span className="orbit-label" style={{ color: m.color }}>
                    <b>{m.festival}</b><br /><span style={{ opacity: 0.6, fontWeight: 400 }}>{m.name}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
