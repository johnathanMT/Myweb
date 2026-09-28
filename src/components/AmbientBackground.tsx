/**
 * AmbientBackground — the fixed, theme-aware backdrop behind every page.
 *
 * Layers (all CSS/SVG, no canvas or WebGL, so it costs nothing per frame):
 *   base gradient → drifting aurora glows → neural-network mesh → CS/AI marks → vignette.
 * Colours come from `.ambient-*` rules in index.css, so light/dark reskin it
 * without re-rendering. The mesh is generated once at module load.
 */

// Deterministic PRNG so the constellation is identical on every visit.
function mulberry32(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const W = 1600
const H = 1000
const rand = mulberry32(20260928)
// Jittered grid → even coverage without clumps.
const NODES: [number, number][] = []
for (let gy = 0; gy < 5; gy++) {
  for (let gx = 0; gx < 8; gx++) {
    NODES.push([(gx + 0.15 + rand() * 0.7) * (W / 8), (gy + 0.15 + rand() * 0.7) * (H / 5)])
  }
}
const EDGES: [number, number][] = []
NODES.forEach(([x1, y1], i) => {
  NODES.forEach(([x2, y2], j) => {
    if (j > i && Math.hypot(x2 - x1, y2 - y1) < 250) EDGES.push([i, j])
  })
})
const PULSES = [3, 9, 14, 20, 27, 33, 38]
// "Exalted Mars" — a few crimson threads/nodes hidden in the blue network.
const MARS_EDGE_EVERY = 11
const MARS_PULSES = new Set([14, 33])

export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="ambient-base" />
      <div className="ambient-aurora" />

      <svg className="ambient-mesh" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice">
        <g>
          {EDGES.map(([a, b], k) => (
            <line key={`${a}-${b}`} className={k % MARS_EDGE_EVERY === 5 ? 'mars' : undefined} x1={NODES[a][0]} y1={NODES[a][1]} x2={NODES[b][0]} y2={NODES[b][1]} />
          ))}
        </g>
        <g>
          {NODES.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} />)}
        </g>
        <g>
          {PULSES.map((i, k) => (
            <circle key={i} className={MARS_PULSES.has(i) ? 'pulse mars' : 'pulse'} cx={NODES[i][0]} cy={NODES[i][1]} r={3.2} style={{ animationDelay: `${k * 0.65}s` }} />
          ))}
        </g>
      </svg>

      <AiWatermarks />
      <div className="ambient-vignette" />
    </div>
  )
}

/** Neural net, quantum orbit and code brackets — stroked in currentColor. */
function AiWatermarks() {
  const ink = 'currentColor'
  return (
    <div className="ambient-ink absolute inset-0">
      <svg className="absolute -left-8 top-[10%] h-52 w-52 sm:h-64 sm:w-64" viewBox="0 0 220 220" fill="none" aria-hidden>
        <g stroke={ink} strokeWidth="1">
          <line x1="24" y1="40" x2="110" y2="28" /><line x1="24" y1="40" x2="110" y2="78" /><line x1="24" y1="40" x2="110" y2="128" />
          <line x1="24" y1="110" x2="110" y2="78" /><line x1="24" y1="110" x2="110" y2="128" /><line x1="24" y1="110" x2="110" y2="178" />
          <line x1="24" y1="180" x2="110" y2="128" /><line x1="24" y1="180" x2="110" y2="178" />
          <line x1="110" y1="28" x2="196" y2="70" /><line x1="110" y1="78" x2="196" y2="70" /><line x1="110" y1="78" x2="196" y2="150" />
          <line x1="110" y1="128" x2="196" y2="70" /><line x1="110" y1="128" x2="196" y2="150" /><line x1="110" y1="178" x2="196" y2="150" />
        </g>
        {[[24, 40], [24, 110], [24, 180], [110, 28], [110, 78], [110, 128], [110, 178], [196, 70], [196, 150]].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={ink} />
        ))}
      </svg>

      <svg className="absolute bottom-[18%] right-[6%] hidden h-36 w-36 sm:block" viewBox="0 0 160 160" fill="none" aria-hidden>
        <circle cx="80" cy="80" r="58" stroke={ink} strokeWidth="0.8" />
        <ellipse cx="80" cy="80" rx="58" ry="22" stroke={ink} strokeWidth="0.7" />
        <ellipse cx="80" cy="80" rx="22" ry="58" stroke={ink} strokeWidth="0.7" />
      </svg>

      <svg className="absolute bottom-[28%] left-[8%] h-24 w-24" viewBox="0 0 80 80" fill="none" aria-hidden>
        <path d="M18 14 L8 40 L18 66" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M62 14 L72 40 L62 66" stroke={ink} strokeWidth="1.2" strokeLinecap="round" />
        <path d="M46 12 L34 68" stroke={ink} strokeWidth="1" strokeLinecap="round" />
      </svg>
    </div>
  )
}
