import { useState, useEffect, useRef, Fragment } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ChevronDown, Flame, Menu, X, ArrowUpRight } from 'lucide-react'
import { PERSONAL } from '../data/content'
import { prefetchRoute } from '../routes'
import ThemeToggle from './ThemeToggle'
import type { Theme } from '../hooks/useTheme'

interface LangOption { code: string; flag: string; name: string }
const LANGS: LangOption[] = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'mm', flag: '🇲🇲', name: 'မြန်မာ' },
  { code: 'jp', flag: '🇯🇵', name: '日本語' },
  { code: 'vn', flag: '🇻🇳', name: 'Tiếng Việt' },
  { code: 'ne', flag: '🇳🇵', name: 'नेपाली' },
  { code: 'id', flag: '🇮🇩', name: 'Indonesia' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
]

const isGitHub = window.location.hostname.includes('github.io')
const blogPath = isGitHub ? '/Myweb/blog.html' : '/blog.html'

/** Internal items route with react-router; `href` items are real external links. */
type NavItem = { key: string; to: string; href?: never } | { key: string; href: string; to?: never }

const NAV_LINKS: NavItem[] = [
  { key: 'home', to: '/' },
  { key: 'about', to: '/about' },
  { key: 'projects', to: '/projects' },
  { key: 'stack', to: '/stack' },
  { key: 'gallery', to: '/gallery' },
  { key: 'exploring', to: '/exploring' },
  { key: 'jyotish', href: 'https://vedin.myothant.dev' },   // Vedin astrology app (separate repo)
  { key: 'sanctuary', to: '/sanctuary' },                     // full-screen immersive route
  { key: 'blog', href: blogPath },
]

// The four interactive CS modules — sections on the /lab page.
const LAB_LINKS = [
  { key: 'lab', to: '/lab#lab' },               // Algorithm Lab (sorting / A* / Dijkstra / BST)
  { key: 'agent', to: '/lab#agent' },           // Agentic-AI workflow
  { key: 'quantum', to: '/lab#quantum' },       // 2-qubit circuit
  { key: 'antimatter', to: '/lab#antimatter' }, // annihilation sim
]

// i18n labels for the nav (falls back to `en` for any missing language).
const NAV_T: Record<string, Record<string, string>> = {
  en: { home: 'Home',      about: 'About',      projects: 'Projects',      stack: 'Stack',     labMenu: 'Techno Science Lab', lab: 'Algorithms', agent: 'Agentic AI', quantum: 'Quantum',   antimatter: 'Antimatter',  gallery: 'Gallery',  exploring: 'Exploring', jyotish: 'Vedin', sanctuary: 'Sanctuary', blog: 'Blog' },
  mm: { home: 'ပင်မ',       about: 'အကြောင်း',     projects: 'ပရောဂျက်များ',    stack: 'နည်းပညာ',   labMenu: 'Techno Science Lab', quantum: 'ကွမ်တမ်', gallery: 'ပြခန်း',    exploring: 'လေ့လာရန်',  jyotish: 'ဗေဒင်', sanctuary: 'အောက်မေ့ပင်', blog: 'ဘလော့' },
  jp: { home: 'ホーム',     about: '概要',        projects: 'プロジェクト',    stack: 'スタック',  labMenu: 'テクノサイエンス', quantum: '量子',      antimatter: '反物質',      gallery: 'ギャラリー', exploring: '探索',      sanctuary: '記憶の木',   blog: 'ブログ' },
  vn: { home: 'Trang chủ', about: 'Giới thiệu', projects: 'Dự án',         stack: 'Công nghệ', quantum: 'Lượng tử',  antimatter: 'Phản vật chất', gallery: 'Thư viện', exploring: 'Khám phá',  sanctuary: 'Cây Kỷ Niệm' },
  ne: { home: 'गृह',        about: 'परिचय',       projects: 'परियोजना',       stack: 'स्ट्याक',    quantum: 'क्वान्टम',  antimatter: 'प्रतिपदार्थ',   gallery: 'ग्यालरी',   exploring: 'अन्वेषण',    sanctuary: 'सम्झना रूख', blog: 'ब्लग' },
  id: { home: 'Beranda',   about: 'Tentang',    projects: 'Proyek',        stack: 'Teknologi', quantum: 'Kuantum',   antimatter: 'Antimateri',  gallery: 'Galeri',   exploring: 'Jelajahi',  sanctuary: 'Pohon Kenangan' },
  zh: { home: '首页',       about: '关于',        projects: '项目',          stack: '技术栈',     labMenu: '科技实验室', quantum: '量子',      antimatter: '反物质',      gallery: '画廊',      exploring: '探索',      sanctuary: '记忆之树',   blog: '博客' },
}

