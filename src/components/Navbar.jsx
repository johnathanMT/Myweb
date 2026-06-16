import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PERSONAL } from '../data/content'

const LANGS = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'mm', flag: '🇲🇲' },
  { code: 'jp', flag: '🇯🇵' },
  { code: 'vn', flag: '🇻🇳' },
  { code: 'ne', flag: '🇳🇵' },
  { code: 'id', flag: '🇮🇩' },
  { code: 'zh', flag: '🇨🇳' },
]

const isGitHub = window.location.hostname.includes('github.io');
const blogPath = isGitHub ? '/Myweb/blog.html' : '/blog.html';

const NAV_LINKS = [
  { href: '#home', key: 'home' },
  { href: '#about', key: 'about' },
  { href: '#projects', key: 'projects' },
  { href: '#stack', key: 'stack' },
  { href: '#gallery', key: 'gallery' },
  { href: '#exploring', key: 'exploring' },
  { href: blogPath, key: 'blog', isExternal: true },
];

// i18n labels for the nav (falls back to `en` for any missing language).
const NAV_T = {
  en: { home: 'Home',      about: 'About',      projects: 'Projects',      stack: 'Stack',     gallery: 'Gallery',  exploring: 'Exploring', blog: 'Blog' },
  mm: { home: 'ပင်မ',       about: 'အကြောင်း',     projects: 'ပရောဂျက်များ',    stack: 'နည်းပညာ',   gallery: 'ပြခန်း',    exploring: 'လေ့လာရန်',  blog: 'ဘလော့' },
  jp: { home: 'ホーム',     about: '概要',        projects: 'プロジェクト',    stack: 'スタック',  gallery: 'ギャラリー', exploring: '探索',      blog: 'ブログ' },
  vn: { home: 'Trang chủ', about: 'Giới thiệu', projects: 'Dự án',         stack: 'Công nghệ', gallery: 'Thư viện', exploring: 'Khám phá',  blog: 'Blog' },
  ne: { home: 'गृह',        about: 'परिचय',       projects: 'परियोजना',       stack: 'स्ट्याक',    gallery: 'ग्यालरी',   exploring: 'अन्वेषण',    blog: 'ब्लग' },
  id: { home: 'Beranda',   about: 'Tentang',    projects: 'Proyek',        stack: 'Teknologi', gallery: 'Galeri',   exploring: 'Jelajahi',  blog: 'Blog' },
  zh: { home: '首页',       about: '关于',        projects: '项目',          stack: '技术栈',     gallery: '画廊',      exploring: '探索',      blog: '博客' },
};

