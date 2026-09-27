import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { JourneyPage } from '../data/journeyHub'
import JourneyHubNav from './JourneyHubNav'

/**
 * PageShell — content header for the long-form sub-pages (/python, /studying,
 * /bibliography, /github). The site chrome (background, Navbar, Footer, page
 * transition) now lives in SiteLayout, so this only adds the back link and the
 * optional Journey cross-navigation.
 */
export default function PageShell({
  children,
  journeyHub,
}: {
  children: ReactNode
  journeyHub?: JourneyPage
}) {
  return (
    <>
      <div className="mx-auto max-w-6xl px-4 pt-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60"
        >
          <ArrowLeft size={15} aria-hidden />
          <span>Back to home</span>
        </Link>
      </div>

      {journeyHub && (
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <JourneyHubNav active={journeyHub} />
        </div>
      )}

      {children}
    </>
  )
}
