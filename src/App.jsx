import { useState, useEffect } from 'react'
import AmbientBackground from './components/AmbientBackground'
import Navbar           from './components/Navbar'
import Gateway          from './components/Gateway'         // tiered-experience landing
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
    <div className="relative min-h-screen bg-[#05030c] text-white overflow-x-hidden">
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
