import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

/** Unknown paths — a calm, on-brand 404 inside the site chrome. */
export default function NotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">Error 404</p>
      <h1 className="section-title mt-4">Signal lost</h1>
      <p className="section-subtitle mx-auto !mb-8">That node isn’t on the network. Let’s route you back.</p>
      <Link to="/" className="btn-primary">
        <ArrowLeft size={16} aria-hidden /> Back to home
      </Link>
    </section>
  )
}
