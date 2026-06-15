import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCyberReveal } from '../hooks/useCyberReveal'
import { MONTHS } from '../data/content'

// ── ZERO-CONFIG month images ────────────────────────────────────────────────
// Drop january.webp … december.webp into src/assets/images/months/ and they
// auto-bind by month name. Vite bundles + content-hashes them.
const MONTH_IMAGES = import.meta.glob(
  '../assets/images/months/*.{webp,jpg,jpeg,png,avif}',
  { eager: true, import: 'default', query: '?url' }
)
// Resolve a local image for a month (e.g. 'JANUARY' → .../january.webp) or null.
const localMonthImg = (name) => {
  const key = `/${name.toLowerCase()}.`
  const hit = Object.entries(MONTH_IMAGES).find(([path]) => path.toLowerCase().includes(key))
  return hit ? hit[1] : null
}

/**
 * SeasonalGallery — "Year in Focus" → Myanmar's 12 Months of Festivals.
 *
 *  A high-performance, GPU-friendly HORIZONTAL SCROLL-SNAP carousel (pure CSS
 *  scroll-snap + smooth scroll — no per-frame JS). Each month is a glass card.
 *
 *  ROBUST IMAGES: every card renders a themed gradient placeholder UNDERNEATH
 *  the photo. If the image is missing or fails to load, it hides itself and the
 *  sleek placeholder shows — never a broken-image icon.
 *
 *  Theme-aware (token colours) + i18n heading. Festival data: data/content.js.
 */

const T = {
  en: { badge: 'Year in Focus', title: 'Myanmar · 12 Months of Festivals', sub: 'One celebration for every month — drag or use the arrows to explore.' },
  mm: { badge: 'တစ်နှစ်တာ', title: 'မြန်မာ့ ၁၂ လ ပွဲတော်များ', sub: 'လတိုင်းအတွက် ပွဲတော်တစ်ခု — ဆွဲ၍ သို့မဟုတ် မြှားဖြင့် ကြည့်ပါ။' },
  jp: { badge: '一年の歩み', title: 'ミャンマー · 12ヶ月の祭り', sub: '毎月ひとつのお祭り — ドラッグまたは矢印で。' },
  vn: { badge: 'Một năm', title: 'Myanmar · 12 Tháng Lễ Hội', sub: 'Mỗi tháng một lễ hội — kéo hoặc dùng mũi tên.' },
  ne: { badge: 'वर्ष', title: 'म्यानमार · १२ महिने चाडपर्व', sub: 'हरेक महिना एउटा चाड — स्क्रोल वा तीर प्रयोग गर्नुहोस्।' },
  id: { badge: 'Setahun', title: 'Myanmar · 12 Bulan Festival', sub: 'Satu perayaan tiap bulan — geser atau gunakan panah.' },
  zh: { badge: '年度回顾', title: '缅甸 · 十二个月的节日', sub: '每月一个庆典 —— 拖动或使用箭头浏览。' },
}

function MonthCard({ m }) {
  const [imgOk, setImgOk] = useState(true)
  const abbr = m.name.slice(0, 3)
  // Prefer a dropped-in local image; fall back to any data URL; else placeholder.
  const src = localMonthImg(m.name) || m.img
  return (
    <figure
      className="group relative h-[420px] w-[280px] flex-shrink-0 snap-center overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-[0_20px_50px_-25px_rgba(0,0,0,0.85)] backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1 sm:w-[320px]"
    >
      {/* themed placeholder (always behind the photo) */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-center"
        style={{ background: `radial-gradient(120% 80% at 50% 20%, ${m.color}33, transparent 60%), linear-gradient(160deg, ${m.color}22, #141414 70%)` }}
        aria-hidden
      >
        <span className="font-mono text-6xl font-black tracking-tight" style={{ color: `${m.color}55` }}>{abbr}</span>
        <span className="mt-1 font-mono text-[10px] uppercase tracking-[0.4em]" style={{ color: `${m.color}aa` }}>Myanmar</span>
      </div>

      {/* the photo — hides itself on error so the placeholder shows through */}
      {src && imgOk && (
        <img
          src={src}
          alt={`${m.festival} — ${m.name}`}
          loading="lazy"
          onError={() => setImgOk(false)}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      )}

      {/* legibility gradient + info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <span className="absolute left-0 top-0 h-1 w-full" style={{ background: m.color }} />
      <figcaption className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em]" style={{ color: m.color }}>{m.name}</p>
        <h3 className="mt-1 text-lg font-bold leading-snug text-white">{m.festival}</h3>
        <p className="mt-0.5 text-xs text-gray-300">{m.region}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          {m.desc}
        </p>
      </figcaption>
    </figure>
  )
}

export default function SeasonalGallery({ lang = 'en' }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()
  const track = useRef(null)

  const scrollBy = (dir) => {
    const el = track.current
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.85), behavior: 'smooth' })
  }

  return (
    <section id="seasonal" ref={ref} className="relative overflow-hidden border-t border-white/5 py-24 text-legible">
      {/* calm gold + maroon ambient glows */}
      <div className="pointer-events-none absolute -top-10 right-1/4 h-72 w-72 rounded-full bg-accent/8 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-80 w-80 rounded-full bg-maroon/25 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div data-reveal className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">// {t.badge}</p>
            <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
            <p className="mt-2 max-w-lg text-gray-400">{t.sub}</p>
          </div>
          {/* arrow controls */}
          <div className="flex gap-2">
            <button onClick={() => scrollBy(-1)} aria-label="Previous"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-gray-300 transition-all hover:border-accent/50 hover:text-accent">
              <ChevronLeft size={18} />
            </button>
            <button onClick={() => scrollBy(1)} aria-label="Next"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-gray-300 transition-all hover:border-accent/50 hover:text-accent">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* scroll-snap carousel (hidden scrollbar, smooth) */}
        <div
          ref={track}
          data-reveal
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {MONTHS.map((m) => <MonthCard key={m.name} m={m} />)}
        </div>
      </div>
    </section>
  )
}
