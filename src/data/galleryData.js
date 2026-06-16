// ============================================================================
//  galleryData.js — SINGLE SOURCE OF TRUTH for the Memory Gallery (metadata only).
//
//  Images live in  src/assets/images/gallery/  and are bundled + content-hashed
//  by Vite via import.meta.glob in GallerySection.jsx (automatic cache-busting).
//
//  To add a photo:
//    1. Drop the image into  src/assets/images/gallery/  (jpg/png/webp — NOT heic)
//    2. Add ONE entry below whose `file` matches the filename exactly.
//
//  `alt` and `caption` are i18n objects ({ en, mm, jp, ... }). Only `en` is
//  required — GallerySection falls back to `en` for any missing language.
//  Captions are PLACEHOLDERS — edit freely; the layout won't change.
//
//  NEW FIELDS (used by the dedicated /gallery page + homepage highlights):
//    • date      — strict 'YYYY-MM-DD' string. Drives BOTH the chronological
//                  sort (newest first) AND the section grouping. Always include.
//    • moment    — string; the event/chapter name, e.g. 'Relocation',
//                  'Work Life', 'Travel'. Combined with the date's month+year
//                  it forms a section title like "August 2024 — Work Life".
//    • highlight — true → also featured in the homepage hexagon grid.
//  (dates below are GUESSES — edit them to your real timeline; the gallery
//   re-sorts and re-groups automatically.)
//
//  ── HOW TO ADD A PHOTO ──────────────────────────────────────────────────────
//    1. Drop the image in  src/assets/images/gallery/  (jpg/png/webp — not heic)
//    2. Add ONE entry below whose `file` matches the filename exactly:
//         {
//           id: 'unique-id',
//           file: 'my-photo.webp',
//           date: '2025-07-14',          // YYYY-MM-DD — controls sort + group
//           moment: 'Travel',            // section name
//           highlight: true,             // optional → show on homepage hexagons
//           alt:     { en: 'Alt text' },
//           caption: { en: 'Caption', mm: '...', jp: '...' },
//         }
// ============================================================================

export const GALLERY = [
  {
    id: 'graduation',
    file: 'graduation.webp',
    date: '2022-03-20',
    moment: 'Graduation',
    highlight: true,
    alt: { en: 'Graduation day' },
    caption: { en: 'Graduation Day', mm: 'ဘွဲ့ယူနေ့', jp: '卒業の日' },
  },
  {
    id: 'mtn-desk',
    file: 'mtn_deskN.webp',
    date: '2024-06-10',
    moment: 'Work Life',
    highlight: true,
    alt: { en: 'At my workstation' },
    caption: { en: 'My Workstation', mm: 'ကျွန်ုပ်၏ အလုပ်ခုံ', jp: '僕のワークステーション' },
  },
  {
    id: 'mtn-namba',
    file: 'mtn_namba.webp',
    date: '2024-09-05',
    moment: 'Work Life',
    highlight: true,
    alt: { en: 'Namba district, Osaka' },
    caption: { en: 'Namba, Osaka', mm: 'နန်ဘ၊ အိုဆာကာ', jp: '難波・大阪' },
  },
  {
    id: 'osaka-ai',
    file: 'osaka_ai.webp',
    date: '2025-04-12',
    moment: 'Travel',
    highlight: true,
    alt: { en: 'Osaka' },
    caption: { en: 'Osaka Vibes', mm: 'အိုဆာကာ', jp: '大阪の風景' },
  },
  {
    id: 'mtn-zoo',
    file: 'mtn_zoo.webp',
    date: '2025-05-03',
    moment: 'Travel',
    highlight: false,
    alt: { en: 'A day at the zoo' },
    caption: { en: 'At the Zoo', mm: 'တိရစ္ဆာန်ဥယျာဉ်တွင်', jp: '動物園にて' },
  },
  {
    id: 'mtn-tarot',
    file: 'mtn_tarrot.webp',
    date: '2024-11-22',
    moment: 'Work Life',
    highlight: false,
    alt: { en: 'Tarot and fortune' },
    caption: { en: 'Tarot & Fortune', mm: 'တာရော့ဟောကိန်း', jp: 'タロット占い' },
  },
  {
    id: 'mtn-longhair',
    file: 'mtn_longhair.webp',
    date: '2021-08-01',
    moment: 'Throwback',
    highlight: false,
    alt: { en: 'Throwback portrait' },
    caption: { en: 'Throwback', mm: 'အတိတ်အမှတ်တရ', jp: '思い出の一枚' },
  },
  {
    id: 'zawgyi',
    file: 'zawgyi.webp',
    date: '2022-01-15',
    moment: 'Relocation',
    highlight: true,
    alt: { en: 'Zawgyi — Burmese alchemist figure' },
    caption: { en: 'Zawgyi', mm: 'ဇော်ဂျီ', jp: 'ゾージー' },
  },
  // ── Add new photos here ↓ (drop the file in src/assets/images/gallery/ first) ──
  // { id: 'unique-id', file: 'my-photo.webp', date: '2025-07-14', moment: 'Travel', highlight: false,
  //   alt: { en: 'Alt text' }, caption: { en: 'Caption', mm: '...', jp: '...' } },
]
