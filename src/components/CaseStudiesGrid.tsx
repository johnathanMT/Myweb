import { Link } from 'react-router-dom'
import { ArrowRight, Bot } from 'lucide-react'
import { SITE } from '../config/site'
import { useLang } from '../context/LangContext'
import { CASE_STUDIES, caseCopy } from '../data/caseStudies'
import { caseLabels } from '../data/caseStudyLabels'

/** CaseStudiesGrid — one card per case study, each opening /projects/:slug. */
export default function CaseStudiesGrid() {
  const { lang } = useLang()
  const t = caseLabels(lang)

  return (
    <section id="case-studies" className="relative py-16 sm:py-20" aria-labelledby="case-studies-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">{t.gridKicker}</p>
        <h2 id="case-studies-title" className="section-title mt-3">{t.gridTitle}</h2>
        <p className="section-subtitle">{t.gridSubtitle}</p>

        <ul className="grid gap-6 md:grid-cols-3">
          {CASE_STUDIES.map((c) => {
            const copy = caseCopy(c, lang)
            return (
            <li key={c.slug}>
              <Link
                to={`/projects/${c.slug}`}
                className="glass-card group flex h-full flex-col overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-accent/10">
                  {c.thumb ? (
                    <img src={SITE.asset(c.thumb)} alt="" width={960} height={600} loading="lazy" decoding="async"
                      className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <span className="grid h-full place-items-center text-accent" aria-hidden><Bot size={56} strokeWidth={1.4} /></span>
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">{copy.kind}</p>
                  <h3 className="text-lg font-bold text-fg">{c.name}</h3>
                  <p className="text-sm leading-relaxed text-muted">{copy.summary}</p>
                  <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-accent-light">
                    {t.read} <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                </div>
              </Link>
            </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
