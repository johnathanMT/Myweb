import { useEffect, useState } from 'react'
import { GitHubCalendar } from 'react-github-calendar'
import { Github } from 'lucide-react'

/**
 * GitHubActivity — live contribution heatmap for the About page.
 * Data comes from the public github-contributions API used by react-github-calendar.
 */
const USERNAME = 'johnathanMT'
const STATUS = 'NCC Level 5 AI Projects'

// Five levels each, empty → busiest; the light set mirrors the sapphire daylight accent.
const THEME = {
  dark: ['#14213d', '#0e4a7a', '#1670b8', '#38a0ff', '#7dc8ff'],
  light: ['#e2e8f0', '#bfdbfe', '#60a5fa', '#2563eb', '#1d4ed8'],
}

/** Follows <html data-theme> — useTheme() keeps per-instance state, so observe the attribute instead. */
function useDocumentTheme(): 'light' | 'dark' {
  const read = (): 'light' | 'dark' => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark')
  const [theme, setTheme] = useState(read)
  useEffect(() => {
    const obs = new MutationObserver(() => setTheme(read()))
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    return () => obs.disconnect()
  }, [])
  return theme
}

export default function GitHubActivity() {
  const theme = useDocumentTheme()

  return (
    <section id="github-activity" className="relative py-16 sm:py-20" aria-labelledby="github-activity-title">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">// Live from GitHub</p>
        <h2 id="github-activity-title" className="section-title mt-3">GitHub Activity</h2>

        <div className="glass-card mt-8 p-5 sm:p-7">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3.5 py-1.5 text-sm text-accent-light">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan/60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan" />
              </span>
              Currently building: <strong className="font-semibold">{STATUS}</strong>
            </p>
            <a href={`https://github.com/${USERNAME}`} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-accent-light">
              <Github size={15} aria-hidden /> @{USERNAME}
            </a>
          </div>

          {/* the heatmap is wider than a phone — let it scroll sideways instead of squashing */}
          <div className="overflow-x-auto pb-1 text-fg">
            <GitHubCalendar
              username={USERNAME}
              colorScheme={theme}
              theme={THEME}
              blockSize={12}
              blockMargin={4}
              fontSize={13}
              errorMessage="GitHub activity is unavailable right now."
            />
          </div>
        </div>
      </div>
    </section>
  )
}
