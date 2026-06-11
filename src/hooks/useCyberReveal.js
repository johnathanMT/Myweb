// ============================================================================
//  useCyberReveal — GSAP ScrollTrigger reveals for HTML, synced to page scroll.
//
//  Put the returned ref on a section, then mark children with [data-reveal].
//  They rise + un-blur as they enter the viewport, matching the 3D dolly feel.
//  gsap.context + ctx.revert() makes it React-StrictMode / unmount safe.
//
//  Requires:  npm i gsap
// ============================================================================
import { useLayoutEffect, useRef } from 'react'
import { gsap, ScrollTrigger } from '../lib/cyberScroll'

export function useCyberReveal() {
  const scope = useRef(null)

  useLayoutEffect(() => {
    const el = scope.current
    if (!el) return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

    const ctx = gsap.context(() => {
      // Scope the queries to THIS section so multiple hooks never animate each
      // other's children.
      el.querySelectorAll('[data-reveal]').forEach((node) => {
        gsap.from(node, {
          yPercent: 16,
          opacity: 0,
          filter: 'blur(14px)',
          duration: 1.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: node,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        })
      })

      // Parallax a giant heading against the 3D background.
      el.querySelectorAll('[data-parallax]').forEach((node) => {
        gsap.to(node, {
          yPercent: -18,
          ease: 'none',
          scrollTrigger: { trigger: node, start: 'top bottom', end: 'bottom top', scrub: true },
        })
      })
    }, el)

    return () => ctx.revert()
  }, [])

  return scope
}
