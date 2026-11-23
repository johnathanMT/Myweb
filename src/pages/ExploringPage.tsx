import PageStage from '../components/PageStage'
import { lazy, Suspense } from 'react'
import { useLang } from '../context/LangContext'
import Exploring from '../components/Exploring'
import MemorialPavilion from '../components/MemorialPavilion'
import ArticlesSection from '../components/ArticlesSection'
import TravelChronicles from '../components/TravelChronicles'
import DeferUntilVisible from '../components/DeferUntilVisible'

// ~1.4 MB three.js payload — only fetched when the visitor scrolls near it.
const VisitorGlobe = lazy(() => import('../components/VisitorGlobe'))

const globeFallback = <div className="py-24 text-center font-mono text-sm text-muted">Loading globe…</div>

/** /exploring — curiosities, the memorial pavilion, articles, travel chronicles and the visitor globe. */
export default function ExploringPage() {
  const { lang, setLang } = useLang()
  return (
    <>
      <PageStage motif="exploring"><Exploring /></PageStage>
      <MemorialPavilion lang={lang} />
      <ArticlesSection />
      <TravelChronicles lang={lang} setLang={setLang} />
      <DeferUntilVisible minHeight={520} fallback={globeFallback}>
        <Suspense fallback={globeFallback}><VisitorGlobe lang={lang} /></Suspense>
      </DeferUntilVisible>
    </>
  )
}
