import { useLang } from '../context/LangContext'
import About from '../components/About'
import Philosophy from '../components/Philosophy'
import CyberPoetry from '../components/CyberPoetry'

/** /about — story, philosophy and the techno-science poems. */
export default function AboutPage() {
  const { lang } = useLang()
  return (
    <>
      <About lang={lang} />
      <Philosophy />
      <CyberPoetry />
    </>
  )
}
