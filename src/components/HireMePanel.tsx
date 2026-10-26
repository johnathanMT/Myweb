import { Briefcase, Download, Languages, Linkedin, Mail, MapPin, ShieldCheck } from 'lucide-react'
import { SITE } from '../config/site'
import { HIRE_ME } from '../data/recruiter'

/** HireMePanel — the recruiter-mode "what you need to know" card: roles, location, visa, Japanese, contact. */
export default function HireMePanel() {
  const facts = [
    { Icon: MapPin, label: 'Location', value: HIRE_ME.location },
    { Icon: ShieldCheck, label: 'Visa status', value: HIRE_ME.visa },
    { Icon: Languages, label: 'Japanese', value: HIRE_ME.japanese },
  ]
  const cvHref = HIRE_ME.cvUrl && (/^https?:/.test(HIRE_ME.cvUrl) ? HIRE_ME.cvUrl : SITE.asset(HIRE_ME.cvUrl))

  return (
    <section id="hire-me" className="relative py-16 sm:py-20" aria-labelledby="hire-me-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          <Briefcase size={12} className="mr-2 inline -translate-y-px" aria-hidden />Open to opportunities
        </p>
        <h2 id="hire-me-title" className="section-title mt-3">Hire Me</h2>

        <div className="glass-card mt-8 grid gap-8 p-6 sm:p-8 md:grid-cols-[1.2fr_1fr]">
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-muted">Roles I’m looking for</h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {HIRE_ME.roles.map((r) => (
                <li key={r} className="rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-sm font-medium text-accent-light">{r}</li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              {cvHref ? (
                <a href={cvHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
                  <Download size={15} aria-hidden /> Download CV
                </a>
              ) : null}
              <a href={SITE.mailto} className={cvHref ? 'btn-glass' : 'btn-primary'}>
                <Mail size={15} aria-hidden /> {cvHref ? 'Email me' : 'Email me for my CV'}
              </a>
              <a href={HIRE_ME.linkedin} target="_blank" rel="noopener noreferrer" className="btn-glass">
                <Linkedin size={15} aria-hidden /> LinkedIn
              </a>
            </div>
          </div>

          <dl className="grid gap-3">
            {facts.map(({ Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
                <span className="icon-chip"><Icon size={16} aria-hidden /></span>
                <div>
                  <dt className="text-[11px] uppercase tracking-wider text-muted">{label}</dt>
                  <dd className="font-semibold text-fg">{value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
