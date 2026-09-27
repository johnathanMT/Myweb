import { useEffect, useRef } from 'react'
import { createBattle } from './battleEngine'

/**
 * BattleScene — the animated backdrop for the homepage hero: pearl-white AI
 * robots vs crimson creatures (see battleEngine.ts). Purely decorative
 * (aria-hidden, pointer-events: none); the hero section hosts the input.
 *
 * Lifecycle: pauses off-screen / in a hidden tab, freezes to a single frame
 * for prefers-reduced-motion, and tears down cleanly on route change.
 *
 * While the battle is on screen it sets `html.hero-live`, which swaps the
 * fixed chrome's backdrop blur (dock, navbar buttons) for solid tints — a blur
 * over a canvas that repaints every frame would be re-computed every frame.
 */
export default function BattleScene() {
  const bgRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const bg = bgRef.current
    const fx = fxRef.current
    if (!bg || !fx) return

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    const battle = createBattle(bg, fx, { static: reduce })

    let inView = true
    const root = document.documentElement
    const sync = () => {
      battle.setActive(inView && document.visibilityState === 'visible')
      root.classList.toggle('hero-live', inView)
    }
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() }, { threshold: 0.02 })
    io.observe(fx)
    document.addEventListener('visibilitychange', sync)

    const host = fx.closest('section')
    // Depth parallax follows a fine pointer only (no gyro/touch jitter).
    const fine = window.matchMedia?.('(pointer: fine)').matches ?? false
    const onMove = (e: PointerEvent) => {
      battle.setParallax((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1)
    }
    // Tap/click on open space (not a link or button) → full-power surge.
    const onDown = (e: PointerEvent) => {
      if (!(e.target as Element).closest('a, button')) battle.surge()
    }
    if (fine && !reduce) window.addEventListener('pointermove', onMove, { passive: true })
    if (!reduce) host?.addEventListener('pointerdown', onDown)

    return () => {
      battle.destroy()
      io.disconnect()
      root.classList.remove('hero-live')
      document.removeEventListener('visibilitychange', sync)
      window.removeEventListener('pointermove', onMove)
      host?.removeEventListener('pointerdown', onDown)
    }
  }, [])

  return (
    <div className="battle-scene" aria-hidden="true">
      <canvas ref={bgRef} className="battle-layer battle-bg" />
      <canvas ref={fxRef} className="battle-layer" />
    </div>
  )
}
