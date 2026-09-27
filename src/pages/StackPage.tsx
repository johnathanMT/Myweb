import { useLang } from '../context/LangContext'
import TechStack from '../components/TechStack'

/** /stack — architecture & tooling journey. */
export default function StackPage() {
  const { lang } = useLang()
  return <TechStack lang={lang} />
}
