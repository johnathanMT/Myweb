import { Link } from 'react-router-dom'
import { ArrowRight, MapPin, UserRound } from 'lucide-react'
import { PERSONAL } from '../data/content'
import { prefetchRoute } from '../routes'

interface ProfileText { kicker: string; title: string; role: string; based: string; cta: string }
const T: Record<string, ProfileText> = {
  en: { kicker: 'Profile', title: 'Hello, I’m Myo Thant Naing', role: PERSONAL.subtitle, based: 'Based in Japan', cta: 'Read my full story' },
  jp: { kicker: 'プロフィール', title: 'こんにちは、ミョーです', role: 'コンピュータサイエンス学生 · 介護士 · AIエンジニア志望', based: '日本在住', cta: '私のストーリーを読む' },
  mm: { kicker: 'ကိုယ်ရေးအကျဉ်း', title: 'မင်္ဂလာပါ၊ ကျွန်တော် မျိုးသန့်နိုင် ပါ', role: 'ကွန်ပျူတာသိပ္ပံ ကျောင်းသား · စောင့်ရှောက်သူ · AI Engineer ရည်မှန်းသူ', based: 'ဂျပန်နိုင်ငံတွင် နေထိုင်သည်', cta: 'ကျွန်တော့်ဇာတ်လမ်း အပြည့်အစုံ ဖတ်ရန်' },
}

const SUMMARY: Record<string, string[]> = PERSONAL.summary

interface ProfileSummaryProps { lang?: string }

/**
 * ProfileSummary — the landing page's "who am I" block, right under the hero.
 * Photo + name + a short summary bio, with a hand-off to the full /about page.
 * Copy follows the visitor's language (en / jp / mm), falling back to English.
 */
export default function ProfileSummary({ lang = 'en' }: ProfileSummaryProps) {
  const t = T[lang] || T.en
  const summary = SUMMARY[lang] || SUMMARY.en

  return (
    <section id="profile" className="relative py-20 sm:py-24" aria-labelledby="profile-title">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="font-mono text-xs uppercase tracking-[0.35em] text-accent">
          <UserRound size={12} className="mr-2 inline -translate-y-px" aria-hidden />{t.kicker}
        </p>
        <h2 id="profile-title" className="section-title mt-3">{t.title}</h2>

        <div className="glass-card mt-8 grid items-center gap-8 p-6 sm:p-8 md:grid-cols-[auto_1fr] md:gap-12">
          {/* photo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute -inset-1 rounded-[28px] opacity-60 blur-md"
                style={{ background: 'conic-gradient(from 0deg, rgb(var(--accent)), rgb(var(--cyan)), rgb(var(--accent)))' }} aria-hidden />
              <div className="relative h-48 w-48 overflow-hidden rounded-3xl bg-card ring-1 ring-white/10 sm:h-56 sm:w-56">
                <span className="absolute inset-0 flex items-center justify-center text-4xl font-bold text-accent/30 select-none" aria-hidden>MTN</span>
                <picture>
                  {PERSONAL.photoWebp && <source srcSet={PERSONAL.photoWebp} type="image/webp" />}
                  <img
                    src={PERSONAL.photo}
                    alt={PERSONAL.name}
                    width="224" height="224"
                    className="relative h-full w-full object-cover object-[center_80%]"
                    loading="lazy" decoding="async"
                    onError={(e) => { e.currentTarget.style.visibility = 'hidden' }}
                  />
                </picture>
              </div>
            </div>
          </div>

          {/* summary bio */}
          <div className="space-y-4 text-center md:text-left">
            <div>
              <h3 className="font-groovy text-2xl font-semibold tracking-wide text-fg">{PERSONAL.name}</h3>
              <p className="mt-1 text-sm text-muted">{t.role}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-xs text-accent-light">
                <MapPin size={12} aria-hidden /> {t.based}
              </p>
            </div>
            {summary.map((para) => (
              <p key={para.slice(0, 24)} className="text-[15px] leading-relaxed text-muted">{para}</p>
            ))}
            <Link
              to="/about"
              onMouseEnter={() => prefetchRoute('/about')}
              onFocus={() => prefetchRoute('/about')}
              className="btn-glass group mt-2 inline-flex"
            >
              {t.cta}
              <ArrowRight size={15} className="text-accent transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
