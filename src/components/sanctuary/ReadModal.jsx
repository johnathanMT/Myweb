import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

/**
 * ReadModal — glassmorphism card showing a full memory. Opens when a tag is
 * clicked (tag != null). Closes on backdrop click, the X, or Escape.
 */
export default function ReadModal({ tag, onClose }) {
  useEffect(() => {
    if (!tag) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [tag, onClose])

  return (
    <AnimatePresence>
      {tag && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-7 text-white shadow-2xl backdrop-blur-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              <X size={18} />
            </button>

            <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-amber-200/80">A memory from</p>
            <h3 className="mt-1 font-serif text-2xl font-bold">{tag.author}</h3>

            <p className="mt-4 whitespace-pre-line font-serif text-[15px] leading-relaxed text-white/90">
              “{tag.message}”
            </p>

            <p className="mt-6 text-right font-mono text-xs text-white/55">{tag.date}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
