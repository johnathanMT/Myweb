import { PERSONAL, SOCIAL } from '../data/content'
import { SITE } from '../config/site'

/* Premium sci-fi palette */
const GOLD = '#d4af37'
const PURPLE = '#a855f7'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative pt-24 pb-14 overflow-hidden" style={{ background: 'linear-gradient(180deg, transparent, #060509 60%)' }}>
      {/* glowing purple→gold top seam */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4"
        style={{ background: `linear-gradient(90deg, transparent, ${PURPLE}, ${GOLD}, transparent)`, boxShadow: `0 0 16px ${PURPLE}` }} />
      {/* ambient floor glows */}
      <div className="absolute left-1/3 bottom-0 w-[520px] h-[280px] rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ background: `radial-gradient(ellipse, ${PURPLE}, transparent 70%)` }} />
      <div className="absolute right-1/3 bottom-10 w-[380px] h-[220px] rounded-full blur-3xl pointer-events-none opacity-15"
        style={{ background: `radial-gradient(ellipse, ${GOLD}, transparent 70%)` }} />

      {/* giant ghost wordmark for scale/impact */}
      <p className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-black uppercase leading-none select-none"
        style={{ fontSize: 'clamp(3rem, 16vw, 13rem)', color: 'transparent', WebkitTextStroke: '1px rgba(168,85,247,0.06)' }}>
        MTN
      </p>

      {/* Floating content — NO bounding box */}
      <div className="section-container relative z-10">
        <div className="flex flex-col items-center gap-10 text-center">

          {/* Logo */}
          <div>
            <div className="flex items-center justify-center gap-3 mb-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl font-black text-black"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${PURPLE})`, boxShadow: `0 0 34px -4px ${PURPLE}` }}>M</span>
              <span className="font-mono font-black text-4xl md:text-5xl tracking-tight"
                style={{ background: `linear-gradient(90deg, #fff, ${GOLD} 55%, ${PURPLE})`, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent' }}>
                {PERSONAL.handle}
              </span>
            </div>
            <p className="text-base" style={{ color: GOLD }}>{PERSONAL.tagline}</p>
          </div>

          {/* DRASTICALLY enlarged social logos */}
          <div className="flex items-center gap-6 sm:gap-8">
            {SOCIAL.map(({ label, icon, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="group relative flex items-center justify-center rounded-2xl transition-all duration-300 hover:-translate-y-1.5"
                style={{ width: '76px', height: '76px', background: '#0b0a12', border: '1px solid rgba(212,175,55,0.25)' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.boxShadow = `0 0 28px -2px ${PURPLE}, inset 0 0 22px -8px ${GOLD}` }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.25)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <i className={`${icon} text-3xl sm:text-4xl transition-colors duration-300`}
                  style={{ color: '#cdb9ff' }} />
              </a>
            ))}
          </div>

          {/* Contact + featured project */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={SITE.mailto}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
              style={{ color: '#0b0a12', background: `linear-gradient(135deg, ${GOLD}, #e8c75a)`, boxShadow: `0 0 24px -6px ${GOLD}` }}
            >
              <i className="fas fa-envelope text-xs" />
              <span>{SITE.email}</span>
            </a>
            <a
              href={SITE.coffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm text-gray-300 border transition-all duration-200 hover:text-white"
              style={{ borderColor: 'rgba(168,85,247,0.4)', background: 'rgba(168,85,247,0.06)' }}
            >
              <span>☕</span>
              <span>Bean Boutique Coffee Shop</span>
              <i className="fas fa-arrow-up-right-from-square text-xs" style={{ color: PURPLE }} />
            </a>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-2">
            {[
              ['#home', 'Home'], ['#about', 'About'], ['#projects', 'Projects'],
              ['#seasonal', 'Gallery'], ['#blog', 'Blog'], ['#exploring', 'Exploring'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }) }}
                className="text-gray-400 hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
                onMouseEnter={(e) => { e.currentTarget.style.textShadow = `0 0 12px ${GOLD}` }}
                onMouseLeave={(e) => { e.currentTarget.style.textShadow = 'none' }}
              >
                {label}
              </a>
            ))}
          </div>

          {/* thin gold seam */}
          <div className="w-40 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

          {/* Copyright */}
          <p className="text-xs text-gray-500">
            © {year} Designed &amp; Built by{' '}
            <span style={{ color: GOLD }} className="font-medium">{PERSONAL.name}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
