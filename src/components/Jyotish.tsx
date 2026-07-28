import { useState, type FormEvent } from 'react'
import { Sparkles, MapPin, Loader2 } from 'lucide-react'
import { SITE } from '../config/site'
import KundliChart from './KundliChart'
import type { BirthChartData, BirthChartRequest } from '../types/astrology'

const CHART_URL = `${SITE.apiUrl}/api/astrology/chart`

// Preset cities so the MVP works without a geocoder (autocomplete = later phase).
interface Preset { label: string; lat: number; lon: number; tz: string }
const PRESETS: Preset[] = [
  { label: 'Yangon', lat: 16.8409, lon: 96.1735, tz: 'Asia/Yangon' },
  { label: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { label: 'Bangkok', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { label: 'New Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
  { label: 'London', lat: 51.5074, lon: -0.1278, tz: 'Europe/London' },
  { label: 'New York', lat: 40.7128, lon: -74.006, tz: 'America/New_York' },
]
const browserTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' } })()
const TZ_OPTIONS = [...new Set([browserTz, ...PRESETS.map((p) => p.tz), 'UTC'])]

const deg = (d: number) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}'`
const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent/50'
const labelCls = 'block font-mono text-[11px] uppercase tracking-wider text-muted'
const SIGN_ABBR = ['Ar', 'Ta', 'Ge', 'Cn', 'Le', 'Vi', 'Li', 'Sc', 'Sg', 'Cp', 'Aq', 'Pi']

export default function Jyotish() {
  const [date, setDate] = useState('1998-01-01')
  const [time, setTime] = useState('12:00')
  const [lat, setLat] = useState('16.8409')
  const [lon, setLon] = useState('96.1735')
  const [tz, setTz] = useState(browserTz)
  const [data, setData] = useState<BirthChartData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const applyPreset = (p: Preset) => { setLat(String(p.lat)); setLon(String(p.lon)); setTz(p.tz) }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(''); setLoading(true); setData(null)
    try {
      const [y, mo, d] = date.split('-').map(Number)
      const [h, mi] = time.split(':').map(Number)
      const body: BirthChartRequest = {
        year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
        timeZone: tz, latitude: Number(lat), longitude: Number(lon), ayanamsa: 'lahiri',
      }
      const res = await fetch(CHART_URL, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      })
      const json = (await res.json().catch(() => null)) as { success?: boolean; data?: BirthChartData; message?: string } | null
      if (!res.ok || !json?.success || !json.data) throw new Error(json?.message || `Failed (${res.status})`)
      setData(json.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute the chart.')
    } finally { setLoading(false) }
  }

  const moon = data?.planets.find((p) => p.name === 'Moon')
  const now = Date.now()

  return (
    <section className="section-container">
      <div className="mb-8">
        <span className="section-badge">Vedic Astrology · Jyotish</span>
        <h1 className="section-title flex items-center gap-3"><Sparkles className="text-accent" size={26} /> Rasi Chart Calculator</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Enter birth details to compute a sidereal (Lahiri) Rasi (D1) chart with Whole-Sign houses —
          planetary signs, houses, nakshatra &amp; pada, the Moon (Chandra) chart, and the Vimshottari
          dasha timeline. Powered by the Swiss Ephemeris.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ── Form ── */}
        <form onSubmit={submit} className="glass-card h-fit p-6">
          <div className="grid grid-cols-2 gap-3">
            <label><span className={labelCls}>Date of birth</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={field} />
            </label>
            <label><span className={labelCls}>Time (24h)</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={field} />
            </label>
            <label><span className={labelCls}>Latitude</span>
              <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} required className={field} />
            </label>
            <label><span className={labelCls}>Longitude</span>
              <input type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value)} required className={field} />
            </label>
          </div>
          <label className="mt-3 block"><span className={labelCls}>Time zone</span>
            <select value={tz} onChange={(e) => setTz(e.target.value)} className={field}>
              {TZ_OPTIONS.map((z) => <option key={z} value={z} className="text-black">{z}</option>)}
            </select>
          </label>

          <div className="mt-4">
            <span className={labelCls}>Quick locations</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button key={p.label} type="button" onClick={() => applyPreset(p)}
                  className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-white/5 px-3 py-1 text-xs text-muted transition hover:border-accent/40 hover:text-fg">
                  <MapPin size={11} /> {p.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/20 transition hover:brightness-110 disabled:opacity-60">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Calculating…</> : 'Generate Chart'}
          </button>
          {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral">{error}</p>}
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">
            Traditional Jyotish knowledge, for interest &amp; study. Sidereal · Lahiri ayanamsa · Whole-Sign houses.
          </p>
        </form>

        {/* ── Result ── */}
        <div>
          {!data && !loading && (
            <div className="glass-card flex min-h-[300px] items-center justify-center p-8 text-center text-sm text-muted">
              Enter birth details and generate the chart to see the Rasi &amp; Chandra diagrams, planetary table, and dasha timeline.
            </div>
          )}

          {data && (
            <div className="space-y-6">
              {/* Rasi + Chandra + Navamsa charts */}
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                <div className="glass-card p-5"><KundliChart data={data} /></div>
                {moon && (
                  <div className="glass-card p-5">
                    <KundliChart data={data} lagnaSign={moon.sign} title="Chandra · D1" subtitle={`Moon: ${moon.signName}`} />
                  </div>
                )}
                <div className="glass-card p-5">
                  <KundliChart data={data} signFor={(p) => p.navamsaSign} lagnaSign={data.ascendant.navamsaSign}
                    title="Navamsa · D9" subtitle={`Lagna: ${data.ascendant.navamsaSignName}`} />
                </div>
              </div>

              {/* Summary */}
              <div className="glass-card p-5">
                <h3 className="font-groovy mb-3 text-lg text-fg">Summary</h3>
                <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                  <div className="flex justify-between gap-3"><dt className="text-muted">Lagna (Ascendant)</dt>
                    <dd className="font-medium text-fg">{data.ascendant.signName} · {deg(data.ascendant.degreeInSign)}</dd></div>
                  {moon && (
                    <div className="flex justify-between gap-3"><dt className="text-muted">Moon sign (Rashi)</dt>
                      <dd className="font-medium text-fg">{moon.signName}</dd></div>
                  )}
                  {moon && (
                    <div className="flex justify-between gap-3"><dt className="text-muted">Nakshatra</dt>
                      <dd className="font-medium text-accent-light">{moon.nakshatraName} · pada {moon.pada}</dd></div>
                  )}
                  <div className="flex justify-between gap-3"><dt className="text-muted">Ayanamsa</dt>
                    <dd className="text-fg">{data.meta.ayanamsa}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-muted">Houses</dt>
                    <dd className="text-fg">{data.meta.houseSystem}</dd></div>
                </dl>
              </div>

              {/* Planet table */}
              <div className="glass-card overflow-x-auto p-1">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    <tr>
                      {['Planet', 'Sign', 'Degree', 'Nakshatra (pada)', 'House', 'Dignity'].map((h) => (
                        <th key={h} className="px-4 py-3">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.planets.map((p) => (
                      <tr key={p.name} className="border-t border-white/5 hover:bg-white/[0.03]">
                        <td className="px-4 py-2.5 font-medium text-fg">{p.name}{p.retrograde && <span className="ml-1 text-jade">℞</span>}</td>
                        <td className="px-4 py-2.5 text-fg/90">{p.signName}</td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted">{deg(p.degreeInSign)}</td>
                        <td className="px-4 py-2.5 text-fg/90">{p.nakshatraName} <span className="text-muted">({p.pada})</span></td>
                        <td className="px-4 py-2.5 font-mono text-xs text-muted">{p.house}</td>
                        <td className="px-4 py-2.5">
                          {p.dignity !== '-'
                            ? <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent-light">{p.dignity}</span>
                            : <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Vimshottari Dasha timeline */}
              {data.dashas.length > 0 && (
                <div className="glass-card p-5">
                  <h3 className="font-groovy mb-1 text-lg text-fg">Vimshottari Dasha</h3>
                  <p className="mb-4 text-xs text-muted">Mahadasha periods from the Moon&apos;s nakshatra at birth · 120-year cycle.</p>
                  <ol className="space-y-1.5">
                    {data.dashas.map((d) => {
                      const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                      return (
                        <li key={d.startUtc + d.lord}
                          className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2.5 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                          <span className="flex items-center gap-2">
                            <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{d.lord}</span>
                            {active && <span className="rounded-full bg-accent/20 px-2 py-0.5 font-mono text-[10px] text-accent-light">current</span>}
                          </span>
                          <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc} · {d.years}y</span>
                        </li>
                      )
                    })}
                  </ol>
                </div>
              )}

              {/* Divisional charts (Saptavarga) */}
              <div className="glass-card overflow-x-auto p-1">
                <div className="px-4 pt-3 font-groovy text-lg text-fg">Divisional Charts (Vargas)</div>
                <table className="mt-2 w-full border-collapse text-left text-sm">
                  <thead className="font-mono text-[11px] uppercase tracking-wider text-muted">
                    <tr>
                      <th className="px-4 py-2">Planet</th>
                      {['D1', 'D2', 'D3', 'D7', 'D9', 'D10', 'D12'].map((v) => <th key={v} className="px-3 py-2">{v}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.planets.map((p) => (
                      <tr key={p.name} className="border-t border-white/5">
                        <td className="px-4 py-2 font-medium text-fg">{p.name}</td>
                        <td className="px-3 py-2 text-fg/90">{SIGN_ABBR[p.sign]}</td>
                        <td className="px-3 py-2 text-fg/80">{SIGN_ABBR[p.vargas.D2]}</td>
                        <td className="px-3 py-2 text-fg/80">{SIGN_ABBR[p.vargas.D3]}</td>
                        <td className="px-3 py-2 text-fg/80">{SIGN_ABBR[p.vargas.D7]}</td>
                        <td className="px-3 py-2 font-semibold text-accent-light">{SIGN_ABBR[p.navamsaSign]}</td>
                        <td className="px-3 py-2 text-fg/80">{SIGN_ABBR[p.vargas.D10]}</td>
                        <td className="px-3 py-2 text-fg/80">{SIGN_ABBR[p.vargas.D12]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Drishti (aspects) */}
                <div className="glass-card p-5">
                  <h3 className="font-groovy mb-3 text-lg text-fg">Drishti (Aspects)</h3>
                  <ul className="space-y-1.5 text-sm">
                    {data.planets.map((p) => (
                      <li key={p.name} className="flex flex-wrap items-baseline gap-x-2">
                        <span className="w-16 shrink-0 font-medium text-fg">{p.name}</span>
                        <span className="text-muted">→ houses {p.aspectsHouses.join(', ')}</span>
                        {p.aspectsPlanets.length > 0 && <span className="text-accent-light">· {p.aspectsPlanets.join(', ')}</span>}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Strength (partial Shadbala) */}
                <div className="glass-card p-5">
                  <h3 className="font-groovy mb-1 text-lg text-fg">Strength</h3>
                  <p className="mb-3 text-xs text-muted">Partial Shadbala · Uccha + Dig + Naisargika bala (rupas).</p>
                  <ul className="space-y-2">
                    {data.planets.filter((p) => p.strength).map((p) => {
                      const rupas = p.strength!.totalRupas
                      const pct = Math.max(4, Math.min(100, (rupas / 3) * 100))
                      return (
                        <li key={p.name}>
                          <div className="mb-0.5 flex justify-between text-xs">
                            <span className="font-medium text-fg">{p.name}</span>
                            <span className="font-mono text-muted">{rupas.toFixed(2)} R</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-white/10">
                            <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
