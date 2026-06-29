import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { JOURNEY_HUB, JOURNEY_INTRO, type JourneyPage } from '../data/journeyHub'

/** Footer strip on each journey page — links to the other two chapters. */
export default function JourneyCrosslink({ current }: { current: JourneyPage }) {
  const others = JOURNEY_HUB.filter((j) => j.id !== current)

  return (
    <aside className="mx-auto mt-16 max-w-4xl rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm sm:p-8">
      <p className="text-center text-xs uppercase tracking-[0.25em] text-accent-light/80">Connected chapters</p>
      <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-muted">{JOURNEY_INTRO}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {others.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              to={item.path}
              className="group flex flex-col gap-2 rounded-xl border border-white/10 p-5 transition-colors hover:border-white/20 hover:bg-white/[0.04]"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-white">
                <Icon size={16} style={{ color: item.accent }} />
                {item.label}
                <ArrowRight size={14} className="ml-auto opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
              </span>
              <span className="text-sm leading-relaxed text-muted">{item.blurb}</span>
            </Link>
          )
        })}
      </div>
    </aside>
  )
}
