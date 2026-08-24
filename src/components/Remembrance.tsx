import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import RemembranceScene from './RemembranceScene'

type Lang = 'mm' | 'en'
type Bi = { mm: string; en: string }

/** Shared shape for a tribute card's bilingual content. */
interface TributeData {
  image: string
  imageAlt: string
  eyebrow: Bi
  title: Bi
  tags: { mm: string[]; en: string[] }
  storyLabel: Bi
  legacyLabel: Bi
  story: { mm: string[]; en: string[] }
  legacy: { quote: Bi; signature: Bi }
}

/**
 * MEMORIAL_DATA — the letter-style tribute opened by the grave, memorial stone,
 * and aircraft. `story` is an array of paragraphs; `legacy` splits into a quote
 * + a signature. Images are served from /public via BASE_URL (base = "/Myweb/").
 */
const MEMORIAL_DATA: TributeData = {
  image: `${import.meta.env.BASE_URL}u_hlaing_bwa.jpg`,
  imageAlt: 'Aba U Hlaing Bwa',
  eyebrow: { mm: 'ချစ်ခင်လေးစားစွာ အောက်မေ့လျက်', en: 'In Loving Memory' },
  title: {
    mm: 'အဘ ဦးလှိုင်ဘွား (1945 - 2026)',
    en: 'Aba U Hlaing Bwa (1945 - 2026)',
  },
  tags: {
    mm: ['ဆရာသမား', 'အဘ', 'လေယာဥ်အင်ဂျင်နီယာ'],
    en: ['Mentor', 'Grandfather Figure', 'Aircraft Engineer'],
  },
  storyLabel: { mm: 'အမှတ်တရ', en: 'The Story' },
  legacyLabel: { mm: 'နှုတ်ဆက်စကား', en: 'Legacy' },
  story: {
    mm: [
      'သားတို့ ပြန်တွေ့နိုင်အုံးမယ် ထင်ခဲ့ပေမယ့် မတွေ့နိုင်တော့ဘူး အဘရယ်၊ တောင်ဥက္ကမှာ မွေးတဲ့အချိန်ထဲကနေ အခုအချိန်ထိ ကူညီစောင့်ရှောက်ပေးခဲ့တဲ့ အတွက် အထူးကျေးဇူးတင်ပါတယ်။',
      'မကြာမကြာ ဆုံးမစကားတွေပြော၊ စာတွေပို့ပို့ပြီး ဆုံးမပေးခဲ့တာတွေကိုလဲ နားထောင်ပါ့မယ်။ နောက်ဆုံးခရီးကို လိုက်မပို့နိုင်ခဲ့တာ ခွင့်လွှတ်ပါ ။ အထူးဝမ်းနည်းကြေကွဲရပါတယ်။',
    ],
    en: [
      "I thought we would meet again, but we can't anymore, Grandpa. Thank you so much for helping and looking after me from the time I was born in South Okkalapa until now.",
      'I will always remember your guidance and the messages you sent to teach me. Please forgive me for not being able to attend your final journey. My deepest condolences.',
    ],
  },
  legacy: {
    quote: {
      mm: 'ကောင်းရာသုဂတိ ရောက်ပါစေ အဘ။',
      en: 'May your soul rest in peace, Grandpa.',
    },
    signature: { mm: '- ပူးပူး', en: '- Pue Pue' },
  },
}

/**
 * STATUE_DATA — a distinct tribute opened by clicking the Grandpa statue. Where
 * MEMORIAL_DATA is a personal farewell letter, this honours his legacy as an
 * engineer and mentor — separate content, same layout.
 */
const STATUE_DATA: TributeData = {
  image: `${import.meta.env.BASE_URL}u_hlaing_bwa.jpg`,
  imageAlt: 'Statue of Grandpa U Hlaing Bwa',
  eyebrow: { mm: 'ဂုဏ်ပြုအောက်မေ့ခြင်း', en: 'A Lasting Legacy' },
  title: {
    mm: 'အဘ ဦးလှိုင်ဘွား ၏ ရုပ်တု',
    en: 'Statue of Grandpa U Hlaing Bwa',
  },
  tags: {
    mm: ['လေယာဥ်အင်ဂျင်နီယာ', 'ဆရာ', 'လမ်းပြမီး'],
    en: ['Aerospace Engineer', 'Teacher', 'Guiding Light'],
  },
  storyLabel: { mm: 'အမွေအနှစ်', en: 'His Legacy' },
  legacyLabel: { mm: 'ဂုဏ်ပြုစကား', en: 'Tribute' },
  story: {
    mm: [
      'ဤရုပ်တုသည် လေယာဉ်အင်ဂျင်နီယာ အဘ ဦးလှိုင်ဘွား၏ ဂုဏ်ကျေးဇူးကို ချီးမြှင့်အောက်မေ့ရန် တည်ထားခြင်း ဖြစ်ပါသည်။',
      'ဤနေရာမှ ဖြတ်သန်းသူတိုင်း သူ၏ ကြင်နာမှု၊ သည်းခံမှုနှင့် တိတ်ဆိတ်စွာ လမ်းပြခဲ့သော ခွန်အားကို အမြဲ အောက်မေ့ကြပါစေ။',
    ],
    en: [
      'This statue stands in honour of Grandpa U Hlaing Bwa — an aerospace engineer whose curiosity and discipline shaped everything he touched.',
      'May all who pass by remember his kindness, his patience, and the quiet strength with which he guided those he loved.',
    ],
  },
  legacy: {
    quote: {
      mm: 'ကျွန်ုပ်တို့ ရင်ထဲတွင် ထာဝရ တည်ရှိနေမည်။',
      en: 'Forever in our hearts.',
    },
    signature: { mm: '- ပူးပူး', en: '- Pue Pue' },
  },
}

