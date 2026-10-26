import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  ArrowUpRight, Boxes, Cpu, FlaskConical, Github, Images, Layers, Sparkles, Telescope, TreePine, UserRound,
  type LucideIcon,
} from 'lucide-react'
import { useLang } from '../context/LangContext'
import { LEGACY_ANCHORS, prefetchRoute } from '../routes'
import Gateway from '../components/Gateway'
import ProfileSummary from '../components/ProfileSummary'
import GallerySection from '../components/GallerySection'
import AILineBot from '../components/AILineBot'
import DiscoveryPortal from '../components/DiscoveryPortal'
import CaseStudiesGrid from '../components/CaseStudiesGrid'
import HireMePanel from '../components/HireMePanel'
import { exitRecruiterMode, isRecruiterMode } from '../lib/recruiterMode'

interface Destination { to: string; title: string; blurb: string; Icon: LucideIcon }

const DESTINATIONS: Destination[] = [
  { to: '/about',     title: 'About',              blurb: 'From caregiving to code — the story, the philosophy, the poems.', Icon: UserRound },
  { to: '/projects',  title: 'Projects',           blurb: 'Full-stack apps, AI agents and IoT builds, with live code.',     Icon: Boxes },
  { to: '/stack',     title: 'Stack',              blurb: 'C#/.NET, React, Three.js and the architecture behind them.',     Icon: Layers },
  { to: '/lab',       title: 'Techno Science Lab', blurb: 'Algorithms, agentic AI, qubits and antimatter — interactive.',   Icon: FlaskConical },
  { to: '/gallery',   title: 'Gallery',            blurb: 'Moments from the lab and life in Japan, season by season.',      Icon: Images },
  { to: '/exploring', title: 'Exploring',          blurb: 'Curiosities, articles, travel chronicles and the visitor globe.', Icon: Telescope },
  { to: '/github',    title: 'GitHub',             blurb: 'Open-source repositories, pulled live.',                          Icon: Github },
  { to: '/sanctuary', title: 'Sanctuary',          blurb: 'An immersive 3D world of farewell memories.',                     Icon: TreePine },
]

/** "/" — hero, profile summary, then a directory into every dedicated page (or the recruiter fast track). */
export default function HomePage() {
  const { lang } = useLang()
  const { hash } = useLocation()
  const navigate = useNavigate()
  const [recruiter, setRecruiter] = useState(isRecruiterMode)

  // Legacy single-page links (/#projects, /#quantum…) → their new pages.
  useEffect(() => {
    const target = LEGACY_ANCHORS[hash.slice(1)]
    if (target) navigate(target, { replace: true })
  }, [hash, navigate])

  // Recruiter fast track: no warp intro, no battle scene — just the facts.
  if (recruiter) {
    return (
      <div style={{ paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))' }}>
        <ProfileSummary lang={lang} />
        <CaseStudiesGrid />
        <HireMePanel />
        <p className="pb-16 text-center">
          <button
            type="button"
            onClick={() => { exitRecruiterMode(); setRecruiter(false); navigate('/', { replace: true }) }}
            className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent-light"
          >
            <Sparkles size={14} aria-hidden /> View the full interactive experience
          </button>
        </p>
      </div>
    )
  }

  return (
    <>
      <Gateway />
      <ProfileSummary lang={lang} />

      <section id="explore" className="relative py-20 sm:py-24" aria-labelledby="explore-title">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
            <Cpu size={12} className="mr-2 inline -translate-y-px" aria-hidden />Navigate the system
          </p>
          <h2 id="explore-title" className="section-title mt-3">Explore</h2>
          <p className="section-subtitle">Each area now has its own page — pick a node.</p>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {DESTINATIONS.map(({ to, title, blurb, Icon }) => (
              <li key={to}>
                <Link
                  to={to}
                  onMouseEnter={() => prefetchRoute(to)}
                  onFocus={() => prefetchRoute(to)}
                  className="glass-card group flex h-full flex-col gap-3 p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                >
                  <span className="flex items-center justify-between">
                    <span className="icon-chip"><Icon size={18} aria-hidden /></span>
                    <ArrowUpRight size={16} className="text-muted transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent-light" aria-hidden />
                  </span>
                  <span className="font-groovy text-sm font-semibold tracking-wide text-fg">{title}</span>
                  <span className="text-sm leading-relaxed text-muted">{blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <GallerySection lang={lang} />
      <AILineBot lang={lang} />
      <DiscoveryPortal />
    </>
  )
}
