import { useRef, useState, type FormEvent } from 'react'
import { Sparkles, MapPin, Loader2, Search, Download, Star, Info } from 'lucide-react'
import tzlookup from 'tz-lookup'
import { SITE } from '../config/site'
import KundliChart from './KundliChart'
import DiamondChart from './DiamondChart'
import AreaRadar from './AreaRadar'
import TimelineChart from './TimelineChart'
import AshtakavargaView from './AshtakavargaView'
import ShadbalaView from './ShadbalaView'
import type { BirthChartData, BirthChartRequest, PlanetPosition, TransitPos } from '../types/astrology'
import { JT, type Lang, type Naynan, vargaSign, signLabel, planetName, readingFor, naynan, activeBhukti, activePratyantar, toMmDigits, themeWord, transitNoteText, findPlanet, dignityLabel, currentAreaEffect } from '../lib/jyotish'

const CHART_URL = `${SITE.apiUrl}/api/astrology/chart`
const GEO_URL = 'https://nominatim.openstreetmap.org/search'

interface Preset { label: string; lat: number; lon: number; tz: string }
const PRESETS: Preset[] = [
  { label: 'Yangon', lat: 16.8409, lon: 96.1735, tz: 'Asia/Yangon' },
  { label: 'Mandalay', lat: 21.9588, lon: 96.0891, tz: 'Asia/Yangon' },
  { label: 'Tokyo', lat: 35.6762, lon: 139.6503, tz: 'Asia/Tokyo' },
  { label: 'Bangkok', lat: 13.7563, lon: 100.5018, tz: 'Asia/Bangkok' },
  { label: 'New Delhi', lat: 28.6139, lon: 77.209, tz: 'Asia/Kolkata' },
  { label: 'Singapore', lat: 1.3521, lon: 103.8198, tz: 'Asia/Singapore' },
]
const browserTz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC' } catch { return 'UTC' } })()
const TZ_OPTIONS = [...new Set([browserTz, ...PRESETS.map((p) => p.tz), 'UTC'])]

interface GeoResult { display_name: string; lat: string; lon: string }
type Tab = 'reading' | 'timeline' | 'd1' | 'vargas' | 'ashtaka' | 'shadbala'

const VARGAS: { n: number; name: string; desc: { en: string; mm: string } }[] = [
  { n: 2, name: 'D2 · Hora', desc: { en: 'Wealth & resources.', mm: 'ဥစ္စာဓန နှင့် အရင်းအမြစ်။' } },
  { n: 3, name: 'D3 · Drekkana', desc: { en: 'Siblings, courage, initiative.', mm: 'မောင်နှမ၊ ရဲစွမ်းသတ္တိ။' } },
  { n: 4, name: 'D4 · Chaturthamsa', desc: { en: 'Property, home, fixed assets & fortune.', mm: 'အိုးအိမ်၊ အခြေပစ္စည်း၊ ကံ။' } },
  { n: 7, name: 'D7 · Saptamsa', desc: { en: 'Children, progeny & legacy.', mm: 'သားသမီး၊ အမွေဆက်ခံမှု။' } },
  { n: 9, name: 'D9 · Navamsa', desc: { en: 'Spouse, dharma — the fruit of the chart.', mm: 'အိမ်ထောင်ဖက်၊ ဓမ္မ — ဇာတာ၏ အသီးအပွင့်။' } },
  { n: 10, name: 'D10 · Dasamsa', desc: { en: 'Career, profession & status.', mm: 'အသက်မွေးဝမ်းကျောင်း၊ ဂုဏ်အဆင့်။' } },
  { n: 12, name: 'D12 · Dwadasamsa', desc: { en: 'Parents & ancestry.', mm: 'မိဘ နှင့် ဘိုးဘွား။' } },
  { n: 16, name: 'D16 · Shodasamsa', desc: { en: 'Vehicles, comforts & luxuries.', mm: 'ယာဉ်၊ အိမ်သုံး အဆင်ပြေမှု။' } },
  { n: 20, name: 'D20 · Vimsamsa', desc: { en: 'Spiritual practice & devotion.', mm: 'ဝိညာဉ်ရေး၊ ဘာသာရေး လေ့ကျင့်မှု။' } },
  { n: 24, name: 'D24 · Chaturvimsamsa', desc: { en: 'Education & learning.', mm: 'ပညာရေး နှင့် သင်ယူမှု။' } },
  { n: 60, name: 'D60 · Shashtiamsa', desc: { en: 'Overall karma — the most refined chart.', mm: 'အလုံးစုံ ကံ — အသိမ်မွေ့ဆုံး ဇာတာ။' } },
]

const BIO_EN = 'Sayar Bhone Min Thike Din prepares every reading with authentic Vedic (Jyotish) methods — the sidereal zodiac with the Lahiri ayanamsa, whole-sign houses, the Chandra Lagna (Moon ascendant), the sixteen divisional charts (D1–D60), the Vimshottari dasha & antardasha system, planetary aspects (drishti), the six-fold Shadbala strengths and Ashtakavarga — combined for a precise and faithful reading of your life.'
const BIO_MM = 'ဆရာ ဘုန်းမင်းသိုက်ဒင် သည် ဟောကိန်းတိုင်းကို စစ်မှန်သော နက္ခတ်ဗေဒင် (Jyotish) နည်းစနစ်များဖြင့် ပြင်ဆင်ပါသည် — နက္ခတ်ရာသီစက်နှင့် Lahiri အယနံသ၊ Whole-Sign အိမ်စနစ်၊ စန်းလဂ် (Chandra Lagna)၊ ဇာတာခွဲ ၁၆ မျိုး (D1–D60)၊ ဝိမ်ရှောတ္တရီ ဒသာ/အန္တရ်ဒသာစနစ်၊ ဂြိုဟ်အမြင် (ဒြိဋ္ဌိ)၊ ဆဒ္ဗလ ဂြိုဟ်အား ၆ မျိုးနှင့် အဋ္ဌကဝဂ် — တို့ကို ပေါင်းစပ်၍ သင့်ဘဝကို တိကျမှန်ကန်စွာ ဟောကြားပေးပါသည်။'

