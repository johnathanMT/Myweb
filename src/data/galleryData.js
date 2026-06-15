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
// ============================================================================

export const GALLERY = [
  {
    id: 'graduation',
    file: 'graduation.webp',
    alt: { en: 'Graduation day' },
    caption: { en: 'Graduation Day', mm: 'ဘွဲ့ယူနေ့', jp: '卒業の日' },
  },
  {
    id: 'mtn-desk',
    file: 'mtn_deskN.webp',
    alt: { en: 'At my workstation' },
    caption: { en: 'My Workstation', mm: 'ကျွန်ုပ်၏ အလုပ်ခုံ', jp: '僕のワークステーション' },
  },
  {
    id: 'mtn-namba',
    file: 'mtn_namba.webp',
    alt: { en: 'Namba district, Osaka' },
    caption: { en: 'Namba, Osaka', mm: 'နန်ဘ၊ အိုဆာကာ', jp: '難波・大阪' },
  },
  {
    id: 'osaka-ai',
    file: 'osaka_ai.webp',
    alt: { en: 'Osaka' },
    caption: { en: 'Osaka Vibes', mm: 'အိုဆာကာ', jp: '大阪の風景' },
  },
  {
    id: 'mtn-zoo',
    file: 'mtn_zoo.webp',
    alt: { en: 'A day at the zoo' },
    caption: { en: 'At the Zoo', mm: 'တိရစ္ဆာန်ဥယျာဉ်တွင်', jp: '動物園にて' },
  },
  {
    id: 'mtn-tarot',
    file: 'mtn_tarrot.webp',
    alt: { en: 'Tarot and fortune' },
    caption: { en: 'Tarot & Fortune', mm: 'တာရော့ဟောကိန်း', jp: 'タロット占い' },
  },
  {
    id: 'mtn-longhair',
    file: 'mtn_longhair.webp',
    alt: { en: 'Throwback portrait' },
    caption: { en: 'Throwback', mm: 'အတိတ်အမှတ်တရ', jp: '思い出の一枚' },
  },
  {
    id: 'zawgyi',
    file: 'zawgyi.webp',
    alt: { en: 'Zawgyi — Burmese alchemist figure' },
    caption: { en: 'Zawgyi', mm: 'ဇော်ဂျီ', jp: 'ゾージー' },
  },
  // ── Add new photos here ↓ (drop the file in src/assets/images/gallery/ first) ──
  // { id: 'unique-id', file: 'my-photo.webp',
  //   alt: { en: 'Alt text' }, caption: { en: 'Caption', mm: '...', jp: '...' } },
]
