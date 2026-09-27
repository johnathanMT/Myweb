import { ExternalLink, Globe } from 'lucide-react'
import { SITE } from '../config/site'
import { CLIENT_PROJECTS, type ClientProject } from '../data/clientProjects'

/**
 * ClientProjects — live production sites built for real clients, shown as
 * browser-framed preview cards with a prominent "Visit Live Site" action.
 * Every outbound link opens in a new tab with rel="noopener noreferrer".
 */
function ClientCard({ project }: { project: ClientProject }) {
  const host = new URL(project.url).hostname.replace(/^www\./, '')
  return (
    <article className="glass-card group flex flex-col overflow-hidden">
      {/* browser-framed live preview (the image is a duplicate link, so it's skipped by keyboard/AT) */}
      <a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={-1}
        aria-hidden="true"
        className="client-preview block"
      >
        <div className="client-chrome">
          <span className="client-dots" aria-hidden><i /><i /><i /></span>
          <span className="client-url"><Globe size={11} aria-hidden /> {host}</span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden">
          <img
            src={SITE.asset(project.thumb)}
            alt=""
            width={960}
            height={600}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
          <span className="client-live"><span className="client-live-dot" /> Live</span>
        </div>
      </a>

      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{project.kind}</p>
          <h3 className="mt-2 text-xl font-bold text-fg sm:text-2xl">{project.name}</h3>
          {project.localName && (
            <p lang="my" className="mt-1 text-sm text-muted">{project.localName}</p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-muted">{project.description}</p>

        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Highlights">
          {project.highlights.map((h) => (
            <li key={h} className="flex items-center gap-1.5"><span className="node-dot" aria-hidden />{h}</li>
          ))}
        </ul>

        <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((tag) => (
            <li key={tag} className="tech-tag">{tag}</li>
          ))}
        </ul>

        <div className="mt-auto flex flex-wrap items-center gap-3 pt-2">
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            aria-label={`Visit ${project.name} live site (opens in a new tab)`}
          >
            Visit Live Site <ExternalLink size={15} aria-hidden />
          </a>
          <span className="font-mono text-xs text-muted">{host}</span>
        </div>
      </div>
    </article>
  )
}

export default function ClientProjects() {
  return (
    <section id="client-work" className="relative py-20 sm:py-24" aria-labelledby="client-work-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">// Live in production</p>
        <h2 id="client-work-title" className="section-title mt-3">Client Work</h2>
        <p className="section-subtitle">Real businesses, real customers — websites I designed and built, running today.</p>

        <div className="grid gap-6 lg:grid-cols-2">
          {CLIENT_PROJECTS.map((p) => <ClientCard key={p.id} project={p} />)}
        </div>
      </div>
    </section>
  )
}