// D1–D60 educational meanings (simple, bilingual).
const VARGA_GUIDE: { code: string; en: string; mm: string }[] = [
  { code: 'D1 · Rasi', en: 'Physical body, general life path, and baseline karma.', mm: 'ခန္ဓာကိုယ်၊ ဘဝလမ်းကြောင်း အထွေထွေနှင့် အခြေခံကံ။' },
  { code: 'D2 · Hora', en: 'Wealth, assets, and financial prosperity.', mm: 'ဥစ္စာဓန၊ ပိုင်ဆိုင်မှုနှင့် ငွေကြေး ကြွယ်ဝမှု။' },
  { code: 'D3 · Drekkana', en: 'Siblings, courage, and inner strength.', mm: 'မောင်နှမ၊ ရဲစွမ်းသတ္တိနှင့် စိတ်ဓာတ်ခွန်အား။' },
  { code: 'D4 · Chaturthamsha', en: 'Real estate, properties, and overall fortune.', mm: 'အိမ်ခြံမြေ၊ ပိုင်ဆိုင်မှုနှင့် အထွေထွေကံကြမ္မာ။' },
  { code: 'D7 · Saptamsha', en: 'Children, progeny, and legacy.', mm: 'သားသမီး၊ သားစဉ်မြေးဆက်နှင့် အမွေအနှစ်။' },
  { code: 'D9 · Navamsa', en: "Marriage, the soul's true purpose, and hidden strengths — the most important sub-chart.", mm: 'အိမ်ထောင်ရေး၊ ဝိညာဉ်၏ စစ်မှန်သော ရည်ရွယ်ချက်နှင့် ကွယ်ဝှက်နေသော အင်အား — အရေးအကြီးဆုံး ဇာတာခွဲ။' },
  { code: 'D10 · Dasamsha', en: 'Career, professional success, and public status.', mm: 'အသက်မွေးဝမ်းကျောင်း၊ အလုပ်အောင်မြင်မှုနှင့် လူသိဂုဏ်အဆင့်။' },
  { code: 'D12 · Dwadasamsha', en: 'Parents, ancestral karma, and heritage.', mm: 'မိဘ၊ ဘိုးဘွား ကံနှင့် အမွေအနှစ်။' },
  { code: 'D16 · Shodashamsha', en: 'Vehicles, inner happiness, and comforts.', mm: 'ယာဉ်၊ စိတ်တွင်း ပျော်ရွှင်မှုနှင့် သက်သာချမ်းသာမှု။' },
  { code: 'D20 · Vimsamsha', en: 'Spiritual progress and religious dedication.', mm: 'ဝိညာဉ်ရေး တိုးတက်မှုနှင့် ဘာသာရေး ဆက်ကပ်မှု။' },
  { code: 'D24 · Chaturvimsamsha', en: 'Education, learning, and intellect.', mm: 'ပညာရေး၊ သင်ယူမှုနှင့် ဉာဏ်ရည်။' },
  { code: 'D60 · Shashtiamsha', en: 'Past-life karma and deep-rooted destiny.', mm: 'အတိတ်ဘဝ ကံနှင့် အမြစ်တွယ်နေသော ကံကြမ္မာ။' },
]

const deg = (d: number) => `${Math.floor(d)}°${String(Math.floor((d % 1) * 60)).padStart(2, '0')}'`
const field = 'mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-fg outline-none transition focus:border-accent/50'
const labelCls = 'block font-mono text-[11px] uppercase tracking-wider text-muted'

type ChartStyle = 'diamond' | 'grid'
// Switch between North-Indian diamond (encyclopedia) and South-Indian grid.
function ChartView({ style, ...rest }: {
  style: ChartStyle; data: BirthChartData; lagnaSign?: number
  signFor?: (p: PlanetPosition) => number; title?: string; subtitle?: string
}) {
  return style === 'diamond' ? <DiamondChart {...rest} /> : <KundliChart {...rest} />
}

