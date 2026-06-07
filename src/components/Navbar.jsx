import { useState, useEffect } from 'react'
import { PERSONAL } from '../data/content'

const LANGS = [
  { code: 'en', flag: '🇬🇧' },
  { code: 'mm', flag: '🇲🇲' },
  { code: 'jp', flag: '🇯🇵' },
  { code: 'vn', flag: '🇻🇳' },
  { code: 'ne', flag: '🇳🇵' },
  { code: 'id', flag: '🇮🇩' },
]

const isGitHub = window.location.hostname.includes('github.io');
const blogPath = isGitHub ? '/Myweb/blog.html' : '/blog.html';

const NAV_LINKS = [
  { href: '#home',      label: 'Home',     isExternal: false },
  { href: '#about',     label: 'About',    isExternal: false },
  { href: '#projects',  label: 'Projects', isExternal: false },
  { href: '#exploring', label: 'Exploring', isExternal: false },
  { href: blogPath,     label: 'Blog',     isExternal: true },
];

export default function Navbar({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)
      const sections = ['home', 'about', 'projects', 'seasonal', 'exploring']
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id)
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleNav = (e, href, isExternal) => {
    if (isExternal) return;
    e.preventDefault();
    setMenuOpen(false);
    const target = document.querySelector(href);
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
        ? 'bg-space/90 backdrop-blur-md border-b border-white/5 shadow-lg shadow-black/20'
        : 'bg-transparent'
        }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <a
          href="/Myweb/"
          className="flex items-center gap-2 font-mono font-semibold text-white hover:text-accent-light transition-colors"
        >
          <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-white">M</span>
          <span className="hidden sm:inline text-sm">{PERSONAL.handle}</span>
        </a>

        {/* Desktop nav links — now appear at lg (>=1024px) */}
        <ul className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, isExternal }) => {
            const id = href.slice(1);
            const isActive = activeSection === id && !isExternal;
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
                  {label}
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

      {/* Mobile menu — visible below lg; holds BOTH links and flags */}
      <div
        className={`lg:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } bg-surface/95 backdrop-blur-md border-b border-white/5`}
      >
        <ul className="px-6 py-4 flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label, isExternal }) => (
            <li key={href}>
              <a
                href={href}
                onClick={(e) => handleNav(e, href, isExternal)}
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                {label}
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
