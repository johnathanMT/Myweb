import { useState, useEffect } from 'react'
import AmbientBackground from './components/AmbientBackground'
import Navbar           from './components/Navbar'
import Hero             from './components/Hero'
import About            from './components/About'
import Philosophy       from './components/Philosophy'
import ProjectsSection  from './components/ProjectsSection'   // upgraded sleek cards
import ArticlesSection  from './components/ArticlesSection'   // API-driven blog cards
import SeasonalGallery  from './components/SeasonalGallery'
import TravelChronicles from './components/TravelChronicles'
import Exploring        from './components/Exploring'
import Footer           from './components/Footer'

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch {}
  }, [lang])

  return (
    <div className="relative min-h-screen bg-[#07070f] text-white overflow-x-hidden">
      {/* dim cyberpunk ambient glows behind everything */}
      <AmbientBackground />

      <Navbar lang={lang} setLang={setLang} />
      <main className="relative z-10">
        <Hero             lang={lang} />
        <About            lang={lang} />
        <Philosophy />
        <ProjectsSection  lang={lang} />
        <ArticlesSection />
        <SeasonalGallery />
        <TravelChronicles lang={lang} setLang={setLang} />
        <Exploring />
      </main>
      <Footer />
    </div>
  )
}
