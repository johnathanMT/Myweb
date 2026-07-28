// ============================================================================
//  jyotish.ts — content, i18n (EN / မြန်မာ) and helpers for the Jyotish portal.
//  The heavy astronomy lives in the .NET backend; this file holds the varga
//  helper (mirror of the backend rule) plus the professional reading text.
// ============================================================================
import type { BirthChartData, DashaPeriod, Finding } from '../types/astrology'

export type Lang = 'en' | 'mm'

// ── Divisional-chart sign (mirror of AstrologyService.VargaSign) ──────────────
// Lets the frontend compute the Ascendant's varga sign for any Dn chart.
export function vargaSign(lon: number, varga: number): number {
  const rasi = Math.floor(lon / 30)
  const deg = lon - rasi * 30
  const odd = rasi % 2 === 0
  switch (varga) {
    case 2: { const first = deg < 15; return odd ? (first ? 4 : 3) : (first ? 3 : 4) }
    case 3: return (rasi + Math.floor(deg / 10) * 4) % 12
    case 7: return ((odd ? rasi : (rasi + 6) % 12) + Math.floor(deg / (30 / 7))) % 12
    case 9: return Math.floor(lon / (30 / 9)) % 12
    case 10: return ((odd ? rasi : (rasi + 8) % 12) + Math.floor(deg / 3)) % 12
    case 12: return (rasi + Math.floor(deg / 2.5)) % 12
    default: return rasi
  }
}

// ── Names ─────────────────────────────────────────────────────────────────────
export const SIGN_MM = ['မိဿ', 'ပြိဿ', 'မေထုန်', 'ကရကဋ်', 'သိဟ်', 'ကန်', 'တူ', 'ဗြိစ္ဆာ', 'ဓနု', 'မကာရ', 'ကုမ်', 'မိန်']
export const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
export const signLabel = (i: number, lang: Lang) => (lang === 'mm' ? SIGN_MM[i] : SIGN_EN[i])
export const PLANET_MM: Record<string, string> = {
  Sun: 'နေ (တနင်္ဂနွေ)', Moon: 'စန်း (တနင်္လာ)', Mars: 'အင်္ဂါ', Mercury: 'ဗုဒ္ဓဟူး',
  Jupiter: 'ကြာသပတေး', Venus: 'သောကြာ', Saturn: 'စနေ', Rahu: 'ရာဟု', Ketu: 'ကိတ်',
}
export const signName = (i: number, lang: Lang, en: string) => (lang === 'mm' ? SIGN_MM[i] : en)
export const planetName = (n: string, lang: Lang) => (lang === 'mm' ? (PLANET_MM[n] ?? n) : n)

