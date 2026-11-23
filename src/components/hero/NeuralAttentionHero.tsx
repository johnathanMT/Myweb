import { useEffect, useRef } from 'react'
import { useReducedMotion } from 'framer-motion'
import { createNeuralField, type FieldTheme } from './neuralFieldEngine'

/**
 * NeuralAttentionHero — the hero's living backdrop (see neuralFieldEngine.ts).
 * Decorative: aria-hidden and pointer-transparent; the pinned header hosts
 * the input so the copy above it stays clickable.
 *
 * Pauses off-screen and in hidden tabs, renders one still frame for
 * prefers-reduced-motion, and follows the data-theme switch live. While it is
 * on screen `html.hero-live` trades the floating chrome's backdrop blur for
 * solid tints — a blur over a repainting canvas is recomputed every frame.
 */
const currentTheme = (): FieldTheme =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark'

export default function NeuralAttentionHero() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = !!useReducedMotion()

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const root = document.documentElement
    const host = canvas.closest<HTMLElement>('.stage-head')
    const field = createNeuralField(canvas, { theme: currentTheme(), static: reduced })

    let inView = true
    const sync = () => {
      field.setActive(inView && document.visibilityState === 'visible')
      root.classList.toggle('hero-live', inView)
    }
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; sync() }, { threshold: 0.02 })
    io.observe(canvas)
    const ro = new ResizeObserver(() => field.resize())
    ro.observe(canvas)
    const mo = new MutationObserver(() => field.setTheme(currentTheme()))
    mo.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    document.addEventListener('visibilitychange', sync)

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      field.attend({ x: e.clientX - r.left, y: e.clientY - r.top })
    }
    const onLeave = () => field.attend(null)
    const onUp = (e: PointerEvent) => { if (e.pointerType !== 'mouse') field.attend(null) }
    if (!reduced && host) {
      host.addEventListener('pointerdown', onMove, { passive: true })
      host.addEventListener('pointermove', onMove, { passive: true })
      host.addEventListener('pointerleave', onLeave)
      host.addEventListener('pointercancel', onLeave)   // the browser took the touch to scroll
      host.addEventListener('pointerup', onUp)
    }
    sync()

    return () => {
      field.destroy()
      io.disconnect()
      ro.disconnect()
      mo.disconnect()
      root.classList.remove('hero-live')
      document.removeEventListener('visibilitychange', sync)
      host?.removeEventListener('pointerdown', onMove)
      host?.removeEventListener('pointermove', onMove)
      host?.removeEventListener('pointerleave', onLeave)
      host?.removeEventListener('pointercancel', onLeave)
      host?.removeEventListener('pointerup', onUp)
    }
  }, [reduced])

  return (
    <div className="nah-stage" aria-hidden>
      <canvas ref={ref} className="nah-canvas" />
      <div className="nah-veil" />
    </div>
  )
}
