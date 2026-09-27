/**
 * PageSkeleton — Suspense fallback while a route's chunk downloads. Reserves a
 * full viewport so the footer never jumps up, and shows a quiet scanning bar.
 */
export default function PageSkeleton() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center" aria-busy="true" role="status">
      <div className="page-loader" aria-hidden><span /></div>
      <span className="sr-only">Loading page…</span>
    </div>
  )
}