// ── UI dictionary (EN / MM) ───────────────────────────────────────────────────
export const JT: Record<Lang, Record<string, string>> = {
  en: {
    sayar: 'Sayar Bhone Min Thike Din',
    sayarRole: 'Professional Vedic Astrologer',
    sayarTagline: 'Readings grounded in Chandra Lagna (Moon Ascendant), sidereal Jyotish & the Vimshottari dasha.',
    portalTitle: 'Vedic Astrology Reading Portal',
    chandraTitle: 'Why the Chandra Lagna (Moon Ascendant)?',
    chandra:
      'In Vedic astrology the Moon (Chandra) reflects the mind, emotions and lived, day-to-day experience. Reading the chart from the Moon’s sign as the 1st house (the Chandra Lagna) — alongside the birth Lagna — gives the most accurate, practical picture of a person’s inner life and timing of events. This portal weighs both.',
    instrTitle: 'For an accurate reading, please note',
    instr1: 'Birth time must be exact — even a few minutes changes the Lagna. Confirm AM / PM carefully.',
    instr2: 'Use the true date of birth (as recorded), and the exact town/city of birth for the correct coordinates & timezone.',
    instr3: 'If the time is uncertain, the Moon-based (Chandra) reading is more reliable than the Lagna-based one.',
    tabReading: 'Reading', tabD1: 'D1 · Rasi', tabD9: 'D9 · Navamsa', tabD10: 'D10 · Dasamsa', tabD7: 'D7 · Saptamsa',
    currentDasha: 'Current Mahadasha', lifeAreas: 'Life Areas',
    d1Desc: 'The Rasi (D1) is the foundation chart — overall destiny, personality, health and the broad shape of life. All other charts refine what D1 shows.',
    d9Desc: 'The Navamsa (D9) governs marriage, the spouse, dharma and the second half of life. A planet strong in D9 gives lasting results; the D9 is the "fruit" of the D1 promise.',
    d10Desc: 'The Dasamsa (D10) is the chart of career, profession, status and worldly achievement — how one acts in society and rises.',
    d7Desc: 'The Saptamsa (D7) concerns children, progeny and lineage — creativity and what one passes on.',
    disclaimer: 'Traditional Jyotish knowledge, offered for interest, reflection and study. Sidereal · Lahiri ayanamsa · Whole-Sign houses.',
    readingNote: 'A rule-based reading drawn from the house lords, their dignity & placement, planetary aspects (drishti) and your running Mahadasha / Antardasha.',
    planetsIn: 'Planets in this chart',
    fldName: 'Name', fldGender: 'Gender', male: 'Male', female: 'Female',
    naynanLabel: 'Birth day-number (Nay Nan)', querentFor: 'Reading for', currentBhukti: 'Current Antardasha (bhukti)',
  },
  mm: {
    sayar: 'ဆရာ ဘုန်းမင်းသိုက်ဒင်',
    sayarRole: 'ပရော်ဖက်ရှင်နယ် ဗေဒင်ပညာရှင်',
    sayarTagline: 'စန်းလဂ် (Moon Ascendant)၊ နက္ခတ်ဗေဒင်နှင့် ဝိမ်ရှောတ္တရီ ဒသာစနစ်ကို အခြေခံ၍ ဟောကြားပေးသည်။',
    portalTitle: 'ဗေဒင် ဟောစာတမ်း Portal',
    chandraTitle: 'စန်းလဂ် (Chandra Lagna) ဘာကြောင့် အရေးကြီးသလဲ?',
    chandra:
      'ဗေဒင်ပညာတွင် စန်း (လ) သည် စိတ်နှလုံး၊ ခံစားချက်နှင့် နေ့စဉ်လက်တွေ့ဘဝ အတွေ့အကြုံကို ကိုယ်စားပြုသည်။ စန်းရောက်ရာ ရာသီကို ၁-အိမ် (စန်းလဂ်) အဖြစ်ထား၍ မွေးလဂ်နှင့်တွဲ ဟောကြားခြင်းက လူတစ်ဦး၏ စိတ်ပိုင်းဆိုင်ရာနှင့် ဖြစ်ရပ်များ၏ အချိန်ကိုက်မှုကို အတိကျဆုံး၊ လက်တွေ့ကျဆုံး ဖော်ပြနိုင်သည်။ ဤ Portal သည် နှစ်ခုစလုံးကို ချိန်ဆပေးပါသည်။',
    instrTitle: 'တိကျသော ဟောကိန်းရရှိရန် သတိပြုရန်',
    instr1: 'မွေးဖွားချိန် တိကျရပါမည် — မိနစ်အနည်းငယ်ကွာသည်ပင် လဂ်ပြောင်းသွားနိုင်သည်။ မနက် (AM) / ည (PM) ကို သေချာစစ်ပါ။',
    instr2: 'မှတ်တမ်းအရ မှန်ကန်သော မွေးသက္ကရာဇ်နှင့်၊ မှန်ကန်သော ကိုဩဒိနိတ်/အချိန်ဇုန်ရရှိရန် မွေးဖွားရာ မြို့/ဇာတိကို အတိအကျ ထည့်ပါ။',
    instr3: 'အချိန် မသေချာပါက လဂ်ဟောကိန်းထက် စန်း (Chandra) အခြေခံ ဟောကိန်းက ပို၍ ယုံကြည်စိတ်ချရသည်။',
    tabReading: 'ဟောစာတမ်း', tabD1: 'D1 · ရာသီ', tabD9: 'D9 · နဝင်း', tabD10: 'D10 · ဒသံသ', tabD7: 'D7 · သတ္တံသ',
    currentDasha: 'လက်ရှိ မဟာဒသာ', lifeAreas: 'ဘဝကဏ္ဍများ',
    d1Desc: 'ရာသီ (D1) သည် အခြေခံဇာတာဖြစ်၍ — အထွေထွေကံကြမ္မာ၊ မူလစရိုက်၊ ကျန်းမာရေးနှင့် ဘဝ၏ ပုံသဏ္ဌာန်ကို ဖော်ပြသည်။ အခြားဇာတာခွင်များက D1 ကို ပိုမိုတိကျစွာ ဖြည့်စွက်ပေးသည်။',
    d9Desc: 'နဝင်း (D9) သည် အိမ်ထောင်ရေး၊ ဖူးစာဖက်၊ ဓမ္မနှင့် ဘဝ၏ ဒုတိယပိုင်းကို စိုးမိုးသည်။ D9 တွင် အားကောင်းသော ဂြိုဟ်သည် တည်တံ့သောအကျိုးပေးသည် — D9 သည် D1 ကတိ၏ "အသီးအပွင့်" ဖြစ်သည်။',
    d10Desc: 'ဒသံသ (D10) သည် အသက်မွေးဝမ်းကျောင်း၊ အလုပ်အကိုင်၊ ဂုဏ်အဆင့်နှင့် လောကီအောင်မြင်မှု ဇာတာဖြစ်သည် — လူ့အဖွဲ့အစည်းတွင် မည်သို့ ရပ်တည်တက်လမ်းရသည်ကို ပြသည်။',
    d7Desc: 'သတ္တံသ (D7) သည် သားသမီး၊ သားစဉ်မြေးဆက်နှင့် အမွေဆက်ခံမှုကို သက်ဆိုင်သည် — ဖန်တီးမှုနှင့် လက်ဆက်ကမ်းပေးသမျှ။',
    disclaimer: 'ရိုးရာ ဗေဒင်ဗဟုသုတကို စိတ်ဝင်စားမှု၊ ဆင်ခြင်သုံးသပ်မှုနှင့် လေ့လာမှုအတွက် တင်ဆက်ပါသည်။ နက္ခတ် · Lahiri ayanamsa · Whole-Sign houses.',
    readingNote: 'အိမ်ရှင်သခင်တို့၏ ဥစ်/နိစ်၊ ကျရောက်ရာအိမ်၊ ဒြိဋ္ဌိအမြင်နှင့် လက်ရှိ မဟာဒသာ/အန္တရ်ဒသာတို့ကို ပေါင်းစပ်တွက်ချက်ထားသော rule-based ဟောကိန်းဖြစ်ပါသည်။',
    planetsIn: 'ဤဇာတာတွင် ဂြိုဟ်များ',
    fldName: 'အမည်', fldGender: 'ကျား/မ', male: 'ယောကျ်ား', female: 'မိန်းမ',
    naynanLabel: 'နေ့နံ', querentFor: 'ဟောကိန်းအတွက်', currentBhukti: 'လက်ရှိ အန္တရ်ဒသာ (ဘုတ္တိ)',
  },
}

