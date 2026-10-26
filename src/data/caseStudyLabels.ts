/** UI labels for the case-study layout and grid, per LangContext code (en fallback). */
export interface CaseLabels {
  back: string
  caseStudy: string
  problem: string
  role: string
  architecture: string
  decisions: string
  results: string
  diagramNote: string
  read: string
  gridKicker: string
  gridTitle: string
  gridSubtitle: string
}

const LABELS: Record<string, CaseLabels> = {
  en: {
    back: 'All projects',
    caseStudy: 'Case study',
    problem: 'The Problem',
    role: 'My Role',
    architecture: 'Architecture',
    decisions: 'Hard Technical Decisions',
    results: 'Results & Learnings',
    diagramNote: 'Diagram placeholder · detailed diagram coming soon',
    read: 'Read case study',
    gridKicker: '// Selected work',
    gridTitle: 'Case Studies',
    gridSubtitle: 'The problem, my role, the architecture and the hard decisions behind each build.',
  },
  mm: {
    back: 'Project အားလုံး',
    caseStudy: 'Case study',
    problem: 'ပြဿနာ',
    role: 'ကျွန်တော့်တာဝန်',
    architecture: 'Architecture',
    decisions: 'အရေးကြီးသော နည်းပညာဆုံးဖြတ်ချက်များ',
    results: 'ရလဒ်များနှင့် သင်ခန်းစာများ',
    diagramNote: 'Diagram placeholder · အသေးစိတ် diagram မကြာမီ ထည့်သွင်းပါမည်',
    read: 'Case study ဖတ်ရန်',
    gridKicker: '// ရွေးချယ်ထားသော လက်ရာများ',
    gridTitle: 'Case Studies',
    gridSubtitle: 'Project တစ်ခုစီ၏ ပြဿနာ၊ ကျွန်တော့်တာဝန်၊ architecture နှင့် အရေးကြီးသော ဆုံးဖြတ်ချက်များ။',
  },
  jp: {
    back: 'すべてのプロジェクト',
    caseStudy: 'ケーススタディ',
    problem: '課題',
    role: '私の役割',
    architecture: 'アーキテクチャ',
    decisions: '重要な技術判断',
    results: '成果と学び',
    diagramNote: '図はプレースホルダーです · 詳細な図は準備中',
    read: 'ケーススタディを読む',
    gridKicker: '// 主な実績',
    gridTitle: 'ケーススタディ',
    gridSubtitle: '各プロジェクトの課題、役割、アーキテクチャ、そして重要な技術判断。',
  },
}

export const caseLabels = (lang: string): CaseLabels => LABELS[lang] ?? LABELS.en
