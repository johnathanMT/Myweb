// ============================================================================
//  Effects — global post-processing for the neon look.
//  Bloom = the core "neon glow" (makes emissive materials bleed light).
//  ChromaticAberration + Vignette = subtle CRT/film grit.
//  Glitch = occasional digital tear (sporadic so it's a spice, not a headache).
//
//  Requires:  npm i @react-three/postprocessing postprocessing
// ============================================================================
import { EffectComposer, Bloom, ChromaticAberration, Vignette, Glitch } from '@react-three/postprocessing'
import { GlitchMode, BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

export default function Effects({ glitch = false, low = false }) {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      {/* Neon glow — slightly gentler on phones to save fill-rate */}
      {/* Crisp neon: high threshold = ONLY bright neon blooms (dark city stays
          deep black), low smoothing + tighter radius = sharp, not foggy. */}
      <Bloom intensity={low ? 1.0 : 1.25} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur radius={low ? 0.5 : 0.62} />
      {/* tiny RGB split for that "signal" feel */}
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new Vector2(0.0006, 0.0006)} radialModulation={false} />
      {/* deeper vignette pulls focus + adds contrast; no film grain (kept crisp) */}
      <Vignette eskil={false} offset={0.28} darkness={1.0} />
      {glitch && <Glitch mode={GlitchMode.SPORADIC} delay={new Vector2(3.5, 8)} duration={new Vector2(0.15, 0.4)} />}
    </EffectComposer>
  )
}