// ── Basic reading generator (frontend, until the backend engine lands) ────────
const LORD_NATURE: Record<string, { en: string; mm: string; benefic: boolean }> = {
  Sun: { en: 'authority, vitality, recognition and the father', mm: 'ဩဇာအာဏာ၊ သန်စွမ်းမှု၊ ဂုဏ်သိက္ခာနှင့် ဖခင်', benefic: false },
  Moon: { en: 'the mind, emotions, comfort and the mother', mm: 'စိတ်နှလုံး၊ ခံစားချက်၊ သက်တောင့်သက်သာနှင့် မိခင်', benefic: true },
  Mars: { en: 'courage, energy, property and initiative', mm: 'ရဲစွမ်းသတ္တိ၊ စွမ်းအင်၊ အိမ်ခြံမြေနှင့် စွန့်စားလုပ်ဆောင်မှု', benefic: false },
  Mercury: { en: 'intellect, communication, trade and learning', mm: 'ဉာဏ်ရည်၊ ဆက်သွယ်ပြောဆိုမှု၊ ကူးသန်းရောင်းဝယ်ရေးနှင့် အသိပညာ', benefic: true },
  Jupiter: { en: 'wisdom, growth, wealth, teachers and dharma', mm: 'ပညာဉာဏ်၊ ကြီးပွားတိုးတက်မှု၊ ဥစ္စာဓန၊ ဆရာသမားနှင့် ဓမ္မ', benefic: true },
  Venus: { en: 'love, relationships, comfort, art and beauty', mm: 'အချစ်၊ ဆက်ဆံရေး၊ သက်သာချမ်းသာမှု၊ အနုပညာနှင့် အလှ', benefic: true },
  Saturn: { en: 'discipline, hard work, patience, delay and endurance', mm: 'စည်းကမ်း၊ ကြိုးစားအားထုတ်မှု၊ သည်းခံမှု၊ နှောင့်နှေးမှုနှင့် ခံနိုင်ရည်', benefic: false },
  Rahu: { en: 'ambition, the unconventional, sudden change and foreign matters', mm: 'ရည်မှန်းချက်ကြီးမား၊ ထုံးစံမကျမှု၊ ရုတ်တရက်ပြောင်းလဲမှုနှင့် နိုင်ငံခြားကိစ္စ', benefic: false },
  Ketu: { en: 'detachment, spirituality, research and letting go', mm: 'စွန့်လွှတ်မှု၊ ဝိညာဉ်ရေးရာ၊ သုတေသနနှင့် စွဲလမ်းမှုလျှော့ချမှု', benefic: false },
}

