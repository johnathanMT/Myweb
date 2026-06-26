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

  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // ── manualChunks: split big vendor libs into SEPARATE, long-cacheable
        //    files so the main bundle stays tiny and a visitor only downloads a
        //    heavy chunk when the feature that needs it actually renders. The
        //    chunk hashes only change when the library changes → repeat visits
        //    (and other pages) reuse the cached vendor files.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          // 3D / WebGL stack — only Sanctuary, the Immersive build, and the globe
          // use it; keep it far from the Hub's first paint.
          if (/[\\/]node_modules[\\/](three|@react-three|react-globe\.gl|cobe|postprocessing)/.test(id)) return 'three-vendor'
          if (id.includes('framer-motion')) return 'framer'
          if (id.includes('tsparticles')) return 'particles'
          if (id.includes('gsap')) return 'gsap'
          if (id.includes('simple-icons')) return 'icons'
          if (id.includes('dompurify')) return 'sanitize'
          // Core React runtime in its own stable chunk (rarely changes → great caching).
          if (/[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|scheduler)[\\/]/.test(id)) return 'react-vendor'
          return 'vendor'
        },
      },
    },
  },
})
