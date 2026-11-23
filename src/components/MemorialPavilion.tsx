import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import './MemorialPavilion.css'

/**
 * MemorialPavilion — a Myanmar pyatthat (tiered-roof pavilion) drawn in SVG, with
 * an eternal oil lamp in its archway. The whole card opens the existing memorial
 * world at /remembrance. Under reduced motion the lamp is a steady glow.
 */
interface MemorialText { kicker: string; title: string; body: string; cta: string }

const T: Record<string, MemorialText> = {
  en: {
    kicker: 'In loving memory',
    title: 'For a cherished grandfather figure',
    body: 'He looked after me from the day I was born, and his words still guide the way I live and work. This lamp is kept burning for him, with love and with gratitude.',
    cta: 'Enter the memorial',
  },
  jp: {
    kicker: '追悼',
    title: '祖父のように慕った方へ',
    body: '生まれた日からずっと見守り、導いてくださった、祖父のような大切な方。その教えは今も私の歩みを照らしています。敬愛と感謝を込めて、この灯をともし続けます。',
    cta: '追悼の世界へ',
  },
  mm: {
    kicker: 'ချစ်ခင်လေးစားစွာ အောက်မေ့လျက်',
    title: 'ချစ်လှစွာသော အဘသို့',
    body: 'မွေးဖွားချိန်မှစ၍ အဘိုးရင်းသဖွယ် စောင့်ရှောက်ပေးခဲ့သော အဘ၏ ဆုံးမစကားများသည် ယနေ့တိုင် ကျွန်တော့်ဘဝကို လမ်းပြနေဆဲ ဖြစ်ပါသည်။ မေတ္တာနှင့် ကျေးဇူးတရားကို ရည်စူး၍ ဤဆီမီးကို အစဉ်ထွန်းညှိထားပါသည်။',
    cta: 'အမှတ်တရ ကမ္ဘာသို့ ဝင်ရောက်ရန်',
  },
  vn: {
    kicker: 'Tưởng nhớ',
    title: 'Kính dâng người ông tinh thần',
    body: 'Như một người ông, ông đã chở che tôi từ ngày tôi chào đời, và những lời ông dạy vẫn soi đường cho tôi hôm nay. Ngọn đèn này mãi thắp sáng vì ông, với tình yêu và lòng biết ơn.',
    cta: 'Vào không gian tưởng niệm',
  },
  ne: {
    kicker: 'श्रद्धापूर्ण सम्झनामा',
    title: 'हजुरबुबा समान प्रिय व्यक्तित्वप्रति',
    body: 'म जन्मिएकै दिनदेखि उहाँले मलाई माया र संरक्षण दिनुभयो; उहाँका शब्दले आज पनि मलाई बाटो देखाउँछन्। माया र कृतज्ञतासहित यो दियो उहाँका लागि सधैं बलिरहनेछ।',
    cta: 'स्मृति संसारमा प्रवेश गर्नुहोस्',
  },
  id: {
    kicker: 'Dalam kenangan penuh kasih',
    title: 'Untuk sosok kakek tercinta',
    body: 'Beliau menjaga saya sejak hari saya lahir, dan nasihatnya masih menuntun hidup saya hingga kini. Pelita ini terus menyala untuknya, dengan cinta dan rasa terima kasih.',
    cta: 'Masuki ruang kenangan',
  },
  zh: {
    kicker: '深切缅怀',
    title: '献给如祖父般敬爱的长者',
    body: '从我出生那天起，他便一直守护着我；他的教诲至今仍照亮我前行的路。怀着爱与感恩，这盏灯为他长明。',
    cta: '进入追思之境',
  },
}

export default function MemorialPavilion({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en

  return (
    <section id="memorial" className="relative px-4 py-16 sm:px-6 sm:py-20" aria-labelledby="memorial-title">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.1, ease: [0.2, 0.7, 0.2, 1] }}
        className="mx-auto max-w-5xl"
      >
        <Link to="/remembrance" className="pv-card group">
          <PavilionSvg />
          <div className="pv-copy">
            <p className="pv-kicker">{t.kicker}</p>
            <h2 id="memorial-title" className="pv-title">{t.title}</h2>
            <p className="pv-body">{t.body}</p>
            <span className="pv-cta">
              {t.cta} <ArrowRight size={16} aria-hidden className="transition-transform duration-300 group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </motion.div>
    </section>
  )
}

/* ── Drawing: everything is centred on x = 0 and mirrored, y grows downward ── */

