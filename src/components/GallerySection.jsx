import { useMemo } from 'react'
import { useCyberReveal } from '../hooks/useCyberReveal'
import { GALLERY } from '../data/galleryData'

/**
 * GallerySection — "Memory Gallery" (zero-config, auto-discovering).
 *
 *  THE FOLDER IS THE SOURCE OF TRUTH: every image in src/assets/images/gallery/
 *  is rendered automatically (Vite bundles + content-hashes them). Just drop a
 *  file in — no code change needed.
 *
 *  galleryData.js is an OPTIONAL i18n layer, matched by filename:
 *    • in galleryData → use its translated caption/alt.
 *    • not in galleryData → still shown, with a clean caption auto-derived from
 *      the filename ('mtn-namba.jpg' → 'Mtn Namba').
 *
 *  Layout: left copy + right staggered HEXAGON grid (dark glass + amber accents).
 */

// 1) FOLDER = source of truth. eager glob → { '../assets/.../x.jpg': '/hashed-url' }
const IMAGES = import.meta.glob(
  '../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}',
  { eager: true, import: 'default', query: '?url' }
)

// 2) Optional metadata, keyed by filename for quick lookup.
const META = Object.fromEntries(GALLERY.map((g) => [g.file, g]))

// 3) Turn a filename into a clean label: 'new-photo_02.jpg' → 'New Photo 02'.
const labelFromFile = (file) =>
  file.replace(/\.[^.]+$/, '')      // drop extension
      .replace(/[_-]+/g, ' ')       // _ and - → space
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase())

// 4) Build the render list FROM THE FOLDER, attaching metadata when present.
const ITEMS = Object.entries(IMAGES)
  .map(([path, url]) => {
    const file = path.split('/').pop()
    return { id: file, file, url, meta: META[file] || null }
  })
  .sort((a, b) => a.file.localeCompare(b.file))

// Pointy-top regular hexagon (aspect ratio 1 : 1.1547 keeps it regular).
const HEX = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'

// Section copy (i18n). Per-photo captions come from galleryData.js (optional).
const T = {
  en: { badge: 'GALLERY',   title: 'A collection of', accent: 'moments & memories', sub: 'Photos from the journey — places, projects, and people along the way.', cta: 'Read the blog' },
  mm: { badge: 'ပြခန်း',     title: 'စုဆောင်းထားသော', accent: 'အမှတ်တရ ခဏများ',     sub: 'ခရီးတစ်လျှောက်မှ ဓာတ်ပုံများ — နေရာများ၊ ပရောဂျက်များနှင့် လူများ။',        cta: 'ဘလော့ဖတ်ရန်' },
  jp: { badge: 'ギャラリー', title: '集めた',          accent: '瞬間と思い出',       sub: '旅の写真 — 場所、プロジェクト、出会った人々。',                                cta: 'ブログを読む' },
  vn: { badge: 'THƯ VIỆN',  title: 'Bộ sưu tập',     accent: 'khoảnh khắc & kỷ niệm', sub: 'Ảnh từ hành trình — địa điểm, dự án và những con người.',                  cta: 'Đọc blog' },
  ne: { badge: 'ग्यालरी',    title: 'संग्रह',          accent: 'क्षण र सम्झनाहरू',    sub: 'यात्राका तस्बिरहरू — ठाउँ, परियोजना र मानिसहरू।',                            cta: 'ब्लग पढ्नुहोस्' },
  id: { badge: 'GALERI',    title: 'Koleksi',        accent: 'momen & kenangan',   sub: 'Foto dari perjalanan — tempat, proyek, dan orang-orang.',                  cta: 'Baca blog' },
  zh: { badge: '画廊',      title: '收藏',           accent: '瞬间与回忆',          sub: '旅途中的照片 —— 地方、项目与遇见的人。',                                      cta: '阅读博客' },
}

export default function GallerySection({ lang = 'en' }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()
  const pick = (obj) => (obj && (obj[lang] || obj.en)) || ''
  const items = useMemo(() => ITEMS, [])

  // caption: i18n from metadata if present, else auto-derived from filename.
  const captionOf = (it) => (it.meta && pick(it.meta.caption)) || labelFromFile(it.file)
  const altOf = (it) => (it.meta && pick(it.meta.alt)) || captionOf(it)

  return (
    <section id="gallery" ref={ref} className="relative overflow-hidden py-24">
      {/* calm maroon + gold ambient glows (no busy dot-grid) */}
      <div className="pointer-events-none absolute -top-10 right-1/4 h-80 w-80 rounded-full bg-maroon/25 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-72 w-72 rounded-full bg-accent/8 blur-[150px]" />

      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2 lg:gap-16">
        {/* ── LEFT: copy ── */}
        <div data-reveal>
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">{t.badge}</p>
          <h2 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
            {t.title} <span className="text-accent">{t.accent}</span>
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-gray-400">{t.sub}</p>
          <a
            href="#articles"
            className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-accent/10 hover:text-accent-light"
          >
            {t.cta} <span aria-hidden>→</span>
          </a>
        </div>

        {/* ── RIGHT: staggered HEXAGON photo grid (auto-discovered) ── */}
        {items.length === 0 ? (
          <p data-reveal className="font-mono text-sm text-muted">
            Drop images into <code>src/assets/images/gallery/</code> — they appear here automatically.
          </p>
        ) : (
          <div
            data-reveal
            className="mx-auto grid w-full max-w-md grid-cols-3 gap-2.5 sm:gap-3 [&>*:nth-child(3n+2)]:translate-y-8"
          >
            {items.map((it) => (
              <figure
                key={it.id}
                className="group transition-[transform,filter] duration-300 hover:-translate-y-1 hover:[filter:drop-shadow(0_0_14px_rgb(var(--accent)/0.55))]"
              >
                {/* outer hex = the (amber-on-hover) border ring */}
                <div
                  className="bg-white/10 p-[2px] transition-colors duration-300 group-hover:bg-accent/70"
                  style={{ clipPath: HEX, aspectRatio: '1 / 1.1547' }}
                >
                  {/* inner hex holds the photo + hover caption */}
                  <div className="relative h-full w-full overflow-hidden" style={{ clipPath: HEX }}>
                    <img
                      src={it.url}
                      alt={altOf(it)}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                    {/* caption on hover, clipped to the hexagon */}
                    <figcaption className="absolute inset-0 flex items-center justify-center bg-black/55 px-2 text-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="font-mono text-[10px] leading-tight text-accent-light sm:text-[11px]">
                        {captionOf(it)}
                      </span>
                    </figcaption>
                  </div>
                </div>
              </figure>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
