import PageStage from '../components/PageStage'
import { useLang } from '../context/LangContext'
import TechStack from '../components/TechStack'

/** /stack — architecture & tooling journey. */
export default function StackPage() {
  const { lang } = useLang()
  return <PageStage motif="stack"><TechStack lang={lang} /></PageStage>
}
