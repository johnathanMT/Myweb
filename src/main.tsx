import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { getInitialTheme, applyTheme } from './hooks/useTheme'
import { LangProvider } from './context/LangContext'
import SiteLayout from './layouts/SiteLayout'
import PageShell from './components/PageShell'
import Seo from './components/Seo'
import HomePage from './pages/HomePage'
import NotFoundPage from './pages/NotFoundPage'
import {
  AboutPage, ProjectsPage, StackPage, LabPage, GalleryRoute, ExploringPage,
  PythonAutomation, StudyingLibrary, Bibliography, GitHubProjects, Sanctuary,
} from './routes'
import './index.css'

// Full-screen immersive worlds — rendered OUTSIDE SiteLayout (no Navbar/Footer).
const Remembrance = lazy(() => import('./components/Remembrance'))
const SanctuaryAdmin = lazy(() => import('./components/SanctuaryAdmin'))
const FarewellRSVP = lazy(() => import('./components/FarewellRSVP'))
// NOTE: the Vedin / Jyotish astrology app now lives in its own repository:
// https://vedin.myothant.dev
// Its routes (/jyotish, /research, /algorithms, /vedin-admin) and all its
// components have been removed from this portfolio to cut bundle size.

// Set the theme attribute BEFORE React paints, so there's no light/dark flash.
// (CSP blocks inline <script> in index.html, so we do it here in a module.)
applyTheme(getInitialTheme())

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
      <LangProvider>
      <BrowserRouter basename={BASENAME}>
        <Routes>
          {/* ── Multi-page site: every page shares the persistent SiteLayout ── */}
          <Route element={<SiteLayout />}>
            <Route index element={<><Seo /><HomePage /></>} />
            <Route path="about" element={<><Seo title="About" path="/about" description="The story of Myo Thant Naing — from caregiving in Japan to Computer Science, software engineering and AI." /><AboutPage /></>} />
            <Route path="projects" element={<><Seo title="Projects" path="/projects" description="Featured projects — full-stack web apps, agentic AI, IoT builds and live code walkthroughs." /><ProjectsPage /></>} />
            <Route path="stack" element={<><Seo title="Tech Stack" path="/stack" description="The architecture and tools I build with — C#/.NET, React, TypeScript, Three.js, Python and more." /><StackPage /></>} />
            <Route path="lab" element={<><Seo title="Techno Science Lab" path="/lab" description="Interactive computer-science simulations — sorting, pathfinding, agentic AI workflows, quantum circuits and antimatter." /><LabPage /></>} />
            <Route path="gallery" element={<><Seo title="Gallery" path="/gallery" description="A visual gallery of moments, projects, and life in Japan — from the lab to the everyday." /><GalleryRoute /></>} />
            <Route path="exploring" element={<><Seo title="Exploring" path="/exploring" description="Curiosities, articles, travel chronicles and a live visitor globe." /><ExploringPage /></>} />
            <Route path="python" element={<><Seo title="Python Automation" path="/python" description="Python automation scripts and projects — practical tools, scrapers, and workflow automations by Myo Thant Naing." /><PageShell journeyHub="python"><PythonAutomation /></PageShell></>} />
            <Route path="studying" element={<><Seo title="Studying Library" path="/studying" description="My self-taught Computer Science journey — notes, resources, and study tracks across CS, AI, and software engineering." /><PageShell journeyHub="studying"><StudyingLibrary /></PageShell></>} />
            <Route path="bibliography" element={<><Seo title="Bibliography" path="/bibliography" description="Books, papers, and references that shaped my path from caregiving to coding and AI engineering." /><PageShell journeyHub="bibliography"><Bibliography /></PageShell></>} />
            <Route path="github" element={<><Seo title="GitHub Projects" path="/github" description="Open-source projects by Myo Thant Naing — AI bots, IoT hardware, full-stack web apps, and Python automation scripts." /><PageShell><GitHubProjects /></PageShell></>} />
            {/* unknown paths → on-brand 404 inside the chrome, not indexed */}
            <Route path="*" element={<><Seo noindex /><NotFoundPage /></>} />
          </Route>

          {/* Sanctuary is full-screen immersive → no SiteLayout. */}
          <Route path="/sanctuary" element={<><Seo title="Memory Sanctuary" path="/sanctuary" description="An interactive 3D Studio-Ghibli-inspired world where colleagues leave farewell memories." /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#04091A' }} />}><Sanctuary /></Suspense></>} />
          <Route path="/remembrance" element={<><Seo title="In Loving Memory" path="/remembrance" description="A serene 3D sunset memorial honouring a beloved aerospace engineer and mentor." noindex /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#1a1024' }} />}><Remembrance /></Suspense></>} />
          {/* private / admin → not indexed */}
          <Route path="/farewell" element={<><Seo title="Farewell RSVP" path="/farewell" noindex /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#04091A' }} />}><FarewellRSVP /></Suspense></>} />
          <Route path="/sanctuary-admin" element={<><Seo title="Admin" path="/sanctuary-admin" noindex /><Suspense fallback={<div style={{ minHeight: '100vh', background: '#04091A' }} />}><SanctuaryAdmin /></Suspense></>} />
        </Routes>
      </BrowserRouter>
      </LangProvider>
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
