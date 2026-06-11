// ============================================================================
//  site.js — SINGLE SOURCE OF TRUTH for everything domain / environment specific.
//
//  To move the site to a new domain, change ONE value: VITE_SITE_URL (in a .env
//  file or in CI). Nothing else in the codebase hard-codes the domain.
//
//  Every value falls back to a sensible default, so the app also runs with no
//  .env present. Vite inlines `import.meta.env.*` at BUILD time, so these are
//  baked into the bundle — set them before `npm run build`.
//
//  Env vars (all optional, all must start with VITE_ to be exposed to the client):
//    VITE_SITE_URL       canonical absolute origin   → https://myothant.dev
//    VITE_API_URL        backend API origin          → https://myweb-zqv1.onrender.com
//    VITE_CONTACT_EMAIL  public contact address      → ai@myothant.dev
//    VITE_LINE_URL       LINE / AI-bot chat link     → https://lin.ee/s72ayHD
//    VITE_COFFEE_URL     external "Bean Boutique" project link
//  (BASE path comes from Vite's own `base` config via import.meta.env.BASE_URL)
// ============================================================================

const trimSlash = (s) => String(s || '').replace(/\/+$/, '')
const stripLead  = (s) => String(s || '').replace(/^\/+/, '')

// import.meta.env.BASE_URL is set by vite.config `base` ('/Myweb/' today, '/' on
// an apex domain). Always ends with a slash.
const BASE = import.meta.env.BASE_URL || '/'

export const SITE = {
  // Canonical absolute origin — used ONLY for absolute links/SEO (og:url, canonical).
  url: trimSlash(import.meta.env.VITE_SITE_URL || 'https://myothant.dev'),

  // Path the app is served from (build-relative). Use this for in-site assets.
  base: BASE,

  // Backend API origin.
  apiUrl: trimSlash(import.meta.env.VITE_API_URL || 'https://myweb-zqv1.onrender.com'),

  // Public contact email + ready-made mailto.
  email: import.meta.env.VITE_CONTACT_EMAIL || 'ai@myothant.dev',
  get mailto() { return `mailto:${this.email}` },

  // LINE / AI-bot chat link.
  lineUrl: import.meta.env.VITE_LINE_URL || 'https://lin.ee/s72ayHD',

  // External "Bean Boutique" demo project (lives in a separate repo).
  coffeeUrl: import.meta.env.VITE_COFFEE_URL || 'https://johnathanmt.github.io/bean-boutique-coffee-shop/',

  // ---- helpers --------------------------------------------------------------
  // Build-relative path to a file in /public (e.g. asset('blog.html') → '/Myweb/blog.html').
  asset(path) { return BASE + stripLead(path) },

  // Absolute URL on the canonical domain (e.g. abs('blog.html') → 'https://myothant.dev/blog.html').
  abs(path) { return `${this.url}/${stripLead(path)}` },
}

export default SITE
