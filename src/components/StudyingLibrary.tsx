import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Landmark, BookOpen, Globe2, Feather, GraduationCap, ScrollText, Brain, Code2,
  Network, Database, ClipboardCheck, type LucideIcon,
} from 'lucide-react'
import JourneyCrosslink from './JourneyCrosslink'
import { SITE } from '../config/site'

/**
 * StudyingLibrary — Dark Academia reading room for NCC, IBM AI, and self-study tracks.
 * Content ported from legacy myweb_PStudying.html with live progress indicators.
 */
const PARCHMENT = '#e8dcc0'
const GOLD = '#c8a04a'

interface Stat { value: string; label: string }
const STATS: Stat[] = [
  { value: 'L5', label: 'NCC Diploma (L4 complete)' },
  { value: '3+', label: 'Certificates Earned' },
  { value: '500+', label: 'Coding Hours' },
]

type ModuleStatus = 'done' | 'active' | 'locked'

/** How the NCC diplomas are assessed — shown under the NCC row for recruiters. */
const NCC_ASSESSMENT = 'Rigorous UK-standard curriculum evaluated through practical hands-on assignments. Demonstrated engineering competency by designing comprehensive system architectures, developing functional software solutions, and writing professional technical documentation, rather than just taking theoretical exams.'

interface Curriculum {
  /** 0–100, or undefined for a course just under way (shows "Studying now" instead of a bar). */
  icon: LucideIcon; tag: string; title: string; school: string; progress?: number
  /** NCC diplomas render as their own row, followed by the assessment note. */
  ncc?: boolean
  /** public/ path of an institution logo, shown on a white plate instead of the icon. */
  logo?: string
  accent: string; modules: { name: string; status: ModuleStatus; handsOn?: boolean }[]
}

const CURRICULUM: Curriculum[] = [
  {
    icon: GraduationCap, tag: 'University · Studying now', title: 'NCC L5 Diploma in Computing', ncc: true,
    school: 'Strategy First International College · NCC Education (UK)',
    accent: '#a855f7',
    modules: [
      { name: 'Agile Development', status: 'active', handsOn: true },
      { name: 'Mobile App Development', status: 'active', handsOn: true },
      { name: 'Computing Project', status: 'active', handsOn: true },
      { name: 'Artificial Intelligence', status: 'active', handsOn: true },
      { name: 'Backend Web Development', status: 'active', handsOn: true },
      { name: 'Network Security', status: 'active', handsOn: true },
    ],
  },
  {
    icon: GraduationCap, tag: 'University · Completed', title: 'NCC L4 Diploma in Computing', ncc: true,
    school: 'Strategy First International College · NCC Education (UK)',
    progress: 100, accent: '#3b82f6',
    modules: [
      { name: 'Computer Systems', status: 'done', handsOn: true },
      { name: 'Computer Networks', status: 'done', handsOn: true },
      { name: 'Databases', status: 'done', handsOn: true },
      { name: 'Front-End Web Development', status: 'done', handsOn: true },
      { name: 'Object-Oriented Systems Analysis and Design', status: 'done', handsOn: true },
      { name: 'Algorithms and Mathematical Concepts for Computing', status: 'done', handsOn: true },
      { name: 'Designing and Developing Object-Oriented Computer Programs', status: 'done', handsOn: true },
      { name: 'Software Engineering', status: 'done', handsOn: true },
    ],
  },
  {
    icon: GraduationCap, tag: 'Bachelor’s Degree · Completed 2019', title: 'Bachelor of Arts in International Relations',
    school: 'Dagon University · Yangon, Myanmar',
    logo: 'Myweb_photo/timeline-dagon-university.webp',
    progress: 100, accent: '#c8a04a',
    modules: [
      { name: 'International Politics', status: 'done' },
      { name: 'Diplomacy', status: 'done' },
      { name: 'Law', status: 'done' },
      { name: 'Economics', status: 'done' },
    ],
  },
  {
    icon: GraduationCap, tag: 'Foundation · Completed', title: 'Computing Foundation',
    school: 'Strategy First International College',
    progress: 100, accent: '#14b8a6',
    modules: [
      { name: 'Four Skills in English', status: 'done' },
      { name: 'Learning Skills', status: 'done' },
      { name: 'Operating System Fundamentals', status: 'done' },
      { name: 'Introduction to IT', status: 'done' },
      { name: 'System Flowcharts', status: 'done' },
      { name: 'Programming Concepts', status: 'done' },
      { name: 'Numerical Methods', status: 'done' },
      { name: 'Professional and Ethical Issues', status: 'done' },
      { name: 'Computer Hardware and Software', status: 'done' },
      { name: 'Digital Logic and Design', status: 'done' },
    ],
  },
  {
    icon: Brain, tag: 'Professional Cert', title: 'IBM AI Developer Professional',
    school: 'Coursera Plus',
    progress: 65, accent: GOLD,
    modules: [
      { name: 'Python for AI', status: 'done' },
      { name: 'AI Fundamentals', status: 'done' },
      { name: 'Machine Learning', status: 'active' },
      { name: 'Deep Learning', status: 'locked' },
    ],
  },
  {
    icon: Code2, tag: 'Self-Study', title: 'Full Stack Development',
    school: 'Udemy & personal projects',
    progress: 50, accent: '#22c55e',
    modules: [
      { name: 'HTML5 / CSS3', status: 'done' },
      { name: 'JavaScript Basics', status: 'done' },
      { name: 'Python Automation', status: 'active' },
      { name: 'Django Framework', status: 'locked' },
    ],
  },
]

