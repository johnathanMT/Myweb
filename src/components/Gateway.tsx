import { Link } from 'react-router-dom'
import { motion, type MotionProps } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { PERSONAL } from '../data/content'
import { prefetchRoute } from '../routes'
import NeuralAttentionHero from './hero/NeuralAttentionHero'
import './Gateway.css'

/** `title` is split so the closing words can carry the accent. */
interface HeroText { eyebrow: string; title: [string, string, string]; place: string; summary: string; work: string; recruiter: string }

const T: Record<string, HeroText> = {
  en: {
    eyebrow: 'AI RESEARCH & SOFTWARE ENGINEERING',
    title: ['Engineering Intelligent Systems with ', 'Precision.', ''],
    place: 'Tokyo, Japan',
    summary: 'Practical AI systems, enterprise-grade security architecture and resilient software, built with technical rigor and human empathy.',
    work: 'Explore Case Studies',
    recruiter: 'Recruiter Fast-Track',
  },
  jp: {
    eyebrow: 'AI研究 & ソフトウェアエンジニアリング',
    title: ['知的システムを、', '精緻に', '設計する。'],
    place: '東京',
    summary: '実用的なAI、エンタープライズ水準のセキュリティ設計、堅牢なソフトウェアを、技術的な厳密さと人への共感をもって築きます。',
    work: '開発事例を見る',
    recruiter: '採用担当者の方へ',
  },
  mm: {
    eyebrow: 'AI သုတေသနနှင့် ဆော့ဖ်ဝဲ အင်ဂျင်နီယာပညာ',
    title: ['ဉာဏ်ရည်မြင့် စနစ်များကို ', 'တိကျစွာ', ' တည်ဆောက်ခြင်း။'],
    place: 'တိုကျို၊ ဂျပန်',
    summary: 'လက်တွေ့အသုံးဝင်သော AI စနစ်များ၊ လုပ်ငန်းသုံးအဆင့် လုံခြုံရေး ဗိသုကာနှင့် ခိုင်ခံ့သော ဆော့ဖ်ဝဲများကို နည်းပညာ တိကျမှု၊ လူသားချင်း စာနာမှုတို့ဖြင့် တည်ဆောက်ပါသည်။',
    work: 'Case Study များ ကြည့်ရန်',
    recruiter: 'အလုပ်ခန့်အပ်သူများအတွက်',
  },
  vn: {
    eyebrow: 'NGHIÊN CỨU AI & KỸ THUẬT PHẦN MỀM',
    title: ['Kiến tạo hệ thống thông minh với ', 'độ chính xác.', ''],
    place: 'Tokyo, Nhật Bản',
    summary: 'Hệ thống AI thực tiễn, kiến trúc bảo mật cấp doanh nghiệp và phần mềm bền vững, xây dựng bằng sự chặt chẽ kỹ thuật và lòng thấu cảm.',
    work: 'Xem các dự án tiêu biểu',
    recruiter: 'Dành cho nhà tuyển dụng',
  },
  ne: {
    eyebrow: 'AI अनुसन्धान र सफ्टवेयर इन्जिनियरिङ',
    title: ['बौद्धिक प्रणालीहरूको ', 'सटीक', ' निर्माण।'],
    place: 'टोकियो, जापान',
    summary: 'व्यावहारिक AI प्रणाली, उद्यम-स्तरीय सुरक्षा संरचना र भरपर्दो सफ्टवेयर — प्राविधिक शुद्धता र मानवीय समानुभूतिका साथ।',
    work: 'केस स्टडी हेर्नुहोस्',
    recruiter: 'रोजगारदाताका लागि',
  },
  id: {
    eyebrow: 'RISET AI & REKAYASA PERANGKAT LUNAK',
    title: ['Merekayasa Sistem Cerdas dengan ', 'Presisi.', ''],
    place: 'Tokyo, Jepang',
    summary: 'Sistem AI praktis, arsitektur keamanan kelas enterprise, dan perangkat lunak tangguh, dibangun dengan ketelitian teknis dan empati.',
    work: 'Jelajahi Studi Kasus',
    recruiter: 'Jalur Cepat Perekrut',
  },
  zh: {
    eyebrow: 'AI 研究与软件工程',
    title: ['以', '精确', '构建智能系统。'],
    place: '日本东京',
    summary: '以严谨的技术与对人的同理心，打造实用的 AI 系统、企业级安全架构与稳健的软件。',
    work: '查看案例研究',
    recruiter: '招聘者快速通道',
  },
}

const TITLES: Record<string, string> = PERSONAL.titles

const rise = (delay: number): MotionProps => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] },
})

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
          <Link to="/projects" className="nah-btn is-primary" onMouseEnter={() => prefetchRoute('/projects')} onFocus={() => prefetchRoute('/projects')}>
            {t.work} <ArrowRight size={16} aria-hidden />
          </Link>
          <Link to="/?mode=recruiter" className="nah-btn is-line">{t.recruiter}</Link>
        </motion.div>
      </div>
    </section>
  )
}
