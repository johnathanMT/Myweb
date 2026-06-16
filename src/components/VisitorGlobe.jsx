import { useEffect, useRef, useState } from 'react'
import createGlobe from 'cobe'
import { SITE } from '../config/site'

/**
 * VisitorGlobe — premium, auto-spinning 3D globe (cobe) shown below the
 * "Highlights in Motion" reel. A glowing marker (theme accent colour) pins the
 * visitor's approximate location, with a neon overlay showing:
 *   • Total Operators (Visitors) — live count from the .NET backend.
 *   • Current Connection — the visitor's city / country (from ipapi.co).
 *
 * Privacy: ipapi.co returns only coarse, IP-based geolocation (city level) and
 * is shown to the visitor about themselves; nothing is stored client-side
 * beyond a per-session "already counted" flag.
 */

// Read the active theme accent ("--accent" = "R G B") → [r,g,b] 0..1 for cobe.
function accentRGB() {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const parts = v.split(/\s+/).map(Number)
    if (parts.length === 3 && parts.every((n) => Number.isFinite(n))) {
      return [parts[0] / 255, parts[1] / 255, parts[2] / 255]
    }
  } catch { /* ignore */ }
  return [0.72, 0.53, 0.04] // fallback: Batman gold
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
  const [location, setLocation] = useState(null) // { lat, long, city, country }
  const [visits, setVisits] = useState(null)      // number | null
  const [display, setDisplay] = useState(0)        // animated counter value

  // 1) VISITOR COUNT — increment once per browser session, else just read.
  useEffect(() => {
    let cancelled = false
    const base = SITE.apiUrl
    const run = async () => {
      try {
        let counted = false
        try { counted = sessionStorage.getItem('mtn_visit_counted') === '1' } catch { /* ignore */ }
        const res = await fetch(`${base}/api/visitors${counted ? '' : '/hit'}`, {
          method: counted ? 'GET' : 'POST',
        })
        const data = await res.json()
        if (!cancelled && data && typeof data.totalVisits === 'number') {
          setVisits(data.totalVisits)
          try { sessionStorage.setItem('mtn_visit_counted', '1') } catch { /* ignore */ }
        }
      } catch { /* backend offline → counter stays hidden */ }
    }
    run()
    return () => { cancelled = true }
  }, [])

  // 2) GEOLOCATION — coarse, IP-based, free (no key).
  useEffect(() => {
    let cancelled = false
    fetch('https://ipapi.co/json/')
      .then((r) => r.json())
      .then((d) => {
        if (cancelled || !d) return
        const lat = Number(d.latitude)
        const long = Number(d.longitude)
        setLocation({
          lat: Number.isFinite(lat) ? lat : null,
          long: Number.isFinite(long) ? long : null,
          city: d.city || '',
          country: d.country_name || '',
        })
      })
      .catch(() => { /* leave location null → no marker */ })
    return () => { cancelled = true }
  }, [])

  // 3) COUNTER ANIMATION — ease toward the real total when it arrives.
  useEffect(() => {
    if (visits == null) return
    let raf
    const start = performance.now()
    const from = 0
    const dur = 1400
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic
      setDisplay(Math.round(from + (visits - from) * eased))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visits])

  // 4) THE GLOBE — recreate when location (→ marker) changes.
  useEffect(() => {
    if (!canvasRef.current) return
    let width = 0
    const onResize = () => { if (canvasRef.current) width = canvasRef.current.offsetWidth }
    window.addEventListener('resize', onResize)
    onResize()

    const accent = accentRGB()
    const hasMarker = location && location.lat != null && location.long != null
    const markers = hasMarker ? [{ location: [location.lat, location.long], size: 0.12 }] : []

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

    // Fade the canvas in once the first frame is painted.
    if (canvasRef.current) {
      requestAnimationFrame(() => { if (canvasRef.current) canvasRef.current.style.opacity = '1' })
    }

    return () => {
      globe.destroy()
      window.removeEventListener('resize', onResize)
    }
  }, [location])

  return (
    <section id="network" className="relative overflow-hidden py-24">
      {/* ambient accent glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-accent/10 blur-[160px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent/90">{t.badge}</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-5xl">
          {t.title}
        </h2>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-gray-400">{t.sub}</p>

        <div className="relative mx-auto mt-12 flex w-full max-w-[480px] flex-col items-center">
          {/* the globe */}
          <div className="relative aspect-square w-full">
            <canvas
              ref={canvasRef}
              style={{ width: '100%', height: '100%', opacity: 0, transition: 'opacity 1s ease', contain: 'layout paint size' }}
              aria-label="Interactive 3D globe of visitor locations"
            />
          </div>

          {/* neon overlay cards */}
          <div className="pointer-events-none mt-6 grid w-full grid-cols-1 gap-3 sm:absolute sm:bottom-2 sm:left-0 sm:mt-0 sm:w-auto sm:grid-cols-2 sm:gap-4">
            {/* Total Operators */}
            <div className="rounded-2xl border border-accent/30 bg-black/50 px-5 py-3 text-left shadow-[0_0_24px_-6px_rgb(var(--accent)/0.6)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.ops}</p>
              <p className="mt-1 font-mono text-2xl font-bold text-white [text-shadow:0_0_12px_rgb(var(--accent)/0.7)]">
                {visits == null ? '——' : display.toLocaleString()}
              </p>
            </div>

            {/* Current Connection */}
            <div className="rounded-2xl border border-accent/30 bg-black/50 px-5 py-3 text-left shadow-[0_0_24px_-6px_rgb(var(--accent)/0.6)] backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.conn}</p>
              <p className="mt-1 flex items-center gap-2 font-mono text-sm font-medium text-white">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent shadow-[0_0_8px_2px_rgb(var(--accent)/0.8)]" />
                {location == null
                  ? t.locating
                  : ([location.city, location.country].filter(Boolean).join(', ') || t.unknown)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
