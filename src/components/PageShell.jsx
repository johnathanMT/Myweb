import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AmbientBackground from './AmbientBackground'
import Navbar from './Navbar'
import Footer from './MegaFooter'

/**
 * PageShell — shared layout for routed sub-pages (/python, /studying, …).
 * Provides the navbar, ambient background, footer, a "back to home" link,
 * and scrolls to top on mount. Keeps language state in sync via localStorage.
 */
export default function PageShell({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })
  useEffect(() => { try { localStorage.setItem('mtn_lang', lang) } catch { } }, [lang])
  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#141414] text-white">
      <AmbientBackground />
      <Navbar lang={lang} setLang={setLang} />
      <main className="relative z-10 pt-24">
        <div className="mx-auto max-w-6xl px-6 pt-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-accent-light">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
        {children}
      </main>
      <Footer />
    </div>
  )
}
