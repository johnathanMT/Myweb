import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ImmersiveApp from './ImmersiveApp.jsx'
import PageShell from './components/PageShell.jsx'
import PythonAutomation from './components/PythonAutomation.jsx'
import StudyingLibrary from './components/StudyingLibrary.jsx'
import Bibliography from './components/Bibliography.jsx'
import GalleryPage from './components/GalleryPage.jsx'
import './index.css'

// Lazy: pulls in tsparticles — code-split out of the main bundle.
const Sanctuary = lazy(() => import('./components/Sanctuary.jsx'))
const SanctuaryAdmin = lazy(() => import('./components/SanctuaryAdmin.jsx'))
const FarewellRSVP = lazy(() => import('./components/FarewellRSVP.jsx'))

// ── TIERED EXPERIENCE SWITCH (single-repo, two Vercel deployments) ────────────
// One codebase, two builds chosen at BUILD time by an env var:
//   VITE_APP_MODE=immersive  → heavy WebGL build (immersive.myothant.dev)
//   (unset / anything else)  → lightweight Gateway Hub (myothant.dev)
// Vite inlines import.meta.env at build, so the unused app is tree-shaken out of
// each bundle — the Hub never ships three.js, the immersive build never ships a
// dead Hub.
// Tolerate stray whitespace / casing in the Vercel env value (e.g. "Immersive ").
const APP_MODE = (import.meta.env.VITE_APP_MODE || '').trim().toLowerCase()
const isImmersive = APP_MODE === 'immersive'
const Home = isImmersive ? ImmersiveApp : App

// DEBUG: prints in the browser console of the DEPLOYED site so you can confirm
// which build/branch actually ran. Remove once verified.
console.info('[boot] VITE_APP_MODE =', JSON.stringify(import.meta.env.VITE_APP_MODE),
  '→ rendering', isImmersive ? 'ImmersiveApp (3D)' : 'Hub')

// BrowserRouter → clean, indexable URLs (myothant.dev/python, /sanctuary, …).
// basename = the deploy base (Vite's BASE_URL): '/' on the apex domain, '/Myweb/'
// on a GitHub-Pages project path. Trailing slash stripped per react-router's rule.
// NOTE: the server MUST rewrite unknown paths to index.html — see vercel.json.
const BASENAME = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '') || '/'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/python"       element={<PageShell><PythonAutomation /></PageShell>} />
        <Route path="/studying"     element={<PageShell><StudyingLibrary /></PageShell>} />
        <Route path="/bibliography" element={<PageShell><Bibliography /></PageShell>} />
        <Route path="/gallery"      element={<PageShell><GalleryPage /></PageShell>} />
        {/* Sanctuary is full-screen immersive → no PageShell. */}
        <Route path="/sanctuary"    element={<Suspense fallback={<div style={{minHeight:'100vh',background:'#070b1c'}} />}><Sanctuary /></Suspense>} />
        <Route path="/farewell"     element={<Suspense fallback={<div style={{minHeight:'100vh',background:'#070b1c'}} />}><FarewellRSVP /></Suspense>} />
        <Route path="/sanctuary-admin" element={<Suspense fallback={<div style={{minHeight:'100vh',background:'#0b0e1a'}} />}><SanctuaryAdmin /></Suspense>} />
        {/* unknown paths fall back to the homepage (mode-aware) */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