/** Roof tiers, widest first. `w` eave half-width, `n` half-width where the next neck meets it, `y` eave line, `h` roof height. */
const TIERS = [
  { y: 268, w: 178, n: 104, h: 46 },
  { y: 206, w: 134, n: 78, h: 40 },
  { y: 152, w: 98, n: 56, h: 34 },
  { y: 106, w: 69, n: 38, h: 29 },
  { y: 67, w: 46, n: 22, h: 24 },
]

/** One concave roof with its eave corners swept up and out. */
function roofPath(w: number, n: number, y: number, h: number): string {
  const tip = w + 9
  const lift = h * 0.5
  return `M${-tip} ${y - lift}C${-w * 0.96} ${y - 3} ${-w * 0.88} ${y} ${-w * 0.76} ${y}H${w * 0.76}`
    + `C${w * 0.88} ${y} ${w * 0.96} ${y - 3} ${tip} ${y - lift}`
    + `C${w * 0.86} ${y - h * 0.34} ${n * 1.12} ${y - h * 0.6} ${n} ${y - h}H${-n}`
    + `C${-n * 1.12} ${y - h * 0.6} ${-w * 0.86} ${y - h * 0.34} ${-tip} ${y - lift}Z`
}

function Tier({ y, w, n, h, neck }: { y: number; w: number; n: number; h: number; neck: number }) {
  const tip = w + 9
  const lift = h * 0.5
  const g = Math.max(8, n * 0.3)
  // carved valance: small pendants along the eave
  const count = Math.max(4, Math.round(w / 13))
  const span = w * 0.74
  const pendants = Array.from({ length: count + 1 }, (_, i) => -span + (2 * span * i) / count)
  return (
    <g>
      {/* neck wall up to the tier above */}
      <rect x={-n} y={y - h - neck} width={n * 2} height={neck + 1} className="pv-wall" />
      <path d={roofPath(w, n, y, h)} className="pv-roof" />
      {/* ribs following the slope */}
      {[0.3, 0.62].map((k) => (
        <path key={k} className="pv-fine"
          d={`M${-n * k} ${y - h}Q${-n * k * 1.15} ${y - h * 0.5} ${-w * 0.76 * k} ${y}M${n * k} ${y - h}Q${n * k * 1.15} ${y - h * 0.5} ${w * 0.76 * k} ${y}`} />
      ))}
      <path d={`M${-w * 0.76} ${y + 4}H${w * 0.76}`} className="pv-line" />
      {pendants.map((x) => <path key={x} d={`M${x - 2.6} ${y + 4.5}L${x} ${y + 10}L${x + 2.6} ${y + 4.5}Z`} className="pv-gold" />)}
      {/* flame finials on the swept corners */}
      {[-1, 1].map((s) => (
        <path key={s} className="pv-gold"
          d={`M${s * (tip - 4)} ${y - lift + 2}C${s * (tip + 3)} ${y - lift - 2} ${s * (tip + 7)} ${y - lift - 9} ${s * (tip + 4)} ${y - lift - 17}C${s * (tip + 1)} ${y - lift - 10} ${s * (tip - 3)} ${y - lift - 6} ${s * (tip - 8)} ${y - lift + 3}Z`} />
      ))}
      {/* central gable */}
      <path className="pv-gable"
        d={`M${-g} ${y - 1}C${-g * 0.5} ${y - h * 0.35} ${-g * 0.25} ${y - h * 0.6} 0 ${y - h * 0.98}C${g * 0.25} ${y - h * 0.6} ${g * 0.5} ${y - h * 0.35} ${g} ${y - 1}Z`} />
    </g>
  )
}

function Pillar({ x, w = 13 }: { x: number; w?: number }) {
  return (
    <g>
      <rect x={x - w / 2} y="284" width={w} height="156" className="pv-pillar" />
      <path d={`M${x - w * 0.16} 298V428M${x + w * 0.16} 298V428`} className="pv-fine" />
      <path d={`M${x - w * 0.9} 284H${x + w * 0.9}L${x + w * 0.55} 296H${x - w * 0.55}Z`} className="pv-gold" />
      <path d={`M${x - w * 0.55} 428H${x + w * 0.55}L${x + w * 0.9} 440H${x - w * 0.9}Z`} className="pv-gold" />
    </g>
  )
}

const ARCH = 'M-70 440V352C-70 326 -52 322 -44 310C-36 298 -18 302 0 284C18 302 36 298 44 310C52 322 70 326 70 352V440Z'

