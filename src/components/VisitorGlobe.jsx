import { useEffect, useRef, useState } from 'react'
import createGlobe from 'cobe'
import { SITE } from '../config/site'

/**
 * VisitorGlobe — premium, auto-spinning 3D globe (cobe) shown below the
 * "Highlights in Motion" reel. Glowing markers (theme accent colour) pin live
 * locations; the visitor's own coordinates get the biggest, brightest dot.
 * A neon overlay shows:
 *   • Total Operators (Visitors) — live count from the .NET backend.
 *   • Current Connection — the visitor's city / country (from ipapi.co).
 *
 * IMPORTANT (bug fix): the globe is created EXACTLY ONCE, after geolocation has
 * resolved (or timed out). cobe can render blank if you re-init it on the same
 * <canvas>, so we wait for the final marker set before creating it.
 */

// A few ambient "live" markers so the globe always looks populated.
const AMBIENT_MARKERS = [
  { location: [35.6762, 139.6503], size: 0.05 }, // Tokyo
  { location: [51.5074, -0.1278], size: 0.05 },  // London
  { location: [40.7128, -74.006], size: 0.05 },  // New York
  { location: [1.3521, 103.8198], size: 0.05 },  // Singapore
  { location: [-33.8688, 151.2093], size: 0.05 },// Sydney
  { location: [-23.5505, -46.6333], size: 0.05 },// São Paulo
  { location: [28.6139, 77.209], size: 0.05 },   // New Delhi
]

// Read the active theme accent ("--accent" = "R G B") → [r,g,b] 0..1 for cobe.
function accentRGB() {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const parts = v.split(/\s+/).map(Number)
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      // Brighten a touch so markers glow clearly on the dark globe.
      return parts.map((n) => Math.min(1, (n / 255) * 1.25))
    }
  } catch { /* ignore */ }
  return [0.85, 0.62, 0.05] // fallback: bright gold
}

const T = {
  en: { badge: 'LIVE NETWORK', title: 'Visitors around the globe', sub: 'Every connection, mapped in real time.', ops: 'Total Operators', conn: 'Current Connection', locating: 'Locating…', unknown: 'Unknown location' },
  mm: { badge: 'တိုက်ရိုက်ကွန်ရက်', title: 'ကမ္ဘာတစ်ဝှမ်းမှ ဧည့်သည်များ', sub: 'ချိတ်ဆက်မှုတိုင်းကို အချိန်နှင့်တပြေးညီ ပြသထားသည်။', ops: 'စုစုပေါင်း ဧည့်သည်', conn: 'လက်ရှိ ချိတ်ဆက်မှု', locating: 'တည်နေရာရှာနေသည်…', unknown: 'တည်နေရာ မသိ' },
  jp: { badge: 'ライブネットワーク', title: '世界中からの訪問者', sub: 'すべての接続をリアルタイムで可視化。', ops: '総オペレーター数', conn: '現在の接続', locating: '位置情報を取得中…', unknown: '不明な場所' },
  vn: { badge: 'MẠNG TRỰC TIẾP', title: 'Khách truy cập toàn cầu', sub: 'Mọi kết nối, hiển thị theo thời gian thực.', ops: 'Tổng người dùng', conn: 'Kết nối hiện tại', locating: 'Đang định vị…', unknown: 'Vị trí không xác định' },
  ne: { badge: 'प्रत्यक्ष नेटवर्क', title: 'विश्वभरका आगन्तुकहरू', sub: 'प्रत्येक जडान, वास्तविक समयमा।', ops: 'कुल आगन्तुक', conn: 'हालको जडान', locating: 'स्थान खोज्दै…', unknown: 'अज्ञात स्थान' },
  id: { badge: 'JARINGAN LANGSUNG', title: 'Pengunjung di seluruh dunia', sub: 'Setiap koneksi, dipetakan secara real-time.', ops: 'Total Operator', conn: 'Koneksi Saat Ini', locating: 'Mencari lokasi…', unknown: 'Lokasi tidak diketahui' },
  zh: { badge: '实时网络', title: '来自全球的访客', sub: '每一次连接，实时呈现。', ops: '访客总数', conn: '当前连接', locating: '正在定位…', unknown: '未知位置' },
}