export interface AreaDef { key: string; en: string; mm: string; favLords: string[] }
export const AREAS: AreaDef[] = [
  { key: 'love', en: 'Love & Marriage', mm: 'အချစ်ရေး နှင့် အိမ်ထောင်ရေး', favLords: ['Venus', 'Moon', 'Jupiter'] },
  { key: 'career', en: 'Career & Business', mm: 'အလုပ်အကိုင် နှင့် စီးပွားရေး', favLords: ['Sun', 'Saturn', 'Mercury', 'Mars'] },
  { key: 'education', en: 'Education & Knowledge', mm: 'ပညာရေး နှင့် အသိပညာ', favLords: ['Mercury', 'Jupiter'] },
  { key: 'social', en: 'Social & Relationships', mm: 'လူမှုရေး နှင့် ဆက်ဆံရေး', favLords: ['Venus', 'Mercury', 'Moon'] },
  { key: 'health', en: 'Health & Wellbeing', mm: 'ကျန်းမာရေး', favLords: ['Sun', 'Moon', 'Jupiter'] },
  { key: 'wealth', en: 'Wealth & Finances', mm: 'ဥစ္စာဓန နှင့် ငွေကြေး', favLords: ['Jupiter', 'Venus', 'Mercury'] },
]

export interface AreaReading { key: string; label: string; tone: string; score: number; points: string[] }

