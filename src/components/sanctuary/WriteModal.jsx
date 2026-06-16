import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send } from 'lucide-react'

/**
 * WriteModal — glassmorphism form to "leave a memory". Mock only: on submit it
 * calls onSubmit({ author, message }) so the parent can add a tag to the tree.
 * (Backend wiring comes later.)
 */
export default function WriteModal({ open, onClose, onSubmit }) {
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (!open) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const submit = (e) => {
    e.preventDefault()
    if (!author.trim() || !message.trim()) return
    onSubmit({ author: author.trim(), message: message.trim() })
    setAuthor('')
    setMessage('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
        >
          <motion.form
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
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

            <h3 className="font-serif text-2xl font-bold">Leave a Memory</h3>
            <p className="mt-1 font-serif text-sm text-white/70">Hang a wooden tag on the tree.</p>

            <label className="mt-5 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">Your name</span>
              <input
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                maxLength={40}
                required
                placeholder="e.g. Nomura-san"
                className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15"
              />
            </label>

            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">Message</span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={240}
                required
                rows={4}
                placeholder="A few words to remember…"
                className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15"
              />
              <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{message.length}/240</span>
            </label>

            <button
              type="submit"
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-semibold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.99]"
            >
              Hang it on the tree <Send size={15} />
            </button>

            <p className="mt-3 text-center font-mono text-[10px] text-white/45">Demo only — not saved yet.</p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
