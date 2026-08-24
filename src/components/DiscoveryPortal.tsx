// DiscoveryPortal — a standalone, octagonal "portal" that links out to
// www.myothantnaing.com. Sits between the AI-agent promo and the footer.
// Matches the site's sci-fi / premium theme: accent + cyan neon, HUD brackets,
// mono typography, and a hover state that scales, brightens, and pulses so it
// reads as a live, interactive gateway.

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
      className="relative flex flex-col items-center overflow-hidden py-24 text-center"
    >
      {/* ambient accent glow behind the portal */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[460px] w-[460px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent)), transparent 70%)' }}
      />

      {/* eyebrow */}
      <span className="relative z-10 mb-10 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-accent-light">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-light" /> Discovery Portal
      </span>

      <a
        href={PORTAL_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enter the Discovery Portal — www.myothantnaing.com"
        className="group relative z-10 flex flex-col items-center outline-none"
      >
        <div className="relative h-64 w-64 md:h-72 md:w-72">
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
            {/* darkening + sheen so the label/vibe reads over any photo */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-60" />
            {/* "ENTER" pill fades in on hover */}
            <span className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-black/50 px-4 py-1 font-mono text-[10px] uppercase tracking-[0.35em] text-white/90 opacity-0 backdrop-blur-sm transition-all duration-500 group-hover:bottom-8 group-hover:opacity-100">
              Enter
            </span>
          </div>
        </div>

        {/* futuristic label */}
        <p className="mt-10 font-mono text-sm tracking-[0.18em] text-white/85 transition-colors duration-300 group-hover:text-accent-light md:text-base">
          <span className="text-accent-light group-hover:text-cyan">www.myothantnaing.com</span>
          <span className="mx-2 text-muted">—</span>
          A Journey of Discovery
        </p>
      </a>
    </section>
  )
}
