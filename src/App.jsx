import { useState, useEffect, lazy, Suspense, Component } from 'react'
import AmbientBackground from './components/AmbientBackground'
import Navbar           from './components/Navbar'
import CRTHero          from './components/CRTHero'        // immersive curved-screen hero
import About            from './components/About'
import Philosophy       from './components/Philosophy'
import MarqueeGallery   from './components/MarqueeGallery' // hover-reveal project marquee
import ProjectsSection  from './components/ProjectsSection'
import ArticlesSection  from './components/ArticlesSection'
import SeasonalGallery  from './components/SeasonalGallery'
import TravelChronicles from './components/TravelChronicles'
import Exploring        from './components/Exploring'
import AILineBot        from './components/AILineBot'      // "Talk to my AI agent" promo
import Footer           from './components/Footer'
import CyberCursor      from './components/CyberCursor'     // custom crosshair cursor
import BootScreen       from './components/BootScreen'      // "System Booting…" loader
import HudFrame         from './components/HudFrame'        // HUD corner overlay

// Code-split the heavy three.js bundle so it never blocks first paint.
const CyberBackground = lazy(() => import('./three/CyberBackground'))

// If WebGL ever fails (context lost, driver crash, etc.), fall back to the
// static galaxy instead of blanking the whole page.
class CanvasBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch() {}
  render() {
    if (this.state.failed) return <div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />
    return this.props.children
  }
}

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch {}
  }, [lang])

  // Run the WebGL flythrough on phones AND laptops (the mobile performance tier
  // in NeonCity + the lower DPR in CyberBackground keep it smooth). Only fall
  // back to the static galaxy when the user asked for reduced motion or is in
  // data-saver mode. Decided once on mount.
  const [heavyOK, setHeavyOK] = useState(false)
  useEffect(() => {
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const saveData = navigator.connection?.saveData
    setHeavyOK(!reduce && !saveData)
  }, [])

  return (
    // Transparent base (dark fallback colour) so the fixed 3D layer shows through
    // wherever a section is transparent. Content sits at z-10, canvas at z-0.
    <div className="relative min-h-screen bg-[#05030c] text-white overflow-x-hidden">
      {heavyOK ? (
        <CanvasBoundary>
          <Suspense fallback={<div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />}>
            <CyberBackground />
          </Suspense>
        </CanvasBoundary>
      ) : (
        // Lightweight static fallback (no WebGL): the Milky-Way gradient + stars.
        <>
          <div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />
          <AmbientBackground />
        </>
      )}

      <Navbar lang={lang} setLang={setLang} />
      <main className="relative z-10">
        {/* Quantum / future-tech hero (self-contained) */}
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

      {/* ── Elite cyberpunk overlays (fixed, above everything) ── */}
      <HudFrame />
      <CyberCursor />
      <BootScreen />
    </div>
  )
}
