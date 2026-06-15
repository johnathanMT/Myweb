import { useEffect, useRef, useState } from 'react'
import { useCyberReveal } from '../hooks/useCyberReveal'

/**
 * VideoShowcase — sleek glassmorphism, auto-playing highlight reel (muted, loop).
 *
 *  PERFORMANCE: the <video> source is attached ONLY when the section scrolls into
 *  view (IntersectionObserver) — nothing downloads above the fold. Plays muted +
 *  inline + loop (browser autoplay policies require muted).
 *
 *  PLUG IN YOUR VIDEO: drop a short clip at  public/showreel.mp4  (and an optional
 *  public/showreel-poster.webp) — or pass <VideoShowcase src="..." poster="..." />.
 *  Keep it ~10s and compressed (H.264 MP4, ≤ ~3–5 MB) for instant playback.
 *
 *  Theme-token colours → Batman (Hub) / Cyber (Immersive) automatically.
 */

const BASE = import.meta.env.BASE_URL || '/'

const T = {
  en: { badge: 'Showreel', title: 'Highlights in Motion', sub: 'A 10-second glimpse of the work in motion.' },
  mm: { badge: 'ရှိုးရီး', title: 'လှုပ်ရှားသော မှတ်တိုင်များ', sub: 'လုပ်ဆောင်ချက်များ၏ ၁၀ စက္ကန့် မြင်ကွင်း။' },
  jp: { badge: 'ショーリール', title: '動きで見るハイライト', sub: '作品を10秒で。' },
  zh: { badge: '短片集', title: '动态精选', sub: '十秒一览作品风采。' },
  vn: { badge: 'Showreel', title: 'Khoảnh khắc nổi bật', sub: 'Một thoáng 10 giây về công việc.' },
  ne: { badge: 'शोरिल', title: 'गतिमा झलकहरू', sub: 'कामको १० सेकेन्डको झलक।' },
  id: { badge: 'Showreel', title: 'Sorotan dalam Gerak', sub: 'Sekilas 10 detik karya dalam gerak.' },
}

export default function VideoShowcase({
  lang = 'en',
  src = `${BASE}showreel.mp4`,
  poster = `${BASE}showreel-poster.webp`,
}) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()
  const wrapRef = useRef(null)
  const videoRef = useRef(null)
  const [inView, setInView] = useState(false)

  // Attach + play only when the section enters the viewport; pause when it leaves.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) { setInView(true); videoRef.current?.play?.().catch(() => {}) }
        else videoRef.current?.pause?.()
      },
      { threshold: 0.25 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section id="showreel" ref={ref} className="relative overflow-hidden py-20 text-legible">
      <div className="pointer-events-none absolute -top-10 left-1/3 h-72 w-72 rounded-full bg-accent/8 blur-[150px]" />
      <div className="pointer-events-none absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-maroon/25 blur-[150px]" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        <div data-reveal className="mb-8 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">// {t.badge}</p>
          <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-2 text-gray-400">{t.sub}</p>
        </div>

        {/* glassmorphism video frame */}
        <div
          ref={wrapRef}
          data-reveal
          className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] p-2 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
        >
          {/* gold top sheen + soft glow ring on hover */}
          <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
          <span className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            style={{ boxShadow: '0 0 50px -10px rgb(var(--accent)/0.4)' }} />

          <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black">
            <video
              ref={videoRef}
              src={inView ? src : undefined}   // lazy: no download until visible
              poster={poster}
              muted
              loop
              playsInline
              preload="none"
              autoPlay
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.style.opacity = '0' }}
            />
            {/* fallback hint shown behind the video (visible if the file is missing) */}
            <div className="pointer-events-none absolute inset-0 -z-0 flex items-center justify-center">
              <span className="font-mono text-xs uppercase tracking-[0.3em] text-white/30">drop showreel.mp4 in /public</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
