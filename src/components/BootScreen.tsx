import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * BootScreen — cinematic once-per-session intro: MTN.OS boots, a warp portal
 * opens, AI-piloted spacecraft burst through it past the camera, and the site
 * lands with a flash and a screen-shake "impact".
 *
 *  • The canvas engine (intro/warpIntro) is dynamically imported, so returning
 *    visitors — who never see the intro — never download it.
 *  • SKIP button and Esc end it instantly (quiet fade, no shake).
 *  • prefers-reduced-motion: a brief logo fade, no warp, no shake.
 *  • While it plays, `html.intro-active` pauses the hero battle; on landing a
 *    window `mtn:impact` event lets the battle erupt in sync with the shake.
 */
const STATUS = [
  '> initializing MTN.OS kernel',
  '> 改善 · continuous_improvement_protocol [OK]',
  '> warp drive engaged',
  '> WELCOME, OPERATOR.',
]

type Phase = 'play' | 'land' | 'gone'

export default function BootScreen() {
  const [phase, setPhase] = useState<Phase>(() => {
    try { return sessionStorage.getItem('mtn_booted') === '1' ? 'gone' : 'play' } catch { return 'play' }
  })
  const [line, setLine] = useState(0)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const end = useCallback((impact: boolean) => {
    try { sessionStorage.setItem('mtn_booted', '1') } catch { /* private mode */ }
    const root = document.documentElement
    root.classList.remove('intro-active')
    if (impact) {
      root.classList.add('impact-shake')
      window.dispatchEvent(new Event('mtn:impact'))
      window.setTimeout(() => root.classList.remove('impact-shake'), 650)
    } else {
      window.dispatchEvent(new Event('mtn:intro-skipped'))
    }
    setPhase('land')
    window.setTimeout(() => setPhase('gone'), impact ? 520 : 320)
  }, [])

  useEffect(() => {
    if (phase !== 'play') return
    const root = document.documentElement
    root.classList.add('intro-active')

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    let stop: (() => void) | undefined
    let cancelled = false
    const timers: number[] = []

    if (reduce) {
      setLine(STATUS.length - 1)
      timers.push(window.setTimeout(() => end(false), 700))
    } else {
      STATUS.forEach((_, i) => timers.push(window.setTimeout(() => setLine(i), i * 650)))
      import('./intro/warpIntro')
        .then(({ runWarpIntro }) => {
          if (cancelled || !canvasRef.current) return
          stop = runWarpIntro(canvasRef.current, () => end(true))
        })
        .catch(() => end(false))   // chunk failed to load → just reveal the site
    }

    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') end(false) }
    window.addEventListener('keydown', onKey)
    return () => {
      cancelled = true
      stop?.()
      timers.forEach(clearTimeout)
      window.removeEventListener('keydown', onKey)
      root.classList.remove('intro-active')
    }
  }, [phase, end])

  if (phase === 'gone') return null

  return (
    <div className={`intro ${phase === 'land' ? 'is-landing' : ''}`} role="status" aria-live="polite" aria-label="Site intro">
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <div className="intro-hud" aria-hidden="true">
        <span>MTN.OS // WARP</span>
        <span className="intro-hud-r">SECTOR 35.6°N · 139.6°E</span>
      </div>
      <div className="intro-brand">
        <p className="intro-logo font-groovy">MTN.OS</p>
        <p className="intro-status font-mono">{STATUS[line]}<span className="term-cursor" /></p>
      </div>
      <button type="button" className="intro-skip" onClick={() => end(false)}>
        SKIP <span aria-hidden>▸▸</span>
      </button>
    </div>
  )
}