function PavilionSvg() {
  const reduced = useReducedMotion()
  const flicker = reduced ? undefined : { scaleY: [1, 1.07, 0.97, 1.04, 1], scaleX: [1, 0.96, 1.03, 0.98, 1] }
  const breathe = reduced ? undefined : { opacity: [0.85, 1, 0.9, 1, 0.85] }

  return (
    <svg viewBox="-215 -70 430 580" className="pv-svg" aria-hidden>
      <defs>
        <linearGradient id="pv-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--pv-roof-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--pv-roof-b)' }} />
        </linearGradient>
        <linearGradient id="pv-pillar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--pv-roof-b)' }} />
          <stop offset="0.5" style={{ stopColor: 'var(--pv-roof-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--pv-roof-b)' }} />
        </linearGradient>
        <linearGradient id="pv-stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--pv-stone-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--pv-stone-b)' }} />
        </linearGradient>
        <radialGradient id="pv-glow">
          <stop offset="0" stopColor="#ffd98a" stopOpacity="0.85" />
          <stop offset="0.45" stopColor="#f0a93c" stopOpacity="0.32" />
          <stop offset="1" stopColor="#f0a93c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pv-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#f08a24" />
          <stop offset="0.5" stopColor="#ffc44d" />
          <stop offset="1" stopColor="#fff3cf" />
        </linearGradient>
        <clipPath id="pv-arch"><path d={ARCH} /></clipPath>
      </defs>

      {/* tiers, bottom-up: each eave overhangs the neck wall beneath it */}
      {TIERS.map((tier, i) => <Tier key={tier.y} {...tier} neck={i === TIERS.length - 1 ? 0 : 16} />)}

      {/* hti spire */}
      <path d="M-22 43C-20 26 -9 20 -6 4H6C9 20 20 26 22 43Z" className="pv-roof" />
      {[[12, 4], [9.5, -8], [7.2, -19], [5, -29]].map(([r, y]) => (
        <path key={y} d={`M${-r} ${y}Q0 ${y + 5} ${r} ${y}L${r * 0.62} ${y - 8}H${-r * 0.62}Z`} className="pv-gold" />
      ))}
      <path d="M0 -37V-58" className="pv-line" />
      <path d="M0 -50L9 -46.5L0 -43" className="pv-gold" />
      <circle cx="0" cy="-60" r="3.2" className="pv-gold" />

      {/* hall */}
      <rect x="-146" y="278" width="292" height="164" className="pv-hall" />
      <rect x="-150" y="276" width="300" height="9" className="pv-wall" />
      <path d={ARCH} className="pv-niche" />
      <motion.g clipPath="url(#pv-arch)" animate={breathe} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}>
        <circle cx="0" cy="388" r="112" fill="url(#pv-glow)" />
      </motion.g>
      <path d={ARCH} className="pv-arch" />
      <path d="M0 270C5 276 9 280 9 285C9 291 4 294 0 298C-4 294 -9 291 -9 285C-9 280 -5 276 0 270Z" className="pv-gold" />
      {[-140, -108, 108, 140].map((x) => <Pillar key={x} x={x} />)}
      {[-84, 84].map((x) => <Pillar key={x} x={x} w={16} />)}

      {/* lamp */}
      <path d="M-30 440H30L24 428H-24Z" className="pv-wall" />
      <path d="M-5 428H5V416H-5Z" className="pv-gold" />
      <path d="M-25 403C-20 418 20 418 25 403C12 408 -12 408 -25 403Z" className="pv-gold" />
      <motion.g
        animate={flicker}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}
      >
        <path d="M0 404C-11 400 -13 388 -7 378C-3 371 -1 365 0 354C3 365 8 371 10 381C12 391 9 401 0 404Z" fill="url(#pv-flame)" />
        <path d="M0 403C-5 400 -5 393 -2 388C0 384 0 381 1 377C4 384 6 389 5 395C4 400 3 402 0 403Z" fill="#fff8e2" opacity="0.9" />
      </motion.g>

      {/* light spilling over the pillars and steps */}
      <motion.circle cx="0" cy="392" r="185" fill="url(#pv-glow)" className="pv-spill"
        animate={reduced ? undefined : { opacity: [0.3, 0.42, 0.34, 0.4, 0.3] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }} />

      {/* stepped plinth */}
      {[[164, 440, 14], [178, 454, 14], [192, 468, 16]].map(([w, y, h]) => (
        <rect key={y} x={-w} y={y} width={w * 2} height={h} rx="1.5" className="pv-stone" />
      ))}
      <path d="M-46 440H46L60 484H-60Z" className="pv-stair" />
      <path d="M-50 451H50M-53 462H53M-56.5 473H56.5" className="pv-fine" />
      <path d="M-192 484H192" className="pv-line" />
    </svg>
  )
}
