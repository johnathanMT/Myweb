import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Lock, RefreshCw, LogOut, Search, Download, MessageSquare, Sprout, BookOpen, KeyRound, Sparkles, Star, FileText, Mail, Trash2, X, Send, ScrollText, Check, type LucideIcon } from 'lucide-react'
import { SITE } from '../config/site'
import AdminPoetryManager from './AdminPoetryManager'
import type { Memory, EntityId } from '../types/api'

/**
 * SanctuaryAdmin — admin-only dashboard (route /sanctuary-admin).
 *
 * Two tabs, one Admin JWT:
 *   • Memories      → GET /api/sanctuary/admin/memories  (every memory, unmasked)
 *   • Farewell RSVPs → GET /api/farewell/admin/rsvps      (name, dates, food, plant)
 * Both endpoints are [Authorize(Roles="Admin")], so only an Admin JWT gets data.
 */
const AUTH_URL = `${SITE.apiUrl}/api/auth/login`
const MEMORIES_URL = `${SITE.apiUrl}/api/sanctuary/admin/memories`
const FAREWELL_URL = `${SITE.apiUrl}/api/farewell/admin/rsvps`
const CHANGE_PW_URL = `${SITE.apiUrl}/api/auth/change-password`
const REMEDIES_URL = `${SITE.apiUrl}/api/astrology/admin/remedies`
const CHARTS_URL = `${SITE.apiUrl}/api/astrology/admin/charts`
const PDF_URL = `${SITE.apiUrl}/api/astrology/admin/pdf-requests`
const READINGS_URL = `${SITE.apiUrl}/api/astrology/admin/reading-requests?status=Pending`
const TOKEN_KEY = 'mtn_admin_jwt'

type Tab = 'memories' | 'farewell' | 'poetry' | 'account' | 'remedy' | 'charts' | 'pdf' | 'readings'

// Admin view of a farewell RSVP — includes the logistics fields the public
// FarewellView omits (datesAvailable, foodPreference, plantType).
interface AdminRsvp {
  id: EntityId
  name: string
  attending?: boolean
  datesAvailable?: string
  foodPreference?: string
  plantType?: string
  message?: string
  createdAt?: string
}

interface AdminRemedy { id: number; name: string; contact: string; area: string; message: string; birthInfo: string; handled: boolean; status: string; notes: string; createdAt: string }
const STATUSES = ['Pending', 'InProgress', 'Completed', 'Cancelled'] as const
const statusColor = (s: string) => s === 'Completed' ? 'text-emerald-300' : s === 'Cancelled' ? 'text-rose-300' : s === 'InProgress' ? 'text-amber-300' : 'text-fg/80'
interface AdminChart { id: number; name: string; gender: string; birthDate: string; birthTime: string; timeZone: string; location: string; nayNan: number; createdAt: string }
interface AdminPdf { id: number; email: string; name: string; birthInfo: string; approvalStatus: string; createdAt: string }
interface AdminReadingReq { id: number; querentName: string; status: string; hasMarkdown: boolean; pdfRequested: boolean; createdAt: string; approvedAt?: string }

interface LoginResponse { data?: { token?: string; role?: string }; message?: string }
interface AdminListResponse { memories?: Memory[]; rsvps?: AdminRsvp[] }

