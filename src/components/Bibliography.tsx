import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import {
  GraduationCap, Building2, PlaneTakeoff, School, AwardIcon, Briefcase, Hotel, Utensils, University, Handshake, BrainCircuit,
  type LucideIcon,
} from 'lucide-react'
import JourneyCrosslink from './JourneyCrosslink'
import { SITE } from '../config/site'
import { useLang } from '../context/LangContext'
import './Bibliography.css'

/**
 * Bibliography — a vertical chronological timeline of the journey, whose visual
 * language MORPHS from "Vintage" (sepia, serif, classic icons) at the top to
 * "Cyber-Modern" (neon glow, mono, tech icons) at the present day.
 *
 * Layout strategy:
 *   xs/sm: single-column list, all cards flush left, icon dot on the left edge.
 *   md+:   two-column alternating layout (left/right), icon dot centred on spine.
 */
type Era = 'vintage' | 'transition' | 'cyber'
/** `photo` — faded card background; `logo` — small badge (for places with only a logo). Files live in public/Myweb_photo/. */
/** `partners` — two institutions shown side by side with a handshake badge (joint programmes). */
interface Partner { name: string; photo: string; credit?: string }
/** `org` — employer line under the title; `i18n` — translated copy by LangContext code (English otherwise). */
interface EntryText { year: string; title: string; text: string; org?: string }
interface TimelineEntry extends EntryText { era: Era; icon: LucideIcon; i18n?: Record<string, EntryText>; photo?: string; logo?: string; partners?: [Partner, Partner] }

const img = (name: string): string => SITE.asset(`Myweb_photo/timeline-${name}.webp`)

const TIMELINE: TimelineEntry[] = [
  {
    year: '2019, December', era: 'vintage', icon: GraduationCap, title: 'Bachelor of Arts in International Relations',
    text: 'Graduated from Dagon University. Studied International Politics, Diplomacy, Law & Economics.',
    logo: img('dagon-university')
  },
  {
    year: '2020, December', era: 'vintage', icon: Building2, title: 'Worked at MPT & KDDI Joint Operations',
    text: 'Worked with resilience during the COVID-19 pandemic, including remote work, before resigning in February 2022.',
    logo: img('mpt')
  },
  {
    year: '2022, September', era: 'transition', icon: PlaneTakeoff, title: 'Arrived in Japan',
    text: 'A new adventure began. Exciting times ahead...',
    photo: img('osaka-castle')
  },
  {
    year: '2022, September', era: 'transition', icon: School, title: 'Enrolled at WELL Japanese Language School',
    text: 'Formal studies began — Japanese language, culture, and society.',
    logo: img('well-school')
  },
  {
    year: '2022, November', era: 'cyber', icon: Hotel, title: 'Part-Time Role at Hotel Monterey Le Frere',
    text: 'Supported hotel operations and learned Japanese work culture firsthand.',
    photo: img('hotel-monterey')
  },
  {
    year: '2023, July', era: 'cyber', icon: Utensils, title: 'Part-Time Role at Tendon Tenya Restaurant Namba',
    text: 'Worked as a cook and food prep in a busy tourist district.',
    photo: img('tendon-tenya')
  },
  {
    year: '2023, July', era: 'cyber', icon: AwardIcon, title: 'Passed JLPT N3, JFT-Basic A2 & Care Worker Evaluation Tests',
    text: 'Fully qualified to commence a professional caregiving career in Japan.'
  },
  {
    year: '2024, May', era: 'cyber', icon: GraduationCap, title: 'Graduated from WELL Japanese Language School',
    text: 'Secured a position as a care worker in a hospital.',
    logo: img('well-school')
  },
  {
    year: '2024, March', era: 'cyber', icon: Briefcase, title: 'Caregiver at Medical Corporation Shojinkai, Hirashima Hospital',
    text: 'Providing compassionate patient care whilst honing interpersonal and problem-solving skills.',
    photo: img('hirashima-hospital')
  },
  {
    year: '2025, May', era: 'cyber', icon: University, title: 'Road to BSc (Hons) Computer Science',
    text: 'Pursuing a BSc in Computer Science from the University of Central Lancashire (UK), in partnership with Strategy First International College.',
    partners: [
      // CC BY-SA 4.0 — credit required wherever the photo is shown.
      { name: 'University of Central Lancashire', photo: img('uclan-campus'), credit: 'Photo: Bruce Lamberton, CC BY-SA 4.0' },
      { name: 'Strategy First International College', photo: img('strategy-first-campus') },
    ]
  },
  {
    // Employer is confidential (NDA): never name it here or in any translation.
    year: '2026, November – Present', era: 'cyber', icon: BrainCircuit, title: 'AI Research & Development Engineer Intern', org: 'Tokyo-based tech company',
    text: 'Engaging in applied AI research, verification, and practical software/system development within an engineering environment in Tokyo.',
    i18n: {
      jp: { year: '2026年11月 – 現在', title: 'AI研究開発エンジニア インターン', org: '東京のテック企業', text: '東京のエンジニアリング環境で、応用AIの研究・検証と、実践的なソフトウェア／システム開発に取り組んでいます。' },
      mm: { year: '၂၀၂၆၊ နိုဝင်ဘာ – လက်ရှိ', title: 'AI Research & Development Engineer Intern', org: 'တိုကျိုရှိ နည်းပညာကုမ္ပဏီတစ်ခု', text: 'တိုကျိုရှိ အင်ဂျင်နီယာ လုပ်ငန်းခွင်တွင် လက်တွေ့အသုံးချ AI သုတေသန၊ စမ်းသပ်အတည်ပြုခြင်းနှင့် ဆော့ဖ်ဝဲ/စနစ် ဖွံ့ဖြိုးတည်ဆောက်ခြင်းတို့တွင် ပါဝင်လုပ်ဆောင်နေပါသည်။' },
      vn: { year: 'Tháng 11, 2026 – Hiện tại', title: 'Thực tập sinh Kỹ sư Nghiên cứu & Phát triển AI', org: 'Công ty công nghệ tại Tokyo', text: 'Tham gia nghiên cứu AI ứng dụng, kiểm chứng và phát triển phần mềm/hệ thống thực tiễn trong môi trường kỹ thuật tại Tokyo.' },
      ne: { year: '२०२६, नोभेम्बर – हालसम्म', title: 'AI अनुसन्धान तथा विकास इन्जिनियर इन्टर्न', org: 'टोकियोस्थित प्रविधि कम्पनी', text: 'टोकियोको इन्जिनियरिङ वातावरणमा व्यावहारिक AI अनुसन्धान, प्रमाणीकरण तथा सफ्टवेयर/प्रणाली विकासमा संलग्न।' },
      id: { year: 'November 2026 – Sekarang', title: 'Magang Insinyur Riset & Pengembangan AI', org: 'Perusahaan teknologi di Tokyo', text: 'Terlibat dalam riset AI terapan, verifikasi, dan pengembangan perangkat lunak/sistem praktis di lingkungan rekayasa di Tokyo.' },
      zh: { year: '2026年11月 – 至今', title: 'AI 研发工程师实习生', org: '东京某科技公司', text: '在东京的工程环境中参与应用型 AI 研究、验证以及实用的软件与系统开发。' },
    },
  },
]

