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
  },
]