const AREA_LABEL: Record<string, { en: string; mm: string }> = {
  love: { en: 'Love & Marriage', mm: 'အချစ်ရေး နှင့် အိမ်ထောင်ရေး' },
  career: { en: 'Career & Business', mm: 'အလုပ်အကိုင် နှင့် စီးပွားရေး' },
  education: { en: 'Education & Knowledge', mm: 'ပညာရေး နှင့် အသိပညာ' },
  social: { en: 'Social & Relationships', mm: 'လူမှုရေး နှင့် ဆက်ဆံရေး' },
  health: { en: 'Health & Wellbeing', mm: 'ကျန်းမာရေး' },
  wealth: { en: 'Wealth & Finances', mm: 'ဥစ္စာဓန နှင့် ငွေကြေး' },
}
const DIGNITY_LABEL: Record<string, { en: string; mm: string }> = {
  Exalted: { en: 'exalted (uccha)', mm: 'ဥစ် (မြင့်မြတ်)' },
  Debilitated: { en: 'debilitated (neecha)', mm: 'နိစ် (ကျဆင်း)' },
  Own: { en: 'in its own sign', mm: 'ကိုယ်ပိုင်ရာသီ' },
  Neutral: { en: 'in a neutral sign', mm: 'သာမန်ရာသီ' },
}
const ordEn = (h: number) => { const s = ['th', 'st', 'nd', 'rd'], v = h % 100; return `${h}${s[(v - 20) % 10] ?? s[v] ?? s[0]}` }
const houseLabel = (h: number, lang: Lang) => (lang === 'mm' ? `${h} တန့်` : `${ordEn(h)} house`)

const natureOf = (planet: string, lang: Lang): string => {
  const n = LORD_NATURE[planet]
  return n ? (lang === 'mm' ? n.mm : n.en) : ''
}

