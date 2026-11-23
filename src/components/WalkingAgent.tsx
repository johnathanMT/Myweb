import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { motion, useAnimationFrame, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { SITE } from '../config/site'
import { openPortfolioChat } from '../lib/chatBus'
import { useInView } from '../hooks/useInView'
import './WalkingAgent.css'

/**
 * WalkingAgent — "Talk to my AI agent": a pure-SVG robot that paces a glass
 * track. Clicking anywhere on the stage opens the PortfolioChat panel. Limbs
 * are CSS keyframes (WalkingAgent.css); position is driven here.
 *
 * To edit copy, change ONLY the T object. Unknown language codes fall back to English.
 */
interface AgentText { kicker: string; title: string; sub: string; line: string; prompts: string[] }

const T: Record<string, AgentText> = {
  en: {
    kicker: 'AI ASSISTANT',
    title: 'Talk to my AI agent',
    sub: 'Ask about me, my work and my journey — anytime.',
    line: 'Prefer LINE? Chat there instead',
    prompts: ['Ask my AI Agent →', 'Does he know C#?', 'What is he building?'],
  },
  jp: {
    kicker: 'AI アシスタント',
    title: '私のAIエージェントと話す',
    sub: '私自身・仕事・歩みについて、いつでもお答えします。',
    line: 'LINEで話す',
    prompts: ['AIエージェントに質問 →', 'C#はできますか？', '何を作っていますか？'],
  },
  mm: {
    kicker: 'AI လက်ထောက်',
    title: 'ကျွန်တော့် AI agent နှင့် စကားပြောကြည့်ပါ',
    sub: 'ကျွန်တော့်အကြောင်း၊ အလုပ်နှင့် ဘဝခရီးအကြောင်းကို အချိန်မရွေး ဖြေကြားပေးပါသည်။',
    line: 'LINE တွင် စကားပြောရန်',
    prompts: ['AI agent ကို မေးကြည့်ပါ →', 'C# တတ်ပါသလား။', 'ဘာတွေ ဖန်တီးနေပါသလဲ။'],
  },
  vn: {
    kicker: 'TRỢ LÝ AI',
    title: 'Trò chuyện với AI agent của tôi',
    sub: 'Trả lời câu hỏi về tôi, công việc và hành trình của tôi — bất cứ lúc nào.',
    line: 'Trò chuyện qua LINE',
    prompts: ['Hỏi AI agent của tôi →', 'Anh ấy biết C# không?', 'Anh ấy đang xây dựng gì?'],
  },
  ne: {
    kicker: 'AI सहायक',
    title: 'मेरो AI एजेन्टसँग कुरा गर्नुहोस्',
    sub: 'मेरो, मेरो काम र यात्राबारे जुनसुकै बेला जवाफ दिन्छ।',
    line: 'LINE मा कुरा गर्नुहोस्',
    prompts: ['मेरो AI एजेन्टलाई सोध्नुहोस् →', 'के उहाँलाई C# आउँछ?', 'उहाँ के बनाउँदै हुनुहुन्छ?'],
  },
  id: {
    kicker: 'ASISTEN AI',
    title: 'Bicara dengan AI agent saya',
    sub: 'Menjawab pertanyaan tentang saya, pekerjaan, dan perjalanan saya — kapan saja.',
    line: 'Mengobrol lewat LINE',
    prompts: ['Tanya AI agent saya →', 'Apakah dia bisa C#?', 'Apa yang sedang dia buat?'],
  },
}

// Honest disclaimer: the chat and the LINE bot are automated AI, NOT me personally.
const DISCLAIMER: Record<string, string> = {
  en: 'Heads up: this is an automated AI assistant trained on my background — not me personally. To reach me directly, use LinkedIn or email.',
  jp: 'ご注意：これは私の経歴を学習した自動AIアシスタントで、本人ではありません。直接のご連絡はLinkedInまたはメールへ。',
  mm: 'သတိပြုရန် — ဤသည်မှာ ကျွန်တော့်နောက်ခံအကြောင်း သင်ကြားထားသော အလိုအလျောက် AI လက်ထောက် ဖြစ်ပြီး ကျွန်တော်ကိုယ်တိုင် မဟုတ်ပါ။ တိုက်ရိုက်ဆက်သွယ်လိုပါက LinkedIn သို့မဟုတ် အီးမေးလ်မှတစ်ဆင့် ဆက်သွယ်ပါ။',
  vn: 'Lưu ý: đây là trợ lý AI tự động được huấn luyện về tôi — không phải tôi. Để liên hệ trực tiếp, hãy dùng LinkedIn hoặc email.',
  ne: 'सूचना: यो मेरो बारेमा तालिम प्राप्त स्वचालित AI सहायक हो — म आफैं होइन। प्रत्यक्ष सम्पर्कका लागि LinkedIn वा इमेल प्रयोग गर्नुहोस्।',
  id: 'Catatan: ini asisten AI otomatis yang dilatih tentang saya — bukan saya pribadi. Untuk menghubungi saya langsung, gunakan LinkedIn atau email.',
}

const BOT_W = 112        // matches .agent-bot
const BUBBLE_W = 208     // matches .agent-bubble
const SPEED = 64         // px/s — paired with the 0.88s stride so feet don't skate
const PAUSE_END = 1900   // ms at each end of the track
const PAUSE_MID = 1400   // ms halfway across
const PROMPT_MS = 4200

export default function WalkingAgent({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const reduced = !!useReducedMotion()
  const [stageRef, inView] = useInView<HTMLButtonElement>({ threshold: 0.15 })
  const laneRef = useRef<HTMLSpanElement>(null)

  const [hover, setHover] = useState(false)
  const [focused, setFocused] = useState(false)
  const [resting, setResting] = useState(false)
  const [dir, setDir] = useState<1 | -1>(1)
  const [prompt, setPrompt] = useState(0)
  const alert = hover || focused
  const walking = inView && !reduced && !alert && !resting

  const x = useMotionValue(0)
  const span = useMotionValue(0)   // how far the robot can travel
  // the bubble follows but stays inside the track; its tail stays on the robot
  const bubbleX = useTransform(() =>
    Math.max(0, Math.min(x.get() + (BOT_W - BUBBLE_W) / 2, span.get() + BOT_W - BUBBLE_W)))
  const tailX = useTransform(() => x.get() + BOT_W / 2)

  // Track width → travel distance; keep the robot on the track when it shrinks.
  useEffect(() => {
    const lane = laneRef.current
    if (!lane) return
    const ro = new ResizeObserver(() => {
      const room = Math.max(0, lane.clientWidth - BOT_W)
      span.set(room)
      x.set(reduced ? room / 2 : Math.min(x.get(), room))
    })
    ro.observe(lane)
    return () => ro.disconnect()
  }, [reduced, span, x])

  // Walk state lives in a ref: it changes every frame and must not re-render.
  const walk = useRef({ dir: 1 as 1 | -1, rest: 0, midDone: false })
  useAnimationFrame((_, delta) => {
    if (!inView || reduced || alert) return
    const room = span.get()
    if (room <= 0) return
    const w = walk.current
    const dt = Math.min(delta, 50)   // a background tab must not teleport the robot
    if (w.rest > 0) {
      w.rest -= dt
      if (w.rest > 0) return
      const at = x.get()
      if (at >= room) w.dir = -1
      else if (at <= 0) w.dir = 1
      setDir(w.dir)
      setResting(false)
      return
    }
    const from = x.get()
    let to = from + (w.dir * SPEED * dt) / 1000
    const mid = room / 2
    if (to >= room || to <= 0) {
      to = to <= 0 ? 0 : room
      w.rest = PAUSE_END
      w.midDone = false
      setResting(true)
    } else if (!w.midDone && (from - mid) * (to - mid) <= 0 && room > 360) {
      w.rest = PAUSE_MID
      w.midDone = true
      setResting(true)
    }
    x.set(to)
  })

  useEffect(() => {
    if (!inView || reduced) return
    const id = setInterval(() => setPrompt((p) => p + 1), PROMPT_MS)
    return () => clearInterval(id)
  }, [inView, reduced])

  const line = alert ? t.prompts[0] : t.prompts[prompt % t.prompts.length]
  const state = [
    inView && 'is-live', walking ? 'is-walking' : 'is-paused', alert && 'is-alert',
  ].filter(Boolean).join(' ')

  return (
    <section id="ai-agent" className="relative py-20 sm:py-24" aria-labelledby="ai-agent-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">{t.kicker}</p>
        <h2 id="ai-agent-title" className="section-title mt-3">{t.title}</h2>
        <p className="section-subtitle !mb-8">{t.sub}</p>

        <button
          ref={stageRef}
          type="button"
          className={`agent-stage ${state}`}
          aria-label={t.prompts[0].replace(/\s*→$/, '')}
          aria-haspopup="dialog"
          onClick={openPortfolioChat}
          onPointerEnter={(e) => { if (e.pointerType === 'mouse') setHover(true) }}
          onPointerLeave={() => setHover(false)}
          onFocus={(e) => setFocused(e.currentTarget.matches(':focus-visible'))}
          onBlur={() => setFocused(false)}
        >
          <span className="agent-floor" aria-hidden />
          <span ref={laneRef} className="agent-lane" aria-hidden>
            <motion.span className="agent-bubble" style={{ x: bubbleX }}>
              <motion.span key={line} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>{line}</motion.span>
            </motion.span>
            <motion.span className="agent-tail" style={{ x: tailX, rotate: 45 }} />

            <motion.span className="agent-bot" style={{ x }}>
              <span className="agent-shadow" />
              <motion.span
                className="agent-flip block"
                initial={false}
                animate={{ scaleX: dir }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
              >
                <RobotSvg />
              </motion.span>
            </motion.span>
          </span>
        </button>

        <div className="mt-5 flex flex-col gap-3 text-[13px] leading-relaxed text-muted sm:flex-row sm:items-start sm:justify-between sm:gap-8">
          <p className="max-w-2xl">{DISCLAIMER[lang] || DISCLAIMER.en}</p>
          <a href={SITE.lineUrl} target="_blank" rel="noopener noreferrer" className="shrink-0 font-medium text-accent underline-offset-4 hover:underline">
            {t.line}
          </a>
        </div>
      </div>
    </section>
  )
}

const pivot = (px: number, py: number) => ({ '--px': `${px}px`, '--py': `${py}px` }) as CSSProperties

function Leg({ hip, far }: { hip: number; far?: boolean }) {
  const part = far ? 'bot2-far' : 'bot2-near'
  const alt = far ? 'bot2-alt' : ''
  return (
    <g className={`bot2-joint bot2-thigh ${alt}`} style={pivot(hip, 110)}>
      <rect x={hip - 5.5} y="106" width="11" height="23" rx="5.5" className={part} />
      <g className={`bot2-joint bot2-shin ${alt}`} style={pivot(hip, 126)}>
        <rect x={hip - 4.5} y="123" width="9" height="23" rx="4.5" className={part} />
        <path d={`M${hip - 7} 154v-5a6 6 0 0 1 6-6h4a10 10 0 0 1 10 10v1z`} className={part} />
      </g>
    </g>
  )
}

function Arm({ at, far }: { at: number; far?: boolean }) {
  const part = far ? 'bot2-far' : 'bot2-near'
  return (
    <g className={`bot2-joint bot2-arm ${far ? '' : 'bot2-alt bot2-wave'}`} style={pivot(at, 83)}>
      <rect x={at - 4.5} y="79" width="9" height="22" rx="4.5" className={part} />
      <g transform={`rotate(-16 ${at} 98)`}>
        <rect x={at - 4} y="95" width="8" height="15" rx="4" className={part} />
        <circle cx={at} cy="111" r="5" className={part} />
      </g>
    </g>
  )
}

/** Drawn facing right; the parent flips it with scaleX. */
function RobotSvg() {
  return (
    <svg viewBox="0 0 120 160" aria-hidden>
      <defs>
        <linearGradient id="bot2-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--bot-a)' }} />
          <stop offset="1" style={{ stopColor: 'var(--bot-b)' }} />
        </linearGradient>
        <linearGradient id="bot2-glow" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>

      <Leg hip={66} far />
      <g className="bot2-body"><Arm at={80} far /></g>
      <Leg hip={54} />

      <g className="bot2-body">
        <rect x="38" y="74" width="44" height="40" rx="15" className="bot2-shell" />
        <circle cx="62" cy="93" r="8" fill="#060d24" />
        <circle cx="62" cy="93" r="5" className="bot2-core" />
        <rect x="53" y="69" width="14" height="8" rx="3" className="bot2-far" />

        <path d="M60 22V11" stroke="var(--bot-line)" strokeWidth="2.4" strokeLinecap="round" />
        <circle cx="60" cy="8" r="4.5" className="bot2-beacon" />
        <rect x="17" y="38" width="9" height="18" rx="4" className="bot2-far" />
        <rect x="94" y="38" width="9" height="18" rx="4" className="bot2-far" />
        <rect x="22" y="20" width="76" height="52" rx="23" className="bot2-shell" />
        <rect x="30" y="30" width="60" height="33" rx="16" className="bot2-visor" />
        <g className="bot2-eyes">
          <g className="bot2-blink">
            <rect x="43" y="38" width="8" height="13" rx="4" />
            <rect x="69" y="38" width="8" height="13" rx="4" />
          </g>
        </g>
        <path d="M54 55q6 4 12 0" className="bot2-smile" />
        <Arm at={42} />
      </g>
    </svg>
  )
}