interface NavbarProps {
  lang: string
  setLang: (lang: string) => void
  theme: Theme
  toggleTheme: () => void
}

/** Close a popover on outside click / Escape. */
function useDismiss<T extends HTMLElement>(open: boolean, close: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) close() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('pointerdown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, close])
  return ref
}

export default function Navbar({ lang, setLang, theme, toggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [labOpen, setLabOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const label = (key: string) => NAV_T[lang]?.[key] ?? NAV_T.en[key]
  const { pathname, hash } = useLocation()

  const labRef = useDismiss<HTMLLIElement>(labOpen, () => setLabOpen(false))
  const langRef = useDismiss<HTMLDivElement>(langOpen, () => setLangOpen(false))

  // rAF-throttled scroll listener; setState only when the value flips.
  useEffect(() => {
    let ticking = false
    let last = false
    const update = () => {
      ticking = false
      const next = window.scrollY > 24
      if (next !== last) { last = next; setScrolled(next) }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Any navigation closes every menu.
  useEffect(() => { setMenuOpen(false); setLabOpen(false); setLangOpen(false) }, [pathname, hash])

  // Mobile drawer: lock background scroll + Escape to close.
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey) }
  }, [menuOpen])

  // Re-clicking the page you're on glides back to the top instead of doing nothing.
  const onSamePage = (to: string) => {
    if (to === pathname && !hash) window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const warm = (to: string) => ({
    onMouseEnter: () => prefetchRoute(to),
    onFocus: () => prefetchRoute(to),
    onTouchStart: () => prefetchRoute(to),
  })

  const labActive = pathname === '/lab'
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0]

  return (
    <header className={`nav-bar fixed inset-x-0 top-0 z-50 ${scrolled || menuOpen ? 'is-scrolled' : ''}`}>
      <nav aria-label="Primary" className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Logo → Home */}
        <Link to="/" onClick={() => onSamePage('/')} aria-label="Home" className="group flex shrink-0 items-center gap-2.5">
          <span className="nav-logo font-groovy">M</span>
          <span className="hidden font-groovy text-sm tracking-wide text-muted transition-colors group-hover:text-fg sm:inline">{PERSONAL.handle}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-0.5 xl:flex">
          {NAV_LINKS.map((item) => (
            <Fragment key={item.key}>
              <li>
                {item.to !== undefined ? (
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => onSamePage(item.to)}
                    {...warm(item.to)}
                    className={({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`}
                  >
                    {label(item.key)}
                  </NavLink>
                ) : (
                  <a href={item.href} className="nav-link inline-flex items-center gap-0.5">
                    {label(item.key)}<ArrowUpRight size={11} className="opacity-60" aria-hidden />
                  </a>
                )}
              </li>

              {/* Techno Science Lab dropdown, right after Stack */}
              {item.key === 'stack' && (
                <li ref={labRef} className="relative" onMouseEnter={() => { setLabOpen(true); prefetchRoute('/lab') }} onMouseLeave={() => setLabOpen(false)}>
                  <button
                    type="button"
                    onClick={() => setLabOpen((o) => !o)}
                    onFocus={() => prefetchRoute('/lab')}
                    aria-haspopup="true"
                    aria-expanded={labOpen}
                    aria-controls="lab-menu"
                    className={`nav-link inline-flex items-center gap-1 ${labActive ? 'is-active' : ''}`}
                  >
                    {label('labMenu')}
                    <ChevronDown size={13} className={`transition-transform duration-200 ${labOpen ? 'rotate-180' : ''}`} aria-hidden />
                  </button>
                  {/* pt-2 bridges the hover gap between trigger and panel */}
                  <div id="lab-menu" className={`absolute left-0 top-full pt-2 transition-all duration-200 ${labOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}>
                    <div className="glass-menu w-60 p-1.5">
                      <p className="px-3 pb-1.5 pt-1 font-mono text-[10px] uppercase tracking-wider text-accent/80">// lab modules</p>
                      {LAB_LINKS.map((sub) => (
                        <Link
                          key={sub.key}
                          to={sub.to}
                          className={`flex items-center gap-2.5 rounded-lg px-3 py-2 font-mono text-xs transition-colors ${
                            labActive && hash === sub.to.slice(4) ? 'bg-accent/15 text-accent-light' : 'text-muted hover:bg-accent/10 hover:text-fg'
                          }`}
                        >
                          <span className="node-dot" aria-hidden /> {label(sub.key)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </li>
              )}
            </Fragment>
          ))}
        </ul>

        {/* Right group */}
        <div className="flex items-center gap-2">
          {/* Compact language picker (desktop) */}
          <div ref={langRef} className="relative hidden xl:block">
            <button
              type="button"
              onClick={() => setLangOpen((o) => !o)}
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              aria-label={`Language: ${current.name}`}
              className="icon-btn w-auto gap-1 px-2"
            >
              <span className="text-base leading-none">{current.flag}</span>
              <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
            <ul
              role="listbox"
              aria-label="Language"
              className={`glass-menu absolute right-0 top-full mt-2 w-44 p-1.5 transition-all duration-200 ${langOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1 opacity-0'}`}
            >
              {LANGS.map(({ code, flag, name }) => (
                <li key={code} role="option" aria-selected={lang === code}>
                  <button
                    type="button"
                    onClick={() => { setLang(code); setLangOpen(false) }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${lang === code ? 'bg-accent/15 text-accent-light' : 'text-muted hover:bg-accent/10 hover:text-fg'}`}
                  >
                    <span className="text-base">{flag}</span>{name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* In Memoriam — candle link into the 3D remembrance world */}
          <Link to="/remembrance" aria-label="In Memoriam" title="In Memoriam — a 3D remembrance world" className="icon-btn">
            <Flame size={15} aria-hidden />
          </Link>

          <ThemeToggle theme={theme} onToggle={toggleTheme} />

          {/* Hamburger — below xl (the full link set needs ~1200px) */}
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="icon-btn xl:hidden"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile drawer — full-height sheet under the bar; scrolls if needed. */}
      <div
        id="mobile-menu"
        className={`mobile-drawer xl:hidden ${menuOpen ? 'is-open' : ''}`}
        aria-hidden={!menuOpen}
        inert={!menuOpen || undefined}
      >
        <ul className="flex flex-col gap-1 px-4 pt-3" style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
          {NAV_LINKS.map((item, i) => (
            <Fragment key={item.key}>
              <li style={{ transitionDelay: menuOpen ? `${40 + i * 25}ms` : '0ms' }} className="drawer-item">
                {item.to !== undefined ? (
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => { onSamePage(item.to); setMenuOpen(false) }}
                    {...warm(item.to)}
                    className={({ isActive }) => `drawer-link ${isActive ? 'is-active' : ''}`}
                  >
                    {label(item.key)}
                  </NavLink>
                ) : (
                  <a href={item.href} className="drawer-link justify-between">
                    {label(item.key)}<ArrowUpRight size={14} className="opacity-60" aria-hidden />
                  </a>
                )}
              </li>

              {item.key === 'stack' && (
                <li className="drawer-item my-1 rounded-xl border border-accent/15 bg-accent/[0.05] p-1" style={{ transitionDelay: menuOpen ? `${40 + i * 25}ms` : '0ms' }}>
                  <p className="px-4 pb-1 pt-1.5 font-mono text-[10px] uppercase tracking-wider text-accent/80">{label('labMenu')}</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {LAB_LINKS.map((sub) => (
                      <Link
                        key={sub.key}
                        to={sub.to}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-4 py-2.5 font-mono text-xs text-muted transition-colors hover:bg-accent/10 hover:text-fg"
                      >
                        <span className="node-dot" aria-hidden /> {label(sub.key)}
                      </Link>
                    ))}
                  </div>
                </li>
              )}
            </Fragment>
          ))}

          <li className="drawer-item mt-1">
            <Link to="/remembrance" onClick={() => setMenuOpen(false)} className="drawer-link gap-2.5">
              <Flame size={15} aria-hidden /> In Memoriam
            </Link>
          </li>

          <li className="drawer-item mt-2 border-t border-accent/10 pt-3">
            <p className="px-4 pb-2 font-mono text-xs text-muted">Language</p>
            <div className="flex flex-wrap items-center gap-1.5 px-4">
              {LANGS.map(({ code, flag, name }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setLang(code)}
                  aria-label={name}
                  aria-pressed={lang === code}
                  className={`h-10 w-11 rounded-lg text-base transition-all ${lang === code ? 'bg-accent/25 ring-1 ring-accent/60' : 'bg-accent/[0.06] opacity-70 hover:opacity-100'}`}
                >
                  {flag}
                </button>
              ))}
            </div>
          </li>
        </ul>
      </div>
    </header>
  )
}
