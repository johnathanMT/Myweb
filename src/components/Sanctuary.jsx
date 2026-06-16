import { Suspense, useEffect, useMemo, useRef, useState, Component } from 'react'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, Grid, Html, OrbitControls, AdaptiveDpr, AdaptiveEvents } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sun as SunIcon, Moon as MoonIcon, Mail, X, Send, Pencil, Sparkles, ArrowRight } from 'lucide-react'
import { getParticlesOptions } from '../lib/sanctuaryParticles'

/**
 * Sanctuary — Ghibli "Memory World" (/sanctuary).
 *
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║  EDIT EVERYTHING HERE → SCENE_LAYOUT.                                      ║
 * ║   position : [x, y, z]  — world location (y = 0 is the ground).           ║
 * ║   rotation : [x, y, z]  — radians.                                        ║
 * ║   size     : number     — on-screen size (height; footprint for flats).   ║
 * ║              ↳ auto-fit by bounding box, so a model's export scale doesn't ║
 * ║                matter. Prefer this. OR set an explicit `scale` to override:║
 * ║   scale    : n | [x,y,z]  — exact multiplier (skips auto-fit).            ║
 * ║  Buildings are AUTO-GROUNDED (base sits on y), so nothing ever floats.     ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */
const G = 0 // ground level
const SCENE_LAYOUT = {
  // ── centre ──
  sakura:        { url: 'sakura.glb',        position: [0, G, 0],       rotation: [0, 0, 0],          size: 4.0 },
  torii:         { url: 'torigate.glb',      position: [0, G, 12],      rotation: [0, Math.PI, 0],    size: 5.5 },           // entrance, faces tree
  // ── cozy ring (tighter radius, no overlap) ──
  plaza_night:   { url: 'plaza_night.glb',   position: [18, G, 9],      rotation: [0, -2.2, 0],       size: 22, fit: 'footprint', city: true },
  village:       { url: 'village.glb',       position: [-15, G, 6],     rotation: [0, 1.4, 0],        size: 6 },
  ferris_wheel:  { url: 'ferris_wheel.glb',  position: [-22, G, 2],     rotation: [Math.PI / 2, 0, 0], size: 9, city: true }, // upright, next to village
  jp_castle:     { url: 'jp_castle.glb',     position: [8, G, -18],     rotation: [0, 3.0, 0],        size: 9 },
  castle_sakura: { url: 'castle_sakura.glb', position: [-10, G, -15],   rotation: [0, 2.4, 0],        size: 7 },
  ship:          { url: 'ship.glb',          position: [16, G + 0.4, -16], rotation: [0, -0.79, 0],   size: 5, float: { amp: 0.18, speed: 1.1 } }, // beside castle, faces tree
  // ── sky extras ──
  sun:           { url: 'sun.glb',           position: [-15, 13, -24],  rotation: [0, 0, 0],          size: 2.2, sky: true, celestial: 'sun' },
  moon:          { url: 'moon.glb',          position: [15, 13, -24],   rotation: [0, 0, 0],          size: 2.2, sky: true, celestial: 'moon' },
  glider:        { url: 'glider.glb',        position: [6, 9, -4],      rotation: [0, -0.6, 0],       size: 2.2, sky: true, float: { amp: 0.4, speed: 0.6 } },
}
const BASE = import.meta.env.BASE_URL || '/'
const u = (f) => `${BASE}${f}`
Object.values(SCENE_LAYOUT).forEach((m) => useGLTF.preload(u(m.url)))
const ALL_URLS = Object.values(SCENE_LAYOUT).map((m) => u(m.url))

// Phones get a lower pixel ratio, no MSAA, and no Bloom — big perf wins.
const IS_MOBILE = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || '')

// Welcome copy (exact, trilingual).
const WELCOME = {
  en: 'Welcome to the Memory World. You can choose your favorite spot to leave a message for Ko Myo Thant Naing.',
  jp: 'メモリーワールドへようこそ。ナインへのメッセージを、お好きな場所を選んで残すことができます。',
  mm: 'Memory World မှ နွေးထွေးစွာ ကြိုဆိုပါတယ်။ Ko Myo Thant Ning အတွက် အမှတ်တရစကားလေးကို သင်နှစ်သက်ရာ နေရာလေးမှာ ရွေးချယ်ချိတ်ဆွဲခဲ့နိုင်ပါတယ်။',
}

