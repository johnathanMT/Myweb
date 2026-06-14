import { useEffect, useState } from 'react'

/**
 * useIsMobile — lightweight, reactive, SSR-safe device-tier detection.
 *
 * "Mobile" = narrow viewport OR a coarse (touch) pointer with no fine pointer.
 * This drives the Gateway's "Recommended" hint (mobile → Lite, desktop → 3D).
 * It re-evaluates on viewport changes so rotating a tablet updates the hint.
 *
 * @param {number} breakpoint  max width (px) considered "mobile". Default 820.
 * @returns {boolean}
 */
export default function useIsMobile(breakpoint = 820) {
  const query = `(max-width: ${breakpoint}px), (pointer: coarse) and (hover: none)`

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mql = window.matchMedia(query)
    const onChange = (e) => setIsMobile(e.matches)
    setIsMobile(mql.matches)                 // sync in case it changed pre-effect
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [query])

  return isMobile
}