/** Spine dots and type per era; card colours (both themes) are in Bibliography.css. */
interface EraStyle { accent: string; ring: string; font: string; filter: string; glow: string }
const ERA: Record<Era, EraStyle> = {
  vintage: {
    accent: '#c8a04a', ring: 'rgba(200,160,74,0.5)', font: 'Georgia, "Times New Roman", serif',
    filter: 'sepia(0.35) saturate(0.9)', glow: 'none',
  },
  transition: {
    accent: '#9d8bd8', ring: 'rgba(157,139,216,0.55)', font: 'system-ui, sans-serif',
    filter: 'none', glow: '0 0 18px rgba(157,139,216,0.25)',
  },
  cyber: {
    accent: '#d4af37', ring: 'rgba(212,175,55,0.6)', font: '"Fira Code", ui-monospace, monospace',
    filter: 'none', glow: '0 0 22px rgba(212,175,55,0.35)',
  },
}

function Entry({ item, i }: { item: TimelineEntry; i: number }) {
  const e = ERA[item.era]
  const { lang } = useLang()
  const copy = item.i18n?.[lang] ?? item
  const Icon = item.icon
  const left = i % 2 === 0

  return (
    <div className="relative flex items-start">
      {/*
        Icon dot:
        • xs/sm: absolute at left edge of the containing column (pl-10 offset on the card)
        • md+:   centred on the timeline spine (left-1/2)
        Width is 36px so the card gets pl-12 (48px) on mobile to avoid overlap.
      */}
      <span
        className={[
          'absolute top-5 z-10 grid h-9 w-9 shrink-0 -translate-x-1/2 place-items-center rounded-full',
          'left-[18px] md:left-1/2',
        ].join(' ')}
        style={{
          background: '#0a0c12',
          border: `2px solid ${e.ring}`,
          boxShadow: e.glow === 'none' ? undefined : e.glow,
          color: e.accent,
        }}
      >
        <Icon size={15} strokeWidth={item.era === 'vintage' ? 1.5 : 2} aria-hidden />
      </span>

      <motion.article
        initial={{ opacity: 0, y: 24, filter: 'blur(4px)' }}
        whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
        /*
          Mobile: full width, left-padded to clear the icon dot (pl-12 = 48px > icon 18+9=27px)
          md+: 44% wide, alternating left/right
        */
        className={[
          'relative w-full overflow-hidden rounded-2xl border p-5 backdrop-blur-md',
          'ml-12',                                               // mobile: card to the right of icon
          'md:ml-0 md:w-[44%] md:p-6',                         // md: constrained width
          left ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8', // md: alternate sides
          `tl-card tl-${item.era}`,
          item.photo ? 'is-photo' : '',
        ].join(' ')}
      >
        {item.photo && (
          <>
            <img src={item.photo} alt="" aria-hidden loading="lazy" decoding="async"
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-70" />
            {/* scrim keeps the copy legible over the photo */}
            <span aria-hidden className="tl-scrim pointer-events-none absolute inset-0" />
          </>
        )}
        {item.partners && (
          <div className={`relative -mx-5 -mt-5 mb-4 md:-mt-6 ${left ? 'md:-ml-6 md:-mr-8' : 'md:-ml-8 md:-mr-6'}`}>
            <div className="grid grid-cols-2">
              {item.partners.map((pt) => (
                <figure key={pt.name} className="relative h-28 overflow-hidden sm:h-32">
                  <img src={pt.photo} alt={pt.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                  <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-2.5 pb-1.5 pt-5 text-[11px] font-semibold leading-tight"
                    style={{ color: '#fff' }}>
                    {pt.name}
                  </figcaption>
                </figure>
              ))}
            </div>
            {/* handshake badge bridging the two partners */}
            <span className="absolute left-1/2 top-1/2 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 bg-[#0a0c12]"
              style={{ borderColor: e.ring, color: e.accent, boxShadow: e.glow === 'none' ? undefined : e.glow }} title="Partnership">
              <Handshake size={18} aria-hidden />
            </span>
          </div>
        )}
        {item.logo && (
          <span className="absolute right-4 top-4 flex h-9 items-center rounded-md bg-white/90 px-2 shadow-sm">
            <img src={item.logo} alt="" aria-hidden loading="lazy" decoding="async" className="h-6 w-auto max-w-[96px] object-contain" />
          </span>
        )}
        <span
          className="tl-date relative mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-semibold tracking-widest"
          style={{ fontFamily: e.font, filter: e.filter }}
        >
          {copy.year}
        </span>
        <h3 className={`tl-title relative mb-1.5 text-base font-semibold leading-snug sm:text-lg ${item.logo ? 'pr-24' : ''}`} style={{ fontFamily: e.font }}>
          {copy.title}
        </h3>
        {copy.org && <p className="tl-org relative mb-1.5 text-sm font-medium">{copy.org}</p>}
        <p className="tl-text relative text-sm leading-relaxed" style={{ filter: e.filter }}>
          {copy.text}
        </p>
        {item.partners?.some((pt) => pt.credit) && (
          <p className="tl-credit relative mt-2 text-[10px]">
            {item.partners.filter((pt) => pt.credit).map((pt) => pt.credit).join(' · ')}
          </p>
        )}
      </motion.article>
    </div>
  )
}

/** `embedded` — rendered inside /about, so skip the journey-hub crosslink footer. */
export default function Bibliography({ embedded = false }: { embedded?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="bibliography" className="relative overflow-hidden bg-transparent py-16 sm:py-24">
      <div className="mb-14 px-4 text-center sm:px-6">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-light">// chronology</p>
        {embedded
          ? <h2 className="signature-section-title mt-2 text-white">My Journey</h2>
          : <h1 className="signature-page-title mt-2 text-white">My Journey</h1>}
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          The "where" in my story — from International Relations in Myanmar to caregiving in Osaka,
          and now a BSc in Computer Science. This timeline connects to what I study in{' '}
          <Link to="/studying" className="text-accent-light underline-offset-2 hover:underline">Personal Studying</Link>
          {' '}and the scripts I build in{' '}
          <Link to="/python" className="text-accent-light underline-offset-2 hover:underline">Python Automation</Link>.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-5xl px-4 sm:px-6">
        {/* Static grey spine */}
        <div className="absolute left-[18px] top-0 h-full w-px -translate-x-1/2 bg-white/10 md:left-1/2" aria-hidden />

        {/* Animated coloured fill that travels down on scroll */}
        <motion.div
          aria-hidden
          className="absolute left-[18px] top-0 w-px -translate-x-1/2 origin-top md:left-1/2"
          style={{
            scaleY: lineScale,
            height: '100%',
            background: 'linear-gradient(180deg, #c8a04a 0%, #9d8bd8 45%, #d4af37 100%)',
            boxShadow: '0 0 14px rgba(212,175,55,0.4)',
          }}
        />

        <div className="space-y-10 sm:space-y-14">
          {TIMELINE.map((item, i) => <Entry key={i} item={item} i={i} />)}
        </div>
      </div>

      {!embedded && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <JourneyCrosslink current="bibliography" />
        </div>
      )}
    </section>
  )
}
