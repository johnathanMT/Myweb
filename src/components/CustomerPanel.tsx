import { useState, useEffect, useCallback, useImperativeHandle, forwardRef, type FormEvent } from 'react'
import { LogOut, Loader2, Pencil, Check, UserRound, X } from 'lucide-react'
import { SITE } from '../config/site'
import type { Lang } from '../lib/jyotish'

const API = SITE.apiUrl
const CUST_TOKEN = 'mtn_customer_jwt'

export interface SavedChart {
  id: number; name: string; gender: string; birthDate: string; birthTime: string
  timeZone: string; latitude: number; longitude: number; nayNan: number; createdAt: string
}

/**
 * CustomerPanel — querent (customer) accounts on the Vedin page. Email-only
 * sign-up with confirmation, login, editable username, and saved charts that
 * autofill the form. Reports the auth token upward via onAuthChange.
 */
/** Imperative handle so the parent (Jyotish) can open the auth modal from the
 *  reading tab's gate button, and inject a token from an email-confirm redirect. */
export interface CustomerPanelHandle {
  openAuth: (mode: 'login' | 'signup') => void
  ingestToken: (token: string) => void
}

const CustomerPanel = forwardRef<CustomerPanelHandle, {
  lang: Lang
  onLoadChart: (c: SavedChart) => void
  onAuthChange: (token: string | null) => void
}>(function CustomerPanel({ lang, onLoadChart, onAuthChange }, ref) {
  const [token, setToken] = useState<string>(() => { try { return localStorage.getItem(CUST_TOKEN) || '' } catch { return '' } })
  const [me, setMe] = useState<{ id: number; email: string; username: string } | null>(null)
  const [modal, setModal] = useState<null | 'login' | 'signup'>(null)
  const [email, setEmail] = useState(''); const [username, setUsername] = useState('')
  const [pw, setPw] = useState(''); const [pw2, setPw2] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [charts, setCharts] = useState<SavedChart[]>([])
  const [editingName, setEditingName] = useState(false); const [newName, setNewName] = useState('')
  const [needsVerify, setNeedsVerify] = useState(false); const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const id = window.setInterval(() => setCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000)
    return () => window.clearInterval(id)
  }, [cooldown])
  const resendConfirm = async () => {
    if (cooldown > 0) return
    try {
      await fetch(`${API}/api/customer/resend-confirmation`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim() }) })
      setMsg({ ok: true, text: t('Confirmation email sent — check your inbox (and spam).', 'အတည်ပြု email ပို့ပြီးပါပြီ — inbox (နှင့် spam) ကို စစ်ပါ။') })
      setCooldown(60)
    } catch { setMsg({ ok: false, text: t('Could not send — try again.', 'ပို့၍မရပါ — ပြန်ကြိုးစားပါ။') }) }
  }

  const t = (en: string, mm: string) => (lang === 'mm' ? mm : en)
  const persist = (tk: string) => { try { tk ? localStorage.setItem(CUST_TOKEN, tk) : localStorage.removeItem(CUST_TOKEN) } catch { /* ignore */ } }

  useEffect(() => { onAuthChange(token || null) }, [token, onAuthChange])

  // Parent-driven controls: open the auth modal, or ingest a token from the
  // email-confirmation redirect (?token=…).
  useImperativeHandle(ref, () => ({
    openAuth: (mode) => { setModal(mode); setMsg(null); setNeedsVerify(false) },
    ingestToken: (tk) => { if (!tk) return; setToken(tk); persist(tk); setModal(null) },
  }), [])

  const loadMe = useCallback(async (tk: string) => {
    try {
      const r = await fetch(`${API}/api/customer/me`, { headers: { Authorization: `Bearer ${tk}` } })
      if (!r.ok) { setToken(''); persist(''); return }
      const j = await r.json(); setMe(j.data)
    } catch { /* ignore */ }
  }, [])
  const loadCharts = useCallback(async (tk: string) => {
    try {
      const r = await fetch(`${API}/api/customer/my-charts`, { headers: { Authorization: `Bearer ${tk}` } })
      const j = await r.json(); setCharts(Array.isArray(j.data) ? j.data : [])
    } catch { /* ignore */ }
  }, [])
  useEffect(() => { if (token) { loadMe(token); loadCharts(token) } else { setMe(null); setCharts([]) } }, [token, loadMe, loadCharts])

  const login = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg(null)
    try {
      const r = await fetch(`${API}/api/customer/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), password: pw }) })
      const j = await r.json()
      if (!r.ok || !j?.data?.token) throw new Error(j?.message || 'Login failed')
      setToken(j.data.token); persist(j.data.token); setModal(null); setPw(''); setPw2(''); setNeedsVerify(false)
    } catch (err) {
      const text = err instanceof Error ? err.message : 'Login failed'
      setMsg({ ok: false, text })
      if (/confirm/i.test(text)) setNeedsVerify(true)   // unverified email → offer resend
    } finally { setBusy(false) }
  }
  const signup = async (e: FormEvent) => {
    e.preventDefault()
    if (pw !== pw2) { setMsg({ ok: false, text: t('Passwords do not match.', 'Password နှစ်ခု မတူပါ။') }); return }
    setBusy(true); setMsg(null)
    try {
      const r = await fetch(`${API}/api/customer/signup`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: email.trim(), username: username.trim(), password: pw, confirmPassword: pw2 }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.message || 'Sign up failed')
      setMsg({ ok: true, text: t('Account created — confirm the email we sent, then sign in.', 'အကောင့်ဖန်တီးပြီး — ပို့လိုက်သည့် အီးမေးလ်ကို အတည်ပြုပြီးမှ အကောင့်ဝင်ပါ။') })
      setModal('login'); setPw(''); setPw2('')
    } catch (err) { setMsg({ ok: false, text: err instanceof Error ? err.message : 'Sign up failed' }) } finally { setBusy(false) }
  }
  const logout = () => { setToken(''); persist(''); setMe(null); setCharts([]) }
  const saveUsername = async () => {
    if (!newName.trim()) return
    try {
      const r = await fetch(`${API}/api/customer/username`, { method: 'PATCH', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ username: newName.trim() }) })
      if (!r.ok) throw new Error()
      setMe((m) => (m ? { ...m, username: newName.trim() } : m)); setEditingName(false)
    } catch { /* ignore */ }
  }
  const inputCls = 'mt-1 w-full rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-fg outline-none focus:border-accent/50'

  return (
    <div className="no-print">
      {/* ── Auth bar ── */}
      {!token ? (
        <div className="glass-card flex flex-wrap items-center justify-between gap-3 p-4">
          <span className="text-sm text-muted">{t('Sign in to save your charts and download your reading PDF.', 'အကောင့်ဝင်၍ ဇာတာများ သိမ်းပြီး PDF ဟောစာတမ်း ရယူနိုင်ပါသည်။')}</span>
          <div className="flex gap-2">
            <button type="button" onClick={() => { setModal('login'); setMsg(null) }} className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs text-fg transition hover:border-accent/40">{t('Sign in', 'အကောင့်ဝင်')}</button>
            <button type="button" onClick={() => { setModal('signup'); setMsg(null) }} className="rounded-xl bg-gradient-to-r from-accent to-violet-500 px-4 py-2 text-xs font-semibold text-space transition hover:brightness-110">{t('Sign up', 'အကောင့်ဖွင့်')}</button>
          </div>
        </div>
      ) : (
        <div className="glass-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-accent-light"><UserRound size={16} /></span>
              {editingName ? (
                <span className="flex items-center gap-1">
                  <input value={newName} onChange={(e) => setNewName(e.target.value)} className="w-32 rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-sm text-fg outline-none" />
                  <button type="button" onClick={saveUsername} className="text-jade"><Check size={15} /></button>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-fg">{me?.username}</span>
                  <button type="button" onClick={() => { setNewName(me?.username || ''); setEditingName(true) }} className="text-muted hover:text-fg"><Pencil size={12} /></button>
                </span>
              )}
              <span className="font-mono text-[11px] text-muted">· {me?.email}</span>
            </div>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-muted transition hover:text-fg"><LogOut size={13} /> {t('Log out', 'ထွက်')}</button>
          </div>

          {charts.length > 0 && (
            <div className="mt-3 border-t border-white/8 pt-3">
              <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-muted">{t('Your saved charts', 'သိမ်းထားသော ဇာတာများ')}</p>
              <ul className="space-y-1.5">
                {charts.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                    <span className="text-xs text-fg/90">{c.name || t('(unnamed)', '(အမည်မဲ့)')} <span className="font-mono text-muted">· {c.birthDate} {c.birthTime}</span></span>
                    <button type="button" onClick={() => onLoadChart(c)} className="rounded-full border border-accent/30 bg-accent/10 px-3 py-0.5 text-[11px] text-accent-light transition hover:bg-accent/20">{t('Load & view', 'ဖွင့်ကြည့်')}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Auth modal ── */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => setModal(null)}>
          <div className="glass-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-groovy text-lg text-fg">{modal === 'login' ? t('Sign in', 'အကောင့်ဝင်') : t('Create account', 'အကောင့်ဖွင့်')}</h3>
              <button type="button" onClick={() => setModal(null)} className="text-muted hover:text-fg"><X size={18} /></button>
            </div>
            {msg && <p className={`mb-3 rounded-xl border px-3 py-2 text-xs ${msg.ok ? 'border-jade/40 bg-jade/10 text-jade' : 'border-coral/40 bg-coral/10 text-coral'}`}>{msg.text}</p>}
            <form onSubmit={modal === 'login' ? login : signup} className="space-y-3">
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Email', 'အီးမေးလ်')}</span>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></label>
              {modal === 'signup' && (
                <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Username', 'အသုံးပြုသူအမည်')}</span>
                  <input required value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} /></label>
              )}
              <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Password', 'စကားဝှက်')}</span>
                <input type="password" required minLength={8} value={pw} onChange={(e) => setPw(e.target.value)} className={inputCls} /></label>
              {modal === 'signup' && (
                <label className="block"><span className="font-mono text-[11px] uppercase tracking-wider text-muted">{t('Confirm password', 'စကားဝှက် အတည်ပြု')}</span>
                  <input type="password" required minLength={8} value={pw2} onChange={(e) => setPw2(e.target.value)} className={`${inputCls} ${pw2 && pw !== pw2 ? 'border-coral/50' : ''}`} /></label>
              )}
              <button type="submit" disabled={busy} className="w-full rounded-xl bg-gradient-to-r from-accent to-violet-500 px-5 py-2.5 text-sm font-semibold text-space transition hover:brightness-110 disabled:opacity-60">
                {busy ? <Loader2 size={15} className="mx-auto animate-spin" /> : modal === 'login' ? t('Sign in', 'ဝင်မည်') : t('Create account', 'အကောင့်ဖွင့်မည်')}
              </button>
            </form>
            {modal === 'login' && needsVerify && (
              <button type="button" onClick={resendConfirm} disabled={cooldown > 0}
                className="mt-3 w-full rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-xs text-accent-light transition hover:bg-accent/20 disabled:opacity-50">
                {cooldown > 0 ? t(`Resend in ${cooldown}s`, `${cooldown} စက္ကန့်အကြာ ပြန်ပို့`) : t('Resend confirmation email', 'အတည်ပြု email ပြန်ပို့ရန်')}
              </button>
            )}
            <button type="button" onClick={() => { setModal(modal === 'login' ? 'signup' : 'login'); setMsg(null); setNeedsVerify(false) }} className="mt-3 w-full text-center font-mono text-[11px] text-muted hover:text-fg">
              {modal === 'login' ? t("No account? Sign up", 'အကောင့်မရှိသေးဘူးလား? ဖွင့်မည်') : t('Have an account? Sign in', 'အကောင့်ရှိပြီးသားလား? ဝင်မည်')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
})

export default CustomerPanel