const NCC_TRACKS = CURRICULUM.filter((c) => c.ncc)
const OTHER_TRACKS = CURRICULUM.filter((c) => !c.ncc)

interface Assignment { icon: LucideIcon; title: string; desc: string; module: string }

const ASSIGNMENTS: Assignment[] = [
  {
    icon: Network, title: 'Network Design Proposal',
    desc: 'LAN/WAN design for a fictional company — Computer Networks module deliverable.',
    module: 'NCC · Networks',
  },
  {
    icon: Database, title: 'SQL Database System',
    desc: 'ERD and SQL queries for a Library Management System — Databases module.',
    module: 'NCC · Databases',
  },
]

interface Collection { icon: LucideIcon; title: string; meta: string; desc: string }

const COLLECTIONS: Collection[] = [
  { icon: Landmark, title: 'System Architecture', meta: 'OOSAD · DDOOCP',
    desc: 'Object-oriented analysis, design patterns, and disciplined software architecture.' },
  { icon: BookOpen, title: 'Algorithms & FE', meta: 'Fundamental Engineering',
    desc: 'Data structures, complexity, and the fundamentals behind the IT-passport track.' },
  { icon: Globe2, title: 'Languages', meta: 'Japanese N3+ · English',
    desc: 'Communication across cultures — the bridge from caregiving to engineering.' },
  { icon: Feather, title: 'Web Design Studies', meta: 'HTML · CSS · JS',
    desc: 'University assignments and hand-crafted web designs, including this portfolio.' },
  { icon: ScrollText, title: 'AI Fundamentals', meta: 'ML concepts',
    desc: 'The mathematics and intuition behind modern machine learning.' },
  { icon: GraduationCap, title: 'Coursework Archive', meta: 'Assignments',
    desc: 'A curated collection of university projects, notes, and submissions.' },
]

const STATUS_DOT: Record<ModuleStatus, string> = {
  done: 'bg-emerald-400',
  active: 'bg-amber-400 animate-pulse',
  locked: 'bg-gray-500/60',
}

function CurriculumCard({ item, i, wide = false }: { item: Curriculum; i: number; wide?: boolean }) {
  const Icon = item.icon
  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: i * 0.08 }}
      className={`flex flex-col rounded-2xl border p-6 backdrop-blur-md ${wide ? 'sm:col-span-2' : ''}`}
      style={{
        borderColor: `${item.accent}44`,
        background: 'linear-gradient(160deg, rgba(28,28,40,0.55), rgba(18,16,22,0.6))',
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: item.accent }}>{item.tag}</p>
          <h3 className="mt-1 text-lg text-[#f3ead6]" style={{ fontFamily: 'Georgia, serif' }}>{item.title}</h3>
          <p className="mt-1 text-xs text-[#cfc4ad]/60">{item.school}</p>
        </div>
        {item.logo ? (
          <span className="flex h-12 shrink-0 items-center rounded-xl bg-white px-2.5 shadow-sm" style={{ border: `1px solid ${item.accent}55` }}>
            <img src={SITE.asset(item.logo)} alt={item.school.split(' · ')[0]} className="h-8 w-auto max-w-[120px] object-contain" loading="lazy" decoding="async" />
          </span>
        ) : (
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ border: `1px solid ${item.accent}55`, color: item.accent }}>
            <Icon size={22} strokeWidth={1.4} />
          </span>
        )}
      </div>

      <ul className="mb-5 space-y-2">
        {item.modules.map((m) => (
          <li key={m.name} className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[#cfc4ad]/80">
            <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT[m.status]}`} />
            {m.name}
            {m.handsOn && (
              <span className="whitespace-nowrap rounded-full border px-2 py-px text-[10px] uppercase tracking-wider"
                style={{ borderColor: `${item.accent}66`, color: item.accent }}>
                Hands-on project
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        {item.progress === undefined ? (
          <p className="flex items-center gap-2 text-xs" style={{ color: item.accent }}>
            <span className="h-2 w-2 animate-pulse rounded-full" style={{ background: item.accent }} />
            Studying now · {item.modules.length} modules
          </p>
        ) : (
          <>
            <div className="mb-1 flex justify-between text-xs text-[#cfc4ad]/70">
              <span>{item.progress === 100 ? 'Completed' : 'Progress'}</span>
              <span>{item.progress}%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${item.progress}%`, background: item.accent }} />
            </div>
          </>
        )}
      </div>
    </motion.article>
  )
}

