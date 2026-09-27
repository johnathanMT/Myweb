import { useEffect, useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { prefetchRoute } from '../routes'

/**
 * AiRobotDock — floating glass quick-jump bar pinned to the bottom of every
 * SiteLayout page. Each route gets its own minimalist robot avatar (inline SVG,
 * stroked in currentColor; eyes glow via `.bot-eye`). Styles live in index.css
 * under "AI ROBOT DOCK".
 *
 * Stays out of the way: it slides away while scrolling down and returns on
 * scroll-up, and SiteLayout reserves `--dock-space` below the footer so the
 * last content is never covered.
 */

export type RobotVariant = 'home' | 'about' | 'projects' | 'stack' | 'lab' | 'gallery' | 'exploring'

export interface DockItem { to: string; label: string; bot: RobotVariant }

export const DEFAULT_DOCK_ITEMS: DockItem[] = [
  { to: '/', label: 'Home', bot: 'home' },
  { to: '/about', label: 'About', bot: 'about' },
  { to: '/projects', label: 'Projects', bot: 'projects' },
  { to: '/stack', label: 'Stack', bot: 'stack' },
  { to: '/lab', label: 'Lab', bot: 'lab' },
  { to: '/gallery', label: 'Gallery', bot: 'gallery' },
  { to: '/exploring', label: 'Exploring', bot: 'exploring' },
]

/** Shared head + per-variant antenna, eyes and mouth on a 32×32 grid. */
export function RobotAvatar({ variant, size = 28 }: { variant: RobotVariant; size?: number }) {
  const parts: Record<RobotVariant, ReactNode> = {
    // classic bot: round eyes, flat smile, beacon antenna
    home: (
      <>
        <path d="M16 9V5" /><circle cx="16" cy="4" r="1.6" className="bot-eye" />
        <circle cx="12" cy="17" r="2" className="bot-eye" /><circle cx="20" cy="17" r="2" className="bot-eye" />
        <path d="M13 22h6" />
      </>
    ),
    // friendly bot: arched eyes, wide smile, twin ear bolts
    about: (
      <>
        <path d="M16 9V5.5" /><circle cx="16" cy="4.2" r="1.4" />
        <path d="M10.5 17.5q1.5-2.2 3 0M17.5 17.5q1.5-2.2 3 0" className="bot-eye-line" />
        <path d="M12 21.5q4 3 8 0" />
        <path d="M5 15v4M27 15v4" />
      </>
    ),
    // builder bot: visor band + wrench antenna
    projects: (
      <>
        <path d="M16 9V6M13.5 4.5a2.5 2.5 0 1 0 5 0" />
        <rect x="9.5" y="15" width="13" height="4" rx="2" className="bot-eye" />
        <path d="M12.5 23h7M14.5 23v-1M17.5 23v-1" />
      </>
    ),
    // server bot: rack slots for a face, two status LEDs
    stack: (
      <>
        <path d="M12 9V6h8v3" />
        <path d="M10 14h12M10 18h12M10 22h12" />
        <circle cx="21" cy="14" r="0.9" className="bot-eye" /><circle cx="21" cy="18" r="0.9" className="bot-eye" />
      </>
    ),
    // scientist bot: goggles + atom-orbit antenna
    lab: (
      <>
        <path d="M16 9V6.5" />
        <ellipse cx="16" cy="4" rx="4" ry="1.6" /><circle cx="16" cy="4" r="0.9" className="bot-eye" />
        <circle cx="12" cy="17" r="2.8" /><circle cx="20" cy="17" r="2.8" /><path d="M14.8 17h2.4" />
        <circle cx="12" cy="17" r="1.1" className="bot-eye" /><circle cx="20" cy="17" r="1.1" className="bot-eye" />
        <path d="M14 22.5h4" />
      </>
    ),
    // camera bot: one big lens eye, flash antenna
    gallery: (
      <>
        <path d="M16 9V6" /><rect x="13.5" y="3" width="5" height="3" rx="1" />
        <circle cx="16" cy="17" r="4.2" /><circle cx="16" cy="17" r="1.8" className="bot-eye" />
        <circle cx="22.5" cy="12.5" r="0.8" className="bot-eye" />
      </>
    ),
    // scout bot: radar-dish antenna, scanning eye slit
    exploring: (
      <>
        <path d="M16 9V6.5M12 5.5q4-4 8 0" /><circle cx="16" cy="5.8" r="0.9" className="bot-eye" />
        <path d="M10.5 17h11" className="bot-eye-line bot-scan" />
        <path d="M13 22h6" />
      </>
    ),
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="bot-svg"
    >
      {/* head shell (shared) */}
      <rect x="6" y="9" width="20" height="18" rx="6" className="bot-shell" />
      {parts[variant]}
    </svg>
  )
}

interface AiRobotDockProps {
  items?: DockItem[]
  /** Slide the dock away while the visitor scrolls down (default true). */
  autoHide?: boolean
}

export default function AiRobotDock({ items = DEFAULT_DOCK_ITEMS, autoHide = true }: AiRobotDockProps) {
  const { pathname } = useLocation()
  const [hidden, setHidden] = useState(false)

  // rAF-throttled direction tracking; always visible near the top and bottom.
  useEffect(() => {
    if (!autoHide) return
    let lastY = window.scrollY
    let ticking = false
    const update = () => {
      ticking = false
      const y = window.scrollY
      const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 120
      const delta = y - lastY
      if (Math.abs(delta) < 6 && !nearBottom) return
      setHidden(delta > 0 && y > 240 && !nearBottom)
      lastY = y
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [autoHide])

  // A new page always brings the dock back.
  useEffect(() => { setHidden(false) }, [pathname])

  return (
    <nav aria-label="Quick jump" className={`ai-dock ${hidden ? 'is-hidden' : ''}`} onFocus={() => setHidden(false)}>
      <ul className="ai-dock-bar">
        {items.map(({ to, label, bot }) => (
          <li key={to}>
            <NavLink
              to={to}
              end={to === '/'}
              aria-label={label}
              onClick={() => { if (to === pathname) window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              onMouseEnter={() => prefetchRoute(to)}
              onFocus={() => prefetchRoute(to)}
              onTouchStart={() => prefetchRoute(to)}
              className={({ isActive }) => `ai-dock-item ${isActive ? 'is-active' : ''}`}
            >
              <RobotAvatar variant={bot} />
              <span className="ai-dock-tip" aria-hidden="true">{label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
