import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ExternalLink, Lightbulb, Network, Target, Trophy, UserRound, type LucideIcon } from 'lucide-react'
import { SITE } from '../config/site'
import { caseCopy, type CaseStudy } from '../data/caseStudies'
import { caseLabels } from '../data/caseStudyLabels'

/**
 * CaseStudyLayout — the reusable template behind every /projects/:slug page:
 * hero, then The Problem → My Role → Architecture → Hard Technical Decisions →
 * Results & Learnings. Copy comes from data/caseStudies.ts in the visitor's
 * language (en / mm / jp); labels from data/caseStudyLabels.ts.
 */
function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <section className="glass-card p-6 sm:p-8">
      <h2 className="flex items-center gap-3 font-groovy text-lg font-semibold tracking-wide text-fg sm:text-xl">
        <span className="icon-chip"><Icon size={18} aria-hidden /></span>
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-muted">{children}</div>
    </section>
  )
}

/** Placeholder diagram: the request flow as labelled boxes, until a real diagram is drawn. */
function ArchitectureFlow({ steps, note }: { steps: string[]; note: string }) {
  return (
    <div className="rounded-xl border border-dashed border-accent/40 p-4 sm:p-5">
      <ol className="flex flex-col items-stretch gap-2 md:flex-row md:items-center">
        {steps.map((step, i) => (
          <Fragment key={step}>
            {i > 0 && <ArrowRight size={16} className="mx-auto shrink-0 rotate-90 text-accent md:rotate-0" aria-hidden />}
            <li className="flex-1 rounded-lg border border-white/10 bg-accent/5 px-3 py-2.5 text-center font-mono text-xs text-fg">{step}</li>
          </Fragment>
        ))}
      </ol>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.25em] text-muted/70">{note}</p>
    </div>
  )
}

export default function CaseStudyLayout({ study, lang = 'en' }: { study: CaseStudy; lang?: string }) {
  const copy = caseCopy(study, lang)
  const t = caseLabels(lang)
  // Burmese copy gets lang="my" so screen readers and fonts pick the right script.
  const copyLang = lang === 'mm' ? 'my' : lang === 'jp' ? 'ja' : undefined

  return (
    <article lang={copyLang} className="mx-auto max-w-4xl px-4 pb-24 pt-4 sm:px-6">
      <Link
        to="/projects"
        className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-muted transition-colors hover:bg-accent/10 hover:text-accent-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-light/60"
      >
        <ArrowLeft size={15} aria-hidden /> {t.back}
      </Link>

      {/* hero */}
      <header className="mt-6">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">{t.caseStudy} · {copy.kind}</p>
        <h1 className="section-title mt-3">{study.name}</h1>
        {study.localName && <p lang="my" className="mt-1 text-muted">{study.localName}</p>}
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-muted">{copy.summary}</p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={study.liveUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            {copy.liveLabel} <ExternalLink size={15} aria-hidden />
          </a>
          <ul className="flex flex-wrap gap-1.5" aria-label="Tech stack">
            {study.stack.map((tag) => <li key={tag} className="tech-tag">{tag}</li>)}
          </ul>
        </div>

        {study.thumb && (
          <img
            src={SITE.asset(study.thumb)}
            alt={`${study.name} — homepage`}
            width={960} height={600}
            className="mt-8 w-full rounded-2xl border border-white/10 object-cover object-top shadow-xl"
            decoding="async"
          />
        )}
      </header>

      <div className="mt-10 space-y-6">
        <Section icon={Target} title={t.problem}>
          {copy.problem.map((p) => <p key={p}>{p}</p>)}
        </Section>

        <Section icon={UserRound} title={t.role}>
          {copy.role.map((p) => <p key={p}>{p}</p>)}
        </Section>

        <Section icon={Network} title={t.architecture}>
          <ArchitectureFlow steps={study.architecture} note={t.diagramNote} />
        </Section>

        <Section icon={Lightbulb} title={t.decisions}>
          <ol className="space-y-4">
            {copy.decisions.map((d, i) => (
              <li key={d.title} className="flex gap-3">
                <span className="mt-0.5 font-mono text-sm text-accent">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h3 className="font-semibold text-fg">{d.title}</h3>
                  <p className="mt-1">{d.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        <Section icon={Trophy} title={t.results}>
          <ul className="space-y-2">
            {copy.results.map((r) => (
              <li key={r} className="flex gap-2"><span className="node-dot mt-2 shrink-0" aria-hidden />{r}</li>
            ))}
          </ul>
        </Section>
      </div>
    </article>
  )
}
