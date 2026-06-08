import { motion } from 'framer-motion'
import { Landmark, BookOpen, Globe2, Feather, GraduationCap, ScrollText } from 'lucide-react'

/**
 * StudyingLibrary — "World-Famous University Library" theme:
 * Modern Dark Academia × high-end UI. Elegant serif type, sophisticated
 * glassmorphism, deep wood/navy/parchment palette, classic academic icons.
 *
 * Edit COLLECTIONS with your real study areas / assignment pages.
 */
const PARCHMENT = '#e8dcc0'
const GOLD = '#c8a04a'

const COLLECTIONS = [
  { icon: Landmark,      title: 'System Architecture', meta: 'OOSAD · DDOOCP',
    desc: 'Object-oriented analysis, design patterns, and disciplined software architecture.' },
  { icon: BookOpen,      title: 'Algorithms & FE',     meta: 'Fundamental Engineering',
    desc: 'Data structures, complexity, and the fundamentals behind the IT-passport track.' },
  { icon: Globe2,        title: 'Languages',           meta: 'Japanese N3+ · English',
    desc: 'Communication arts across cultures — the bridge from caregiving to engineering.' },
  { icon: Feather,       title: 'Web Design Studies',  meta: 'HTML · CSS · JS',
    desc: 'University assignments and hand-crafted web designs, refined over time.' },
  { icon: ScrollText,    title: 'AI Fundamentals',     meta: 'ML concepts',
    desc: 'The mathematics and intuition behind modern machine learning.' },
  { icon: GraduationCap, title: 'Coursework Archive',  meta: 'Assignments',
    desc: 'A curated collection of university projects, notes, and submissions.' },
]

function VolumeCard({ item, i }) {
  const Icon = item.icon
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: i * 0.07 }}
      whileHover={{ y: -5 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border p-7 backdrop-blur-md transition-all"
      style={{
        borderColor: 'rgba(200,160,74,0.22)',
        background: 'linear-gradient(160deg, rgba(28,28,40,0.55), rgba(18,16,22,0.6))',
        boxShadow: '0 20px 50px rgba(0,0,0,0.45)',
      }}
    >
      {/* gold top rule */}
      <span className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />

      <span
        className="mb-5 grid h-14 w-14 place-items-center rounded-xl transition-transform group-hover:scale-105"
        style={{ border: `1px solid ${GOLD}55`, background: 'rgba(200,160,74,0.08)', color: PARCHMENT }}
      >
        <Icon size={26} strokeWidth={1.4} />
      </span>

      <p className="mb-1 text-[11px] uppercase tracking-[0.25em]" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
        {item.meta}
      </p>
      <h3 className="mb-2 text-xl text-[#f3ead6]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
        {item.title}
      </h3>
      <p className="text-sm leading-relaxed text-[#cfc4ad]/75">{item.desc}</p>

      <span className="mt-5 inline-flex items-center gap-2 text-sm transition-colors" style={{ color: GOLD }}>
        Open volume
        <span className="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </motion.a>
  )
}

export default function StudyingLibrary() {
  return (
    <section
      id="studying"
      className="relative overflow-hidden py-24"
      style={{ background: 'radial-gradient(70% 60% at 50% 0%, rgba(40,30,60,0.5), transparent 70%), #0c0a10' }}
    >
      {/* subtle "wood/parchment" warm vignette */}
      <div className="pointer-events-none absolute inset-0"
           style={{ background: 'radial-gradient(120% 90% at 50% 120%, rgba(120,80,40,0.10), transparent 60%)' }} />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="text-xs uppercase tracking-[0.35em]" style={{ color: GOLD, fontFamily: 'Georgia, serif' }}>
            Bibliotheca · Studii
          </p>
          <h2 className="mt-3 text-4xl text-[#f3ead6]" style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}>
            The Personal Library
          </h2>
          <div className="mx-auto mt-4 h-px w-24" style={{ background: GOLD }} />
          <p className="mx-auto mt-4 max-w-xl text-[#cfc4ad]/70">
            A curated reading room of study, research, and the long apprenticeship from
            healthcare into engineering.
          </p>
        </div>

        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c, i) => <VolumeCard key={c.title} item={c} i={i} />)}
        </div>
      </div>
    </section>
  )
}
