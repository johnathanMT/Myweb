import { useParams } from 'react-router-dom'
import Seo from '../components/Seo'
import { useLang } from '../context/LangContext'
import CaseStudyLayout from '../components/CaseStudyLayout'
import { caseCopy, caseStudyBySlug } from '../data/caseStudies'
import NotFoundPage from './NotFoundPage'

/** /projects/:slug — one case study, or the 404 for an unknown slug. */
export default function CaseStudyPage() {
  const { slug } = useParams()
  const { lang } = useLang()
  const study = caseStudyBySlug(slug)

  if (!study) return <><Seo noindex /><NotFoundPage /></>

  return (
    <>
      <Seo title={`${study.name} — Case Study`} path={`/projects/${study.slug}`} description={caseCopy(study, lang).summary} />
      <CaseStudyLayout study={study} lang={lang} />
    </>
  )
}
