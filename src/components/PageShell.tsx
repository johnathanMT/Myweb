import { useEffect, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import useTheme from '../hooks/useTheme'
import type { JourneyPage } from '../data/journeyHub'
import AmbientBackground from './AmbientBackground'
import JourneyHubNav from './JourneyHubNav'
import Navbar from './Navbar'
import Footer from './MegaFooter'

/**
 * PageShell — shared layout for routed sub-pages (/python, /studying, …).
 * Provides the navbar, ambient background, footer, a "back to home" link,
 * and scrolls to top on mount. Keeps language state in sync via localStorage.
 * Pass `journeyHub` to show cross-navigation between Bibliography, Studying, Python.
 */
export default function PageShell({
  children,
  journeyHub,
}: {
  children: ReactNode
  journeyHub?: JourneyPage
}) {
  const [lang, setLang] = useState<string>(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })
  const { theme, toggle: toggleTheme } = useTheme()
  useEffect(() => { try { localStorage.setItem('mtn_lang', lang) } catch { /* ignore */ } }, [lang])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#141414] text-white">
      <AmbientBackground />
      <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />
      <main className="relative z-10 pt-24">
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent-light">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
        {journeyHub && (
          <div className="mx-auto max-w-6xl px-6 pt-6">
            <JourneyHubNav active={journeyHub} />
          </div>
        )}
        {children}
      </main>
      <Footer />
    </div>
  )
}