function renderFinding(f: Finding, lang: Lang): string {
  const P = planetName(f.planet, lang)
  const dg = DIGNITY_LABEL[f.value] ?? DIGNITY_LABEL.Neutral
  const nat = natureOf(f.planet, lang)
  switch (f.code) {
    case 'lordDignity': {
      if (f.value === 'Exalted' || f.value === 'Own')
        return lang === 'mm'
          ? `${f.house} တန့်သခင် ${P} သည် ${dg.mm}၌ တည်ရှိသဖြင့် ဤကဏ္ဍ၏ အခြေခံသည် ခိုင်မာအားကောင်းသည်။ ${nat} ဆိုင်ရာ ကိစ္စများ အဆင်ပြေတတ်သည်။`
          : `The ${ordEn(f.house)}-house lord ${P} is ${dg.en} — a strong, well-supported foundation, so matters of ${nat} tend to flow with grace.`
      if (f.value === 'Debilitated')
        return lang === 'mm'
          ? `${f.house} တန့်သခင် ${P} သည် ${dg.mm} ဖြစ်နေသဖြင့် ဤကဏ္ဍတွင် ကြိုးစားအားထုတ်မှု ပိုမိုလိုအပ်ပြီး အချိန်ယူ ရင့်ကျက်လာတတ်သည်။`
          : `The ${ordEn(f.house)}-house lord ${P} is ${dg.en}, so this area asks for extra effort and ripens more slowly before it rewards you.`
      return lang === 'mm'
        ? `${f.house} တန့်သခင် ${P} သည် ${dg.mm} ဖြစ်သည်။`
        : `The ${ordEn(f.house)}-house lord ${P} is ${dg.en}.`
    }
    case 'lordPlacement': {
      if (f.value === 'strong')
        return lang === 'mm'
          ? `ထိုသခင် ${P} သည် ${houseLabel(f.house, 'mm')} (ကေန္ဒြ/တြိကုဏ) ကောင်းသောနေရာတွင် ကျရောက်နေသဖြင့် အကျိုးပေးအား ပိုမိုခိုင်မာသည်။`
          : `That lord ${P} occupies the ${houseLabel(f.house, 'en')} — a strong kendra/trikona — reinforcing the promise of this area.`
      if (f.value === 'dusthana')
        return lang === 'mm'
          ? `ထိုသခင် ${P} သည် ${houseLabel(f.house, 'mm')} (ဒုဿဌာန ၆/၈/၁၂) တွင် ကျရောက်နေသဖြင့် အကျိုးမပေးမီ အခက်အခဲ အနည်းငယ် ဖြတ်သန်းရတတ်သည်။`
          : `That lord ${P} falls in the ${houseLabel(f.house, 'en')} — a dusthana (6/8/12) — so expect some hurdles before results settle.`
      return lang === 'mm'
        ? `ထိုသခင် ${P} သည် ${houseLabel(f.house, 'mm')} တွင် တည်ရှိသည်။`
        : `That lord ${P} is placed in the ${houseLabel(f.house, 'en')}.`
    }
    case 'karakaDignity': {
      const good = f.value !== 'Debilitated'
      return lang === 'mm'
        ? `ကဏ္ဍအိမ်ရှင် (ကာရက) ${P} သည် ${dg.mm} ဖြစ်ခြင်းက ${nat} တို့ကို ${good ? 'အားဖြည့်' : 'စိန်ခေါ်'}ပေးသည်။`
        : `The significator (karaka) ${P} is ${dg.en}, which ${good ? 'strengthens' : 'challenges'} matters of ${nat}.`
    }
    case 'occupant': {
      const ben = f.value === 'benefic'
      const kind = ben ? (lang === 'mm' ? 'မင်္ဂလာဂြိုဟ်' : 'a benefic') : (lang === 'mm' ? 'ပါပဂြိုဟ်' : 'a malefic')
      return lang === 'mm'
        ? `${P} (${kind}) သည် ${houseLabel(f.house, 'mm')}တွင် ကိန်းဝပ်လျက် ${ben ? 'ကောင်းမြတ်သောအရှိန်' : 'စမ်းသပ်မှုအရှိန်'} ပေးသည်။`
        : `${P} (${kind}) sits in the ${houseLabel(f.house, 'en')}, ${ben ? 'lending it grace' : 'putting it to the test'}.`
    }
    case 'aspectOnHouse': {
      const ben = f.value === 'benefic'
      const kind = ben ? (lang === 'mm' ? 'မင်္ဂလာ' : 'benefic') : (lang === 'mm' ? 'ပါပ' : 'malefic')
      return lang === 'mm'
        ? `${P} ၏ ${kind} အမြင် (ဒြိဋ္ဌိ) သည် ဤကဏ္ဍအိမ်ကို ${ben ? 'ထောက်ကူ' : 'ဖိစီး'}ပေးနေသည်။`
        : `${P} casts a ${kind} aspect (drishti) on this house, ${ben ? 'protecting it' : 'pressuring it'}.`
    }
    case 'dashaActive':
      return lang === 'mm'
        ? `လက်ရှိ ${P} မဟာဒသာသည် ဤကဏ္ဍကို တိုက်ရိုက် လှုံ့ဆော်နေသဖြင့် ${nat} ကိစ္စများ ပေါ်ထွန်းရန် အချိန်ကောင်းဖြစ်သည်။`
        : `The running ${P} mahadasha activates this area directly — a live window for matters of ${nat}.`
    case 'bhuktiActive':
      return lang === 'mm'
        ? `လက်ရှိ ${P} အန္တရ်ဒသာ (ဘုတ္တိ) ကလည်း ဤကဏ္ဍကို ထပ်ဆင့် ပံ့ပိုးထောက်ကူ ပေးနေသည်။`
        : `The current ${P} antardasha (bhukti) lends this area a further push right now.`
    default:
      return ''
  }
}

/** Reading from the backend prediction engine (findings → EN/MM), with a basic
 *  dasha-lord fallback if the backend didn't send predictions. */
