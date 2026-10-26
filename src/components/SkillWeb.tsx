import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { SKILLS, SKILL_SECTORS } from '../data/content'

/**
 * SkillWeb — Core Competencies as a spider web.
 *
 * md+: a square stage. Six sectors radiate from a "Core Stack" hub, four skill
 * nodes each (two on an inner ring, two on an outer ring), tied together by the
 * sector's colourful threads in one SVG (viewBox 0–100, so node positions
 * are plain percentages). Hovering or focusing a node lights its sector and
 * shows the case studies that prove it.
 * Phones: the web would be too small to read, so each sector becomes a card.
 */
type Skill = (typeof SKILLS)[number]
type TechSkill = Extract<Skill, { sector: string }>

const TECH = SKILLS.filter((s): s is TechSkill => 'sector' in s)

const INNER_R = 25
const OUTER_R = 40
const INNER_SPREAD = 15 // degrees either side of the sector's centre line
const OUTER_SPREAD = 19

const rad = (deg: number) => (deg * Math.PI) / 180
const point = (r: number, deg: number) => ({ x: 50 + r * Math.cos(rad(deg)), y: 50 + r * Math.sin(rad(deg)) })

interface PlacedNode { skill: TechSkill; x: number; y: number; sector: number; color: string }

/** Lay every tech skill onto the web: sector k is centred at -90° + 60°·k (clockwise from the top). */
function layout(): { nodes: PlacedNode[]; threads: [PlacedNode | 'hub', PlacedNode, number][] } {
  const nodes: PlacedNode[] = []
  const threads: [PlacedNode | 'hub', PlacedNode, number][] = []
  SKILL_SECTORS.forEach((sec, k) => {
    const c = -90 + 60 * k
    const members = TECH.filter((s) => s.sector === sec.id)
    const slots = [
      point(INNER_R, c - INNER_SPREAD), point(INNER_R, c + INNER_SPREAD),
      point(OUTER_R, c - OUTER_SPREAD), point(OUTER_R, c + OUTER_SPREAD),
    ]
    const placed = members.slice(0, 4).map((skill, i) => ({ skill, ...slots[i], sector: k, color: sec.color }))
    nodes.push(...placed)
    const [a, b, c2, d] = placed
    if (a) threads.push(['hub', a, k])
    if (b) threads.push(['hub', b, k])
    if (a && b) threads.push([a, b, k])
    if (a && c2) threads.push([a, c2, k])
    if (b && d) threads.push([b, d, k])
    if (c2 && d) threads.push([c2, d, k])
  })
  return { nodes, threads }
}

const { nodes: NODES, threads: THREADS } = layout()

function NodeMark({ skill, size }: { skill: TechSkill; size: 'web' | 'chip' }) {
  const box = size === 'web' ? 'h-12 w-12' : 'h-9 w-9'
  const img = size === 'web' ? 'h-6 max-w-[34px]' : 'h-[18px] max-w-[26px]'
  const plate = 'plate' in skill && skill.plate
  if ('Icon' in skill && skill.Icon) {
    const Icon = skill.Icon
    return (
      <span className={`grid ${box} place-items-center rounded-full`}
        style={{ color: '#fff', background: `linear-gradient(135deg, ${skill.color}, ${skill.color}b3)`, boxShadow: `0 6px 18px -6px ${skill.color}` }}>
        <Icon size={size === 'web' ? 20 : 15} strokeWidth={1.9} aria-hidden />
      </span>
    )
  }
  const logos = 'logos' in skill ? skill.logos : []
  return (
    <span className={`flex ${box} items-center justify-center gap-0.5 rounded-full border`}
      style={{
        background: plate ? '#fff' : 'rgb(var(--card) / 0.92)',
        borderColor: `${skill.color}66`,
        boxShadow: `0 6px 18px -8px ${skill.color}`,
      }}>
      {logos.map((src) => (
        <img key={src} src={src} alt="" className={`${logos.length > 1 ? 'h-[18px] max-w-[18px]' : img} w-auto object-contain`} loading="lazy" decoding="async" />
      ))}
    </span>
  )
}

function ProofLinks({ skill }: { skill: TechSkill }) {
  if (!('proof' in skill) || !skill.proof) return null
  return (
    <>
      {skill.proof.map(([label, slug]) => (
        <Link key={slug} to={`/projects/${slug}`} className="text-accent-light underline-offset-2 hover:underline">{label} →</Link>
      ))}
    </>
  )
}

