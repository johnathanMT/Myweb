import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Tag } from 'lucide-react'

/**
 * MemoryDetailModal — replaces the old "image just gets bigger" lightbox.
 * Shows a MODERATE photo beside a metadata panel (caption, exact date, moment).
 * The card is capped at max-w-2xl and the image height is constrained, so it
 * never fills the screen.
 *
 * Props:
 *   item:    { url, caption, alt, date, moment } | null   (null = closed)
 *   onClose: () => void
 */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

// 'YYYY-MM-DD' → '5 September 2024' (returns '' if missing/invalid).
function formatDate(s) {
  if (typeof s !== 'string') return ''
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return ''
  return `${d} ${MONTHS[m - 1]} ${y}`
}

export default function MemoryDetailModal({ item, onClose }) {
  useEffect(() => {
    if (!item) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [item, onClose])

  const niceDate = item ? formatDate(item.date) : ''

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          key="memory-modal"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={item.caption || 'Memory'}
        >
          <motion.div
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-surface/90 shadow-2xl backdrop-blur-xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.92, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="grid sm:grid-cols-5">
              {/* photo — moderate, constrained height */}
              <div className="sm:col-span-3">
                <img
                  src={item.url}
                  alt={item.alt}
                  className="h-56 w-full object-cover sm:h-full sm:max-h-[60vh]"
                />
              </div>

              {/* metadata panel */}
              <div className="flex flex-col gap-4 p-6 sm:col-span-2">
                {item.moment && (
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-accent-light">
                    <Tag size={12} /> {item.moment}
                  </span>
                )}

                <h3 className="text-xl font-bold leading-tight text-white">
                  {item.caption}
                </h3>

                {niceDate && (
                  <p className="flex items-center gap-2 font-mono text-sm text-gray-400">
                    <Calendar size={14} className="text-accent/80" /> {niceDate}
                  </p>
                )}
              </div>
            </div>

            {/* close button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-sm transition-colors hover:border-accent/60 hover:text-accent-light"
            >
              <X size={18} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
