import { motion } from 'framer-motion'
import { Terminal, Cpu, Bot, GitBranch, Database, FileCode2, Zap, Play } from 'lucide-react'

/**
 * PythonAutomation — "Cyber Python" terminal / hacker-IDE aesthetic.
 * Neon-green on deep cyberpunk, terminal-window cards, code-focused icons.
 * Edit TOOLS with your real automation projects.
 *
 * Requires: framer-motion, lucide-react (both already installed).
 */
const NEON = '#22ff88'

const TOOLS = [
  { icon: Bot,       name: 'Auto File Sorter',   cmd: 'python sort_files.py --watch ~/Downloads',
    desc: 'Watches a folder and auto-categorises files by type, date, and rules.', tags: ['os', 'watchdog'] },
  { icon: Database,  name: 'Data Scraper',        cmd: 'python scrape.py --site target --out data.csv',
    desc: 'Collects and cleans structured data from web pages into tidy CSVs.', tags: ['requests', 'pandas'] },
  { icon: FileCode2, name: 'Report Generator',    cmd: 'python report.py --month 06 --pdf',
    desc: 'Turns raw spreadsheets into formatted PDF reports on a schedule.', tags: ['openpyxl', 'reportlab'] },
  { icon: GitBranch, name: 'Git Batch Tools',     cmd: 'python repo_ops.py --sync --all',
    desc: 'Batch-syncs and tags multiple repositories in one command.', tags: ['gitpython'] },
  { icon: Cpu,       name: 'System Monitor',      cmd: 'python monitor.py --alert cpu>85',
    desc: 'Lightweight CPU/RAM monitor that pings you on threshold breaches.', tags: ['psutil'] },
  { icon: Zap,       name: 'Task Scheduler',      cmd: 'python tasks.py --cron "0 9 * * *"',
    desc: 'A tiny cron-style runner for recurring local automations.', tags: ['schedule'] },
]

function ToolCard({ tool, i }) {
  const Icon = tool.icon
  return (
    <motion.a
      href="#"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.4, delay: i * 0.06 }}
      whileHover={{ y: -6 }}
      className="group relative block overflow-hidden rounded-xl border border-emerald-500/20 bg-[#070d0a]/80 font-mono shadow-lg transition-colors hover:border-emerald-400/60"
      style={{ boxShadow: '0 0 0 1px rgba(34,255,136,0.04)' }}
    >
      {/* terminal title bar */}
      <div className="flex items-center gap-2 border-b border-emerald-500/15 bg-[#0b1410] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
        <span className="ml-2 truncate text-xs text-emerald-300/60">~/automation/{tool.name.toLowerCase().replace(/\s+/g, '_')}.py</span>
      </div>

      {/* body */}
      <div className="p-5">
        <div className="mb-3 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 transition-shadow group-hover:shadow-[0_0_18px_rgba(34,255,136,0.45)]">
            <Icon size={20} />
          </span>
          <h3 className="text-base font-semibold text-emerald-50">{tool.name}</h3>
        </div>

        {/* command line */}
        <div className="mb-3 rounded-md border border-emerald-500/15 bg-black/50 px-3 py-2 text-[12.5px] leading-relaxed">
          <span className="text-emerald-400">$</span>{' '}
          <span className="text-emerald-200/90">{tool.cmd}</span>
          <span className="ml-0.5 inline-block w-2 animate-pulse bg-emerald-400" style={{ height: '1em', verticalAlign: '-2px' }} />
        </div>

        <p className="mb-4 text-sm leading-relaxed text-emerald-100/60" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {tool.desc}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1.5">
            {tool.tags.map((t) => (
              <span key={t} className="rounded border border-emerald-500/25 px-2 py-0.5 text-[11px] text-emerald-300/80">
                {t}
              </span>
            ))}
          </div>
          <span className="flex items-center gap-1 text-xs text-emerald-300 opacity-0 transition-opacity group-hover:opacity-100">
            <Play size={13} /> run
          </span>
        </div>
      </div>

      {/* scanning glow line on hover */}
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-px -translate-y-full bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-transform duration-700 group-hover:translate-y-[200px]"
        style={{ boxShadow: `0 0 12px ${NEON}` }}
      />
    </motion.a>
  )
}

export default function PythonAutomation() {
  return (
    <section
      id="python-automation"
      className="relative overflow-hidden py-24"
      style={{ background: 'radial-gradient(80% 60% at 50% 0%, rgba(212, 175, 55,0.08), transparent 70%), #04070a' }}
    >
      {/* faint matrix grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage: 'linear-gradient(rgba(34,255,136,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(34,255,136,0.05) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, #000 40%, transparent 80%)',
        }}
      />
      <div className="relative mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center font-mono">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">// python.automation</p>
          <h2 className="mt-2 text-3xl font-bold text-emerald-50 sm:text-4xl">
            <span className="text-emerald-400">&gt;_</span> Cyber Python Tools
          </h2>
          <p className="mt-2 text-sm text-emerald-100/50" style={{ fontFamily: 'system-ui' }}>
            Scripts I built to automate the boring parts.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((t, i) => <ToolCard key={t.name} tool={t} i={i} />)}
        </div>
      </div>
    </section>
  )
}
