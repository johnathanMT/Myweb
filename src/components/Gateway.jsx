import { motion } from 'framer-motion'
import { Rocket, Orbit, Sparkles } from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'
import { PERSONAL } from '../data/content'
import '../crt.css'

/**
 * Gateway — the "Tiered Experience" landing for the lightweight Hub domain.
 *
 *  • Vivid neon name (effects live on .q-name in crt.css).
 *  • Two glassmorphism tier buttons:
 *      – Lite Mode      → scrolls into the fast 2D/glass sections on this page.
 *      – Immersive 3D   → redirects to the heavy WebGL build on its subdomain.
 *  • A "Recommended" badge floats over the device-appropriate option
 *    (mobile → Lite, desktop → Immersive). It NEVER auto-redirects — the user
 *    always chooses.
 */

// Configurable; override per-environment via Vite env without code changes.
const IMMERSIVE_URL = import.meta.env.VITE_IMMERSIVE_URL || 'https://immersive.myothant.dev'

function RecommendedBadge() {
  return (
    <motion.span
      initial={{ opacity: 0, y: -6, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 18 }}
      className="absolute -top-3 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap rounded-full bg-gradient-to-r from-[#00e5ff] to-[#ff3df0] px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-[#04121a] shadow-[0_0_18px_rgba(0,229,255,0.7)]"
    >
      <Sparkles size={12} /> Recommended
    </motion.span>
  )
}

/**
 * One translucent, borderless glassmorphism tier button. Renders as <a> when
 * `href` is given (external redirect), otherwise a <button> (in-page action).
 */
function TierButton({ icon: Icon, title, subtitle, glow, recommended, href, onClick }) {
  const Tag = href ? 'a' : 'button'
  const linkProps = href ? { href, rel: 'noopener' } : { type: 'button', onClick }
  return (
    <Tag
      {...linkProps}
      className="group relative flex w-full flex-col items-center gap-2 rounded-2xl bg-white/[0.06] px-8 py-6 text-center shadow-[0_10px_45px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.1] focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60 sm:w-72"
      style={{ boxShadow: `0 10px 45px -15px rgba(0,0,0,0.7)` }}
    >
      {recommended && <RecommendedBadge />}
      {/* faint top-edge sheen → glass form without a hard border */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
      {/* colour glow that blooms on hover */}
      <span
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(60% 80% at 50% 100%, ${glow}44, transparent 70%)` }}
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
    <section id="home" className="q-stage">
      {/* backdrops */}
      <div className="q-grid" />
      <div className="q-sweep" />

      <motion.div
        className="q-panel"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" /> choose your experience
        </p>

        {/* Vivid neon name */}
        <span className="q-name-wrap block">
          <h1 className="q-name" data-text="MYO THANT NAING">MYO THANT NAING</h1>
        </span>

        <p className="mx-auto mt-5 max-w-xl text-base text-gray-300 sm:text-lg">
          {PERSONAL.tagline} — {PERSONAL.subtitle}
        </p>

        {/* Tier buttons */}
        <div className="mx-auto mt-10 flex w-full max-w-xl flex-col items-stretch justify-center gap-4 sm:flex-row">
          <TierButton
            icon={Rocket}
            title="🚀 Lite Mode"
            subtitle="Fast & Clean (Optimized)"
            glow="#00e5ff"
            recommended={isMobile}
            onClick={enterLite}
          />
          <TierButton
            icon={Orbit}
            title="🌌 Immersive 3D Mode"
            subtitle="High Performance (Good GPU Required)"
            glow="#ff3df0"
            recommended={!isMobile}
            href={IMMERSIVE_URL}
          />
        </div>

        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-white/40">
          {isMobile ? 'Lite recommended for your device' : 'Your GPU can handle the full experience'}
        </p>
      </motion.div>
    </section>
  )
}
