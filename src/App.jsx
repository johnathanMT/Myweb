import { useState, useEffect, lazy, Suspense } from 'react'
import AmbientBackground from './components/AmbientBackground'
import Navbar           from './components/Navbar'
import Gateway          from './components/Gateway'         // tiered-experience landing
import About            from './components/About'
import Philosophy       from './components/Philosophy'
import MarqueeGallery   from './components/MarqueeGallery' // hover-reveal project marquee
import ProjectsSection  from './components/ProjectsSection'
import TechStack        from './components/TechStack'         // Architecture & journey
import GallerySection    from './components/GallerySection'   // Memory Gallery (photos)
import VideoShowcase     from './components/VideoShowcase'     // auto-play highlight reel
import ArticlesSection  from './components/ArticlesSection'
import SeasonalGallery  from './components/SeasonalGallery'
import TravelChronicles from './components/TravelChronicles'
import Exploring        from './components/Exploring'
import AILineBot        from './components/AILineBot'      // "Talk to my AI agent" promo
import Footer           from './components/MegaFooter'   // SaaS-style mega footer
import CyberCursor      from './components/CyberCursor'     // custom crosshair cursor
import BootScreen       from './components/BootScreen'      // "System Booting…" loader
import HudFrame         from './components/HudFrame'        // HUD corner overlay

// Lazy-loaded: pulls in three.js (~heavy), so it's code-split out of the main
// Hub bundle and only fetched when this section is rendered.
const VisitorGlobe = lazy(() => import('./components/VisitorGlobe'))

// ── TIERED EXPERIENCE GATEWAY ────────────────────────────────────────────────
// This is the lightweight HUB domain: NO heavy three.js here, so it stays fast on
// low-end devices. The full WebGL scene (London / Pagoda / Osaka) is a separate
// build served from the immersive subdomain, reached via the Gateway button.
// The hub's "stunning but cheap" backdrop is the CSS galaxy + ambient layer.

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch {}
  }, [lang])

  return (
    // Content sits at z-10; the lightweight background layers at z-0.
    <div className="theme-batman relative min-h-screen bg-space text-white overflow-x-hidden">
      {/* Lightweight, GPU-friendly backdrop (no WebGL): Milky-Way gradient + stars. */}
      <div className="orbit-galaxy fixed inset-0 z-0" aria-hidden />
      <AmbientBackground />

      <Navbar lang={lang} setLang={setLang} />
      <main className="relative z-10">
        {/* Tiered-experience landing (neon name + Lite / Immersive choice) */}
        <Gateway />

        <About            lang={lang} />
        <Philosophy />
        <MarqueeGallery />
        <ProjectsSection  lang={lang} />
        <TechStack        lang={lang} />
        <GallerySection   lang={lang} />
        <VideoShowcase    lang={lang} />
        <Suspense fallback={<div className="py-24 text-center font-mono text-sm text-muted">Loading globe…</div>}>
          <VisitorGlobe   lang={lang} />
        </Suspense>
        <ArticlesSection />
        <SeasonalGallery lang={lang} />
        <TravelChronicles lang={lang} setLang={setLang} />
        <Exploring />
        <AILineBot        lang={lang} />
      </main>
      <div className="relative z-10"><Footer lang={lang} /></div>

      {/* ── Elite cyberpunk overlays (fixed, above everything) ── */}
      <HudFrame />
      <CyberCursor />
      <BootScreen />
    </div>
  )
}
