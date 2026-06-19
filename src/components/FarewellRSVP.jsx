import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Sparkles, Send, ArrowLeft, Calendar, Utensils, Leaf, Cherry } from 'lucide-react'
import { SITE } from '../config/site'

/**
 * FarewellRSVP — route /#/farewell.
 *
 * A welcome + RSVP modal for departing colleagues. On submit it:
 *   1. POSTs to /api/farewell/rsvp (server assigns a fixed plot + returns it),
 *   2. stashes the returned monument payload in localStorage under
 *      `mtn_pending_plant`,
 *   3. redirects to /#/sanctuary, where the 3D world reads + clears that key to
 *      play a one-time "planting" animation at the returned coordinates.
 *
 * Styling intentionally mirrors Sanctuary's WriteModal (glassmorphism, amber→rose
 * gradient, font-serif headings, 16px inputs so iOS doesn't auto-zoom on focus).
 */
const API = `${SITE.apiUrl}/api/farewell/rsvp`
const PENDING_KEY = 'mtn_pending_plant'

// Same operator-id scheme as Sanctuary: a stable per-browser id (server stores
// only its hash) → one monument per person, editable in place.
function getOperatorId() {
  try {
    let id = localStorage.getItem('mtn_operator_id')
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('mtn_operator_id', id)
    }
    return id
  } catch { return `op-${Date.now()}` }
}

const PLANTS = [
  { key: 'sakura', label: 'Sakura Tree',            sub: 'Cherry blossom — renewal & farewell', Icon: Cherry },
  { key: 'orchid', label: 'Bulbophyllum triste',    sub: 'A rare, quietly resilient orchid',     Icon: Leaf },
]

export default function FarewellRSVP() {
  const navigate = useNavigate()
  const operatorId = useRef(getOperatorId()).current

  const [name, setName] = useState('')
  const [dates, setDates] = useState('')
  const [food, setFood] = useState('')
  const [message, setMessage] = useState('')
  const [plant, setPlant] = useState('sakura')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Lock body scroll while this full-screen page is up.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !message.trim() || submitting) return
    setSubmitting(true); setError('')

    const payload = {
      name: name.trim(),
      datesAvailable: dates.trim(),
      foodPreference: food.trim(),
      message: message.trim(),
      plantType: plant,
    }

    // What the planting animation needs, regardless of whether the API is up.
    let planted = { name: payload.name, plantType: plant, position: null }

    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Operator-Token': operatorId },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      if (data?.position && typeof data.position.x === 'number') {
        planted = {
          id: data.id,
          name: data.name || payload.name,
          plantType: data.plantType || plant,
          position: [data.position.x, data.position.y, data.position.z],
        }
      }
    } catch (err) {
      // Non-blocking: still plant locally so the experience never stalls. The
      // Sanctuary GET will reconcile with the server on next load.
      console.error('[Farewell] RSVP POST failed:', err)
      setError('saved-offline')
    }

    try { localStorage.setItem(PENDING_KEY, JSON.stringify({ ...planted, ts: Date.now() })) } catch { /* ignore */ }
    navigate('/sanctuary')
  }

  return (
    <div className="relative flex min-h-[100dvh] w-screen items-center justify-center overflow-y-auto overscroll-none px-4 py-10 font-sans"
      style={{ WebkitTapHighlightColor: 'transparent' }}>
      {/* dreamy night-sky backdrop (matches Sanctuary) */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#070b1c] via-[#141a38] to-[#2a1a3a]"
        style={{ backgroundImage: 'radial-gradient(1px 1px at 14% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 34%, #fff, transparent), radial-gradient(1.5px 1.5px at 47% 14%, #fff, transparent), radial-gradient(1px 1px at 65% 28%, #fff, transparent), radial-gradient(1px 1px at 80% 16%, #fff, transparent), radial-gradient(1.5px 1.5px at 90% 32%, #fff, transparent), linear-gradient(to bottom, #070b1c, #141a38, #2a1a3a)' }} />

      <Link to="/sanctuary" className="fixed left-4 top-4 z-10 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
        <ArrowLeft size={15} /> Skip to Sanctuary
      </Link>

      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="relative w-full max-w-lg rounded-[28px] border border-white/25 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-300 text-amber-950 shadow-[0_0_24px_rgba(253,224,140,0.6)]">
          <Sparkles size={22} />
        </div>
        <h1 className="text-center font-serif text-2xl font-bold tracking-wide sm:text-3xl">Plant a Living Memory</h1>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-[14px] leading-relaxed text-white/85">
          Before you go, leave your mark on our shared world. Tell us when you're free and what you'd like to eat at the
          send-off — then grow a permanent plant in the Sanctuary, tagged with your name for everyone to remember you by. 🌱
        </p>

        {/* Plant choice */}
        <div className="mt-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">Choose your plant</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {PLANTS.map(({ key, label, sub, Icon }) => (
              <button key={key} type="button" onClick={() => setPlant(key)}
                className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition ${plant === key ? 'border-amber-200/80 bg-white/20 ring-1 ring-amber-200/50' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                <Icon size={18} className="text-amber-200" />
                <span className="font-serif text-sm font-semibold leading-tight">{label}</span>
                <span className="font-mono text-[10px] leading-snug text-white/60">{sub}</span>
              </button>
            ))}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required placeholder="e.g. Aiko Tanaka"
            className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15 sm:py-2.5 sm:text-sm" />
        </label>

        <label className="mt-4 block">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-200/80"><Calendar size={12} /> Dates available</span>
          <input value={dates} onChange={(e) => setDates(e.target.value)} maxLength={120} placeholder="e.g. Jul 4, Jul 6 (evenings)"
            className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15 sm:py-2.5 sm:text-sm" />
        </label>

        <label className="mt-4 block">
          <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-200/80"><Utensils size={12} /> Food preference</span>
          <input value={food} onChange={(e) => setFood(e.target.value)} maxLength={80} placeholder="e.g. Vegetarian / No pork"
            className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15 sm:py-2.5 sm:text-sm" />
        </label>

        <label className="mt-4 block">
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">Farewell message</span>
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} required rows={3} placeholder="A few words you'd like to leave behind…"
            className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15 sm:py-2.5 sm:text-sm" />
          <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{message.length}/240</span>
        </label>

        {error === 'saved-offline' && (
          <p className="mt-3 rounded-xl border border-amber-300/40 bg-black/40 px-3 py-2 font-mono text-[11px] text-amber-200/90">
            We couldn't reach the server, but your plant will still grow now and sync later.
          </p>
        )}

        <button type="submit" disabled={submitting}
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-bold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:opacity-60">
          {submitting ? 'Planting…' : 'Plant & Enter the Sanctuary'} <Send size={15} />
        </button>
        <p className="mt-3 text-center font-mono text-[10px] text-white/45">One living monument per person · editable anytime</p>
      </motion.form>
    </div>
  )
}
