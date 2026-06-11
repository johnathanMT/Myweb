import { useEffect, useRef } from 'react'
import { PERSONAL, SKILLS } from '../data/content'

const T = {
  
  mm: { title: 'ကျတော့် အကြောင်း', bio: 'ဂျပန်တွင် နေထိုင်သည်။ တိုးတက်ပြောင်းလဲနေသော Ai ခေတ်သစ်ဆီသို့', slogan: 'ဘယ်တော့မှ မစတင်ဖြစ်ခဲ့တာထက်စာရင် နောက်ကျတာက ပိုကောင်းပါတယ်။', skills: 'အဓိက ကျွမ်းကျင်မှုများ' },
  en: { title: 'About Me', bio: 'Living in Japan. Advancing towards the evolving new era of AI.', slogan: 'Better late than never.', skills: 'Core Competencies' },
  jp: { title: '私について', bio: '日本在住。進化し続ける新しいAI時代へ。', slogan: '遅れても、全くやらないよりはまし。', skills: 'コアスキル' },
  vn: { title: 'Về Tôi', bio: 'Sống ở Nhật Bản. Hướng tới kỷ nguyên AI mới đang không ngừng phát triển.', slogan: 'Thà muộn còn hơn không.', skills: 'Năng lực cốt lõi' },
  ne: { title: 'मेरो बारेमा', bio: 'जापानमा बसोबास। विकासशील नयाँ एआई (AI) युगको तर्फ।', slogan: 'कहिल्यै सुरु नगर्नुभन्दा ढिलो सुरु गर्नु राम्रो हो।', skills: 'मुख्य दक्षताहरू' },
  id: { title: 'Tentang Saya', bio: 'Tinggal di Jepang. Melangkah menuju era baru AI yang terus berkembang.', slogan: 'Lebih baik terlambat daripada tidak sama sekali.', skills: 'Kompetensi Inti' }
}



export default function About({ lang }) {
  const t = T[lang] || T.en
  const sectionRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      }),
      { threshold: 0.1 }
    )
    const revealEls = sectionRef.current?.querySelectorAll('.reveal')
    revealEls?.forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative py-24 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-b from-space to-surface pointer-events-none" />

      <div className="section-container relative z-10">
        {/* Header */}
        <div className="reveal mb-16">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-2">Who I Am</p>
          <h2 className="section-title">{t.title}</h2>
        </div>

        {/* Profile + Bio */}
        <div className="reveal grid md:grid-cols-2 gap-12 items-center mb-16">
          {/* Photo */}
          <div className="flex justify-center md:justify-start">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-accent/20 blur-2xl scale-110 pointer-events-none" />
              <div className="relative w-64 h-64 rounded-3xl overflow-hidden ring-2 ring-accent/30 ring-offset-4 ring-offset-space bg-card flex items-center justify-center">
                {/* Initials fallback sits underneath; the photo covers it when it loads. */}
                <span className="absolute text-5xl font-bold text-accent/40 select-none">MTN</span>
                <img
                  src={PERSONAL.photo}
                  alt={PERSONAL.name}
                  className="relative w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-4 -right-4 bg-card border border-white/10 rounded-2xl px-4 py-2 shadow-xl">
                <p className="text-xs text-muted">Based in</p>
                <p className="text-sm font-semibold text-white">Japan 🇯🇵</p>
              </div>
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{PERSONAL.name}</h3>
              <p className="text-accent text-sm font-mono">{PERSONAL.handle}</p>
            </div>
            <p className="text-gray-300 text-base leading-relaxed">{t.bio}</p>

            {/* Quote */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-accent/5 border border-accent/15">
              <i className="fas fa-quote-left text-accent/50 mt-0.5 text-lg flex-shrink-0" />
              <p className="text-gray-300 text-sm font-medium italic">{t.slogan}</p>
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: 'fas fa-graduation-cap', label: 'IT University', value: 'Enrolled' },
                { icon: 'fas fa-briefcase-medical', label: 'Background', value: 'Healthcare' },
                { icon: 'fas fa-code', label: 'Focus', value: 'AI / Web Dev' },
                { icon: 'fas fa-language', label: 'Languages', value: 'EN · JP · MY' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-white/5">
                  <i className={`${icon} text-accent w-4`} />
                  <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-sm font-medium text-white">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="reveal">
          <p className="text-accent text-sm font-semibold uppercase tracking-widest mb-6">{t.skills}</p>
          <div className="flex flex-wrap gap-2.5">
            {SKILLS.map(({ name, icon, color }) => (
              <div
                key={name}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-white/5 hover:border-white/15 transition-all duration-200 group cursor-default"
              >
                <i
                  className={`${icon} text-sm transition-transform duration-200 group-hover:scale-110`}
                  style={{ color }}
                />
                <span className="text-sm text-gray-300 font-medium">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
