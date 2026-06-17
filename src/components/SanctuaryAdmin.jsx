import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, RefreshCw, LogOut, Search } from 'lucide-react'
import { SITE } from '../config/site'

/**
 * SanctuaryAdmin — admin-only dashboard (route /sanctuary-admin) to fetch, view,
 * and read EVERY memory (including private ones), unmasked.
 *
 * Auth flow (reuses the existing backend):
 *   1. POST /api/auth/login { email, password }  → { data: { token, role } }
 *   2. Store the JWT, then GET /api/sanctuary/admin/memories with
 *      Authorization: Bearer <token>. That endpoint is [Authorize(Roles="Admin")],
 *      so only an Admin JWT gets the unmasked list.
 */
const AUTH_URL = `${SITE.apiUrl}/api/auth/login`
const ADMIN_URL = `${SITE.apiUrl}/api/sanctuary/admin/memories`
const TOKEN_KEY = 'mtn_admin_jwt'

export default function SanctuaryAdmin() {
  const [token, setToken] = useState(() => { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const persist = (tk) => { try { tk ? localStorage.setItem(TOKEN_KEY, tk) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } }

  const login = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = await res.json()
      const tk = data?.data?.token
      if (!res.ok || !tk) throw new Error(data?.message || `Login failed (${res.status})`)
      if ((data?.data?.role || '').toLowerCase() !== 'admin') throw new Error('This account is not an Admin.')
      setToken(tk); persist(tk); setPassword('')
    } catch (err) {
      setError(err.message || 'Login failed.')
    } finally { setLoading(false) }
  }

  const logout = () => { setToken(''); persist(''); setMemories([]) }

  const load = async () => {
    if (!token) return
    setError(''); setLoading(true)
    try {
      const res = await fetch(ADMIN_URL, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired or not an Admin. Please log in again.') }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setMemories(Array.isArray(data?.memories) ? data.memories : [])
    } catch (err) {
      setError(err.message || 'Could not load memories.')
    } finally { setLoading(false) }
  }

  useEffect(() => { if (token) load() }, [token]) // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = memories.filter((m) => {
    if (!q.trim()) return true
    const s = q.toLowerCase()
    return (m.author || '').toLowerCase().includes(s) || (m.message || '').toLowerCase().includes(s) || (m.landmark || '').toLowerCase().includes(s)
  })

  return (
    <div className="min-h-screen bg-[#0b0e1a] px-4 py-6 text-white sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/80 transition hover:bg-white/10"><ArrowLeft size={15} /> Home</Link>
          <h1 className="font-serif text-xl font-bold sm:text-2xl">Sanctuary · Admin</h1>
          {token ? (
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-mono text-xs text-white/80 transition hover:bg-white/10"><LogOut size={14} /> Log out</button>
          ) : <span className="w-[88px]" />}
        </div>

        {error && <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 font-mono text-sm text-rose-200">{error}</p>}

        {!token ? (
          /* ── LOGIN ── */
          <form onSubmit={login} className="mx-auto mt-16 w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-7">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10"><Lock size={20} /></div>
            <h2 className="text-center font-serif text-lg font-bold">Admin sign in</h2>
            <label className="mt-5 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-amber-300/50" />
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-white/50">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm outline-none focus:border-amber-300/50" />
            </label>
            <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-bold text-amber-950 transition hover:brightness-105 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          /* ── DASHBOARD ── */
          <>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search author, message, place…" className="w-full rounded-xl border border-white/15 bg-white/5 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-amber-300/50" />
              </div>
              <button onClick={load} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 font-mono text-xs text-white/80 transition hover:bg-white/10 disabled:opacity-60">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <span className="font-mono text-xs text-white/50">{filtered.length} / {memories.length}</span>
            </div>

            <div className="mt-4 overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full border-collapse text-left text-sm">
                <thead className="bg-white/5 font-mono text-[11px] uppercase tracking-wider text-white/50">
                  <tr>
                    <th className="px-4 py-3">Author</th>
                    <th className="px-4 py-3">Place</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3 whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-10 text-center font-mono text-sm text-white/40">{loading ? 'Loading…' : 'No memories.'}</td></tr>
                  ) : filtered.map((m) => (
                    <tr key={m.id} className="border-t border-white/5 align-top hover:bg-white/[0.03]">
                      <td className="px-4 py-3 font-medium text-amber-200">{m.author}</td>
                      <td className="px-4 py-3 font-mono text-xs text-white/60">{m.landmark}</td>
                      <td className="px-4 py-3 text-white/90">{m.message}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-white/50">{(m.createdAt || '').slice(0, 10)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
