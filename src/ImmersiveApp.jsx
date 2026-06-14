import { useState, useEffect, lazy, Suspense, Component } from 'react'
import { ArrowLeft } from 'lucide-react'
import AmbientBackground from './components/AmbientBackground'
import Navbar           from './components/Navbar'
import CRTHero          from './components/CRTHero'        // immersive curved-screen hero
import About            from './components/About'
import Philosophy       from './components/Philosophy'
import MarqueeGallery   from './components/MarqueeGallery'
import ProjectsSection  from './components/ProjectsSection'
import ArticlesSection  from './components/ArticlesSection'
import SeasonalGallery  from './components/SeasonalGallery'
import TravelChronicles from './components/TravelChronicles'
import Exploring        from './components/Exploring'
import AILineBot        from './components/AILineBot'
import Footer           from './components/Footer'
import CyberCursor      from './components/CyberCursor'
import BootScreen       from './components/BootScreen'
import HudFrame         from './components/HudFrame'

// ── IMMERSIVE BUILD (VITE_APP_MODE=immersive) ────────────────────────────────
// The full WebGL experience served from immersive.myothant.dev. The heavy
// three.js bundle is code-split so it still never blocks first paint.
const CyberBackground = lazy(() => import('./three/CyberBackground'))

// Where the lightweight Hub lives (so users can return from the 3D build).
const HUB_URL = import.meta.env.VITE_SITE_URL || 'https://myothant.dev'

/** Sleek glassmorphism "Back to Hub" pill — floats top-left, never blocks the view. */
function BackToHub() {
  return (
    <a
      href={HUB_URL}
      aria-label="Back to the lightweight Hub"
      className="group fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-4 py-2 text-sm font-medium text-white/90 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 hover:-translate-x-0.5 hover:bg-white/[0.12] hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan/60"
      style={{ boxShadow: '0 0 18px -4px rgba(0,229,255,0.45)' }}
    >
      {/* faint top sheen → glass form, no hard border */}
      <span className="pointer-events-none absolute inset-x-3 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      <ArrowLeft size={16} className="text-cyan transition-transform duration-300 group-hover:-translate-x-0.5" />
      <span className="font-mono text-xs uppercase tracking-[0.2em]">Hub</span>
    </a>
  )
}

// If WebGL fails (context lost, driver crash, weak GPU), fall back to the static
// galaxy instead of blanking the page.
class CanvasBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() {}
  render() {
    if (this.state.failed) return <div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />
    return this.props.children
  }
}

export default function ImmersiveApp() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })
  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch {}
  }, [lang])

  // Run the WebGL flythrough unless the user asked for reduced motion or is in
  // data-saver mode — then show the lightweight galaxy instead. Decided on mount.
  const [heavyOK, setHeavyOK] = useState(false)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const saveData = navigator.connection?.saveData
    setHeavyOK(!reduce && !saveData)
  }, [])

  return (
    <div className="relative min-h-screen bg-[#05030c] text-white overflow-x-hidden">
      {heavyOK ? (
        <CanvasBoundary>
          <Suspense fallback={<div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />}>
            <CyberBackground />
          </Suspense>
        </CanvasBoundary>
      ) : (
        <>
          <div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />
          <AmbientBackground />
        </>
      )}

      {/* Return path to the lightweight Hub — completes the tiered UX flow. */}
      <BackToHub />

      <Navbar lang={lang} setLang={setLang} />
      <main className="relative z-10">
        <CRTHero />
        <About            lang={lang} />
        <Philosophy />
        <MarqueeGallery />
        <ProjectsSection  lang={lang} />
        <ArticlesSection />
        <SeasonalGallery />
        <TravelChronicles lang={lang} setLang={setLang} />
        <Exploring />
        <AILineBot        lang={lang} />
      </main>
      <div className="relative z-10"><Footer /></div>

      <HudFrame />
      <CyberCursor />
      <BootScreen />
    </div>
  )
}
