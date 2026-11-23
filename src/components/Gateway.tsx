import { Link } from 'react-router-dom'
import { motion, type MotionProps } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PERSONAL } from '../data/content'
import { prefetchRoute } from '../routes'
import NeuralAttentionHero from './hero/NeuralAttentionHero'
import './Gateway.css'

/** `title` is split so the closing words can carry the accent. */
interface HeroText { eyebrow: string; title: [string, string, string]; place: string; summary: string; work: string; about: string }

const T: Record<string, HeroText> = {
  en: {
    eyebrow: 'AI RESEARCH & SOFTWARE ENGINEERING',
    title: ['Engineering Intelligent Systems with ', 'Precision.', ''],
    place: 'Tokyo, Japan',
    summary: 'Building practical AI and full-stack systems, with a focus on advancing as an AI & Agentic AI Engineer: autonomous agents, intelligent orchestration and resilient architecture.',
    work: 'Explore Case Studies',
    about: 'About & Background',
  },
  jp: {
    eyebrow: 'AI研究 & ソフトウェアエンジニアリング',
    title: ['知的システムを、', '精緻に', '設計する。'],
    place: '東京',
    summary: '実践的なAIシステムとフルスタック開発に取り組みながら、自律型エージェント、オーケストレーション、堅牢な設計を強みとするAI・Agentic AIエンジニアを目指しています。',
    work: '開発事例を見る',
    about: '経歴・プロフィール',
  },
  mm: {
    eyebrow: 'AI သုတေသနနှင့် ဆော့ဖ်ဝဲ အင်ဂျင်နီယာပညာ',
    title: ['ဉာဏ်ရည်မြင့် စနစ်များကို ', 'တိကျစွာ', ' တည်ဆောက်ခြင်း။'],
    place: 'တိုကျို၊ ဂျပန်',
    summary: 'လက်တွေ့အသုံးချ AI စနစ်များနှင့် Full-Stack Engineering ကို တည်ဆောက်ရင်း AI & Agentic AI Engineer တစ်ဦးဖြစ်လာစေရန် ရည်မှန်းလျှောက်လှမ်းနေပါသည်။',
    work: 'Case Study များ ကြည့်ရန်',
    about: 'ကျွန်တော့်အကြောင်းနှင့် နောက်ခံ',
  },
  vn: {
    eyebrow: 'NGHIÊN CỨU AI & KỸ THUẬT PHẦN MỀM',
    title: ['Kiến tạo hệ thống thông minh với ', 'độ chính xác.', ''],
    place: 'Tokyo, Nhật Bản',
    summary: 'Xây dựng hệ thống AI và full-stack thực tiễn, hướng tới trở thành Kỹ sư AI & Agentic AI: tác tử tự chủ, điều phối thông minh và kiến trúc bền vững.',
    work: 'Xem các dự án tiêu biểu',
    about: 'Giới thiệu & Hành trình',
  },
  ne: {
    eyebrow: 'AI अनुसन्धान र सफ्टवेयर इन्जिनियरिङ',
    title: ['बौद्धिक प्रणालीहरूको ', 'सटीक', ' निर्माण।'],
    place: 'टोकियो, जापान',
    summary: 'व्यावहारिक AI र फुल-स्ट्याक प्रणाली निर्माण गर्दै, स्वायत्त एजेन्ट र भरपर्दो संरचनामा केन्द्रित AI तथा Agentic AI इन्जिनियर बन्ने दिशामा अघि बढिरहेको छु।',
    work: 'केस स्टडी हेर्नुहोस्',
    about: 'परिचय र पृष्ठभूमि',
  },
  id: {
    eyebrow: 'RISET AI & REKAYASA PERANGKAT LUNAK',
    title: ['Merekayasa Sistem Cerdas dengan ', 'Presisi.', ''],
    place: 'Tokyo, Jepang',
    summary: 'Membangun sistem AI dan full-stack yang praktis sambil melangkah menjadi AI & Agentic AI Engineer: agen otonom, orkestrasi cerdas, dan arsitektur tangguh.',
    work: 'Jelajahi Studi Kasus',
    about: 'Profil & Latar Belakang',
  },
  zh: {
    eyebrow: 'AI 研究与软件工程',
    title: ['以', '精确', '构建智能系统。'],
    place: '日本东京',
    summary: '专注构建实用的 AI 与全栈系统，并朝着 AI 与 Agentic AI 工程师的方向不断精进：自主智能体、智能编排与稳健架构。',
    work: '查看案例研究',
    about: '关于我与背景',
  },
}

const TITLES: Record<string, string> = PERSONAL.titles

const rise = (delay: number): MotionProps => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
})

const warm = (to: string) => ({ onMouseEnter: () => prefetchRoute(to), onFocus: () => prefetchRoute(to) })

/** Gateway — the homepage hero: vision statement first, authorship right beneath. */
export default function Gateway({ lang = 'en' }: { lang?: string }) {
  const t = T[lang] || T.en
  const [before, mark, after] = t.title

  return (
    <section id="home" className="nah">
      <NeuralAttentionHero />
      <div className="nah-copy">
        <motion.p {...rise(0)} className="nah-eyebrow">{t.eyebrow}</motion.p>
        <motion.h1 {...rise(0.06)} className="nah-title">{before}<em>{mark}</em>{after}</motion.h1>
        <motion.p {...rise(0.14)} className="nah-byline"><strong>{PERSONAL.name}</strong><span>{TITLES[lang] || TITLES.en} · {t.place}</span></motion.p>
        <motion.p {...rise(0.2)} className="nah-summary">{t.summary}</motion.p>
        <motion.div {...rise(0.26)} className="nah-cta">
          <Link to="/projects" className="nah-btn is-primary" {...warm('/projects')}>
            {t.work} <ArrowRight size={16} aria-hidden />
          </Link>
          <Link to="/about" className="nah-btn is-line" {...warm('/about')}>{t.about}</Link>
        </motion.div>
      </div>
    </section>
  )
}
