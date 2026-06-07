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

// ဒီနေရာမှာ ထည့်ပါ
const isGitHub = window.location.hostname.includes('github.io');
const blogPath = isGitHub ? '/Myweb/blog.html' : '/blog.html';

const NAV_LINKS = [
  { href: '#home',      label: 'Home',    isExternal: false },
  { href: '#about',     label: 'About',   isExternal: false },
  { href: '#projects',  label: 'Projects', isExternal: false },
  { href: '#exploring', label: 'Exploring', isExternal: false },
  { href: blogPath,     label: 'Blog',    isExternal: true }, // ဒီမှာ blogPath ကို သုံးလိုက်ပါ
];

export default function Navbar({ lang, setLang }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40)

      // Active section tracking
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
    if (isExternal) return; // External ဆိုရင် ပုံမှန်အတိုင်း လင့်ခ်သွားပါ

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
          href="/Myweb/" // တိုက်ရိုက် link ပြောင်းပေးပါ
          className="flex items-center gap-2 ..."
        >
          <span className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-white">M</span>
          <span className="hidden sm:inline text-sm">{PERSONAL.handle}</span>
        </a>


        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, isExternal }) => {
            const id = href.slice(1);
            const isActive = activeSection === id && !isExternal;
            return (
              <li key={href}>
                <a
                  href={href}
                  onClick={(e) => handleNav(e, href, isExternal)}
                  // အောက်ပါ className နေရာမှာ ... ကိုဖျက်ပြီး အပြည့်အစုံ ပြန်ထည့်ပါ
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

        {/* Right group: lang switcher + hamburger */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-0.5 bg-white/5 rounded-xl p-1">
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

          {/* Hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-muted hover:text-white transition-colors"
            aria-label="Toggle menu"
          >
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-base`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          } bg-surface/95 backdrop-blur-md border-b border-white/5`}
      >
        <ul className="px-6 py-4 flex flex-col gap-1">
          {/* Mobile menu - ဒီနေရာကို ပြင်ပါ */}
          {NAV_LINKS.map(({ href, label, isExternal }) => ( // isExternal ထည့်ပေးပါ
            <li key={href}>
              <a
                href={href}
                onClick={(e) => handleNav(e, href, isExternal)} // ဒီမှာလည်း ထည့်ပေးပါ
                className="block px-4 py-2.5 rounded-xl text-sm font-medium text-muted hover:text-white hover:bg-white/5 transition-all"
              >
                {label}
              </a>
            </li>
          ))}
          <li className="pt-2 border-t border-white/5 mt-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              {LANGS.map(({ code, flag }) => (
                <button
                  key={code}
                  onClick={() => { setLang(code); setMenuOpen(false) }}
                  className={`w-9 h-8 rounded-lg text-sm transition-all ${lang === code ? 'bg-accent/70' : 'bg-white/5 opacity-70 hover:opacity-100'
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
