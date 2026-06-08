import { useEffect, useRef } from 'react'
import { INTERESTS, PERSONAL } from '../data/content'

export default function Exploring() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.05 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  return (
    <section id="exploring" ref={sectionRef} className="relative py-24 border-t border-white/5"
      style={{ '--c': '#8b5cf6' }}>
      {/* Cosmic bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(7,7,15,0.5) 0%, transparent 40%, transparent 60%, rgba(7,7,15,0.5) 100%)' }} />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse, #8b5cf6, #ec4899, transparent)' }} />

      {/* Starfield dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 0.5 + 'px',
              height: Math.random() * 2 + 0.5 + 'px',
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              opacity: Math.random() * 0.4 + 0.1,
              animation: `blink ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
            }}
          />
        ))}
      </div>

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="reveal mb-8">
          <span className="section-badge">Polymath</span>
          <h2 className="section-title">
            Exploring the Infinite <span className="accent-gradient">🌌</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">The Master of Jack of All Trades</p>
        </div>

        {/* Heinlein quote */}
        <div className="reveal mb-14 max-w-3xl">
          <div className="relative p-6 rounded-2xl overflow-hidden"
            style={{ background: 'rgba(139,92,246,0.05)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div className="absolute top-0 left-0 w-1 h-full rounded-full"
              style={{ background: 'linear-gradient(180deg, #8b5cf6, #ec4899)' }} />
            <i className="fas fa-quote-left text-purple-500/30 text-3xl absolute top-4 right-5" />
            <p className="text-gray-400 text-sm leading-[1.9] italic pl-4">{PERSONAL.heinlein}</p>
          </div>
        </div>

        {/* Interest grid — 4 cols desktop, 2 cols mobile */}
        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
          {INTERESTS.map(({ title, desc, icon, color, page }, i) => (
            <a
              key={title}
              href={page}
              className="poly-card p-5 flex flex-col gap-3"
              style={{ '--card-c': color, animationDelay: `${i * 60}ms` }}
            >
              {/* Icon */}
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
                <i className={`${icon} text-base`} style={{ color }} />
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-white mb-1.5 leading-snug">{title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
              </div>

              {/* CTA arrow */}
              <div className="flex items-center gap-1 text-xs font-semibold mt-1"
                style={{ color }}>
                <span>Explore</span>
                <i className="fas fa-arrow-right text-[9px]" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
