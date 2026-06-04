import { useState, useEffect } from 'react'
import Navbar          from './components/Navbar'
import Hero            from './components/Hero'
import About           from './components/About'
import Philosophy      from './components/Philosophy'
import Projects        from './components/Projects'
import SeasonalGallery from './components/SeasonalGallery'
import TravelChronicles from './components/TravelChronicles'
import Exploring       from './components/Exploring'
import Footer          from './components/Footer'

export default function App() {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch {}
  }, [lang])

  return (
    <div className="relative min-h-screen bg-space text-white overflow-x-hidden">
      <Navbar lang={lang} setLang={setLang} />

      <main>
        <Hero            lang={lang} />
        <About           lang={lang} />
        <Philosophy />
        <Projects        lang={lang} />
        <SeasonalGallery />
        <TravelChronicles />
        <Exploring />
      </main>

      <Footer />
    </div>
  )
}
