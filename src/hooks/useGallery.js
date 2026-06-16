import { useMemo } from 'react'
import { GALLERY } from '../data/galleryData'

/**
 * useGallery — single source of truth for gallery data, shared by the homepage
 * GallerySection (highlights) and the dedicated GalleryPage (grouped masonry).
 *
 *  THE FOLDER IS THE SOURCE OF TRUTH: every image in src/assets/images/gallery/
 *  is discovered automatically via import.meta.glob (Vite bundles + hashes them).
 *  galleryData.js is an OPTIONAL metadata layer matched by filename, adding
 *  i18n caption/alt and the date / moment / highlight fields.
 *
 * Returns:
 *   all         — every item, sorted CHRONOLOGICALLY newest-first by `date`
 *                 (undated items fall to the end): { id, file, url, meta }
 *   highlights  — up to MAX_HIGHLIGHTS items for the homepage hexagon grid
 *   sections    — [ ['August 2024 — Work Life', [items]], … ] newest-first,
 *                 grouped by month+year+moment, for the grouped gallery page
 *   captionOf / altOf — i18n resolvers (fall back to a filename-derived label)
 *   MAX_HIGHLIGHTS
 */

// How many photos the homepage hexagon grid shows (keep it 10–15).
export const MAX_HIGHLIGHTS = 12

// FOLDER = source of truth. eager glob → { '../assets/.../x.jpg': '/hashed-url' }
const IMAGES = import.meta.glob(
  '../assets/images/gallery/*.{jpg,jpeg,png,webp,avif}',
  { eager: true, import: 'default', query: '?url' }
)

// Optional metadata, keyed by filename for quick lookup.
const META = Object.fromEntries(GALLERY.map((g) => [g.file, g]))

// Turn a filename into a clean label: 'new-photo_02.jpg' → 'New Photo 02'.
const labelFromFile = (file) =>
  file.replace(/\.[^.]+$/, '')      // drop extension
      .replace(/[_-]+/g, ' ')       // _ and - → space
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
  return d ? d.getTime() : -Infinity   // undated → sorts to the end
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December']

// Group label: "August 2024 — Work Life" (or "Undated — Moments" with no date).
const sectionLabel = (it) => {
  const d = parseDate(it.meta?.date)
  const moment = it.meta?.moment || 'Moments'
  return d ? `${MONTHS[d.getMonth()]} ${d.getFullYear()} — ${moment}` : `Undated — ${moment}`
}

// Build the full render list FROM THE FOLDER, attaching metadata when present,
// then sort CHRONOLOGICALLY newest-first (filename as a stable tiebreaker).
const ALL_ITEMS = Object.entries(IMAGES)
  .map(([path, url]) => {
    const file = path.split('/').pop()
    return { id: file, file, url, meta: META[file] || null }
  })
  .sort((a, b) => (timeOf(b) - timeOf(a)) || a.file.localeCompare(b.file))

// HIGHLIGHTS: prefer explicitly-flagged photos, else the newest MAX_HIGHLIGHTS.
const FEATURED = ALL_ITEMS.filter((it) => it.meta?.highlight)
const HIGHLIGHTS = (FEATURED.length ? FEATURED : ALL_ITEMS).slice(0, MAX_HIGHLIGHTS)

// SECTIONS: group by month+year+moment. ALL_ITEMS is already newest-first, so a
// Map preserves that order → sections (and items within them) stay newest-first.
const SECTIONS = (() => {
  const map = new Map()
  for (const it of ALL_ITEMS) {
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

  // Data is module-level + immutable, so memoize references for stable identity.
  const all = useMemo(() => ALL_ITEMS, [])
  const highlights = useMemo(() => HIGHLIGHTS, [])
  const sections = useMemo(() => SECTIONS, [])

  return { all, highlights, sections, captionOf, altOf, MAX_HIGHLIGHTS }
}
