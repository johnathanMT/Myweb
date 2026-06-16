import { useEffect, useMemo, useRef, useState } from 'react'
import Globe from 'react-globe.gl'
import * as THREE from 'three'
import { feature } from 'topojson-client'
import countriesTopo from 'world-atlas/countries-110m.json'
import { SITE } from '../config/site'

/**
 * VisitorGlobe — premium 3D world map (react-globe.gl / three.js) shown below
 * the "Highlights in Motion" reel. Country borders + continents are drawn from a
 * bundled, lightweight world GeoJSON (world-atlas 110m). The visitor's whole
 * country is filled/raised with the theme accent glow. Dark theme, auto-spins,
 * and keeps the neon overlay (Total Operators + Current Connection).
 *
 * No network beyond ipapi.co (geo) + the visitor-count API: the GeoJSON is
 * bundled, so there's nothing extra to whitelist in the CSP.
 */

// Bundled world polygons (177 countries). Converted from TopoJSON once.
const COUNTRIES = feature(countriesTopo, countriesTopo.objects.countries).features

// —— Country matching (ipapi country_name ↔ GeoJSON properties.name) ——————————
const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z]/g, '')
// Aliases for names that differ between ipapi and Natural Earth (world-atlas).
const ALIASES = {
  unitedstates: 'unitedstatesofamerica',
  usa: 'unitedstatesofamerica',
  democraticrepublicofthecongo: 'demrepcongo',
  republicofthecongo: 'congo',
  bosniaandherzegovina: 'bosniaandherz',
  dominicanrepublic: 'dominicanrep',
  equatorialguinea: 'eqguinea',
  centralafricanrepublic: 'centralafricanrep',
  southsudan: 'ssudan',
  westernsahara: 'wsahara',
  solomonislands: 'solomonis',
}
function matchCountry(name) {
  if (!name) return null
  const target = ALIASES[norm(name)] || norm(name)
  // 1) exact normalized match
  let f = COUNTRIES.find((c) => norm(c.properties.name) === target)
  if (f) return f
  // 2) fuzzy: one name contains the other (handles abbreviations)
  f = COUNTRIES.find((c) => {
    const cn = norm(c.properties.name)
    return cn && (cn.includes(target) || target.includes(cn))
  })
  return f || null
}

// Active theme accent ("--accent" = "R G B") → { r, g, b } 0..255.
function readAccent() {
  try {
    const v = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()
    const [r, g, b] = v.split(/\s+/).map(Number)
    if ([r, g, b].every(Number.isFinite)) return { r, g, b }
  } catch { /* ignore */ }
  return { r: 184, g: 134, b: 11 } // Batman gold
}

