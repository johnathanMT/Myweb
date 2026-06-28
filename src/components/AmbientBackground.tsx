/**
 * AmbientBackground — subtle "cyberpunk" ambient glow layer.
 *
 * Renders large, dim, blurred neon blobs (cyan / purple / pink) staggered down
 * the page so each section sits over a different faint hue, visually separating
 * them without overpowering the text. Place it as the FIRST child inside a
 * `relative` root, and keep page sections transparent so the glow shows through.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Hero region — cyan */}
      <div className="absolute -top-40 left-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-cyan-500/10 blur-[140px]" />
      {/* About region — purple */}
      <div className="absolute top-[24%] -right-40 h-[36rem] w-[36rem] rounded-full bg-purple-700/15 blur-[150px]" />
      {/* Articles region — pink */}
      <div className="absolute top-[48%] -left-40 h-[32rem] w-[32rem] rounded-full bg-pink-600/10 blur-[140px]" />
      {/* Projects region — cyan/violet */}
      <div className="absolute top-[70%] right-1/4 h-[32rem] w-[32rem] rounded-full bg-cyan-600/10 blur-[140px]" />
      {/* Footer region — accent violet */}
      <div className="absolute bottom-[-6rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/12 blur-[140px]" />
    </div>
  )
}
