import { INTERESTS, PERSONAL } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

export default function Exploring() {
  const sectionRef = useCyberReveal()   // GSAP ScrollTrigger reveals, synced to the 3D camera

  return (
    <section id="exploring" ref={sectionRef} className="relative py-24 border-t border-white/5 text-legible"
      style={{ '--c': 'rgb(var(--accent))' }}>
      {/* crystal-clear: faint tint only, no blur (readability via .text-legible) */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      {/* Cosmic bg */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(180deg, rgba(20, 20, 20,0.5) 0%, transparent 40%, transparent 60%, rgba(20, 20, 20,0.5) 100%)' }} />
      <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none opacity-10"
        style={{ background: 'radial-gradient(ellipse, rgb(var(--accent)), rgb(var(--coral)), transparent)' }} />

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
        <div data-reveal className="mb-8">
          <span className="section-badge">Polymath</span>
          <h2 className="section-title">
            Exploring the Infinite <span className="accent-gradient">🌌</span>
          </h2>
          <p className="text-xs uppercase tracking-widest text-gray-600 mb-4">The Master of Jack of All Trades</p>
        </div>

        {/* Heinlein quote */}
        <div data-reveal className="mb-14 max-w-3xl">
          <div className="relative p-6 rounded-2xl overflow-hidden"
            style={{ background: 'rgb(var(--accent)/0.05)', border: '1px solid rgb(var(--accent)/0.15)' }}>
            <div className="absolute top-0 left-0 w-1 h-full rounded-full"
              style={{ background: 'linear-gradient(180deg, rgb(var(--accent)), rgb(var(--coral)))' }} />
            <i className="fas fa-quote-left text-purple-500/30 text-3xl absolute top-4 right-5" />
            <p className="text-gray-400 text-sm leading-[1.9] italic pl-4">{PERSONAL.heinlein}</p>
          </div>
        </div>

        {/* Interest grid — 4 cols desktop, 2 cols mobile */}
        <div data-reveal className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
