import { useLang } from '../context/LangContext'
import About from '../components/About'
import Bibliography from '../components/Bibliography'
import GitHubActivity from '../components/GitHubActivity'
import Philosophy from '../components/Philosophy'
import CyberPoetry from '../components/CyberPoetry'

/** /about — story, career & education timeline, GitHub activity, philosophy and the techno-science poems. */
export default function AboutPage() {
  const { lang } = useLang()
  return (
    <>
      <About lang={lang} />
      <Bibliography embedded />
      <GitHubActivity />
      <Philosophy />
      <CyberPoetry />
    </>
  )
}
