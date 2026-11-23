import type { ReactNode } from 'react'

/**
 * Header line-art. Every motif is a stack of 800×600 layers filling one box.
 * Moving layers are whole <svg> elements, so the compositor does the work.
 * Strokes: k1 bright, k2 mid, k3 faint. Focal point of most motifs: 520,290.
 */
export type HeaderMotif = 'about' | 'projects' | 'stack' | 'lab' | 'gallery' | 'exploring' | 'sanctuary'

interface LayerProps { children: ReactNode; move?: 'spin' | 'spin-back' | 'drift' | 'drift-b'; at?: [number, number]; secs?: number }
function Layer({ children, move, at = [520, 290], secs }: LayerProps) {
  return (
    <svg
      viewBox="0 0 800 600"
      className={`stage-layer ${move ? `mv-${move}` : ''}`}
      style={{ transformOrigin: `${at[0] / 8}% ${at[1] / 6}%`, animationDuration: secs ? `${secs}s` : undefined }}
    >
      {children}
    </svg>
  )
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i)
const f = (n: number) => n.toFixed(1)
const polar = (cx: number, cy: number, r: number, deg: number): [number, number] => {
  const a = (deg * Math.PI) / 180
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
}
/** Radial ticks as one path. */
const ticks = (cx: number, cy: number, r1: number, r2: number, n: number, skip = 0) =>
  range(n).filter((i) => !skip || i % skip).map((i) => {
    const a = polar(cx, cy, r1, (i * 360) / n)
    const b = polar(cx, cy, r2, (i * 360) / n)
    return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`
  }).join('')
/** Dots as filled circles. */
const Dots = ({ at, r = 3 }: { at: [number, number][]; r?: number }) =>
  at.map(([x, y]) => <circle key={`${x}-${y}`} className="dot" cx={x} cy={y} r={r} />)
/** Isometric plate and the sides below it. */
const isoTop = (x: number, y: number, w: number) => `M${x} ${y - w / 2}L${x + w} ${y}L${x} ${y + w / 2}L${x - w} ${y}Z`
const isoSides = (x: number, y: number, w: number, h: number) =>
  `M${x - w} ${y}V${y + h}L${x} ${y + w / 2 + h}L${x + w} ${y + h}V${y}M${x} ${y + w / 2}V${y + w / 2 + h}`

/* ── About: AI engineering — code, chip, agent orchestration ── */
const CHIP_PINS = range(7).map((i) => {
  const y = 245 + i * 15
  const x = 475 + i * 15
  return `M455 ${y}H437M585 ${y}H603M${x} 225V207M${x} 355V373`
}).join('')
function About() {
  return (
    <>
      <Layer>
        <path className="k1" d="M463 225H577a8 8 0 0 1 8 8V347a8 8 0 0 1-8 8H463a8 8 0 0 1-8-8V233a8 8 0 0 1 8-8Z" />
        <path className="k2" d="M475 245H565V335H475ZM475 260L490 245M550 335L565 320" />
        <path className="k1" d={CHIP_PINS} />
        <text x="520" y="299" className="tx is-lg" textAnchor="middle">AI</text>
        {/* traces out to the neighbours */}
        <path className="k2" d="M437 260H390L360 230H300M437 320H400L372 348H318M603 275H650L672 253V190M603 335H640L664 359V420M505 207V160L530 136H580" />
        <Dots at={[[300, 230], [318, 348], [672, 190], [580, 136]]} />
        {/* terminal */}
        <path className="k1" d="M172 165H292a8 8 0 0 1 8 8V262a8 8 0 0 1-8 8H172a8 8 0 0 1-8-8V173a8 8 0 0 1 8-8ZM164 189H300" />
        <Dots at={[[177, 177], [188, 177], [199, 177]]} r={2.5} />
        <path className="k1" d="M212 215L194 230L212 245M252 215L270 230L252 245M239 209L225 251" />
        {/* agent orchestration: a hub handing work to labelled tools */}
        <circle className="k1" cx="664" cy="446" r="26" />
        <path className="k2" d="M664 434V458M652 446H676M640 455L596 478M688 455L728 478M664 472V512" />
        <path className="k2" d="M552 468H596V494H552ZM728 468H772V494H728ZM642 512H686V538H642Z" />
        <text x="574" y="485" className="tx is-sm" textAnchor="middle">plan</text>
        <text x="750" y="485" className="tx is-sm" textAnchor="middle">tool</text>
        <text x="664" y="529" className="tx is-sm" textAnchor="middle">eval</text>
        {/* system architecture */}
        <path className="k2" d="M236 380H316V408H236ZM196 446H266V474H196ZM286 446H356V474H286ZM276 408V427H231V446M276 427H321V446" />
        <path className="k3" d="M231 474V500H321V474M276 500V520" />
      </Layer>
      <Layer move="drift" secs={13}>
        <text x="330" y="112" className="tx">async def agent_step():</text>
        <text x="620" y="92" className="tx is-dim">0xA1</text>
        <text x="398" y="432" className="tx is-dim">await tools.call()</text>
        <text x="640" y="580" className="tx is-dim">0x3F</text>
      </Layer>
      <Layer move="drift-b" secs={17}>
        <text x="612" y="164" className="tx">attn(Q, K, V)</text>
        <text x="372" y="540" className="tx">interface AgentPipeline</text>
        <text x="340" y="182" className="tx is-dim">softmax(QKᵀ/√d)</text>
        <text x="690" y="318" className="tx is-dim">0b1011</text>
      </Layer>
    </>
  )
}

/* ── Projects: enterprise — blueprint, globe, shield, growth, ERP blocks ── */
const BLOCKS: [number, number, number][] = [[420, 376, 54], [512, 422, 34], [328, 422, 26], [420, 468, 20]]
function Projects() {
  return (
    <>
      <Layer>
        <path className="k3" d={range(14).map((i) => `M${260 + i * 40} 60V560`).join('') + range(13).map((i) => `M240 ${80 + i * 40}H800`).join('')} />
        {/* modular ERP blocks, back to front */}
        {BLOCKS.map(([x, y, h]) => (
          <g key={`${x}-${y}`}>
            <path className="fillable" d={`M${x - 46} ${y}L${x} ${y - 23}L${x + 46} ${y}V${y + h}L${x} ${y + 23 + h}L${x - 46} ${y + h}Z`} />
            <path className="k1" d={isoTop(x, y, 46) + isoSides(x, y, 46, h)} />
            <path className="k2" d={isoTop(x, y, 24)} />
          </g>
        ))}
        {/* shield */}
        <path className="k1" d="M390 140L442 158V204C442 240 420 264 390 278C360 264 338 240 338 204V158Z" />
        <path className="k2" d="M390 154L430 168V204C430 233 413 252 390 263C367 252 350 233 350 204V168Z" />
        <path className="k1" d="M372 208L386 222L411 193" />
        {/* growth vectors */}
        <path className="k2" d="M590 400V540H780" />
        <path className="k2" d="M608 540V508H626V540M644 540V488H662V540M680 540V460H698V540M716 540V424H734V540" />
        <path className="k1" d="M600 492L640 470L676 440L712 406L756 372M740 372H756V388" />
        {/* dimension lines */}
        <path className="k2" d="M520 76H720M520 70V82M720 70V82M300 140V278M294 140H306M294 278H306" />
        <text x="620" y="66" className="tx is-sm" textAnchor="middle">SCALE 1 : 1</text>
        {/* global deployment */}
        <circle className="k1" cx="620" cy="236" r="92" />
        <ellipse className="k2" cx="620" cy="236" rx="36" ry="92" />
        <ellipse className="k2" cx="620" cy="236" rx="72" ry="92" />
        <path className="k2" d="M528 236H712M541 190H699M541 282H699" />
        <Dots at={[[584, 190], [656, 236], [604, 282]]} r={4} />
      </Layer>
      <Layer move="spin" at={[620, 236]} secs={80}>
        <circle className="k1" cx="620" cy="236" r="116" strokeDasharray="120 26 8 26" />
        <Dots at={[[736, 236], [504, 236]]} r={4} />
      </Layer>
      <Layer move="spin-back" at={[620, 236]} secs={120}>
        <circle className="k3" cx="620" cy="236" r="136" strokeDasharray="3 9" />
      </Layer>
    </>
  )
}

/* ── Stack: exploded layers, circuit paths, API / database / cloud ── */
const PLATES: [string, number][] = [['DATA', 420], ['DOMAIN', 340], ['API', 260], ['UI', 180]]
function Stack() {
  return (
    <>
      <Layer>
        {/* circuit pathways */}
        <path className="k2" d="M320 180H260L230 150H150M320 260H240L214 286H120M320 340H256L226 370H150M320 420H280L250 450H180" />
        <Dots at={[[150, 150], [120, 286], [150, 370], [180, 450]]} />
        <path className="k3" d="M320 220H200V110M320 380H210V520M640 220H700V120M640 380H720V540" />
        {/* database */}
        <path className="k1" d="M690 400C690 388 770 388 770 400V470C770 482 690 482 690 470ZM690 400C690 412 770 412 770 400M690 424C690 436 770 436 770 424M690 447C690 459 770 459 770 447" />
        <path className="k2" d="M640 420H690M720 168V260H640" />
        {/* cloud */}
        <path className="k1" d="M690 168a20 20 0 0 1 2-40a28 28 0 0 1 53-4a22 22 0 0 1 9 44Z" />
        <text x="214" y="236" className="tx is-lg" textAnchor="middle">{'{ API }'}</text>
        <text x="196" y="412" className="tx is-sm">GET /v1/agents</text>
        <path className="k3" d="M320 180V420M640 180V420M480 260V500" strokeDasharray="4 6" />
      </Layer>
      {PLATES.map(([label, y], i) => (
        <Layer key={label} move={i % 2 ? 'drift-b' : 'drift'} secs={11 + i * 2}>
          <path className="k1 fillable" d={isoTop(480, y, 160)} />
          <path className="k2" d={isoSides(480, y, 160, 10)} />
          <path className="k3" d={isoTop(480, y, 118)} />
          <text x="480" y={y + 48} className="tx is-sm" textAnchor="middle">{label}</text>
        </Layer>
      ))}
    </>
  )
}

/* ── Lab: quantum orbitals, interference, formulae ── */
const wave = (y: number, amp: number, len: number, phase: number) =>
  range(121).map((i) => {
    const x = 60 + i * 6
    const env = Math.exp(-(((x - 440) / 260) ** 2))
    return `${i ? 'L' : 'M'}${f(x)} ${f(y + amp * env * Math.sin((x / len) * Math.PI * 2 + phase))}`
  }).join('')
function Lab() {
  return (
    <>
      <Layer>
        <path className="k3" d="M200 420H780M200 340H780M320 540V80M400 540V80M640 540V80M720 540V80" strokeDasharray="2 8" />
        <path className="k2" d="M240 540V80M232 92L240 80L248 92M200 500H780M768 492L780 500L768 508" />
        <text x="252" y="98" className="tx is-sm">Im ψ</text>
        <text x="742" y="524" className="tx is-sm">Re ψ</text>
        <circle className="k1" cx="540" cy="250" r="16" />
        <circle className="dot" cx="540" cy="250" r="7" />
        <circle className="k3" cx="540" cy="250" r="190" />
        <path className="k2" d={ticks(540, 250, 184, 194, 72)} />
      </Layer>
      {[0, 60, 120].map((a, i) => (
        <Layer key={a} move={i % 2 ? 'spin-back' : 'spin'} at={[540, 250]} secs={46 + i * 18}>
          <g transform={`rotate(${a} 540 250)`}>
            <ellipse className="k1" cx="540" cy="250" rx="160" ry="54" />
            <circle className="dot" cx="700" cy="250" r="5" />
          </g>
        </Layer>
      ))}
      <Layer move="drift" secs={12}>
        <path className="k1" d={wave(500, 34, 58, 0)} />
        <path className="k2" d={wave(500, 34, 66, 1.4)} />
        <path className="k3" d={wave(500, 52, 74, 2.6)} />
        <text x="288" y="172" className="tx is-xl">ψ</text>
        <text x="724" y="430" className="tx is-xl">∑</text>
      </Layer>
      <Layer move="drift-b" secs={16}>
        <text x="738" y="120" className="tx is-xl">∇</text>
        <text x="290" y="380" className="tx is-xl">∫</text>
        <text x="256" y="262" className="tx">iħ ∂ψ/∂t = Ĥψ</text>
        <text x="262" y="452" className="tx is-dim">|0⟩ + |1⟩</text>
      </Layer>
    </>
  )
}

/* ── Gallery: viewfinder, aperture, editorial framing ── */
const BLADES = range(8).map((i) => {
  const a = polar(540, 300, 150, i * 45)
  const b = polar(540, 300, 62, i * 45 + 68)
  return `M${f(a[0])} ${f(a[1])}L${f(b[0])} ${f(b[1])}`
}).join('')
const IRIS = `${range(8).map((i) => {
  const p = polar(540, 300, 62, i * 45 + 23)
  return `${i ? 'L' : 'M'}${f(p[0])} ${f(p[1])}`
}).join('')}Z`
function Gallery() {
  return (
    <>
      <Layer>
        <path className="k1 is-heavy" d="M300 150V100H360M720 100H780V150M780 450V500H720M360 500H300V450" />
        <path className="k3" d="M460 100V500M620 100V500M300 233H780M300 367H780" />
        <path className="k2" d="M300 100H780V500H300Z" strokeDasharray="2 10" />
        <path className="k1" d="M526 300H554M540 286V314" />
        <circle className="k1" cx="540" cy="300" r="150" />
        <circle className="k2" cx="540" cy="300" r="172" />
        {/* editorial margins */}
        <path className="k2" d="M220 130H280M220 142H262M220 470H280M220 482H250" />
        <path className="k3" d="M200 60V540M188 60H212M188 540H212" />
        <text x="300" y="84" className="tx is-sm">ƒ/1.4 · 1/250 · ISO 100</text>
        <text x="780" y="528" className="tx is-sm" textAnchor="end">35 mm — FRAME 24A</text>
        <Dots at={[[762, 80]]} r={4} />
      </Layer>
      <Layer move="spin" at={[540, 300]} secs={110}>
        <path className="k2" d={ticks(540, 300, 160, 168, 60)} />
        <path className="k1" d={BLADES} />
        <path className="k1" d={IRIS} />
      </Layer>
      <Layer move="spin-back" at={[540, 300]} secs={150}>
        <circle className="k3" cx="540" cy="300" r="112" strokeDasharray="30 14 4 14" />
      </Layer>
    </>
  )
}

/* ── Exploring: astrolabe, compass, horizon ── */
const STARS = [[250, 120], [300, 210], [222, 300], [380, 90], [690, 70], [744, 150], [766, 330], [330, 360], [640, 80], [300, 420]]
function Exploring() {
  return (
    <>
      <Layer>
        {/* horizon */}
        <path className="k2" d="M120 470H800" />
        <path className="k3" d={range(13).map((i) => `M520 470L${-80 + i * 100} 600`).join('') + [484, 504, 532, 570].map((y) => `M120 ${y}H800`).join('')} />
        {STARS.map(([x, y], i) => (
          <path key={x * y} className={i % 3 ? 'k2' : 'k1'} d={`M${x} ${y - 7}V${y + 7}M${x - 7} ${y}H${x + 7}`} />
        ))}
        <path className="k3" d="M250 120L300 210L222 300M300 210L380 90M690 70L744 150L766 330" />
        <text x="236" y="102" className="tx is-sm">α 05h 34m</text>
        <text x="716" y="178" className="tx is-sm">δ +22°</text>
        <text x="600" y="460" className="tx is-sm">35.68° N · 139.69° E</text>
        {/* compass rose */}
        <path className="k1 fillable" d="M540 150L554 246L640 260L554 274L540 370L526 274L440 260L526 246Z" />
        <path className="k2" d="M540 150V370M440 260H640M540 260L588 212M540 260L588 308M540 260L492 308M540 260L492 212" />
        <circle className="k1" cx="540" cy="260" r="150" />
        <text x="540" y="140" className="tx is-sm" textAnchor="middle">N</text>
      </Layer>
      <Layer move="spin" at={[540, 260]} secs={140}>
        <path className="k2" d={ticks(540, 260, 150, 160, 120, 5)} />
        <path className="k1" d={ticks(540, 260, 148, 166, 24)} />
        <circle className="k2" cx="540" cy="260" r="166" />
      </Layer>
      <Layer move="spin-back" at={[540, 260]} secs={95}>
        {/* ecliptic ring, off centre like a real astrolabe rete */}
        <circle className="k1" cx="540" cy="226" r="84" />
        <circle className="k3" cx="540" cy="226" r="76" />
        <path className="k2" d="M624 226L680 246M456 226L400 206" />
        <Dots at={[[680, 246], [400, 206]]} r={4} />
      </Layer>
      <Layer move="spin" at={[540, 260]} secs={200}>
        <ellipse className="k3" cx="540" cy="260" rx="200" ry="70" strokeDasharray="60 10 4 10" />
      </Layer>
    </>
  )
}

/* ── Sanctuary: nested arcs, a lotus, a few still stars ── */
function Sanctuary() {
  return (
    <>
      <Layer>
        {[120, 190, 270, 360].map((r, i) => (
          <path key={r} className={i % 2 ? 'k3' : 'k2'} d={`M${400 - r} 400A${r} ${r} 0 0 1 ${400 + r} 400`} />
        ))}
        <path className="k1" d="M400 136C390 150 390 160 400 170C410 160 410 150 400 136ZM400 170C384 166 376 156 373 145C387 148 395 156 400 170ZM400 170C416 166 424 156 427 145C413 148 405 156 400 170Z" />
      </Layer>
      <Layer move="drift" secs={18}>
        <Dots at={[205, 230, 250, 290, 310, 335].map((a): [number, number] => {
          const [x, y] = polar(400, 400, 315, a)
          return [Math.round(x), Math.round(y)]
        })} r={2.5} />
      </Layer>
    </>
  )
}

export const HEADER_MOTIFS: Record<HeaderMotif, () => ReactNode> = {
  about: About, projects: Projects, stack: Stack, lab: Lab, gallery: Gallery, exploring: Exploring, sanctuary: Sanctuary,
}
