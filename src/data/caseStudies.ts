/**
 * Case studies — the long-form write-ups behind /projects/:slug.
 * Rendered by components/CaseStudyLayout and listed by CaseStudiesGrid.
 *
 * Shared facts (name, links, stack, architecture) sit on the study; everything
 * a visitor reads lives in `copy`, one entry per language (en / mm / jp, the
 * LangContext codes). Other site languages fall back to English.
 * Facts come from the shipped products and their source; add numbers to
 * `results` only when you can back them up.
 */
export type CaseLang = 'en' | 'mm' | 'jp'

export interface CaseDecision { title: string; detail: string }

export interface CaseCopy {
  kind: string
  summary: string
  liveLabel: string
  problem: string[]
  role: string[]
  decisions: CaseDecision[]
  results: string[]
}

export interface CaseStudy {
  slug: string
  name: string
  /** Native-script name, rendered with lang="my". */
  localName?: string
  /** Public entry point — live site or chat link. */
  liveUrl: string
  /** public/ path of the hero image. */
  thumb?: string
  stack: string[]
  /** Request flow, left → right. Drawn as a placeholder diagram until a real one exists. */
  architecture: string[]
  copy: Record<CaseLang, CaseCopy>
}

export const CASE_STUDIES: CaseStudy[] = [
  // ── May Dar We ──────────────────────────────────────────────────────────────
  {
    slug: 'may-dar-we',
    name: 'May Dar We Dumpling Shop',
    localName: 'မေဓါဝီဖက်ထုပ်အိုးကပ်ဆိုင်',
    liveUrl: 'https://www.maydarwedumpling.com',
    thumb: 'projects/maydarwe-dumpling.webp',
    stack: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'React Router', 'i18n'],
    architecture: ['Visitor (mobile)', 'Static React SPA (Vite)', 'i18n layer · MM / EN', 'Order hand-off: phone · Grab · foodpanda'],
    copy: {
      en: {
        kind: 'Client website · Restaurant · Yangon',
        summary: 'A bilingual brand site for a handmade dumpling house in Yangon, built so local customers can browse the menu and order in a couple of taps.',
        liveLabel: 'Visit live site',
        problem: [
          'The shop had no web presence of its own — customers found it through delivery apps and word of mouth, with no single place to see the full menu or the story behind the food.',
          'Its customers read Myanmar first, but some visitors and tourists need English, so the site had to work equally well in both.',
        ],
        role: [
          'Sole designer and developer — from the information architecture and visual design to the build and deployment.',
          'Worked directly with the owner to turn the menu, photos and brand story into content pages.',
        ],
        decisions: [
          { title: 'Hand off ordering instead of building a checkout', detail: 'Customers already order through phone, Grab and foodpanda. Linking straight to those channels avoided payments, order storage and staff retraining — and kept the site static, fast and nearly free to host.' },
          { title: 'Bilingual from day one', detail: 'All copy lives in per-language dictionaries rather than in components, so Myanmar and English stay in sync and a page can switch language without a reload.' },
          { title: 'Mobile-first layout', detail: 'Most visitors arrive on phones, so the menu, call and delivery buttons were designed for thumb reach first and scaled up to desktop afterwards.' },
        ],
        results: [
          'Live in production at maydarwedumpling.com.',
          'Learned to scope a real client project: shipping what the business needs now (menu, story, ordering) rather than everything that could be built.',
        ],
      },
      mm: {
        kind: 'Client website · စားသောက်ဆိုင် · ရန်ကုန်',
        summary: 'ရန်ကုန်ရှိ လက်လုပ်ဖက်ထုပ်ဆိုင်အတွက် မြန်မာ-အင်္ဂလိပ် နှစ်ဘာသာ brand website ဖြစ်ပြီး ဒေသခံဖောက်သည်များ menu ကို ကြည့်ရှုကာ နှိပ်ရုံဖြင့် လွယ်ကူစွာ မှာယူနိုင်ရန် တည်ဆောက်ထားပါသည်။',
        liveLabel: 'Website ကြည့်ရန်',
        problem: [
          'ဆိုင်တွင် ကိုယ်ပိုင် website မရှိသေးသဖြင့် ဖောက်သည်များသည် delivery app များနှင့် အပြောအဆိုမှတစ်ဆင့်သာ ဆိုင်ကို သိရှိကြပြီး menu အပြည့်အစုံနှင့် အစားအစာ၏ နောက်ခံဇာတ်လမ်းကို တစ်နေရာတည်းတွင် ကြည့်ရှုနိုင်ခြင်း မရှိခဲ့ပါ။',
          'ဖောက်သည်အများစုသည် မြန်မာဘာသာကို ဦးစားပေးဖတ်ကြသော်လည်း အင်္ဂလိပ်ဘာသာ လိုအပ်သော ဧည့်သည်နှင့် ခရီးသွားများလည်း ရှိသဖြင့် ဘာသာစကားနှစ်မျိုးလုံးတွင် တူညီစွာ အသုံးပြုနိုင်ရန် လိုအပ်ပါသည်။',
        ],
        role: [
          'Information architecture နှင့် visual design မှစ၍ တည်ဆောက်ခြင်း၊ deploy လုပ်ခြင်းအထိ တစ်ဦးတည်းသော designer နှင့် developer အဖြစ် တာဝန်ယူခဲ့ပါသည်။',
          'ဆိုင်ပိုင်ရှင်နှင့် တိုက်ရိုက်ပူးပေါင်းကာ menu၊ ဓာတ်ပုံများနှင့် brand ဇာတ်လမ်းကို content စာမျက်နှာများအဖြစ် ပြောင်းလဲခဲ့ပါသည်။',
        ],
        decisions: [
          { title: 'Checkout စနစ် မတည်ဆောက်ဘဲ ရှိပြီးသား မှာယူမှုလမ်းကြောင်းသို့ လွှဲပေးခြင်း', detail: 'ဖောက်သည်များသည် ဖုန်း၊ Grab နှင့် foodpanda မှတစ်ဆင့် မှာယူနေကြပြီး ဖြစ်သည်။ ထိုလမ်းကြောင်းများသို့ တိုက်ရိုက်ချိတ်ဆက်ပေးခြင်းဖြင့် ငွေပေးချေမှု၊ order data သိမ်းဆည်းမှုနှင့် ဝန်ထမ်းသင်တန်း မလိုအပ်တော့ဘဲ website ကို static၊ မြန်ဆန်ပြီး hosting ကုန်ကျစရိတ် အလွန်နည်းစေခဲ့ပါသည်။' },
          { title: 'အစကတည်းက နှစ်ဘာသာ ဒီဇိုင်း', detail: 'စာသားအားလုံးကို component များထဲတွင် မထားဘဲ ဘာသာစကားအလိုက် dictionary များတွင် စုစည်းထားသဖြင့် မြန်မာနှင့် အင်္ဂလိပ် အကြောင်းအရာ အမြဲကိုက်ညီနေပြီး page ကို reload မလုပ်ဘဲ ဘာသာပြောင်းနိုင်ပါသည်။' },
          { title: 'Mobile-first layout', detail: 'ဧည့်သည်အများစုသည် ဖုန်းဖြင့် ဝင်ရောက်ကြသဖြင့် menu၊ ဖုန်းခေါ်ရန်နှင့် delivery ခလုတ်များကို လက်မဖြင့် နှိပ်ရလွယ်ကူစေရန် ဦးစွာ ဒီဇိုင်းဆွဲပြီးမှ desktop အတွက် ချဲ့ထွင်ခဲ့ပါသည်။' },
        ],
        results: [
          'maydarwedumpling.com တွင် production အဖြစ် လည်ပတ်နေပါသည်။',
          'လက်တွေ့ client project တစ်ခု၏ scope ကို သတ်မှတ်တတ်ရန် သင်ယူခဲ့ပါသည် — တည်ဆောက်နိုင်သမျှ အားလုံးမဟုတ်ဘဲ လုပ်ငန်းအတွက် ယခုလိုအပ်သည့်အရာ (menu၊ ဇာတ်လမ်း၊ မှာယူမှု) ကို ဦးစားပေး ပေးပို့ခြင်း ဖြစ်ပါသည်။',
        ],
      },
      jp: {
        kind: 'クライアントサイト · 飲食店 · ヤンゴン',
        summary: 'ヤンゴンの手作り餃子店のためのバイリンガル・ブランドサイト。地元のお客様がメニューを見て、数タップで注文できるよう設計しました。',
        liveLabel: 'サイトを見る',
        problem: [
          '店舗には自社のウェブサイトがなく、お客様はデリバリーアプリや口コミで店を知るだけで、メニュー全体や料理の背景を一か所で確認できる場所がありませんでした。',
          'お客様の多くはミャンマー語を第一言語としますが、英語を必要とする来訪者や観光客もいるため、両言語で同じように使えるサイトが求められました。',
        ],
        role: [
          '唯一のデザイナー兼開発者として、情報設計・ビジュアルデザインから実装・デプロイまでを担当。',
          'オーナーと直接やり取りし、メニュー・写真・ブランドストーリーをコンテンツページに落とし込みました。',
        ],
        decisions: [
          { title: 'チェックアウトを自作せず、既存の注文チャネルへ誘導', detail: 'お客様はすでに電話・Grab・foodpandaで注文しています。これらへ直接リンクすることで、決済や注文データの管理、スタッフの再教育が不要になり、サイトを静的・高速・ほぼ無料で運用できるようにしました。' },
          { title: '最初からバイリンガル設計', detail: 'すべての文言をコンポーネントではなく言語別の辞書で管理し、ミャンマー語と英語の内容を常に同期。ページを再読み込みせずに言語を切り替えられます。' },
          { title: 'モバイルファーストのレイアウト', detail: '訪問者の大半はスマートフォンからのため、メニュー・電話・デリバリーボタンを親指で押しやすい配置で設計し、その後デスクトップ向けに拡張しました。' },
        ],
        results: [
          'maydarwedumpling.com で本番稼働中。',
          '実際のクライアント案件のスコープ設定を学びました。作れるものすべてではなく、今ビジネスに必要なもの(メニュー・ストーリー・注文導線)を確実に届けることです。',
        ],
      },
    },
  },

  // ── Sein Pan ────────────────────────────────────────────────────────────────
  {
    slug: 'sein-pan',
    name: 'Sein Pan Electronic Shop',
    localName: 'ကိုဝင်းနိုင် စိန်ပန်း အီလက်ထရွန်းနစ်',
    liveUrl: 'https://www.seinpanelectronic.com',
    thumb: 'projects/sein-pan-electronic.webp',
    stack: ['React', 'Vite', 'Tailwind CSS', 'i18n', 'Lucide'],
    architecture: ['Visitor', 'Static React SPA (Vite)', 'Service catalogue · MM / EN', 'Click-to-call quote'],
    copy: {
      en: {
        kind: 'Client website · Electronics repair · since 1989',
        summary: 'A website for a family electronics-repair shop that has served Yangon since 1989 — built to turn visitors into repair calls.',
        liveLabel: 'Visit live site',
        problem: [
          'A trusted, decades-old repair business with no website: new customers had no way to check which services it offered or how to get a quote.',
          'The business runs on phone calls, so the site’s main job was to get people to call.',
        ],
        role: ['Sole designer and developer — design, build, bilingual content and deployment.'],
        decisions: [
          { title: 'One clear call to action', detail: 'Every service section ends in a click-to-call button rather than a contact form, matching how the shop actually takes work and removing a step for the customer.' },
          { title: 'A retro-TV hero that tells the story', detail: 'The hero nods to the shop’s roots in TV repair since 1989, giving a family business a memorable identity without stock imagery.' },
          { title: 'Light and dark themes', detail: 'Theme colours are design tokens, so both modes share one set of components and stay readable outdoors on phones.' },
        ],
        results: [
          'Live in production at seinpanelectronic.com.',
          'Learned to design around a single business goal — getting a call — and to cut anything that did not serve it.',
        ],
      },
      mm: {
        kind: 'Client website · အီလက်ထရွန်းနစ် ပြုပြင်ရေး · ၁၉၈၉ ခုနှစ်မှစ၍',
        summary: '၁၉၈၉ ခုနှစ်ကတည်းက ရန်ကုန်တွင် ဝန်ဆောင်မှုပေးလာသော မိသားစုပိုင် အီလက်ထရွန်းနစ် ပြုပြင်ရေးဆိုင်အတွက် website ဖြစ်ပြီး ဧည့်သည်များကို ပြုပြင်ရန် ဖုန်းဆက်သွယ်မှုများအဖြစ် ပြောင်းလဲပေးရန် ရည်ရွယ်ပါသည်။',
        liveLabel: 'Website ကြည့်ရန်',
        problem: [
          'ဆယ်စုနှစ်များစွာ ယုံကြည်မှုရရှိထားသော ပြုပြင်ရေးဆိုင်ဖြစ်သော်လည်း website မရှိသဖြင့် ဖောက်သည်အသစ်များအနေဖြင့် မည်သည့်ဝန်ဆောင်မှုများ ရှိသည်၊ ဈေးနှုန်းမည်သို့ မေးမြန်းရမည်ကို စစ်ဆေးနိုင်ခြင်း မရှိခဲ့ပါ။',
          'လုပ်ငန်းသည် ဖုန်းခေါ်ဆိုမှုအပေါ် အဓိကမူတည်သဖြင့် website ၏ အဓိကတာဝန်မှာ ဖောက်သည်များ ဖုန်းဆက်လာစေရန် ဖြစ်ပါသည်။',
        ],
        role: ['Design၊ တည်ဆောက်ခြင်း၊ နှစ်ဘာသာ content နှင့် deploy လုပ်ခြင်းအားလုံးကို တစ်ဦးတည်းသော designer နှင့် developer အဖြစ် တာဝန်ယူခဲ့ပါသည်။'],
        decisions: [
          { title: 'Call to action တစ်ခုတည်းကို ဦးစားပေးခြင်း', detail: 'ဝန်ဆောင်မှုအပိုင်းတိုင်း၏ အဆုံးတွင် contact form အစား နှိပ်ရုံဖြင့် ဖုန်းခေါ်နိုင်သော ခလုတ်ကို ထားရှိခဲ့သည်။ ဆိုင်၏ လက်တွေ့ အလုပ်လက်ခံပုံနှင့် ကိုက်ညီစေပြီး ဖောက်သည်အတွက် အဆင့်တစ်ဆင့် လျှော့ချပေးပါသည်။' },
          { title: 'ဇာတ်လမ်းပြောပြသော Retro-TV hero', detail: '၁၉၈၉ ခုနှစ် တီဗီပြုပြင်ရေးမှ စတင်ခဲ့သော ဆိုင်၏ အရင်းအမြစ်ကို ဖော်ပြထားပြီး stock ဓာတ်ပုံများကို အားမကိုးဘဲ မိသားစုလုပ်ငန်းတစ်ခုအတွက် မှတ်မိလွယ်သော identity ကို ဖန်တီးပေးခဲ့ပါသည်။' },
          { title: 'Light နှင့် dark theme', detail: 'Theme အရောင်များကို design token များအဖြစ် သတ်မှတ်ထားသဖြင့် mode နှစ်မျိုးလုံးသည် component တစ်စုတည်းကို မျှဝေသုံးစွဲပြီး ပြင်ပနေရောင်အောက်တွင်ပင် ဖုန်းပေါ်တွင် ဖတ်ရလွယ်ကူပါသည်။' },
        ],
        results: [
          'seinpanelectronic.com တွင် production အဖြစ် လည်ပတ်နေပါသည်။',
          '"ဖုန်းဆက်လာစေရေး" ဟူသော လုပ်ငန်းရည်မှန်းချက်တစ်ခုတည်းကို ဗဟိုပြု ဒီဇိုင်းဆွဲပြီး ထိုရည်မှန်းချက်ကို အထောက်အကူမပြုသည့်အရာများကို ဖယ်ရှားတတ်ရန် သင်ယူခဲ့ပါသည်။',
        ],
      },
      jp: {
        kind: 'クライアントサイト · 電子機器修理 · 1989年創業',
        summary: '1989年からヤンゴンで営業する家族経営の電子機器修理店のウェブサイト。訪問者を修理の電話依頼につなげることを目的に構築しました。',
        liveLabel: 'サイトを見る',
        problem: [
          '数十年の信頼を持つ修理店でありながらウェブサイトがなく、新規のお客様は提供サービスや見積もり方法を確認する手段がありませんでした。',
          '店の業務は電話中心のため、サイトの最大の役割は「電話をかけてもらうこと」でした。',
        ],
        role: ['唯一のデザイナー兼開発者として、デザイン・実装・バイリンガルコンテンツ・デプロイを担当。'],
        decisions: [
          { title: '行動喚起を一つに絞る', detail: '各サービス欄の最後に、問い合わせフォームではなくワンタップ発信ボタンを配置。店の実際の受注方法に合わせ、お客様の手間を一つ減らしました。' },
          { title: '物語を語るレトロTVのヒーロー', detail: '1989年のテレビ修理から始まった店のルーツを表現し、ストック画像に頼らず家族経営の店に印象的なアイデンティティを与えました。' },
          { title: 'ライト/ダークテーマ', detail: 'テーマカラーをデザイントークンとして定義し、両モードで同じコンポーネントを共有。屋外のスマートフォンでも読みやすさを保ちます。' },
        ],
        results: [
          'seinpanelectronic.com で本番稼働中。',
          '「電話をもらう」という一つのビジネス目標を軸に設計し、それに貢献しない要素を削ぎ落とすことを学びました。',
        ],
      },
    },
  },

  // ── Bean Boutique ───────────────────────────────────────────────────────────
  {
    slug: 'bean-boutique',
    name: 'Bean Boutique Coffee Shop',
    liveUrl: 'https://johnathanmt.github.io/bean-boutique-coffee-shop/',
    thumb: 'projects/bean-boutique-coffee.webp',
    stack: ['React 18', 'Vite', 'React Router', 'Tailwind CSS', 'Framer Motion', 'react-hot-toast', 'GitHub Actions'],
    architecture: ['Visitor', 'React SPA (Vite) · React Router', 'Cart Context ↔ localStorage', 'GitHub Actions → GitHub Pages'],
    copy: {
      en: {
        kind: 'Front-end project · E-commerce concept · Coffee shop',
        summary: 'A Caribbean-themed coffee shop storefront that began as a static web-design assignment and was rebuilt as a modern React single-page app with a working, persistent cart.',
        liveLabel: 'Visit live site',
        problem: [
          'The original site was a web-design course assignment: separate HTML pages and a hand-written cart script. It looked the part, but every page duplicated its navigation and layout, and the cart logic depended on a single shared script.',
          'The goal of the rebuild was to turn that coursework into a storefront that behaves like a real product — fast, consistent and responsive to every click.',
        ],
        role: ['Sole designer and developer — visual identity, the React rebuild, content and the automated deployment.'],
        decisions: [
          { title: 'Rebuild in React rather than patch the static pages', detail: 'Six HTML pages with copied navigation became one single-page app with shared components (Navbar, Footer, CoffeeCard, story modal). A change now happens in one place, and moving between pages is instant.' },
          { title: 'A cart that survives reloads', detail: 'Cart state lives in a React Context mirrored to localStorage, so items and quantities persist across pages and visits without needing a back end.' },
          { title: 'Content as data', detail: 'Coffees, brewing gear, events and offers are plain data files rendered by reusable components, so adding a product means adding one entry — no new markup.' },
          { title: 'Every button answers', detail: 'Add-to-cart toasts, origin-story modals, subscription confirmations and a newsletter discount give every interaction clear feedback.' },
        ],
        results: [
          'Live on GitHub Pages, deployed automatically by GitHub Actions on every push to main.',
          'The original static version is kept in the repository as legacy/, documenting the progression from HTML/CSS/JavaScript to a component-based React architecture.',
          'Learned how much maintainability comes from components, a single source of state and data-driven content.',
        ],
      },
      mm: {
        kind: 'Front-end project · E-commerce concept · ကော်ဖီဆိုင်',
        summary: 'Caribbean ပုံစံ ကော်ဖီဆိုင် online store ဖြစ်ပြီး static web-design assignment တစ်ခုအဖြစ် စတင်ခဲ့ကာ ဒေတာမပျောက်သော shopping cart ပါဝင်သည့် ခေတ်မီ React single-page app အဖြစ် ပြန်လည်တည်ဆောက်ခဲ့ပါသည်။',
        liveLabel: 'Website ကြည့်ရန်',
        problem: [
          'မူလ website သည် web-design သင်တန်း assignment ဖြစ်ပြီး သီးခြား HTML စာမျက်နှာများနှင့် ကိုယ်တိုင်ရေးထားသော cart script တို့ဖြင့် ဖွဲ့စည်းထားပါသည်။ ကြည့်ကောင်းသော်လည်း စာမျက်နှာတိုင်းတွင် navigation နှင့် layout ထပ်နေပြီး cart logic သည် script တစ်ခုတည်းအပေါ် မူတည်နေခဲ့ပါသည်။',
          'ပြန်လည်တည်ဆောက်ရခြင်း၏ ရည်ရွယ်ချက်မှာ ထို coursework ကို လက်တွေ့ product တစ်ခုကဲ့သို့ လုပ်ဆောင်နိုင်သော store အဖြစ် မြှင့်တင်ရန် ဖြစ်ပါသည် — မြန်ဆန်၊ တသမတ်တည်းရှိကာ နှိပ်လိုက်တိုင်း တုံ့ပြန်မှုရှိရန် ဖြစ်ပါသည်။',
        ],
        role: ['Visual identity၊ React ဖြင့် ပြန်လည်တည်ဆောက်ခြင်း၊ content နှင့် အလိုအလျောက် deploy လုပ်ခြင်းအားလုံးကို တစ်ဦးတည်းသော designer နှင့် developer အဖြစ် တာဝန်ယူခဲ့ပါသည်။'],
        decisions: [
          { title: 'Static စာမျက်နှာများကို ပြင်ဆင်မည့်အစား React ဖြင့် ပြန်လည်တည်ဆောက်ခြင်း', detail: 'Navigation ကူးထားသော HTML စာမျက်နှာ ခြောက်ခုကို shared component များ (Navbar၊ Footer၊ CoffeeCard၊ story modal) ပါဝင်သည့် single-page app တစ်ခုတည်းအဖြစ် ပေါင်းစည်းခဲ့သည်။ ပြင်ဆင်မှုတစ်ခုကို နေရာတစ်ခုတည်းတွင်သာ လုပ်ရပြီး စာမျက်နှာကူးပြောင်းမှုလည်း ချက်ချင်းဖြစ်ပါသည်။' },
          { title: 'Reload လုပ်လည်း မပျောက်သော cart', detail: 'Cart state ကို React Context ဖြင့် စီမံပြီး localStorage နှင့် ချိတ်ဆက်ထားသဖြင့် backend မလိုဘဲ စာမျက်နှာများကြားနှင့် နောက်တစ်ကြိမ် ပြန်လာသည့်အခါတွင်ပင် ပစ္စည်းနှင့် အရေအတွက်များ ကျန်ရှိနေပါသည်။' },
          { title: 'Content ကို data အဖြစ် စီမံခြင်း', detail: 'ကော်ဖီ၊ ဖျော်စက်ပစ္စည်း၊ event နှင့် offer များကို data file များအဖြစ် ထားရှိပြီး ပြန်လည်အသုံးပြုနိုင်သော component များဖြင့် ပြသသဖြင့် ပစ္စည်းအသစ်ထည့်ရန် entry တစ်ခု ထည့်ရုံသာ လိုပါသည်။' },
          { title: 'ခလုတ်တိုင်း တုံ့ပြန်မှုရှိခြင်း', detail: 'Cart ထဲထည့်ကြောင်း toast အသိပေးချက်၊ မူလဒေသ ဇာတ်လမ်း modal၊ subscription အတည်ပြုချက်နှင့် newsletter လျှော့ဈေးတို့ဖြင့် လုပ်ဆောင်ချက်တိုင်းတွင် ရှင်းလင်းသော feedback ပေးပါသည်။' },
        ],
        results: [
          'GitHub Pages တွင် လည်ပတ်နေပြီး main branch သို့ push လုပ်တိုင်း GitHub Actions ဖြင့် အလိုအလျောက် deploy ဖြစ်ပါသည်။',
          'မူလ static version ကို repository အတွင်း legacy/ အဖြစ် ထိန်းသိမ်းထားပြီး HTML/CSS/JavaScript မှ component-based React architecture သို့ တိုးတက်လာပုံကို မှတ်တမ်းတင်ထားပါသည်။',
          'Component များ၊ state ကို တစ်နေရာတည်းတွင် စီမံခြင်းနှင့် data-driven content တို့က maintainability ကို မည်မျှ မြှင့်တင်ပေးသည်ကို သင်ယူခဲ့ပါသည်။',
        ],
      },
      jp: {
        kind: 'フロントエンド · ECコンセプト · コーヒーショップ',
        summary: 'カリブ海をテーマにしたコーヒーショップのオンラインストア。静的なWebデザインの課題として始まり、永続化されたカートを備えたモダンなReactシングルページアプリへと再構築しました。',
        liveLabel: 'サイトを見る',
        problem: [
          '元のサイトはWebデザイン講座の課題で、個別のHTMLページと手書きのカートスクリプトで構成されていました。見た目は整っていたものの、各ページでナビゲーションやレイアウトが重複し、カート処理も一つの共有スクリプトに依存していました。',
          '再構築の目的は、この課題作品を実際のプロダクトのように振る舞うストアへと進化させること — 高速で一貫性があり、あらゆる操作に反応するサイトです。',
        ],
        role: ['唯一のデザイナー兼開発者として、ビジュアルアイデンティティ、Reactへの再構築、コンテンツ、自動デプロイを担当。'],
        decisions: [
          { title: '静的ページの修正ではなくReactで再構築', detail: 'ナビゲーションを複製した6つのHTMLページを、共通コンポーネント(Navbar、Footer、CoffeeCard、ストーリーモーダル)を持つ一つのシングルページアプリに統合。変更は一か所で済み、ページ遷移も瞬時になりました。' },
          { title: 'リロードしても消えないカート', detail: 'カートの状態をReact Contextで管理し、localStorageと同期。バックエンドなしで、ページをまたいでも再訪問しても商品と数量が保持されます。' },
          { title: 'コンテンツをデータとして管理', detail: 'コーヒー、抽出器具、イベント、キャンペーンをデータファイルとして持ち、再利用可能なコンポーネントで描画。商品の追加はデータを一件足すだけで、新たなマークアップは不要です。' },
          { title: 'すべてのボタンに応答を', detail: 'カート追加のトースト通知、産地ストーリーのモーダル、購読確認、ニュースレター割引など、あらゆる操作に明確なフィードバックを返します。' },
        ],
        results: [
          'GitHub Pagesで公開中。mainブランチへのプッシュごとにGitHub Actionsで自動デプロイされます。',
          '元の静的版をリポジトリ内の legacy/ に残し、HTML/CSS/JavaScriptからコンポーネント指向のReact設計への成長過程を記録しています。',
          'コンポーネント化、状態の一元管理、データ駆動のコンテンツが保守性をどれほど高めるかを学びました。',
        ],
      },
    },
  },

  // ── The Mysterious Odyssey (myothantnaing.com) ──────────────────────────────
  {
    slug: 'mysterious-odyssey',
    name: 'The Mysterious Odyssey of Ko Myo Thant',
    liveUrl: 'https://myothantnaing.com',
    thumb: 'projects/myothantnaing-official.webp',
    stack: ['Next.js 16', 'React 19', 'TypeScript', 'React Three Fiber', 'Motion', 'Tailwind CSS 4', 'Cloudinary', 'Vercel'],
    architecture: ['Visitor', 'Next.js 16 App Router (Server Components)', 'Book engine · React Three Fiber scenes', 'Cloudinary image delivery', 'Vercel'],
    copy: {
      en: {
        kind: 'Personal brand site · Interactive storytelling',
        summary: 'My official website, myothantnaing.com — a life told in photographs across four chapters (Adventure, Art, Tech and Fortune), presented as an interactive book you open by breaking its seal.',
        liveLabel: 'Open the book',
        problem: [
          'A conventional scrolling portfolio could not carry a personal story told mainly through photography. I wanted a site that feels like opening a book — without sacrificing speed, accessibility or stability on phones.',
          'The home page already runs two WebGL scenes, and GPU memory pressure was crashing mobile browser tabs, so every new effect had to justify its cost.',
        ],
        role: ['Concept, art direction, engineering and deployment — designed and built end to end.'],
        decisions: [
          { title: 'A paper-folding page engine', detail: 'Pages fold like real paper rather than rotating as rigid boards: the fold line is computed from the lifted corner, and each frame updates only one transform and one clip-path. Pages stay live React elements, so links, video reels and 3D scenes keep working mid-turn and are never re-mounted.' },
          { title: 'CSS 3D for the intro, not a third WebGL canvas', detail: 'The opening book is six flat planes animated with CSS 3D transforms and Motion. It runs on the compositor at 60 fps, needs no model download and keeps type sharp at any zoom — while sparing GPU memory for the hero scenes.' },
          { title: 'A guard for every WebGL canvas', detail: 'Off-screen canvases stop rendering, and a lost WebGL context falls back to a flat image instead of crash-looping the tab.' },
          { title: 'Media from one control room', detail: 'Every image, video and 3D model is referenced from a single media registry backed by a Cloudinary loader, so moving an asset is a one-line change and Cloudinary handles resizing and format negotiation.' },
          { title: 'Bilingual, and private by design', detail: 'English and Burmese are applied before first paint, so the page never flashes the wrong language. AI crawlers are asked to stay out in robots.txt and refused at the edge by a proxy, while search engines remain welcome.' },
        ],
        results: [
          'Live at myothantnaing.com, deployed on Vercel.',
          'Hands-on experience with the Next.js App Router, Server Components, React Three Fiber and GPU-memory limits on mobile devices.',
          'Learned to treat performance and stability as design requirements, not afterthoughts.',
        ],
      },
      mm: {
        kind: 'Personal brand website · Interactive storytelling',
        summary: 'ကျွန်တော်၏ တရားဝင် website myothantnaing.com ဖြစ်ပြီး စွန့်စားခန်း၊ အနုပညာ၊ နည်းပညာနှင့် ကံကြမ္မာ ဟူသော အခန်းလေးခန်းဖြင့် ဘဝကို ဓာတ်ပုံများဖြင့် ပြောပြထားကာ တံဆိပ်ကို ဖွင့်ဖောက်၍ ဖတ်ရသော interactive စာအုပ်တစ်အုပ်အဖြစ် တင်ဆက်ထားပါသည်။',
        liveLabel: 'စာအုပ်ကို ဖွင့်ရန်',
        problem: [
          'သာမန် scroll လုပ်ရသော portfolio ပုံစံဖြင့် ဓာတ်ပုံများကို အဓိကထားသည့် ကိုယ်ပိုင်ဇာတ်လမ်းကို ပြည့်စုံစွာ မပြောပြနိုင်ပါ။ ဖုန်းပေါ်တွင် အမြန်နှုန်း၊ accessibility နှင့် တည်ငြိမ်မှုကို မထိခိုက်စေဘဲ စာအုပ်ဖွင့်ရသကဲ့သို့ ခံစားရသော website ကို ရည်မှန်းခဲ့ပါသည်။',
          'Home page တွင် WebGL scene နှစ်ခု လည်ပတ်နေပြီးဖြစ်ပြီး GPU memory ဖိအားကြောင့် mobile browser tab များ crash ဖြစ်နေသဖြင့် effect အသစ်တိုင်းသည် ၎င်း၏ ကုန်ကျစရိတ်နှင့် ထိုက်တန်ရန် လိုအပ်ပါသည်။',
        ],
        role: ['Concept၊ art direction၊ engineering နှင့် deploy လုပ်ခြင်းအထိ အစမှအဆုံး ဒီဇိုင်းဆွဲ တည်ဆောက်ခဲ့ပါသည်။'],
        decisions: [
          { title: 'စက္ကူကဲ့သို့ ခေါက်သော page engine', detail: 'စာမျက်နှာများကို မာကျောသော ပြားချပ်ကဲ့သို့ လှည့်မည့်အစား စက္ကူအစစ်ကဲ့သို့ ခေါက်ပါသည်။ မ,တင်လိုက်သော ထောင့်မှ ခေါက်ကြောင်းကို တွက်ချက်ပြီး frame တစ်ခုစီတွင် transform တစ်ခုနှင့် clip-path တစ်ခုသာ update လုပ်ပါသည်။ စာမျက်နှာများသည် React element အဖြစ် ဆက်လက်ရှင်သန်နေသဖြင့် လှန်နေစဉ်အတွင်းပင် link၊ video နှင့် 3D scene များ အလုပ်လုပ်နေပြီး re-mount မဖြစ်ပါ။' },
          { title: 'Intro ကို WebGL မဟုတ်ဘဲ CSS 3D ဖြင့်', detail: 'အဖွင့်စာအုပ်ကို ပြားချပ် plane ခြောက်ခုဖြင့် CSS 3D transform နှင့် Motion သုံး၍ animate လုပ်ထားသည်။ Compositor ပေါ်တွင် 60fps ဖြင့် လည်ပတ်ပြီး model download မလိုဘဲ မည်သည့် zoom တွင်မဆို စာလုံးများ ပြတ်သားကာ GPU memory ကို hero scene များအတွက် ချန်ထားပေးပါသည်။' },
          { title: 'WebGL canvas တိုင်းအတွက် အကာအကွယ်', detail: 'မျက်နှာပြင်အပြင်ဘက်ရောက်နေသော canvas များသည် render လုပ်ခြင်း ရပ်တန့်ပြီး WebGL context ပျောက်ဆုံးသွားပါကလည်း tab ကို crash loop မဖြစ်စေဘဲ ရိုးရှင်းသော ပုံသို့ ပြောင်းပေးပါသည်။' },
          { title: 'Media အားလုံးကို တစ်နေရာတည်းမှ စီမံခြင်း', detail: 'ဓာတ်ပုံ၊ video နှင့် 3D model အားလုံးကို media registry တစ်ခုတည်းမှ ရည်ညွှန်းပြီး Cloudinary loader ဖြင့် ပေးပို့သဖြင့် asset ရွှေ့ပြောင်းရန် တစ်ကြောင်းသာ ပြင်ရပြီး resize နှင့် format ရွေးချယ်မှုကို Cloudinary က ဆောင်ရွက်ပေးပါသည်။' },
          { title: 'နှစ်ဘာသာနှင့် privacy ကို ဦးစားပေးခြင်း', detail: 'အင်္ဂလိပ်နှင့် မြန်မာဘာသာကို ပထမဆုံး paint မတိုင်မီ သတ်မှတ်ပေးသဖြင့် ဘာသာစကား မှားယွင်းပြသမှု မဖြစ်ပါ။ AI crawler များကို robots.txt ဖြင့် ဝင်ရောက်ခွင့်မပြုကြောင်း အသိပေးပြီး လိုက်နာခြင်းမရှိသူများကို proxy ဖြင့် ပိတ်ဆို့ထားကာ search engine များကိုမူ ဆက်လက်ခွင့်ပြုထားပါသည်။' },
        ],
        results: [
          'myothantnaing.com အဖြစ် Vercel ပေါ်တွင် လည်ပတ်နေပါသည်။',
          'Next.js App Router၊ Server Components၊ React Three Fiber နှင့် mobile device များ၏ GPU memory ကန့်သတ်ချက်များနှင့် ပတ်သက်၍ လက်တွေ့အတွေ့အကြုံ ရရှိခဲ့ပါသည်။',
          'Performance နှင့် တည်ငြိမ်မှုကို နောက်မှစဉ်းစားမည့်အရာ မဟုတ်ဘဲ design လိုအပ်ချက်အဖြစ် သဘောထားတတ်ရန် သင်ယူခဲ့ပါသည်။',
        ],
      },
      jp: {
        kind: 'パーソナルブランドサイト · インタラクティブ・ストーリーテリング',
        summary: '公式サイト myothantnaing.com。冒険・アート・テック・運命の4章で人生を写真で綴り、封印を解いて開くインタラクティブな本として表現しました。',
        liveLabel: '本を開く',
        problem: [
          '一般的なスクロール型のポートフォリオでは、写真を中心とした個人の物語を伝えきれません。スマートフォンでの速度・アクセシビリティ・安定性を損なわずに、本を開くような体験を目指しました。',
          'ホームページではすでに2つのWebGLシーンが動いており、GPUメモリの逼迫によりモバイルブラウザのタブがクラッシュしていたため、新たな演出はすべてそのコストに見合う必要がありました。',
        ],
        role: ['コンセプト、アートディレクション、実装、デプロイまでを一貫して担当。'],
        decisions: [
          { title: '紙が折れるページエンジン', detail: 'ページを硬い板のように回転させるのではなく、本物の紙のように折り曲げます。持ち上げた角から折り線を算出し、1フレームごとにtransformとclip-pathを1つずつ更新するだけ。ページは生きたReact要素のままなので、めくっている最中もリンク・動画・3Dシーンが動作し、再マウントされません。' },
          { title: 'イントロはWebGLではなくCSS 3Dで', detail: 'オープニングの本は6枚の平面をCSS 3DトランスフォームとMotionでアニメーション。コンポジタ上で60fpsで動作し、モデルのダウンロードも不要で、どの倍率でも文字が鮮明です。GPUメモリはヒーローシーンのために温存しました。' },
          { title: 'すべてのWebGLキャンバスにガードを', detail: '画面外のキャンバスは描画を停止し、WebGLコンテキストが失われた場合もタブをクラッシュさせず、静的な画像表示に切り替えます。' },
          { title: 'メディアを一元管理', detail: '画像・動画・3Dモデルはすべて単一のメディアレジストリから参照し、Cloudinaryローダーで配信。アセットの移行は1行の変更で済み、リサイズやフォーマット選択はCloudinaryが担います。' },
          { title: 'バイリンガル、そしてプライバシー重視', detail: '英語とミャンマー語を初回描画前に適用し、言語のちらつきを防止。AIクローラーにはrobots.txtで拒否を伝え、従わないものはプロキシで遮断しつつ、検索エンジンは引き続き歓迎しています。' },
        ],
        results: [
          'myothantnaing.com としてVercelで公開中。',
          'Next.js App Router、Server Components、React Three Fiber、モバイル端末のGPUメモリ制約について実践的な経験を積みました。',
          'パフォーマンスと安定性を後回しにせず、設計要件として扱うことを学びました。',
        ],
      },
    },
  },

  // ── Vedin ───────────────────────────────────────────────────────────────────
  {
    slug: 'vedin',
    name: 'Vedin — Vedic Astrology Platform',
    liveUrl: 'https://vedin.myothant.dev',
    thumb: 'projects/vedin-site.webp',
    stack: ['React 19', 'TypeScript', 'TanStack Query', 'ASP.NET Core 8', 'EF Core · MySQL', 'Swiss Ephemeris', 'Google Gemini', 'QuestPDF', 'Docker'],
    architecture: ['React 19 SPA (Vite) · TanStack Query', 'ASP.NET Core 8 API · JWT', 'Swiss Ephemeris engine + chart cache', 'Gemini reading pipeline (5 steps)', 'MySQL · QuestPDF · Cloudinary'],
    copy: {
      en: {
        kind: 'Full-stack product · AI · .NET + React',
        summary: 'A professional sidereal (Jyotish) astrology platform: Lahiri-ayanamsa charts with divisional charts D1–D60, Vimshottari dasha timelines, Shadbala and Ashtakavarga — with AI-written readings in fluent Burmese, delivered as magazine-style PDF reports.',
        liveLabel: 'Visit Vedin',
        problem: [
          'Most astrology apps either do the maths but explain nothing, or wrap a chatbot around charts it never calculated. Vedin needed both: astronomically accurate charts, and readings that are readable, written in natural Burmese — and never contradict the chart.',
          'A single large AI prompt proved fragile: one failure discarded the whole reading, nothing checked the prose against the chart, and Burmese quality dropped because one prompt carried persona, structure, astrology and language standards at once.',
        ],
        role: ['Designed and built the whole product end to end: React front end, ASP.NET Core API, database, AI pipeline, PDF reports and the deployment on Vercel and Render.'],
        decisions: [
          { title: 'A multi-step AI pipeline instead of one giant prompt', detail: 'Readings are produced in five focused steps — chart analysis, seven life-area drafts, synthesis, Burmese language polish and a final grounding check. Completed steps are saved, so a retry resumes rather than restarts and the expensive drafts are paid for once.' },
          { title: 'A grounding gate for trust', detail: 'The final step receives both the finished reading and the engine-computed placements and, at temperature 0, corrects only statements that contradict the chart. It is best-effort by design: if it fails or returns a truncated result, the original reading is kept.' },
          { title: 'Background jobs for expensive AI calls', detail: 'Approved readings are queued and generated by a background worker, one at a time with up to three attempts, so AI usage stays predictable and a failure is recorded and recoverable rather than lost.' },
          { title: 'Charts as pure functions', detail: 'A chart depends only on birth data, so Swiss Ephemeris results are cached on the server and treated as long-lived on the client with TanStack Query — repeat views are instant.' },
          { title: 'A strict three-layer back end', detail: 'Controller → Service → Repository, with FluentValidation, a standard response envelope and a provider-abstracted chat model, so features stay consistent and the AI provider can be swapped without touching business logic.' },
        ],
        results: [
          'Live at vedin.myothant.dev — front end on Vercel, API in Docker on Render.',
          'Includes a research module that tests astrological claims against base rates with permutation tests, rather than taking them on faith.',
          'Extracted from this portfolio into its own front-end and back-end repositories as it grew into a standalone product.',
          'My deepest project to date: astronomical calculation, multi-step LLM orchestration, background processing and PDF generation in one system.',
        ],
      },
      mm: {
        kind: 'Full-stack product · AI · .NET + React',
        summary: 'ပရော်ဖက်ရှင်နယ် sidereal (ဇျောတိဿ) နက္ခတ်ဗေဒင် ပလက်ဖောင်း ဖြစ်ပါသည် — လာဟိရီ အယနံသ (Lahiri Ayanamsa) ဖြင့် တွက်ချက်ထားသော D1 မှ D60 အထိ ဇာတာခွဲများ၊ ဝိံရှောတ္တရီ (Vimshottari) ဒသာ အချိန်ဇယား၊ ဆဒ္ဒဗလ (Shadbala) နှင့် အဋ္ဌကဝဂ် (Ashtakavarga) တို့ကို တွက်ချက်ပေးပြီး AI ဖြင့် ချောမွေ့သော မြန်မာဘာသာဖြင့် ရေးသားထားသော ဟောစာတမ်းကို မဂ္ဂဇင်းပုံစံ PDF report အဖြစ် ပေးအပ်ပါသည်။',
        liveLabel: 'Vedin ကြည့်ရန်',
        problem: [
          'ဗေဒင် app အများစုသည် တွက်ချက်မှုသာ လုပ်ပြီး ရှင်းပြချက်မပေးခြင်း၊ သို့မဟုတ် ကိုယ်တိုင် မတွက်ချက်ထားသော ဇာတာပေါ်တွင် chatbot တစ်ခု အုပ်ထားရုံသာ ဖြစ်တတ်ပါသည်။ Vedin တွင် နှစ်မျိုးလုံး လိုအပ်ပါသည် — နက္ခတ္တဗေဒအရ တိကျသော ဇာတာနှင့် သဘာဝကျသော မြန်မာဘာသာဖြင့် ဖတ်ရလွယ်ကူပြီး ဇာတာနှင့် ဘယ်တော့မှ မဆန့်ကျင်သော ဟောစာတမ်း ဖြစ်ပါသည်။',
          'ကြီးမားသော AI prompt တစ်ခုတည်းသည် ပျက်စီးလွယ်ခဲ့ပါသည် — တစ်ကြိမ်မှားယွင်းပါက ဟောစာတမ်းတစ်ခုလုံး ဆုံးရှုံးသွားပြီး စာသားကို ဇာတာနှင့် တိုက်စစ်ပေးမည့်အရာ မရှိကာ persona၊ ဖွဲ့စည်းပုံ၊ ဗေဒင်ပညာနှင့် ဘာသာစကားစံနှုန်းအားလုံးကို prompt တစ်ခုတည်းတွင် ထည့်ထားသဖြင့် မြန်မာဘာသာ အရည်အသွေးလည်း ကျဆင်းခဲ့ပါသည်။',
        ],
        role: ['React front end၊ ASP.NET Core API၊ database၊ AI pipeline၊ PDF report များနှင့် Vercel၊ Render ပေါ်သို့ deploy လုပ်ခြင်းအထိ product တစ်ခုလုံးကို အစမှအဆုံး ဒီဇိုင်းဆွဲ တည်ဆောက်ခဲ့ပါသည်။'],
        decisions: [
          { title: 'ကြီးမားသော prompt တစ်ခုတည်းအစား အဆင့်များစွာပါ AI pipeline', detail: 'ဟောစာတမ်းကို အဆင့်ငါးဆင့်ဖြင့် ထုတ်လုပ်ပါသည် — ဇာတာခွဲခြမ်းစိတ်ဖြာခြင်း၊ ဘဝနယ်ပယ် ခုနစ်ခုအတွက် မူကြမ်း၊ ပေါင်းစည်းခြင်း၊ မြန်မာဘာသာ ချောမွေ့အောင် ပြုပြင်ခြင်းနှင့် နောက်ဆုံး grounding စစ်ဆေးခြင်း။ ပြီးဆုံးသွားသော အဆင့်များကို သိမ်းဆည်းထားသဖြင့် ပြန်လည်ကြိုးစားသည့်အခါ အစမှ မဟုတ်ဘဲ ရပ်ခဲ့သည့်နေရာမှ ဆက်လုပ်ပြီး ကုန်ကျစရိတ်များသော မူကြမ်းများအတွက် တစ်ကြိမ်သာ ကုန်ကျပါသည်။' },
          { title: 'ယုံကြည်မှုအတွက် grounding gate', detail: 'နောက်ဆုံးအဆင့်သည် ပြီးဆုံးသော ဟောစာတမ်းနှင့် engine မှ တွက်ချက်ထားသော ဂြိုဟ်တည်နေရာများ နှစ်ခုလုံးကို လက်ခံရရှိပြီး temperature 0 ဖြင့် ဇာတာနှင့် ဆန့်ကျင်သော ဖော်ပြချက်များကိုသာ ပြင်ဆင်ပါသည်။ မအောင်မြင်ပါက သို့မဟုတ် ရလဒ် ပြတ်တောက်နေပါက မူလဟောစာတမ်းကို ဆက်ထားရှိသည့် best-effort ဒီဇိုင်း ဖြစ်ပါသည်။' },
          { title: 'ကုန်ကျစရိတ်များသော AI လုပ်ငန်းများကို background job ဖြင့်', detail: 'အတည်ပြုပြီးသော ဟောစာတမ်းများကို queue ထဲထည့်ပြီး background worker က တစ်ကြိမ်လျှင် တစ်ခုစီ၊ အများဆုံး သုံးကြိမ်အထိ ကြိုးစား၍ ထုတ်လုပ်ပါသည်။ AI အသုံးပြုမှုကို ခန့်မှန်းနိုင်စေပြီး မအောင်မြင်မှုကို မှတ်တမ်းတင်ကာ ပြန်လည်ဆောင်ရွက်နိုင်ပါသည်။' },
          { title: 'ဇာတာကို pure function အဖြစ် သဘောထားခြင်း', detail: 'ဇာတာသည် မွေးဖွားချိန် အချက်အလက်ပေါ်တွင်သာ မူတည်သဖြင့် Swiss Ephemeris ရလဒ်များကို server တွင် cache လုပ်ထားပြီး client ဘက်တွင် TanStack Query ဖြင့် ကြာရှည်အသုံးပြုနိုင်သော data အဖြစ် စီမံထားသဖြင့် ပြန်ကြည့်သည့်အခါ ချက်ချင်းပေါ်ပါသည်။' },
          { title: 'တင်းကျပ်သော အလွှာသုံးလွှာ backend', detail: 'Controller → Service → Repository ဖွဲ့စည်းပုံကို FluentValidation၊ စံသတ်မှတ်ထားသော response ပုံစံနှင့် provider ကို abstract လုပ်ထားသော chat model တို့ဖြင့် ပေါင်းစပ်ထားသဖြင့် feature များ တသမတ်တည်းရှိပြီး business logic ကို မထိဘဲ AI provider ကို ပြောင်းလဲနိုင်ပါသည်။' },
        ],
        results: [
          'vedin.myothant.dev တွင် လည်ပတ်နေပါသည် — front end ကို Vercel တွင်၊ API ကို Render ပေါ်ရှိ Docker တွင် run ထားပါသည်။',
          'ဗေဒင်ဆိုင်ရာ ယူဆချက်များကို အလွယ်တကူ လက်မခံဘဲ base rate များနှင့် permutation test များဖြင့် စစ်ဆေးသော research module ပါဝင်ပါသည်။',
          'သီးခြား product တစ်ခုအဖြစ် ကြီးထွားလာသဖြင့် ဤ portfolio မှ ခွဲထုတ်ကာ ကိုယ်ပိုင် front-end နှင့် back-end repository များအဖြစ် ပြောင်းရွှေ့ခဲ့ပါသည်။',
          'နက္ခတ္တဗေဒ တွက်ချက်မှု၊ အဆင့်များစွာပါ LLM orchestration၊ background processing နှင့် PDF ထုတ်လုပ်ခြင်းတို့ကို system တစ်ခုတည်းတွင် ပေါင်းစပ်ထားသော ယနေ့အထိ အနက်ရှိုင်းဆုံး project ဖြစ်ပါသည်။',
        ],
      },
      jp: {
        kind: 'フルスタック · AI · .NET + React',
        summary: '本格的なサイデリアル(ジョーティシュ)占星術プラットフォーム。ラヒリ・アヤナムシャによる分割図D1〜D60、ヴィムショッタリ・ダシャーのタイムライン、シャドバラ、アシュタカヴァルガを算出し、AIが自然なミャンマー語で執筆した鑑定を雑誌風のPDFレポートとして提供します。',
        liveLabel: 'Vedinを見る',
        problem: [
          '多くの占星術アプリは、計算はしても何も説明しないか、計算していないチャートにチャットボットを被せただけです。Vedinには両方が必要でした — 天文学的に正確なチャートと、自然なミャンマー語で読みやすく、決してチャートと矛盾しない鑑定文です。',
          '一つの巨大なAIプロンプトは脆弱でした。一度の失敗で鑑定全体が失われ、文章をチャートと照合する仕組みもなく、人格・構成・占星術・言語基準を一つのプロンプトに詰め込んだためにミャンマー語の品質も低下していました。',
        ],
        role: ['Reactフロントエンド、ASP.NET Core API、データベース、AIパイプライン、PDFレポート、VercelとRenderへのデプロイまで、プロダクト全体を一人で設計・構築。'],
        decisions: [
          { title: '巨大な単一プロンプトではなく多段階のAIパイプライン', detail: '鑑定は5つの専門ステップで生成します — チャート分析、7つの人生領域の下書き、統合、ミャンマー語の推敲、最終の整合性チェック。完了したステップは保存されるため、再試行は最初からではなく途中から再開され、コストの高い下書きは一度で済みます。' },
          { title: '信頼性のための整合性ゲート', detail: '最終ステップは完成した鑑定文とエンジンが計算した惑星配置の両方を受け取り、温度0でチャートと矛盾する記述だけを修正します。失敗したり出力が途切れた場合は元の鑑定文を保持する、ベストエフォート設計です。' },
          { title: '高コストなAI処理はバックグラウンドジョブで', detail: '承認された鑑定はキューに入り、バックグラウンドワーカーが1件ずつ最大3回まで試行して生成します。AI利用量を予測可能に保ち、失敗は記録されて復旧可能になります。' },
          { title: 'チャートを純粋関数として扱う', detail: 'チャートは出生データのみで決まるため、Swiss Ephemerisの計算結果をサーバーでキャッシュし、クライアントではTanStack Queryで長期間有効なデータとして扱います。再表示は瞬時です。' },
          { title: '厳格な3層構造のバックエンド', detail: 'Controller → Service → Repository の構成に、FluentValidation、統一レスポンス形式、プロバイダを抽象化したチャットモデルを組み合わせ、機能の一貫性を保ちつつ、ビジネスロジックに触れずにAIプロバイダを切り替えられます。' },
        ],
        results: [
          'vedin.myothant.dev で公開中 — フロントエンドはVercel、APIはRender上のDockerで稼働。',
          '占星術の主張を鵜呑みにせず、ベースレートと並べ替え検定(permutation test)で検証するリサーチモジュールを搭載。',
          'プロダクトとして成長したため、このポートフォリオから独立したフロントエンド・バックエンドのリポジトリへ分離しました。',
          '天文計算、多段階のLLMオーケストレーション、バックグラウンド処理、PDF生成を一つのシステムに統合した、これまでで最も奥行きのあるプロジェクトです。',
        ],
      },
    },
  },

  // ── AI LINE Bot ─────────────────────────────────────────────────────────────
  {
    slug: 'ai-line-bot',
    name: 'Gemini AI LINE Bot',
    liveUrl: 'https://lin.ee/s72ayHD',
    thumb: 'projects/ai-line-bot.webp',
    stack: ['Python', 'Flask', 'Google Gemini', 'Gemini Vision', 'LINE Messaging API'],
    architecture: ['LINE user', 'LINE Messaging API', 'Flask webhook (Python)', 'Google Gemini · text & vision', 'Reply to LINE'],
    copy: {
      en: {
        kind: 'Personal project · Agentic AI · Chatbot',
        summary: 'A multilingual AI assistant on LINE that answers questions about me and my work, and can read images — built on Google Gemini and a Python backend.',
        liveLabel: 'Chat on LINE',
        problem: ['LINE is the messaging app people in Japan actually use. I wanted visitors and recruiters to be able to ask about my background in their own language, at any hour, without waiting for me to reply.'],
        role: ['Designed and built the whole system — webhook server, LLM integration, prompt design and deployment.'],
        decisions: [
          { title: 'A webhook server instead of a no-code bot builder', detail: 'A small Flask server receives LINE webhook events and calls Gemini directly, which keeps full control over prompts, languages and image handling.' },
          { title: 'Text and image input on one model family', detail: 'Using Gemini for chat and Gemini Vision for photos means one integration handles both kinds of message.' },
          { title: 'Honest by design', detail: 'The bot and the site both state clearly that it is an automated assistant, not me — so nobody mistakes an AI answer for a personal reply.' },
        ],
        results: [
          'Live on LINE and linked from this portfolio.',
          'Hands-on experience with webhooks, LLM APIs, multimodal input and prompt design — the groundwork for my agentic AI projects.',
        ],
      },
      mm: {
        kind: 'ကိုယ်ပိုင် project · Agentic AI · Chatbot',
        summary: 'ကျွန်တော်နှင့် ကျွန်တော့်အလုပ်အကြောင်း မေးခွန်းများကို ဖြေကြားပေးပြီး ဓာတ်ပုံများကိုလည်း ဖတ်ရှုနိုင်သော ဘာသာစကားစုံ AI assistant ကို LINE ပေါ်တွင် Google Gemini နှင့် Python backend ဖြင့် တည်ဆောက်ထားပါသည်။',
        liveLabel: 'LINE တွင် စကားပြောရန်',
        problem: ['ဂျပန်နိုင်ငံတွင် လူအများ အမှန်တကယ် အသုံးပြုသော messaging app မှာ LINE ဖြစ်ပါသည်။ ဧည့်သည်များနှင့် recruiter များအနေဖြင့် ကျွန်တော် ပြန်ဖြေသည်ကို စောင့်စရာမလိုဘဲ မိမိဘာသာစကားဖြင့် အချိန်မရွေး ကျွန်တော့်နောက်ခံအကြောင်း မေးမြန်းနိုင်စေလိုပါသည်။'],
        role: ['Webhook server၊ LLM ချိတ်ဆက်မှု၊ prompt design နှင့် deploy လုပ်ခြင်းအထိ system တစ်ခုလုံးကို ဒီဇိုင်းဆွဲ တည်ဆောက်ခဲ့ပါသည်။'],
        decisions: [
          { title: 'No-code bot builder အစား ကိုယ်ပိုင် webhook server', detail: 'Flask server ငယ်တစ်ခုက LINE webhook event များကို လက်ခံပြီး Gemini ကို တိုက်ရိုက်ခေါ်ယူသဖြင့် prompt၊ ဘာသာစကားနှင့် ဓာတ်ပုံ ကိုင်တွယ်ပုံကို အပြည့်အဝ ထိန်းချုပ်နိုင်ပါသည်။' },
          { title: 'စာသားနှင့် ဓာတ်ပုံကို model မိသားစုတစ်ခုတည်းဖြင့်', detail: 'စကားပြောရန် Gemini နှင့် ဓာတ်ပုံများအတွက် Gemini Vision ကို အသုံးပြုသဖြင့် ချိတ်ဆက်မှုတစ်ခုတည်းဖြင့် message နှစ်မျိုးလုံးကို ကိုင်တွယ်နိုင်ပါသည်။' },
          { title: 'ရိုးသားမှုကို ဒီဇိုင်းထဲ ထည့်သွင်းခြင်း', detail: 'Bot နှင့် website နှစ်ခုလုံးတွင် ၎င်းသည် ကျွန်တော်ကိုယ်တိုင် မဟုတ်ဘဲ အလိုအလျောက် assistant ဖြစ်ကြောင်း ရှင်းလင်းစွာ ဖော်ပြထားသဖြင့် AI အဖြေကို ကိုယ်တိုင်ပြန်ကြားချက်ဟု မည်သူမျှ အထင်မှားမည် မဟုတ်ပါ။' },
        ],
        results: [
          'LINE ပေါ်တွင် လည်ပတ်နေပြီး ဤ portfolio မှ ချိတ်ဆက်ထားပါသည်။',
          'Webhook၊ LLM API၊ multimodal input နှင့် prompt design တို့တွင် လက်တွေ့အတွေ့အကြုံ ရရှိခဲ့ပြီး နောက်ထပ် agentic AI project များအတွက် အခြေခံ ဖြစ်လာပါသည်။',
        ],
      },
      jp: {
        kind: '個人プロジェクト · エージェント型AI · チャットボット',
        summary: '私自身や仕事についての質問に答え、画像も読み取れる多言語AIアシスタントをLINE上に構築。Google GeminiとPythonバックエンドで動作します。',
        liveLabel: 'LINEで話す',
        problem: ['日本で実際に使われているメッセージアプリはLINEです。訪問者や採用担当者が、私の返信を待たずに、いつでも自分の言語で私の経歴について質問できるようにしたいと考えました。'],
        role: ['Webhookサーバー、LLM連携、プロンプト設計、デプロイまで、システム全体を設計・構築。'],
        decisions: [
          { title: 'ノーコードではなく自前のWebhookサーバー', detail: '小さなFlaskサーバーがLINEのWebhookイベントを受け取り、Geminiを直接呼び出します。プロンプト・言語・画像処理を完全に制御できます。' },
          { title: 'テキストと画像を同じモデルファミリーで', detail: '会話にはGemini、写真にはGemini Visionを使うことで、一つの連携で両方のメッセージに対応します。' },
          { title: '誠実さを設計に組み込む', detail: 'ボットとサイトの両方で、これは自動アシスタントであり本人ではないことを明示し、AIの回答が個人的な返信と誤解されないようにしています。' },
        ],
        results: [
          'LINE上で稼働中、このポートフォリオからリンクしています。',
          'Webhook、LLM API、マルチモーダル入力、プロンプト設計の実践経験を得ました — 今後のエージェント型AIプロジェクトの土台です。',
        ],
      },
    },
  },
]

export const caseStudyBySlug = (slug: string | undefined): CaseStudy | undefined =>
  CASE_STUDIES.find((c) => c.slug === slug)

/** The study's copy in `lang`, falling back to English for languages without a translation. */
export const caseCopy = (study: CaseStudy, lang: string): CaseCopy =>
  study.copy[lang as CaseLang] ?? study.copy.en
