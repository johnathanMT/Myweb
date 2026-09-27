import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

/**
 * LangContext — the visitor's UI language, shared by every routed page.
 * Lives in the persistent SiteLayout so switching pages never resets it, and
 * is mirrored to localStorage (`mtn_lang`) so it survives reloads.
 */
interface LangState {
  lang: string
  setLang: (code: string) => void
}

const LangContext = createContext<LangState>({ lang: 'en', setLang: () => {} })

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<string>(() => {
    try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' }
  })

  useEffect(() => {
    try { localStorage.setItem('mtn_lang', lang) } catch { /* sandboxed context */ }
    document.documentElement.lang = lang === 'jp' ? 'ja' : lang === 'mm' ? 'my' : lang
  }, [lang])

  return <LangContext.Provider value={{ lang, setLang }}>{children}</LangContext.Provider>
}

export const useLang = (): LangState => useContext(LangContext)
