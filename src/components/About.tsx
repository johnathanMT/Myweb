import { PERSONAL, SKILLS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'
import { Link } from 'react-router-dom'
import { ArrowRight, Mail, MapPin } from 'lucide-react'
import SkillWeb from './SkillWeb'

/** Cloudinary portrait: the whole photo, uncropped, resized server-side (the original is 4032×3024). */
const portrait = (url: string): string =>
  url.includes('res.cloudinary.com') ? url.replace('/upload/', '/upload/c_limit,w_960,q_auto,f_auto/') : url

interface AboutText { title: string; bio: string; slogan: string; skills: string; tech: string; human: string }
const T: Record<string, AboutText> = {
  mm: { title: 'ကျတော့် အကြောင်း', bio: 'ဂျပန်တွင် နေထိုင်သည်။ တိုးတက်ပြောင်းလဲနေသော Ai ခေတ်သစ်ဆီသို့', slogan: 'ဘယ်တော့မှ မစတင်ဖြစ်ခဲ့တာထက်စာရင် နောက်ကျတာက ပိုကောင်းပါတယ်။', skills: 'အဓိက ကျွမ်းကျင်မှုများ', tech: 'အင်ဂျင်နီယာ', human: 'ဘာသာစကားနှင့် စောင့်ရှောက်မှု' },
  en: { title: 'About Me', bio: 'Living in Japan. Advancing towards the evolving new era of AI.', slogan: 'Better late than never.', skills: 'Core Competencies', tech: 'Engineering', human: 'Languages & Care' },
  jp: { title: '私について', bio: '日本在住。進化し続ける新しいAI時代へ。', slogan: '遅れても、全くやらないよりはまし。', skills: 'コアスキル', tech: 'エンジニアリング', human: '語学・介護' },
  vn: { title: 'Về Tôi', bio: 'Sống ở Nhật Bản. Hướng tới kỷ nguyên AI mới đang không ngừng phát triển.', slogan: 'Thà muộn còn hơn không.', skills: 'Năng lực cốt lõi', tech: 'Kỹ thuật', human: 'Ngôn ngữ & Chăm sóc' },
  ne: { title: 'मेरो बारेमा', bio: 'जापानमा बसोबास। विकासशील नयाँ एआई (AI) युगको तर्फ।', slogan: 'कहिल्यै सुरु नगर्नुभन्दा ढिलो सुरु गर्नु राम्रो हो।', skills: 'मुख्य दक्षताहरू', tech: 'इन्जिनियरिङ', human: 'भाषा र हेरचाह' },
  id: { title: 'Tentang Saya', bio: 'Tinggal di Jepang. Melangkah menuju era baru AI yang terus berkembang.', slogan: 'Lebih baik terlambat daripada tidak sama sekali.', skills: 'Kompetensi Inti', tech: 'Rekayasa', human: 'Bahasa & Perawatan' },
}

interface AboutProps { lang?: string }

/** `value` is one line, or several (e.g. both degrees) as { text, note } rows. */
interface QuickFact { icon: string; label: string; value: string | { text: string; note: string }[] }
const QUICK_FACTS: QuickFact[] = [
  {
    icon: 'fas fa-graduation-cap', label: 'Education',
    value: [
      { text: 'BA International Relations', note: 'Dagon University · Completed' },
      { text: 'Road to BSc (Hons) Computer Science', note: 'Univ. of Central Lancashire · In progress' },
    ],
  },
  { icon: 'fas fa-briefcase-medical', label: 'Background', value: 'International Relations & Healthcare' },
  { icon: 'fas fa-code', label: 'Focus', value: 'AI & Web Development' },
  { icon: 'fas fa-language', label: 'Languages', value: 'MY · JP · EN' },
]

type Skill = (typeof SKILLS)[number]

/** A horizontal stroke of the Z: a hairline with a node at each end. */
function ZRule() {
  return (
    <div aria-hidden className="relative h-px bg-gradient-to-r from-accent/60 via-white/15 to-cyan/60">
      <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-accent" />
      <span className="absolute right-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-cyan" />
    </div>
  )
}

/** Languages & Care: a slim pill with a small flag or icon. */
function HumanPill({ skill }: { skill: Skill }) {
  const { name, color } = skill
  const logos = 'logos' in skill ? skill.logos : undefined
  const Icon = 'Icon' in skill ? skill.Icon : undefined
  return (
    <li className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-1.5 pr-4 transition-colors hover:border-white/25"
      style={{ boxShadow: `inset 0 0 0 1px ${color}22` }}>
      {logos ? (
        <img src={logos[0]} alt="" className="h-6 w-8 rounded-[5px] object-cover" loading="lazy" decoding="async" />
      ) : Icon ? (
        <span className="grid h-6 w-8 place-items-center rounded-[5px]" style={{ color: '#fff', background: color }}><Icon size={14} aria-hidden /></span>
      ) : null}
      <span className="text-sm font-medium text-white">{name}</span>
    </li>
  )
}

export default function About({ lang = 'en' }: AboutProps) {
  const t = T[lang] || T.en
  // GSAP ScrollTrigger reveals, synced to the same scroll as the 3D camera.
  const sectionRef = useCyberReveal()

  return (
    <section id="about" ref={sectionRef} className="relative py-28 border-t border-white/5 overflow-hidden text-legible">
      {/* crystal-clear: faint tint only, NO blur — the 3D city shows through.
          Readability comes from .text-legible (inherited dark text-shadow). */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      {/* ambient glows */}
      <div className="absolute -top-20 left-1/4 w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: 'radial-gradient(circle, rgb(16 52 110), transparent 70%)' }} />
      <div className="absolute bottom-0 right-1/4 w-[360px] h-[360px] rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, rgb(12 40 90), transparent 70%)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[300px] rounded-full blur-3xl pointer-events-none opacity-25"
        style={{ background: 'radial-gradient(ellipse, rgb(20 64 128), transparent 70%)' }} />

      <div className="section-container relative z-10">

        {/* Header */}
        <div data-reveal className="mb-16">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-accent-light mb-4">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-light" /> Who I Am
          </span>
          <h2 className="section-title">
            <span className="bg-gradient-to-r from-white via-accent-light to-cyan bg-clip-text text-transparent">{t.title}</span>
          </h2>
        </div>

        {/* Profile — Z layout: portrait → identity, a diagonal connector, then story → motto.
            Thin rules with nodes draw the Z's top and bottom strokes, like an architecture diagram. */}
        <div data-reveal className="mx-auto mb-20 max-w-5xl">
          <ZRule />

          {/* top stroke: portrait (left) → identity + spec sheet (right) */}
          <div className="grid items-center gap-8 py-8 md:grid-cols-12 md:gap-10">
            <figure className="mx-auto w-full max-w-[420px] md:col-span-5 md:max-w-none">
              <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-card"
                style={{ boxShadow: '0 30px 60px -30px rgb(var(--accent) / 0.55)' }}>
                <span aria-hidden className="absolute inset-0 grid place-items-center text-4xl font-bold text-accent/25 select-none">MTN</span>
                <img src={portrait(PERSONAL.photo)} alt={PERSONAL.name} width="960" height="720"
                  className="relative h-full w-full object-contain" loading="eager" decoding="async" fetchPriority="high"
                  onError={(e) => { e.currentTarget.style.visibility = 'hidden' }} />
              </div>
              {/* architect crop marks, on the photo's corners */}
              {(['-left-2 -top-2 border-l border-t', '-right-2 -top-2 border-r border-t', '-left-2 -bottom-2 border-l border-b', '-right-2 -bottom-2 border-r border-b'] as const).map((pos) => (
                <span key={pos} aria-hidden className={`absolute h-5 w-5 border-accent/70 ${pos}`} />
              ))}
              </div>
              <figcaption className="mt-4 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
                <span>Fig. 01 — Portrait</span>
                <span className="inline-flex items-center gap-1.5"><MapPin size={11} className="text-accent" aria-hidden />Japan</span>
              </figcaption>
            </figure>

            <div className="md:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">01 — Profile</p>
              <h3 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">{PERSONAL.name}</h3>
              <p className="mt-1 font-mono text-sm text-accent-light">{PERSONAL.handle}</p>
              <p className="mt-3 text-[15px] text-muted">{PERSONAL.subtitle}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium" style={{ color: '#10b981' }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" /> Open to opportunities
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-fg">
                  <MapPin size={12} className="text-accent" aria-hidden /> Based in Japan
                </span>
              </div>

              {/* spec sheet */}
              <dl className="mt-6 divide-y divide-white/10 rounded-xl border border-white/10 bg-white/[0.02]">
                {QUICK_FACTS.map(({ icon, label, value }) => (
                  <div key={label} className="grid grid-cols-[auto_5.5rem_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[auto_7.5rem_1fr]">
                    <i className={`${icon} w-4 text-center text-sm text-accent-light`} aria-hidden />
                    <dt className="font-mono text-[11px] uppercase tracking-wider text-muted">{label}</dt>
                    <dd className="text-sm font-semibold text-white">
                      {typeof value === 'string' ? value : (
                        <ul className="space-y-1.5">
                          {value.map((v) => (
                            <li key={v.text}>
                              {v.text}
                              <span className="block text-[11px] font-normal text-muted">{v.note}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* the Z's diagonal — top-right to bottom-left */}
          <div aria-hidden className="relative mx-auto hidden h-16 md:block">
            <svg viewBox="0 0 100 10" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
              <line x1="96" y1="0" x2="4" y2="10" stroke="rgb(var(--accent))" strokeOpacity="0.55" strokeWidth="1.2"
                strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className="absolute right-[4%] top-0 h-2.5 w-2.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent" style={{ boxShadow: '0 0 12px rgb(var(--accent))' }} />
            <span className="absolute bottom-0 left-[4%] h-2.5 w-2.5 -translate-x-1/2 translate-y-1/2 rounded-full bg-cyan" style={{ boxShadow: '0 0 12px rgb(var(--cyan))' }} />
          </div>

          {/* bottom stroke: story (left) → motto + contact (right) */}
          <div className="grid gap-8 py-8 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">02 — Story</p>
              <div className="mt-4 space-y-4">
                {lang === 'en'
                  ? PERSONAL.aboutBio.map((para, i) => (
                      <p key={para.slice(0, 24)} className={`leading-relaxed text-gray-300 ${i === 0 ? 'text-[17px]' : 'text-[15px]'}`}>{para}</p>
                    ))
                  : <p className="text-[17px] leading-relaxed text-gray-300">{t.bio}</p>}
              </div>
            </div>

            <aside className="flex flex-col gap-5 md:col-span-5">
              <figure className="rounded-2xl border border-white/10 bg-white/[0.03] p-6" style={{ borderLeft: '3px solid rgb(var(--accent))' }}>
                <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">03 — Principle</p>
                <blockquote className="mt-3 text-xl italic leading-snug text-fg" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
                  “{t.slogan}”
                </blockquote>
              </figure>
              <div className="flex flex-wrap gap-3">
                <a href={`mailto:${PERSONAL.email}`} className="btn-primary"><Mail size={15} aria-hidden /> Get in touch</a>
                <Link to="/projects" className="btn-glass">View projects <ArrowRight size={15} aria-hidden /></Link>
              </div>
            </aside>
          </div>

          <ZRule />
        </div>

        {/* Skills — glowing glass chips */}
        <div data-reveal>
          <p className="text-accent-light text-sm font-semibold uppercase tracking-widest mb-6">{t.skills}</p>
          <SkillWeb />

          <p className="mb-3 mt-10 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">{t.human}</p>
          <ul className="flex flex-wrap gap-2.5">
            {SKILLS.filter((s) => s.group === 'human').map((skill) => <HumanPill key={skill.name} skill={skill} />)}
          </ul>
        </div>
      </div>
    </section>
  )
}
