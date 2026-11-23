import type { ReactNode } from 'react'
import { useInView } from '../hooks/useInView'
import { HEADER_MOTIFS, type HeaderMotif } from './headerMotifs'

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

/** Wraps a page whose first section carries the title. `soft` dims the art behind centred titles. */
export default function PageStage({ motif, soft, children }: { motif: HeaderMotif; soft?: boolean; children: ReactNode }) {
  return (
    <div className="stage">
      <HeaderArt motif={motif} soft={soft} />
      {children}
    </div>
  )
}