// Landmarks tags hang from — anchors derived from SCENE_LAYOUT positions.
const LANDMARKS = {
  tree:    { anchor: [0, 3.0, 0.8] },
  ship:    { anchor: [SCENE_LAYOUT.ship.position[0], 3.6, SCENE_LAYOUT.ship.position[2]] },
  village: { anchor: [SCENE_LAYOUT.village.position[0], 3.6, SCENE_LAYOUT.village.position[2]] },
  castle:  { anchor: [SCENE_LAYOUT.jp_castle.position[0], 6.5, SCENE_LAYOUT.jp_castle.position[2]] },
  plaza:   { anchor: [SCENE_LAYOUT.plaza_night.position[0], 4.0, SCENE_LAYOUT.plaza_night.position[2]] },
}
const LANDMARK_KEYS = Object.keys(LANDMARKS)

/* ───────── i18n (EN / 日本語 / မြန်မာ) ───────── */
const T = {
  en: { title: 'The Memory World', sub: 'Drag to look · scroll to fly out · tap a tag', day: 'Day', night: 'Night', leave: 'Leave a Memory', editMine: 'Edit your memory', from: 'A memory from', at: 'at the', place: 'Place it at', name: 'Your name', msg: 'Message', hang: 'Hang it', save: 'Save changes', demo: 'One memory per visitor · editable, never deleted.', edit: 'Edit', namePh: 'e.g. Nomura-san', msgPh: 'A few words to remember…', home: 'Home',
    lm: { tree: 'Sakura Tree', ship: "Ship's Deck", village: 'Village Gate', castle: 'Castle Gates', plaza: 'Night Plaza' } },
  jp: { title: '思い出の世界', sub: 'ドラッグで視点 · スクロールで俯瞰 · タグをタップ', day: '昼', night: '夜', leave: '思い出を残す', editMine: '思い出を編集', from: '思い出をくれた人', at: '場所：', place: '場所を選ぶ', name: 'お名前', msg: 'メッセージ', hang: '木に掛ける', save: '変更を保存', demo: '一人につき一つ · 編集可・削除不可。', edit: '編集', namePh: '例：野村さん', msgPh: 'ひとことどうぞ…', home: 'ホーム',
    lm: { tree: '桜の木', ship: '船の甲板', village: '村の入口', castle: '城門', plaza: '夜の広場' } },
  mm: { title: 'အမှတ်တရ ကမ္ဘာ', sub: 'ကြည့်ရန် ဖိဆွဲ · အပြင်ထွက်ရန် scroll · tag ကိုနှိပ်', day: 'နေ့', night: 'ည', leave: 'အမှတ်တရ ချန်ထားရန်', editMine: 'သင့်စာ ပြင်ရန်', from: 'အမှတ်တရ ပေးသူ', at: 'နေရာ —', place: 'နေရာ ရွေးပါ', name: 'သင့်အမည်', msg: 'စာ', hang: 'ချိတ်ဆွဲရန်', save: 'သိမ်းရန်', demo: 'တစ်ဦးလျှင် တစ်ခု · ပြင်နိုင်၊ ဖျက်၍မရ။', edit: 'ပြင်ရန်', namePh: 'ဥပမာ — Nomura-san', msgPh: 'မှတ်မိစရာ စကားအနည်းငယ်…', home: 'ပင်မ',
    lm: { tree: 'ဆာကူရာပင်', ship: 'သင်္ဘောကုန်း', village: 'ရွာဝင်ပေါက်', castle: 'ရဲတိုက်တံခါး', plaza: 'ညဈေး' } },
}
const LANGS = [{ code: 'en', label: 'EN' }, { code: 'jp', label: '日本語' }, { code: 'mm', label: 'မြန်မာ' }]

