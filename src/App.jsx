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
        {/* Curved CRT hero — renders custom content inside the "screen" */}
        <CRTHero>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent-light">// portfolio · 2026</p>
          <h1 className="crt-chroma text-4xl font-black uppercase leading-none text-white sm:text-6xl lg:text-7xl">
            Myo Thant Naing
          </h1>
          <p className="max-w-md text-base text-gray-300 sm:text-lg">
            From <span className="text-accent-light">Caring</span> to{' '}
            <span className="text-coral">Coding</span> in Japan 🇯🇵 — IT Student, Caregiver,
            aspiring AI Engineer.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {['React', 'C# / .NET', 'AI', 'Kaigo Care', 'Japanese N3+'].map((b) => (
              <span key={b} className="rounded-full border border-white/15 bg-white/5 px-3 py-1 font-mono text-xs text-gray-300">
                {b}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <a href="#projects"
               onClick={(e)=>{e.preventDefault();document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'})}}
               className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-accent/30 hover:bg-accent-light">
              View My Work
            </a>
            <a href="#about"
               onClick={(e)=>{e.preventDefault();document.querySelector('#about')?.scrollIntoView({behavior:'smooth'})}}
               className="rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white hover:border-accent-light hover:text-accent-light">
              My Story
            </a>
          </div>
        </CRTHero>

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