const T = {
  en: { badge: 'LIVE NETWORK', title: 'Visitors around the globe', sub: 'Every connection, mapped in real time.', ops: 'Total Operators', conn: 'Current Connection', locating: 'Locating…', unknown: 'Unknown location', byCountry: 'Operators by country' },
  mm: { badge: 'တိုက်ရိုက်ကွန်ရက်', title: 'ကမ္ဘာတစ်ဝှမ်းမှ ဧည့်သည်များ', sub: 'ချိတ်ဆက်မှုတိုင်းကို အချိန်နှင့်တပြေးညီ ပြသထားသည်။', ops: 'စုစုပေါင်း ဧည့်သည်', conn: 'လက်ရှိ ချိတ်ဆက်မှု', locating: 'တည်နေရာရှာနေသည်…', unknown: 'တည်နေရာ မသိ', byCountry: 'နိုင်ငံအလိုက် ဧည့်သည်' },
  jp: { badge: 'ライブネットワーク', title: '世界中からの訪問者', sub: 'すべての接続をリアルタイムで可視化。', ops: '総オペレーター数', conn: '現在の接続', locating: '位置情報を取得中…', unknown: '不明な場所', byCountry: '国別オペレーター' },
  vn: { badge: 'MẠNG TRỰC TIẾP', title: 'Khách truy cập toàn cầu', sub: 'Mọi kết nối, hiển thị theo thời gian thực.', ops: 'Tổng người dùng', conn: 'Kết nối hiện tại', locating: 'Đang định vị…', unknown: 'Vị trí không xác định', byCountry: 'Người dùng theo quốc gia' },
  ne: { badge: 'प्रत्यक्ष नेटवर्क', title: 'विश्वभरका आगन्तुकहरू', sub: 'प्रत्येक जडान, वास्तविक समयमा।', ops: 'कुल आगन्तुक', conn: 'हालको जडान', locating: 'स्थान खोज्दै…', unknown: 'अज्ञात स्थान', byCountry: 'देश अनुसार आगन्तुक' },
  id: { badge: 'JARINGAN LANGSUNG', title: 'Pengunjung di seluruh dunia', sub: 'Setiap koneksi, dipetakan secara real-time.', ops: 'Total Operator', conn: 'Koneksi Saat Ini', locating: 'Mencari lokasi…', unknown: 'Lokasi tidak diketahui', byCountry: 'Pengunjung per negara' },
  zh: { badge: '实时网络', title: '来自全球的访客', sub: '每一次连接，实时呈现。', ops: '访客总数', conn: '当前连接', locating: '正在定位…', unknown: '未知位置', byCountry: '各国访客' },
}

