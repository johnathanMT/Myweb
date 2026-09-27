import { lazy, Suspense } from 'react'
import { useLang } from '../context/LangContext'
import ProjectsSection from '../components/ProjectsSection'
import SectionSkeleton from '../components/SectionSkeleton'

const LiveCodeShowcase = lazy(() => import('../components/LiveCodeShowcase'))

/** /projects — featured work, then the live-code walkthrough. */
export default function ProjectsPage() {
  const { lang } = useLang()
  return (
    <>
      <ProjectsSection lang={lang} />
      <Suspense fallback={<SectionSkeleton label="Live code" />}><LiveCodeShowcase /></Suspense>
    </>
  )
}
