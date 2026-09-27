import { lazy, Suspense } from 'react'
import { useLang } from '../context/LangContext'
import ClientProjects from '../components/ClientProjects'
import ProjectsSection from '../components/ProjectsSection'
import SectionSkeleton from '../components/SectionSkeleton'

const LiveCodeShowcase = lazy(() => import('../components/LiveCodeShowcase'))

/** /projects — live client sites first, then featured work and the live-code walkthrough. */
export default function ProjectsPage() {
  const { lang } = useLang()
  return (
    <>
      <ClientProjects />
      <ProjectsSection lang={lang} />
      <Suspense fallback={<SectionSkeleton label="Live code" />}><LiveCodeShowcase /></Suspense>
    </>
  )
}
