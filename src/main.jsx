import React, { lazy, Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
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

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter works on GitHub Pages with no 404.html redirect needed.
        Routes are /Myweb/#/python, /Myweb/#/studying, /Myweb/#/bibliography */}
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/python"       element={<PageShell><PythonAutomation /></PageShell>} />
        <Route path="/studying"     element={<PageShell><StudyingLibrary /></PageShell>} />
        <Route path="/bibliography" element={<PageShell><Bibliography /></PageShell>} />
        <Route path="/gallery"      element={<PageShell><GalleryPage /></PageShell>} />
        {/* Sanctuary is full-screen immersive → no PageShell. */}
        <Route path="/sanctuary"    element={<Suspense fallback={<div style={{minHeight:'100vh',background:'#070b1c'}} />}><Sanctuary /></Suspense>} />
        {/* unknown paths fall back to the homepage (mode-aware) */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
