import { useState } from 'react'
import {
  Heart, MessageCircle, Share2, Facebook, Linkedin, Twitter,
  Link2, MapPin, Flame, Coffee,
} from 'lucide-react'
import MediaGallery from './MediaGallery'

// Anti-spam "Quick Reaction" palette — users pick from these instead of typing.
const QUICK_REACTIONS = [
  { key: 'love', emoji: '❤️', label: 'Love it' },
  { key: 'clap', emoji: '👏', label: 'Bravo' },
  { key: 'fire', emoji: '🔥', label: 'Fire' },
  { key: 'idea', emoji: '💡', label: 'Insightful' },
  { key: 'great', emoji: '🙌', label: 'Great post!' },
  { key: 'inspiring', emoji: '✨', label: 'Very inspiring!' },
  { key: 'helpful', emoji: '🙏', label: 'Helpful!' },
]

/**
 * ArticleCard — sleek dark card with a media header (image carousel / collage /
 * video), tasting-style meta, and an interactive footer.
 *
 *  • Likes  — anonymous, no login required.
 *  • Comments — "Quick Reaction": pick a pre-defined emoji + phrase chip (anti-spam).
 *  • Share  — real Facebook / X / LinkedIn share links + copy link.
 *
 * Props:
 *   article: { id, title, content, author, publishedDate, tags, likeCount,
 *              imageUrl, images?, videoUrl?, media?, reactions?,
 *              origin?, roastLevel?, tastingNotes? }
 *   onLike(id, liked)             — POST/DELETE like (anonymous)
 *   onReact(id, reactionKey)      — POST a quick reaction
 *   shareUrl                      — canonical URL to share
 */
