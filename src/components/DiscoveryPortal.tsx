// DiscoveryPortal — a standalone, octagonal "portal" that links out to
// www.myothantnaing.com. Sits between the AI-agent promo and the footer.
// Two-column on desktop (copy left, octagon right); stacks on mobile with a
// smaller portal. The whole block is one cohesive link, with the site's sci-fi /
// premium theme: accent + cyan neon, HUD vibe, mono type, and a hover state that
// scales, brightens, and pulses so it reads as a live, interactive gateway.

// Perfect octagon (same polygon for the neon ring and the image mask).
const OCTAGON =
  'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)'

const PORTAL_URL = 'https://www.myothantnaing.com'
const PORTAL_IMG =
  'https://res.cloudinary.com/dhlhzmmtt/image/upload/v1787551393/IMG_3878_copy_num8bp.jpg'

export default function DiscoveryPortal() {
  return (
    <section
      id="discovery-portal"
      className="relative overflow-hidden py-24"
    >
      {/* ambient accent glow behind the portal */}
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/2 h-[460px] w-[460px] -translate-y-1/2 translate-x-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)), transparent 70%)' }}
      />

      <a
        href={PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enter the Discovery Portal — A Journey of Discovery at www.myothantnaing.com"
        className="group section-container relative z-10 flex flex-col-reverse items-center gap-10 outline-none md:flex-row md:justify-between md:gap-14"
      >
        {/* ── Left: copy ── */}
        <div className="max-w-md text-center md:text-left">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-accent-light">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-light" /> Discovery Portal
          </span>

          <h2 className="text-3xl font-bold leading-tight md:text-4xl">
            <span className="bg-gradient-to-r from-white via-accent-light to-cyan bg-clip-text text-transparent">
              A Journey of Discovery
            </span>
          </h2>

          <p className="mt-4 text-base leading-relaxed text-gray-300">
            Step into my universe — a visual storytelling experience bridging technology, art,
            and personal adventures. Cross the threshold and explore beyond the portfolio.
          </p>

          <span className="mt-7 inline-flex items-center gap-2 font-mono text-sm uppercase tracking-[0.2em] text-accent-light transition-colors duration-300 group-hover:text-cyan">
            Enter the Portal
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>

        {/* ── Right: octagon portal (smaller, balanced against the copy) ── */}
        <div className="relative h-52 w-52 shrink-0 md:h-60 md:w-60">
          {/* pulsing neon ring (blurred octagon bleeding past the clipped edge) */}
          <div
            aria-hidden
            className="absolute -inset-[4px] animate-pulse bg-gradient-to-br from-accent via-cyan to-accent opacity-70 blur-[3px] transition-all duration-500 group-hover:opacity-100 group-hover:blur-[6px]"
            style={{ clipPath: OCTAGON }}
          />
          {/* rotating conic halo, revealed on hover for extra depth */}
          <div
            aria-hidden
            className="absolute -inset-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-80"
            style={{
              clipPath: OCTAGON,
              background:
                'conic-gradient(from 0deg, rgb(var(--accent)), #22d3ee, #ff1e3c, rgb(var(--accent)))',
            }}
          />

          {/* the portal image, masked to the octagon */}
          <div
            className="absolute inset-0 overflow-hidden ring-1 ring-white/10"
            style={{ clipPath: OCTAGON }}
          >
            <img
              src={PORTAL_IMG}
              alt="A journey of discovery"
              loading="lazy"
              decoding="async"
              className="h-full w-full scale-105 object-cover transition-transform duration-700 ease-out group-hover:scale-125"
            />
            {/* darkening + sheen so the vibe reads over any photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-60" />
            {/* "ENTER" pill fades in on hover */}
            <span className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.35em] text-white/90 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:bottom-7 group-hover:opacity-100">
              Enter
            </span>
          </div>
        </div>
      </a>
    </section>
  )
}
