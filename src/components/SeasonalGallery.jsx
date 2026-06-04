import { useRef, useEffect, useState } from 'react'
import { MONTHS } from '../data/content'

export default function SeasonalGallery() {
  const carouselRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const [activeIdx, setActiveIdx] = useState(0)
  const rafRef = useRef(null)
  const pausedRef = useRef(false)

  // Auto-scroll
  useEffect(() => {
    const el = carouselRef.current
    if (!el) return
    let speed = 0.6
    const scroll = () => {
      if (!pausedRef.current) {
        el.scrollLeft += speed
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0
        }
        const cardW = 256
        const idx = Math.round(el.scrollLeft / cardW) % MONTHS.length
        setActiveIdx(idx)
      }
      rafRef.current = requestAnimationFrame(scroll)
    }
    rafRef.current = requestAnimationFrame(scroll)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onMouseDown = (e) => {
    pausedRef.current = true
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }
  const onMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    carouselRef.current.scrollLeft = scrollLeft - walk
  }
  const onMouseUp = () => {
    setIsDragging(false)
    setTimeout(() => { pausedRef.current = false }, 2000)
  }
  const onTouchStart = () => { pausedRef.current = true }
  const onTouchEnd   = () => setTimeout(() => { pausedRef.current = false }, 3000)

  return (
    <section id="seasonal" className="relative py-24 border-t border-white/5 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-space to-surface pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="section-container pb-0">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">Gallery</p>
          <h2 className="section-title">Year in Focus</h2>
          <p className="section-subtitle">12 Months. 12 Stories. Captured in Time.</p>

          {/* Active month indicator */}
          <p className="text-white/60 text-sm font-mono mb-8">
            {MONTHS[activeIdx].zodiac} — {MONTHS[activeIdx].name}
          </p>
        </div>

        {/* Carousel — full width */}
        <div
          ref={carouselRef}
          className="lens-carousel px-6"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={() => { if (isDragging) onMouseUp() }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {/* Duplicate cards for infinite illusion */}
          {[...MONTHS, ...MONTHS].map((month, i) => (
            <div
              key={i}
              className={`lens-card transition-all duration-300 ${i % MONTHS.length === activeIdx ? 'ring-2 ring-accent/50' : ''}`}
            >
              <img src={month.img} alt={month.name} draggable={false} />
              <div className="lens-card-overlay">
                <p className="text-white font-bold text-sm tracking-widest">{month.name}</p>
                <p className="text-accent-light text-xs mt-0.5">{month.zodiac}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Dot indicators */}
        <div className="flex justify-center gap-1.5 mt-6">
          {MONTHS.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                pausedRef.current = true
                if (carouselRef.current) carouselRef.current.scrollLeft = i * 256
                setActiveIdx(i)
                setTimeout(() => { pausedRef.current = false }, 3000)
              }}
              className={`rounded-full transition-all duration-300 ${
                i === activeIdx
                  ? 'w-6 h-1.5 bg-accent'
                  : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
