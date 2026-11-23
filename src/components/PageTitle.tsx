import type { ReactNode } from 'react'

interface PageTitleProps {
  children: string
  /** Golden closing words. Omitted: the last word of `children` (all of it when it is one word). */
  accent?: string
  icon?: ReactNode
  id?: string
  className?: string
}

/** A page's <h1>: ivory lead, golden accent, one-time entrance. Styles: luxury.css. */
export default function PageTitle({ children, accent, icon, id, className = '' }: PageTitleProps) {
  const cut = accent === undefined ? children.trim().lastIndexOf(' ') : children.length
  const lead = children.slice(0, Math.max(cut, 0)).trim()
  const gold = accent ?? children.slice(cut + 1).trim()
  return (
    <h1 id={id} className={`signature-page-title lux-title enter-title ${className}`}>
      {icon}{lead}{lead && ' '}<span className="gold-text">{gold}</span>
    </h1>
  )
}
