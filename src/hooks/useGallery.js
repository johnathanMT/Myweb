import { useMemo } from 'react'
import { GALLERY } from '../data/galleryData'

/**
 * useGallery — single source of truth for gallery data.
 *
 *  TWO DISTINCT FOLDERS (foolproof photo management — no overlap, no flags):
 *    • src/assets/images/highlights/  → the HOMEPAGE HEXAGON grid.
 *    • src/assets/images/gallery/     → the dedicated /gallery PAGE.
 *  Drop a file in the relevant folder and it appears there automatically (Vite
 *  bundles + content-hashes it). A photo can live in BOTH folders if you want it
 *  featured on the homepage AND listed in the full gallery — just place a copy
 *  in each.
 *
 *  galleryData.js is an OPTIONAL metadata layer matched by filename, adding
 *  i18n caption/alt plus the date / moment fields (used for sorting + grouping).
 *  It applies to a file in EITHER folder.
 *
 * Returns:
 *   highlights  — items from highlights/, newest-first by `date` (for hexagons)
 *   sections    — [ ['August 2024 — Work Life', [items]], … ] newest-first,
 *                 grouped by month+year+moment, from gallery/ (for the page)
 *   captionOf / altOf — i18n resolvers (fall back to a filename-derived label)
 */

// Two separate, explicit globs — the ONLY place the folders are referenced.
// NOTE: Vite statically analyzes import.meta.glob, so the options MUST be an
// inline object literal here (a shared variable is not allowed).
const HIGHLIGHT_IMAGES = import.meta.glob('../assets/images/highlights/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default', query: '?url' })
const GALLERY_IMAGES   = import.meta.glob('../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}', { eager: true, import: 'default', query: '?url' })

// Optional metadata, keyed by filename for quick lookup (shared by both folders).
const META = Object.fromEntries(GALLERY.map((g) => [g.file, g]))

// Turn a filename into a clean label: 'new-photo_02.jpg' → 'New Photo 02'.
const labelFromFile = (file) =>
  file.replace(/\.[^.]+$/, '')
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (c) => c.toUpperCase())

// Parse a strict 'YYYY-MM-DD' string into a local Date (no timezone drift).
const parseDate = (s) => {
  if (typeof s !== 'string') return null
  const [y, m, d] = s.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
const timeOf = (it) => {
  const d = parseDate(it.meta?.date)
  return d ? d.getTime() : -Infinity // undated → sorts to the end
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

const sectionLabel = (it) => {
  const d = parseDate(it.meta?.date)
  const moment = it.meta?.moment || 'Moments'
  return d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()} — ${moment}` : `Undated — ${moment}`
}

// Build a sorted item list (newest-first by date, filename as tiebreaker).
const buildItems = (images) =>
  Object.entries(images)
    .map(([path, url]) => {
      const file = path.split('/').pop()
      return { id: file, file, url, meta: META[file] || null }
    })
    .sort((a, b) => (timeOf(b) - timeOf(a)) || a.file.localeCompare(b.file))

// HIGHLIGHTS: everything in the highlights/ folder (the folder is the curation).
const HIGHLIGHTS = buildItems(HIGHLIGHT_IMAGES)

// FULL GALLERY ITEMS + SECTIONS (grouped, newest-first via insertion order).
const GALLERY_ITEMS = buildItems(GALLERY_IMAGES)
const SECTIONS = (() => {
  const map = new Map()
  for (const it of GALLERY_ITEMS) {
    const key = sectionLabel(it)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(it)
  }
  return [...map.entries()]
})()

export function useGallery(lang = 'en') {
  const pick = (obj) => (obj && (obj[lang] || obj.en)) || ''
  const captionOf = (it) => (it.meta && pick(it.meta.caption)) || labelFromFile(it.file)
  const altOf = (it) => (it.meta && pick(it.meta.alt)) || captionOf(it)

  const highlights = useMemo(() => HIGHLIGHTS, [])
  const sections = useMemo(() => SECTIONS, [])

  return { highlights, sections, captionOf, altOf }
}