type CardKey = 'memorial' | 'statue'
const CARDS: Record<CardKey, TributeData> = { memorial: MEMORIAL_DATA, statue: STATUE_DATA }

/**
 * TributeCard — the bilingual glass card. Rendered for whichever memorial the
 * visitor clicked; the content comes entirely from the `data` prop.
 */
function TributeCard({
  data,
  lang,
  setLang,
  onClose,
}: {
  data: TributeData
  lang: Lang
  setLang: (l: Lang) => void
  onClose: () => void
}) {
  // Burmese renders best in the default sans stack; English gets the elegant serif.
  const titleFont = lang === 'en' ? 'font-serif' : 'font-sans'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        transition={{ type: 'spring', stiffness: 240, damping: 26 }}
        onClick={(e) => e.stopPropagation()}
        lang={lang === 'mm' ? 'my' : 'en'}
        className="relative flex max-h-[95vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-white/15 bg-neutral-900/85 text-white shadow-2xl backdrop-blur-md"
      >
        {/* gold accent line */}
        <div className="absolute inset-x-0 top-0 z-10 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

        {/* Top-right controls: language toggle + close */}
        <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
          <div className="inline-flex overflow-hidden rounded-full border border-white/20 bg-black/40 font-mono text-[11px] backdrop-blur-md">
            {(['mm', 'en'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                aria-pressed={lang === l}
                className={`px-2.5 py-1 transition-colors ${lang === l ? 'bg-amber-500/30 text-amber-100' : 'text-white/70 hover:text-white'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full bg-black/40 p-1.5 text-white/70 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] md:grid-rows-none md:grid-cols-[2fr_3fr]">
          {/* Left — portrait (full & uncropped on mobile; full-height column on desktop) */}
          <div className="relative md:min-h-full">
            <img
              src={data.image}
              alt={data.imageAlt}
              loading="lazy"
              className="block w-full aspect-[4/5] object-cover object-top md:aspect-auto md:h-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-neutral-900/70" />
          </div>

          {/* Right — content */}
          <div className="relative min-h-0 overflow-y-auto p-4 sm:p-5">
            {/* tags */}
            <div className="flex flex-wrap gap-1.5 pr-24">
              {data.tags[lang].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-200"
                >
                  {tag}
                </span>
              ))}
            </div>

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/90">
              {data.eyebrow[lang]}
            </p>
            <h2 className={`mt-1.5 text-xl font-bold leading-snug sm:text-2xl ${titleFont}`}>
              {data.title[lang]}
            </h2>

            <div className="mt-4 space-y-4">
              {/* Story — an elegant, letter-like italic serif */}
              <section>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-amber-100">
                  <span aria-hidden>🌿</span> {data.storyLabel[lang]}
                </h3>
                <div className="mt-1.5">
                  {data.story[lang].map((para, i) => (
                    <p
                      key={i}
                      className="mb-2.5 font-serif text-sm italic leading-normal text-white/90 last:mb-0"
                    >
                      {para}
                    </p>
                  ))}
                </div>
              </section>

              {/* Legacy — quote + right-aligned signature */}
              <section>
                <h3 className="flex items-center gap-2 text-xs font-semibold text-amber-100">
                  <span aria-hidden>📜</span> {data.legacyLabel[lang]}
                </h3>
                <p className="mt-1.5 font-serif text-sm italic leading-normal text-white/90">
                  {data.legacy.quote[lang]}
                </p>
                <p className="mt-1.5 text-right font-serif text-xs italic text-amber-400/90">
                  {data.legacy.signature[lang]}
                </p>
              </section>
            </div>

            <button
              onClick={onClose}
              className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/25"
            >
              {lang === 'mm' ? 'ပိတ်ရန်' : 'Close'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * Remembrance — a standalone, full-screen 3D memorial route (/remembrance).
 * A serene sunset world honouring a beloved aerospace engineer & mentor. The
 * grave / stone / aircraft open the memorial letter; the statue opens its own
 * distinct legacy tribute.
 */
export default function Remembrance() {
  const [activeCard, setActiveCard] = useState<CardKey | null>(null)
  const [lang, setLang] = useState<Lang>('mm')
  const close = () => setActiveCard(null)

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[#1a1024]">
      {/* Back to the portfolio */}
      <Link
        to="/"
        className="absolute left-5 top-5 z-20 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-4 py-2 text-sm text-white/90 backdrop-blur-md transition hover:bg-black/50"
      >
        <ArrowLeft size={16} /> Home
      </Link>

      {/* ── The 3D world ── */}
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 2, 8], fov: 45, near: 0.1, far: 300 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <RemembranceScene
            focused={activeCard !== null}
            onMemorialClick={() => setActiveCard('memorial')}
            onStatueClick={() => setActiveCard('statue')}
          />
        </Suspense>
      </Canvas>

      {/* Load progress (drei) */}
      <Loader />

      {/* Gentle hint */}
      {!activeCard && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
          Tap the aircraft, the memorial stones, or the statue
        </div>
      )}

      {/* ── Tribute card — content depends on which memorial was clicked ── */}
      <AnimatePresence>
        {activeCard && (
          <TributeCard
            key={activeCard}
            data={CARDS[activeCard]}
            lang={lang}
            setLang={setLang}
            onClose={close}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
