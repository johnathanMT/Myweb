import { useEffect, useRef, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, ArrowLeft, Calendar, Utensils, Leaf, Cherry, Languages, Check, X } from 'lucide-react'
import { SITE } from '../config/site'

/**
 * FarewellRSVP — route /#/farewell.
 *
 * Upgrades:
 *  1. Smart branching — "Can you join the party?" Yes shows all fields; No hides
 *     dates + food (everyone can still plant a tree).
 *  2. 8-language i18n (EN/JA/MY/VI/ID/ZH/NE/MN) via the T dictionary below.
 *  3. Server assigns a ring coordinate around the main Sakura; we just hand off.
 *
 * On submit it POSTs to /api/farewell/rsvp, stashes the returned monument under
 * localStorage['mtn_pending_plant'], and redirects to /#/sanctuary for the
 * one-time planting animation.
 */
const API = `${SITE.apiUrl}/api/farewell/rsvp`
const PENDING_KEY = 'mtn_pending_plant'

// Stable per-browser id (server stores only its hash) → one monument per person.
function getOperatorId() {
  try {
    let id = localStorage.getItem('mtn_operator_id')
    if (!id) {
      id = crypto.randomUUID ? crypto.randomUUID() : `op-${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('mtn_operator_id', id)
    }
    return id
  } catch { return `op-${Date.now()}` }
}

// ───────────────────────── 8-language dictionary ─────────────────────────
const LANGS = [
  { code: 'en', label: 'EN' }, { code: 'ja', label: '日本語' }, { code: 'my', label: 'မြန်မာ' },
  { code: 'vi', label: 'VI' }, { code: 'id', label: 'ID' }, { code: 'zh', label: '中文' },
  { code: 'ne', label: 'नेपाली' }, { code: 'mn', label: 'MN' },
]

const T = {
  en: {
    title: 'Plant a Living Memory',
    subtitle: 'Before you go, leave your mark on our shared world. 🌱',
    joinQ: 'Can you join the farewell party?',
    joinYes: "Yes, I'll join", joinNo: "No, but I'll leave a memory",
    plant: 'Choose your plant', sakura: 'Friendship Sakura', sakuraSub: 'Cherry blossom — renewal & farewell',
    orchid: 'Bulbophyllum triste', orchidSub: 'A rare, quietly resilient orchid',
    name: 'Your name', namePh: 'e.g. Aiko Tanaka',
    dates: 'Dates available', datesPh: 'e.g. Jul 4, Jul 6 (evenings)',
    food: 'Food preference', foodPh: 'e.g. Vegetarian / No pork',
    message: 'Farewell message', messagePh: "A few words you'd like to leave behind…",
    submit: 'Plant & Enter the Sanctuary', submitting: 'Planting…',
    footer: 'One living monument per person · editable anytime',
    offline: "We couldn't reach the server, but your plant will still grow now and sync later.",
    skip: 'Skip to Sanctuary',
  },
  ja: {
    title: '思い出の木を植えよう',
    subtitle: '旅立つ前に、私たちの世界に印を残してください。🌱',
    joinQ: '送別会に参加できますか？',
    joinYes: 'はい、参加します', joinNo: 'いいえ、でも思い出を残します',
    plant: '植物を選ぶ', sakura: '友情の桜', sakuraSub: '桜 — 再生と別れ',
    orchid: 'バルボフィラム・トリステ', orchidSub: '希少で静かに力強い蘭',
    name: 'お名前', namePh: '例：田中 愛子',
    dates: '参加可能な日', datesPh: '例：7月4日、6日（夜）',
    food: '食べ物の希望', foodPh: '例：ベジタリアン／豚肉なし',
    message: '送別メッセージ', messagePh: '残したい一言を…',
    submit: '植えてサンクチュアリへ', submitting: '植えています…',
    footer: '一人につき一つの記念樹 · いつでも編集可能',
    offline: 'サーバーに接続できませんでしたが、木は今すぐ育ち、後で同期されます。',
    skip: 'サンクチュアリへスキップ',
  },
  my: {
    title: 'အမှတ်တရ သစ်ပင်စိုက်ပါ',
    subtitle: 'မထွက်ခွာမီ ကျွန်ုပ်တို့၏ ကမ္ဘာတွင် အမှတ်အသားတစ်ခု ချန်ထားခဲ့ပါ။ 🌱',
    joinQ: 'နှုတ်ဆက်ပွဲသို့ တက်ရောက်နိုင်ပါသလား?',
    joinYes: 'ဟုတ်ကဲ့၊ တက်ရောက်ပါမည်', joinNo: 'မတက်နိုင်ပါ၊ ဒါပေမယ့် အမှတ်တရ ချန်ထားမည်',
    plant: 'သင့်အပင်ကို ရွေးပါ', sakura: 'ခင်မင်ရင်းနှီးမှု ဆာကူရာ', sakuraSub: 'ချယ်ရီပန်း — အသစ်ပြန်လည်ခြင်းနှင့် နှုတ်ဆက်ခြင်း',
    orchid: 'ဘာလ်ဘိုဖီလမ် ထရစ်စတဲ', orchidSub: 'ရှားပါးပြီး တည်ငြိမ်ခိုင်မာသော သစ်ခွ',
    name: 'သင့်အမည်', namePh: 'ဥပမာ - အိကို တာနာကာ',
    dates: 'အားလပ်သည့်ရက်များ', datesPh: 'ဥပမာ - ဇူလိုင် ၄၊ ၆ (ညနေ)',
    food: 'အစားအစာ ရွေးချယ်မှု', foodPh: 'ဥပမာ - သက်သတ်လွတ် / ဝက်သားမပါ',
    message: 'နှုတ်ဆက်စကား', messagePh: 'ချန်ထားလိုသော စကားအနည်းငယ်…',
    submit: 'စိုက်ပျိုးပြီး Sanctuary သို့ဝင်ပါ', submitting: 'စိုက်ပျိုးနေသည်…',
    footer: 'တစ်ဦးလျှင် အမှတ်တရ တစ်ခု · အချိန်မရွေး ပြင်ဆင်နိုင်သည်',
    offline: 'ဆာဗာသို့ မချိတ်ဆက်နိုင်သော်လည်း သင့်အပင် ယခု ကြီးထွားမည်ဖြစ်ပြီး နောက်မှ ထပ်တူပြုပါမည်။',
    skip: 'Sanctuary သို့ ကျော်သွားရန်',
  },
  vi: {
    title: 'Trồng một kỷ niệm sống',
    subtitle: 'Trước khi rời đi, hãy để lại dấu ấn của bạn trong thế giới chung của chúng ta. 🌱',
    joinQ: 'Bạn có thể tham gia tiệc chia tay không?',
    joinYes: 'Có, tôi sẽ tham gia', joinNo: 'Không, nhưng tôi sẽ để lại kỷ niệm',
    plant: 'Chọn cây của bạn', sakura: 'Hoa anh đào tình bạn', sakuraSub: 'Hoa anh đào — đổi mới & chia tay',
    orchid: 'Lan Bulbophyllum triste', orchidSub: 'Một loài lan quý hiếm, lặng lẽ kiên cường',
    name: 'Tên của bạn', namePh: 'ví dụ: Aiko Tanaka',
    dates: 'Ngày có thể tham gia', datesPh: 'ví dụ: 4/7, 6/7 (buổi tối)',
    food: 'Sở thích ăn uống', foodPh: 'ví dụ: Ăn chay / Không thịt heo',
    message: 'Lời chia tay', messagePh: 'Vài lời bạn muốn để lại…',
    submit: 'Trồng cây & Vào Thánh địa', submitting: 'Đang trồng…',
    footer: 'Mỗi người một đài tưởng niệm · có thể chỉnh sửa bất cứ lúc nào',
    offline: 'Chúng tôi không thể kết nối máy chủ, nhưng cây của bạn vẫn sẽ mọc ngay và đồng bộ sau.',
    skip: 'Bỏ qua đến Thánh địa',
  },
  id: {
    title: 'Tanam Kenangan Hidup',
    subtitle: 'Sebelum pergi, tinggalkan jejakmu di dunia bersama kita. 🌱',
    joinQ: 'Bisakah kamu hadir di pesta perpisahan?',
    joinYes: 'Ya, saya hadir', joinNo: 'Tidak, tapi saya tinggalkan kenangan',
    plant: 'Pilih tanamanmu', sakura: 'Sakura Persahabatan', sakuraSub: 'Bunga sakura — pembaruan & perpisahan',
    orchid: 'Bulbophyllum triste', orchidSub: 'Anggrek langka yang diam-diam tangguh',
    name: 'Namamu', namePh: 'mis. Aiko Tanaka',
    dates: 'Tanggal tersedia', datesPh: 'mis. 4 Jul, 6 Jul (malam)',
    food: 'Preferensi makanan', foodPh: 'mis. Vegetarian / Tanpa babi',
    message: 'Pesan perpisahan', messagePh: 'Beberapa kata yang ingin kamu tinggalkan…',
    submit: 'Tanam & Masuki Sanctuary', submitting: 'Menanam…',
    footer: 'Satu monumen hidup per orang · bisa diedit kapan saja',
    offline: 'Kami tidak dapat menghubungi server, tetapi tanamanmu tetap akan tumbuh sekarang dan disinkronkan nanti.',
    skip: 'Lewati ke Sanctuary',
  },
  zh: {
    title: '种下一段活的回忆',
    subtitle: '在离开之前，在我们共同的世界留下你的印记。🌱',
    joinQ: '你能参加欢送会吗？',
    joinYes: '可以，我会参加', joinNo: '不能，但我要留下回忆',
    plant: '选择你的植物', sakura: '友谊樱花', sakuraSub: '樱花 — 新生与告别',
    orchid: '丝足兰 (Bulbophyllum triste)', orchidSub: '一种稀有而坚韧的兰花',
    name: '你的名字', namePh: '例如：田中爱子',
    dates: '可参加的日期', datesPh: '例如：7月4日、6日（晚上）',
    food: '饮食偏好', foodPh: '例如：素食 / 不吃猪肉',
    message: '告别留言', messagePh: '想留下的几句话…',
    submit: '种植并进入圣所', submitting: '种植中…',
    footer: '每人一座活的纪念碑 · 随时可编辑',
    offline: '无法连接服务器，但你的植物现在仍会生长，稍后同步。',
    skip: '跳转到圣所',
  },
  ne: {
    title: 'जीवित सम्झना रोप्नुहोस्',
    subtitle: 'जानु अघि, हाम्रो साझा संसारमा आफ्नो छाप छोड्नुहोस्। 🌱',
    joinQ: 'के तपाईं विदाई पार्टीमा सहभागी हुन सक्नुहुन्छ?',
    joinYes: 'हो, म सहभागी हुन्छु', joinNo: 'होइन, तर म सम्झना छोड्छु',
    plant: 'आफ्नो बिरुवा छान्नुहोस्', sakura: 'मित्रता साकुरा', sakuraSub: 'चेरी फूल — नवीकरण र विदाई',
    orchid: 'बल्बोफिलम ट्रिस्टे', orchidSub: 'एक दुर्लभ, शान्त रूपमा बलियो अर्किड',
    name: 'तपाईंको नाम', namePh: 'जस्तै: Aiko Tanaka',
    dates: 'उपलब्ध मितिहरू', datesPh: 'जस्तै: जुलाई ४, ६ (साँझ)',
    food: 'खानाको रुचि', foodPh: 'जस्तै: शाकाहारी / सुँगुर बाहेक',
    message: 'विदाई सन्देश', messagePh: 'छोड्न चाहनुभएको केही शब्द…',
    submit: 'रोप्नुहोस् र Sanctuary भित्र जानुहोस्', submitting: 'रोप्दै…',
    footer: 'प्रति व्यक्ति एउटा जीवित स्मारक · जहिले पनि सम्पादन गर्न सकिने',
    offline: 'हामी सर्भरमा पुग्न सकेनौं, तर तपाईंको बिरुवा अहिले नै बढ्नेछ र पछि सिङ्क हुनेछ।',
    skip: 'Sanctuary मा जानुहोस्',
  },
  mn: {
    title: 'Амьд дурсамж тарь',
    subtitle: 'Явахаасаа өмнө манай нийтлэг ертөнцөд мөрөө үлдээ. 🌱',
    joinQ: 'Та үдэлтийн үдэшлэгт оролцож чадах уу?',
    joinYes: 'Тийм, би оролцоно', joinNo: 'Үгүй, гэхдээ дурсамж үлдээнэ',
    plant: 'Ургамлаа сонго', sakura: 'Найрамдлын сакура', sakuraSub: 'Интоорын цэцэг — шинэчлэл ба үдэлт',
    orchid: 'Bulbophyllum triste', orchidSub: 'Ховор, нам гүм тэсвэртэй цахирмаа',
    name: 'Таны нэр', namePh: 'ж: Айко Танака',
    dates: 'Боломжтой өдрүүд', datesPh: 'ж: 7-р сарын 4, 6 (орой)',
    food: 'Хоолны сонголт', foodPh: 'ж: Цагаан хоолтон / Гахайн махгүй',
    message: 'Үдэлтийн үг', messagePh: 'Үлдээхийг хүссэн хэдэн үг…',
    submit: 'Тарьж Sanctuary руу орох', submitting: 'Тарьж байна…',
    footer: 'Хүн бүрт нэг амьд дурсгал · хэдийд ч засварлах боломжтой',
    offline: 'Сервертэй холбогдож чадсангүй, гэхдээ таны ургамал одоо ургаж, дараа нь синк хийгдэнэ.',
    skip: 'Sanctuary руу алгасах',
  },
}

const inputCls = 'mt-1.5 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-base text-white placeholder-white/40 outline-none transition focus:border-amber-200/60 focus:bg-white/15 sm:py-2.5 sm:text-sm'

export default function FarewellRSVP() {
  const navigate = useNavigate()
  const operatorId = useRef(getOperatorId()).current

  const [lang, setLang] = useState(() => { try { return localStorage.getItem('mtn_lang') || 'en' } catch { return 'en' } })
  useEffect(() => { try { localStorage.setItem('mtn_lang', lang) } catch { /* ignore */ } }, [lang])
  const t = T[lang] || T.en

  const [attending, setAttending] = useState(null)   // null | true | false
  const [name, setName] = useState('')
  const [dates, setDates] = useState('')
  const [food, setFood] = useState('')
  const [message, setMessage] = useState('')
  const [plant, setPlant] = useState('sakura')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (attending === null || !name.trim() || !message.trim() || submitting) return
    setSubmitting(true); setError('')

    const payload = {
      attending,
      name: name.trim(),
      datesAvailable: attending ? dates.trim() : '',
      foodPreference: attending ? food.trim() : '',
      message: message.trim(),
      plantType: plant,
    }

    let planted = { name: payload.name, plantType: plant, position: null }
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Operator-Token': operatorId },
        credentials: 'include',
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`)
      if (data?.position && typeof data.position.x === 'number') {
        planted = { id: data.id, name: data.name || payload.name, plantType: data.plantType || plant, position: [data.position.x, data.position.y, data.position.z] }
      }
    } catch (err) {
      console.error('[Farewell] RSVP POST failed:', err)
      setError('offline')
    }

    try { localStorage.setItem(PENDING_KEY, JSON.stringify({ ...planted, ts: Date.now() })) } catch { /* ignore */ }
    navigate('/sanctuary')
  }

  const PLANTS = [
    { key: 'sakura', label: t.sakura, sub: t.sakuraSub, Icon: Cherry },
    { key: 'orchid', label: t.orchid, sub: t.orchidSub, Icon: Leaf },
  ]

  return (
    <div className="relative flex min-h-[100dvh] w-screen items-center justify-center overflow-y-auto overscroll-none px-4 py-10 font-sans"
      style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#070b1c] via-[#141a38] to-[#2a1a3a]"
        style={{ backgroundImage: 'radial-gradient(1px 1px at 14% 20%, #fff, transparent), radial-gradient(1px 1px at 30% 34%, #fff, transparent), radial-gradient(1.5px 1.5px at 47% 14%, #fff, transparent), radial-gradient(1px 1px at 65% 28%, #fff, transparent), radial-gradient(1px 1px at 80% 16%, #fff, transparent), radial-gradient(1.5px 1.5px at 90% 32%, #fff, transparent), linear-gradient(to bottom, #070b1c, #141a38, #2a1a3a)' }} />

      <Link to="/sanctuary" className="fixed left-4 z-10 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/25 bg-black/40 px-4 py-2 font-mono text-xs text-white/90 backdrop-blur-md transition hover:bg-black/60"
        style={{ top: 'max(1rem, env(safe-area-inset-top))' }}>
        <ArrowLeft size={15} /> {t.skip}
      </Link>

      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.94, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        className="relative w-full max-w-lg rounded-[28px] border border-white/25 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-2xl sm:p-8"
        style={{ paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}
      >
        {/* Language selector */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-1.5">
          <Languages size={14} className="mr-0.5 text-white/50" />
          {LANGS.map((l) => (
            <button key={l.code} type="button" onClick={() => setLang(l.code)}
              className={`min-h-[30px] rounded-full px-2.5 py-1 font-mono text-[11px] transition ${lang === l.code ? 'bg-amber-300/80 text-amber-950' : 'border border-white/15 bg-white/5 text-white/70 hover:bg-white/10'}`}>
              {l.label}
            </button>
          ))}
        </div>

        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-rose-300 text-amber-950 shadow-[0_0_24px_rgba(253,224,140,0.6)]">
          <Sparkles size={22} />
        </div>
        <h1 className="text-center font-serif text-2xl font-bold tracking-wide sm:text-3xl">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-md text-center font-serif text-[14px] leading-relaxed text-white/85">{t.subtitle}</p>

        {/* Step 1 — attendance branch */}
        <div className="mt-6">
          <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.joinQ}</span>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setAttending(true)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 font-serif text-sm font-semibold transition ${attending === true ? 'border-emerald-300/80 bg-emerald-300/20 text-emerald-100 ring-1 ring-emerald-200/50' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}>
              <Check size={16} /> {t.joinYes}
            </button>
            <button type="button" onClick={() => setAttending(false)}
              className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-3 font-serif text-sm font-semibold transition ${attending === false ? 'border-rose-300/80 bg-rose-300/20 text-rose-100 ring-1 ring-rose-200/50' : 'border-white/15 bg-white/5 text-white/80 hover:bg-white/10'}`}>
              <X size={16} /> {t.joinNo}
            </button>
          </div>
        </div>

        {/* Step 2 — fields appear after a choice */}
        <AnimatePresence initial={false}>
          {attending !== null && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden' }}
            >
              {/* Plant choice */}
              <div className="mt-5">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.plant}</span>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {PLANTS.map(({ key, label, sub, Icon }) => (
                    <button key={key} type="button" onClick={() => setPlant(key)}
                      className={`flex flex-col items-start gap-1 rounded-2xl border px-3 py-3 text-left transition ${plant === key ? 'border-amber-200/80 bg-white/20 ring-1 ring-amber-200/50' : 'border-white/15 bg-white/5 hover:bg-white/10'}`}>
                      <Icon size={18} className="text-amber-200" />
                      <span className="font-serif text-sm font-semibold leading-tight">{label}</span>
                      <span className="font-mono text-[10px] leading-snug text-white/60">{sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-5 block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.name}</span>
                <input value={name} onChange={(e) => setName(e.target.value)} maxLength={40} required placeholder={t.namePh} className={inputCls} />
              </label>

              {/* Dates + Food only when attending */}
              <AnimatePresence initial={false}>
                {attending === true && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: 'hidden' }}>
                    <label className="mt-4 block">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-200/80"><Calendar size={12} /> {t.dates}</span>
                      <input value={dates} onChange={(e) => setDates(e.target.value)} maxLength={120} placeholder={t.datesPh} className={inputCls} />
                    </label>
                    <label className="mt-4 block">
                      <span className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-amber-200/80"><Utensils size={12} /> {t.food}</span>
                      <input value={food} onChange={(e) => setFood(e.target.value)} maxLength={80} placeholder={t.foodPh} className={inputCls} />
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className="mt-4 block">
                <span className="font-mono text-[11px] uppercase tracking-wider text-amber-200/80">{t.message}</span>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} maxLength={240} required rows={3} placeholder={t.messagePh} className={`${inputCls} resize-none`} />
                <span className="mt-1 block text-right font-mono text-[10px] text-white/40">{message.length}/240</span>
              </label>
            </motion.div>
          )}
        </AnimatePresence>

        {error === 'offline' && (
          <p className="mt-3 rounded-xl border border-amber-300/40 bg-black/40 px-3 py-2 font-mono text-[11px] text-amber-200/90">{t.offline}</p>
        )}

        <button type="submit" disabled={submitting || attending === null}
          className="mt-5 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-300 to-rose-300 px-5 py-3 font-serif text-sm font-bold text-amber-950 shadow-lg transition hover:brightness-105 active:scale-[0.99] disabled:opacity-50">
          {submitting ? t.submitting : t.submit} <Send size={15} />
        </button>
        <p className="mt-3 text-center font-mono text-[10px] text-white/45">{t.footer}</p>
      </motion.form>
    </div>
  )
}
