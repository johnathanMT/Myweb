import { createContext, useContext, useEffect, useRef, type ReactNode } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useReducedMotion, useScroll, useTransform, type MotionStyle, type MotionValue } from 'framer-motion'
import { useInView } from '../hooks/useInView'
import { HEADER_MOTIFS, StageProgress, type HeaderMotif } from './headerMotifs'

/** Links that sit above a page's header (PageShell sets them). */
export const StageTop = createContext<ReactNode>(null)

/** The gold line-art header of one page; drifts only while on screen. */
export function HeaderArt({ motif, soft }: { motif: HeaderMotif; soft?: boolean }) {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.02 })
  const Motif = HEADER_MOTIFS[motif]
  return (
    <div ref={ref} className={`stage-art is-${motif} ${soft ? 'is-soft' : ''} ${inView ? 'is-live' : ''}`} aria-hidden>
      <div className="stage-box"><Motif /></div>
      <div className="stage-scrim" />
    </div>
  )
}

interface ScrollStageProps {
  /** Backdrop, full-bleed behind the copy. */
  art: ReactNode
  header: ReactNode
  /** Pixels the backdrop sinks while pinned, so it lags behind the copy. */
  artDrift?: number
  className?: string
  headClass?: string
  headId?: string
  children: ReactNode
}

/**
 * A pinned header that recedes while the page rises over it like a curtain.
 *
 *   track = header + `--travel` of spare height, so `position: sticky` holds the
 *   header for exactly that much scroll, then lets go. The curtain is pulled up
 *   by the same amount. Scrolling stays native; only transform and opacity move.
 *
 * `p` runs 0 → 1 while pinned; `q` runs 0 → 1 from the release until the curtain
 * reaches the top, when the header is hidden outright.
 */
export function ScrollStage({ art, header, artDrift = 0, className = '', headClass = '', headId, children }: ScrollStageProps) {
  const reduced = useReducedMotion()
  const trackRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLDivElement>(null)
  const { scrollY } = useScroll()
  const box = useRef({ start: 0, travel: 1, height: 1 })
  const p = useMotionValue(0)
  const q = useMotionValue(0)

  const update = () => {
    if (reduced) return
    const { start, travel, height } = box.current
    const gone = window.scrollY - start
    p.set(Math.min(1, Math.max(0, gone / travel)))
    q.set(Math.min(1, Math.max(0, (gone - travel) / Math.max(1, height - travel))))
  }
  useMotionValueEvent(scrollY, 'change', update)

  useEffect(() => {
    const track = trackRef.current
    const head = headRef.current
    if (!track || !head) return
    const measure = () => {
      track.style.setProperty('--head-h', `${head.offsetHeight}px`)
      // offsetTop ignores transforms, so the page-enter lift can't skew it
      let top = 0
      for (let el: HTMLElement | null = track; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop
      const pin = parseFloat(getComputedStyle(head).top) || 0
      box.current = { start: top - pin, travel: Math.max(1, track.offsetHeight - head.offsetHeight), height: head.offsetHeight }
      update()
    }
    const ro = new ResizeObserver(measure)
    ro.observe(track)
    ro.observe(head)
    window.addEventListener('resize', measure)
    measure()
    return () => { ro.disconnect(); window.removeEventListener('resize', measure) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced])

  const scale = useTransform(p, [0, 1], [1, 0.91])
  const y = useTransform(p, [0, 1], [0, -24])
  const artY = useTransform(p, [0, 1], [0, artDrift])
  const opacity = useTransform(() => (1 - 0.85 * p.get()) * (1 - q.get()))
  const artOpacity = useTransform(() => (1 - 0.6 * p.get()) * (1 - q.get()))
  const visibility = useTransform(q, (v) => (v >= 1 ? 'hidden' : 'visible')) as MotionValue<'hidden' | 'visible'>

  return (
    <div className={`stage ${className}`}>
      <div ref={trackRef} className="stage-track">
        <motion.div ref={headRef} id={headId} className={`stage-head ${headClass}`} style={{ visibility, '--p': p } as MotionStyle}>
          <StageProgress.Provider value={p}>
            <motion.div className="stage-backdrop" style={{ y: artY, opacity: artOpacity }}>{art}</motion.div>
          </StageProgress.Provider>
          {/* the entrance animation lives on the children, so the two never share a transform */}
          <motion.div className="stage-copy" style={{ scale, y, opacity }}>{header}</motion.div>
        </motion.div>
      </div>
      <div className="stage-curtain">{children}</div>
    </div>
  )
}

interface PageStageProps { motif: HeaderMotif; soft?: boolean; header: ReactNode; className?: string; children: ReactNode }

/** An inner page: golden header, then its content. `soft` centres the copy and dims the art. */
export default function PageStage({ motif, soft, header, className = '', children }: PageStageProps) {
  const top = useContext(StageTop)
  return (
    <ScrollStage
      className={`is-page is-${motif} ${soft ? 'is-centred' : ''} ${className}`}
      art={<HeaderArt motif={motif} soft={soft} />}
      header={<>{top}<div className="stage-title">{header}</div></>}
    >
      {children}
    </ScrollStage>
  )
}