/* ───────── operator identity + persistence ───────── */
function getOperatorId() {
  try {
    let id = localStorage.getItem('mtn_operator_id')
    if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`); localStorage.setItem('mtn_operator_id', id) }
    return id
  } catch { return 'anon' }
}
function loadMyMemory() { try { const s = localStorage.getItem('mtn_my_memory'); return s ? JSON.parse(s) : null } catch { return null } }
function saveMyMemory(t) { try { localStorage.setItem('mtn_my_memory', JSON.stringify(t)) } catch { /* ignore */ } }

const initEngine = async (engine) => { await loadSlim(engine) }

const MOCK_TAGS = [
  { id: 1, landmark: 'tree', author: 'Nomura-san', date: '2024-03-15', message: 'Working beside you made the hard days lighter. Fly far — we are proud of you.' },
  { id: 2, landmark: 'ship', author: 'Aiko', date: '2024-03-18', message: 'Thank you for every coffee and every kind word. Smooth sailing ahead, captain.' },
  { id: 3, landmark: 'village', author: 'The Kaigo Team', date: '2024-03-20', message: 'From caring to coding — you carried the same heart into both. Go shine, engineer.' },
  { id: 4, landmark: 'castle', author: 'Tanaka', date: '2024-03-21', message: 'I still remember your first day. Look how far you’ve come. ありがとう。' },
  { id: 5, landmark: 'plaza', author: 'Yuki', date: '2024-03-22', message: 'May your new path glow like these lanterns. Come back and visit us someday.' },
]

/* ───────── bbox auto-fit + auto-ground ───────── */
function useFitted(cfg) {
  const { scene } = useGLTF(u(cfg.url))
  return useMemo(() => {
    const obj = scene.clone(true)
    // Bake rotation onto the object BEFORE measuring, so grounding/centering is
    // rotation-aware (e.g. a ferris wheel tilted upright still sits flat).
    if (cfg.rotation) obj.rotation.set(cfg.rotation[0] || 0, cfg.rotation[1] || 0, cfg.rotation[2] || 0)
    obj.updateMatrixWorld(true)
    const box = new THREE.Box3().setFromObject(obj)
    const size = new THREE.Vector3(); box.getSize(size)
    let s
    if (cfg.scale != null) {
      s = Array.isArray(cfg.scale) ? cfg.scale : [cfg.scale, cfg.scale, cfg.scale]
    } else {
      const denom = cfg.fit === 'footprint' ? (Math.max(size.x, size.z) || 1) : (size.y || Math.max(size.x, size.z) || 1)
      const k = cfg.size / denom
      s = [k, k, k]
    }
    const cx = ((box.min.x + box.max.x) / 2) * s[0]
    const cz = ((box.min.z + box.max.z) / 2) * s[2]
    const y = cfg.sky ? -((box.min.y + box.max.y) / 2) * s[1] : -box.min.y * s[1] // sky: centered; else base on ground
    return { obj, scale: s, offset: [-cx, y, -cz] }
  }, [scene, cfg])
}

function applyEmissive(obj, color, intensity) {
  obj.traverse((o) => {
    if (o.isMesh && o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach((m) => { m.emissive = new THREE.Color(color); m.emissiveIntensity = intensity; m.toneMapped = false; m.needsUpdate = true })
    }
  })
}

function Floating({ amp = 0.15, speed = 1, children }) {
  const ref = useRef()
  const seed = useMemo(() => Math.random() * 10, [])
  useFrame((s) => { if (ref.current) ref.current.position.y = Math.sin(s.clock.elapsedTime * speed + seed) * amp })
  return <group ref={ref}>{children}</group>
}

function Asset({ cfg, night }) {
  const fit = useFitted(cfg)
  useEffect(() => {
    if (cfg.celestial === 'sun') applyEmissive(fit.obj, '#ffd27a', night ? 0.12 : 2.6)
    else if (cfg.celestial === 'moon') applyEmissive(fit.obj, '#cdd6ff', night ? 2.6 : 0.12)
    else if (cfg.city) applyEmissive(fit.obj, '#ffc04d', night ? 1.1 : 0.0) // plaza + ferris glow at night
  }, [fit.obj, night, cfg])
  const inner = <primitive object={fit.obj} scale={fit.scale} position={fit.offset} />
  return (
    <group position={cfg.position}>
      {cfg.float ? <Floating {...cfg.float}>{inner}</Floating> : inner}
    </group>
  )
}

// Per-model isolation: a missing/broken GLB (e.g. a not-yet-added ferris_wheel)
// drops only itself — the rest of the world keeps rendering.
class ModelBoundary extends Component {
  constructor(props) { super(props); this.state = { failed: false } }
  static getDerivedStateFromError() { return { failed: true } }
  componentDidCatch(err) { console.error('[Sanctuary] a model failed (others still render):', err) }
  render() { return this.state.failed ? null : this.props.children }
}
function Safe({ children }) { return <ModelBoundary><Suspense fallback={null}>{children}</Suspense></ModelBoundary> }

function SwayGroup({ children }) {
  const ref = useRef()
  useFrame((s) => { if (ref.current) ref.current.rotation.y = Math.sin(s.clock.elapsedTime * 0.18) * 0.08 })
  return <group ref={ref}>{children}</group>
}

function Lights({ night }) {
  if (night) {
    return (<>
      <ambientLight intensity={0.45} color="#9fb4ff" />
      <directionalLight position={[12, 14, -12]} intensity={0.6} color="#aab8ff" />
      <pointLight position={[0, 3, 3]} intensity={2.2} distance={22} color="#ffcf8a" />
    </>)
  }
  return (<>
    <ambientLight intensity={1.0} color="#fff4e6" />
    <directionalLight position={[-12, 16, -10]} intensity={1.7} color="#fff1d6" />
    <hemisphereLight args={['#ffe9c8', '#6b8f6b', 0.6]} />
  </>)
}

function TagPlaque({ tag, index, paused, mine, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(tag)} aria-label={`Read the memory from ${tag.author}`}
      className="sanctuary-tag group cursor-pointer focus:outline-none"
      style={{ animationDelay: `${-(index * 0.8)}s`, animationPlayState: paused ? 'paused' : 'running' }}>
      <span className="mx-auto block h-6 w-px bg-gradient-to-b from-amber-100/80 to-amber-700/30" />
      <span className={`relative -mt-px block whitespace-nowrap rounded-md border bg-gradient-to-b from-amber-200 to-amber-400 px-3 py-1.5 font-serif text-xs font-semibold text-amber-950 shadow-[0_5px_12px_rgba(0,0,0,0.4)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-[0_0_24px_rgba(253,224,140,0.95)] group-hover:brightness-110 ${mine ? 'border-rose-500/70 ring-2 ring-rose-400/60' : 'border-amber-900/40'}`}>
        <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-amber-900/70" />
        {tag.author}
      </span>
    </button>
  )
}

function World({ night, tags, paused, operatorId, onOpen }) {
  const placedTags = useMemo(() => {
    const byLm = {}
    tags.forEach((t) => { const k = LANDMARKS[t.landmark] ? t.landmark : 'tree'; (byLm[k] ||= []).push(t) })
    const out = []
    for (const [k, arr] of Object.entries(byLm)) {
      const a = LANDMARKS[k].anchor
      arr.forEach((tag, i) => {
        const n = arr.length
        out.push({ tag, index: i, position: [a[0] + (i - (n - 1) / 2) * 0.85, a[1] + (i % 2) * 0.35, a[2]] })
      })
    }
    return out
  }, [tags])

  return (
    <>
      <Safe><Asset cfg={SCENE_LAYOUT.sun} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.moon} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.glider} night={night} /></Safe>

      <Safe><Asset cfg={SCENE_LAYOUT.ship} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.plaza_night} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.ferris_wheel} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.village} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.jp_castle} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.castle_sakura} night={night} /></Safe>
      <Safe><Asset cfg={SCENE_LAYOUT.torii} night={night} /></Safe>

      <SwayGroup>
        <Safe><Asset cfg={SCENE_LAYOUT.sakura} night={night} /></Safe>
        {night && [[-1.0, 2.3, 0.4], [1.0, 2.6, 0.2], [0.0, 1.9, 0.8]].map((o, i) => (
          <mesh key={`lantern-${i}`} position={o}>
            <sphereGeometry args={[0.09, 12, 12]} />
            <meshStandardMaterial color="#ffcf8a" emissive="#ffb347" emissiveIntensity={2.6} toneMapped={false} />
          </mesh>
        ))}
      </SwayGroup>

      {placedTags.map(({ tag, index, position }) => (
        <Html key={tag.id} position={position} center distanceFactor={11} zIndexRange={[30, 0]}>
          <TagPlaque tag={tag} index={index} paused={paused} mine={tag.ownerId === operatorId} onOpen={onOpen} />
        </Html>
      ))}
    </>
  )
}

function Scene({ night, tags, paused, operatorId, onOpen }) {
  return (
    <Canvas
      camera={{ position: [0, 8, 40], fov: 50 }}
      dpr={IS_MOBILE ? [1, 1] : [1, 1.5]}             // phones render at 1x → big win
      gl={{ alpha: true, antialias: !IS_MOBILE, powerPreference: 'high-performance' }}
      performance={{ min: 0.5 }}                      // allow auto-throttle under load
      style={{ background: 'transparent' }}
    >
      <fog attach="fog" args={[night ? '#0a0e1f' : '#dfe7ee', 45, 180]} />
      <Lights night={night} />
      <Grid
        position={[0, G, 0]} args={[200, 200]} infiniteGrid
        cellSize={1} cellThickness={0.6} cellColor={night ? '#3a3f63' : '#c9b89a'}
        sectionSize={5} sectionThickness={1.1} sectionColor={night ? '#7c5cff' : '#b8860b'}
        fadeDistance={120} fadeStrength={1.4} followCamera={false}
      />
      <World night={night} tags={tags} paused={paused} operatorId={operatorId} onOpen={onOpen} />

      {night && !IS_MOBILE && (
        <EffectComposer>
          <Bloom intensity={1.2} luminanceThreshold={0.6} luminanceSmoothing={0.3} mipmapBlur />
        </EffectComposer>
      )}

      {/* smooth 360 orbit + zoom; floor-locked; far bird's-eye */}
      <OrbitControls
        makeDefault enabled={!paused} enablePan={false} enableZoom enableDamping dampingFactor={0.05}
        rotateSpeed={0.6} zoomSpeed={0.8}
        minDistance={5} maxDistance={150} minPolarAngle={0.1} maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 1, 0]}
      />

      {/* mobile perf: drop resolution + throttle events under load */}
      <AdaptiveDpr pixelated />
      <AdaptiveEvents />
    </Canvas>
  )
}

/* ───────── overlay UI ───────── */
function ReadModal({ tag, t, canEdit, onEdit, onClose }) {
  useEffect(() => {
    if (!tag) return
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [tag, onClose])
  return (
    <AnimatePresence>
      {tag && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true">
          <motion.div onClick={(e) => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-7 text-white shadow-2xl backdrop-blur-2xl">
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"><X size={18} /></button>
            <p className="font-serif text-[11px] uppercase tracking-[0.3em] text-amber-200/80">{t.from}</p>
            <h3 className="mt-1 font-serif text-2xl font-bold">{tag.author}</h3>
            {t.lm[tag.landmark] && <p className="mt-0.5 font-mono text-[11px] text-amber-200/70">{t.at} {t.lm[tag.landmark]}</p>}
            <p className="mt-4 whitespace-pre-line font-serif text-[15px] leading-relaxed text-white/90">“{tag.message}”</p>
            <div className="mt-6 flex items-center justify-between">
              {canEdit ? (
                <button type="button" onClick={() => onEdit(tag)} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-rose-300 px-4 py-2 font-serif text-sm font-semibold text-amber-950 transition hover:brightness-105"><Pencil size={14} /> {t.edit}</button>
              ) : <span />}
              <p className="font-mono text-xs text-white/55">{tag.date}</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function WriteModal({ open, editing, t, onClose, onSubmit }) {
  const [author, setAuthor] = useState('')
  const [message, setMessage] = useState('')
  const [landmark, setLandmark] = useState(LANDMARK_KEYS[0])
  useEffect(() => {
    if (!open) return
    setAuthor(editing?.author || '')
    setMessage(editing?.message || '')
    setLandmark(editing?.landmark || LANDMARK_KEYS[0])
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, editing, onClose])
  const submit = (e) => {
    e.preventDefault()
    if (!author.trim() || !message.trim()) return
    onSubmit({ author: author.trim(), message: message.trim(), landmark })
  }
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} role="dialog" aria-modal="true">
          <motion.form onClick={(e) => e.stopPropagation()} onSubmit={submit} initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 240, damping: 22 }}
            className="relative w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-7 text-white shadow-2xl backdrop-blur-2xl">
            <button type="button" onClick={onClose} aria-label="Close" className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"><X size={18} /></button>
            <h3 className="font-serif text-2xl font-bold">{editing ? t.editMine : t.leave}</h3>
            <label className="mt-5 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.place}</span>
              <select value={landmark} onChange={(e) => setLandmark(e.target.value)} className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white outline-none transition focus:border-amber-200/60 focus:bg-white/15">
                {LANDMARK_KEYS.map((k) => <option key={k} value={k} className="text-black">{t.lm[k]}</option>)}
              </select>
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.name}</span>
              <input value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={40} required placeholder={t.namePh} className="mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15" />
            </label>
            <label className="mt-4 block">
              <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.msg}</span>
              <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} required rows={4} placeholder={t.msgPh} className="mt-1.5 w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15" />
              <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{message.length}/240</span>
            </label>
            <button type="submit" className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-semibold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.99]">{editing ? t.save : t.hang} <Send size={15} /></button>
            <p className="mt-3 text-center font-mono text-[10px] text-white/45">{t.demo}</p>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function Weather({ night }) {
  const { loaded } = useParticlesProvider()
  const options = useMemo(() => getParticlesOptions(night), [night])
  if (!loaded) return null
  return <Particles id="sanctuary-weather" key={night ? 'night' : 'day'} options={options} className="pointer-events-none absolute inset-0 z-40" />
}

function WelcomeModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} role="dialog" aria-modal="true">
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 24 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.92, opacity: 0, y: 12 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="relative w-full max-w-lg rounded-[28px] border border-white/25 bg-white/15 p-7 text-center text-white shadow-2xl backdrop-blur-2xl sm:p-9">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-300 text-amber-950 shadow-[0_0_24px_rgba(253,224,140,0.6)]">
              <Sparkles size={22} />
            </div>
            <h2 className="font-serif text-2xl font-bold tracking-wide">Welcome to the Memory World</h2>
            <div className="mx-auto mt-5 max-w-md space-y-4 text-left">
              <p className="font-serif text-[14px] leading-relaxed text-white/90">{WELCOME.en}</p>
              <p className="border-t border-white/15 pt-4 font-serif text-[14px] leading-relaxed text-white/80">{WELCOME.jp}</p>
              <p className="border-t border-white/15 pt-4 font-serif text-[14px] leading-relaxed text-white/80">{WELCOME.mm}</p>
            </div>
            <button type="button" onClick={onClose}
              className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-300 to-rose-300 px-7 py-3 font-serif text-sm font-semibold text-amber-950 shadow-[0_8px_28px_rgba(0,0,0,0.4)] transition hover:brightness-105 active:scale-[0.98]">
              Enter Sanctuary <ArrowRight size={16} />
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ───────── main page ───────── */
export default function Sanctuary() {
  const operatorId = useRef(getOperatorId()).current
  const [lang, setLang] = useState(() => { try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' } })
  useEffect(() => { try { localStorage.setItem('mtn_lang', lang) } catch { /* ignore */ } }, [lang])
  const t = T[lang] || T.en

  const [night, setNight] = useState(() => { const h = new Date().getHours(); return h < 6 || h >= 18 })
  const [tags, setTags] = useState(() => { const mine = loadMyMemory(); return mine ? [...MOCK_TAGS, mine] : MOCK_TAGS })
  const [activeTag, setActiveTag] = useState(null)
  const [writeOpen, setWriteOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [welcome, setWelcome] = useState(true) // magical intro popup on entry
  const paused = !!activeTag || writeOpen || welcome

  // Free GPU memory (geometries/materials/textures) when leaving the page, so
  // navigating away from this heavy 3D route is smooth (no lingering WebGL).
  useEffect(() => () => { try { useGLTF.clear(ALL_URLS) } catch { /* ignore */ } }, [])

  const myTag = tags.find((x) => x.ownerId === operatorId) || null
  const openWrite = () => { setEditing(myTag); setWriteOpen(true) }
  const editFromRead = (tag) => { setActiveTag(null); setEditing(tag); setWriteOpen(true) }

  const submitMemory = ({ author, message, landmark }) => {
    if (editing) {
      const updated = { ...editing, author, message, landmark }
      setTags((prev) => prev.map((x) => (x.id === editing.id ? updated : x)))
      saveMyMemory(updated)
    } else if (!myTag) {
      const created = { id: Date.now(), ownerId: operatorId, author, message, landmark, date: new Date().toISOString().slice(0, 10) }
      setTags((prev) => [...prev, created])
      saveMyMemory(created)
    }
    setWriteOpen(false); setEditing(null)
  }

  return (
    <ParticlesProvider init={initEngine}>
      <div className="relative h-screen w-screen overflow-hidden bg-black font-sans">
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-sky-300 via-rose-200 to-amber-100 transition-opacity duration-[1200ms]" style={{ opacity: night ? 0 : 1 }} aria-label="Daytime sky" />
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#070b1c] via-[#141a38] to-[#2a1a3a] transition-opacity duration-[1200ms]" style={{ opacity: night ? 1 : 0, backgroundImage: 'radial-gradient(1px 1px at 12% 18%, #fff, transparent), radial-gradient(1px 1px at 28% 32%, #fff, transparent), radial-gradient(1.5px 1.5px at 45% 12%, #fff, transparent), radial-gradient(1px 1px at 63% 26%, #fff, transparent), radial-gradient(1px 1px at 78% 14%, #fff, transparent), radial-gradient(1.5px 1.5px at 88% 30%, #fff, transparent), linear-gradient(to bottom, #070b1c, #141a38, #2a1a3a)' }} aria-label="Starry night sky" />

        <div className="absolute inset-0 z-[15]">
          <Scene night={night} tags={tags} paused={paused} operatorId={operatorId} onOpen={setActiveTag} />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[18] transition-opacity duration-[1200ms]" style={{ opacity: night ? 1 : 0, background: 'radial-gradient(circle at 50% 40%, transparent 30%, rgba(6,10,28,0.55) 100%)' }} aria-hidden />

        <Weather night={night} />

        {/* TOP control bar — moved up so mobile browser chrome (bottom bars) never covers it */}
        <div className="absolute inset-x-0 top-0 z-[45] flex items-start justify-between gap-2 px-3 sm:px-4" style={{ paddingTop: 'max(0.85rem, env(safe-area-inset-top))' }}>
          <Link to="/" className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/40 px-3.5 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60"><ArrowLeft size={15} /><span className="hidden sm:inline">{t.home}</span></Link>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="flex items-center gap-1 rounded-full border border-white/20 bg-black/40 p-1 backdrop-blur-md">
              {LANGS.map((l) => (
                <button key={l.code} type="button" onClick={() => setLang(l.code)} className={`rounded-full px-2.5 py-1 font-mono text-[11px] transition ${lang === l.code ? 'bg-accent/70 text-white' : 'text-white/70 hover:text-white'}`}>{l.label}</button>
              ))}
            </div>
            <button type="button" onClick={() => setNight((n) => !n)} aria-label={night ? t.day : t.night} className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-black/40 px-3 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60">{night ? <SunIcon size={15} /> : <MoonIcon size={15} />}<span className="hidden sm:inline">{night ? t.day : t.night}</span></button>
            <button type="button" onClick={openWrite} className="group inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-rose-300 px-4 py-2 font-serif text-sm font-semibold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.98]">
              {myTag ? <Pencil size={15} /> : <Mail size={16} />}<span className="hidden sm:inline">{myTag ? t.editMine : t.leave}</span>
            </button>
          </div>
        </div>

        {/* title sits just below the control bar */}
        <div className="pointer-events-none absolute left-1/2 z-[44] -translate-x-1/2 text-center" style={{ top: 'calc(max(0.85rem, env(safe-area-inset-top)) + 3.3rem)' }}>
          <h1 className="font-serif text-xl font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] sm:text-3xl">{t.title}</h1>
          <p className="mt-1 hidden font-serif text-xs text-white/80 drop-shadow sm:block">{t.sub}</p>
        </div>

        <ReadModal tag={activeTag} t={t} canEdit={!!activeTag && activeTag.ownerId === operatorId} onEdit={editFromRead} onClose={() => setActiveTag(null)} />
        <WriteModal open={writeOpen} editing={editing} t={t} onClose={() => { setWriteOpen(false); setEditing(null) }} onSubmit={submitMemory} />
        <WelcomeModal open={welcome} onClose={() => setWelcome(false)} />
      </div>
    </ParticlesProvider>
  )
}
