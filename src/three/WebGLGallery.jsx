// ============================================================================
//  WebGLGallery — "Active Theory"-style floating image gallery.
//
//  • A row of image planes in 3D; WHEEL or DRAG to glide through them.
//  • HOVER → shader ripple + RGB-split + parallax + scale.
//  • CLICK → GSAP click-to-fullscreen: the plane flies to centre and scales to
//    fill the frame while the others dim + recede. Click it again or press Esc
//    to return.
//  Transparent canvas, so the planes float over the page/3D city behind it.
//
//  Requires:  npm i three @react-three/fiber @react-three/drei gsap
// ============================================================================
import { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, invalidate } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'

// Local, same-origin photos from /public/Myweb_photo (no 404s, no cross-origin
// texture taint — far more reliable than hot-linked Unsplash URLs).
const BASE = import.meta.env.BASE_URL || '/'
const DEFAULT_IMAGES = [
  BASE + 'Myweb_photo/BBT_CoffShop.jpg',
  BASE + 'Myweb_photo/M5Stack.jpg',
  BASE + 'Myweb_photo/Hirashima_Hospital.png',
  BASE + 'Myweb_photo/HotelMonteryLaFrere.jpg',
  BASE + 'Myweb_photo/TendonTenya.jpg',
  BASE + 'Myweb_photo/LINE_bot.jpg',
]

const W = 3, H = 4, GAP = 0.8
const STEP = W + GAP
const FULL = 1.85          // fullscreen scale when focused

const vertex = /* glsl */`
  varying vec2 vUv;
  void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`
const fragment = /* glsl */`
  varying vec2 vUv;
  uniform sampler2D uTex;
  uniform float uHover, uTime, uDim;
  uniform vec2  uMouse;
  void main(){
    vec2 uv = vUv;
    uv += uMouse * 0.06 * uHover;
    float d = distance(vUv, vec2(0.5));
    uv += normalize(vUv - 0.5 + 1e-4) * sin(d * 14.0 - uTime * 3.0) * 0.012 * uHover;
    float s = 0.012 * uHover;
    vec3 col = vec3(texture2D(uTex, uv + vec2(s,0.0)).r, texture2D(uTex, uv).g, texture2D(uTex, uv - vec2(s,0.0)).b);
    col += uHover * 0.06;
    col = mix(col, col * 0.22, uDim);   // dim the non-focused planes
    gl_FragColor = vec4(col, 1.0);
  }
`

function Frame({ url, index, selected, focus, onSelect }) {
  const tex = useTexture(url)
  const mesh = useRef()
  const [hover, setHover] = useState(false)
  const mouse = useRef(new THREE.Vector2())
  const uniforms = useMemo(() => ({
    uTex: { value: tex }, uHover: { value: 0 }, uTime: { value: 0 }, uDim: { value: 0 }, uMouse: { value: new THREE.Vector2() },
  }), [tex])

  const isSel = selected === index
  const anyFocus = selected !== null

  useFrame((state, dt) => {
    const f = focus.current.v
    uniforms.uTime.value = state.clock.elapsedTime
    uniforms.uHover.value = THREE.MathUtils.damp(uniforms.uHover.value, hover && !anyFocus ? 1 : 0, 6, dt)
    uniforms.uMouse.value.lerp(mouse.current, 0.1)
    uniforms.uDim.value = THREE.MathUtils.damp(uniforms.uDim.value, anyFocus && !isSel ? f : 0, 6, dt)

    const targetScale = isSel ? 1 + f * (FULL - 1) : (hover && !anyFocus ? 1.08 : 1)
    const s = THREE.MathUtils.damp(mesh.current.scale.x, targetScale, 7, dt)
    mesh.current.scale.set(s, s, 1)
    mesh.current.position.z = THREE.MathUtils.damp(mesh.current.position.z, isSel ? f * 1.5 : 0, 7, dt)
    // demand mode: keep rendering only while this frame is actually animating
    if (hover || uniforms.uHover.value > 0.001 || isSel || uniforms.uDim.value > 0.001) invalidate()
  })

  return (
    <mesh
      ref={mesh}
      position={[index * STEP, 0, 0]}
      onPointerOver={() => { if (!anyFocus) { setHover(true); document.body.style.cursor = 'pointer' } }}
      onPointerOut={() => { setHover(false); document.body.style.cursor = '' }}
      onPointerMove={(e) => { if (e.uv) mouse.current.set(e.uv.x - 0.5, e.uv.y - 0.5) }}
      onClick={(e) => { e.stopPropagation(); onSelect(index) }}
    >
      <planeGeometry args={[W, H, 32, 32]} />
      <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} transparent />
    </mesh>
  )
}

function Row({ images }) {
  const group = useRef()
  const target = useRef({ x: 0 })   // gsap-tweenable scroll target
  const current = useRef(0)
  const focus = useRef({ v: 0 })     // 0..1 fullscreen progress (gsap)
  const [selected, setSelected] = useState(null)
  const maxX = (images.length - 1) * STEP

  // Wheel + drag scrolling (disabled while a plane is focused)
  useEffect(() => {
    const onWheel = (e) => { if (selected !== null) return; target.current.x = THREE.MathUtils.clamp(target.current.x + e.deltaY * 0.01, 0, maxX); invalidate() }
    let dragging = false, lastX = 0
    const down = (e) => { if (selected !== null) return; dragging = true; lastX = e.clientX }
    const move = (e) => { if (!dragging) return; target.current.x = THREE.MathUtils.clamp(target.current.x - (e.clientX - lastX) * 0.012, 0, maxX); lastX = e.clientX; invalidate() }
    const up = () => { dragging = false }
    const onKey = (e) => { if (e.key === 'Escape') setSelected(null) }
    window.addEventListener('wheel', onWheel, { passive: true })
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('wheel', onWheel); window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up)
      window.removeEventListener('keydown', onKey)
    }
  }, [maxX, selected])

  // GSAP click-to-fullscreen: tween focus + centre the chosen plane
  useEffect(() => {
    gsap.to(focus.current, { v: selected !== null ? 1 : 0, duration: 0.9, ease: 'power3.inOut', onUpdate: invalidate })
    if (selected !== null) gsap.to(target.current, { x: selected * STEP, duration: 0.9, ease: 'power3.inOut', onUpdate: invalidate })
  }, [selected])

  const toggle = (i) => setSelected((cur) => (cur === i ? null : i))

  useFrame((state, dt) => {
    current.current = THREE.MathUtils.damp(current.current, target.current.x, 5, dt)
    if (group.current) {
      group.current.position.x = -current.current
      const tilt = selected === null ? 1 : 0   // no tilt while focused
      group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.12 * tilt, 3, dt)
      group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.06 * tilt, 3, dt)
    }
    // keep rendering until the scroll + focus have settled, then go idle (0 GPU)
    if (Math.abs(current.current - target.current.x) > 0.001 || (focus.current.v > 0.001 && focus.current.v < 0.999)) invalidate()
  })

  return (
    <group ref={group}>
      {images.map((url, i) => (
        <Frame key={i} url={url} index={i} selected={selected} focus={focus} onSelect={toggle} />
      ))}
    </group>
  )
}

export default function WebGLGallery({ images = DEFAULT_IMAGES }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 7], fov: 45 }}
      dpr={[1, 1.6]}
      frameloop="demand"                       // only renders on interaction → frees the GPU for NeonCity
      gl={{ antialias: true, alpha: true }}    // transparent → floats over the page
      style={{ width: '100%', height: '100%' }}
    >
      <Row images={images} />
    </Canvas>
  )
}
