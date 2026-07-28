// ============================================================================
//  jyotish.ts — content, i18n (EN / မြန်မာ) and helpers for the Jyotish portal.
//  The heavy astronomy lives in the .NET backend; this file holds the varga
//  helper (mirror of the backend rule) plus the professional reading text.
// ============================================================================
import type { BirthChartData } from '../types/astrology'

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
    readingNote: 'A preliminary reading generated from your current Mahadasha. A fuller rule-based reading (7th-lord, dignities, yogas) is on the way.',
    planetsIn: 'Planets in this chart',
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
    readingNote: 'သင့်လက်ရှိ မဟာဒသာအပေါ် အခြေခံ၍ ကနဦး ဟောကိန်းဖြစ်ပါသည်။ ပိုမိုပြည့်စုံသော rule-based ဟောစာတမ်း (၇တန့်သခင်၊ ဥစ်/နိစ်၊ ယောဂ) မကြာမီ ထည့်သွင်းပါမည်။',
    planetsIn: 'ဤဇာတာတွင် ဂြိုဟ်များ',
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

export interface AreaReading { key: string; label: string; text: string; tone: 'favorable' | 'mixed' | 'testing' }

/** A simple, honest reading from the CURRENT mahadasha lord + the area's significators. */
export function readingFor(data: BirthChartData, lang: Lang): { lord: string; areas: AreaReading[] } {
  const now = Date.now()
  const active = data.dashas.find((d) => new Date(d.startUtc).getTime() <= now && now < new Date(d.endUtc).getTime())
  const lord = active?.lord ?? data.dashas[0]?.lord ?? 'Sun'
  const nat = LORD_NATURE[lord] ?? LORD_NATURE.Sun

  const areas: AreaReading[] = AREAS.map((a) => {
    const favored = a.favLords.includes(lord)
    const tone: AreaReading['tone'] = favored ? 'favorable' : nat.benefic ? 'mixed' : 'testing'
    if (lang === 'mm') {
      const toneMm = tone === 'favorable' ? 'အထူးအားသာပြီး တိုးတက်မှုများ ဖြစ်ထွန်း' : tone === 'mixed' ? 'အတက်အကျ ရှိသော်လည်း ဟန်ချက်ညီစွာ ဆောင်ရွက်နိုင်' : 'စိန်ခေါ်မှုများနှင့် သည်းခံကြိုးစားရန် လိုအပ်'
      return { key: a.key, label: a.mm, tone, text: `${planetName(lord, 'mm')} ဒသာကာလတွင် ${nat.mm} တို့ ရှေ့တန်းရောက်လာသည်။ ${a.mm} ကဏ္ဍအတွက် ဤကာလသည် ${toneMm}တတ်ပါသည်။` }
    }
    const toneEn = tone === 'favorable' ? 'especially supportive and growth-bringing' : tone === 'mixed' ? 'mixed but workable with balance' : 'testing — calling for patience and effort'
    return { key: a.key, label: a.en, tone, text: `During the ${lord} dasha, ${nat.en} come to the fore. For ${a.en.toLowerCase()}, this period tends to be ${toneEn}.` }
  })
  return { lord, areas }
}
