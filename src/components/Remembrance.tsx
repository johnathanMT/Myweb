import { Suspense, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { Loader } from '@react-three/drei'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, X } from 'lucide-react'
import RemembranceScene from './RemembranceScene'

/**
 * MEMORIAL_DATA — the bilingual tribute. Each text field has `.mm` (Burmese) and
 * `.en` (English) keys; edit here without touching the JSX. `story` is an array of
 * paragraphs; `legacy` splits into a quote + a signature. The image is served from
 * /public via BASE_URL (Vite base = "/Myweb/").
 */
const MEMORIAL_DATA = {
  image: `${import.meta.env.BASE_URL}u_hlaing_bwa.jpg`,
  imageAlt: 'Aba U Hlaing Bwa',
  eyebrow: { mm: 'ချစ်ခင်လေးစားစွာ အောက်မေ့လျက်', en: 'In Loving Memory' },
  title: {
    mm: 'အဘ ဦးလှိုင်ဘွား (1945 - 2026)',
    en: 'Aba U Hlaing Bwa (1945 - 2026)',
  },
  tags: {
    mm: ['ဆရာသမား', 'အဘ','လေယာဥ်အင်ဂျင်နီယာ'],
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
    signature: {
      mm: '- ပူးပူး',
      en: '- Pue Pue',
    },
  },
}

type Lang = 'mm' | 'en'

/**
 * Remembrance — a standalone, full-screen 3D memorial route (/remembrance).
 * A serene sunset world honouring a beloved aerospace engineer & mentor.
 * Clicking the Airbus, grave, or memorial stone opens a bilingual tribute card.
 */
export default function Remembrance() {
  const [showMemorialCard, setShowMemorialCard] = useState(false)
  const [lang, setLang] = useState<Lang>('mm')
  const close = () => setShowMemorialCard(false)

  // Burmese renders best in the default sans stack; English gets the elegant serif.
  const titleFont = lang === 'en' ? 'font-serif' : 'font-sans'

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
            focused={showMemorialCard}
            onMemorialClick={() => setShowMemorialCard(true)}
          />
        </Suspense>
      </Canvas>

      {/* Load progress (drei) */}
      <Loader />

      {/* Gentle hint */}
      {!showMemorialCard && (
        <div className="pointer-events-none absolute bottom-6 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/10 bg-black/30 px-4 py-2 text-xs text-white/70 backdrop-blur-md">
          Tap the aircraft or the memorial stones
        </div>
      )}

      {/* ── Bilingual tribute card (transparent overlay so the scene shows through) ── */}
      <AnimatePresence>
        {showMemorialCard && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 p-4 backdrop-blur-sm"
            onClick={close}
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
                  onClick={close}
                  aria-label="Close"
                  className="rounded-full bg-black/40 p-1.5 text-white/70 backdrop-blur-md transition hover:bg-black/60 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid min-h-0 flex-1 md:grid-cols-[2fr_3fr]">
                {/* Left — portrait (short on mobile, full-height column on desktop) */}
                <div className="relative h-48 shrink-0 sm:h-56 md:h-auto md:min-h-full">
                  <img
                    src={MEMORIAL_DATA.image}
                    alt={MEMORIAL_DATA.imageAlt}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover object-center"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-neutral-900/70" />
                </div>

                {/* Right — content */}
                <div className="relative min-h-0 overflow-y-auto p-4 sm:p-5">
                  {/* tags */}
                  <div className="flex flex-wrap gap-1.5 pr-24">
                    {MEMORIAL_DATA.tags[lang].map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-medium tracking-wide text-amber-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-amber-300/90">
                    {MEMORIAL_DATA.eyebrow[lang]}
                  </p>
                  <h2 className={`mt-1.5 text-xl font-bold leading-snug sm:text-2xl ${titleFont}`}>
                    {MEMORIAL_DATA.title[lang]}
                  </h2>

                  <div className="mt-4 space-y-4">
                    {/* The Story — an elegant, letter-like italic serif */}
                    <section>
                      <h3 className="flex items-center gap-2 text-xs font-semibold text-amber-100">
                        <span aria-hidden>🌿</span> {MEMORIAL_DATA.storyLabel[lang]}
                      </h3>
                      <div className="mt-1.5">
                        {MEMORIAL_DATA.story[lang].map((para, i) => (
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
                        <span aria-hidden>📜</span> {MEMORIAL_DATA.legacyLabel[lang]}
                      </h3>
                      <p className="mt-1.5 font-serif text-sm italic leading-normal text-white/90">
                        {MEMORIAL_DATA.legacy.quote[lang]}
                      </p>
                      <p className="mt-1.5 text-right font-serif text-xs italic text-amber-400/90">
                        {MEMORIAL_DATA.legacy.signature[lang]}
                      </p>
                    </section>
                  </div>

                  <button
                    onClick={close}
                    className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/25"
                  >
                    {lang === 'mm' ? 'ပိတ်ရန်' : 'Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