export default function SkillWeb() {
  const reduce = useReducedMotion()
  const [active, setActive] = useState<number | null>(null) // sector being explored
  const dim = (k: number) => active !== null && active !== k

  return (
    <>
      {/* ── md+: the web ─────────────────────────────────────────────── */}
      <div className="relative mx-auto hidden aspect-square w-full max-w-[860px] md:block" onMouseLeave={() => setActive(null)}>
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full overflow-visible" aria-hidden>
          {/* threads tying each sector's nodes to the hub and to each other */}
          {THREADS.map(([from, to, k], i) => {
            const a = from === 'hub' ? { x: 50, y: 50 } : from
            return (
              <motion.line key={i} x1={a.x} y1={a.y} x2={to.x} y2={to.y}
                stroke={SKILL_SECTORS[k].color}
                strokeWidth={active === k ? 0.42 : 0.24}
                strokeOpacity={dim(k) ? 0.12 : active === k ? 0.95 : 0.5}
                initial={reduce ? false : { pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.9, delay: 0.15 + k * 0.08 }}
                style={{ transition: 'stroke-opacity .3s, stroke-width .3s' }}
              />
            )
          })}
        </svg>

        {/* hub */}
        <div className="absolute left-1/2 top-1/2 grid h-[15%] w-[15%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border text-center"
          style={{ borderColor: 'rgb(var(--accent) / 0.45)', background: 'radial-gradient(circle, rgb(var(--accent) / 0.28), rgb(var(--card) / 0.95) 70%)', boxShadow: '0 0 40px -6px rgb(var(--accent) / 0.6)' }}>
          <span className="font-mono text-[11px] font-bold uppercase leading-tight tracking-[0.2em] text-accent">Core<br />Stack</span>
        </div>

        {/* sector labels, just outside the web */}
        {SKILL_SECTORS.map((sec, k) => {
          const p = point(47.5, -90 + 60 * k)
          return (
            <span key={sec.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-opacity"
              style={{ left: `${p.x}%`, top: `${p.y}%`, color: sec.color, borderColor: `${sec.color}55`, background: 'rgb(var(--card) / 0.85)', opacity: dim(k) ? 0.35 : 1 }}>
              {sec.name}
            </span>
          )
        })}

        {/* skill nodes */}
        {NODES.map(({ skill, x, y, sector }, i) => (
          // plain wrapper owns the centring transform; framer animates the inner element
          <div
            key={skill.name}
            className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
            style={{ left: `${x}%`, top: `${y}%`, zIndex: active === sector ? 3 : 2, opacity: dim(sector) ? 0.35 : 1, transition: 'opacity .3s' }}
            onMouseEnter={() => setActive(sector)}
            onFocus={() => setActive(sector)}
            tabIndex={0}
            aria-label={skill.name}
          >
            <motion.div
              className="flex flex-col items-center"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: reduce ? 0 : 0.35 + i * 0.03 }}
            >
              <div className="flex flex-col items-center transition-transform duration-300 group-hover:scale-110 group-focus-visible:scale-110">
                <NodeMark skill={skill} size="web" />
                <span className="mt-1.5 whitespace-nowrap text-[11px] font-semibold text-fg">{skill.short}</span>
              </div>
            </motion.div>
            {/* hover card: full name + proof */}
            <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 w-max max-w-[200px] -translate-x-1/2 rounded-lg border px-2.5 py-1.5 text-center text-[11px] opacity-0 shadow-lg transition-opacity duration-200 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100"
              style={{ borderColor: `${skill.color}66`, background: 'rgb(var(--surface) / 0.97)' }}>
              <p className="font-semibold text-fg">{skill.name}</p>
              {'proof' in skill && skill.proof && (
                <p className="mt-0.5 flex flex-wrap justify-center gap-x-2"><span className="text-muted">Used in</span><ProofLinks skill={skill} /></p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ── phones: one card per sector ──────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 md:hidden">
        {SKILL_SECTORS.map((sec) => (
          <div key={sec.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" style={{ borderLeft: `3px solid ${sec.color}` }}>
            <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em]" style={{ color: sec.color }}>{sec.name}</p>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-3">
              {TECH.filter((s) => s.sector === sec.id).map((skill) => (
                <li key={skill.name} className="flex items-center gap-2">
                  <NodeMark skill={skill} size="chip" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold leading-tight text-fg">{skill.short}</span>
                    {'proof' in skill && skill.proof && (
                      <span className="flex flex-wrap gap-x-1.5 text-[10px]"><ProofLinks skill={skill} /></span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  )
}