function VolumeCard({ item, i }: { item: Collection; i: number }) {
  const Icon = item.icon
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border p-7 backdrop-blur-md"
      style={{
        borderColor: 'rgba(200,160,74,0.22)',
        background: 'linear-gradient(160deg, rgba(28,28,40,0.55), rgba(18,16,22,0.6))',
      }}
    >
      <span className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
      <span className="mb-5 grid h-14 w-14 place-items-center rounded-xl" style={{ border: `1px solid ${GOLD}55`, background: 'rgba(200,160,74,0.08)', color: PARCHMENT }}>
        <Icon size={26} strokeWidth={1.4} />
      </span>
      <p className="mb-1 text-[11px] uppercase tracking-[0.25em]" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>{item.meta}</p>
      <h3 className="mb-2 text-xl text-[#f3ead6]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>{item.title}</h3>
      <p className="text-sm leading-relaxed text-[#cfc4ad]/75">{item.desc}</p>
    </motion.div>
  )
}

export default function StudyingLibrary() {
  return (
    // dark-scope + .studying-room: the reading room stays dark in light theme too,
    // so the parchment text and dark glass cards keep their contrast.
    <section
      id="studying"
      className="studying-room dark-scope relative overflow-hidden py-16 sm:py-24"
    >
      <div className="pointer-events-none absolute inset-0"
           style={{ background: 'radial-gradient(120% 90% at 50% 120%, rgba(120,80,40,0.10), transparent 60%)' }} />

      <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mb-10 text-center sm:mb-12">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
            Bibliotheca · Studii
          </p>
          <h2 className="mt-3 text-3xl text-[#f3ead6] sm:text-4xl" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            The Personal Library
          </h2>
          <div className="mx-auto mt-4 h-px w-24" style={{ background: GOLD }} />
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-[#cfc4ad]/70 sm:text-base">
            The “what” in my story — NCC Diploma modules, IBM AI certifications, and self-study that
            followed the path laid out in my{' '}
            <Link to="/bibliography" className="text-[#e8dcc0] underline-offset-2 hover:underline">My Journey</Link>
            {' '}and applied through{' '}
            <Link to="/python" className="text-[#e8dcc0] underline-offset-2 hover:underline">Python Automation</Link>.
          </p>
        </div>

        {/* Stats bar: 3 equal columns, compressed on xs */}
        <div className="mb-12 grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center backdrop-blur-sm sm:gap-4 sm:p-6">
          {STATS.map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-2xl font-bold text-[#f3ead6] sm:text-3xl" style={{ fontFamily: 'Georgia, serif' }}>{s.value}</p>
              <p className="mt-1 text-[10px] leading-tight text-[#cfc4ad]/60 sm:text-xs">{s.label}</p>
            </div>
          ))}
        </div>

        <h3 className="mb-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#cfc4ad]/60 sm:mb-6 sm:text-sm">Current curriculum</h3>
        {/* NCC diplomas first, with how they are assessed right beneath them */}
        <div className="grid gap-5 sm:grid-cols-2">
          {NCC_TRACKS.map((c, i) => <CurriculumCard key={c.title} item={c} i={i} />)}
        </div>
        <motion.aside
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5 }}
          aria-label="How the NCC diplomas are assessed"
          className="my-5 flex gap-4 rounded-2xl border p-5 sm:p-6"
          style={{ borderColor: `${GOLD}44`, background: 'linear-gradient(160deg, rgba(48,38,22,0.82), rgba(18,16,22,0.82))' }}
        >
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ border: `1px solid ${GOLD}66`, color: GOLD }}>
            <ClipboardCheck size={20} strokeWidth={1.5} aria-hidden />
          </span>
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: GOLD }}>How NCC L4 &amp; L5 are assessed</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[#f3ead6]/90">{NCC_ASSESSMENT}</p>
          </div>
        </motion.aside>

        {/* Other tracks — 2-col from sm; an odd last track spans the full row */}
        <div className="mb-14 grid gap-5 sm:grid-cols-2">
          {OTHER_TRACKS.map((c, i) => (
            <CurriculumCard key={c.title} item={c} i={i}
              wide={OTHER_TRACKS.length % 2 === 1 && i === OTHER_TRACKS.length - 1} />
          ))}
        </div>

        <h3 className="mb-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#cfc4ad]/60 sm:mb-6 sm:text-sm">Reading room shelves</h3>
        <div className="mb-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c, i) => <VolumeCard key={c.title} item={c} i={i} />)}
        </div>

        <h3 className="mb-5 text-center text-[11px] uppercase tracking-[0.25em] text-[#cfc4ad]/60 sm:mb-6 sm:text-sm">Assignment showcase</h3>
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          {ASSIGNMENTS.map((a) => {
            const Icon = a.icon
            return (
              <div key={a.title} className="flex gap-4 rounded-xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-[#c8a04a] sm:h-12 sm:w-12"
                  style={{ background: 'rgba(200,160,74,0.1)' }}
                >
                  <Icon size={20} />
                </span>
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-widest text-[#c8a04a]/80">{a.module}</p>
                  <h4 className="mt-0.5 text-sm font-semibold text-[#f3ead6] sm:text-base">{a.title}</h4>
                  <p className="mt-1 text-xs leading-relaxed text-[#cfc4ad]/70 sm:text-sm">{a.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        <JourneyCrosslink current="studying" />
      </div>
    </section>
  )
}
