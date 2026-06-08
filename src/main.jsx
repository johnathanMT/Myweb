import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import PageShell from './components/PageShell.jsx'
import PythonAutomation from './components/PythonAutomation.jsx'
import StudyingLibrary from './components/StudyingLibrary.jsx'
import Bibliography from './components/Bibliography.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* HashRouter works on GitHub Pages with no 404.html redirect needed.
        Routes are /Myweb/#/python, /Myweb/#/studying, /Myweb/#/bibliography */}
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/python"       element={<PageShell><PythonAutomation /></PageShell>} />
        <Route path="/studying"     element={<PageShell><StudyingLibrary /></PageShell>} />
        <Route path="/bibliography" element={<PageShell><Bibliography /></PageShell>} />
        {/* unknown paths fall back to the homepage */}
        <Route path="*" element={<App />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
)
