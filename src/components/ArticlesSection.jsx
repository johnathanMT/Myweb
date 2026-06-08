import { useEffect, useState } from 'react'
import ArticleCard from './ArticleCard'
import { api } from '../lib/portfolioApi'

/**
 * ArticlesSection — fetches published articles from the Portfolio API and
 * renders them as a responsive grid of sleek ArticleCards.
 */
export default function ArticlesSection() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.wake()
    ;(async () => {
      try {
        const r = await api.getArticles({ pageSize: 6 })
        setItems(r?.data?.items ?? [])
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // Anonymous like/unlike; falls back silently until the backend endpoint is live.
  const handleLike = async (id, liked) => {
    try { liked ? await api.likeArticle(id) : await api.unlikeArticle(id) }
    catch { /* endpoint not implemented yet */ }
  }
  // Quick-reaction (pre-defined emoji/phrase) — anonymous.
  const handleReact = async (id, reactionKey) => {
    try { await api.reactArticle(id, reactionKey) } catch { /* endpoint not implemented yet */ }
  }

  return (
    <section id="articles" className="relative bg-transparent py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 text-center">
          <p className="font-mono text-sm uppercase tracking-[0.25em] text-accent-light">// latest</p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Articles &amp; Projects</h2>
        </div>

        {loading && <p className="text-center font-mono text-muted">Loading articles…</p>}
        {error && !loading && (
          <p className="text-center font-mono text-coral">Couldn't load articles: {error}</p>
        )}
        {!loading && !error && items.length === 0 && (
          <p className="text-center font-mono text-muted">No articles published yet.</p>
        )}

        <div className="grid justify-items-center gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((a) => (
            <ArticleCard
              key={a.id}
              article={a}
              shareUrl={`https://johnathanmt.github.io/Myweb/blog.html#${a.id}`}
              onLike={handleLike}
              onReact={handleReact}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
