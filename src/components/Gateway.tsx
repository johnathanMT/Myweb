import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { motion, type MotionProps } from 'framer-motion'
import { ArrowRight, Mail, ArrowDown } from 'lucide-react'
import { PERSONAL, SOCIAL } from '../data/content'

/**
 * Gateway — the homepage hero.
 *  • Backdrop: a live battle of pearl-white AI robots vs crimson creatures
 *    (hero/BattleScene), code-split so the text paints first.
 *  • The section is a permanent night stage (`dark-scope` re-applies the dark
 *    tokens) in BOTH themes, so the pearl + crimson light always has contrast.
 *  • Copy sits in a glass panel over a centre scrim for readability.
 */

// Canvas engine lives in its own chunk; the navy stage shows until it lands.
const BattleScene = lazy(() => import('./hero/BattleScene'))

// Annotating the return as MotionProps contextually types `ease` as a cubic-bezier
// tuple (BezierDefinition), so the literal below isn't widened to number[].
const fade = (delay = 0): MotionProps => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] },
})

export default function Gateway() {
  return (
    <section id="home" className="hero-battle dark-scope relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
      <div className="hero-stage pointer-events-none absolute inset-0" aria-hidden>
        <Suspense fallback={null}><BattleScene /></Suspense>
        <div className="hero-scrim" />
      </div>
      <div className="hero-fade pointer-events-none absolute inset-x-0 bottom-0" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-2xl px-4 pb-24 pt-20 sm:px-6">
        <div className="hero-glass flex flex-col items-center px-5 py-8 text-center sm:px-10 sm:py-10">
          {/* availability pill */}
          <motion.span {...fade(0)}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-medium tracking-wide text-accent-light backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
            </span>
            Open to opportunities
          </motion.span>

          {/* kicker */}
          <motion.p {...fade(0.05)}
            className="mb-5 font-mono text-[11px] uppercase tracking-[0.34em] text-muted">
            {PERSONAL.tagline}
          </motion.p>

          {/* name */}
          <motion.h1 {...fade(0.1)}
            className="hero-name font-groovy text-[clamp(2rem,6.2vw,4.25rem)] uppercase leading-[1.05] tracking-wide">
            Myo Thant Naing
          </motion.h1>

          {/* role / subheadline — wraps gracefully on small screens (text-balance);
              sizing clamps down a touch since this line is longer than before. */}
          <motion.p {...fade(0.18)}
            className="mx-auto mt-5 max-w-2xl text-balance text-[clamp(1.05rem,2.6vw,1.6rem)] font-light leading-snug text-muted">
            Computer Science Student <span className="px-0.5 text-fg/40">|</span> Aspiring Software Engineer <span className="text-accent">&amp;</span> AI Enthusiast
          </motion.p>

          {/* one line of context */}
          <motion.p {...fade(0.26)}
            className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
            {PERSONAL.bio}
          </motion.p>

          {/* CTAs */}
          <motion.div {...fade(0.34)}
            className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
            <Link to="/projects" className="btn-primary group w-full sm:w-auto">
              View Projects
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href={`mailto:${PERSONAL.email}`} className="btn-glass w-full sm:w-auto">
              <Mail size={15} className="text-accent" />
              Get in touch
            </a>
          </motion.div>

          {/* socials */}
          {Array.isArray(SOCIAL) && SOCIAL.length > 0 && (
            <motion.div {...fade(0.42)} className="mt-8 flex items-center gap-7">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-muted transition-all duration-200 hover:-translate-y-0.5 hover:text-accent"
                >
                  <i className={`${s.icon} text-xl`} />
                </a>
              ))}
            </motion.div>
          )}

          {/* interaction hint (hidden for reduced motion — the scene is a still) */}
          <p className="hero-hint mt-6 font-mono text-[10px] uppercase tracking-[0.3em]">Tap the battlefield · surge</p>
        </div>
      </div>

      {/* scroll cue */}
      <a
        href="#explore"
        onClick={(e) => { e.preventDefault(); document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' }) }}
        aria-label="Scroll to explore"
        className="absolute left-1/2 z-10 hidden -translate-x-1/2 text-muted/70 transition hover:text-accent sm:block"
        style={{ bottom: 'calc(var(--dock-space) + 0.75rem)' }}
      >
        <ArrowDown size={20} className="animate-bounce" />
      </a>
    </section>
  )
}
