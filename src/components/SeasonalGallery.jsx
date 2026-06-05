import { useState, useEffect, useRef, useCallback } from 'react'
import { MONTHS } from '../data/content'

const INTERVAL = 5000 // ms per slide

export default function SeasonalGallery() {
  const [active,   setActive]   = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused,   setPaused]   = useState(false)
  const timerRef   = useRef(null)
  const startRef   = useRef(null)
  const rafRef     = useRef(null)
  const sectionRef = useRef(null)
  const thumbRef   = useRef(null)

  const goTo = useCallback((idx) => {
    setActive(idx)
    setProgress(0)
    startRef.current = performance.now()
    // scroll thumbnail strip to keep active thumb centered
    if (thumbRef.current) {
      const thumbEl = thumbRef.current.children[idx]
      if (thumbEl) thumbEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [])

  const next = useCallback(() => goTo((active + 1) % MONTHS.length), [active, goTo])
  const prev = useCallback(() => goTo((active - 1 + MONTHS.length) % MONTHS.length), [active, goTo])

  // Progress bar via rAF
  useEffect(() => {
    if (paused) { cancelAnimationFrame(rafRef.current); return }
    startRef.current = performance.now()
    const tick = (now) => {
      const elapsed = now - startRef.current
      const p = Math.min((elapsed / INTERVAL) * 100, 100)
      setProgress(p)
      if (p >= 100) {
        setActive(a => (a + 1) % MONTHS.length)
        startRef.current = performance.now()
        setProgress(0)
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [paused])

  // Scroll reveal
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.08 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Keyboard nav
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft')  prev()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [next, prev])

  const m = MONTHS[active]

  return (
    <section id="seasonal" ref={sectionRef}
      className="relative py-24 border-t border-white/5"
      style={{ '--c': '#f59e0b' }}
    >
      {/* Section bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, #07070f 0%, #0d0a05 50%, #07070f 100%)' }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(ellipse, #f59e0b, transparent)' }} />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="reveal mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <span className="section-badge">Gallery</span>
            <h2 className="section-title">
              <span className="accent-gradient-gold">Year in Focus</span>
            </h2>
            <p className="text-gray-500 text-sm">12 Months · 12 Stories · Captured in Time</p>
          </div>
          {/* Month counter */}
          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="font-mono text-white font-bold text-lg" style={{ color: m.color }}>
              {String(active + 1).padStart(2, '0')}
            </span>
            <span className="text-gray-600">/</span>
            <span className="font-mono">12</span>
          </div>
        </div>

        {/* Main hero carousel */}
        <div className="reveal mb-5">
          <div
            className="season-hero"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Progress bar */}
            <div className="season-progress" style={{ width: `${progress}%` }} />

            {/* Slides */}
            {MONTHS.map((month, i) => (
              <div
                key={month.name}
                className={`season-slide ${i === active ? 'active' : ''}`}
                style={{ backgroundImage: `url(${month.img})` }}
              >
                <div className="season-slide-overlay" />
              </div>
            ))}

            {/* Info overlay */}
            <div className="season-info">
              <p className="text-xs font-mono tracking-widest mb-1" style={{ color: m.color }}>
                {m.zodiac}
              </p>
              <h3 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-2">
                {m.name}
              </h3>
              <p className="text-gray-300 text-sm max-w-md">{m.desc}</p>
            </div>

            {/* Prev / Next arrows */}
            <button
              onClick={prev}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 z-10"
            >
              <i className="fas fa-chevron-left text-sm" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 z-10"
            >
              <i className="fas fa-chevron-right text-sm" />
            </button>

            {/* Pause indicator */}
            {paused && (
              <div className="absolute top-4 right-4 px-2.5 py-1 rounded-full bg-black/50 border border-white/10 text-xs text-gray-400 z-10 flex items-center gap-1.5">
                <i className="fas fa-pause text-[10px]" /> Paused
              </div>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        <div className="reveal">
          <div ref={thumbRef} className="season-thumb-strip">
            {MONTHS.map((month, i) => (
              <div
                key={month.name}
                className={`season-thumb ${i === active ? 'active' : ''}`}
                onClick={() => { goTo(i); setPaused(true); setTimeout(() => setPaused(false), 4000) }}
                title={month.name}
                style={{ '--c': '#f59e0b' }}
              >
                <img src={month.img} alt={month.name} loading="lazy" />
              </div>
            ))}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1.5 mt-4">
            {MONTHS.map((month, i) => (
              <button
                key={month.name}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-300"
                style={{
                  width:  i === active ? '24px' : '6px',
                  height: '6px',
                  background: i === active ? m.color : 'rgba(255,255,255,0.2)',
                  boxShadow: i === active ? `0 0 8px ${m.color}` : 'none',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
