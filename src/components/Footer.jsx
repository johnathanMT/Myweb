import { PERSONAL, SOCIAL } from '../data/content'
import { SITE } from '../config/site'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative border-t border-white/5 py-16">
      <div className="absolute inset-0 bg-gradient-to-t from-space to-surface pointer-events-none" />
      <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[600px] h-[200px] bg-accent/3 rounded-full blur-3xl pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="flex flex-col items-center gap-8 text-center">
          {/* Logo */}
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-accent flex items-center justify-center text-sm font-bold text-white">M</span>
              <span className="font-mono font-semibold text-white">{PERSONAL.handle}</span>
            </div>
            <p className="text-muted text-sm">{PERSONAL.tagline}</p>
          </div>

          {/* Social links */}
          <div className="flex items-center gap-3">
            {SOCIAL.map(({ label, icon, url }) => (
              <a
                key={label}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-11 h-11 rounded-xl bg-card border border-white/10 flex items-center justify-center text-muted hover:text-white hover:border-accent/40 hover:bg-accent/10 transition-all duration-200 hover:-translate-y-0.5"
              >
                <i className={`${icon} text-base`} />
              </a>
            ))}
          </div>

          {/* Contact + featured project links */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href={SITE.mailto}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-accent/10 border border-accent/30 text-sm text-accent-light hover:text-white hover:bg-accent/20 transition-all duration-200 group"
            >
              <i className="fas fa-envelope text-xs" />
              <span>{SITE.email}</span>
            </a>
            <a
              href={SITE.coffeeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-card border border-white/10 hover:border-accent/30 text-sm text-gray-300 hover:text-white transition-all duration-200 group"
            >
              <span>☕</span>
              <span>Bean Boutique Coffee Shop</span>
              <i className="fas fa-arrow-up-right-from-square text-xs text-muted group-hover:text-accent-light transition-colors" />
            </a>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            {[
              ['#home',      'Home'],
              ['#about',     'About'],
              ['#projects',  'Projects'],
              ['#seasonal',  'Gallery'],
              ['#blog',      'Blog'],
              ['#exploring', 'Exploring'],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                onClick={(e) => { e.preventDefault(); document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }) }}
                className="text-muted hover:text-white text-sm transition-colors"
              >
                {label}
              </a>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-white/5" />

          {/* Copyright */}
          <p className="text-muted text-xs">
            © {year} Designed & Built by{' '}
            <span className="text-gray-300 font-medium">{PERSONAL.name}</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
