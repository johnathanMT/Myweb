import { PROJECTS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

interface SectionText { title: string; sub: string }
const T: Record<string, SectionText> = {
  en: { title: 'My Projects', sub: "Things I've built and continue to build." },
  mm: { title: 'ကျွန်တော်၏ ပရောဂျက်များ', sub: 'တည်ဆောက်ထားသောနှင့် တည်ဆောက်ဆဲ ပရောဂျက်များ' },
  jp: { title: '私のプロジェクト', sub: '作ったものと作り続けているもの。' },
  vn: { title: 'Dự án của tôi', sub: 'Những gì tôi đã và đang xây dựng.' },
  ne: { title: 'मेरा परियोजनाहरू', sub: 'मैले बनाएका र बनाउँदै गरेका कुराहरू।' },
  id: { title: 'Proyek Saya', sub: 'Hal-hal yang telah dan sedang saya bangun.' },
  zh: { title: '我的项目', sub: '我已构建并持续打造的作品。' },
}

// Shape of a PROJECTS entry (src/data/content is still JS; this mirrors it).
interface Project {
  id: string
  title: string
  desc: string
  icon: string
  color: string
  url: string
  ext: boolean
  featured?: boolean
}

/**
 * A premium, borderless project "logo tile": a large glowing icon over a soft
 * colour halo, title + short caption beneath. No cards, no rigid borders — the
 * logo floats on the shared glass surface. Hover lifts + intensifies the glow.
 */
function ProjectLogo({ project }: { project: Project }) {
  const c = project.color
  return (
    <a
      href={project.url}
      target={project.ext ? '_blank' : '_self'}
      rel={project.ext ? 'noopener noreferrer' : undefined}
      className="group relative flex flex-col items-center gap-4 rounded-3xl p-6 text-center outline-none transition-transform duration-300 hover:-translate-y-1.5 focus-visible:ring-2 focus-visible:ring-white/30"
    >
      <span className="relative flex h-28 w-28 items-center justify-center">
        {/* soft colour glow behind the icon — grows on hover */}
        <span
          className="absolute inset-0 rounded-full opacity-60 blur-2xl transition-all duration-300 group-hover:scale-110 group-hover:opacity-100"
          style={{ background: `radial-gradient(circle, ${c}66 0%, transparent 70%)` }}
        />
        {/* faint glass disc holds the logo without a hard border */}
        <span className="absolute inset-2 rounded-full bg-white/[0.05] backdrop-blur-md" />
        <i
          className={`${project.icon} relative text-6xl transition-transform duration-300 group-hover:scale-110`}
          style={{ color: c, filter: `drop-shadow(0 0 16px ${c}aa)` }}
        />
        {project.featured && (
          <span
            className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full"
            style={{ background: c, boxShadow: `0 0 12px ${c}` }}
            title="Featured"
          />
        )}
      </span>

      <div>
        <h3 className="text-lg font-bold text-white transition-colors group-hover:text-accent-light">
          {project.title}
        </h3>
        <p className="mx-auto mt-1.5 max-w-[22ch] text-sm leading-relaxed text-gray-400">
          {project.desc}
        </p>
      </div>
    </a>
  )
}

export default function ProjectsSection({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()   // GSAP ScrollTrigger reveals

  return (
    <section id="projects" ref={ref} className="relative overflow-hidden py-24 text-legible">
      {/* section-local cyberpunk glow */}
      <div className="pointer-events-none absolute -top-10 right-10 h-72 w-72 rounded-full bg-purple-700/15 blur-[120px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-[120px]" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div data-reveal className="mb-12 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// work</p>
          <h2 className="glow-heading mt-2 text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
          <p className="mt-2 text-gray-300">{t.sub}</p>
        </div>

        {/* ONE sleek borderless glass container holds the premium logo grid. */}
        <div
          data-reveal
          className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.045] p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-10"
        >
          {/* faint top-edge sheen → glass form without a hard border */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {PROJECTS.map((p) => <ProjectLogo key={p.id} project={p} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
