// ============================================================================
//  Effects — global post-processing for the neon look.
//  Bloom = the core "neon glow" (makes emissive materials bleed light).
//  ChromaticAberration + Noise + Vignette = subtle CRT/film grit.
//  Glitch = occasional digital tear (sporadic so it's a spice, not a headache).
//
//  Requires:  npm i @react-three/postprocessing postprocessing
// ============================================================================
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette, Glitch } from '@react-three/postprocessing'
import { GlitchMode, BlendFunction } from 'postprocessing'
import { Vector2 } from 'three'

export default function Effects({ glitch = false }) {
  return (
    <EffectComposer disableNormalPass multisampling={0}>
      {/* Neon glow — lower threshold = more things bloom */}
      <Bloom intensity={1.25} luminanceThreshold={0.18} luminanceSmoothing={0.9} mipmapBlur radius={0.85} />
      {/* tiny RGB split for that "signal" feel */}
      <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={new Vector2(0.0009, 0.0009)} radialModulation={false} />
      <Noise opacity={0.045} />
      <Vignette eskil={false} offset={0.22} darkness={0.92} />
      {glitch && <Glitch mode={GlitchMode.SPORADIC} delay={new Vector2(3.5, 8)} duration={new Vector2(0.15, 0.4)} />}
    </EffectComposer>
  )
}
