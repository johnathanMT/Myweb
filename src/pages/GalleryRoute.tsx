import PageStage from '../components/PageStage'
import { useLang } from '../context/LangContext'
import GalleryPage from '../components/GalleryPage'
import VideoShowcase from '../components/VideoShowcase'
import SeasonalGallery from '../components/SeasonalGallery'

/** /gallery — full photo collection, highlight reel, and the seasonal wheel. */
export default function GalleryRoute() {
  const { lang } = useLang()
  return (
    <>
      <PageStage motif="gallery"><GalleryPage /></PageStage>
      <VideoShowcase lang={lang} />
      <SeasonalGallery lang={lang} />
    </>
  )
}
