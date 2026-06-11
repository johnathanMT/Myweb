import { motion } from 'framer-motion'
import { SITE } from '../config/site'

/**
 * AILineBot — "Talk to my AI agent" promo for the homepage.
 *
 * Cyberpunk glass panel (cyan × magenta neon) that matches the CRTHero theme.
 * Self-contained: drop <AILineBot lang={lang} /> anywhere and it renders.
 *
 * To edit copy later, change ONLY the T object below. Each language key mirrors
 * the app's existing language codes (en, jp = 日本語, mm = မြန်မာ, plus vn/ne/id).
 * Unknown codes fall back to English.
 */

const T = {
  en: {
    kicker: 'AI ASSISTANT',
    title: 'Talk to my AI agent',
    sub: 'My LINE AI bot answers questions about me, my work, and my journey — anytime, in your language.',
    cta: 'Click here to chat with my AI agent',
    badge: 'powered by LINE',
  },
  jp: {
    kicker: 'AI アシスタント',
    title: '私のAIエージェントと話す',
    sub: '私のLINE AIボットが、私自身・仕事・歩みについて、いつでもお答えします。',
    cta: 'ここをクリックしてAIエージェントとチャット',
    badge: 'LINE で稼働中',
  },
  mm: {
    kicker: 'AI အကူအညီ',
    title: 'ကျွန်တော့် AI agent နှင့် စကားပြောကြမယ်',
    sub: 'ကျွန်တော့် LINE AI bot က ကျွန်တော်၊ ကျွန်တော့်အလုပ်နှင့် ခရီးအကြောင်းကို အချိန်မရွေး ဖြေကြားပေးပါတယ်။',
    cta: 'AI agent နှင့် စကားပြောရန် ဒီနေရာကို နှိပ်ပါ',
    badge: 'LINE ဖြင့် လည်ပတ်သည်',
  },
  vn: {
    kicker: 'TRỢ LÝ AI',
    title: 'Trò chuyện với AI agent của tôi',
    sub: 'Bot AI LINE của tôi trả lời câu hỏi về tôi, công việc và hành trình của tôi — bất cứ lúc nào.',
    cta: 'Nhấp vào đây để trò chuyện với AI agent của tôi',
    badge: 'chạy bằng LINE',
  },
  ne: {
    kicker: 'AI सहायक',
    title: 'मेरो AI एजेन्टसँग कुरा गर्नुहोस्',
    sub: 'मेरो LINE AI बटले मेरो, मेरो काम र यात्राबारे जुनसुकै बेला जवाफ दिन्छ।',
    cta: 'मेरो AI एजेन्टसँग कुराकानी गर्न यहाँ क्लिक गर्नुहोस्',
    badge: 'LINE द्वारा संचालित',
  },
  id: {
    kicker: 'ASISTEN AI',
    title: 'Bicara dengan AI agent saya',
    sub: 'Bot AI LINE saya menjawab pertanyaan tentang saya, pekerjaan, dan perjalanan saya — kapan saja.',
    cta: 'Klik di sini untuk mengobrol dengan AI agent saya',
    badge: 'didukung oleh LINE',
  },
}

export default function AILineBot({ lang = 'en' }) {
  const t = T[lang] || T.en

  return (
    <section id="ai-agent" className="relative py-24">
      <div className="section-container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
          className="relative mx-auto max-w-4xl overflow-hidden rounded-3xl border border-cyan/25 bg-card/70 p-8 sm:p-12 backdrop-blur-xl"
          style={{ boxShadow: '0 0 40px -12px rgba(0,212,255,0.35), inset 0 0 60px -40px rgba(124,58,237,0.6)' }}
        >
          {/* hex / grid backdrop */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(0,212,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.6) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              maskImage: 'radial-gradient(ellipse at center, #000 30%, transparent 75%)',
            }}
          />
          {/* magenta corner glow */}
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,61,240,0.35), transparent 70%)' }} />
          {/* cyan corner glow */}
          <div aria-hidden className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full" style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.30), transparent 70%)' }} />

          <div className="relative flex flex-col items-center text-center">
            {/* kicker chip */}
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/5 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
              {t.kicker}
            </span>

            {/* animated robot orb */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br from-accent/30 to-cyan/20 text-2xl text-white"
              style={{ boxShadow: '0 0 24px -4px rgba(124,58,237,0.6)' }}
            >
              <i className="fas fa-robot" />
            </motion.div>

            <h2 className="text-3xl font-bold text-white sm:text-4xl">{t.title}</h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-gray-300">{t.sub}</p>

            {/* CTA */}
            <a
              href={SITE.lineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-cyan to-accent px-7 py-3.5 text-sm font-semibold text-[#04121a] shadow-lg shadow-cyan/25 transition-transform duration-200 hover:-translate-y-0.5"
            >
              <i className="fab fa-line text-lg" />
              <span>{t.cta}</span>
              <i className="fas fa-arrow-right text-xs transition-transform duration-200 group-hover:translate-x-1" />
            </a>

            <span className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted">{t.badge}</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
