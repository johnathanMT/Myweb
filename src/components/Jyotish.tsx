import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, MapPin, Loader2, Search, Download, Star, Info, Sigma, FlaskConical, ArrowRight, ScrollText, Clock, Mail, CheckCircle2, ChevronDown, Lock, UserPlus, Pencil } from 'lucide-react'
import tzlookup from 'tz-lookup'
import { SITE } from '../config/site'
import KundliChart from './KundliChart'
import DiamondChart from './DiamondChart'
import AreaRadar from './AreaRadar'
import TimelineChart from './TimelineChart'
import AshtakavargaView from './AshtakavargaView'
import ShadbalaView from './ShadbalaView'
import CustomerPanel, { type SavedChart, type CustomerPanelHandle } from './CustomerPanel'
import MarkdownView from './MarkdownView'
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
interface Profile {
  id: number; email: string; username: string; emailConfirmed: boolean
  gender?: string; dob?: string; birthTime?: string; locationName?: string
  latitude?: number; longitude?: number; timezone?: string; hasProfile: boolean
}
type Tab = 'ai' | 'reading' | 'timeline' | 'd1' | 'vargas' | 'ashtaka' | 'shadbala'


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

const BIO_EN = 'Ko Bhone Min Thike Din prepares every reading with authentic Vedic (Jyotish) methods — the sidereal zodiac with the Lahiri ayanamsa, whole-sign houses, the Chandra Lagna (Moon ascendant), the sixteen divisional charts (D1–D60), the Vimśottarī dasha & antardasha system, planetary aspects (drishti), the six-fold Shadbala strengths and Ashtakavarga — all computed precisely by the classical Jyotish śāstras and offered as guidance for your own reflection.'
const BIO_MM = 'ကိုဘုန်းမင်းသိုက်ဒင် သည် ဟောကိန်းတိုင်းကို စစ်မှန်သော နက္ခတ်ဗေဒင် (Jyotish) နည်းစနစ်များဖြင့် အသေးစိတ် စစ်ဆေးတွက်ချက်ပါသည် — နက္ခတ်ရာသီစက်နှင့် Lahiri အယနန္သ၊ Whole-Sign အိမ်စနစ်၊ စန်းလဂ် (Chandra Lagna)၊ ဇာတာခွဲ ၁၆ မျိုး (D1–D60)၊ ဗိံရှောတ္တရီ ဒသာ/အန္တရ်ဒသာစနစ်၊ ဂြိုဟ်အမြင် (ဒြိဋ္ဌိ)၊ ဆဒ္ဗလ ဂြိုဟ်အား ၆ မျိုးနှင့် အဋ္ဌကဝဂ် — တို့ကို ဂန္ထဝင် ဇျောတိသကျမ်းများ၏ နည်းစနစ်အတိုင်း တိကျစွာ တွက်ချက်ပြီး၊ ကိုယ့်ကိုယ်ကို ပြန်လည်သုံးသပ်ရန် လမ်းညွှန်ချက်များ ပေးပါသည်။'

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

