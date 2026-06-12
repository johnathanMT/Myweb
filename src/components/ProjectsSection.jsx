import { ArrowUpRight, Star } from 'lucide-react'
import { PROJECTS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

const T = {
  en: { title: 'My Projects', sub: "Things I've built and continue to build." },
  mm: { title: 'ကျွန်တော်၏ ပရောဂျက်များ', sub: 'တည်ဆောက်ထားသောနှင့် တည်ဆောက်ဆဲ ပရောဂျက်များ' },
  jp: { title: '私のプロジェクト', sub: '作ったものと作り続けているもの。' },
  vn: { title: 'Dự án của tôi', sub: 'Những gì tôi đã và đang xây dựng.' },
  ne: { title: 'मेरा परियोजनाहरू', sub: 'मैले बनाएका र बनाउँदै गरेका कुराहरू।' },
  id: { title: 'Proyek Saya', sub: 'Hal-hal yang telah dan sedang saya bangun.' },
}

/** A single sleek project card with a colour-tinted, faceted gradient header. */
function ProjectCard({ project, featured = false }) {
  const c = project.color
  return (
    <a
      href={project.url}
      target={project.ext ? '_blank' : '_self'}
      rel={project.ext ? 'noopener noreferrer' : undefined}
      className={`group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 hover:border-cyan/40 hover:shadow-[0_28px_60px_-18px_rgba(0,229,255,0.25)] ${featured ? 'sm:col-span-2' : ''}`}
    >
      {/* Colour-tinted header with faceted lines + glowing icon */}
      <div
        className={`relative flex items-center justify-center overflow-hidden ${featured ? 'h-44' : 'h-36'}`}
        style={{ background: `radial-gradient(120% 120% at 30% 0%, ${c}33 0%, transparent 60%), linear-gradient(135deg, ${c}22, #0a0a0f)` }}
      >
        {/* faceted geometric line overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{ backgroundImage: `repeating-linear-gradient(118deg, transparent 0 7px, ${c}14 7px 8px)` }}
        />
        {/* glow blob */}
        <div className="absolute -bottom-10 left-1/2 h-28 w-28 -translate-x-1/2 rounded-full blur-3xl"
          style={{ background: `${c}55` }} />
        <i
          className={`${project.icon} relative text-4xl transition-transform duration-300 group-hover:scale-110`}
          style={{ color: c, filter: `drop-shadow(0 0 14px ${c}88)` }}
        />

        {/* badges */}
        <div className="absolute left-4 top-4 flex gap-2">
          {featured && (
            <span className="inline-flex items-center gap-1 rounded-full bg-accent/80 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur">
              <Star size={11} /> Featured
            </span>
          )}
          {project.ext && (
            <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-gray-200 backdrop-blur">
              External
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <h3 className="mb-1 text-lg font-bold text-white transition-colors group-hover:text-accent-light">
          {project.title}
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-muted">{project.desc}</p>
        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors group-hover:text-accent-light">
          Visit
          <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </a>
  )
}

export default function ProjectsSection({ lang }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()   // GSAP ScrollTrigger reveals, synced to the 3D camera

  const featured = PROJECTS.filter((p) => p.featured)
  const rest = PROJECTS.filter((p) => !p.featured)

  return (
    <section id="projects" ref={ref} className="relative overflow-hidden py-24 text-legible">
      {/* crystal-clear: faint tint only, no blur (readability via .text-legible) */}
      <div className="absolute inset-0 bg-black/10 pointer-events-none" />
      {/* section-local cyberpunk glow */}
      <div className="pointer-events-none absolute -top-10 right-10 h-72 w-72 rounded-full bg-purple-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div data-reveal className="mb-12 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// work</p>
          <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-2 text-gray-300">{t.sub}</p>
        </div>

        <div data-reveal className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => <ProjectCard key={p.id} project={p} featured />)}
          {rest.map((p) => <ProjectCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  )
}