export default function VisitorGlobe({ lang = 'en' }) {
  const t = T[lang] || T.en
  const canvasRef = useRef(null)
  const phiRef = useRef(0)

  // geo.status: 'loading' until the ipapi fetch settles (or times out).
  const [geo, setGeo] = useState({ status: 'loading', lat: null, long: null, city: '', country: '' })
  const [visits, setVisits] = useState(null)
  const [display, setDisplay] = useState(0)

  // 1) VISITOR COUNT — increment once per session, else just read.
  useEffect(() => {
    let cancelled = false
    const base = SITE.apiUrl
    ;(async () => {
      try {
        let counted = false
        try { counted = sessionStorage.getItem('mtn_visit_counted') === '1' } catch { /* ignore */ }
        const res = await fetch(`${base}/api/visitors${counted ? '' : '/hit'}`, { method: counted ? 'GET' : 'POST' })
        const data = await res.json()
        if (!cancelled && data && typeof data.totalVisits === 'number') {
          setVisits(data.totalVisits)
          try { sessionStorage.setItem('mtn_visit_counted', '1') } catch { /* ignore */ }
        }
      } catch { /* backend offline → counter hidden */ }
    })()
    return () => { cancelled = true }
  }, [])

  // 2) GEOLOCATION — coarse, IP-based, free. Settle exactly once (success,
  //    failure, or 2.5s timeout) so the globe can create with final markers.
  useEffect(() => {
    let done = false
    const finish = (partial) => {
      if (done) return
      done = true
      setGeo({ status: 'done', lat: null, long: null, city: '', country: '', ...partial })
    }
    const timer = setTimeout(() => finish({}), 2500)
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => {
        const lat = Number(d?.latitude)
        const long = Number(d?.longitude)
        const valid = Number.isFinite(lat) && Number.isFinite(long) &&
          Math.abs(lat) <= 90 && Math.abs(long) <= 180
        finish({
          lat: valid ? lat : null,
          long: valid ? long : null,
          city: d?.city || '',
          country: d?.country_name || '',
        })
      })
      .catch(() => finish({}))
    return () => clearTimeout(timer)
  }, [])

  // 3) COUNTER ANIMATION — ease toward the real total when it arrives.
  useEffect(() => {
    if (visits == null) return
    let raf
    const start = performance.now()
    const dur = 1400
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(visits * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visits])

  // 4) THE GLOBE — created ONCE, after geolocation settles (status === 'done').
  const ready = geo.status === 'done'
  useEffect(() => {
    if (!ready || !canvasRef.current) return

    let width = 0
    const onResize = () => { if (canvasRef.current) width = canvasRef.current.offsetWidth }
    window.addEventListener('resize', onResize)
    onResize()

    const accent = accentRGB()
    const hasUser = geo.lat != null && geo.long != null
    const markers = [
      ...AMBIENT_MARKERS,
      ...(hasUser ? [{ location: [geo.lat, geo.long], size: 0.11 }] : []),
    ]

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: width * 2,
      height: width * 2,
      phi: 0,
      theta: 0.28,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.24, 0.24, 0.27],
      markerColor: accent,
      glowColor: accent,
      markers,
      onRender: (state) => {
        state.phi = phiRef.current
        phiRef.current += 0.004 // gentle auto-spin
        state.width = width * 2
        state.height = width * 2
      },
    })

    // Fade the canvas in once the first frame paints.
    requestAnimationFrame(() => { if (canvasRef.current) canvasRef.current.style.opacity = '1' })

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
    // Recreate only if the resolved coordinates change (effectively once).
  }, [ready, geo.lat, geo.long])

  const connectionText =
    geo.status === 'loading'
      ? t.locating
      : ([geo.city, geo.country].filter(Boolean).join(', ') || t.unknown)

  return (
    <section id="network" className="relative overflow-hidden py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">{t.badge}</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
          {t.title}
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-400">{t.sub}</p>

        <div className="relative mx-auto mt-12 flex w-full max-w-[480px] flex-col items-center">
          <div className="relative aspect-square w-full">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', opacity: 0, transition: 'opacity 1s ease', contain: 'layout paint size' }}
              aria-label="Interactive 3D globe of visitor locations"
            />
          </div>

          <div className="pointer-events-none mt-6 grid w-full grid-cols-1 gap-3 sm:absolute sm:bottom-2 sm:left-0 sm:mt-0 sm:w-auto sm:grid-cols-2 sm:gap-4">
            <div className="rounded-2xl border border-accent/30 bg-black/50 px-5 py-3 text-left shadow-[0_0_24px_-6px_rgb(var(--accent)/0.6)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.ops}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-white [text-shadow:0_0_12px_rgb(var(--accent)/0.7)]">
                {visits == null ? '——' : display.toLocaleString()}
              </p>
            </div>

            <div className="rounded-2xl border border-accent/30 bg-black/50 px-5 py-3 text-left shadow-[0_0_24px_-6px_rgb(var(--accent)/0.6)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.conn}</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-sm font-medium text-white">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_2px_rgb(var(--accent)/0.8)]" />
                {connectionText}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