export default function Navbar({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const t = NAV_T[lang] || NAV_T.en   // translated nav labels

  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const sections = ['home', 'about', 'projects', 'stack', 'gallery', 'seasonal', 'exploring']
    let ticking = false
    let lastScrolled = false
    let lastActive = 'home'

    // rAF-throttled: do at most one layout read+update per animation frame, and
    // only call setState when a value actually changes → no scroll-time jank.
    const update = () => {
      ticking = false
      const y = window.scrollY
      const isScrolled = y > 40
      if (isScrolled !== lastScrolled) { lastScrolled = isScrolled; setScrolled(isScrolled) }
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && y >= el.offsetTop - 120) {
          if (id !== lastActive) { lastActive = id; setActiveSection(id) }
          break
        }
      }
    }
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update) } }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()   // set initial state
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Smooth-scroll to an element id, retrying briefly while the Home page mounts
  // (sections aren't in the DOM the instant we navigate from another route).
  const scrollToId = (id, tries = 25) => {
    const el = document.getElementById(id)
    if (el) { el.scrollIntoView({ behavior: 'smooth' }); return }
    if (tries > 0) setTimeout(() => scrollToId(id, tries - 1), 80)
  }

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  // Core cross-page navigation:
  //  • on Home ('/')    → scroll right now.
  //  • on another route → navigate('/'), then scroll once Home has mounted.
  //  • 'home' link      → always scroll to the very top.
  const goToSection = (id) => {
    const onHome = location.pathname === '/'
    if (id === 'home') {
      if (onHome) scrollTop()
      else { navigate('/'); setTimeout(scrollTop, 120) }
      return
    }
    if (onHome) scrollToId(id)
    else { navigate('/'); setTimeout(() => scrollToId(id), 120) }
  }

  const handleNav = (e, href, isExternal) => {
    if (isExternal) return;        // blog → let the browser follow the real link
    e.preventDefault();
    setMenuOpen(false);
    goToSection(href.replace(/^#/, ''));
  };

  // Logo → Home + smooth-scroll to the very top (works from any route).
  const goHome = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    if (location.pathname === '/') scrollTop()
    else { navigate('/'); setTimeout(scrollTop, 120) }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-space/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-transparent'
        }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo → Home (smooth scroll to top) */}
        <a
          href="#/"
          onClick={goHome}
          aria-label="Back to top / Home"
          className="flex items-center gap-2 font-mono font-semibold text-white hover:text-accent-light transition-colors cursor-pointer"
        >
          <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-white">M</span>
          <span className="hidden sm:inline text-sm">{PERSONAL.handle}</span>
        </a>

        {/* Desktop nav links — now appear at lg (>=1024px) */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, key, isExternal = false }) => {
            const id = href.slice(1);
            const isActive = activeSection === id && !isExternal && location.pathname === '/';
            return (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => handleNav(e, href, isExternal)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${isActive
                    ? 'text-white bg-accent/20'
                    : 'text-muted hover:text-white hover:bg-white/5'
                    }`}
                >
                  {t[key]}
                </a>
              </li>
            );
          })}
        </ul>

        {/* Right group: lang switcher (desktop only) + hamburger */}
        <div className="flex items-center gap-3">
          {/* Flags now match the nav-links breakpoint: hidden until lg.
              On smaller screens the flags live in the mobile menu below. */}
          <div className="hidden lg:flex items-center gap-0.5 bg-white/5 rounded-xl p-1">
            {LANGS.map(({ code, flag }) => (
              <button
                key={code}
                onClick={() => setLang(code)}
                title={code.toUpperCase()}
                className={`w-8 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${lang === code ? 'bg-accent/70 shadow-sm' : 'hover:bg-white/10 opacity-60 hover:opacity-100'
                  }`}
              >
                {flag}
              </button>
            ))}
          </div>

          {/* Hamburger — visible below lg */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-base`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — visible below lg; holds BOTH links and flags.
          Open: expands up to 85vh and scrolls if the content (links + 7 flags)
          is taller, so the language switcher is always fully reachable.
          Closed: collapses to 0 with overflow hidden for the slide animation. */}
      <div
        className={`lg:hidden transition-all duration-300 bg-surface/95 backdrop-blur-md border-b border-white/5 ${menuOpen
          ? 'max-h-[85vh] overflow-y-auto overscroll-contain opacity-100'
          : 'max-h-0 overflow-hidden opacity-0'
          }`}
      >
        <ul
          className="px-6 pt-4 flex flex-col gap-1"
          style={{ paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}
        >
          {NAV_LINKS.map(({ href, key, isExternal = false }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => handleNav(e, href, isExternal)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                {t[key]}
              </a>
            </li>
          ))}

          {/* Language flags inside the mobile menu */}
          <li className="pt-3 border-t border-white/5 mt-2">
            <p className="px-4 pb-2 text-xs font-mono text-muted">Language</p>
            <div className="flex items-center gap-1.5 flex-wrap px-4">
              {LANGS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setMenuOpen(false) }}
                  title={code.toUpperCase()}
                  className={`w-10 h-9 rounded-lg text-base transition-all ${lang === code ? 'bg-accent/70' : 'bg-white/5 opacity-70 hover:opacity-100'
                    }`}
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
