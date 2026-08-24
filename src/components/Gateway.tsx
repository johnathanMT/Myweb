import { motion, type MotionProps, type Variants } from 'framer-motion'
import { ArrowRight, Mail, ArrowDown } from 'lucide-react'
import { PERSONAL, SOCIAL } from '../data/content'

// ── Heart Sutra cascade ──────────────────────────────────────────────────────
// The chant "摩訶般若波羅蜜多" (Maka Hannya Haramita) falls vertically as a mystical
// backdrop. Each character fades in, drifts down, and fades out; staggerChildren
// offsets each one so the column cascades top→bottom, looping forever.
const SUTRA = '摩訶般若波羅蜜多'
const SUTRA_COLORS = ['#bf953f', '#e0e0e0', '#6b0f1a'] // gold · silver · dark crimson
const MINCHO =
  '"Hiragino Mincho ProN","Yu Mincho",YuMincho,"Noto Serif JP","Songti SC","Shippori Mincho",serif'

const columnVariants: Variants = {
  // Parent only orchestrates the cascade; each child loops on its own timeline.
  animate: { transition: { staggerChildren: 0.28 } },
}
const charVariants: Variants = {
  initial: { opacity: 0, y: 0 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [0, 12, 22, 36],
    transition: {
      duration: 3.4,
      times: [0, 0.25, 0.7, 1],
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

/** One vertical, infinitely-cascading column of the sutra. `delay` phases the two
 *  columns so left and right don't pulse in lockstep. */
function SutraColumn({ className = '', delay = 0 }: { className?: string; delay?: number }) {
  return (
    <motion.div
      aria-hidden
      variants={columnVariants}
      initial="initial"
      animate="animate"
      transition={{ delayChildren: delay }}
      className={`pointer-events-none absolute z-10 select-none ${className}`}
      style={{ writingMode: 'vertical-rl', fontFamily: MINCHO }}
    >
      {SUTRA.split('').map((ch, i) => (
        <motion.span
          key={i}
          variants={charVariants}
          className="block text-[clamp(1.4rem,3vw,2.75rem)] font-semibold leading-[1.5]"
          style={{ color: SUTRA_COLORS[i % SUTRA_COLORS.length], textShadow: '0 2px 12px rgba(0,0,0,0.65)' }}
        >
          {ch}
        </motion.span>
      ))}
    </motion.div>
  )
}

/**
 * Gateway — clean, minimalist hero.
 *  • No video. An elegant, theme-aware CSS gradient + faint grid (see index.css).
 *  • Clear hierarchy: kicker → name → role → one line of context → two CTAs.
 *  • Generous whitespace; reads well in both light and dark.
 */

// Annotating the return as MotionProps contextually types `ease` as a cubic-bezier
// tuple (BezierDefinition), so the literal below isn't widened to number[].
const fade = (delay = 0): MotionProps => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.2, 0.7, 0.2, 1] },
})

export default function Gateway() {
  const scrollTo = (sel: string) => document.querySelector(sel)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="home" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden">
      {/* Adaptive gradient + masked grid backdrop (opaque → covers page backdrop). */}
      <div className="hero-gradient pointer-events-none absolute inset-0 -z-10" aria-hidden />
      <div className="hero-grid pointer-events-none absolute inset-0 -z-10" aria-hidden />

      {/* Mystical Heart Sutra cascade — floats over the backdrop, behind the title. */}
      <SutraColumn className="left-4 top-1/2 -translate-y-1/2 sm:left-10 lg:left-24" delay={0} />
      <SutraColumn className="right-4 top-1/2 -translate-y-1/2 sm:right-10 lg:right-24" delay={1.4} />

      <div className="relative z-20 mx-auto flex w-full max-w-3xl flex-col items-center px-6 text-center">
        {/* availability pill */}
        <motion.span {...fade(0)}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-jade/30 bg-jade/10 px-4 py-1.5 text-xs font-medium tracking-wide text-jade">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-jade/60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-jade" />
          </span>
          Open to opportunities
        </motion.span>

        {/* kicker */}
        <motion.p {...fade(0.05)}
          className="mb-6 font-mono text-[11px] uppercase tracking-[0.34em] text-muted">
          {PERSONAL.tagline}
        </motion.p>

        {/* name */}
        <motion.h1 {...fade(0.1)}
          className="font-groovy neon-glow text-[clamp(2rem,6.5vw,5rem)] uppercase leading-[1.05] tracking-wide text-fg">
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
          className="mt-10 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={() => scrollTo('#projects')}
            className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:brightness-110 sm:w-auto"
          >
            View Projects
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
          </button>
          <a
            href={`mailto:${PERSONAL.email}`}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-fg/15 px-7 py-3 text-sm font-semibold text-fg transition hover:border-fg/35 hover:bg-fg/5 sm:w-auto"
          >
            <Mail size={15} className="text-jade" />
            Get in touch
          </a>
        </motion.div>

        {/* socials */}
        {Array.isArray(SOCIAL) && SOCIAL.length > 0 && (
          <motion.div {...fade(0.42)} className="mt-12 flex items-center gap-7">
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
      </div>

      {/* scroll cue */}
      <button
        type="button"
        onClick={() => scrollTo('#about')}
        aria-label="Scroll down"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-muted/70 transition hover:text-accent"
        style={{ bottom: 'max(2rem, env(safe-area-inset-bottom))' }}
      >
        <ArrowDown size={20} className="animate-bounce" />
      </button>
    </section>
  )
}
