import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  Boxes, Cpu, FlaskConical, Github, Images, Layers, Orbit, Telescope, TreePine, UserRound,
} from 'lucide-react'
import { useLang } from '../context/LangContext'
import { LEGACY_ANCHORS } from '../routes'
import Gateway from '../components/Gateway'
import ProfileSummary from '../components/ProfileSummary'
import ExploreWheel, { type Destination } from '../components/ExploreWheel'
import GallerySection from '../components/GallerySection'
import WalkingAgent from '../components/WalkingAgent'
import DiscoveryPortal from '../components/DiscoveryPortal'

const DESTINATIONS: Destination[] = [
  { to: '/about',     title: 'About',              blurb: 'From caregiving to code — the story, the philosophy, the poems.', Icon: UserRound, tone: 'cyan' },
  { to: '/projects',  title: 'Projects',           blurb: 'Full-stack apps, AI agents and IoT builds, with live code.',     Icon: Boxes, tone: 'violet' },
  { to: '/stack',     title: 'Stack',              blurb: 'C#/.NET, React, Three.js and the architecture behind them.',     Icon: Layers, tone: 'emerald' },
  { to: '/lab',       title: 'Techno Science Lab', blurb: 'Algorithms, agentic AI, qubits and antimatter — interactive.',   Icon: FlaskConical, tone: 'amber' },
  { to: '/gallery',   title: 'Gallery',            blurb: 'Moments from the lab and life in Japan, season by season.',      Icon: Images, tone: 'rose' },
  { to: '/exploring', title: 'Exploring',          blurb: 'Curiosities, articles, travel chronicles and the visitor globe.', Icon: Telescope, tone: 'sky' },
  { to: 'https://vedin.myothant.dev', title: 'Vedin',   blurb: 'Vedic astrology platform — computed charts and readings.',       Icon: Orbit, tone: 'indigo' },
  { to: '/sanctuary', title: 'Sanctuary',          blurb: 'An immersive 3D world of farewell memories.',                     Icon: TreePine, tone: 'teal' },
  { to: '/github',    title: 'GitHub',             blurb: 'Open-source repositories, pulled live.',                          Icon: Github, tone: 'silver' },
]

/** "/" — hero, profile summary, then a directory into every dedicated page. */
export default function HomePage() {
  const { lang } = useLang()
  const { hash } = useLocation()
  const navigate = useNavigate()

  // Legacy single-page links (/#projects, /#quantum…) → their new pages.
  useEffect(() => {
    const target = LEGACY_ANCHORS[hash.slice(1)]
    if (target) navigate(target, { replace: true })
  }, [hash, navigate])

  return (
    <Gateway lang={lang}>
      <ProfileSummary lang={lang} />

      <section id="explore" className="relative py-20 sm:py-24" aria-labelledby="explore-title">
        <ExploreWheel
          items={DESTINATIONS}
          header={(
            <>
              <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
                <Cpu size={12} className="mr-2 inline -translate-y-px" aria-hidden />Navigate the system
              </p>
              <h2 id="explore-title" className="section-title mt-3">Explore</h2>
              <p className="section-subtitle !mb-6">Spin the wheel — every node opens its own page.</p>
            </>
          )}
        />
      </section>

      <GallerySection lang={lang} />
      <WalkingAgent lang={lang} />
      <DiscoveryPortal />
    </Gateway>
  )
}
