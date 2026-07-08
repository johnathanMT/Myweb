/**
 * AmbientBackground — hippie/psychedelic ambient glow layer.
 *
 * Renders large, dim, blurred smoke-orbs (lime / deep purple / sunset orange /
 * emerald) staggered down the page so each section sits over a different mellow
 * hue — the "60s/70s freedom" wash — without overpowering the text. Place it as
 * the FIRST child inside a `relative` root, and keep sections transparent so the
 * glow shows through.
 */
export default function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Hero region — lime haze */}
      <div className="absolute -top-40 left-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-lime-500/10 blur-[140px] animate-breathe motion-reduce:animate-none" style={{ animationDelay: '0s' }} />
      {/* About region — deep purple */}
      <div className="absolute top-[24%] -right-40 h-[36rem] w-[36rem] rounded-full bg-purple-600/20 blur-[150px] animate-breathe motion-reduce:animate-none" style={{ animationDelay: '1.6s' }} />
      {/* Articles region — sunset orange */}
      <div className="absolute top-[48%] -left-40 h-[32rem] w-[32rem] rounded-full bg-orange-500/12 blur-[140px] animate-breathe motion-reduce:animate-none" style={{ animationDelay: '3.2s' }} />
      {/* Projects region — emerald */}
      <div className="absolute top-[70%] right-1/4 h-[32rem] w-[32rem] rounded-full bg-emerald-500/12 blur-[140px] animate-breathe motion-reduce:animate-none" style={{ animationDelay: '4.8s' }} />
      {/* Footer region — lime accent */}
      <div className="absolute bottom-[-6rem] left-1/3 h-[28rem] w-[28rem] rounded-full bg-accent/12 blur-[140px] animate-breathe motion-reduce:animate-none" style={{ animationDelay: '2.4s' }} />
    </div>
  )
}
