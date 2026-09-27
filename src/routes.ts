import { lazy } from 'react'

/**
 * Route registry — each page is its own code-split chunk.
 *
 * The same loader feeds React.lazy AND `prefetchRoute`, so hovering / focusing a
 * nav link warms that page's chunk before the click. Vite dedupes the import, so
 * a prefetched page renders instantly with no Suspense flash. The home page is
 * imported eagerly in main.tsx — it's the landing route, so it ships in the entry.
 */
const loaders = {
  '/about':        () => import('./pages/AboutPage'),
  '/projects':     () => import('./pages/ProjectsPage'),
  '/stack':        () => import('./pages/StackPage'),
  '/lab':          () => import('./pages/LabPage'),
  '/gallery':      () => import('./pages/GalleryRoute'),
  '/exploring':    () => import('./pages/ExploringPage'),
  '/python':       () => import('./components/PythonAutomation'),
  '/studying':     () => import('./components/StudyingLibrary'),
  '/bibliography': () => import('./components/Bibliography'),
  '/github':       () => import('./components/GitHubProjects'),
  '/sanctuary':    () => import('./components/Sanctuary'),
} as const

export type RoutePath = keyof typeof loaders

export const AboutPage      = lazy(loaders['/about'])
export const ProjectsPage   = lazy(loaders['/projects'])
export const StackPage      = lazy(loaders['/stack'])
export const LabPage        = lazy(loaders['/lab'])
export const GalleryRoute   = lazy(loaders['/gallery'])
export const ExploringPage  = lazy(loaders['/exploring'])
export const PythonAutomation = lazy(loaders['/python'])
export const StudyingLibrary  = lazy(loaders['/studying'])
export const Bibliography     = lazy(loaders['/bibliography'])
export const GitHubProjects   = lazy(loaders['/github'])
export const Sanctuary        = lazy(loaders['/sanctuary'])

const warmed = new Set<string>()

/** Fire-and-forget chunk warm-up for a path (ignores hashes / unknown paths). */
export function prefetchRoute(to: string): void {
  const path = to.split('#')[0]
  if (warmed.has(path) || !(path in loaders)) return
  warmed.add(path)
  loaders[path as RoutePath]().catch(() => warmed.delete(path))
}

/**
 * Old single-page anchors → their new dedicated pages. Used to redirect legacy
 * links like `myothant.dev/#projects` so shared URLs keep working.
 */
export const LEGACY_ANCHORS: Record<string, string> = {
  about: '/about',
  poetry: '/about#poetry',
  projects: '/projects',
  livecode: '/projects#livecode',
  stack: '/stack',
  lab: '/lab',
  agent: '/lab#agent',
  quantum: '/lab#quantum',
  antimatter: '/lab#antimatter',
  gallery: '/gallery',
  showreel: '/gallery#showreel',
  seasonal: '/gallery#seasonal',
  exploring: '/exploring',
  articles: '/exploring#articles',
  blog: '/exploring#blog',
  network: '/exploring#network',
}
