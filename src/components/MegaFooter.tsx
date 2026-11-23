import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PERSONAL } from '../data/content'
import { ACCESS, FOOTER_T, NAV } from '../data/footerData'
import { prefetchRoute } from '../routes'

// footerData is plain JS; these mirror its shapes.
interface FooterLink { key?: string; label?: string; to?: string; href?: string }
const COPY = FOOTER_T as Record<string, Record<string, string>>

const tokyoTime = () =>
  new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tokyo', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date())

/** Own component, so only the clock re-renders. */
function TokyoClock({ city }: { city: string }) {
  const [time, setTime] = useState(tokyoTime)
  useEffect(() => {
    const id = setInterval(() => setTime(tokyoTime()), 5000)
    return () => clearInterval(id)
  }, [])

  return (
    <p className="mt-6 flex items-center gap-2.5 font-mono text-xs tracking-wider text-muted">
      <span className="relative flex h-1.5 w-1.5" aria-hidden>
        <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-50 motion-safe:animate-ping [animation-duration:2.8s]" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-500" />
      </span>
      <span className="tabular-nums">{city} · {time} JST</span>
    </p>
  )
}

/** Site footer, shared by every SiteLayout page. Content lives in data/footerData.js. */
export default function MegaFooter({ lang = 'en' }: { lang?: string }) {
  const t = { ...COPY.en, ...COPY[lang] }

  const item = ({ key, label, to, href }: FooterLink) => {
    const text = label ?? t[key ?? '']
    const cls = 'inline-block py-1 site-footer-link text-sm'
    if (to) return <Link to={to} className={cls} onMouseEnter={() => prefetchRoute(to)} onFocus={() => prefetchRoute(to)}>{text}</Link>
    const web = href?.startsWith('http')
    return <a href={href} className={cls} {...(web ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>{text}</a>
  }
  const column = (title: string, links: FooterLink[]) => (
    <nav aria-label={title}>
      <h2 className="mb-4 text-sm font-semibold text-fg">{title}</h2>
      <ul className="space-y-1.5">
        {links.map((l) => <li key={l.key ?? l.label}>{item(l)}</li>)}
      </ul>
    </nav>
  )

  // .site-footer (index.css) sets its own surface and re-scopes --fg / --muted for it
  return (
    <footer className="site-footer relative z-10">
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 sm:px-6 lg:pt-24">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.8fr_1fr_1fr] lg:gap-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="text-xl font-semibold tracking-tight text-fg">{PERSONAL.handle}</Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted">{t.position}</p>
            <TokyoClock city={t.city} />
          </div>
          {column(t.navTitle, NAV)}
          {column(t.accessTitle, ACCESS)}
        </div>

        <div className="site-footer-legal mt-16 flex flex-col gap-2 border-t pt-7 text-xs text-muted sm:flex-row sm:items-center sm:justify-between lg:mt-20">
          <p>© {new Date().getFullYear()} {PERSONAL.name}</p>
          <p>{t.colophon}</p>
        </div>
      </div>
    </footer>
  )
}
