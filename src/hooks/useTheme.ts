import { useEffect } from 'react'

// ── Single theme: HIPPIE ──────────────────────────────────────────────────────
// The site now ships ONE cohesive vibe (smoky forest + lime + psychedelic), so
// there's no light/dark toggle. The whole palette is driven by CSS variables
// under `:root, .theme-batman` (see index.css); we simply pin `data-theme="dark"`
// so that base palette always applies (the old light override never triggers).
export type Theme = 'dark'

export function getInitialTheme(): Theme { return 'dark' }

// Pin the document to the hippie palette + matching browser UI chrome colour.
export function applyTheme(_theme: Theme = 'dark'): void {
  const root = document.documentElement
  root.setAttribute('data-theme', 'dark')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', '#0E1411')   // smoky forest charcoal
}

export interface UseThemeResult {
  theme: Theme
  setTheme: (t: Theme) => void
  toggle: () => void
}

// Kept for API compatibility with any caller; the theme is fixed, so setTheme /
// toggle are intentional no-ops.
export default function useTheme(): UseThemeResult {
  useEffect(() => { applyTheme('dark') }, [])
  return { theme: 'dark', setTheme: () => {}, toggle: () => {} }
}
