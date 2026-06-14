// ESM API client for the React app (the static pages use public/api.js instead).
import { SITE } from '../config/site'
const BASE_URL = SITE.apiUrl
const TOKEN_KEY = 'mtn_jwt'
const VISITOR_KEY = 'mtn_visitor'
const token = () => localStorage.getItem(TOKEN_KEY)

// Stable anonymous visitor id (for dedupe of likes/reactions; no login, no PII)
const visitorId = () => {
  let v = localStorage.getItem(VISITOR_KEY)
  if (!v) {
    v = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`)
    localStorage.setItem(VISITOR_KEY, v)
  }
  return v
}

async function req(path, opts = {}) {
  const headers = { 'X-Visitor-Id': visitorId(), ...(opts.headers || {}) }
  if (token()) headers.Authorization = `Bearer ${token()}`

  // Abort a hung request (e.g. backend never responds) but allow enough time for
  // Render's free-tier cold start (~30s). Override per-call with opts.timeout.
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), opts.timeout ?? 30000)

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { ...opts, headers, signal: ctrl.signal })
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The server took too long to respond. Please try again.')
    throw err
  } finally {
    clearTimeout(timer)
  }

  const text = await res.text()
  let json = null
  if (text) {
    try { json = JSON.parse(text) } catch { /* non-JSON (e.g. 502 HTML) — leave json null */ }
  }
  if (!res.ok) throw new Error(json?.message || `Request failed (${res.status})`)
  return json
}

export const api = {
  BASE_URL,

  getArticles: ({ page = 1, pageSize = 6, search } = {}) => {
    const q = new URLSearchParams({ page, pageSize, published: true })
    if (search) q.set('search', search)
    return req(`/api/Articles?${q.toString()}`)
  },

  getArticle: (id) => req(`/api/Articles/${id}`),

  // NOTE: these interaction endpoints do NOT exist on the backend yet.
  // Add an InteractionsController (+ tables) to make them real; until then the
  // card falls back to optimistic client-side state. All are ANONYMOUS (no auth).
  likeArticle: (id) =>
    req(`/api/Articles/${id}/like`, { method: 'POST' }),

  unlikeArticle: (id) =>
    req(`/api/Articles/${id}/like`, { method: 'DELETE' }),

  // Quick reaction from a fixed server-validated set (e.g. love, clap, fire, idea…)
  reactArticle: (id, reactionKey) =>
    req(`/api/Articles/${id}/reactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reaction: reactionKey }),
    }),

  // Wake the free-tier backend (cold start)
  wake: () => fetch(`${BASE_URL}/`).catch(() => {}),
}