export default function VisitorGlobe({ lang = 'en' }) {
  const t = T[lang] || T.en
  const globeEl = useRef()
  const wrapRef = useRef()
  const [size, setSize] = useState(0) // square px

  const [geo, setGeo] = useState({ status: 'loading', lat: null, long: null, city: '', country: '' })
  const [visits, setVisits] = useState(null)
  const [display, setDisplay] = useState(0)
  const [countries, setCountries] = useState([])

  const ac = useMemo(readAccent, [])
  const userCountry = useMemo(() => matchCountry(geo.country), [geo.country])
  const globeMaterial = useMemo(() => new THREE.MeshPhongMaterial({ color: '#0b0b14' }), [])

  // 1) VISIT COUNT + COUNTRY BREAKDOWN — runs once geolocation has settled, so
  //    the hit can be attributed to the visitor's country. Verbose console
  //    logging surfaces fetch / CORS / "backend not deployed" issues.
  useEffect(() => {
    if (geo.status !== 'done') return
    const base = SITE.apiUrl
    console.log('[VisitorGlobe] API base =', base, '| country =', geo.country || '(none)')
    let cancelled = false
    ;(async () => {
      // a) count this visit once per browser session (with country), else read.
      try {
        let counted = false
        try { counted = sessionStorage.getItem('mtn_visit_counted') === '1' } catch { /* ignore */ }
        const url = counted
          ? `${base}/api/visitors`
          : `${base}/api/visitors/hit?country=${encodeURIComponent(geo.country || '')}`
        console.log('[VisitorGlobe]', counted ? 'GET' : 'POST', url)
        const res = await fetch(url, { method: counted ? 'GET' : 'POST' })
        console.log('[VisitorGlobe] /visitors →', res.status, res.statusText)
        if (!res.ok) {
          const body = await res.text().catch(() => '')
          console.error('[VisitorGlobe] /visitors NON-OK:', res.status, body)
        } else {
          const data = await res.json()
          console.log('[VisitorGlobe] /visitors data:', data)
          if (!cancelled && typeof data?.totalVisits === 'number') {
            setVisits(data.totalVisits)
            try { sessionStorage.setItem('mtn_visit_counted', '1') } catch { /* ignore */ }
          }
        }
      } catch (err) {
        console.error('[VisitorGlobe] /visitors FETCH FAILED (CORS / network / backend not deployed?):', err)
      }

      // b) country breakdown
      try {
        const res = await fetch(`${base}/api/visitors/countries`)
        console.log('[VisitorGlobe] /countries →', res.status)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled && Array.isArray(data?.countries)) setCountries(data.countries)
        }
      } catch (err) {
        console.error('[VisitorGlobe] /countries FETCH FAILED:', err)
      }
    })()
    return () => { cancelled = true }
  }, [geo.status, geo.country])

  // 2) GEOLOCATION — coarse, IP-based, free.
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
        const valid = Number.isFinite(lat) && Number.isFinite(long) && Math.abs(lat) <= 90 && Math.abs(long) <= 180
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

  // 3) COUNTER ANIMATION.
  useEffect(() => {
    if (visits == null) return
    let raf
    const start = performance.now()
    const dur = 1400
    const tick = (now) => {
      const p = Math.min(1, (now - start) / dur)
      setDisplay(Math.round(visits * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visits])

  // 4) RESPONSIVE SQUARE SIZE.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setSize(el.clientWidth))
    ro.observe(el)
    setSize(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  // 5) AUTO-SPIN once the globe is mounted.
  useEffect(() => {
    const g = globeEl.current
    if (!g || !size) return
    const controls = g.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.enableZoom = false
  }, [size])

  // 6) FLY the camera to the visitor's coordinates when known.
  useEffect(() => {
    if (globeEl.current && geo.lat != null && geo.long != null) {
      globeEl.current.pointOfView({ lat: geo.lat, lng: geo.long, altitude: 2.2 }, 1200)
    }
  }, [geo.lat, geo.long])

  const accentRgb = `rgb(${ac.r}, ${ac.g}, ${ac.b})`
  const capColor = (d) =>
    d === userCountry ? `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.92)` : 'rgba(255, 255, 255, 0.07)'
  const sideColor = (d) =>
    d === userCountry ? `rgba(${ac.r}, ${ac.g}, ${ac.b}, 0.35)` : 'rgba(0, 0, 0, 0.12)'

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

        <div className="relative mx-auto mt-12 w-full max-w-[520px]">
          {/* the globe (square, responsive) */}
          <div ref={wrapRef} className="relative aspect-square w-full">
            {size > 0 && (
              <Globe
                ref={globeEl}
                width={size}
                height={size}
                backgroundColor="rgba(0,0,0,0)"
                globeMaterial={globeMaterial}
                showAtmosphere
                atmosphereColor={accentRgb}
                atmosphereAltitude={0.18}
                polygonsData={COUNTRIES}
                polygonCapColor={capColor}
                polygonSideColor={sideColor}
                polygonStrokeColor={() => 'rgba(255, 255, 255, 0.22)'}
                polygonAltitude={(d) => (d === userCountry ? 0.07 : 0.012)}
                polygonsTransitionDuration={800}
              />
            )}
          </div>

          {/* neon overlay — Total Operators + Current Connection */}
          <div className="neon-overlay pointer-events-none mt-6 grid w-full grid-cols-1 gap-3 sm:absolute sm:bottom-2 sm:left-0 sm:mt-0 sm:w-auto sm:grid-cols-2 sm:gap-4">
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

        {/* ── VISITOR BREAKDOWN BY COUNTRY (neon, scrollable) ── */}
        {countries.length > 0 && (
          <div className="mx-auto mt-12 w-full max-w-md rounded-2xl border border-accent/25 bg-black/40 p-5 text-left shadow-[0_0_30px_-10px_rgb(var(--accent)/0.5)] backdrop-blur-md">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent/80">{t.byCountry}</p>
            <ul className="mt-3 max-h-56 space-y-2.5 overflow-y-auto overscroll-contain pr-1">
              {countries.map((c) => {
                const max = countries[0]?.visits || 1
                const pct = Math.max(6, Math.round((c.visits / max) * 100))
                return (
                  <li key={c.country}>
                    <div className="flex items-center justify-between font-mono text-xs text-gray-200">
                      <span className="truncate">{c.country}</span>
                      <span className="ml-3 tabular-nums text-accent-light">{Number(c.visits).toLocaleString()}</span>
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-accent/80 shadow-[0_0_8px_rgb(var(--accent)/0.7)] transition-[width] duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