export default function ArticleCard({ article = {}, onLike, onReact, shareUrl }) {
  const {
    id, title = 'Untitled', content = '', author = 'Unknown',
    publishedDate, tags, likeCount = 0, reactions = {},
    imageUrl, images, videoUrl, media,
    origin, roastLevel, tastingNotes,
  } = article

  const [liked, setLiked] = useState(false)
  const [likes, setLikes] = useState(likeCount)
  const [showReactions, setShowReactions] = useState(false)
  const [reactionCounts, setReactionCounts] = useState(reactions)
  const [sentReaction, setSentReaction] = useState(null)
  const [copied, setCopied] = useState(false)

  const url = shareUrl || (typeof window !== 'undefined' ? window.location.href : '')
  const excerpt = content.length > 150 ? content.slice(0, 150).trimEnd() + '…' : content
  const date = publishedDate
    ? new Date(publishedDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : ''

  // Build the media list (priority: explicit media > images/video > single imageUrl)
  const mediaList = media
    ?? (images || videoUrl
      ? [...(videoUrl ? [{ type: 'video', url: videoUrl }] : []), ...((images || []).map((u) => ({ type: 'image', url: u })))]
      : imageUrl ? [{ type: 'image', url: imageUrl }] : [])

  const toggleLike = async () => {
    const next = !liked
    setLiked(next); setLikes((n) => n + (next ? 1 : -1))
    try { await onLike?.(id, next) } catch { /* revert on failure */ setLiked(!next); setLikes((n) => n - (next ? 1 : -1)) }
  }

  const sendReaction = async (r) => {
    // optimistic: bump the chosen reaction's counter
    setReactionCounts((c) => ({ ...c, [r.key]: (c[r.key] || 0) + 1 }))
    setSentReaction(r.key)
    setTimeout(() => setShowReactions(false), 600)
    try { await onReact?.(id, r.key) } catch { /* endpoint not live yet — keep optimistic */ }
  }

  const totalReactions = Object.values(reactionCounts).reduce((a, b) => a + (b || 0), 0)

  const share = (network) => {
    const u = encodeURIComponent(url), t = encodeURIComponent(title)
    const links = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
      twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
    }
    if (links[network]) window.open(links[network], '_blank', 'noopener,width=600,height=540')
  }
  const copyLink = async () => { try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500) } catch { } }

  const metaRows = [
    origin && { icon: MapPin, label: 'Origin', value: origin },
    roastLevel && { icon: Flame, label: 'Roast', value: roastLevel },
    tastingNotes && { icon: Coffee, label: 'Notes', value: tastingNotes },
  ].filter(Boolean)

  return (
    <article className="group flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-card shadow-2xl shadow-black/40 ring-1 ring-white/10 transition-transform duration-300 hover:-translate-y-1">
      {/* Media header (carousel / collage / video) */}
      <MediaGallery media={mediaList} alt={title} className="rounded-t-3xl" />

      {/* Body */}
      <div className="flex flex-1 flex-col p-6">
        <p className="mb-2 font-mono text-xs uppercase tracking-widest text-cyan">
          {author}{date && ` · ${date}`}
        </p>
        <h3 className="mb-2 text-xl font-bold leading-tight text-white">{title}</h3>
        <p className="mb-4 text-sm leading-relaxed text-gray-300 line-clamp-3">{excerpt}</p>

        {tags && (
          <div className="mb-4 flex flex-wrap gap-2">
            {tags.split(',').filter(Boolean).slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent-light">
                #{tag.trim()}
              </span>
            ))}
          </div>
        )}

        {metaRows.length > 0 && (
          <div className="mb-1 flex flex-col gap-1.5 rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-md">
            {metaRows.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-gray-200">
                <Icon size={15} className="shrink-0 text-accent-light" />
                <span className="font-semibold">{label}:</span>
                <span className="truncate text-gray-300">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Interactive footer */}
      <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-white/5 px-5 py-3 backdrop-blur-md">
        <div className="flex items-center gap-1">
          <button onClick={toggleLike} aria-label="Like"
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${liked ? 'text-coral' : 'text-muted hover:text-coral'}`}>
            <Heart size={18} className={liked ? 'fill-coral' : ''} />
            <span>{likes}</span>
          </button>
          <button onClick={() => setShowReactions((s) => !s)} aria-label="React"
            aria-expanded={showReactions}
            className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${showReactions ? 'text-white' : 'text-muted hover:text-white'}`}>
            <MessageCircle size={18} />
            <span>{totalReactions > 0 ? totalReactions : 'React'}</span>
          </button>
        </div>

        <div className="flex items-center gap-1 text-muted">
          <Share2 size={16} className="mr-1 opacity-60" />
          <button onClick={() => share('facebook')} aria-label="Share on Facebook" className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-cyan"><Facebook size={17} /></button>
          <button onClick={() => share('linkedin')} aria-label="Share on LinkedIn" className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-cyan"><Linkedin size={17} /></button>
          <button onClick={() => share('twitter')} aria-label="Share on X" className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-cyan"><Twitter size={17} /></button>
          <button onClick={copyLink} aria-label="Copy link" className="rounded-full p-1.5 transition-colors hover:bg-white/10 hover:text-accent-light">
            <Link2 size={17} className={copied ? 'text-accent-light' : ''} />
          </button>
        </div>
      </div>

      {/* Quick Reactions — pick a chip instead of free typing (anti-spam) */}
      {showReactions && (
        <div className="border-t border-white/10 bg-space/60 px-5 py-4">
          <p className="mb-2.5 font-mono text-xs uppercase tracking-widest text-muted">Quick reaction</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_REACTIONS.map((r) => {
              const count = reactionCounts[r.key] || 0
              const isSent = sentReaction === r.key
              return (
                <button
                  key={r.key}
                  onClick={() => sendReaction(r)}
                  disabled={!!sentReaction}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all
                    ${isSent
                      ? 'border-accent bg-accent/20 text-white'
                      : 'border-white/15 bg-white/5 text-gray-200 hover:border-accent-light hover:bg-white/10'}
                    ${sentReaction && !isSent ? 'opacity-40' : ''}`}
                >
                  <span>{r.emoji}</span>
                  <span>{r.label}</span>
                  {count > 0 && <span className="ml-0.5 text-xs text-accent-light">{count}</span>}
                </button>
              )
            })}
          </div>
          {sentReaction && (
            <p className="mt-3 text-sm text-accent-light">Thanks for your reaction! 🎉</p>
          )}
        </div>
      )}
    </article>
  )
}
