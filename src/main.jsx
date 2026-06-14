import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ImmersiveApp from './ImmersiveApp.jsx'
import PageShell from './components/PageShell.jsx'
import PythonAutomation from './components/PythonAutomation.jsx'
import StudyingLibrary from './components/StudyingLibrary.jsx'
import Bibliography from './components/Bibliography.jsx'
import './index.css'

// ── TIERED EXPERIENCE SWITCH (single-repo, two Vercel deployments) ────────────
// One codebase, two builds chosen at BUILD time by an env var:
//   VITE_APP_MODE=immersive  → heavy WebGL build (immersive.myothant.dev)
//   (unset / anything else)  → lightweight Gateway Hub (myothant.dev)
// Vite inlines import.meta.env at build, so the unused app is tree-shaken out of
// each bundle — the Hub never ships three.js, the immersive build never ships a
// dead Hub.
const Home = import.meta.env.VITE_APP_MODE === 'immersive' ? ImmersiveApp : App

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
        {/* unknown paths fall back to the homepage (mode-aware) */}
        <Route path="*" element={<Home />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
