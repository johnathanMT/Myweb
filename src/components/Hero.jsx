import { useEffect, useRef } from 'react'
import { PERSONAL } from '../data/content'

const T = {
  en: { greeting: "Hello, I'm", tagline: "From Caring to Coding in Japan 🇯🇵", sub: "IT Student · Care-giver · Aspiring AI Engineer & Passionate Coder", cta: "View My Work" },
  mm: { greeting: "မင်္ဂလာပါ၊ ကျွန်တော်",     tagline: "ဂျပန်တွင် Caring မှ Coding သို့ 🇯🇵",  sub: "IT ကျောင်းသား · ပြုစုသူ · AI Engineer ဖြစ်ရန် ရည်မှန်းသူ", cta: "ကျွန်တော်၏ လုပ်ငန်းများ ကြည့်ရန်" },
  jp: { greeting: "こんにちは、私は",              tagline: "日本でケアからコーディングへ 🇯🇵",            sub: "IT学生 · 介護士 · 志望AIエンジニア & 熱心なコーダー",                 cta: "作品を見る" },
  vn: { greeting: "Xin chào, tôi là",           tagline: "Từ Chăm Sóc đến Lập Trình ở Nhật 🇯🇵",  sub: "Sinh viên IT · Người chăm sóc · Kỹ sư AI đầy hoài bão",      cta: "Xem tác phẩm của tôi" },
  ne: { greeting: "नमस्ते, म हुँ",               tagline: "जापानमा केयरिङ देखि कोडिङसम्म 🇯🇵",      sub: "IT विद्यार्थी · स्वास्थ्य सेवक · AI इन्जिनियर बन्ने सपना",    cta: "मेरो काम हेर्नुहोस्" },
  id: { greeting: "Halo, saya",                 tagline: "Dari Merawat ke Coding di Jepang 🇯🇵",  sub: "Mahasiswa IT · Perawat · Calon AI Engineer & Programmer",     cta: "Lihat Karya Saya" },
}

export default function Hero({ lang }) {
  const t = T[lang] || T.en
  const particlesRef = useRef(null)

  useEffect(() => {
    // Simple canvas particle effect
    const canvas = particlesRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const particles = []
    const count = 60

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < count; i++) {
      particles.push({
        x:  Math.random() * canvas.width,
        y:  Math.random() * canvas.height,
        r:  Math.random() * 1.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        a:  Math.random() * 0.5 + 0.1,
      })
    }

    let rafId
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(124, 58, 237, ${p.a})`
        ctx.fill()
      })
      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(124, 58, 237, ${0.06 * (1 - dist/120)})`
            ctx.lineWidth = 0.5
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }
      rafId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-space via-surface to-space" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-coral/3 rounded-full blur-3xl pointer-events-none" />

      {/* Particle canvas */}
      <canvas
        ref={particlesRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ opacity: 0.7 }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative z-10 section-container text-center flex flex-col items-center gap-6">

        {/* Status pill */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-accent-light text-sm font-medium">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Available for opportunities
        </div>

        {/* Greeting + Name */}
        <div>
          <p className="text-muted text-lg mb-2 font-light">{t.greeting}</p>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-none">
            Myo{' '}
            <span className="accent-gradient">Thant</span>{' '}
            Naing
          </h1>
        </div>

        {/* Tagline */}
        <p className="text-lg md:text-xl text-muted max-w-lg font-light leading-relaxed">
          {t.tagline}
        </p>

        {/* Sub roles */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {['IT Student', 'Care-giver', 'AI Engineer (Aspiring)', 'Passionate Coder'].map(role => (
            <span
              key={role}
              className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 bg-white/5 text-gray-400"
            >
              {role}
            </span>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-4 justify-center mt-4">
          <a
            href="#projects"
            onClick={(e) => { e.preventDefault(); document.querySelector('#projects')?.scrollIntoView({ behavior: 'smooth' }) }}
            className="px-7 py-3 rounded-xl bg-accent hover:bg-accent-light text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-accent/25 hover:shadow-accent/40 hover:-translate-y-0.5"
          >
            {t.cta}
          </a>
          <a
            href="https://github.com/johnathanMT"
            target="_blank"
            rel="noopener noreferrer"
            className="px-7 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-sm transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-2"
          >
            <i className="fab fa-github" />
            GitHub
          </a>
        </div>

        {/* Scroll indicator */}
        <div className="mt-12 flex flex-col items-center gap-2 opacity-40">
          <span className="text-xs text-muted tracking-widest uppercase">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-muted to-transparent" />
        </div>
      </div>
    </section>
  )
}
