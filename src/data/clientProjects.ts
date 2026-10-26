/**
 * Client / real-world production sites, featured at the top of /projects.
 * Thumbnails are self-hosted WebP captures in public/projects/ (960×600).
 * Stack tags reflect what each site's production bundle actually ships.
 */
export interface ClientProject {
  id: string
  name: string
  /** Native-script name, rendered with lang="my". */
  localName?: string
  url: string
  thumb: string
  kind: string
  description: string
  highlights: string[]
  stack: string[]
  /** Slug of the /projects/:slug case study, when one exists. */
  caseStudy?: string
}

export const CLIENT_PROJECTS: ClientProject[] = [
  {
    id: 'maydarwe',
    name: 'May Dar We Dumpling Shop',
    localName: 'မေဓါဝီဖက်ထုပ်အိုးကပ်ဆိုင်',
    url: 'https://www.maydarwedumpling.com',
    thumb: 'projects/maydarwe-dumpling.webp',
    kind: 'Restaurant · Yangon',
    description:
      'Brand site for a handmade dumpling house in Yangon — pan-fried dumplings, mala xiang guo and noodles, with ordering by phone, Grab or foodpanda.',
    highlights: ['Bilingual Myanmar / English', 'Menu & story pages', 'Mobile-first ordering'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'React Router', 'i18n'],
    caseStudy: 'may-dar-we',
  },
  {
    id: 'seinpan',
    name: 'Sein Pan Electronic Shop',
    localName: 'ကိုဝင်းနိုင် စိန်ပန်း အီလက်ထရွန်းနစ်',
    url: 'https://www.seinpanelectronic.com',
    thumb: 'projects/sein-pan-electronic.webp',
    kind: 'Electronics repair · since 1989',
    description:
      'Site for a family electronics-repair shop serving Yangon since 1989 — a retro-TV hero, service catalogue, and one-tap calling for repair quotes.',
    highlights: ['Bilingual Myanmar / English', 'Light & dark mode', 'Click-to-call quotes'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'i18n', 'Lucide'],
    caseStudy: 'sein-pan',
  },
  {
    id: 'beanboutique',
    name: 'Bean Boutique Coffee Shop',
    url: 'https://johnathanmt.github.io/bean-boutique-coffee-shop/',
    thumb: 'projects/bean-boutique-coffee.webp',
    kind: 'Coffee shop · Caribbean café',
    description:
      'Shop site for a Caribbean-style coffee house — premium beans, brewing equipment, events and special offers, with a cart and a newsletter sign-up.',
    highlights: ['Hero image carousel', 'Shopping cart', 'Newsletter discount pop-up'],
    stack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'React Router'],
    caseStudy: 'bean-boutique',
  },
  {
    id: 'official',
    name: 'The Mysterious Odyssey of Ko Myo Thant',
    url: 'https://myothantnaing.com',
    thumb: 'projects/myothantnaing-official.webp',
    kind: 'Personal site · Photo journey',
    description:
      'My official website — a life told in photographs across four chapters: Adventure, Art, Tech and Fortune, opened from an interactive leather-bound book.',
    highlights: ['Interactive book-cover intro', 'English / Myanmar', 'Four photo chapters'],
    stack: ['Next.js', 'React', 'React Three Fiber', 'Cloudinary'],
    caseStudy: 'mysterious-odyssey',
  },
  {
    id: 'vedin',
    name: 'Vedin — Vedic Astrology Platform',
    url: 'https://vedin.myothant.dev',
    thumb: 'projects/vedin-site.webp',
    kind: 'Full-stack product · AI · Astrology',
    description:
      'A sidereal astrology platform — precise D1–D60 charts, Vimshottari dasha and Shadbala, with AI-written Burmese readings delivered as PDF reports.',
    highlights: ['5-step Gemini reading pipeline', 'Swiss Ephemeris engine', 'Magazine-style PDF reports'],
    stack: ['React 19', 'ASP.NET Core 8', 'MySQL', 'Google Gemini', 'Docker'],
    caseStudy: 'vedin',
  },
]
