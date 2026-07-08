import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { applyTheme } from './hooks/useTheme'
import App from './App'
import PageShell from './components/PageShell'
import Seo from './components/Seo'
import PythonAutomation from './components/PythonAutomation'
import StudyingLibrary from './components/StudyingLibrary'
import Bibliography from './components/Bibliography'
import GalleryPage from './components/GalleryPage'
import GitHubProjects from './components/GitHubProjects'
import './index.css'

// Lazy: pulls in tsparticles — code-split out of the main bundle.
const Sanctuary = lazy(() => import('./components/Sanctuary'))
const SanctuaryAdmin = lazy(() => import('./components/SanctuaryAdmin'))
const FarewellRSVP = lazy(() => import('./components/FarewellRSVP'))

// Pin the hippie palette BEFORE React paints (single theme, no toggle).
// (CSP blocks inline <script> in index.html, so we do it here in a module.)
applyTheme('dark')

// BrowserRouter → clean, indexable URLs (myothant.dev/python, /sanctuary, …).
// basename = the deploy base (Vite's BASE_URL): '/' on the apex domain, '/Myweb/'
// on a GitHub-Pages project path. Trailing slash stripped per react-router's rule.
// NOTE: the server MUST rewrite unknown paths to index.html — see vercel.json.
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/'

// ── Legacy hash-link shim ─────────────────────────────────────────────────────
// Old links shared as myothant.dev/#/sanctuary should now land on /sanctuary.
// Runs ONCE, before render, so BrowserRouter reads the corrected path. Only
// "#/route" patterns are rewritten — homepage anchors like "#about" are left alone.
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '')
  const target = base + window.location.hash.slice(1) + window.location.search
  window.history.replaceState(null, '', target)
}

// #root is guaranteed by index.html; guard keeps TS strict-null happy without `!`.
const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('Root element #root not found in index.html')

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter basename={BASENAME}>
        <Routes>
          <Route path="/" element={<><Seo /><App /></>} />
          <Route path="/python" element={<><Seo title="Python Automation" path="/python" description="Python automation scripts and projects — practical tools, scrapers, and workflow automations by Myo Thant Naing." /><PageShell journeyHub="python"><PythonAutomation /></PageShell></>} />
          <Route path="/studying" element={<><Seo title="Studying Library" path="/studying" description="My self-taught Computer Science journey — notes, resources, and study tracks across CS, AI, and software engineering." /><PageShell journeyHub="studying"><StudyingLibrary /></PageShell></>} />
          <Route path="/bibliography" element={<><Seo title="Bibliography" path="/bibliography" description="Books, papers, and references that shaped my path from caregiving to coding and AI engineering." /><PageShell journeyHub="bibliography"><Bibliography /></PageShell></>} />
          <Route path="/github" element={<><Seo title="GitHub Projects" path="/github" description="Open-source projects by Myo Thant Naing — AI bots, IoT hardware, full-stack web apps, and Python automation scripts." /><PageShell><GitHubProjects /></PageShell></>} />
          <Route path="/gallery" element={<><Seo title="Gallery" path="/gallery" description="A visual gallery of moments, projects, and life in Japan — from the lab to the everyday." /><PageShell><GalleryPage /></PageShell></>} />
          {/* Sanctuary is full-screen immersive → no PageShell. */}
          <Route path="/sanctuary" element={<><Seo title="Memory Sanctuary" path="/sanctuary" description="An interactive 3D Studio-Ghibli-inspired world where colleagues leave farewell memories." /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#070b1c' }} />}><Sanctuary /></Suspense></>} />
          {/* private / admin → not indexed */}
          <Route path="/farewell" element={<><Seo title="Farewell RSVP" path="/farewell" noindex /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#070b1c' }} />}><FarewellRSVP /></Suspense></>} />
          <Route path="/sanctuary-admin" element={<><Seo title="Admin" path="/sanctuary-admin" noindex /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#0b0e1a' }} />}><SanctuaryAdmin /></Suspense></>} />
          {/* unknown paths fall back to the homepage (mode-aware), not indexed */}
          <Route path="*" element={<><Seo noindex /><App /></>} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)

// Fade out and remove the instant boot splash now that React has mounted, so
// mobile users see a spinner during the JS bootstrap instead of a blank screen.
const bootSplash = document.getElementById('boot-splash')
if (bootSplash) {
  requestAnimationFrame(() => {
    bootSplash.classList.add('bs-hide')
    window.setTimeout(() => bootSplash.remove(), 400)
  })
}
