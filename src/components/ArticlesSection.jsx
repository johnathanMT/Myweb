import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import { Heart, Sparkles, ArrowUpRight } from 'lucide-react'
import { api } from '../lib/portfolioApi'

/**
 * ArticlesSection — "Minimalist Reveal" list (inspired by holo.punchred.xyz).
 *
 * Default: a clean, image-less list of titles + interaction stats.
 * Hover:   the article's image elegantly reveals and follows the cursor.
 * Theme:   glassmorphism + cyber ambient (cyan/violet/magenta), dark mode.
 */
export default function ArticlesSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hovered, setHovered] = useState(null)

  const wrapRef = useRef(null)
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const x = useSpring(mx, { stiffness: 220, damping: 26, mass: 0.5 })
  const y = useSpring(my, { stiffness: 220, damping: 26, mass: 0.5 })

  useEffect(() => {
    api.wake()
    ;(async () => {
      try {
        const r = await api.getArticles({ pageSize: 12 })
        setItems(r?.data?.items ?? [])
      } catch (e) { setError(e.message) } finally { setLoading(false) }
    })()
  }, [])

  const onMove = (e) => {
    const rect = wrapRef.current?.getBoundingClientRect()
    if (!rect) return
    mx.set(e.clientX - rect.left)
    my.set(e.clientY - rect.top)
  }

  const blogHref = (id) => `${import.meta.env.BASE_URL}blog.html?id=${id}`
  const preview = (a) => a.imageUrls?.[0] || a.imageUrl
  const reactTotal = (a) => Object.values(a.reactions || {}).reduce((s, n) => s + (n || 0), 0)

  return (
    <section id="articles" ref={wrapRef} onMouseMove={onMove}
      className="relative overflow-hidden bg-transparent py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.3em] text-accent-light">// latest</p>
            <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Articles</h2>
          </div>
          <a href={`${import.meta.env.BASE_URL}blog.html`} className="font-mono text-sm text-accent-light hover:text-cyan">
            All posts →
          </a>
        </div>

        {loading && <p className="font-mono text-muted">Loading…</p>}
        {error && !loading && <p className="font-mono text-coral">Couldn't load articles: {error}</p>}
        {!loading && !error && items.length === 0 && <p className="font-mono text-muted">No articles yet.</p>}

        {/* The minimalist list (frosted, hairline-separated rows) */}
        <ul className="divide-y divide-white/10 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl">
          {items.map((a, i) => {
            const active = hovered?.id === a.id
            return (
              <li key={a.id}>
                <a
                  href={blogHref(a.id)}
                  onMouseEnter={() => setHovered(a)}
                  onMouseLeave={() => setHovered((h) => (h?.id === a.id ? null : h))}
                  className="group flex items-center gap-4 px-5 py-5 transition-colors sm:px-7 sm:py-6"
                >
                  <span className={`font-mono text-xs tabular-nums transition-colors ${active ? 'text-cyan' : 'text-muted'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="min-w-0 flex-1">
                    <h3 className={`truncate text-lg font-semibold transition-colors sm:text-xl ${active ? 'text-cyan' : 'text-white'}`}>
                      {a.title}
                    </h3>
                    <p className="truncate font-mono text-xs text-muted">
                      {a.author}{a.publishedDate ? ` · ${new Date(a.publishedDate).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}` : ''}
                    </p>
                  </div>

                  {/* interaction stats (counts only; full actions live on the article page) */}
                  <div className="flex shrink-0 items-center gap-4 font-mono text-xs text-muted">
                    <span className="inline-flex items-center gap-1"><Heart size={13} /> {a.likeCount || 0}</span>
                    <span className="inline-flex items-center gap-1"><Sparkles size={13} /> {reactTotal(a)}</span>
                    <ArrowUpRight size={16} className={`transition-all ${active ? 'text-cyan -translate-y-0.5 translate-x-0.5' : 'text-muted'}`} />
                  </div>
                </a>
              </li>
            )
          })}
        </ul>
      </div>

      {/* cursor-following preview (desktop only) */}
      <AnimatePresence>
        {hovered && preview(hovered) && (
          <motion.div
            key={hovered.id}
            initial={{ opacity: 0, scale: 0.82, rotate: -3 }}
            animate={{ opacity: 1, scale: 1, rotate: -2 }}
            exit={{ opacity: 0, scale: 0.82, rotate: -3 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            style={{ left: x, top: y }}
            className="pointer-events-none absolute z-20 hidden h-60 w-80 -translate-x-1/2 -translate-y-1/2
                       overflow-hidden rounded-2xl ring-1 ring-cyan/40 shadow-2xl shadow-cyan/20 md:block"
          >
            <img src={preview(hovered)} alt="" className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
