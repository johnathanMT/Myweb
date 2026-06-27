import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Orbit, Sparkles, Play, Pause, Volume2, VolumeX } from 'lucide-react'
import useIsMobile from '../hooks/useIsMobile'
import { PERSONAL, SOCIAL } from '../data/content'

/**
 * Gateway — cinematic "game-studio" hero with a full-bleed background video.
 *  • <video> background (-z-10) + dark overlay that blends into the page bg.
 *  • Elegant metallic name, cut-corner CTA buttons, video play/mute controls,
 *    and a subtle social row — AAA landing-page vibe.
 */

// Public assets → resolve on any base path (/, /Myweb/, custom domain).
const HERO_BG = `${import.meta.env.BASE_URL}mars_hero.webp`   // also the video poster
const HERO_VIDEO = `${import.meta.env.BASE_URL}mtn_mars.mp4`
const IMMERSIVE_URL = import.meta.env.VITE_IMMERSIVE_URL || 'https://immersive.myothant.dev'

function RecommendedBadge() {
  return (
    <span className="absolute -top-2.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 whitespace-nowrap bg-jade px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-950 shadow-[0_0_16px_rgba(38,200,132,0.6)]">
      <Sparkles size={11} /> Recommended
    </span>
  )
}

/**
 * Cut-corner, outlined CTA button (game-UI style). Renders <a> for an external
 * href, else a <button> for an in-page action.
 */
function TierButton({ icon: Icon, title, subtitle, accent, recommended, href, onClick }) {
  const Tag = href ? 'a' : 'button'
  const linkProps = href ? { href, rel: 'noopener' } : { type: 'button', onClick }
  return (
    <Tag
      {...linkProps}
      className="group relative flex w-full items-center justify-center gap-3 border border-white/25 bg-black/30 px-7 py-4 backdrop-blur-sm transition-all duration-300 hover:border-white/70 hover:bg-white/10 focus:outline-none focus-visible:border-jade sm:w-64"
      style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%)' }}
    >
      {recommended && <RecommendedBadge />}
      <Icon size={20} style={{ color: accent, filter: `drop-shadow(0 0 8px ${accent})` }} className="shrink-0 transition-transform group-hover:scale-110" />
      <span className="flex flex-col items-start leading-tight">
        <span className="text-sm font-bold uppercase tracking-wider text-white">{title}</span>
        <span className="text-[10px] uppercase tracking-wide text-gray-400">{subtitle}</span>
      </span>
    </Tag>
  )
}

export default function Gateway() {
  const isMobile = useIsMobile()
  const enterLite = () => document.querySelector('#about')?.scrollIntoView({ behavior: 'smooth' })

  // Background-video controls (play/pause + mute), like a AAA game site.
  const videoRef = useRef(null)
  const [paused, setPaused] = useState(false)
  const [muted, setMuted] = useState(true)
  const togglePlay = () => {
    const v = videoRef.current; if (!v) return
    if (v.paused) { v.play(); setPaused(false) } else { v.pause(); setPaused(true) }
  }
  const toggleMute = () => {
    const v = videoRef.current; if (!v) return
    v.muted = !v.muted; setMuted(v.muted)
  }

  return (
    <section id="home" className="relative flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#060607]">
      {/* ── Full-bleed background video (-z-10) ──
           muted + playsInline + autoPlay → autoplays on mobile; the poster image
           shows instantly while it buffers. pointer-events-none so it can't block
           the buttons. (No extra CSS poster layer — that would cover the video.) */}
      <video
        ref={videoRef}
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover"
        autoPlay loop muted playsInline preload="auto"
        poster={HERO_BG}
        aria-hidden="true"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* cinematic dark overlay → readability + blends into the page bg */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/70 via-black/40 to-[#0a0a0c]" aria-hidden />
      <div className="pointer-events-none absolute inset-0 -z-10" style={{ background: 'radial-gradient(120% 90% at 50% 35%, transparent 40%, rgba(0,0,0,0.6) 100%)' }} aria-hidden />

      {/* ── Foreground content (z-10) ── */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col items-center px-4 text-center"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <p className="mb-7 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.42em] text-white/55 sm:text-[11px]">
          <span className="h-px w-6 bg-jade/50 sm:w-10" /> Computer Science · AI · Software <span className="h-px w-6 bg-jade/50 sm:w-10" />
        </p>

        {/* Elegant cinematic metallic name */}
        <h1
          className="bg-gradient-to-b from-white via-zinc-200 to-zinc-400/90 bg-clip-text font-bold uppercase leading-[0.92] text-transparent text-[clamp(2.75rem,9vw,8rem)]"
          style={{ letterSpacing: '0.03em', filter: 'drop-shadow(0 2px 16px rgba(0,0,0,0.85)) drop-shadow(0 0 34px rgba(38,200,132,0.16))' }}
        >
          Myo Thant Naing
        </h1>

        <p className="mx-auto mt-7 max-w-xl text-[15px] leading-relaxed text-gray-300/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] sm:text-lg">
          {PERSONAL.tagline} — {PERSONAL.subtitle}
        </p>

        {/* Tier CTA buttons */}
        <div className="mx-auto mt-12 flex w-full max-w-xl flex-col items-stretch justify-center gap-4 sm:flex-row">
          <TierButton icon={Rocket} title="Lite Mode" subtitle="Fast & Clean" accent="#26c884" recommended={isMobile} onClick={enterLite} />
          <TierButton icon={Orbit} title="Immersive 3D" subtitle="Good GPU required" accent="#d63854" recommended={!isMobile} href={IMMERSIVE_URL} />
        </div>

        {/* social row (the "platform icons" analog) */}
        {Array.isArray(SOCIAL) && SOCIAL.length > 0 && (
          <div className="mt-9 flex items-center gap-5">
            {SOCIAL.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer" aria-label={s.label}
                className="text-white/45 transition-all duration-200 hover:scale-110 hover:text-jade">
                <i className={`${s.icon} text-lg`} />
              </a>
            ))}
          </div>
        )}
      </motion.div>

      {/* ── Video controls (bottom-left), AAA-site style ── */}
      <div className="absolute bottom-6 left-6 z-10 flex gap-2" style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}>
        <button type="button" onClick={togglePlay} aria-label={paused ? 'Play background video' : 'Pause background video'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur-md transition hover:border-white/50 hover:bg-black/60 hover:text-white">
          {paused ? <Play size={15} /> : <Pause size={15} />}
        </button>
        <button type="button" onClick={toggleMute} aria-label={muted ? 'Unmute background video' : 'Mute background video'}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white/80 backdrop-blur-md transition hover:border-white/50 hover:bg-black/60 hover:text-white">
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>
    </section>
  )
}
