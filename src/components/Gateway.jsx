import { motion } from 'framer-motion'
import { Rocket, Orbit, Sparkles } from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'
import { PERSONAL } from '../data/content'

/**
 * Gateway — the "Tiered Experience" landing for the lightweight Hub domain.
 *
 *  • Full-bleed mars_hero.webp background (sci-fi astronaut + gold digital ground)
 *    with a dark gradient overlay so the foreground stays 100% readable.
 *  • Cyberpunk gradient name (gold → neon-orange, clipped to text, glowing).
 *  • Two glassmorphism tier buttons (Lite / Immersive) on a z-10 content layer.
 */

// Public assets → resolve on any base path (/, /Myweb/, custom domain).
// HERO_BG doubles as the video POSTER (instant image while the video buffers).
const HERO_BG = `${import.meta.env.BASE_URL}mars_hero.webp`
const HERO_VIDEO = `${import.meta.env.BASE_URL}mtn_mars.mp4`

// Configurable; override per-environment via Vite env without code changes.
const IMMERSIVE_URL = import.meta.env.VITE_IMMERSIVE_URL || 'https://immersive.myothant.dev'

function RecommendedBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-black shadow-[0_0_18px_rgba(255,170,40,0.7)]"
    >
      <Sparkles size={12} /> Recommended
    </motion.span>
  )
}

/**
 * One translucent glassmorphism tier button. Renders as <a> when `href` is given
 * (external redirect), otherwise a <button> (in-page action).
 */
function TierButton({ icon: Icon, title, subtitle, glow, recommended, href, onClick }) {
  const Tag = href ? 'a' : 'button'
  const linkProps = href ? { href, rel: 'noopener' } : { type: 'button', onClick }
  return (
    <Tag
      {...linkProps}
      className="group relative flex w-full flex-col items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-8 py-6 text-center shadow-[0_10px_45px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:border-white/25 hover:bg-black/55 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-300/60 sm:w-72"
    >
      {recommended && <RecommendedBadge />}
      {/* faint top-edge sheen → glass form */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {/* colour glow that blooms on hover */}
      <span
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(60% 80% at 50% 100%, ${glow}55, transparent 70%)` }}
      />
      <Icon size={30} style={{ color: glow, filter: `drop-shadow(0 0 10px ${glow})` }} />
      <span className="text-lg font-bold text-white">{title}</span>
      <span className="text-xs text-gray-300">{subtitle}</span>
    </Tag>
  )
}

export default function Gateway() {
  const isMobile = useIsMobile()
  const enterLite = () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section id="home" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#060607]">
      {/* ── 1. Full-bleed cinematic video background (-z-10) ──
           • Base color (#060607) + poster image show instantly while it buffers.
           • muted + playsInline + autoPlay → bypasses mobile autoplay blocking.
           • pointer-events-none so it never intercepts clicks on the buttons. */}
      <video
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster={HERO_BG}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
        {/* graceful fallback if <video> or the source can't play */}
      </video>
      {/* poster also as a CSS layer → covers the gap before the first video frame */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: `url("${HERO_BG}")` }}
        aria-hidden
      />

      {/* ── 1b. Cinematic dark overlay → readability + blends into the page bg ── */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0c]" aria-hidden />
      {/* extra vignette so edges sink into the page */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'radial-gradient(120% 90% at 50% 35%, transparent 40%, rgba(0,0,0,0.65) 100%)' }}
        aria-hidden
      />

      {/* ── 2. Foreground content (z-10) ── */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-300/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-amber-200 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-300" /> choose your experience
        </p>

        {/* Hero name — rich OLD-GOLD → RED → MAROON gradient fill, clipped to the
            glyphs, wrapped in a DARK-GREEN outline. paint-order:stroke fill paints
            the green stroke first, then the gradient fill on top → a clean outer
            green contour around luminous gold-red-maroon letters. */}
        <h1
          className="bg-gradient-to-br from-[#e6c25c] via-[#b51f2e] to-[#5c1620] bg-clip-text text-transparent text-5xl font-black uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-[7.5rem]"
          style={{
            WebkitTextStroke: 'clamp(1.4px, 0.4vw, 3px) #163d24',   /* deep dark green outline */
            paintOrder: 'stroke fill',
            filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.9)) drop-shadow(0 0 16px rgba(184,134,11,0.32))',
          }}
        >
          MYO THANT NAING
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-base text-gray-200 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-lg">
          {PERSONAL.tagline} — {PERSONAL.subtitle}
        </p>

        {/* Tier buttons */}
        <div className="mx-auto mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-4 sm:flex-row">
          <TierButton
            icon={Rocket}
            title="Lite Mode"
            subtitle="Fast & Clean (Optimized)"
            glow="#f0b429"
            recommended={isMobile}
            onClick={enterLite}
          />
          <TierButton
            icon={Orbit}
            title="Immersive 3D Mode"
            subtitle="High Performance (Good GPU Required)"
            glow="#ff7a18"
            recommended={!isMobile}
            href={IMMERSIVE_URL}
          />
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
          {isMobile ? 'Lite recommended for your device' : 'Your GPU can handle the full experience'}
        </p>
      </motion.div>
    </section>
  )
}
