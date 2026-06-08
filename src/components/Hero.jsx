import { useEffect, useRef, useState } from 'react'
import '../hero-effects.css'

const T = {
  en: { greeting: "Hello, I'm", tagline: "From Caring to Coding in Japan 🇯🇵", sub: "IT Student · Care-giver · Aspiring AI Engineer & Passionate Coder", cta: "View My Work" },
  mm: { greeting: "မင်္ဂလာပါ၊ ကျွန်တော်",     tagline: "ဂျပန်တွင် Caring မှ Coding သို့ 🇯🇵",  sub: "IT ကျောင်းသား · ပြုစုသူ · AI Engineer ဖြစ်ရန် ရည်မှန်းသူ", cta: "ကျွန်တော်၏ လုပ်ငန်းများ ကြည့်ရန်" },
  jp: { greeting: "こんにちは、私は",              tagline: "日本でケアからコーディングへ 🇯🇵",            sub: "IT学生 · 介護士 · 志望AIエンジニア & 熱心なコーダー",                 cta: "作品を見る" },
  vn: { greeting: "Xin chào, tôi là",           tagline: "Từ Chăm Sóc đến Lập Trình ở Nhật 🇯🇵",  sub: "Sinh viên IT · Người chăm sóc · Kỹ sư AI đầy hoài bão",      cta: "Xem tác phẩm của tôi" },
  ne: { greeting: "नमस्ते, म हुँ",               tagline: "जापानमा केयरिङ देखि कोडिङसम्म 🇯🇵",      sub: "IT विद्यार्थी · स्वास्थ्य सेवक · AI इन्जिनियर बन्ने सपना",    cta: "मेरो काम हेर्नुहोस्" },
  id: { greeting: "Halo, saya",                 tagline: "Dari Merawat ke Coding di Jepang 🇯🇵",  sub: "Mahasiswa IT · Perawat · Calon AI Engineer & Programmer",     cta: "Lihat Karya Saya" },
}

const NAME = 'MYO THANT NAING'

export default function Hero({ lang }) {
  const t = T[lang] || T.en
  const particlesRef = useRef(null)
  const [ready, setReady] = useState(false)

  // enable the looping glitch only after the per-letter reveal completes
  useEffect(() => {
    const id = setTimeout(() => setReady(true), NAME.length * 70 + 700)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    const canvas = particlesRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const particles = []
    const count = 60
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight }
    resize(); window.addEventListener('resize', resize)
    for (let i = 0; i < count; i++) particles.push({
      x: Math.random()*canvas.width, y: Math.random()*canvas.height,
      r: Math.random()*1.5+0.3, vx:(Math.random()-0.5)*0.3, vy:(Math.random()-0.5)*0.3,
      a: Math.random()*0.5+0.1,
    })
    let raf
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      particles.forEach(p => {
        p.x+=p.vx; p.y+=p.vy
        if(p.x<0)p.x=canvas.width; if(p.x>canvas.width)p.x=0
        if(p.y<0)p.y=canvas.height; if(p.y>canvas.height)p.y=0
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(124,58,237,${p.a})`; ctx.fill()
      })
      for (let i=0;i<particles.length;i++) for (let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y
        const d=Math.sqrt(dx*dx+dy*dy)
        if(d<120){ ctx.beginPath(); ctx.strokeStyle=`rgba(124,58,237,${0.06*(1-d/120)})`
          ctx.lineWidth=0.5; ctx.moveTo(particles[i].x,particles[i].y); ctx.lineTo(particles[j].x,particles[j].y); ctx.stroke() }
      }
      raf=requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-space via-surface to-space" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-coral/10 rounded-full blur-3xl pointer-events-none" />
      <canvas ref={particlesRef} className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.7 }} />
      <div className="hero-grid pointer-events-none absolute inset-0" />

      {/* content */}
      <div className="relative z-10 section-container text-center flex flex-col items-center gap-6 px-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Available for opportunities
        </div>

        <p className="text-muted text-lg font-light">{t.greeting}</p>

        {/* CRUCIAL: animated, faceted, energy-pulse title */}
        <h1
          className={`hero-name justify-center text-5xl sm:text-7xl lg:text-8xl ${ready ? 'is-ready' : ''}`}
          aria-label={NAME}
        >
          {NAME.split('').map((ch, i) => (
            <span key={i} className="ltr" data-ch={ch} style={{ '--i': i }} aria-hidden="true">
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </h1>

        <p className="text-lg md:text-xl text-muted max-w-xl font-light leading-relaxed">{t.tagline}</p>

        <div className="flex flex-wrap justify-center gap-2 mt-1">
          {t.sub.split('·').map((role) => (
            <span key={role} className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-400">
              {role.trim()}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <a href="#projects"
            onClick={(e)=>{e.preventDefault();document.querySelector('#projects')?.scrollIntoView({behavior:'smooth'})}}
            className="px-7 py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-semibold text-sm transition-all shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5">
            {t.cta}
          </a>
          <a href="#about"
            onClick={(e)=>{e.preventDefault();document.querySelector('#about')?.scrollIntoView({behavior:'smooth'})}}
            className="px-7 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all hover:-translate-y-0.5">
            My Story
          </a>
        </div>

        <div className="mt-12 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-muted tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted to-transparent" />
        </div>
      </div>
    </section>
  )
}
