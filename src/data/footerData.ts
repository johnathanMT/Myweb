// ============================================================================
//  footerData.ts — links and copy for the site footer (MegaFooter.tsx).
//  Labels fall back to `en` for any key a language leaves out.
// ============================================================================
import { SITE } from '../config/site'
import { CONTACT } from './contact'
import type { LangCode } from './i18n'

export interface FooterCopy {
  position: string
  city: string
  navTitle: string
  accessTitle: string
  about: string
  projects: string
  stack: string
  lab: string
  gallery: string
  exploring: string
  sanctuary: string
  immersive: string
  blog: string
  cv: string
  cvRequest: string
  colophon: string
}

/** `key` is translated through FOOTER_T; `label` is shown as is. */
type FooterText = { key: keyof FooterCopy; label?: undefined } | { label: string; key?: undefined }
type FooterTarget = { to: string; href?: undefined } | { href: string; to?: undefined }
export type FooterLink = FooterText & FooterTarget

const cv = CONTACT.cvUrl

/** Keys index FOOTER_T. */
export const NAV: FooterLink[] = [
  { key: 'about', to: '/about' },
  { key: 'projects', to: '/projects' },
  { key: 'stack', to: '/stack' },
  { key: 'lab', to: '/lab' },
  { key: 'gallery', to: '/gallery' },
  { key: 'exploring', to: '/exploring' },
  { key: 'sanctuary', to: '/sanctuary' },
  { key: 'immersive', href: 'https://immersive.myothant.dev' },
  { key: 'blog', href: SITE.asset('blog.html') },
]

export const ACCESS: FooterLink[] = [
  { label: 'GitHub', href: 'https://github.com/johnathanMT' },
  { label: 'LinkedIn', href: CONTACT.linkedin },
  { label: SITE.email, href: SITE.mailto },
  // becomes a direct download as soon as CONTACT.cvUrl is set in contact.ts
  cv
    ? { key: 'cv', href: /^https?:/.test(cv) ? cv : SITE.asset(cv) }
    : { key: 'cvRequest', href: `${SITE.mailto}?subject=${encodeURIComponent('CV request')}` },
]

export const FOOTER_T: { en: FooterCopy } & Partial<Record<LangCode, Partial<FooterCopy>>> = {
  en: { position: 'AI Research & Software Engineering · Tokyo, Japan', city: 'TOKYO', navTitle: 'Navigation', accessTitle: 'Direct access', about: 'About', projects: 'Projects', stack: 'Stack', lab: 'Techno Science Lab', gallery: 'Gallery', exploring: 'Exploring', sanctuary: 'Sanctuary', immersive: 'Immersive 3D', blog: 'Blog', cv: 'Download CV', cvRequest: 'Request CV', colophon: 'Engineered in Tokyo' },
  jp: { position: 'AI研究 & ソフトウェアエンジニアリング · 東京', city: '東京', navTitle: 'ナビゲーション', accessTitle: 'お問い合わせ', about: '概要', projects: 'プロジェクト', stack: 'スタック', lab: 'テクノサイエンス', gallery: 'ギャラリー', exploring: '探索', sanctuary: '記憶の木', blog: 'ブログ', cv: '履歴書をダウンロード', cvRequest: '履歴書を依頼する', colophon: '東京にて開発' },
  mm: { position: 'AI သုတေသနနှင့် ဆော့ဖ်ဝဲ အင်ဂျင်နီယာပညာ · တိုကျို၊ ဂျပန်', city: 'တိုကျို', navTitle: 'ကဏ္ဍများ', accessTitle: 'ဆက်သွယ်ရန်', about: 'အကြောင်း', projects: 'ပရောဂျက်များ', stack: 'နည်းပညာများ', gallery: 'ပြခန်း', exploring: 'စူးစမ်းလေ့လာမှု', sanctuary: 'အမှတ်တရပင်', blog: 'ဘလော့ဂ်', cv: 'CV ဒေါင်းလုဒ်ရယူရန်', cvRequest: 'CV တောင်းခံရန်', colophon: 'တိုကျိုတွင် တည်ဆောက်သည်' },
  vn: { position: 'Nghiên cứu AI & Kỹ thuật phần mềm · Tokyo, Nhật Bản', navTitle: 'Điều hướng', accessTitle: 'Liên hệ', about: 'Giới thiệu', projects: 'Dự án', stack: 'Công nghệ', gallery: 'Thư viện', exploring: 'Khám phá', sanctuary: 'Cây Kỷ Niệm', cv: 'Tải CV', cvRequest: 'Yêu cầu CV', colophon: 'Phát triển tại Tokyo' },
  ne: { position: 'AI अनुसन्धान र सफ्टवेयर इन्जिनियरिङ · टोकियो, जापान', city: 'टोकियो', navTitle: 'पृष्ठहरू', accessTitle: 'सम्पर्क', about: 'परिचय', projects: 'परियोजना', stack: 'स्ट्याक', gallery: 'ग्यालरी', exploring: 'अन्वेषण', sanctuary: 'सम्झना रूख', blog: 'ब्लग', cv: 'CV डाउनलोड', cvRequest: 'CV अनुरोध', colophon: 'टोकियोमा निर्मित' },
  id: { position: 'Riset AI & Rekayasa Perangkat Lunak · Tokyo, Jepang', navTitle: 'Navigasi', accessTitle: 'Kontak', about: 'Tentang', projects: 'Proyek', stack: 'Teknologi', gallery: 'Galeri', exploring: 'Jelajahi', sanctuary: 'Pohon Kenangan', cv: 'Unduh CV', cvRequest: 'Minta CV', colophon: 'Dibuat di Tokyo' },
  zh: { position: 'AI 研究与软件工程 · 日本东京', city: '东京', navTitle: '导航', accessTitle: '联系', about: '关于', projects: '项目', stack: '技术栈', lab: '科技实验室', gallery: '画廊', exploring: '探索', sanctuary: '记忆之树', blog: '博客', cv: '下载简历', cvRequest: '索取简历', colophon: '于东京构建' },
}