// Small varga panel: chart + description + planets-in-this-varga table.
function VargaPanel({ data, lang, signOf, lagnaSign, title, subtitle, desc, chartStyle }: {
  data: BirthChartData; lang: Lang; signOf: (p: PlanetPosition) => number; lagnaSign: number
  title: string; subtitle: string; desc: string; chartStyle: ChartStyle
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="glass-card p-5"><ChartView style={chartStyle} data={data} signFor={signOf} lagnaSign={lagnaSign} title={title} subtitle={subtitle} /></div>
      <div className="glass-card p-5">
        <p className="mb-3 text-sm leading-relaxed text-muted">{desc}</p>
        <p className={labelCls}>{JT[lang].planetsIn}</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
          {data.planets.map((p) => (
            <li key={p.name} className="flex justify-between gap-2">
              <span className="text-fg/90">{planetName(p.name, lang)}</span>
              <span className="text-accent-light">{signLabel(signOf(p), lang)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function Jyotish() {
  const [lang, setLang] = useState<Lang>('en')
  const t = JT[lang]

  const [name, setName] = useState('')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [date, setDate] = useState('1998-01-01')
  const [time, setTime] = useState('12:00')
  const [lat, setLat] = useState('16.8409')
  const [lon, setLon] = useState('96.1735')
  const [tz, setTz] = useState(browserTz)
  const [place, setPlace] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [searching, setSearching] = useState(false)
  const debTimer = useRef<number | undefined>(undefined)

  const [data, setData] = useState<BirthChartData | null>(null)
  const [querent, setQuerent] = useState<{ name: string; gender: 'male' | 'female'; nn: Naynan | null } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [tab, setTab] = useState<Tab>('reading')
  const [chartStyle, setChartStyle] = useState<ChartStyle>('diamond')
  const [vargaN, setVargaN] = useState(9)
  const [ayanamsa, setAyanamsa] = useState('lahiri')
  const [consent, setConsent] = useState(false)

  // Remedy / contact-the-Sayar form.
  const remedyRef = useRef<HTMLDivElement>(null)
  const [remedyArea, setRemedyArea] = useState('')
  const [remedyContact, setRemedyContact] = useState('')
  const [remedyMsg, setRemedyMsg] = useState('')
  const [remedyState, setRemedyState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Secure PDF request (admin-approval + email flow).
  const [pdfOpen, setPdfOpen] = useState(false)
  const [pdfEmail, setPdfEmail] = useState('')
  const [pdfState, setPdfState] = useState<'idle' | 'sending' | 'pending' | 'error'>('idle')

  const onPlaceChange = (v: string) => {
    setPlace(v)
    window.clearTimeout(debTimer.current)
    if (v.trim().length < 3) { setResults([]); return }
    debTimer.current = window.setTimeout(async () => {
      setSearching(true)
      try {
        const r = await fetch(`${GEO_URL}?format=json&limit=5&q=${encodeURIComponent(v)}`, { headers: { Accept: 'application/json' } })
        const j = (await r.json()) as GeoResult[]
        setResults(Array.isArray(j) ? j : [])
      } catch { setResults([]) } finally { setSearching(false) }
    }, 450)
  }
  const selectPlace = (g: GeoResult) => {
    const la = Number(g.lat), lo = Number(g.lon)
    setLat(String(la)); setLon(String(lo)); setPlace(g.display_name.split(',').slice(0, 2).join(',').trim()); setResults([])
    try { setTz(tzlookup(la, lo)) } catch { /* keep */ }
  }
  const applyPreset = (p: Preset) => { setLat(String(p.lat)); setLon(String(p.lon)); setTz(p.tz); setPlace(p.label); setResults([]) }

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!consent) return   // consent is mandatory
    setError(''); setLoading(true); setData(null)
    try {
      const [y, mo, d] = date.split('-').map(Number)
      const [h, mi] = time.split(':').map(Number)
      const body: BirthChartRequest = {
        year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
        timeZone: tz, latitude: Number(lat), longitude: Number(lon), ayanamsa,
      }
      const res = await fetch(CHART_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => null)) as { success?: boolean; data?: BirthChartData; message?: string } | null
      if (!res.ok || !json?.success || !json.data) throw new Error(json?.message || `Failed (${res.status})`)
      setData(json.data); setQuerent({ name: name.trim(), gender, nn: naynan(date, time) }); setTab('reading')
      // Persist the querent's chart ONLY with explicit consent (opt-in).
      if (consent) {
        fetch(`${SITE.apiUrl}/api/astrology/save-chart`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(), gender, birthDate: date, birthTime: time, timeZone: tz,
            latitude: Number(lat), longitude: Number(lon), nayNan: naynan(date, time)?.num ?? 0, consent: true,
          }),
        }).catch(() => {})
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute the chart.')
    } finally { setLoading(false) }
  }

  const openRemedy = (areaLabel: string) => {
    setRemedyArea(areaLabel); setRemedyState('idle')
    setTimeout(() => remedyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 40)
  }
  const submitRemedy = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setRemedyState('sending')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/remedy-request`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: (querent?.name || name).trim(), contact: remedyContact.trim(),
          area: remedyArea.trim(), message: remedyMsg.trim(), birthDate: date, birthTime: time,
        }),
      })
      if (!res.ok) throw new Error()
      setRemedyState('sent'); setRemedyMsg('')
    } catch { setRemedyState('error') }
  }

  const submitPdf = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPdfState('sending')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/request-pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pdfEmail.trim(), name: (querent?.name || name).trim(), birthDate: date, birthTime: time }),
      })
      if (!res.ok) throw new Error()
      setPdfState('pending')
    } catch { setPdfState('error') }
  }

  const moon = data?.planets.find((p) => p.name === 'Moon')
  const now = Date.now()
  const thisYear = new Date().getFullYear()
  const barColor = (tone: string) => tone === 'favorable' ? 'rgb(var(--jade))' : tone === 'testing' ? 'rgb(var(--coral))' : 'rgb(var(--accent))'
  const reading = data ? readingFor(data, lang) : null
  const bhukti = data ? activeBhukti(data) : undefined
  const prat = data ? activePratyantar(data) : undefined

  const curVarga = VARGAS.find((v) => v.n === vargaN) ?? VARGAS[4]
  const TABS: { id: Tab; label: string }[] = [
    { id: 'reading', label: t.tabReading }, { id: 'timeline', label: t.tabTimeline }, { id: 'd1', label: t.tabD1 },
    { id: 'vargas', label: lang === 'mm' ? 'ခွဲဝေဇာတာ' : 'Vargas' },
    { id: 'ashtaka', label: lang === 'mm' ? 'အဋ္ဌကဝဂ်' : 'Ashtaka' },
    { id: 'shadbala', label: lang === 'mm' ? 'ဆဒ္ဗလ' : 'Shadbala' },
  ]

  return (
    <section className="section-container">
      {/* ── Grand Astrologer Profile ── */}
      <div className="relative mb-8 overflow-hidden rounded-3xl border border-accent/25 p-6 sm:p-8"
        style={{ background: 'linear-gradient(135deg, rgb(var(--card)) 0%, rgb(var(--surface)) 100%)', boxShadow: '0 0 60px -20px rgb(var(--accent) / 0.45)' }}>
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
        <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
          <div className="relative h-28 w-28 shrink-0 rounded-full p-[3px]"
            style={{ background: 'conic-gradient(from 200deg, #eab308, #a855f7, #22d3ee, #eab308)', boxShadow: '0 0 30px -4px rgba(168,85,247,0.6), 0 0 22px -6px rgba(234,179,8,0.55)' }}>
            <div className="relative h-full w-full overflow-hidden rounded-full bg-card">
              <span className="absolute inset-0 flex items-center justify-center font-groovy text-3xl text-accent">ဘ</span>
              <img src="/profile-grand.jpg" alt="Sayar Bhone Min Thike Din" className="relative h-full w-full object-cover" loading="lazy"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-light">{lang === 'mm' ? 'ပရော်ဖက်ရှင်နယ် ဗေဒင်ပညာရှင်' : 'Professional Vedic Astrologer'}</p>
            <h1 className="mt-1 font-groovy text-2xl text-fg sm:text-3xl">{lang === 'mm' ? 'ဆရာ ဘုန်းမင်းသိုက်ဒင်' : 'Sayar Bhone Min Thike Din'}</h1>
            <p className="font-mono text-xs text-muted">{lang === 'mm' ? 'နက္ခတ်ဗေဒင် · ဝိမ်ရှောတ္တရီ ဒသာ · ဆဒ္ဗလ' : 'Sidereal Jyotish · Vimshottari Dasha · Shadbala'}</p>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{lang === 'mm' ? BIO_MM : BIO_EN}</p>
          </div>
          <div className="no-print flex items-center gap-1 self-start rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur">
            {(['en', 'mm'] as Lang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)}
                className={`rounded-full px-3 py-1 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
                {l === 'en' ? 'EN' : 'မြန်မာ'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Intro: Chandra Lagna + Instructions ── */}
      <div className="mb-6 grid gap-4 md:grid-cols-2 no-print">
        <div className="glass-card p-5">
          <h2 className="mb-2 flex items-center gap-2 font-groovy text-base text-fg"><Star size={16} className="text-accent" /> {t.chandraTitle}</h2>
          <p className="text-sm leading-relaxed text-muted">{t.chandra}</p>
        </div>
        <div className="glass-card p-5">
          <h2 className="mb-2 flex items-center gap-2 font-groovy text-base text-fg"><Info size={16} className="text-accent" /> {t.instrTitle}</h2>
          <ul className="space-y-1.5 text-sm text-muted">
            {[t.instr1, t.instr2, t.instr3].map((s, i) => (
              <li key={i} className="flex gap-2"><span className="mt-0.5 text-accent-light">•</span><span className="leading-relaxed">{s}</span></li>
            ))}
          </ul>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[380px_1fr]">
        {/* ── Form ── */}
        <form onSubmit={submit} className="glass-card h-fit p-6 no-print">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <label><span className={labelCls}>{t.fldName}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'mm' ? 'အမည်' : 'Full name'} className={field} /></label>
            <label><span className={labelCls}>{t.fldGender}</span>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className={field}>
                <option value="male" className="text-black">{t.male}</option>
                <option value="female" className="text-black">{t.female}</option>
              </select></label>
          </div>
          <label className="relative block">
            <span className={labelCls}>Birth place</span>
            <span className="relative mt-1.5 block">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={place} onChange={(e) => onPlaceChange(e.target.value)} placeholder="Search a city…"
                className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-3 text-sm text-fg outline-none transition focus:border-accent/50" />
              {searching && <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />}
            </span>
            {results.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-white/15 bg-surface/95 backdrop-blur-md">
                {results.map((g, i) => (
                  <li key={i}><button type="button" onClick={() => selectPlace(g)}
                    className="block w-full px-3 py-2 text-left text-xs text-fg/90 transition hover:bg-accent/15">{g.display_name}</button></li>
                ))}
              </ul>
            )}
          </label>

          <div className="mt-3 grid grid-cols-2 gap-3">
            <label><span className={labelCls}>Date of birth</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className={field} /></label>
            <label><span className={labelCls}>Time (24h)</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={field} /></label>
            <label><span className={labelCls}>Latitude</span>
              <input type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value)} required className={field} /></label>
            <label><span className={labelCls}>Longitude</span>
              <input type="number" step="any" value={lon} onChange={(e) => setLon(e.target.value)} required className={field} /></label>
          </div>
          <label className="mt-3 block"><span className={labelCls}>Time zone</span>
            <select value={tz} onChange={(e) => setTz(e.target.value)} className={field}>
              {[...new Set([tz, ...TZ_OPTIONS])].map((z) => <option key={z} value={z} className="text-black">{z}</option>)}
            </select>
          </label>
          <label className="mt-3 block"><span className={labelCls}>{lang === 'mm' ? 'အယနံသ (Ayanamsa)' : 'Ayanamsa'}</span>
            <select value={ayanamsa} onChange={(e) => setAyanamsa(e.target.value)} className={field}>
              <option value="lahiri" className="text-black">Lahiri (default)</option>
              <option value="raman" className="text-black">Raman</option>
              <option value="kp" className="text-black">KP (Krishnamurti)</option>
              <option value="truechitra" className="text-black">True Chitra</option>
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

          <label className={`mt-4 flex items-start gap-2 rounded-xl border p-3 text-xs leading-relaxed transition ${consent ? 'border-jade/40 bg-jade/5 text-muted' : 'border-coral/40 bg-coral/5 text-fg/80'}`}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-accent" />
            <span><span className="text-coral">*</span> {lang === 'mm' ? 'ဆရာ ဟောကိန်း အထောက်အကူအတွက် ကျွန်ုပ်၏ မွေးဇာတာ အချက်အလက်ကို လုံခြုံစွာ သိမ်းဆည်းရန် သဘောတူပါသည်။' : "I consent to securely storing my birth details to assist the astrologer's readings."}</span>
          </label>

          <button type="submit" disabled={loading || !consent}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
            {loading ? <><Loader2 size={16} className="animate-spin" /> {lang === 'mm' ? 'တွက်ချက်နေသည်…' : 'Calculating…'}</> : <><Sparkles size={16} /> {lang === 'mm' ? 'ဇာတာ တွက်မည်' : 'Generate Chart'}</>}
          </button>
          {!consent && <p className="mt-2 font-mono text-[11px] leading-relaxed text-coral">{lang === 'mm' ? 'ကျေးဇူးပြု၍ အချက်အလက်သိမ်းဆည်းခွင့်ကို သဘောတူညီပေးပါ။' : 'Please agree to the data-storage consent to continue.'}</p>}
          {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral">{error}</p>}
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">{t.disclaimer}</p>
        </form>

        {/* ── Result ── */}
        <div>
          {!data && !loading && (
            <div className="glass-card flex min-h-[300px] items-center justify-center p-8 text-center text-sm text-muted no-print">
              {lang === 'mm' ? 'မွေးဖွားအချက်အလက်ထည့်၍ ဟောစာတမ်း၊ ဇာတာခွင်များ (D1/D9/D10/D7) ကြည့်ရှုပါ။' : 'Enter birth details to see the reading and the D1 / D9 / D10 / D7 charts.'}
            </div>
          )}

          {data && reading && (
            <div className="space-y-5">
              {/* header + secure PDF request */}
              <div className="flex flex-col gap-3 no-print sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-groovy text-lg text-fg">{place || t.portalTitle}</h2>
                <div className="flex flex-col items-stretch gap-2 sm:items-end">
                  {pdfState === 'pending' ? (
                    <span className="inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 px-4 py-2 text-xs text-amber-300">
                      <Loader2 size={14} className="animate-spin" /> {lang === 'mm' ? 'လုံခြုံရေးအရ Admin ၏ ခွင့်ပြုချက် စောင့်ဆိုင်းနေပါသည်…' : 'Pending Admin approval…'}
                    </span>
                  ) : pdfOpen ? (
                    <form onSubmit={submitPdf} className="flex flex-wrap items-center gap-2">
                      <input type="email" required value={pdfEmail} onChange={(e) => setPdfEmail(e.target.value)} placeholder={lang === 'mm' ? 'သင့် အီးမေးလ်' : 'Your email'}
                        className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50" />
                      <button type="submit" disabled={pdfState === 'sending'} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-space transition hover:brightness-110 disabled:opacity-60">
                        {pdfState === 'sending' ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />} {lang === 'mm' ? 'တောင်းဆိုမည်' : 'Request'}
                      </button>
                    </form>
                  ) : (
                    <button type="button" onClick={() => { setPdfOpen(true); setPdfState('idle') }}
                      className="inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-xs text-accent-light transition hover:bg-accent/20">
                      <Download size={14} /> {lang === 'mm' ? 'PDF စာတမ်း တောင်းဆိုရန်' : 'Request PDF Document'}
                    </button>
                  )}
                  {pdfState === 'error' && <span className="font-mono text-[11px] text-coral">{lang === 'mm' ? 'တောင်းဆို၍မရပါ — ပြန်ကြိုးစားပါ။' : 'Request failed — try again.'}</span>}
                  {pdfState === 'pending' && <span className="max-w-xs text-right font-mono text-[10px] leading-relaxed text-muted">{lang === 'mm' ? 'Admin အတည်ပြုပြီးလျှင် လုံခြုံသော တစ်ကြိမ်သုံး download link ကို သင့်အီးမေးလ်သို့ ပေးပို့ပါမည်။' : 'Once approved, a secure one-time link is emailed to you.'}</span>}
                </div>
              </div>
              <div className="no-print flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-2">
                  {TABS.map((tb) => (
                    <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
                      className={`rounded-full border px-4 py-1.5 font-mono text-xs transition ${tab === tb.id ? 'border-accent/60 bg-accent/15 text-accent-light' : 'border-white/12 bg-white/5 text-muted hover:text-fg'}`}>
                      {tb.label}
                    </button>
                  ))}
                </div>
                {(tab === 'd1' || tab === 'vargas') && (
                  <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
                    {(['diamond', 'grid'] as ChartStyle[]).map((s) => (
                      <button key={s} type="button" onClick={() => setChartStyle(s)}
                        className={`rounded-full px-3 py-1 font-mono text-[11px] transition ${chartStyle === s ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
                        {s === 'diamond' ? (lang === 'mm' ? 'စိန်ပုံ' : 'Diamond') : (lang === 'mm' ? 'ဇယားကွက်' : 'Grid')}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* ── READING ── */}
              {tab === 'reading' && (
                <div className="space-y-5">
                  {querent && (querent.name || querent.nn) && (
                    <div className="glass-card p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className={labelCls}>{t.querentFor}</p>
                          <h3 className="font-groovy text-lg text-fg">
                            {querent.name || '—'}
                            {querent.name && <span className="ml-2 font-mono text-xs text-accent-light">{t[querent.gender]}</span>}
                          </h3>
                        </div>
                        {querent.nn && (
                          <div className="text-right">
                            <p className={labelCls}>{t.naynanLabel}</p>
                            <p className="text-lg font-semibold text-accent-light">
                              {lang === 'mm' ? `${querent.nn.mmDay} · နံ ${toMmDigits(querent.nn.num)}` : `${querent.nn.enDay} · No. ${querent.nn.num}`}
                              <span className="ml-2 font-mono text-xs text-muted">{planetName(querent.nn.planet, lang)}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="glass-card p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-groovy text-lg text-fg">{t.currentDasha}</h3>
                      <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-light">{planetName(reading.lord, lang)}</span>
                    </div>
                    <p className="mt-2 text-xs text-muted">{t.readingNote}</p>
                  </div>

                  {/* Seven-area overview: radar chart + score bars */}
                  <div className="glass-card p-5">
                    <h3 className="mb-3 font-groovy text-lg text-fg">{lang === 'mm' ? 'ဘဝကဏ္ဍ ၇ ခု' : 'Seven Life Areas'}</h3>
                    <div className="grid gap-5 md:grid-cols-2 md:items-center">
                      <AreaRadar areas={reading.areas} />
                      <ul className="space-y-2.5">
                        {reading.areas.map((a, i) => (
                          <li key={a.key} className="flex items-center gap-2.5">
                            <span className="w-4 shrink-0 font-mono text-[10px] text-muted">{i + 1}</span>
                            <span className="w-24 shrink-0 truncate text-xs text-fg/90 sm:w-32" title={a.label}>{a.label}</span>
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                              <span className="block h-full rounded-full" style={{ width: `${Math.max(a.score, 4)}%`, background: barColor(a.tone) }} />
                            </span>
                            <span className="w-6 shrink-0 text-right font-mono text-[10px] text-muted">{a.score}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Per-area deep-dive — side by side (natal + current transits) */}
                  <div className="space-y-3">
                    <h3 className="font-groovy text-lg text-fg">{t.lifeAreas}</h3>
                    <div className="grid gap-4 lg:grid-cols-2">
                      {reading.areas.map((a) => {
                        const lp = a.lord ? findPlanet(data, a.lord) : undefined
                        const cur = currentAreaEffect(data, a.key, lang)
                        const needsRemedy = a.tone === 'testing' || cur?.tone === 'warn'
                        return (
                          <div key={a.key} className={`glass-card flex flex-col border-l-4 p-5 ${a.tone === 'favorable' ? 'border-l-jade' : a.tone === 'testing' ? 'border-l-coral' : 'border-l-white/20'}`}>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <h4 className="font-groovy text-base text-fg">{a.label}</h4>
                              <span className="font-mono text-xs"><span className="text-accent-light">{'★'.repeat(a.stars)}</span><span className="text-muted">{'☆'.repeat(5 - a.stars)}</span> <span className="text-muted">{a.score}/100</span></span>
                            </div>
                            <span className="mt-2 block h-1.5 w-full overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full" style={{ width: `${Math.max(a.score, 4)}%`, background: barColor(a.tone) }} /></span>

                            {lp && (
                              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'mm' ? 'အိမ်ရှင်သခင်' : 'House lord'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{planetName(lp.name, lang)} · {signLabel(lp.sign, lang)} <span className="text-muted">({lang === 'mm' ? `${lp.house} တန့်` : `H${lp.house}`})</span></p>
                                  {lp.dignity !== '-' && <p className="text-[11px] text-accent-light">{dignityLabel(lp.dignity, lang)}</p>}
                                </div>
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'mm' ? 'D9 နဝင်း' : 'D9 Navamsa'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{signLabel(lp.navamsaSign, lang)}</p>
                                </div>
                                <div className="rounded-lg bg-white/[0.03] px-3 py-2">
                                  <p className={labelCls}>{lang === 'mm' ? 'D10 ဒသံသ' : 'D10 Dasamsa'}</p>
                                  <p className="mt-0.5 text-sm text-fg/90">{signLabel(lp.vargas.D10, lang)}</p>
                                </div>
                              </div>
                            )}

                            {a.karakas.length > 0 && (
                              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                                <span className={labelCls}>{lang === 'mm' ? 'ကာရက' : 'Karakas'}:</span>
                                {a.karakas.map((k) => {
                                  const kp = findPlanet(data, k)
                                  return kp ? (
                                    <span key={k} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-fg/80">
                                      {planetName(kp.name, lang)} · {signLabel(kp.sign, lang)}{kp.dignity !== '-' && <span className="text-accent-light"> · {dignityLabel(kp.dignity, lang)}</span>}
                                    </span>
                                  ) : null
                                })}
                              </div>
                            )}

                            {cur && (
                              <div className={`mt-3 rounded-lg border px-3 py-2 text-xs leading-relaxed ${cur.tone === 'good' ? 'border-jade/40 bg-jade/10 text-jade' : cur.tone === 'warn' ? 'border-coral/40 bg-coral/10 text-coral' : 'border-white/10 bg-white/[0.03] text-muted'}`}>
                                <span className="font-semibold">{lang === 'mm' ? 'လက်ရှိကာလ သက်ရောက်မှု' : 'Current period'}: </span>{cur.text}
                              </div>
                            )}

                            <ul className="mt-3 space-y-1">
                              {a.points.map((pt, i) => <li key={i} className="text-xs leading-relaxed text-muted">• {pt}</li>)}
                            </ul>

                            {needsRemedy && (
                              <button type="button" onClick={() => openRemedy(a.label)}
                                className="no-print mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs text-coral transition hover:bg-coral/20">
                                <Sparkles size={12} /> {lang === 'mm' ? 'ဤကဏ္ဍအတွက် ယတြာ တောင်းရန်' : 'Request a remedy for this area'}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {data.yogas.length > 0 && (
                    <div className="glass-card p-5">
                      <h3 className="mb-3 font-groovy text-lg text-fg">Yogas</h3>
                      <ul className="space-y-2.5">
                        {data.yogas.map((y) => (
                          <li key={y.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <div className="flex items-center gap-2"><span className="font-semibold text-accent-light">{y.name}</span>
                              <span className="font-mono text-[10px] text-muted">{y.planets.map((n) => planetName(n, lang)).join(' · ')}</span></div>
                            <p className="mt-0.5 text-xs leading-relaxed text-muted">{y.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dasha timeline */}
                  <div className="glass-card p-5">
                    <h3 className="mb-3 font-groovy text-lg text-fg">Vimshottari Dasha</h3>
                    <ol className="space-y-1.5">
                      {data.dashas.map((d) => {
                        const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                        return (
                          <li key={d.startUtc + d.lord} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                            <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{planetName(d.lord, lang)}</span>
                            <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc}</span>
                          </li>
                        )
                      })}
                    </ol>
                  </div>

                  {/* Antardasha (bhukti) sub-periods of the current mahadasha */}
                  {data.antardashas && data.antardashas.length > 0 && (
                    <div className="glass-card p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-groovy text-lg text-fg">{t.currentBhukti}</h3>
                        {bhukti && <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-light">{planetName(reading.lord, lang)} – {planetName(bhukti.lord, lang)}</span>}
                      </div>
                      <ol className="mt-3 space-y-1.5">
                        {data.antardashas.map((d) => {
                          const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                          return (
                            <li key={d.startUtc + d.lord} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                              <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{planetName(reading.lord, lang)} – {planetName(d.lord, lang)}</span>
                              <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc}</span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  )}

                  {/* Pratyantar dasha (3rd level) of the current bhukti */}
                  {data.pratyantardashas && data.pratyantardashas.length > 0 && (
                    <div className="glass-card p-5">
                      <div className="flex items-center justify-between">
                        <h3 className="font-groovy text-lg text-fg">{lang === 'mm' ? 'လက်ရှိ ပစ္စန္တရဒသာ' : 'Current Pratyantar'}</h3>
                        {prat && <span className="rounded-full bg-accent/15 px-3 py-1 text-sm font-semibold text-accent-light">{planetName(bhukti?.lord ?? reading.lord, lang)} – {planetName(prat.lord, lang)}</span>}
                      </div>
                      <ol className="mt-3 space-y-1.5">
                        {data.pratyantardashas.map((d) => {
                          const active = new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime()
                          return (
                            <li key={d.startUtc + d.lord} className={`flex items-center justify-between gap-3 rounded-xl px-4 py-2 ${active ? 'border border-accent/40 bg-accent/10' : 'bg-white/[0.03]'}`}>
                              <span className={`font-semibold ${active ? 'text-accent-light' : 'text-fg'}`}>{planetName(bhukti?.lord ?? reading.lord, lang)} – {planetName(d.lord, lang)}</span>
                              <span className="font-mono text-xs text-muted">{d.startUtc} → {d.endUtc}</span>
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  )}
                </div>
              )}

              {/* ── TIMELINE (age → effects) ── */}
              {tab === 'timeline' && (
                <div className="space-y-5">
                  <div className="glass-card p-5">
                    <h3 className="mb-1 font-groovy text-lg text-fg">{t.timelineTitle}</h3>
                    <p className="text-sm leading-relaxed text-muted">{t.timelineDesc}</p>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
                      <span className="rounded bg-jade/15 px-1.5 py-0.5 text-jade">{lang === 'mm' ? 'ကောင်း' : 'benefic'}</span>
                      <span className="rounded bg-coral/15 px-1.5 py-0.5 text-coral">{lang === 'mm' ? 'သတိ / သာဓေသတီ' : 'caution / Sade Sati'}</span>
                      <span className="text-muted">{lang === 'mm' ? '· ဂြိုဟ်သွားအိမ်ကို စန်းမှ ရေတွက်' : '· transit house counted from the Moon'}</span>
                    </div>
                  </div>
                  <div className="glass-card p-5">
                    <TimelineChart timeline={data.timeline} currentAge={data.timeline.find((yy) => yy.year === thisYear)?.age ?? -1} lang={lang} />
                  </div>
                  <div className="glass-card overflow-x-auto p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full min-w-[760px] border-collapse text-left text-xs">
                      <thead className="font-mono text-[10px] uppercase tracking-wider text-muted">
                        <tr>
                          {[t.colYear, t.colAge, t.colPeriod, t.colStars, t.colTheme, t.colJup, t.colSat, t.colRahu, t.colNotes].map((h) => (
                            <th key={h} className="px-2.5 py-2.5 whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {data.timeline.map((y) => {
                          const cur = y.year === thisYear
                          const cell = (tp?: TransitPos) => tp
                            ? <>{signLabel(tp.sign, lang)} <span className="text-muted">·{lang === 'mm' ? toMmDigits(tp.houseFromMoon) : tp.houseFromMoon}</span></>
                            : <span className="text-muted">—</span>
                          const jup = y.transits.find((x) => x.planet === 'Jupiter')
                          const sat = y.transits.find((x) => x.planet === 'Saturn')
                          const rah = y.transits.find((x) => x.planet === 'Rahu')
                          return (
                            <tr key={y.age} className={`border-t border-white/5 ${cur ? 'bg-accent/10' : y.sadeSati ? 'bg-coral/[0.06]' : 'hover:bg-white/[0.03]'}`}>
                              <td className="px-2.5 py-2 font-mono text-muted whitespace-nowrap">{y.year}{cur && <span className="ml-1 rounded bg-accent/20 px-1 text-[9px] text-accent-light">{t.nowRow}</span>}</td>
                              <td className="px-2.5 py-2 font-mono text-fg/90">{lang === 'mm' ? toMmDigits(y.age) : y.age}</td>
                              <td className="px-2.5 py-2 whitespace-nowrap text-fg/90">{planetName(y.maha, lang)}<span className="text-muted"> – {planetName(y.bhukti, lang)}</span></td>
                              <td className="px-2.5 py-2 whitespace-nowrap" title={`${y.stars}/5`}><span className="text-accent-light">{'★'.repeat(y.stars)}</span><span className="text-muted">{'☆'.repeat(5 - y.stars)}</span></td>
                              <td className="px-2.5 py-2 text-fg/80 whitespace-nowrap">{themeWord(y.bhukti || y.maha, lang)}</td>
                              <td className="px-2.5 py-2 font-mono text-fg/80 whitespace-nowrap">{cell(jup)}</td>
                              <td className={`px-2.5 py-2 font-mono whitespace-nowrap ${y.sadeSati ? 'text-coral' : 'text-fg/80'}`}>{cell(sat)}</td>
                              <td className="px-2.5 py-2 font-mono text-fg/80 whitespace-nowrap">{cell(rah)}</td>
                              <td className="px-2.5 py-2">
                                <div className="flex flex-wrap gap-1">
                                  {y.notes.map((n, i) => (
                                    <span key={i} className={`rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap ${n.tone === 'good' ? 'bg-jade/15 text-jade' : n.tone === 'warn' ? 'bg-coral/15 text-coral' : 'bg-white/10 text-muted'}`}>{transitNoteText(n, lang)}</span>
                                  ))}
                                </div>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ── ASHTAKAVARGA ── */}
              {tab === 'ashtaka' && <AshtakavargaView data={data} lang={lang} />}

              {/* ── SHADBALA ── */}
              {tab === 'shadbala' && <ShadbalaView data={data} lang={lang} />}

              {/* ── D1 ── */}
              {tab === 'd1' && (
                <div className="space-y-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="glass-card p-5"><ChartView style={chartStyle} data={data} /></div>
                    {moon && <div className="glass-card p-5"><ChartView style={chartStyle} data={data} lagnaSign={moon.sign} title="Chandra · D1" subtitle={`Moon: ${moon.signName}`} /></div>}
                  </div>
                  <div className="glass-card p-5"><p className="text-sm leading-relaxed text-muted">{t.d1Desc}</p></div>
                  <div className="glass-card overflow-x-auto p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                      <thead className="font-mono text-[11px] uppercase tracking-wider text-muted">
                        <tr>{['Planet', 'Sign', 'Degree', 'Nakshatra (pada)', 'House', 'Dignity'].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {data.planets.map((p) => (
                          <tr key={p.name} className="border-t border-white/5 hover:bg-white/[0.03]">
                            <td className="px-4 py-2.5 font-medium text-fg">{planetName(p.name, lang)}{p.retrograde && <span className="ml-1 text-jade" title="Retrograde">℞</span>}{p.combust && <span className="ml-1 text-coral" title="Combust (asta)">☀</span>}</td>
                            <td className="px-4 py-2.5 text-fg/90">{signLabel(p.sign, lang)}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted">{deg(p.degreeInSign)}</td>
                            <td className="px-4 py-2.5 text-fg/90">{p.nakshatraName} <span className="text-muted">({p.pada})</span></td>
                            <td className="px-4 py-2.5 font-mono text-xs text-muted">{p.house}</td>
                            <td className="px-4 py-2.5">{p.dignity !== '-' ? <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] text-accent-light">{p.dignity}</span> : <span className="text-muted">—</span>}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {tab === 'vargas' && (
                <div className="space-y-4">
                  <div className="no-print flex flex-wrap items-center gap-2">
                    <span className={labelCls}>{lang === 'mm' ? 'ခွဲဝေဇာတာ ရွေးရန်' : 'Divisional chart'}</span>
                    <select value={vargaN} onChange={(e) => setVargaN(Number(e.target.value))}
                      className="rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50">
                      {VARGAS.map((v) => <option key={v.n} value={v.n} className="text-black">{v.name}</option>)}
                    </select>
                  </div>
                  <VargaPanel data={data} lang={lang} signOf={(p) => p.vargas['D' + vargaN] ?? p.sign} lagnaSign={vargaSign(data.ascendant.longitude, vargaN)}
                    title={curVarga.name} subtitle={`Lagna: ${signLabel(vargaSign(data.ascendant.longitude, vargaN), lang)}`}
                    desc={lang === 'mm' ? curVarga.desc.mm : curVarga.desc.en} chartStyle={chartStyle} />

                  {/* D1–D60 educational accordion */}
                  <div className="glass-card p-5">
                    <h3 className="mb-3 font-groovy text-base text-fg">{lang === 'mm' ? 'ခွဲဝေဇာတာများ၏ အဓိပ္ပာယ် (D1–D60)' : 'What each Divisional Chart means (D1–D60)'}</h3>
                    <div className="space-y-1.5">
                      {VARGA_GUIDE.map((v) => (
                        <details key={v.code} className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 transition hover:border-accent/30 open:border-accent/30 open:bg-accent/[0.04]">
                          <summary className="flex cursor-pointer list-none items-center justify-between font-mono text-sm text-fg/90">
                            <span>{v.code}</span>
                            <span className="text-muted transition group-open:rotate-180">▾</span>
                          </summary>
                          <p className="mt-2 text-xs leading-relaxed text-muted">{lang === 'mm' ? v.mm : v.en}</p>
                        </details>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Remedy (yatra) — contact the Sayar */}
              <div ref={remedyRef} className="no-print glass-card border border-accent/25 p-6">
                <h3 className="font-groovy text-lg text-fg">{lang === 'mm' ? 'ယတြာ အစီအရင် — ဆရာ့ကို ဆက်သွယ်ရန်' : 'Remedy (Yatra) — Contact the Sayar'}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {lang === 'mm'
                    ? 'ကံညံ့/ဖိစီးနေသော ကဏ္ဍများအတွက် သင့်လျော်သည့် ယတြာ အစီအရင်ကို ဆရာ ဘုန်းမင်းသိုက်ဒင် ထံ တောင်းခံနိုင်ပါသည်။ အောက်တွင် ဖြည့်စွက်ပါ။'
                    : 'For areas under strain, you may request a suitable remedy (yatra) from Sayar Bhone Min Thike Din. Fill in your details below.'}
                </p>
                {remedyState === 'sent' ? (
                  <div className="mt-4 rounded-xl border border-jade/40 bg-jade/10 px-4 py-3 text-sm text-jade">
                    {lang === 'mm' ? 'ကျေးဇူးတင်ပါသည်။ သင့်တောင်းဆိုမှုကို ဆရာ့ထံ ပေးပို့ပြီးပါပြီ — မကြာမီ ဆက်သွယ်ပါမည်။' : 'Thank you — your request has been sent to the Sayar. You will be contacted soon.'}
                  </div>
                ) : (
                  <form onSubmit={submitRemedy} className="mt-4 grid gap-3 sm:grid-cols-2">
                    <label><span className={labelCls}>{lang === 'mm' ? 'ကဏ္ဍ' : 'Area'}</span>
                      <input value={remedyArea} onChange={(e) => setRemedyArea(e.target.value)} className={field} placeholder={lang === 'mm' ? 'ဥပမာ — အလုပ်အကိုင်' : 'e.g. Career'} /></label>
                    <label><span className={labelCls}>{lang === 'mm' ? 'ဆက်သွယ်ရန် (ဖုန်း/အီးမေးလ်)' : 'Contact (phone / email)'}</span>
                      <input value={remedyContact} onChange={(e) => setRemedyContact(e.target.value)} required className={field} /></label>
                    <label className="sm:col-span-2"><span className={labelCls}>{lang === 'mm' ? 'အသေးစိတ် မက်ဆေ့ချ်' : 'Message'}</span>
                      <textarea value={remedyMsg} onChange={(e) => setRemedyMsg(e.target.value)} rows={3} className={`${field} resize-y`} placeholder={lang === 'mm' ? 'သင့် အခြေအနေ / မေးလိုသည့်အရာ' : 'Your situation / what you would like to ask'} /></label>
                    <div className="flex items-center gap-3 sm:col-span-2">
                      <button type="submit" disabled={remedyState === 'sending'} className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-space transition hover:brightness-110 disabled:opacity-60">
                        {remedyState === 'sending' ? <><Loader2 size={15} className="animate-spin" /> {lang === 'mm' ? 'ပို့နေသည်…' : 'Sending…'}</> : (lang === 'mm' ? 'ဆရာ့ထံ ပေးပို့ရန်' : 'Send to the Sayar')}
                      </button>
                      {remedyState === 'error' && <span className="text-xs text-coral">{lang === 'mm' ? 'ပို့၍မရပါ — ပြန်ကြိုးစားပါ။' : 'Could not send — please try again.'}</span>}
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
