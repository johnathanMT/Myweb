import { useState, useEffect, useRef } from 'react'
import { BLOG_POSTS } from '../data/content'

const TAG_COLORS = {
  Travel:      'bg-cyan/10 text-cyan',
  Musings:     'bg-purple-400/10 text-purple-400',
  'Care Giving': 'bg-pink-400/10 text-pink-400',
}

function BentoCard({ post, onClick }) {
  const sizeClass = {
    large:  'bento-large',
    medium: 'bento-medium',
    wide:   'bento-wide',
  }[post.size] || 'bento-medium'

  const tagStyle = TAG_COLORS[post.tag] || 'bg-white/10 text-gray-400'

  return (
    <div className={`bento-card ${sizeClass}`} onClick={() => onClick(post)}>
      <div className="bg-layer" style={{ backgroundImage: `url(${post.img})` }} />
      <div className="overlay" />
      <div className="info">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagStyle}`}>{post.tag}</span>
          <span className="text-xs text-gray-400">{post.date}</span>
        </div>
        <h3 className="text-white font-bold text-lg leading-tight mb-1">{post.title}</h3>
        <p className="text-gray-300 text-sm leading-relaxed line-clamp-2">{post.excerpt}</p>
        <button className="mt-3 flex items-center gap-1.5 text-xs text-accent-light font-medium hover:gap-2.5 transition-all">
          Read more <i className="fas fa-arrow-right text-[10px]" />
        </button>
      </div>
    </div>
  )
}

function Modal({ post, onClose }) {
  const isOpen = Boolean(post)

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => {
      window.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!post) return null

  const tagStyle = TAG_COLORS[post.tag] || 'bg-white/10 text-gray-400'

  return (
    <div
      className={`modal-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="modal-box">
        {/* Hero image */}
        <div className="relative h-56 overflow-hidden rounded-t-2xl">
          <img src={post.img} alt={post.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#16161f] via-transparent to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
          >
            <i className="fas fa-times text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 md:p-8">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${tagStyle}`}>{post.tag}</span>
            <span className="text-xs text-muted">{post.date}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{post.title}</h2>
          <div className="space-y-4">
            {post.content.split('\n\n').map((para, i) => (
              <p key={i} className="text-gray-300 text-sm leading-relaxed">{para}</p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TravelChronicles() {
  const [activePost, setActivePost] = useState(null)
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.1 }
    )
    sectionRef.current?.querySelectorAll('.reveal').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="blog" ref={sectionRef} className="relative py-24 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-surface to-space pointer-events-none" />

      <div className="section-container relative z-10">
        <div className="reveal mb-14">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">Chronicles</p>
          <h2 className="section-title">Travel Chronicles ✈️</h2>
          <p className="section-subtitle">Journey through the lens of a developer.</p>
        </div>

        <div className="reveal bento-grid">
          {BLOG_POSTS.map(post => (
            <BentoCard key={post.id} post={post} onClick={setActivePost} />
          ))}
        </div>
      </div>

      <Modal post={activePost} onClose={() => setActivePost(null)} />
    </section>
  )
}