// Yoga meanings — bilingual. Keyed by the exact backend yoga name; also used as
// an educational guide (incl. Neecha Bhanga Raja Yoga).
const YOGA_INFO: Record<string, { en: string; mm: string }> = {
  'Gaja Kesari Yoga': {
    en: 'Jupiter in a kendra (1/4/7/10) from the Moon. Grants wisdom, virtue, prosperity and a respected, well-liked nature.',
    mm: 'ကြာသပတေးသည် စန်း (လ) မှ ကေန္ဒြ (၁/၄/၇/၁၀) တွင် တည်ရှိသောအခါ ဖြစ်သည်။ ပညာဉာဏ်၊ ဂုဏ်သိက္ခာ၊ ကြီးပွားချမ်းသာမှုနှင့် လူချစ်လူခင်ပေါများပြီး လေးစားခံရသော သဘာဝကို ပေးသည်။',
  },
  'Budha-Aditya Yoga': {
    en: 'Sun and Mercury conjunct in one sign. Sharp intellect, eloquence, skill in learning and business.',
    mm: 'နေနှင့် ဗုဒ္ဓဟူး တစ်ရာသီတည်း ပူးယှဉ်သောအခါ ဖြစ်သည်။ ဉာဏ်ရည်ထက်မြက်မှု၊ ဟောပြောဆက်သွယ်စွမ်း၊ ပညာနှင့် စီးပွားရေးကျွမ်းကျင်မှုကို ပေးသည်။',
  },
  'Chandra-Mangala Yoga': {
    en: 'Moon and Mars conjunct. Wealth through drive, enterprise and bold initiative.',
    mm: 'စန်းနှင့် အင်္ဂါ ပူးယှဉ်သောအခါ ဖြစ်သည်။ ဇွဲလုံ့လ၊ လုပ်ငန်းစွန့်ဦးတီထွင်မှုနှင့် ရဲရင့်သောဆုံးဖြတ်ချက်ဖြင့် ဥစ္စာဓန ရရှိမှုကို ပေးသည်။',
  },
  'Ruchaka Yoga': {
    en: 'Mars in its own/exaltation sign in a kendra (a Pancha Mahapurusha yoga). Courage, leadership and physical strength.',
    mm: 'အင်္ဂါသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ ရဲစွမ်းသတ္တိ၊ ခေါင်းဆောင်နိုင်စွမ်းနှင့် ကာယခွန်အားကို ပေးသည်။',
  },
  'Bhadra Yoga': {
    en: 'Mercury in its own/exaltation sign in a kendra. Intelligence, communication and business acumen.',
    mm: 'ဗုဒ္ဓဟူးသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ ဉာဏ်ရည်၊ ဟောပြောရေးသားစွမ်းနှင့် စီးပွားရေးဉာဏ်ကို ပေးသည်။',
  },
  'Hamsa Yoga': {
    en: 'Jupiter in its own/exaltation sign in a kendra. Virtue, wisdom, spirituality and honour.',
    mm: 'ကြာသပတေးသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ ကုသိုလ်တရား၊ ပညာ၊ ဝိညာဉ်ရေးနှင့် ဂုဏ်သိက္ခာကို ပေးသည်။',
  },
  'Malavya Yoga': {
    en: 'Venus in its own/exaltation sign in a kendra. Beauty, comfort, art and refined luxury.',
    mm: 'သောကြာသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ အလှ၊ သက်သာချမ်းသာမှု၊ အနုပညာနှင့် ဇိမ်ခံမှုကို ပေးသည်။',
  },
  'Sasa Yoga': {
    en: 'Saturn in its own/exaltation sign in a kendra. Discipline, authority, endurance and lasting success.',
    mm: 'စနေသည် ကိုယ်ပိုင်/ဥစ်ရာသီ ကေန္ဒြတွင် တည်ရှိသော ပဉ္စမဟာပုရုဿယောဂ။ စည်းကမ်း၊ အာဏာ၊ ခံနိုင်ရည်နှင့် ရေရှည်တည်တံ့သော အောင်မြင်မှုကို ပေးသည်။',
  },
  'Neecha Bhanga Raja Yoga': {
    en: 'A "debilitation-cancellation" raja yoga: a planet is debilitated (neecha), but its weakness is cancelled — e.g. the lord of its sign, or the planet that would be exalted there, sits in a kendra. Early struggles turn into great, hard-won success.',
    mm: 'ဂြိုဟ်တစ်လုံးသည် နိစ် (ကျဆင်း) ဖြစ်နေသော်လည်း ထိုနိစ်ဖြစ်မှုကို ပယ်ဖျက်ပေးသည့် အခြေအနေ (ဥပမာ — နိစ်ရာသီ၏ သခင် သို့မဟုတ် ထိုနေရာတွင် ဥစ်ဖြစ်မည့်ဂြိုဟ်သည် ကေန္ဒြတွင် တည်ရှိ) ရှိသောအခါ ဖြစ်သည်။ အစပိုင်း အခက်အခဲများမှတစ်ဆင့် နောက်ပိုင်း ကြီးကျယ်သော အောင်မြင်မှု (ရာဇယောဂ) ကို ပေးသည် — "ကျရှုံးရာမှ ကြီးပွား" ဆိုသည့်သဘော။',
  },
  'Raja Yoga': {
    en: 'A link (conjunction/aspect/exchange) between a kendra lord (1/4/7/10) and a trikona lord (1/5/9). Power, status and success.',
    mm: 'ကေန္ဒြသခင် (၁/၄/၇/၁၀) နှင့် တြိကုဏသခင် (၁/၅/၉) တို့ ဆက်စပ် (ပူးယှဉ်/အမြင်/ဖလှယ်) သောအခါ ဖြစ်သည်။ အာဏာ၊ ဂုဏ်အဆင့်နှင့် အောင်မြင်မှုကို ပေးသည်။',
  },
  'Dhana Yoga': {
    en: 'A link between the lords of wealth houses (2/11) and other benefic-house lords. Accumulation of wealth.',
    mm: 'ဓနအိမ် (၂/၁၁) သခင်များနှင့် အခြားအကျိုးပေးအိမ်သခင်များ ဆက်စပ်သောအခါ ဖြစ်သည်။ ဥစ္စာဓန စုဆောင်းနိုင်မှုကို ပေးသည်။',
  },
}
const yogaText = (name: string, lang: Lang) => (YOGA_INFO[name] ? YOGA_INFO[name][lang] : '')

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
  const [placeConfirmed, setPlaceConfirmed] = useState(false)   // true only after a city is picked/preset
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

  // Remedy / contact-to-Ko Bhone Min Thike Din form.
  const remedyRef = useRef<HTMLDivElement>(null)
  const [remedyArea, setRemedyArea] = useState('')
  const [remedyContact, setRemedyContact] = useState('')
  const [remedyMsg, setRemedyMsg] = useState('')
  const [remedyState, setRemedyState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  // Full-reading PDF via the browser's print engine (captures every tab's charts & tables).
  const [printAll, setPrintAll] = useState(false)

  // Customer account (email-only sign-up); token drives per-account chart saving.
  const [customerToken, setCustomerToken] = useState<string | null>(null)

  // AI reading
  // Manual-approval reading workflow: request → pending → (Sayar approves) → approved.
  const [reqStatus, setReqStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none')
  const [reqMarkdown, setReqMarkdown] = useState('')
  const [reqId, setReqId] = useState<number | null>(null)
  const [reqLoading, setReqLoading] = useState(false)
  const [reqError, setReqError] = useState('')
  const [reqInfo, setReqInfo] = useState('')
  const [pdfRequested, setPdfRequested] = useState(false)
  const [pdfLoading, setPdfLoading] = useState(false)
  const [pdfEmail, setPdfEmail] = useState('')
  const customerPanelRef = useRef<CustomerPanelHandle>(null)
  const [howtoOpen, setHowtoOpen] = useState(false)
  const [verifyToast, setVerifyToast] = useState('')
  const [profile, setProfile] = useState<Profile | null>(null)
  const [otherMode, setOtherMode] = useState(false)   // "calculate for someone else"
  const loadSavedChart = (c: SavedChart) => {
    setName(c.name || ''); setGender(c.gender === 'female' ? 'female' : 'male')
    setDate(c.birthDate || date); setTime(c.birthTime || time)
    setLat(String(c.latitude)); setLon(String(c.longitude))
    if (c.timeZone) setTz(c.timeZone)
    setPlace(c.name ? `${c.name} · saved` : 'Saved location'); setPlaceConfirmed(true)
  }

  const onPlaceChange = (v: string) => {
    setPlace(v)
    setPlaceConfirmed(false)   // typing invalidates until a result is chosen
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
    setLat(String(la)); setLon(String(lo)); setPlace(g.display_name.split(',').slice(0, 2).join(',').trim()); setResults([]); setPlaceConfirmed(true)
    try { setTz(tzlookup(la, lo)) } catch { /* keep */ }
  }
  const applyPreset = (p: Preset) => { setLat(String(p.lat)); setLon(String(p.lon)); setTz(p.tz); setPlace(p.label); setResults([]); setPlaceConfirmed(true) }

  const canSubmit = !!name.trim() && placeConfirmed && consent

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return   // name + confirmed city + consent are all mandatory
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
        }).catch(() => { })
      }
      // Logged-in customers: also save under their account (history + autofill).
      if (customerToken) {
        fetch(`${SITE.apiUrl}/api/customer/save-chart`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${customerToken}` },
          body: JSON.stringify({
            name: name.trim(), gender, birthDate: date, birthTime: time, timeZone: tz,
            latitude: Number(lat), longitude: Number(lon), nayNan: naynan(date, time)?.num ?? 0, consent: true,
          }),
        }).catch(() => { })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute the chart.')
    } finally { setLoading(false) }
  }

  // ── Registered dashboard: compute the account's own chart from its profile.
  // Also syncs the form state so the reading payload / status use this identity. ──
  const computeFromProfile = async (p: Profile) => {
    if (!p.dob || p.latitude == null || p.longitude == null) return
    const g: 'male' | 'female' = p.gender === 'female' ? 'female' : 'male'
    const bt = p.birthTime || '12:00'
    setName(p.username || ''); setGender(g)
    setDate(p.dob); setTime(bt)
    setLat(String(p.latitude)); setLon(String(p.longitude))
    if (p.timezone) setTz(p.timezone)
    setPlace(p.locationName || 'My birth place'); setPlaceConfirmed(true)
    setError(''); setLoading(true); setData(null)
    try {
      const [y, mo, d] = p.dob.split('-').map(Number)
      const [h, mi] = bt.split(':').map(Number)
      const body: BirthChartRequest = {
        year: y, month: mo, day: d, hour: h || 0, minute: mi || 0, second: 0,
        timeZone: p.timezone || tz, latitude: p.latitude, longitude: p.longitude, ayanamsa,
      }
      const res = await fetch(CHART_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const json = (await res.json().catch(() => null)) as { success?: boolean; data?: BirthChartData; message?: string } | null
      if (!res.ok || !json?.success || !json.data) throw new Error(json?.message || `Failed (${res.status})`)
      setData(json.data); setQuerent({ name: (p.username || '').trim(), gender: g, nn: naynan(p.dob, bt) }); setTab('reading')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not compute your chart.')
    } finally { setLoading(false) }
  }

  // Fetch the profile whenever the auth token changes.
  useEffect(() => {
    if (!customerToken) { setProfile(null); setOtherMode(false); return }
    let cancelled = false
    fetch(`${SITE.apiUrl}/api/customer/me`, { headers: { Authorization: `Bearer ${customerToken}` } })
      .then((r) => r.json()).then((j) => { if (!cancelled && j?.success && j.data) setProfile(j.data as Profile) })
      .catch(() => { /* ignore */ })
    return () => { cancelled = true }
  }, [customerToken])

  const refreshProfile = () => {
    if (!customerToken) return
    fetch(`${SITE.apiUrl}/api/customer/me`, { headers: { Authorization: `Bearer ${customerToken}` } })
      .then((r) => r.json()).then((j) => { if (j?.success && j.data) { setProfile(j.data as Profile); setOtherMode(false) } })
      .catch(() => { /* ignore */ })
  }

  // Registered + has profile + not "someone else" → instantly show their chart.
  const showDashboard = !!(customerToken && profile?.hasProfile && !otherMode)
  useEffect(() => {
    if (showDashboard && profile) computeFromProfile(profile)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDashboard, profile])

  const startCalcForOther = () => {
    setOtherMode(true); setData(null)
    setName(''); setGender('male'); setPlace(''); setPlaceConfirmed(false); setResults([])
    setReqStatus('none'); setReqMarkdown(''); setReqId(null); setPdfRequested(false); setPdfEmail(''); setReqError(''); setReqInfo('')
  }
  const backToDashboard = () => { setOtherMode(false); setReqStatus('none'); setReqMarkdown(''); setReqId(null); setPdfRequested(false) }

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

  // Render every tab, switch to the light (print-friendly) theme, then open the
  // browser's Save-as-PDF dialog. The full reading — charts, tables, timeline —
  // is captured because printAll forces all sections into the DOM.
  const downloadPdf = () => {
    const html = document.documentElement
    const prevTheme = html.getAttribute('data-theme') || 'dark'
    setPrintAll(true)
    html.setAttribute('data-theme', 'light')
    const restore = () => { html.setAttribute('data-theme', prevTheme); setPrintAll(false); window.removeEventListener('afterprint', restore) }
    window.addEventListener('afterprint', restore)
    setTimeout(() => window.print(), 180)
  }

  const moon = data?.planets.find((p) => p.name === 'Moon')
  const now = Date.now()
  const thisYear = new Date().getFullYear()
  const barColor = (tone: string) => tone === 'favorable' ? 'rgb(var(--jade))' : tone === 'testing' ? 'rgb(var(--coral))' : 'rgb(var(--accent))'
  const reading = data ? readingFor(data, lang) : null
  const bhukti = data ? activeBhukti(data) : undefined
  const prat = data ? activePratyantar(data) : undefined

  // ── Detailed reading: summarise the computed chart → request → Sayar approves ─
  // Identity used for the 30-day dedup hash on the backend (must match the payload).
  const readingIdentity = () => ({
    name: querent?.name || name.trim() || undefined,
    birthDate: date,
    birthTime: time,
    location: place.trim() || `${lat},${lon}`,
  })

  const buildAiPayload = () => {
    if (!data) return null
    const en: Lang = 'en'
    const moonP = data.planets.find((p) => p.name === 'Moon')
    const sunP = data.planets.find((p) => p.name === 'Sun')
    const dig = (d: string) => (d && d !== '-' ? dignityLabel(d, en) : undefined)
    const sav = data.ashtakavarga?.sav ?? []
    let ashNotes: string | undefined
    if (sav.length === 12) {
      let hi = 0, lo = 0
      for (let i = 1; i < 12; i++) { if (sav[i] > sav[hi]) hi = i; if (sav[i] < sav[lo]) lo = i }
      ashNotes = `Strongest ${signLabel(hi, en)} (${sav[hi]}); weakest ${signLabel(lo, en)} (${sav[lo]})`
    }
    const yr = data.timeline?.find((y) => y.year === thisYear)
    return {
      name: querent?.name || name.trim() || undefined,
      gender: querent?.gender || gender,
      nayNan: querent?.nn ? `${querent.nn.enDay} (No. ${querent.nn.num}, ${querent.nn.planet})` : undefined,
      ascendant: signLabel(data.ascendant.sign, en),
      moonSign: moonP ? signLabel(moonP.sign, en) : undefined,
      sunSign: sunP ? signLabel(sunP.sign, en) : undefined,
      placements: data.planets.slice(0, 20).map((p) => ({
        planet: planetName(p.name, en), sign: signLabel(p.sign, en), house: p.house,
        nakshatra: p.nakshatraName, retrograde: p.retrograde, dignity: dig(p.dignity),
      })),
      mahadasha: reading ? planetName(reading.lord, en) : undefined,
      antardasha: bhukti ? planetName(bhukti.lord, en) : undefined,
      pratyantardasha: prat ? planetName(prat.lord, en) : undefined,
      dashaWindow: bhukti ? `${bhukti.startUtc} → ${bhukti.endUtc}` : undefined,
      sadeSatiStatus: yr?.sadeSati ? 'Active this year' : 'Not active this year',
      sarvashtakavargaBySign: sav.length === 12 ? sav : undefined,
      ashtakavargaNotes: ashNotes,
      yogas: (data.yogas ?? []).map((y) => y.name).slice(0, 30),
      language: lang === 'mm' ? 'my' : 'en',
      // birthDate / birthTime / location → used only for the 30-day dedup hash
      birthDate: date,
      birthTime: time,
      location: place.trim() || `${lat},${lon}`,
    }
  }

  type StatusData = { status: string; requestId: number; markdown?: string; pdfRequested?: boolean; alreadyRequested?: boolean }
  const applyStatus = (d: StatusData | null | undefined) => {
    if (d && d.status && d.status.toLowerCase() !== 'none') {
      setReqStatus(d.status.toLowerCase() as 'pending' | 'approved' | 'rejected')
      setReqId(d.requestId ?? null)
      setReqMarkdown(d.markdown || '')
      setPdfRequested(!!d.pdfRequested)
    } else {
      setReqStatus('none'); setReqId(null); setReqMarkdown(''); setPdfRequested(false)
    }
  }

  // On chart compute (and revisits), check whether a request already exists / is approved.
  const checkReadingStatus = async () => {
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/reading-status`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(readingIdentity()),
      })
      const json = (await res.json().catch(() => null)) as { data?: StatusData } | null
      applyStatus(json?.data)
    } catch { /* ignore */ }
  }
  useEffect(() => { if (data) { setReqError(''); setReqInfo(''); checkReadingStatus() } }, [data]) // eslint-disable-line react-hooks/exhaustive-deps

  // Submit a request — NO AI call; the Sayar reviews and approves later.
  const requestReading = async () => {
    if (!data || reqLoading) return
    const payload = buildAiPayload()
    if (!payload) return
    setReqLoading(true); setReqError(''); setReqInfo('')
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (customerToken) headers.Authorization = `Bearer ${customerToken}`
      const res = await fetch(`${SITE.apiUrl}/api/astrology/request-reading`, {
        method: 'POST', headers, body: JSON.stringify(payload),
      })
      const json = (await res.json().catch(() => null)) as { success?: boolean; message?: string; data?: StatusData } | null
      if (!res.ok || !json?.data) throw new Error(json?.message || `Failed (${res.status})`)
      applyStatus(json.data)
      if (json.data.alreadyRequested) setReqInfo(json.message || '')
    } catch (err) {
      setReqError(err instanceof Error ? err.message : 'Could not send the request.')
    } finally { setReqLoading(false) }
  }

  const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim())
  const requestReadingPdf = async () => {
    if (!reqId || pdfLoading || pdfRequested || !emailOk(pdfEmail)) return
    setPdfLoading(true)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/reading/${reqId}/request-pdf`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: pdfEmail.trim() }),
      })
      if (res.ok) setPdfRequested(true)
    } catch { /* ignore */ } finally { setPdfLoading(false) }
  }

  // Task 3 — after the email-confirm redirect (…/jyotish?verified=true&token=…),
  // auto-login: hand the token to CustomerPanel, scrub the URL, and toast.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tk = params.get('token')
    if (tk && params.get('verified') === 'true') {
      customerPanelRef.current?.ingestToken(tk)
      params.delete('token'); params.delete('verified')
      const qs = params.toString()
      window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      setVerifyToast(lang === 'mm'
        ? 'အကောင့် အတည်ပြုပြီးပါပြီ။ အလိုအလျောက် Login ဝင်ရောက်ပြီးပါပြီ။'
        : 'Account confirmed — you are now automatically logged in.')
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!verifyToast) return; const id = setTimeout(() => setVerifyToast(''), 4000); return () => clearTimeout(id) }, [verifyToast])

  const openAuth = (mode: 'login' | 'signup') => customerPanelRef.current?.openAuth(mode)

  const curVarga = VARGAS.find((v) => v.n === vargaN) ?? VARGAS[4]
  const TABS: { id: Tab; label: string }[] = [
    { id: 'ai', label: lang === 'mm' ? '📜 အသေးစိတ် ဟောစာတမ်း' : '📜 Detailed Reading' },
    { id: 'reading', label: lang === 'mm' ? 'မွေးဇာတာစစ်ဆေးရန်' : t.tabReading }, { id: 'timeline', label: t.tabTimeline }, { id: 'd1', label: t.tabD1 },
    { id: 'vargas', label: lang === 'mm' ? 'ခွဲဝေဇာတာ' : 'Vargas' },
    { id: 'ashtaka', label: lang === 'mm' ? 'အဋ္ဌကဝဂ်' : 'Ashtaka' },
    { id: 'shadbala', label: lang === 'mm' ? 'ဆဒ္ဗလ' : 'Shadbala' },
  ]

  return (
    <section className="section-container vedin-page">
      {/* ── Grand Astrologer Profile — centered, large photo, bio below ── */}
      {/* print-hide: the photo + bio are omitted from the printed PDF (Phase 4) */}
      <div className="print-hide relative mb-8 overflow-hidden rounded-3xl border border-accent/25 p-6 text-center sm:p-10"
        style={{ background: 'linear-gradient(135deg, rgb(var(--card)) 0%, rgb(var(--surface)) 100%)', boxShadow: '0 0 60px -20px rgb(var(--accent) / 0.45)' }}>
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />

        {/* language toggle — pinned top-right */}
        <div className="no-print absolute right-4 top-4 z-10 flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur">
          {(['en', 'mm'] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
              {l === 'en' ? 'EN' : 'မြန်မာစာ'}
            </button>
          ))}
        </div>

        <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-5">
          <div className="relative h-36 w-36 shrink-0 rounded-full p-[4px] sm:h-44 sm:w-44"
            style={{ background: 'conic-gradient(from 200deg, #eab308, #a855f7, #22d3ee, #eab308)', boxShadow: '0 0 44px -6px rgba(168,85,247,0.65), 0 0 30px -8px rgba(234,179,8,0.6)' }}>
            <div className="relative h-full w-full overflow-hidden rounded-full bg-card">
              <span className="absolute inset-0 flex items-center justify-center font-groovy text-5xl text-accent">ဘ</span>
              <img src="/sayar.jpg" alt="Bhone Min Thike Din" className="relative h-full w-full object-cover" loading="lazy"
                onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
            </div>
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-accent-light">{lang === 'mm' ? 'ဗေဒင်ပညာ လေ့လာဆည်းပူးသူ' : 'Vedic Astrology Enthusiast'}</p>
            <h1 className="mt-1.5 font-groovy text-3xl text-fg sm:text-4xl">{lang === 'mm' ? 'ဘုန်းမင်းသိုက်ဒင်' : 'Bhone Min Thike Din'}</h1>
            <p className="mt-1 font-mono text-xs text-muted">{lang === 'mm' ? 'နက္ခတ်ဗေဒင် · ဝိံရှောတ္တရီ ဒသာ · ဆဒ္ဗလ' : 'Sidereal Jyotish · Vimshottari Dasha · Shadbala'}</p>
          </div>
          <p className="text-[15px] leading-relaxed text-muted">{lang === 'mm' ? BIO_MM : BIO_EN}</p>
        </div>
      </div>

      {/* ── Portals: the computation behind the charts ── */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 no-print">
        {/* Portal 1 — The Algorithm */}
        <Link to="/algorithms"
          className="group relative overflow-hidden rounded-2xl border border-accent/25 bg-gradient-to-br from-accent/[0.12] via-card to-jade/[0.06] p-6 transition duration-300 hover:border-accent/50 hover:shadow-[0_0_44px_-10px_rgba(168,85,247,0.55)] focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl transition duration-500 group-hover:bg-accent/30" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-accent/40 bg-accent/15 text-accent-light shadow-inner">
              <Sigma size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent-light">{lang === 'mm' ? 'ကွန်ပျူတာသိပ္ပံဆိုင်ရာ အခြေခံ' : 'The Computation'}</p>
              <h3 className="mt-1 font-groovy text-xl text-fg">{lang === 'mm' ? 'အယ်လဂိုရီသမ်များ' : 'The Algorithm'}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{lang === 'mm' ? 'ဇာတာများ၏ နောက်ကွယ်မှကိန်းအောင်းနေသော သင်္ချာနှင့် ကုဒ်များ — Julian Day မှ Ashtakavarga အထိ။' : 'The math & code behind the charts — from Julian Day to Ashtakavarga.'}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-accent-light transition group-hover:gap-2.5">{lang === 'mm' ? 'အသေးစိတ်ကြည့်ရှုရန်' : 'Explore'} <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>

        {/* Portal 2 — Falsifiable research protocol */}
        <Link to="/research"
          className="group relative overflow-hidden rounded-2xl border border-jade/25 bg-gradient-to-br from-jade/[0.12] via-card to-accent/[0.06] p-6 transition duration-300 hover:border-jade/50 hover:shadow-[0_0_44px_-10px_rgba(52,211,153,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-jade/60">
          <span aria-hidden className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-jade/20 blur-3xl transition duration-500 group-hover:bg-jade/30" />
          <div className="relative flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-jade/40 bg-jade/15 text-jade shadow-inner">
              <FlaskConical size={22} />
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-jade">{lang === 'mm' ? 'သိပ္ပံနည်းကျ ရိုးသားမှု' : 'Honest Science'}</p>
              <h3 className="mt-1 font-groovy text-xl text-fg">{lang === 'mm' ? 'တိုင်းတာနိုင်သော သုတေသန' : 'Falsifiable Research'}</h3>
              <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{lang === 'mm' ? 'ကြိုတင်မှတ်တမ်း၊ base rate၊ permutation test — ဟောကြားချက်ကို တိုင်းတာနိုင်သည်။' : 'Pre-registration, base rates, permutation tests — we measure claims, not boast them.'}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] text-jade transition group-hover:gap-2.5">{lang === 'mm' ? 'လုပ်ထုံးလုပ်နည်းများ ကြည့်ရန်' : 'View protocol'} <ArrowRight size={13} /></span>
            </div>
          </div>
        </Link>
      </div>

      {/* ── Customer account (sign in / saved charts) ── */}
      <div className="mb-6">
        <CustomerPanel ref={customerPanelRef} lang={lang} onAuthChange={setCustomerToken} onLoadChart={loadSavedChart} onProfileSaved={refreshProfile} />
      </div>

      {/* ── Registered dashboard banner (Emerald/Mint + Deep Purple) ── */}
      {showDashboard && profile && (
        <div className="relative mb-6 overflow-hidden rounded-3xl border p-6 sm:p-8 no-print"
          style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.20) 0%, rgba(20,16,34,0.55) 46%, rgba(124,58,237,0.30) 100%)', borderColor: 'rgba(124,58,237,0.42)', boxShadow: '0 0 70px -20px rgba(16,185,129,0.45), 0 0 60px -24px rgba(124,58,237,0.5)' }}>
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #34d399 0%, transparent 70%)' }} />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-56 w-56 rounded-full opacity-40 blur-3xl" style={{ background: 'radial-gradient(circle, #a855f7 0%, transparent 70%)' }} />
          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em]" style={{ color: '#6ee7b7' }}><Sparkles size={14} /> {lang === 'mm' ? 'သင့်ကိုယ်ပိုင် Jyotish Dashboard' : 'Your personal Jyotish dashboard'}</p>
              <h2 className="mt-2 font-groovy text-2xl text-fg sm:text-3xl">{lang === 'mm' ? `ကြိုဆိုပါတယ်၊ ${profile.username} 🙏` : `Welcome to your personal Jyotish dashboard, ${profile.username}`}</h2>
              <div className="mt-3 flex flex-wrap gap-2 font-mono text-[11px]">
                {profile.dob && <span className="rounded-full border border-jade/30 bg-jade/10 px-2.5 py-1 text-jade">🎂 {profile.dob}{profile.birthTime ? ` · ${profile.birthTime}` : ''}</span>}
                {profile.locationName && <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-accent-light">📍 {profile.locationName}</span>}
                {profile.gender && <span className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-muted">{profile.gender === 'female' ? (lang === 'mm' ? 'မ' : 'Female') : (lang === 'mm' ? 'ကျား' : 'Male')}</span>}
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-2 self-start sm:items-end">
              <button type="button" onClick={() => customerPanelRef.current?.openProfileEdit()}
                className="inline-flex items-center gap-2 rounded-xl border border-jade/40 bg-jade/15 px-4 py-2.5 text-sm font-semibold text-jade transition hover:bg-jade/25">
                <Pencil size={15} /> {lang === 'mm' ? 'ပရိုဖိုင် ပြင်ရန်' : 'Edit Profile'}
              </button>
              <button type="button" onClick={startCalcForOther}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-fg transition hover:bg-white/20">
                <Search size={15} /> {lang === 'mm' ? 'အခြားသူအတွက် တွက်ရန်' : 'Calculate for someone else'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Intro: Chandra Lagna + Instructions ── */}
      {!showDashboard && (
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
      )}

      <div className="space-y-8">
        {/* Back to dashboard (while calculating for someone else) */}
        {customerToken && profile?.hasProfile && otherMode && (
          <button type="button" onClick={backToDashboard}
            className="no-print inline-flex items-center gap-1.5 rounded-full border border-jade/30 bg-jade/10 px-4 py-2 font-mono text-xs text-jade transition hover:bg-jade/20">
            ← {lang === 'mm' ? 'ကျွန်ုပ်၏ Dashboard သို့ ပြန်သွားရန်' : 'Back to my dashboard'}
          </button>
        )}

        {!showDashboard && (<>
        {/* Fallback prompt — signed in but no saved birth profile */}
        {customerToken && profile && !profile.hasProfile && !otherMode && (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-5 py-4 text-sm leading-relaxed text-accent-light no-print sm:flex-row sm:items-center sm:justify-between">
            <span>{lang === 'mm' ? 'သင့်အကောင့်တွင် မွေးဇာတာ ပရိုဖိုင် မရှိသေးပါ။ ပရိုဖိုင် ထည့်ပါ (သို့) အောက်ရှိ ဖောင်တွင် ဖြည့်ပါ။' : 'Your account has no birth profile yet — add one, or use the form below.'}</span>
            <button type="button" onClick={() => customerPanelRef.current?.openProfileEdit()}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-sm font-semibold text-space transition hover:brightness-110 sm:self-auto">
              <Pencil size={15} /> {lang === 'mm' ? 'ပရိုဖိုင် ထည့်ရန်' : 'Add Profile'}
            </button>
          </div>
        )}
        {/* ── How to use (accordion) + form title ── */}
        <div className="mx-auto w-full max-w-3xl no-print">
          <div className="overflow-hidden rounded-2xl border border-accent/25 bg-accent/[0.05]">
            <button type="button" onClick={() => setHowtoOpen((o) => !o)} aria-expanded={howtoOpen}
              className="flex w-full items-center justify-between gap-2 px-5 py-3.5 text-left transition hover:bg-accent/[0.08]">
              <span className="flex items-center gap-2 font-groovy text-base text-fg"><Info size={16} className="text-accent" /> {lang === 'mm' ? 'အသုံးပြုနည်း' : 'How to use'}</span>
              <ChevronDown size={18} className={`shrink-0 text-accent-light transition-transform ${howtoOpen ? 'rotate-180' : ''}`} />
            </button>
            {howtoOpen && (
              <ol className="space-y-2.5 border-t border-accent/15 px-5 py-4 text-sm leading-relaxed text-muted">
                {(lang === 'mm'
                  ? [
                    'မွေးသက္ကရာဇ် အချက်အလက်များ ဖြည့်သွင်းပါ။',
                    'ဇာတာများ သိမ်းဆည်းရန်နှင့် ဟောစာတမ်းတောင်းရန် အကောင့် ဖွင့်/ဝင်ပါ။',
                    '"အသေးစိတ် ဟောစာတမ်း" နေရာမှတစ်ဆင့် ဆရာ့ထံသို့ တောင်းဆိုမှု ပြုလုပ်ပါ။',
                    'ဆရာမှ အတည်ပြု (Approve) ပြီးပါက ဟောစာတမ်းဖတ်ရှုနိုင်ပြီး PDF ရယူနိုင်ပါသည်။',
                  ]
                  : [
                    'Fill in your birth details.',
                    'Create / sign in to an account to save charts and request a reading.',
                    'Submit a request to the Sayar from the “Detailed Reading” tab.',
                    'Once the Sayar approves, you can read the reading and get the PDF.',
                  ]
                ).map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent/20 font-mono text-[11px] font-semibold text-accent-light">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            )}
          </div>
          <h2 className="mt-6 text-center font-groovy text-lg text-fg sm:text-xl">
            {lang === 'mm' ? 'မိမိရဲ့ မွေးဇာတာစစ်ဆေးရန် အချက်အလက်များကို အပြည့်အစုံဖြည့်သွင်းပါ' : 'Enter your birth details to check your chart'}
          </h2>
        </div>

        {/* ── Form (centered on top; results span the full page below) ── */}
        <form onSubmit={submit} className="glass-card mx-auto w-full max-w-3xl p-6 no-print">
          <div className="mb-3 grid grid-cols-2 gap-3">
            <label><span className={labelCls}>{t.fldName} <span className="text-coral">*</span></span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder={lang === 'mm' ? 'အမည်' : 'Full name'}
                className={`${field} ${!name.trim() ? 'border-coral/40' : ''}`} /></label>
            <label><span className={labelCls}>{t.fldGender}</span>
              <select value={gender} onChange={(e) => setGender(e.target.value as 'male' | 'female')} className={field}>
                <option value="male" className="text-black">{t.male}</option>
                <option value="female" className="text-black">{t.female}</option>
              </select></label>
          </div>
          <label className="relative block">
            <span className={labelCls}>{lang === 'mm' ? 'မွေးဖွားရာ မြို့/ဇာတိ' : 'Birth place'} <span className="text-coral">*</span></span>
            <span className="relative mt-1.5 block">
              <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input value={place} onChange={(e) => onPlaceChange(e.target.value)} placeholder={lang === 'mm' ? 'မြို့ ရှာရန်…' : 'Search a city…'}
                className={`w-full rounded-xl border bg-white/5 py-2.5 pl-9 pr-8 text-sm text-fg outline-none transition focus:border-accent/50 ${placeConfirmed ? 'border-jade/50' : 'border-coral/40'}`} />
              {searching
                ? <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted" />
                : placeConfirmed && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-jade">✓</span>}
            </span>
            {!placeConfirmed && place.trim().length > 0 && !searching && (
              <span className="mt-1 block font-mono text-[10px] text-coral">{lang === 'mm' ? 'စာရင်းထဲမှ မြို့တစ်ခုကို ရွေးချယ်ပါ။' : 'Pick a city from the list.'}</span>
            )}
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
          <label className="mt-3 block"><span className={labelCls}>{lang === 'mm' ? 'အယနန္သ (Ayanamsa)' : 'Ayanamsa'}</span>
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
            <span><span className="text-coral">*</span> {lang === 'mm' ? 'အနာဂါတ်ဟောကိန်းများပိုမိုတိကျမှန်ကန်စွာ အထောက်အကူအတွက် ကျွန်ုပ်၏ မွေးဇာတာ အချက်အလက်ကို လုံခြုံစွာ သိမ်းဆည်းရန် သဘောတူပါသည်။' : "I consent to securely storing my birth details to assist the future astrologer's readings."}</span>
          </label>

          <button type="submit" disabled={loading || !canSubmit}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/25 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none">
            {loading ? <><Loader2 size={16} className="animate-spin" /> {lang === 'mm' ? 'တွက်ချက်ပေးနေပါသည်…' : 'Calculating…'}</> : <><Sparkles size={16} /> {lang === 'mm' ? 'ဇာတာ တွက်မည်' : 'Generate Chart'}</>}
          </button>
          {!canSubmit && (
            <ul className="mt-2 space-y-1">
              {!name.trim() && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{lang === 'mm' ? 'အမည် ဖြည့်သွင်းပါ။' : 'Please enter a name.'}</li>}
              {!placeConfirmed && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{lang === 'mm' ? 'မွေးဖွားရာ မြို့/ဇာတိကို ရှာဖွေ၍ စာရင်းထဲမှ ရွေးချယ်ပါ။' : 'Search and select your birth city from the list.'}</li>}
              {!consent && <li className="flex items-start gap-1.5 font-mono text-[11px] leading-relaxed text-coral"><span>•</span>{lang === 'mm' ? 'အချက်အလက်သိမ်းဆည်းခွင့်ကို သဘောတူညီပေးပါ။' : 'Please agree to the data-storage consent.'}</li>}
            </ul>
          )}
          {error && <p className="mt-3 rounded-xl border border-coral/40 bg-coral/10 px-3 py-2 font-mono text-xs text-coral">{error}</p>}
          <p className="mt-4 font-mono text-[10px] leading-relaxed text-muted">{t.disclaimer}</p>
        </form>
        </>)}

        {/* ── Result ── */}
        <div className="min-w-0">
          {!data && !loading && (
            <div className="glass-card flex min-h-[300px] items-center justify-center p-8 text-center text-sm text-muted no-print">
              {lang === 'mm' ? 'မွေးသက္ကာရာဇ်နှင့်အချက်အလက်ထည့်၍ ဟောစာတမ်း၊ ဇာတာခွင်များ (D1/D9/D10/D7) ကြည့်ရှုပါ။' : 'Enter birth details to see the reading and the D1 / D9 / D10 / D7 charts.'}
            </div>
          )}

          {data && reading && (
            <div className="min-w-0 space-y-5">
              {/* header + full-reading PDF download */}
              <div className="flex flex-col gap-3 no-print sm:flex-row sm:items-center sm:justify-between">
                <h2 className="font-groovy text-lg text-fg">{place || t.portalTitle}</h2>
                <button type="button" onClick={downloadPdf}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-xs font-semibold text-space shadow-lg shadow-accent/25 transition hover:brightness-110">
                  <Download size={14} /> {lang === 'mm' ? 'မွေးဇာတာ ဟောစာတမ်း PDF အပြည့်အစုံ ရယူရန်တောင်းဆိုပါ' : 'Download Full Natal Chart PDF'}
                </button>
              </div>
              <div className="no-print sticky top-14 z-30 -mx-1 border-b border-accent/20 px-1 py-2.5 backdrop-blur-md sm:top-16"
                style={{ background: 'rgb(var(--space) / 0.85)' }}>
                <div className="flex items-center gap-2">
                  <div className="no-scrollbar flex flex-1 gap-1.5 overflow-x-auto whitespace-nowrap">
                    {TABS.map((tb) => (
                      <button key={tb.id} type="button" onClick={() => setTab(tb.id)}
                        className={`shrink-0 rounded-full border px-4 py-1.5 font-mono text-xs transition ${tab === tb.id ? 'border-accent/60 bg-accent/15 text-accent-light' : 'border-white/12 bg-white/5 text-muted hover:text-fg'}`}>
                        {tb.label}
                      </button>
                    ))}
                  </div>
                  {(tab === 'd1' || tab === 'vargas') && (
                    <div className="flex shrink-0 items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
                      {(['diamond', 'grid'] as ChartStyle[]).map((s) => (
                        <button key={s} type="button" onClick={() => setChartStyle(s)}
                          className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition ${chartStyle === s ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>
                          {s === 'diamond' ? (lang === 'mm' ? 'စိန်ပုံစံ' : 'Diamond') : (lang === 'mm' ? 'ဇယားကွက်ပုံစံ' : 'Grid')}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ── DETAILED READING (manual-approval workflow) ── */}
              {(tab === 'ai' || printAll) && (
                <div className="space-y-5">
                  {/* Auth gate — a reading can only be requested by a signed-in account */}
                  {!customerToken && (reqStatus === 'none' || reqStatus === 'rejected') && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/35 p-6 sm:p-8 no-print text-center"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))', boxShadow: '0 0 50px -20px rgb(var(--accent) / 0.5)' }}>
                      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
                      <div className="relative flex flex-col items-center gap-3">
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light"><Lock size={24} /></span>
                        <h3 className="font-groovy text-xl text-fg">{lang === 'mm' ? 'အကောင့် ဖွင့်ထားရန် လိုအပ်ပါသည်' : 'An account is required'}</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'mm'
                          ? 'ဟောစာတမ်းအပြည့်အစုံကို ရယူရန်နှင့် သင့်ဇာတာများ မှတ်သားထားရန် အကောင့် (Account) ဖွင့်ထားရန် လိုအပ်ပါသည်။'
                          : 'To get the full reading and to save your charts, you need to have an account.'}</p>
                        <button type="button" onClick={() => openAuth('signup')}
                          className="mt-1 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent via-violet-500 to-jade px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/30 transition hover:brightness-110">
                          <UserPlus size={16} /> {lang === 'mm' ? 'အကောင့်ဖွင့် / ဝင်ရန်' : 'Sign Up / Log In'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Request card — signed-in, no active/approved request */}
                  {customerToken && (reqStatus === 'none' || reqStatus === 'rejected') && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 no-print"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))', boxShadow: '0 0 50px -18px rgb(var(--accent) / 0.5)' }}>
                      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
                      <div className="relative">
                        <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><ScrollText size={15} /> {lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading'}</p>
                        <h3 className="mt-2 font-groovy text-xl text-fg">{lang === 'mm' ? 'သင့်ဇာတာအတွက် ဆရာ ကိုယ်တိုင် စစ်ဆေးသော ဟောစာတမ်း' : 'A reading personally reviewed by the Sayar'}</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{lang === 'mm'
                          ? 'သင့်ဇာတာအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များဖြင့် တိကျစွာ တွက်ချက်ပြီး၊ ဆရာ ကိုဘုန်းမင်းသိုက်ဒင် ကိုယ်တိုင် စိစစ်အတည်ပြု၍ ဘဝကဏ္ဍ ၇ ရပ် အပြည့်အစုံ ဟောစာတမ်း ရေးသားပေးပါမည်။'
                          : 'Your chart is computed precisely with classical Jyotish formulas, then personally verified and approved by Sayar Ko Bhone Min Thike Din before your full 7-life-area reading is written.'}</p>
                        <button type="button" onClick={requestReading} disabled={reqLoading}
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent via-violet-500 to-jade px-5 py-3 text-sm font-semibold text-space shadow-lg shadow-accent/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
                          {reqLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                          {reqLoading
                            ? (lang === 'mm' ? 'ပေးပို့နေသည်…' : 'Sending…')
                            : showDashboard
                              ? (lang === 'mm' ? '✨ ကျွန်ုပ်၏ ပရိုဖိုင်ဖြင့် ဟောစာတမ်း တောင်းဆိုရန်' : '✨ Request Reading based on my profile')
                              : (lang === 'mm' ? '✨ ဆရာ ကိုဘုန်းမင်းသိုက်ဒင်ထံမှ ဟောစာတမ်းအပြည့်အစုံ တောင်းဆိုရန်' : '✨ Request Full Reading from the Sayar')}
                        </button>
                        <p className="mt-2 font-mono text-[11px] text-muted">{lang === 'mm' ? 'တစ်လလျှင် တစ်ကြိမ် တောင်းဆိုနိုင်ပါသည်။' : 'One request per month.'}</p>
                      </div>
                    </div>
                  )}

                  {reqError && <div className="rounded-xl border border-coral/40 bg-coral/10 px-4 py-3 text-sm text-coral no-print">{reqError}</div>}
                  {reqInfo && <div className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent-light no-print">{reqInfo}</div>}

                  {/* Pending — awaiting the Sayar's approval */}
                  {reqStatus === 'pending' && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/30 p-6 sm:p-8 no-print"
                      style={{ background: 'linear-gradient(135deg, rgb(var(--card)), rgb(var(--surface)))', boxShadow: '0 0 50px -20px rgb(var(--accent) / 0.5)' }}>
                      <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full opacity-25 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--accent)) 0%, transparent 70%)' }} />
                      <div className="relative flex flex-col items-center gap-3 text-center">
                        <span className="grid h-14 w-14 place-items-center rounded-full border border-accent/40 bg-accent/15 text-accent-light">
                          <Clock size={26} className="animate-pulse" />
                        </span>
                        <h3 className="font-groovy text-xl text-fg">{lang === 'mm' ? 'ဆရာမှ စစ်ဆေးနေပါသည်' : 'Awaiting the Sayar’s review'}</h3>
                        <p className="max-w-xl text-sm leading-relaxed text-muted">{lang === 'mm'
                          ? 'ဆရာမှ သင့်ဇာတာအား အသေးစိတ် စစ်ဆေးနေပါသည်။ အတည်ပြုပြီးပါက ဟောစာတမ်းအပြည့်အစုံကို ဤနေရာတွင် ပြန်လည် ဝင်ရောက်ကြည့်ရှုနိုင်ပါသည်။ ခဏ စောင့်ဆိုင်းပေးပါ။'
                          : 'The Sayar is personally reviewing your chart. Once approved, your full reading will appear here — please check back shortly.'}</p>
                        <span className="mt-1 rounded-full bg-accent/15 px-3 py-1 font-mono text-[11px] text-accent-light">{lang === 'mm' ? 'အခြေအနေ — စစ်ဆေးဆဲ' : 'Status — Pending'}</span>
                      </div>
                    </div>
                  )}

                  {/* Approved — the finished reading (printable) */}
                  {reqStatus === 'approved' && reqMarkdown && (
                    <div className="relative overflow-hidden rounded-2xl border border-accent/35 p-6 sm:p-8"
                      style={{ background: 'linear-gradient(160deg, rgb(var(--card)) 0%, rgb(var(--surface)) 100%)', boxShadow: '0 0 60px -20px rgb(var(--accent) / 0.55), inset 0 1px 0 rgb(255 255 255 / 0.05)' }}>
                      <div className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, rgb(var(--jade)) 0%, transparent 70%)' }} />
                      <div className="relative">
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                          <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.28em] text-accent-light"><ScrollText size={14} /> {lang === 'mm' ? 'အသေးစိတ် ဟောစာတမ်း' : 'Detailed Reading'}</p>
                          <span className="inline-flex items-center gap-1 rounded-full bg-jade/15 px-2.5 py-0.5 font-mono text-[10px] text-jade no-print"><CheckCircle2 size={11} /> {lang === 'mm' ? 'ဆရာ အတည်ပြုပြီး' : 'Approved by the Sayar'}</span>
                        </div>
                        <MarkdownView markdown={reqMarkdown} />
                        <p className="mt-5 border-t border-white/10 pt-3 text-[11px] leading-relaxed text-muted">{lang === 'mm'
                          ? 'ဤဟောစာတမ်းအား ဂန္ထဝင် ဇျောတိသ သင်္ချာနည်းစနစ်များဖြင့် တိကျစွာ တွက်ချက်ပြီး ဆရာ ကိုယ်တိုင် စိစစ်အတည်ပြုထားပါသည်။ ရလဒ်များမှာ မိမိကိုယ်တိုင် ပြန်လည်ဆင်ခြင်သုံးသပ်ရန်အတွက် လမ်းညွှန်ချက်ဖြစ်ပါသည်။'
                          : 'This reading was computed with classical Jyotish formulas and personally verified by the Sayar. The interpretations are guidance for reflection.'}</p>

                        {/* Phase 4 — request the reading as a PDF by email */}
                        <div className="mt-5 no-print">
                          {!pdfRequested && (
                            <div className="mb-3 max-w-sm">
                              <label className="block font-mono text-[11px] uppercase tracking-wider text-muted">{lang === 'mm' ? 'PDF လက်ခံမည့် Email' : 'Email for the PDF'}</label>
                              <input type="email" inputMode="email" value={pdfEmail} onChange={(e) => setPdfEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50" />
                            </div>
                          )}
                          <button type="button" onClick={requestReadingPdf} disabled={pdfLoading || pdfRequested || !emailOk(pdfEmail)}
                            className="inline-flex items-center gap-2 rounded-xl border border-accent/40 bg-accent/10 px-4 py-2.5 text-sm font-semibold text-accent-light transition hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-60">
                            {pdfLoading ? <Loader2 size={15} className="animate-spin" /> : pdfRequested ? <CheckCircle2 size={15} className="text-jade" /> : <Mail size={15} />}
                            {pdfRequested
                              ? (lang === 'mm' ? 'PDF တောင်းဆိုမှု ပေးပို့ပြီးပါပြီ' : 'PDF request sent')
                              : (lang === 'mm' ? '✉️ PDF ဟောစာတမ်းကို Email ဖြင့် တောင်းဆိုရန်' : '✉️ Request the reading as a PDF by email')}
                          </button>
                          {!pdfRequested && pdfEmail.length > 0 && !emailOk(pdfEmail) && <p className="mt-2 text-[11px] text-coral">{lang === 'mm' ? 'မှန်ကန်သော Email လိပ်စာ ထည့်ပါ။' : 'Enter a valid email address.'}</p>}
                          {pdfRequested && <p className="mt-2 text-[11px] text-muted">{lang === 'mm' ? 'ဆရာမှ PDF ဟောစာတမ်းကို သင့် Email သို့ ပေးပို့ပေးပါလိမ့်မည်။' : 'The Sayar will email the PDF reading to you.'}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── READING ── */}
              {(tab === 'reading' || printAll) && (
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

                  {/* Per-area deep-dive — three across (natal + current transits) */}
                  <div className="space-y-3">
                    <h3 className="font-groovy text-lg text-fg">{t.lifeAreas}</h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
                                <span className="font-semibold">{lang === 'mm' ? 'လက်ရှိကာလ၏ သက်ရောက်မှုများ' : 'Current period'}: </span>{cur.text}
                              </div>
                            )}

                            <ul className="mt-3 space-y-1">
                              {a.points.map((pt, i) => <li key={i} className="text-xs leading-relaxed text-muted">• {pt}</li>)}
                            </ul>

                            {needsRemedy && (
                              <button type="button" onClick={() => openRemedy(a.label)}
                                className="no-print mt-3 inline-flex items-center gap-1.5 self-start rounded-full border border-coral/40 bg-coral/10 px-3 py-1.5 text-xs text-coral transition hover:bg-coral/20">
                                <Sparkles size={12} /> {lang === 'mm' ? 'ဤကဏ္ဍအတွက် ယတြာ တောင်းယူရန်' : 'Request a remedy for this area'}
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {data.yogas.length > 0 && (
                    <div className="glass-card p-5">
                      <h3 className="mb-3 font-groovy text-lg text-fg">{lang === 'mm' ? 'ဇာတာတွင် တွေ့ရတတ်သော ယောဂများ' : 'Yogas in your chart'}</h3>
                      <ul className="space-y-2.5">
                        {data.yogas.map((y) => (
                          <li key={y.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                            <div className="flex items-center gap-2"><span className="font-semibold text-accent-light">{y.name}</span>
                              <span className="font-mono text-[10px] text-muted">{y.planets.map((n) => planetName(n, lang)).join(' · ')}</span></div>
                            <p className="mt-1 text-xs leading-relaxed text-muted">{yogaText(y.name, lang) || y.description}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Educational: what the yogas mean (incl. Neecha Bhanga Raja Yoga) */}
                  <div className="glass-card p-5">
                    <h3 className="mb-1 font-groovy text-base text-fg">{lang === 'mm' ? 'ယောဂများ အကြောင်း အသေးစိတ်ဖတ်ရှုရန်' : 'About Yogas'}</h3>
                    <p className="mb-3 text-xs leading-relaxed text-muted">{lang === 'mm' ? 'ယောဂဆိုသည်မှာ ဂြိုဟ်များ၏ တည်နေရာ/ဆက်စပ်မှုကြောင့် ဖြစ်ပေါ်လာသော အထူးအကျိုးသက်ရောက်မှုများဖြစ်သည်။ အဓိကယောဂများကို အောက်တွင် ရှင်းပြပေးထားသည်။' : 'A yoga is a special result formed by particular planetary placements or links. The main yogas are explained below.'}</p>
                    <div className="space-y-1.5">
                      {Object.entries(YOGA_INFO).map(([name, info]) => (
                        <details key={name} className="group rounded-xl border border-white/10 bg-white/[0.02] px-4 py-2.5 transition hover:border-accent/30 open:border-accent/30 open:bg-accent/[0.04]">
                          <summary className="flex cursor-pointer list-none items-center justify-between text-sm text-fg/90">
                            <span className="font-semibold">{name}</span>
                            <span className="text-muted transition group-open:rotate-180">▾</span>
                          </summary>
                          <p className="mt-2 text-xs leading-relaxed text-muted">{lang === 'mm' ? info.mm : info.en}</p>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* Dasha periods — two across, full page width */}
                  <div className="grid gap-4 lg:grid-cols-2">
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
                </div>
              )}

              {/* ── TIMELINE (age → effects) ── */}
              {(tab === 'timeline' || printAll) && (
                <div className="space-y-5">
                  <div className="glass-card p-5">
                    <h3 className="mb-1 font-groovy text-lg text-fg">{t.timelineTitle}</h3>
                    <p className="text-sm leading-relaxed text-muted">{t.timelineDesc}</p>
                    <div className="mt-3 flex flex-wrap gap-2 font-mono text-[10px]">
                      <span className="rounded bg-jade/15 px-1.5 py-0.5 text-jade">{lang === 'mm' ? 'ကောင်း' : 'benefic'}</span>
                      <span className="rounded bg-coral/15 px-1.5 py-0.5 text-coral">{lang === 'mm' ? 'သတိ / သာဓေသတီ' : 'caution / Sade Sati'}</span>
                      <span className="text-muted">{lang === 'mm' ? '· ဂြိုဟ်သွားအိမ်ကို စန်းမှ ရေတွက်သော်' : '· transit house counted from the Moon'}</span>
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
              {(tab === 'ashtaka' || printAll) && <AshtakavargaView data={data} lang={lang} />}

              {/* ── SHADBALA ── */}
              {(tab === 'shadbala' || printAll) && <ShadbalaView data={data} lang={lang} />}

              {/* ── D1 ── */}
              {(tab === 'd1' || printAll) && (
                <div className="space-y-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="glass-card p-5"><ChartView style={chartStyle} data={data} /></div>
                    {moon && <div className="glass-card p-5"><ChartView style={chartStyle} data={data} lagnaSign={moon.sign} title="Chandra · D1" subtitle={`Moon: ${moon.signName}`} /></div>}
                  </div>
                  <div className="glass-card p-5"><p className="text-sm leading-relaxed text-muted">{t.d1Desc}</p></div>
                  <div className="glass-card my-2 overflow-x-auto rounded-lg border border-accent/20 p-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <table className="w-full min-w-[650px] border-collapse text-left text-sm">
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

              {(tab === 'vargas' || printAll) && (
                <div className="space-y-4">
                  <div className="no-print flex flex-wrap items-center gap-2">
                    <span className={labelCls}>{lang === 'mm' ? 'ဇာတာခွဲများကို ရွေးချယ်ရန်' : 'Divisional chart'}</span>
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
                    <h3 className="mb-3 font-groovy text-base text-fg">{lang === 'mm' ? 'ဇာတာခွဲများ၏ အဓိပ္ပာယ်များ (D1–D60)' : 'What each Divisional Chart means (D1–D60)'}</h3>
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

              {/* Remedy (yatra) — contact to Ko Bhone Min Thike Din */}
              <div ref={remedyRef} className="no-print glass-card border border-accent/25 p-6">
                <h3 className="font-groovy text-lg text-fg">{lang === 'mm' ? 'ယတြာ အစီအရင်နှင့် အသေးစိတ်မေးမြန်းရန် — ကိုဘုန်းမင်းသိုက်ဒင်ထံ ဆက်သွယ်ရန်' : 'Remedy (Yatra) & More Details — Contact to Ko Bhone Min Thike Din'}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  {lang === 'mm'
                    ? 'ကံညံ့/ဖိစီးနေသော ကဏ္ဍများအတွက် သင့်လျော်သည့် ယတြာ အစီအရင်နှင့် အကြံဉာဏ်အတွက် ကိုဘုန်းမင်းသိုက်ဒင် ထံ တောင်းခံနိုင်ပါသည်။ အောက်တွင် ဖြည့်စွက်ပါ။'
                    : 'For areas under strain, you may request a suitable remedy (yatra)& Idea from Ko Bhone Min Thike Din. Fill in your details below.'}
                </p>
                {remedyState === 'sent' ? (
                  <div className="mt-4 rounded-xl border border-jade/40 bg-jade/10 px-4 py-3 text-sm text-jade">
                    {lang === 'mm' ? 'ကျေးဇူးတင်ပါသည်။ သင့်တောင်းဆိုမှုကို ကိုဘုန်းမင်းသိုက်ဒင်ထံ ပေးပို့ပြီးပါပြီ — မကြာမီ ဆက်သွယ်ပါမည်။' : 'Thank you — your request has been sent to Ko Bhone Min Thike Din. You will be contacted soon.'}
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
                        {remedyState === 'sending' ? <><Loader2 size={15} className="animate-spin" /> {lang === 'mm' ? 'ပေးပို့နေသည်…' : 'Sending…'}</> : (lang === 'mm' ? 'ကိုဘုန်းမင်းသိုက်ဒင်ထံ ပေးပို့ရန်' : 'Send to Ko Bhone Min Thike Din')}
                      </button>
                      {remedyState === 'error' && <span className="text-xs text-coral">{lang === 'mm' ? 'ပေးပို့၍မရပါ — နောက်တစ်ကြိမ်ပြန်ကြိုးစားပါ။' : 'Could not send — please try again.'}</span>}
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom language toggle — mirrors the top one so users needn't scroll back up */}
      <div className="mt-12 flex justify-center no-print">
        <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/5 p-1">
          {(['en', 'mm'] as const).map((l) => (
            <button key={l} type="button" onClick={() => setLang(l)} className={`rounded-full px-4 py-1.5 font-mono text-xs transition ${lang === l ? 'bg-accent/70 text-space' : 'text-muted hover:text-fg'}`}>{l === 'en' ? 'EN' : 'မြန်မာ'}</button>
          ))}
        </div>
      </div>

      {/* ── Methodology (a genuine differentiator) + honest disclaimer ── */}
      <footer className="mt-8 border-t border-accent/15 pt-6 text-center">
        <p className="font-mono text-[11px] tracking-wide text-accent-light">
          Sidereal · Lahiri ayanamsa (1955) · Whole-Sign houses · Mean node · Swiss Ephemeris
        </p>
        <p className="mx-auto mt-2 max-w-2xl text-xs leading-relaxed text-muted">
          {lang === 'mm'
            ? 'အသိပေးချက် : ဇာတာများကို ဂန္ထဝင် ဇျောတိသကျမ်းများ၏ နည်းစနစ်များအတိုင်း တိကျစွာ တွက်ချက်ထားပါသည်။ သို့သော် ဗေဒင်ပညာသည် သိပ္ပံနည်းကျ အတည်ပြုထားခြင်း မရှိသဖြင့် — ဆေးဘက်ဆိုင်ရာ၊ ဥပဒေရေးရာ (သို့မဟုတ်) ငွေကြေးဆိုင်ရာ ကိစ္စရပ်များတွင် မျက်စိမှိတ်ယုံကြည်၍ တထစ်ချ ဆုံးဖြတ်ချက် မချသင့်ပါ။ အရေးကြီးသော ကိစ္စရပ်များအတွက် သက်ဆိုင်ရာ ကျွမ်းကျင်ပညာရှင်များနှင့်သာ ဆွေးနွေးတိုင်ပင်ပါ။ ဤတွက်ချက်မှု ရလဒ်များသည် မိမိကိုယ်ကို ပြန်လည်သုံးသပ်ရန်၊ ယဉ်ကျေးမှုအမွေအနှစ်အား လေ့လာရန်နှင့် ပုဂ္ဂိုလ်ရေးစိတ်ဝင်စားမှုအတွက်သာ ရည်ရွယ်တင်ဆက်ခြင်း ဖြစ်ပါသည်။'
            : 'Disclaimer: These astrological charts are precisely calculated according to the traditional principles of classical Jyotish. However, astrology is not a scientifically validated discipline. Therefore, these readings should not be used as a substitute for professional medical, legal, or financial advice. Please consult relevant qualified professionals for major life decisions. The results presented here are strictly for self-reflection, cultural appreciation, and personal interest.'}
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link to="/algorithms" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
            <Star size={12} /> {lang === 'mm' ? 'algorithm များ (CS) →' : 'The algorithms (CS) →'}
          </Link>
          <Link to="/research" className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 font-mono text-[11px] text-accent-light transition hover:bg-accent/20">
            <Star size={12} /> {lang === 'mm' ? 'တိုင်းတာနိုင်သော သုတေသနဆိုင်ရာ လုပ်ထုံးလုပ်နည်းများ →' : 'Falsifiable research protocol →'}
          </Link>
        </div>
      </footer>

      {/* Email-confirm success toast (Task 3) */}
      {verifyToast && (
        <div className="no-print fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 px-4">
          <div className="flex items-center gap-2 rounded-full border border-jade/40 bg-jade/15 px-5 py-2.5 text-sm text-fg shadow-2xl backdrop-blur-md">
            <CheckCircle2 size={16} className="text-jade" /> {verifyToast}
          </div>
        </div>
      )}
    </section>
  )
}