export default function SanctuaryAdmin() {
  const [token, setToken] = useState<string>(() => { try { return localStorage.getItem(TOKEN_KEY) || '' } catch { return '' } })
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [tab, setTab] = useState<Tab>('memories')
  const [memories, setMemories] = useState<Memory[]>([])
  const [rsvps, setRsvps] = useState<AdminRsvp[]>([])
  const [remedies, setRemedies] = useState<AdminRemedy[]>([])
  const [charts, setCharts] = useState<AdminChart[]>([])
  const [pdfs, setPdfs] = useState<AdminPdf[]>([])
  const [readingReqs, setReadingReqs] = useState<AdminReadingReq[]>([])
  const [rowBusy, setRowBusy] = useState<{ id: number; action: 'approve' | 'reject' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')
  const [curPw, setCurPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [pwBusy, setPwBusy] = useState(false)

  const persist = (tk: string) => { try { tk ? localStorage.setItem(TOKEN_KEY, tk) : localStorage.removeItem(TOKEN_KEY) } catch { /* ignore */ } }

  const login = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })
      const data = (await res.json()) as LoginResponse
      const tk = data?.data?.token
      if (!res.ok || !tk) throw new Error(data?.message || `Login failed (${res.status})`)
      if ((data?.data?.role || '').toLowerCase() !== 'admin') throw new Error('This account is not an Admin.')
      setToken(tk); persist(tk); setPassword('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed.')
    } finally { setLoading(false) }
  }

  const logout = () => { setToken(''); persist(''); setMemories([]); setRsvps([]) }

  const load = async (which: Tab = tab) => {
    if (!token) return
    if (which === 'poetry' || which === 'account') return   // these fetch nothing here
    setError(''); setLoading(true)
    try {
      const url = which === 'farewell' ? FAREWELL_URL : which === 'remedy' ? REMEDIES_URL : which === 'charts' ? CHARTS_URL : which === 'pdf' ? PDF_URL : which === 'readings' ? READINGS_URL : MEMORIES_URL
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired or not an Admin. Please log in again.') }
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = (await res.json()) as AdminListResponse & { data?: AdminRemedy[] | AdminChart[] | AdminPdf[] | AdminReadingReq[] }
      if (which === 'farewell') setRsvps(Array.isArray(data?.rsvps) ? data.rsvps : [])
      else if (which === 'remedy') setRemedies(Array.isArray(data?.data) ? (data.data as AdminRemedy[]) : [])
      else if (which === 'charts') setCharts(Array.isArray(data?.data) ? (data.data as AdminChart[]) : [])
      else if (which === 'pdf') setPdfs(Array.isArray(data?.data) ? (data.data as AdminPdf[]) : [])
      else if (which === 'readings') setReadingReqs(Array.isArray(data?.data) ? (data.data as AdminReadingReq[]) : [])
      else setMemories(Array.isArray(data?.memories) ? data.memories : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load data.')
    } finally { setLoading(false) }
  }

  const authJson = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const setStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${id}/status`, { method: 'PATCH', headers: authJson, body: JSON.stringify({ status }) })
      if (!res.ok) throw new Error()
      setRemedies((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch { setError('Could not update status.') }
  }
  const saveNotes = async (id: number, notes: string) => {
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${id}/notes`, { method: 'PATCH', headers: authJson, body: JSON.stringify({ notes }) })
      if (!res.ok) throw new Error()
      setRemedies((rs) => rs.map((r) => (r.id === id ? { ...r, notes } : r)))
    } catch { setError('Could not save notes.') }
  }
  const deleteRemedy = async (id: number) => {
    if (!window.confirm('Delete this request permanently?')) return
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setRemedies((rs) => rs.filter((r) => r.id !== id))
    } catch { setError('Could not delete.') }
  }
  const deleteChart = async (id: number) => {
    if (!window.confirm('Delete this saved chart permanently?')) return
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/charts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setCharts((cs) => cs.filter((c) => c.id !== id))
    } catch { setError('Could not delete.') }
  }

  // Reply / send-reading modal
  const [reply, setReply] = useState<{ id: number; name: string; contact: string } | null>(null)
  const [replySubject, setReplySubject] = useState('')
  const [replyBody, setReplyBody] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [replyMsg, setReplyMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const sendReply = async () => {
    if (!reply || !replyBody.trim()) return
    setReplyBusy(true); setReplyMsg(null)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/remedies/${reply.id}/reply`, { method: 'POST', headers: authJson, body: JSON.stringify({ subject: replySubject.trim(), body: replyBody }) })
      const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null
      if (!res.ok || !data?.success) throw new Error(data?.message || 'Send failed')
      setReplyMsg({ ok: true, text: 'Reading emailed to the client.' })
      setRemedies((rs) => rs.map((r) => (r.id === reply.id ? { ...r, status: 'Completed' } : r)))
      setReplyBody('')
    } catch (err) { setReplyMsg({ ok: false, text: err instanceof Error ? err.message : 'Send failed' }) } finally { setReplyBusy(false) }
  }

  const [approving, setApproving] = useState<number | null>(null)
  const approvePdf = async (id: number) => {
    setApproving(id)
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/approve-pdf/${id}`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error()
      setPdfs((ps) => ps.map((r) => (r.id === id ? { ...r, approvalStatus: 'Approved' } : r)))
    } catch { setError('Could not approve / send email.') } finally { setApproving(null) }
  }

  // Approve a reading request → this is the ONLY path that calls Gemini, so it can
  // take several seconds. We show a per-row "Generating Reading…" state, then drop
  // the row from the Pending list on success.
  const approveReading = async (id: number) => {
    setRowBusy({ id, action: 'approve' }); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/reading-requests/${id}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string } | null
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expired. Please log in again.') }
      if (!res.ok || !data?.success) throw new Error(data?.message || `Failed (${res.status})`)
      setReadingReqs((rs) => rs.filter((r) => r.id !== id))
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not approve the reading.') } finally { setRowBusy(null) }
  }
  const rejectReading = async (id: number) => {
    if (!window.confirm('Reject this reading request? The querent will need to request again next month.')) return
    setRowBusy({ id, action: 'reject' }); setError('')
    try {
      const res = await fetch(`${SITE.apiUrl}/api/astrology/admin/reading-requests/${id}/reject`, { method: 'POST', headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setReadingReqs((rs) => rs.filter((r) => r.id !== id))
    } catch (err) { setError(err instanceof Error ? err.message : 'Could not reject the request.') } finally { setRowBusy(null) }
  }

  // Change the signed-in admin's password via the authenticated endpoint. A 401
  // here means "current password wrong" OR an expired session — we surface the
  // server message rather than auto-logging-out, so a typo doesn't kick you out.
  const changePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPwMsg(null); setPwBusy(true)
    try {
      const res = await fetch(CHANGE_PW_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      })
      const data = (await res.json().catch(() => null)) as { success?: boolean; message?: string; errors?: string[] } | null
      if (!res.ok || !data?.success)
        throw new Error(data?.message || data?.errors?.[0] || `Failed (${res.status})`)
      setPwMsg({ ok: true, text: 'Password updated. Use it next time you sign in.' })
      setCurPw(''); setNewPw('')
    } catch (err) {
      setPwMsg({ ok: false, text: err instanceof Error ? err.message : 'Could not change password.' })
    } finally { setPwBusy(false) }
  }

  // Load on login + whenever the tab changes (re-fetches fresh each switch).
  useEffect(() => { if (token) { setQ(''); load(tab) } }, [token, tab]) // eslint-disable-line react-hooks/exhaustive-deps

  const s = q.trim().toLowerCase()
  const filteredMemories = memories.filter((m) => !s ||
    (m.author || '').toLowerCase().includes(s) || (m.message || '').toLowerCase().includes(s) || (m.landmark || '').toLowerCase().includes(s))
  const filteredRsvps = rsvps.filter((r) => !s ||
    (r.name || '').toLowerCase().includes(s) || (r.message || '').toLowerCase().includes(s) ||
    (r.datesAvailable || '').toLowerCase().includes(s) || (r.foodPreference || '').toLowerCase().includes(s) || (r.plantType || '').toLowerCase().includes(s))

  const filteredRemedies = remedies.filter((r) => !s ||
    (r.name || '').toLowerCase().includes(s) || (r.contact || '').toLowerCase().includes(s) || (r.area || '').toLowerCase().includes(s) || (r.message || '').toLowerCase().includes(s))
  const filteredCharts = charts.filter((c) => !s ||
    (c.name || '').toLowerCase().includes(s) || (c.gender || '').toLowerCase().includes(s) || (c.timeZone || '').toLowerCase().includes(s))

  const filteredPdfs = pdfs.filter((r) => !s || (r.email || '').toLowerCase().includes(s) || (r.name || '').toLowerCase().includes(s))
  const filteredReadingReqs = readingReqs.filter((r) => !s || (r.querentName || '').toLowerCase().includes(s))

  const total = tab === 'farewell' ? rsvps.length : tab === 'remedy' ? remedies.length : tab === 'charts' ? charts.length : tab === 'pdf' ? pdfs.length : tab === 'readings' ? readingReqs.length : memories.length
  const shown = tab === 'farewell' ? filteredRsvps.length : tab === 'remedy' ? filteredRemedies.length : tab === 'charts' ? filteredCharts.length : tab === 'pdf' ? filteredPdfs.length : tab === 'readings' ? filteredReadingReqs.length : filteredMemories.length

  // Export the RSVP logistics as CSV for planning the real send-off.
  const exportCsv = () => {
    const head = ['Name', 'Attending', 'Dates Available', 'Food Preference', 'Plant', 'Message', 'Submitted']
    const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`
    const rows = filteredRsvps.map((r) => [r.name, r.attending ? 'Yes' : 'No', r.datesAvailable, r.foodPreference, r.plantType, r.message, (r.createdAt || '').slice(0, 10)].map(esc).join(','))
    const blob = new Blob(['﻿' + [head.map(esc).join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8;' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `farewell-rsvps-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const TabBtn = ({ id, icon: Icon, label }: { id: Tab; icon: LucideIcon; label: string }) => (
    <button type="button" onClick={() => setTab(id)}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-xs transition ${tab === id ? 'border-amber-300/60 bg-amber-300/15 text-amber-100' : 'border-fg/15 bg-fg/5 text-fg/70 hover:bg-fg/10'}`}>
      <Icon size={14} /> {label}
    </button>
  )

  return (
    <div className="min-h-screen bg-space px-4 py-6 text-fg sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-fg/5 px-4 py-2 font-mono text-xs text-fg/80 transition hover:bg-fg/10"><ArrowLeft size={15} /> Home</Link>
          <h1 className="font-serif text-xl font-bold sm:text-2xl">Sanctuary · Admin</h1>
          {token ? (
            <button onClick={logout} className="inline-flex items-center gap-2 rounded-full border border-fg/15 bg-fg/5 px-4 py-2 font-mono text-xs text-fg/80 transition hover:bg-fg/10"><LogOut size={14} /> Log out</button>
          ) : <span className="w-[88px]" />}
        </div>

        {error && <p className="mt-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2.5 font-mono text-sm text-rose-200">{error}</p>}

        {!token ? (
          /* ── LOGIN ── */
          <form onSubmit={login} className="mx-auto mt-16 w-full max-w-sm rounded-2xl border border-fg/10 bg-fg/5 p-7">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-fg/10"><Lock size={20} /></div>
            <h2 className="text-center font-serif text-lg font-bold">Admin sign in</h2>
            <label className="mt-5 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg/50">Email</span>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 w-full rounded-xl border border-fg/15 bg-fg/5 px-4 py-3 text-base outline-none focus:border-amber-300/50 sm:py-2.5 sm:text-sm" />
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-fg/50">Password</span>
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 w-full rounded-xl border border-fg/15 bg-fg/5 px-4 py-3 text-base outline-none focus:border-amber-300/50 sm:py-2.5 sm:text-sm" />
            </label>
            <button type="submit" disabled={loading} className="mt-5 w-full rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-bold text-amber-950 transition hover:brightness-105 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        ) : (
          /* ── DASHBOARD ── */
          <>
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <TabBtn id="memories" icon={MessageSquare} label="Memories" />
              <TabBtn id="farewell" icon={Sprout} label="Farewell RSVPs" />
              <TabBtn id="readings" icon={ScrollText} label="Readings" />
              <TabBtn id="remedy" icon={Sparkles} label="Remedy" />
              <TabBtn id="charts" icon={Star} label="Saved Charts" />
              <TabBtn id="pdf" icon={FileText} label="PDF Requests" />
              <TabBtn id="poetry" icon={BookOpen} label="Poetry" />
              <TabBtn id="account" icon={KeyRound} label="Account" />
            </div>

            {/* search/refresh bar — only for the list tabs (not poetry/account) */}
            {(tab === 'memories' || tab === 'farewell' || tab === 'remedy' || tab === 'charts' || tab === 'pdf' || tab === 'readings') && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg/40" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…" className="w-full rounded-xl border border-fg/15 bg-fg/5 py-3 pl-9 pr-4 text-base outline-none focus:border-amber-300/50 sm:py-2.5 sm:text-sm" />
              </div>
              {tab === 'farewell' && (
                <button onClick={exportCsv} disabled={filteredRsvps.length === 0} className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300/10 px-4 py-2.5 font-mono text-xs text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-50">
                  <Download size={14} /> CSV
                </button>
              )}
              <button onClick={() => load()} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-fg/15 bg-fg/5 px-4 py-2.5 font-mono text-xs text-fg/80 transition hover:bg-fg/10 disabled:opacity-60">
                <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh
              </button>
              <span className="font-mono text-xs text-fg/50">{shown} / {total}</span>
            </div>
            )}

            {/* ── POETRY MANAGER ── */}
            {tab === 'poetry' && <div className="mt-4"><AdminPoetryManager token={token} /></div>}

            {/* ── ACCOUNT: change password ── */}
            {tab === 'account' && (
              <div className="mt-4 max-w-md">
                <form onSubmit={changePassword} className="rounded-2xl border border-fg/10 bg-fg/5 p-6">
                  <div className="mb-4 flex items-center gap-2">
                    <KeyRound size={18} className="text-jade-light" />
                    <h2 className="font-serif text-lg font-bold">Change password</h2>
                  </div>
                  {pwMsg && (
                    <p className={`mb-4 rounded-xl border px-4 py-2.5 font-mono text-sm ${pwMsg.ok ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200' : 'border-rose-400/40 bg-rose-500/10 text-rose-200'}`}>{pwMsg.text}</p>
                  )}
                  <label className="block">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-fg/50">Current password</span>
                    <input type="password" required autoComplete="current-password" value={curPw} onChange={(e) => setCurPw(e.target.value)} className="mt-1.5 w-full rounded-xl border border-fg/15 bg-fg/5 px-4 py-3 text-base outline-none focus:border-jade/50 sm:py-2.5 sm:text-sm" />
                  </label>
                  <label className="mt-4 block">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-fg/50">New password</span>
                    <input type="password" required autoComplete="new-password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-1.5 w-full rounded-xl border border-fg/15 bg-fg/5 px-4 py-3 text-base outline-none focus:border-jade/50 sm:py-2.5 sm:text-sm" />
                    <span className="mt-1.5 block font-mono text-[11px] text-fg/40">8+ chars with upper, lower, digit &amp; symbol; different from current.</span>
                  </label>
                  <button type="submit" disabled={pwBusy} className="mt-5 w-full rounded-xl bg-gradient-to-r from-lime-300 to-emerald-400 px-5 py-3 font-serif text-sm font-bold text-[#0E1411] transition hover:brightness-105 disabled:opacity-60">
                    {pwBusy ? 'Updating…' : 'Update password'}
                  </button>
                </form>
              </div>
            )}

            {/* ── MEMORIES TABLE ── */}
            {tab === 'memories' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Author</th>
                      <th className="px-4 py-3">Place</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3 whitespace-nowrap">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMemories.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No memories.'}</td></tr>
                    ) : filteredMemories.map((m) => (
                      <tr key={m.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-4 py-3 font-medium text-amber-200">{m.author}</td>
                        <td className="px-4 py-3 font-mono text-xs text-fg/60">{m.landmark}</td>
                        <td className="px-4 py-3 text-fg/90">{m.message}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(m.createdAt || '').slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── FAREWELL RSVP TABLE ── */}
            {tab === 'farewell' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 whitespace-nowrap">Joining?</th>
                      <th className="px-4 py-3 whitespace-nowrap">Dates available</th>
                      <th className="px-4 py-3 whitespace-nowrap">Food</th>
                      <th className="px-4 py-3">Plant</th>
                      <th className="px-4 py-3">Message</th>
                      <th className="px-4 py-3 whitespace-nowrap">Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRsvps.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No RSVPs yet.'}</td></tr>
                    ) : filteredRsvps.map((r) => (
                      <tr key={r.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-4 py-3 font-medium text-emerald-200">{r.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {r.attending
                            ? <span className="rounded-full bg-emerald-400/15 px-2 py-0.5 font-mono text-[11px] text-emerald-200">Yes</span>
                            : <span className="rounded-full bg-rose-400/15 px-2 py-0.5 font-mono text-[11px] text-rose-200">No</span>}
                        </td>
                        <td className="px-4 py-3 text-fg/80">{r.datesAvailable || <span className="text-fg/30">—</span>}</td>
                        <td className="px-4 py-3 text-fg/80">{r.foodPreference || <span className="text-fg/30">—</span>}</td>
                        <td className="px-4 py-3 font-mono text-xs capitalize text-fg/60">{r.plantType}</td>
                        <td className="px-4 py-3 text-fg/90">{r.message}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── PENDING READING REQUESTS (approve → generates the reading) ── */}
            {tab === 'readings' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[560px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Querent</th>
                      <th className="px-4 py-3 whitespace-nowrap">Requested</th>
                      <th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReadingReqs.length === 0 ? (
                      <tr><td colSpan={3} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No pending reading requests.'}</td></tr>
                    ) : filteredReadingReqs.map((r) => {
                      const busy = rowBusy?.id === r.id
                      return (
                        <tr key={r.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                          <td className="px-4 py-3 font-medium text-amber-300">{r.querentName || '—'}</td>
                          <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 16)}</td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1.5">
                              <button onClick={() => approveReading(r.id)} disabled={busy}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/50 bg-emerald-400/20 px-3 py-1.5 font-mono text-[11px] font-semibold text-emerald-100 transition hover:bg-emerald-400/30 disabled:opacity-60">
                                {busy && rowBusy?.action === 'approve'
                                  ? <><RefreshCw size={12} className="animate-spin" /> Generating Reading…</>
                                  : <><Check size={12} /> Approve</>}
                              </button>
                              <button onClick={() => rejectReading(r.id)} disabled={busy}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-400/30 bg-rose-400/10 px-3 py-1.5 font-mono text-[11px] text-rose-300 transition hover:bg-rose-400/20 disabled:opacity-60">
                                {busy && rowBusy?.action === 'reject' ? <RefreshCw size={12} className="animate-spin" /> : <X size={12} />} Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── REMEDY / CONTACT REQUESTS ── */}
            {tab === 'remedy' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[1000px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-3 py-3">Name</th><th className="px-3 py-3">Contact</th><th className="px-3 py-3">Area</th>
                      <th className="px-3 py-3">Message / Question</th><th className="px-3 py-3 whitespace-nowrap">Birth</th>
                      <th className="px-3 py-3">Status</th><th className="px-3 py-3">Notes</th>
                      <th className="px-3 py-3 whitespace-nowrap">Submitted</th><th className="px-3 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRemedies.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No requests.'}</td></tr>
                    ) : filteredRemedies.map((r) => (
                      <tr key={r.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-3 py-3 font-medium text-amber-300">{r.name || '—'}</td>
                        <td className="px-3 py-3 text-fg/90">{r.contact}</td>
                        <td className="px-3 py-3 font-mono text-xs text-fg/60">{r.area || '—'}</td>
                        <td className="max-w-[240px] px-3 py-3 text-fg/90">{r.message}</td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-fg/60">{r.birthInfo}</td>
                        <td className="px-3 py-3">
                          <select value={r.status || 'Pending'} onChange={(e) => setStatus(r.id, e.target.value)}
                            className={`rounded-lg border border-fg/15 bg-space px-2 py-1 font-mono text-[11px] ${statusColor(r.status)}`}>
                            {STATUSES.map((s) => <option key={s} value={s} className="text-black">{s}</option>)}
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input defaultValue={r.notes} placeholder="—" onBlur={(e) => { if (e.target.value !== r.notes) saveNotes(r.id, e.target.value) }}
                            className="w-32 rounded-lg border border-fg/12 bg-fg/5 px-2 py-1 text-xs text-fg/90 outline-none focus:border-accent/40" />
                        </td>
                        <td className="px-3 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 16)}</td>
                        <td className="px-3 py-3">
                          <div className="flex gap-1.5">
                            <button onClick={() => { setReply({ id: r.id, name: r.name, contact: r.contact }); setReplySubject(''); setReplyBody(''); setReplyMsg(null) }}
                              className="inline-flex items-center gap-1 rounded-lg border border-accent/30 bg-accent/10 px-2 py-1 font-mono text-[11px] text-accent-light transition hover:bg-accent/20"><Mail size={12} /> Reply</button>
                            <button onClick={() => deleteRemedy(r.id)} title="Delete"
                              className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300 transition hover:bg-rose-400/20"><Trash2 size={12} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── SAVED QUERENT CHARTS (opt-in, decrypted) ── */}
            {tab === 'charts' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Name</th><th className="px-4 py-3">Gender</th>
                      <th className="px-4 py-3 whitespace-nowrap">Birth date</th><th className="px-4 py-3 whitespace-nowrap">Time</th>
                      <th className="px-4 py-3">Time zone</th><th className="px-4 py-3 whitespace-nowrap">Lat,Lon</th>
                      <th className="px-4 py-3 whitespace-nowrap">Nay-Nan</th><th className="px-4 py-3 whitespace-nowrap">Saved</th><th className="px-4 py-3">Del</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCharts.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No saved charts.'}</td></tr>
                    ) : filteredCharts.map((c) => (
                      <tr key={c.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-4 py-3 font-medium text-amber-300">{c.name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs capitalize text-fg/70">{c.gender}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-fg/90">{c.birthDate}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/70">{c.birthTime}</td>
                        <td className="px-4 py-3 font-mono text-xs text-fg/60">{c.timeZone}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/60">{c.location}</td>
                        <td className="px-4 py-3 text-fg/80">{c.nayNan}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(c.createdAt || '').slice(0, 16)}</td>
                        <td className="px-4 py-3"><button onClick={() => deleteChart(c.id)} title="Delete" className="inline-flex items-center rounded-lg border border-rose-400/30 bg-rose-400/10 px-2 py-1 text-rose-300 transition hover:bg-rose-400/20"><Trash2 size={12} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── PDF REQUESTS (approve → email one-time link) ── */}
            {tab === 'pdf' && (
              <div className="mt-4 overflow-x-auto rounded-2xl border border-fg/10">
                <table className="w-full min-w-[760px] border-collapse text-left text-sm">
                  <thead className="bg-fg/5 font-mono text-[11px] uppercase tracking-wider text-fg/50">
                    <tr>
                      <th className="px-4 py-3">Email</th><th className="px-4 py-3">Name</th>
                      <th className="px-4 py-3 whitespace-nowrap">Birth</th><th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 whitespace-nowrap">Requested</th><th className="px-4 py-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPdfs.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-10 text-center font-mono text-sm text-fg/40">{loading ? 'Loading…' : 'No PDF requests.'}</td></tr>
                    ) : filteredPdfs.map((r) => (
                      <tr key={r.id} className="border-t border-fg/5 align-top hover:bg-fg/[0.03]">
                        <td className="px-4 py-3 font-medium text-amber-200">{r.email}</td>
                        <td className="px-4 py-3 text-fg/90">{r.name || '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/60">{r.birthInfo}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2 py-0.5 font-mono text-[11px] ${r.approvalStatus === 'Downloaded' ? 'bg-fg/10 text-fg/60' : r.approvalStatus === 'Approved' ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-200'}`}>{r.approvalStatus}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-fg/50">{(r.createdAt || '').slice(0, 16)}</td>
                        <td className="px-4 py-3">
                          {r.approvalStatus === 'Pending' ? (
                            <button onClick={() => approvePdf(r.id)} disabled={approving === r.id}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-300/30 bg-emerald-300/10 px-3 py-1.5 font-mono text-[11px] text-emerald-100 transition hover:bg-emerald-300/20 disabled:opacity-50">
                              {approving === r.id ? <RefreshCw size={12} className="animate-spin" /> : <Mail size={12} />} Approve &amp; Send Email
                            </button>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 font-mono text-[11px] text-emerald-200">✓ {r.approvalStatus === 'Downloaded' ? 'Downloaded' : 'Email Sent'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Reply / Send-reading modal ── */}
      {reply && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setReply(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-fg/10 bg-space p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-fg">Send reading to {reply.name || 'client'}</h3>
              <button onClick={() => setReply(null)} className="text-fg/50 hover:text-fg"><X size={18} /></button>
            </div>
            <p className="mb-3 font-mono text-[11px] text-fg/50">To: {reply.contact}</p>
            {replyMsg && <p className={`mb-3 rounded-xl border px-3 py-2 text-xs ${replyMsg.ok ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/40 bg-rose-400/10 text-rose-200'}`}>{replyMsg.text}</p>}
            <input value={replySubject} onChange={(e) => setReplySubject(e.target.value)} placeholder="Subject (optional)"
              className="mb-2 w-full rounded-xl border border-fg/15 bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50" />
            <textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} rows={9} placeholder="Type or paste the horoscope reading / remedy response here…"
              className="w-full resize-y rounded-xl border border-fg/15 bg-fg/5 px-3 py-2 text-sm text-fg outline-none focus:border-accent/50" />
            <div className="mt-3 flex items-center justify-end gap-2">
              <button onClick={() => setReply(null)} className="rounded-xl border border-fg/15 px-4 py-2 text-xs text-fg/70 transition hover:text-fg">Cancel</button>
              <button onClick={sendReply} disabled={replyBusy || !replyBody.trim()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-2 text-xs font-semibold text-space transition hover:brightness-110 disabled:opacity-50">
                {replyBusy ? <RefreshCw size={13} className="animate-spin" /> : <Send size={13} />} Send Reading to Client Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
