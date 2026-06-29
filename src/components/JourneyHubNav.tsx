import { NavLink } from 'react-router-dom'
import { JOURNEY_HUB, type JourneyPage } from '../data/journeyHub'

/**
 * Pill navigation shared across /bibliography, /studying, and /python —
 * mirrors the legacy “Switch Project” bar from the static HTML pages.
 */
export default function JourneyHubNav({ active }: { active: JourneyPage }) {
  return (
    <nav
      aria-label="Journey hub"
      className="mx-auto mb-10 flex max-w-3xl flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur-md sm:gap-3 sm:px-5"
    >
      <span className="w-full text-center text-[11px] font-semibold uppercase tracking-[0.2em] text-muted sm:mr-1 sm:w-auto">
        Switch chapter
      </span>
      {JOURNEY_HUB.map((item) => {
        const Icon = item.icon
        const isActive = item.id === active
        return (
          <NavLink
            key={item.id}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            className={({ isActive: routeActive }) =>
              [
                'inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all',
                routeActive || isActive
                  ? 'border-white/25 bg-white/10 text-white shadow-lg'
                  : 'border-white/10 text-muted hover:border-white/20 hover:bg-white/[0.06] hover:text-white',
              ].join(' ')
            }
            style={isActive ? { boxShadow: `0 0 20px ${item.accent}33` } : undefined}
          >
            <Icon size={15} style={{ color: item.accent }} />
            {item.short}
          </NavLink>
        )
      })}
    </nav>
  )
}
