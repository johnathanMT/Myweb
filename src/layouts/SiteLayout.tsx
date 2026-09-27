import { Suspense, useEffect, useState } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { SITE } from '../config/site'
import useTheme from '../hooks/useTheme'
import { useLang } from '../context/LangContext'
import AmbientBackground from '../components/AmbientBackground'
import TechDecor from '../components/TechDecor'
import Navbar from '../components/Navbar'
import Footer from '../components/MegaFooter'
import HudFrame from '../components/HudFrame'
import BootScreen from '../components/BootScreen'
import AiRobotDock from '../components/AiRobotDock'
import PageSkeleton from '../components/PageSkeleton'

/**
 * SiteLayout — the persistent chrome for every routed page.
 *
 * Background, Navbar, Footer and overlays mount ONCE; only the <Outlet> swaps.
 * That keeps navigation snappy (no re-painting the backdrop, no Navbar flicker)
 * and lets AnimatePresence cross-fade pages.
 *
 * z-index stack: backdrop (0) → main + footer (10) → HUD (40) → dock (45) → Navbar (50).
 */
export default function SiteLayout() {
  const { lang, setLang } = useLang()
  const { theme, toggle: toggleTheme } = useTheme()
  const { pathname } = useLocation()
  const reduceMotion = useReducedMotion()
  const isHome = pathname === '/'

  // Warm-up ping: wake the Render free-tier backend early. A normal CORS fetch —
  // 'no-cors' would be cancelled by the API's Cross-Origin-Resource-Policy.
  useEffect(() => {
    const t = setTimeout(() => { fetch(`${SITE.apiUrl}/health`, { cache: 'no-store' }).catch(() => {}) }, 0)
    return () => clearTimeout(t)
  }, [])

  // Only opacity + a small lift. framer-motion clears `transform` to `none` once
  // y settles at 0, so position:fixed modals inside pages keep working.
  const variants: Variants = reduceMotion
    ? { initial: { opacity: 0 }, enter: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 14 },
        enter: { opacity: 1, y: 0, transition: { duration: 0.32, ease: [0.22, 0.8, 0.24, 1] } },
        exit: { opacity: 0, y: -8, transition: { duration: 0.16, ease: [0.4, 0, 1, 1] } },
      }

  return (
    <div className="site-root relative min-h-screen overflow-x-hidden text-fg">
      <AmbientBackground />
      <TechDecor />

      <Navbar lang={lang} setLang={setLang} theme={theme} toggleTheme={toggleTheme} />

      <main
        className="relative z-10 min-h-screen"
        style={{
          // Home's hero is full-bleed under the glass navbar; other pages clear it.
          paddingTop: isHome ? undefined : 'calc(4rem + env(safe-area-inset-top, 0px))',
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={pathname} variants={variants} initial="initial" animate="enter" exit="exit">
            <PageScroll />
            <Suspense fallback={<PageSkeleton />}>
              <FrozenOutlet />
            </Suspense>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* --dock-space keeps the footer's last line clear of the floating dock */}
      <div className="relative z-10" style={{ paddingBottom: 'var(--dock-space)' }}>
        <Footer lang={lang} />
      </div>

      <AiRobotDock />

      <HudFrame />
      <BootScreen />
    </div>
  )
}

/** Holds the outlet it mounted with, so an exiting page doesn't morph into the next one. */
function FrozenOutlet() {
  const outlet = useOutlet()
  const [frozen] = useState(outlet)
  return frozen
}

/**
 * Per-page scroll: a fresh page starts at the top; a `#hash` scrolls to that
 * section (retrying while lazy chunks stream in). Ignores location changes that
 * arrive while this page is exiting.
 */
function PageScroll() {
  const { pathname, hash } = useLocation()
  const [ownPath] = useState(pathname)

  useEffect(() => {
    if (pathname !== ownPath) return
    if (!hash) { window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior }); return }

    let tries = 30
    let timer: ReturnType<typeof setTimeout>
    const seek = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      else if (tries-- > 0) timer = setTimeout(seek, 100)
    }
    seek()
    return () => clearTimeout(timer)
  }, [pathname, hash, ownPath])

  return null
}
