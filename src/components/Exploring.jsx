import { useEffect, useRef } from 'react'
import { INTERESTS, PERSONAL } from '../data/content'

export default function Exploring() {
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.05 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="exploring" ref={sectionRef} className="relative py-24 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-space to-surface pointer-events-none" />
      <div className="absolute right-0 top-1/4 w-96 h-96 bg-accent/4 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="reveal mb-6">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">Polymath</p>
          <h2 className="section-title">Exploring the Infinite 🌌</h2>
        </div>

        {/* Heinlein quote */}
        <div className="reveal mb-14 max-w-3xl">
          <div className="p-6 rounded-2xl bg-card border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-accent via-purple-400 to-transparent rounded-full" />
            <p className="text-gray-400 text-sm leading-relaxed italic pl-4">
              {PERSONAL.heinlein}
            </p>
          </div>
        </div>

        {/* Interest grid */}
        <div className="reveal grid grid-cols-2 md:grid-cols-4 gap-4">
          {INTERESTS.map(({ title, desc, icon, color }, i) => (
            <div
              key={title}
              className="poly-card glass-card p-5 rounded-2xl flex flex-col gap-3 cursor-default"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${color}15`, border: `1px solid ${color}25` }}
              >
                <i className={`${icon} text-base`} style={{ color }} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">{title}</h3>
                <p className="text-xs text-muted leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-title */}
        <p className="reveal mt-10 text-center text-muted text-xs tracking-widest uppercase">
          The Master of Jack of All Trades
        </p>
      </div>
    </section>
  )
}
