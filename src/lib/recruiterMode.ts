/**
 * Recruiter mode — a fast track for people screening candidates.
 *
 *   ?mode=recruiter → skip the warp intro + robot battle; Home renders the
 *                     profile, case studies and Hire Me panel instead.
 *   ?mode=full      → back to the full interactive experience.
 *
 * The choice is kept in sessionStorage so navigating back to Home (whose links
 * carry no query string) stays in the same mode for the rest of the visit.
 */
const KEY = 'mtn_recruiter'
const BOOTED_KEY = 'mtn_booted' // read by BootScreen — '1' means "intro already played"

/** Call once before React renders, so BootScreen sees the flag on its first render. */
export function initRecruiterMode(): void {
  if (typeof window === 'undefined') return
  const mode = new URLSearchParams(window.location.search).get('mode')
  try {
    if (mode === 'recruiter') {
      sessionStorage.setItem(KEY, '1')
      sessionStorage.setItem(BOOTED_KEY, '1')
    } else if (mode === 'full') {
      sessionStorage.removeItem(KEY)
    }
  } catch { /* storage blocked — the URL param alone still applies below */ }
}

export function isRecruiterMode(): boolean {
  if (typeof window === 'undefined') return false
  if (new URLSearchParams(window.location.search).get('mode') === 'recruiter') return true
  try { return sessionStorage.getItem(KEY) === '1' } catch { return false }
}

/** Leave recruiter mode for this visit (the intro stays skipped — it already "played"). */
export function exitRecruiterMode(): void {
  try { sessionStorage.removeItem(KEY) } catch { /* ignore */ }
}
