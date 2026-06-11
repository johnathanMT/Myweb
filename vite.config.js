import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is the path the site is served from:
//   • GitHub Pages project site  → '/Myweb/'  (default)
//   • Custom apex domain (myothant.dev) → '/'
// Override with the VITE_BASE env var at build time so you never edit this file
// when migrating. Example:  VITE_BASE=/ npm run build
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/Myweb/',
})