export function readingFor(data: BirthChartData, lang: Lang): { lord: string; areas: AreaReading[] } {
  const now = Date.now()
  const active = data.dashas.find((d) => new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime())
  const lord = active?.lord ?? data.dashas[0]?.lord ?? 'Sun'

  if (data.predictions && data.predictions.length) {
    const areas = data.predictions.map((pr): AreaReading => ({
      key: pr.area,
      label: (AREA_LABEL[pr.area] ?? { en: pr.area, mm: pr.area })[lang],
      tone: pr.tone,
      score: pr.score,
      points: pr.findings.map((f) => renderFinding(f, lang)).filter(Boolean),
    }))
    return { lord, areas }
  }

  // Fallback — one sentence per area from the dasha lord's nature.
  const nat = LORD_NATURE[lord] ?? LORD_NATURE.Sun
  const areas = AREAS.map((a): AreaReading => {
    const favored = a.favLords.includes(lord)
    const tone = favored ? 'favorable' : nat.benefic ? 'mixed' : 'testing'
    const text = lang === 'mm'
      ? `${planetName(lord, 'mm')} ဒသာကာလတွင် ${nat.mm} တို့ ရှေ့တန်းရောက်လာသည်။`
      : `During the ${lord} dasha, ${nat.en} come to the fore.`
    return { key: a.key, label: lang === 'mm' ? a.mm : a.en, tone, score: favored ? 65 : nat.benefic ? 50 : 40, points: [text] }
  })
  return { lord, areas }
}

// ── Burmese birth day-number (နေ့နံ) ──────────────────────────────────────────
export interface Naynan { num: number; mmDay: string; enDay: string; planet: string; planetMm: string }

const WEEKDAY: Naynan[] = [
  { num: 1, mmDay: 'တနင်္ဂနွေ', enDay: 'Sunday',    planet: 'Sun',     planetMm: 'နေ' },
  { num: 2, mmDay: 'တနင်္လာ',   enDay: 'Monday',    planet: 'Moon',    planetMm: 'စန်း' },
  { num: 3, mmDay: 'အင်္ဂါ',    enDay: 'Tuesday',   planet: 'Mars',    planetMm: 'အင်္ဂါ' },
  { num: 4, mmDay: 'ဗုဒ္ဓဟူး',  enDay: 'Wednesday', planet: 'Mercury', planetMm: 'ဗုဒ္ဓဟူး' },
  { num: 5, mmDay: 'ကြာသပတေး', enDay: 'Thursday',  planet: 'Jupiter', planetMm: 'ကြာသပတေး' },
  { num: 6, mmDay: 'သောကြာ',   enDay: 'Friday',    planet: 'Venus',   planetMm: 'သောကြာ' },
  { num: 7, mmDay: 'စနေ',      enDay: 'Saturday',  planet: 'Saturn',  planetMm: 'စနေ' },
]
// Wednesday afternoon (from 12:00 noon) counts as Rahu — နေ့နံ ၈.
const RAHU_DAY: Naynan = { num: 8, mmDay: 'ဗုဒ္ဓဟူး (မွန်းလွဲ)', enDay: 'Wednesday (afternoon)', planet: 'Rahu', planetMm: 'ရာဟု' }

/** Burmese birth-weekday (နေ့နံ) from a local date (yyyy-mm-dd) + time (HH:mm).
 *  Wednesday after noon = Rahu (နံ ၈). */
export function naynan(dateStr: string, timeStr: string): Naynan | null {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return null
  const dow = new Date(y, m - 1, d).getDay() // 0 = Sun … 6 = Sat
  const hour = Number((timeStr || '00:00').split(':')[0]) || 0
  if (dow === 3 && hour >= 12) return { ...RAHU_DAY }
  return { ...WEEKDAY[dow] }
}

export const MM_DIGITS = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉']
export const toMmDigits = (n: number) => String(n).replace(/\d/g, (c) => MM_DIGITS[+c])

/** The currently-running Antardasha (bhukti) within the active mahadasha, if any. */
export function activeBhukti(data: BirthChartData): DashaPeriod | undefined {
  const now = Date.now()
  return data.antardashas?.find((d) => new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime())
}
