import { useState, useEffect } from 'react'
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
      </main>
      <Footer />
    </div>
  )
}
