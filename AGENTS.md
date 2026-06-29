# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **frontend-only** personal portfolio (Vite + React 19 + TypeScript + Tailwind). There is **no backend or database in this repo**; `VITE_API_URL` points at an external Render service used only for an optional "warm-up" ping and the visitor globe.

### Services & how to run them
- **Dev server**: `npm run dev` (Vite). It serves at `http://localhost:5173/Myweb/` — note the non-root `/Myweb/` base path (Vite `base` defaults to `/Myweb/` unless `VITE_BASE=/` is set). Loading `http://localhost:5173/` will 404; always use the `/Myweb/` path.
- **Type check** (there is no ESLint/lint script): `npm run typecheck` (`tsc --noEmit`).
- **Production build**: `npm run build` — runs `gen-sitemap.mjs`, then `vite build`, then `inject-site.mjs` (token replacement). Preview with `npm run preview`.

### Non-obvious gotchas
- `--legacy-peer-deps` is required for installs; it is already set in `.npmrc` (`legacy-peer-deps=true`), so a plain `npm install` works. The 3D stack (`@react-three/*`) declares peer deps that otherwise cause `ERESOLVE` conflicts.
- Build-time config comes from `VITE_*` env vars (see `.env.example`); they are baked in at build time. The app runs fine for local dev without a `.env` file (sensible defaults are used).
- Heavy sections (three.js globe, simulations) are `React.lazy` code-split; on first load a brief "System Booting…" boot screen and per-section skeletons/loaders are expected behavior, not errors.
