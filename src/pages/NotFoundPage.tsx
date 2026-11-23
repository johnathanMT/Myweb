import PageTitle from '../components/PageTitle'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/** Unknown paths — a calm, on-brand 404 inside the site chrome. */
export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] lux-eyebrow enter-eyebrow">Error 404</p>
      <PageTitle className="mb-4 mt-4">Signal lost</PageTitle>
      <p className="enter-sub section-subtitle mx-auto !mb-8">That node isn’t on the network. Let’s route you back.</p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={16} aria-hidden /> Back to home
      </Link>
    </section>
  )
}
