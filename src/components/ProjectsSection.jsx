import { lazy, Suspense } from 'react'
import { PROJECTS } from '../data/content'
import { useCyberReveal } from '../hooks/useCyberReveal'

// Code-split the WebGL gallery so the three.js chunk doesn't block this section.
const WebGLGallery = lazy(() => import('../three/WebGLGallery'))

const T = {
  en: { title: 'My Projects', sub: "Things I've built and continue to build." },
  mm: { title: 'ကျွန်တော်၏ ပရောဂျက်များ', sub: 'တည်ဆောက်ထားသောနှင့် တည်ဆောက်ဆဲ ပရောဂျက်များ' },
  jp: { title: '私のプロジェクト', sub: '作ったものと作り続けているもの。' },
  vn: { title: 'Dự án của tôi', sub: 'Những gì tôi đã và đang xây dựng.' },
  ne: { title: 'मेरा परियोजनाहरू', sub: 'मैले बनाएका र बनाउँदै गरेका कुराहरू।' },
  id: { title: 'Proyek Saya', sub: 'Hal-hal yang telah dan sedang saya bangun.' },
}

/**
 * A borderless project "logo tile": a large glowing icon over a soft colour halo,
 * with the title + short description beneath. No cards, no rigid borders — just
 * the logo floating on the shared glass surface. Hover lifts + intensifies glow.
 */
function ProjectLogo({ project }) {
  const c = project.color
  return (
    <a
      href={project.url}
      target={project.ext ? '_blank' : '_self'}
      rel={project.ext ? 'noopener noreferrer' : undefined}
      className="group relative flex flex-col items-center gap-4 rounded-3xl p-6 text-center transition-transform duration-300 hover:-translate-y-1.5"
    >
      {/* Large glowing logo — colour halo grows on hover, no border. */}
      <span className="relative flex h-28 w-28 items-center justify-center">
        {/* soft colour glow behind the icon */}
        <span
          className="absolute inset-0 rounded-full opacity-60 blur-2xl transition-all duration-300 group-hover:opacity-100 group-hover:scale-110"
          style={{ background: `radial-gradient(circle, ${c}66 0%, transparent 70%)` }}
        />
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

export default function ProjectsSection({ lang }) {
  const t = T[lang] || T.en
  const ref = useCyberReveal()   // GSAP ScrollTrigger reveals, synced to the 3D camera

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

        {/* ── ONE sleek borderless glass container holds everything ──────────── */}
        <div
          data-reveal
          className="relative overflow-hidden rounded-[2.5rem] bg-white/[0.045] p-5 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-8"
        >
          {/* faint top-edge sheen — gives the glass form without a hard border */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />

          {/* Floating WebGL showcase — drag/scroll to glide, click to expand. */}
          <div className="relative mb-4 h-[58vh] w-full overflow-hidden rounded-[1.75rem] bg-black/20">
            <Suspense fallback={<div className="flex h-full items-center justify-center font-mono text-sm text-muted">Loading gallery…</div>}>
              <WebGLGallery />
            </Suspense>
            <span className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[11px] uppercase tracking-[0.25em] text-white/50">
              drag · scroll · click to expand
            </span>
          </div>

          {/* Large borderless project logos */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {PROJECTS.map((p) => <ProjectLogo key={p.id} project={p} />)}
          </div>
        </div>
      </div>
    </section>
  )
}
