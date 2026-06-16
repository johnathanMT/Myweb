import { useState } from 'react'
import { useGallery } from '../hooks/useGallery'
import MemoryDetailModal from './MemoryDetailModal'

/**
 * GalleryPage — the dedicated /gallery route (rendered inside <PageShell>, which
 * supplies the navbar, footer, ambient background and "back to home" link).
 *
 * Shows the FULL collection grouped by "Year — Event" (newest first), in a
 * responsive CSS-columns masonry (no hexagon cropping). Reuses the shared
 * <Lightbox> and the useGallery() hook.
 *
 * Language: PageShell keeps lang in localStorage under 'mtn_lang'; we read the
 * same key so captions match the rest of the site.
 */

const T = {
  en: { badge: 'GALLERY',   title: 'The full collection', sub: 'Every photo from the journey, grouped by year and chapter.' },
  mm: { badge: 'ပြခန်း',     title: 'ဓာတ်ပုံအားလုံး',        sub: 'ခရီးတစ်လျှောက်မှ ဓာတ်ပုံအားလုံး — နှစ်နှင့် အခန်းကဏ္ဍအလိုက်။' },
  jp: { badge: 'ギャラリー', title: '全コレクション',        sub: '旅のすべての写真を、年と章ごとに。' },
  vn: { badge: 'THƯ VIỆN',  title: 'Bộ sưu tập đầy đủ',   sub: 'Mọi bức ảnh trong hành trình, theo năm và chương.' },
  ne: { badge: 'ग्यालरी',    title: 'पूर्ण संग्रह',          sub: 'यात्राका सबै तस्बिरहरू, वर्ष र अध्याय अनुसार।' },
  id: { badge: 'GALERI',    title: 'Koleksi lengkap',     sub: 'Semua foto dari perjalanan, dikelompokkan per tahun dan babak.' },
  zh: { badge: '画廊',      title: '完整收藏',             sub: '旅途中的每一张照片，按年份和篇章分组。' },
}

export default function GalleryPage() {
  let lang = 'en'
  try { lang = localStorage.getItem('mtn_lang') || 'en' } catch { /* ignore */ }
  const t = T[lang] || T.en

  const { sections, captionOf, altOf } = useGallery(lang)
  const [active, setActive] = useState(null)

  const open = (it) => setActive({
    url: it.url,
    caption: captionOf(it),
    alt: altOf(it),
    date: it.meta?.date,
    moment: it.meta?.moment,
  })

  return (
    <section className="relative mx-auto max-w-6xl px-6 py-10">
      {/* header */}
      <header className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">{t.badge}</p>
        <h1 className="mt-4 text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
          {t.title}
        </h1>
        <p className="mt-4 leading-relaxed text-gray-400">{t.sub}</p>
      </header>

      {sections.length === 0 ? (
        <p className="mt-12 font-mono text-sm text-muted">
          Drop images into <code>src/assets/images/gallery/</code> — they appear here automatically.
        </p>
      ) : (
        sections.map(([title, items]) => (
          <div key={title} className="mt-14">
            {/* section heading: "2025 — Travel" */}
            <h2 className="flex items-center gap-3 text-lg font-semibold text-white">
              <span className="h-px w-6 bg-accent/60" aria-hidden />
              {title}
              <span className="font-mono text-xs font-normal text-muted">({items.length})</span>
            </h2>

            {/* CSS-columns masonry — keeps each photo's natural aspect ratio */}
            <div className="mt-6 gap-4 [column-fill:_balance] columns-2 sm:columns-3 lg:columns-4 [&>*]:mb-4 [&>*]:break-inside-avoid">
              {items.map((it) => (
                <figure
                  key={it.id}
                  onClick={() => open(it)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(it) } }}
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${captionOf(it)}`}
                  className="group relative cursor-pointer overflow-hidden rounded-lg outline-none ring-1 ring-white/10 transition-all duration-300 hover:ring-accent/50 focus-visible:ring-accent/70"
                >
                  <img
                    src={it.url}
                    alt={altOf(it)}
                    loading="lazy"
                    className="w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                  />
                  {/* caption gradient on hover/focus */}
                  <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end bg-gradient-to-t from-black/75 to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                    <span className="font-mono text-[11px] leading-tight text-accent-light">
                      {captionOf(it)}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))
      )}

      {/* shared memory detail modal (photo + metadata panel) */}
      <MemoryDetailModal item={active} onClose={() => setActive(null)} />
    </section>
  )
}
