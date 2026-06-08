import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Compass, HeartHandshake, BookMarked, GraduationCap, Terminal, Code2, Cpu } from 'lucide-react'

/**
 * Bibliography — a vertical chronological timeline of the journey, whose visual
 * language MORPHS from "Vintage" (sepia, serif, classic icons) at the top to
 * "Cyber-Modern" (neon glow, mono, tech icons) at the present day.
 *
 * The central line "lights up" as you scroll (Framer Motion useScroll), and each
 * entry reveals with an era-appropriate animation.
 *
 * Edit TIMELINE with your real milestones.  Requires framer-motion + lucide-react.
 */
const TIMELINE = [
  { year: '2018', era: 'vintage',    icon: Compass,        title: 'Arrival in Japan',
    text: 'A new country, a new language. The first chapter — uncertain but determined.' },
  { year: '2019', era: 'vintage',    icon: HeartHandshake, title: 'Caregiver · Kaigo',
    text: 'Years of caregiving taught patience, resilience, and deep attention to people.' },
  { year: '2022', era: 'transition', icon: BookMarked,     title: 'First Lines of Code',
    text: 'Self-taught HTML, CSS, and JavaScript in the quiet hours between shifts.' },
  { year: '2023', era: 'transition', icon: GraduationCap,  title: 'IT Student',
    text: 'Formal study begins — algorithms, OOSAD, and software fundamentals.' },
  { year: '2024', era: 'cyber',      icon: Terminal,       title: 'Python & Automation',
    text: 'Writing tools that automate the boring parts. Code as leverage.' },
  { year: '2025', era: 'cyber',      icon: Code2,          title: 'Full-Stack Builder',
    text: 'React + .NET + cloud. Shipping real, end-to-end products.' },
  { year: '2026', era: 'cyber',      icon: Cpu,            title: 'Aspiring AI Engineer',
    text: 'The present — building with AI, and architecting whatever comes next.' },
]

// Era → styling tokens
const ERA = {
  vintage: {
    accent: '#c8a04a', ring: 'rgba(200,160,74,0.5)',
    card: 'linear-gradient(160deg, rgba(40,34,24,0.6), rgba(24,20,14,0.7))',
    border: 'rgba(200,160,74,0.28)', font: 'Georgia, "Times New Roman", serif',
    filter: 'sepia(0.35) saturate(0.9)', glow: 'none',
  },
  transition: {
    accent: '#9d8bd8', ring: 'rgba(157,139,216,0.55)',
    card: 'linear-gradient(160deg, rgba(34,30,46,0.6), rgba(18,16,26,0.7))',
    border: 'rgba(157,139,216,0.3)', font: 'system-ui, sans-serif',
    filter: 'none', glow: '0 0 18px rgba(157,139,216,0.25)',
  },
  cyber: {
    accent: '#00e5ff', ring: 'rgba(0,229,255,0.6)',
    card: 'linear-gradient(160deg, rgba(10,22,30,0.6), rgba(6,12,18,0.72))',
    border: 'rgba(0,229,255,0.32)', font: '"Fira Code", ui-monospace, monospace',
    filter: 'none', glow: '0 0 22px rgba(0,229,255,0.35)',
  },
}

function Entry({ item, i }) {
  const e = ERA[item.era]
  const Icon = item.icon
  const left = i % 2 === 0 // alternate sides on desktop
  // vintage fades/scales up; cyber slides in from its side with a glow
  const fromX = item.era === 'cyber' ? (left ? -40 : 40) : 0

  return (
    <div className="relative flex items-center">
      {/* node on the line */}
      <span
        className="absolute left-4 top-6 z-10 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full md:left-1/2"
        style={{ background: '#0a0c12', border: `2px solid ${e.ring}`, boxShadow: e.glow, color: e.accent }}
      >
        <Icon size={16} strokeWidth={item.era === 'vintage' ? 1.5 : 2} />
      </span>

      <motion.article
        initial={{ opacity: 0, y: 30, x: fromX, filter: 'blur(6px)' }}
        whileInView={{ opacity: 1, y: 0, x: 0, filter: 'blur(0px)' }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
        className={`ml-12 w-full rounded-2xl border p-6 backdrop-blur-md md:ml-0 md:w-[44%] ${left ? 'md:mr-auto md:pr-8' : 'md:ml-auto md:pl-8'}`}
        style={{ background: e.card, borderColor: e.border, boxShadow: e.glow === 'none' ? '0 16px 40px rgba(0,0,0,0.4)' : `0 16px 40px rgba(0,0,0,0.4), ${e.glow}` }}
      >
        <span
          className="mb-2 inline-block rounded px-2 py-0.5 text-xs font-semibold tracking-widest"
          style={{ color: e.accent, border: `1px solid ${e.border}`, fontFamily: e.font, filter: e.filter }}
        >
          {item.year}
        </span>
        <h3 className="mb-1.5 text-lg text-white" style={{ fontFamily: e.font }}>{item.title}</h3>
        <p className="text-sm leading-relaxed text-gray-300/80" style={{ filter: e.filter }}>{item.text}</p>
      </motion.article>
    </div>
  )
}

export default function Bibliography() {
  const ref = useRef(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 80%', 'end 60%'] })
  // the progress line fills as you scroll
  const lineScale = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section id="bibliography" className="relative overflow-hidden bg-transparent py-24">
      <div className="mb-16 px-6 text-center">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-light">// chronology</p>
        <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Bibliography</h2>
        <p className="mx-auto mt-2 max-w-xl text-muted">
          A journey told year by year — from analog beginnings to a digital present.
        </p>
      </div>

      <div ref={ref} className="relative mx-auto max-w-5xl px-6">
        {/* base track */}
        <div className="absolute left-4 top-0 h-full w-px -translate-x-1/2 bg-white/10 md:left-1/2" />
        {/* animated fill: sepia (top) → cyan (bottom) */}
        <motion.div
          aria-hidden
          className="absolute left-4 top-0 w-px -translate-x-1/2 origin-top md:left-1/2"
          style={{
            scaleY: lineScale,
            height: '100%',
            background: 'linear-gradient(180deg, #c8a04a 0%, #9d8bd8 45%, #00e5ff 100%)',
            boxShadow: '0 0 14px rgba(0,229,255,0.4)',
          }}
        />

        <div className="space-y-14">
          {TIMELINE.map((item, i) => <Entry key={item.year} item={item} i={i} />)}
        </div>
      </div>
    </section>
  )
}
