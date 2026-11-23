import PageStage from './PageStage'
import PageTitle from './PageTitle'
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useTransform, type MotionValue } from 'framer-motion'
import { useGallery, type GalleryItem } from '../hooks/useGallery'
import { useLang } from '../context/LangContext'

/**
 * GalleryPage — the /gallery collection as a sticky, stacking deck of cards.
 *
 *  • Each <li> is position:sticky, pinned a little lower than the one before it
 *    (CSS: .deck-slot), so cards pile up with their top edges fanned out.
 *  • One scroll value, `depth`, counts how many cards have landed. Each card maps
 *    it to scale + shade as newer cards cover it. Only transform/opacity animate.
 *  • Reduced motion, or a viewport too short to pin a card → a plain vertical list.
 */
interface SectionText { badge: string; title: string; sub: string }
const T: Record<string, SectionText> = {
  en: { badge: 'GALLERY',   title: 'The full collection', sub: 'Every photo from the journey, from the newest chapter back.' },
  mm: { badge: 'ပြခန်း',     title: 'ဓာတ်ပုံအားလုံး',        sub: 'ခရီးတစ်လျှောက်မှ ဓာတ်ပုံအားလုံး — နှစ်နှင့် အမျိုးအစားအလိုက်။' },
  jp: { badge: 'ギャラリー', title: '全コレクション',        sub: '旅のすべての写真を、年と章ごとに。' },
  vn: { badge: 'THƯ VIỆN',  title: 'Bộ sưu tập đầy đủ',   sub: 'Mọi bức ảnh trong hành trình, theo năm và chương.' },
  ne: { badge: 'ग्यालरी',    title: 'पूर्ण संग्रह',          sub: 'यात्राका सबै तस्बिरहरू, वर्ष र अध्याय अनुसार।' },
  id: { badge: 'GALERI',    title: 'Koleksi lengkap',     sub: 'Semua foto dari perjalanan, dikelompokkan per tahun dan babak.' },
  zh: { badge: '画廊',      title: '完整收藏',             sub: '旅途中的每一张照片，按年份和篇章分组。' },
}

const STACK_QUERY = '(prefers-reduced-motion: no-preference) and (min-height: 560px)'

function useStackable(): boolean {
  const [ok, setOk] = useState(() => window.matchMedia(STACK_QUERY).matches)
  useEffect(() => {
    const mq = window.matchMedia(STACK_QUERY)
    const onChange = () => setOk(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return ok
}

/** How many cards have landed on the deck, as a continuous number (2.5 = card 3 is halfway up). */
function useDeckDepth(stacked: boolean) {
  const deckRef = useRef<HTMLOListElement>(null)
  const depth = useMotionValue(0)
  const { scrollY } = useScroll()

  // The deck itself never sticks, so its rect is a reliable scroll reference.
  const update = () => {
    const deck = deckRef.current
    const first = deck?.children[0] as HTMLElement | undefined
    if (!stacked || !deck || !first) return
    const css = getComputedStyle(deck)
    const pitch = first.offsetHeight + (parseFloat(css.rowGap) || 0)
    // Card i pins after i * (pitch - step) px of travel past the first pin line.
    const top = parseFloat(getComputedStyle(first).top) || 0
    const second = deck.children[1] as HTMLElement | undefined
    const step = second ? (parseFloat(getComputedStyle(second).top) || top) - top : 0
    depth.set((top - deck.getBoundingClientRect().top) / Math.max(1, pitch - step))
  }

  useMotionValueEvent(scrollY, 'change', update)
  useEffect(() => {
    const deck = deckRef.current
    if (!deck) return
    const ro = new ResizeObserver(update)
    ro.observe(deck)
    update()
    return () => ro.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stacked])

  return { deckRef, depth }
}

interface CardProps {
  item: GalleryItem
  index: number
  total: number
  chapter: string
  caption: string
  alt: string
  depth: MotionValue<number>
  stacked: boolean
}

function DeckCard({ item, index, total, chapter, caption, alt, depth, stacked }: CardProps) {
  // Cards above this one: 0 → on top, 1 → just covered, 4+ → deep in the pile.
  // The last card is never covered, however far the page scrolls on.
  const covered = useTransform(depth, (d) => Math.min(Math.max(d - index, 0), total - 1 - index))
  const scale = useTransform(covered, [0, 1, 4], [1, 0.96, 0.92])
  const shade = useTransform(covered, [0, 1, 4], [0, 0.4, 0.65])
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <li className="deck-slot" style={{ '--i': index } as CSSProperties}>
      <motion.article className="deck-card dark-scope" style={stacked ? { scale } : undefined}>
        <figure className="deck-figure">
          <div className="deck-photo">
            <img
              src={item.url}
              alt={alt}
              loading={index === 0 ? 'eager' : 'lazy'}
              decoding="async"
            />
          </div>
          <figcaption className="deck-meta">
            <span className="deck-badge">{pad(index + 1)} / {pad(total)}</span>
            <span className="deck-text">
              <span className="deck-title">{caption}</span>
              <span className="deck-chapter">{chapter}</span>
            </span>
          </figcaption>
        </figure>
        {stacked && <motion.span className="deck-shade" style={{ opacity: shade }} aria-hidden />}
      </motion.article>
    </li>
  )
}

export default function GalleryPage() {
  const { lang } = useLang()
  const t = T[lang] || T.en
  const { sections, captionOf, altOf } = useGallery(lang)
  const stacked = useStackable()
  const { deckRef, depth } = useDeckDepth(stacked)

  // One continuous deck, newest first; the old group heading becomes card metadata.
  const cards = useMemo(
    () => sections.flatMap(([title, items]) => items.map((item) => ({ item, chapter: title.replace(/^Undated — /, '') }))),
    [sections],
  )

  return (
    <PageStage
      motif="gallery"
      header={(
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="font-mono text-xs uppercase tracking-[0.35em] lux-eyebrow enter-eyebrow">{t.badge}</p>
            <PageTitle className="mt-4">{t.title}</PageTitle>
            <p className="enter-sub mt-4 leading-relaxed text-gray-400">{t.sub}</p>
          </div>
        </div>
      )}
    >
    <section className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {cards.length === 0 ? (
        <p className="mt-12 font-mono text-sm text-muted">
          Drop images into <code>src/assets/images/gallery/</code> — they appear here automatically.
        </p>
      ) : (
        <ol
          ref={deckRef}
          className={`deck ${stacked ? 'is-stacked' : ''}`}
          style={{ '--gaps': Math.max(1, cards.length - 1) } as CSSProperties}
        >
          {cards.map(({ item, chapter }, i) => (
            <DeckCard
              key={item.id}
              item={item}
              index={i}
              total={cards.length}
              chapter={chapter}
              caption={captionOf(item)}
              alt={altOf(item)}
              depth={depth}
              stacked={stacked}
            />
          ))}
        </ol>
      )}
    </section>
    </PageStage>
  )
}
