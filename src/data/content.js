export const PERSONAL = {
  name: 'Myo Thant Naing',
  handle: 'MTN.Digitosphere',
  tagline: 'From Caring to Coding in Japan 🇯🇵',
  subtitle: 'IT Student · Care-giver · Aspiring AI Engineer',
  bio: 'Living in Japan. Transforming from Healthcare to Tech. I build software to solve real-world problems.',
  slogan: 'Better Late Than Never',
  // Served from the build's own /public folder. import.meta.env.BASE_URL is
  // '/Myweb/' in production and '/' in dev, so this resolves correctly on both
  // GitHub Pages and localhost without hardcoding the github.io origin.
  photo: import.meta.env.BASE_URL + 'Myweb_photo/My_profile2_for_myweb.jpg',
  quote: "Don't Be Institutionalized, Be the Architect of Your Environment.",
  heinlein: `"A human being should be able to change a diaper, plan an invasion, butcher a hog, conn a ship, design a building, write a sonnet, balance accounts, build a wall, set a bone, comfort the dying, take orders, give orders, cooperate, act alone, solve equations, analyze a new problem, pitch manure, program a computer, cook a tasty meal, fight efficiently, die gallantly. Specialization is for insects." – Robert A. Heinlein`,
}

export const SOCIAL = [
  { label: 'LINE', icon: 'fab fa-line', url: 'https://lin.ee/s72ayHD' },
  { label: 'GitHub', icon: 'fab fa-github', url: 'https://github.com/johnathanMT' },
  { label: 'LinkedIn', icon: 'fab fa-linkedin-in', url: 'https://www.linkedin.com/in/johnathanmt/' },
]

export const SKILLS = [
  { name: 'Python', icon: 'fab fa-python', color: '#3b82f6' },
  { name: 'AI Fundamentals', icon: 'fas fa-brain', color: '#a855f7' },
  { name: 'HTML / CSS', icon: 'fab fa-html5', color: '#f97316' },
  { name: 'JavaScript', icon: 'fab fa-js', color: '#eab308' },
  { name: 'Japanese', icon: 'fas fa-language', color: '#ef4444' },
  { name: 'Kaigo Care', icon: 'fas fa-hands-helping', color: '#ec4899' },
  { name: 'English', icon: 'fas fa-globe-americas', color: '#06b6d4' },
  { name: 'UI / UX', icon: 'fas fa-pen-nib', color: '#8b5cf6' },
  { name: 'IoT (M5Stack)', icon: 'fas fa-microchip', color: '#10b981' },
  { name: 'C#', icon: 'fas fa-code', color: '#6366f1' },
  { name: 'Software Engineering', icon: 'fas fa-laptop-code', color: '#0ea5e9' },
  { name: 'OOSAD', icon: 'fas fa-project-diagram', color: '#f59e0b' },
  { name: 'DDOOCP', icon: 'fas fa-cubes', color: '#14b8a6' },
  { name: 'AMCC', icon: 'fas fa-tasks', color: '#f43f5e' },
]

export const PROJECTS = [
  {
    id: 'python', title: 'Python Automation',
    desc: 'Tools created to help with daily tasks and workflows.',
    icon: 'fab fa-python', color: '#3b82f6',
    url: '#/python', ext: false,            // routed React page
  },
  {
    id: 'studying', title: 'Personal Studying',
    desc: 'University assignments, web designs, and learning projects.',
    icon: 'fas fa-laptop-code', color: '#a855f7',
    url: '#/studying', ext: false,          // routed React page
  },
  {
    id: 'bibliography', title: 'Bibliography',
    desc: 'A chronological journey — from analog beginnings to a cyber-modern present.',
    icon: 'fas fa-book', color: '#06b6d4',
    url: '#/bibliography', ext: false,      // routed React page
  },
  {
    id: 'coffee', title: 'Bean Boutique Coffee Shop',
    desc: 'A modern website showcasing premium coffee beans and brewing equipment.',
    icon: 'fas fa-coffee', color: '#f59e0b',
    url: 'https://johnathanmt.github.io/bean-boutique-coffee-shop/', ext: true, featured: true,
  },
  {
    id: 'github', title: 'GitHub Projects',
    desc: 'Explore all repositories, source codes, and categorized projects.',
    icon: 'fab fa-github', color: '#e2e2f0',
    url: 'https://johnathanmt.github.io/Myweb/myweb_github_project.html', ext: false,
  },
]

// High-quality curated photos representing each month's character
export const MONTHS = [
  { name: 'JANUARY', zodiac: '♑ Capricorn', color: '#93c5fd', img: 'https://images.unsplash.com/photo-1517243426866-c8a2f62e5e16?w=1200&q=90', desc: 'New beginnings under winter skies' },
  { name: 'FEBRUARY', zodiac: '♒ Aquarius', color: '#f9a8d4', img: 'https://images.unsplash.com/photo-1496861083958-175bb1bd5702?w=1200&q=90', desc: 'Plum blossoms herald early spring' },
  { name: 'MARCH', zodiac: '♓ Pisces', color: '#fbcfe8', img: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=1200&q=90', desc: 'Sakura petals drift on warm winds' },
  { name: 'APRIL', zodiac: '♈ Aries', color: '#bbf7d0', img: 'https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?w=1200&q=90', desc: 'Fields burst with the colour of hope' },
  { name: 'MAY', zodiac: '♉ Taurus', color: '#a7f3d0', img: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1200&q=90', desc: 'Golden hour across emerald hills' },
  { name: 'JUNE', zodiac: '♊ Gemini', color: '#a5f3fc', img: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&q=90', desc: 'Monsoon rains bring life anew' },
  { name: 'JULY', zodiac: '♋ Cancer', color: '#fde68a', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=1200&q=90', desc: 'Fireworks bloom over summer nights' },
  { name: 'AUGUST', zodiac: '♌ Leo', color: '#fcd34d', img: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=1200&q=90', desc: 'Sunflower fields stretch to the horizon' },
  { name: 'SEPTEMBER', zodiac: '♍ Virgo', color: '#fed7aa', img: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1200&q=90', desc: 'Leaves turn amber as summer fades' },
  { name: 'OCTOBER', zodiac: '♎ Libra', color: '#fca5a5', img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=90', desc: 'Autumn fire across mountain forests' },
  { name: 'NOVEMBER', zodiac: '♏ Scorpio', color: '#d8b4fe', img: 'https://images.unsplash.com/photo-1477414956199-7da45746f742?w=1200&q=90', desc: 'Mist rolls through twilight valleys' },
  { name: 'DECEMBER', zodiac: '♐ Sagittarius', color: '#bfdbfe', img: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200&q=90', desc: 'Snow blankets the world in silence' },
]

// ─── Multilingual blog translations ───────────────────────────────────────────
const kyotoContent = {
  en: {
    excerpt: 'Where tradition meets modern beauty.',
    body: `Kyoto in winter carries a stillness that no other season can replicate. The red and white camellia blossoms push through frosted soil beside ancient stone lanterns, a quiet defiance against the cold.

I wandered through the back alleys of Gion, past wooden machiya townhouses and the faint smell of incense drifting from temple gates. The city whispered its thousand-year history in every cobblestone.

For a developer who spends most days staring at screens, these moments of analog beauty are deeply grounding. Kyoto reminds me why I code — not just to build systems, but to preserve and share experiences like these.`,
  },
  mm: {
    excerpt: 'ထုံးတမ်းစဉ်လာနှင့် ခေတ်မီလှပမှုတို့ တွေ့ဆုံရာနေရာ',
    body: `ဆောင်းရာသီ ကျိုတိုမြို့သည် အခြားသောရာသီများနှင့် နှိုင်းယှဉ်၍မရနိုင်သော တိတ်ဆိတ်မှုကို သယ်ဆောင်သည်။ နီမြောင်သော ကမေလီးယားပန်းများသည် ရေခဲဖျားသော မြေဆီလွှာမှ ပေါ်ထွက်ကာ ရာစုနှစ်ဟောင်း ကျောက်မီးဆိုင်းများဘေးတွင် အေးမြသောမိုးကောင်းကင်ကို ဆန့်ကျင်ရပ်တည်သည်။

ဂျီအိုန်၏ နောက်ကျောလမ်းများတွင် လမ်းလျှောက်ကာ သစ်သားမာချီယာအိမ်များနှင့် ဘုရားကျောင်းတံခါးဝများမှ ထွက်လာသော သမင်ပင်နံ့ကို ရှူရှိုက်ခဲ့သည်။ မြို့သည် ကျောက်ခင်းလမ်းတစ်ခုတိုင်းတွင် ထောင်နှစ်တစ်ထောင် သမိုင်းကို ပြောသည်။

တစ်နေ့တာ မျက်နှာပြင်များကို ငေးကြည့်ကာ ဖြတ်သန်းသော developer တစ်ဦးအတွက် ဤသောနာမွန်ဆန်သော အလှများသည် မြေပေါ်မှာ ပြန်ချည်နှောင်ပေးသည်။ ကျိုတိုသည် ကျွန်တော် ဘာကြောင့် code ရေးသောကို သတိပေးသည်။`,
  },
  jp: {
    excerpt: '伝統と現代の美しさが出会う場所',
    body: `冬の京都は、他のどの季節にも真似できない静寂を漂わせている。赤と白の椿が霜に覆われた土から顔を出し、古い石灯籠のそばで静かに寒さに抗っている。

祇園の路地裏を歩き、木造の町家を通り過ぎ、寺の山門から漂う線香の匂いを感じた。この街は石畳のひとつひとつに千年の歴史をささやいている。

毎日画面を見つめて過ごす開発者にとって、こんなアナログな美しさの瞬間は深く心を落ち着かせてくれる。京都は、なぜ自分がコードを書くのかを思い出させてくれる。システムを作るためだけでなく、こんな体験を残し、分かち合うために。`,
  },
  vn: {
    excerpt: 'Nơi truyền thống gặp gỡ vẻ đẹp hiện đại',
    body: `Kyoto mùa đông mang một vẻ tĩnh lặng mà không mùa nào khác có thể sánh được. Những bông hoa trà đỏ và trắng vươn lên từ mặt đất đóng băng bên cạnh những chiếc đèn đá cổ xưa, thầm lặng thách thức cái lạnh.

Tôi lang thang qua những con hẻm phía sau Gion, đi ngang những ngôi nhà machiya bằng gỗ và ngửi thấy thoảng mùi hương từ cổng chùa. Thành phố thì thầm lịch sử ngàn năm qua từng viên đá lát đường.

Với một lập trình viên dành phần lớn thời gian nhìn vào màn hình, những khoảnh khắc vẻ đẹp thuần túy như thế này mang lại sự bình yên sâu sắc. Kyoto nhắc tôi nhớ tại sao mình viết code.`,
  },
  ne: {
    excerpt: 'परम्परा र आधुनिक सौन्दर्य भेट्ने ठाउँ',
    body: `जाडोको क्योटोले अन्य कुनै मौसमले नक्कल गर्न नसक्ने स्थिरता बोकेको छ। रातो र सेतो क्यामेलिया फूलहरू जमेको माटोबाट पुराना ढुंगा बत्तीहरूको छेउमा निस्कन्छन्, चिसोलाई चुपचाप चुनौती दिँदै।

गियोनका पछाडिका गल्लीहरूमा घुमफिर गरें, काठका माचिया घरहरू पार गर्दै र मन्दिरका ढोकाबाट आउने धूपको हल्का सुगन्ध सुँघ्दै। यो शहरले हरेक ढुंगाको बाटोमा हजार वर्षको इतिहास फुसफुसायो।

स्क्रिन हेरेर बिताउने developer का लागि, यस्ता एनालग सौन्दर्यका क्षणहरूले गहिरो आधार दिन्छ। क्योटोले मलाई सम्झाउँछ — मैले code किन लेख्छु।`,
  },
  id: {
    excerpt: 'Di mana tradisi bertemu keindahan modern',
    body: `Kyoto di musim dingin membawa keheningan yang tidak bisa ditiru musim lain. Bunga kamellia merah dan putih menembus tanah beku di samping lentera batu kuno, perlawanan diam-diam terhadap dingin.

Saya berjalan menyusuri gang-gang belakang Gion, melewati rumah townhouse machiya dari kayu dan aroma dupa yang samar dari pintu gerbang kuil. Kota ini berbisik sejarah seribu tahun di setiap batu jalan.

Bagi developer yang menghabiskan sebagian besar harinya menatap layar, momen keindahan analog seperti ini sangat membumi. Kyoto mengingatkan saya mengapa saya membuat kode — bukan hanya untuk membangun sistem, tetapi untuk melestarikan dan berbagi pengalaman seperti ini.`,
  },
}

const osakaContent = {
  en: {
    excerpt: 'Neon lights and street food beneath plum blossoms.',
    body: `Osaka is alive in a way few cities are. The street food stalls of Dotonbori, the crowd energy, the neon reflecting off wet pavement at 2am — it's a city that refuses to sleep.

But away from the noise, the plum blossoms in Osaka Castle Park bloom quietly in early February. Soft pink and white, a contrast to the city's usual maximalism.

I sat on a park bench with takoyaki in one hand, laptop in the other, writing code while cherry trees swayed overhead. This, I think, is the beauty of building a life in Japan.`,
  },
  mm: {
    excerpt: 'နီออင်မီးရောင်နှင့် ဆည်းဆာ အစားအသောက်များ',
    body: `အိုဆာကာသည် မည်သည့်မြို့နှင့်မျှ မတူသောပုံစံဖြင့် အသက်ရှင်နေသည်။ ဒိုတွန်ဘိုရီ၏ လမ်းဘေးအစားအသောက်ဆိုင်များ၊ လူအုပ်၏ စွမ်းအင်၊ ညနက် နှစ်နာရီတွင် မိုးရွာသည့် ကတ္တရာလမ်းမှ ရောင်ပြန်သော နီonly မီးများ — ဤမြို့သည် အိပ်ချင်ဟုမဆိုသောမြို့ ဖြစ်သည်။

ဆူညံသံများမှ ဝေးကွာသောနေရာတွင်၊ Osaka Castle Park ရှိ သင်္ဘောသဖန်းပန်းများသည် ဖေဖော်ဝါရီ အစောပိုင်းတွင် တိတ်တဆိတ် ပွင့်သည်။ နူးညံ့သောနှင်းဆီနှင့် ဖြူဖွေးသောအရောင်၊ ၎င်းမြို့၏ ပုံမှန် maximalism နှင့် ကွဲပြားသော ဆန့်ကျင်ဘက်တစ်ခု ဖြစ်သည်။`,
  },
  jp: {
    excerpt: '梅の花の下でネオンライトと屋台グルメ',
    body: `大阪は、他のどの都市とも違う生き生きとした活気がある。道頓堀の屋台、人混みのエネルギー、夜中の2時に濡れた歩道に映えるネオン — この街は眠ることを拒む。

でも喧騒を離れると、大阪城公園の梅の花が2月初旬に静かに咲いている。淡いピンクと白は、この街の通常のマキシマリズムとは対照的だ。

たこ焼きを片手に、ラップトップをもう片方の手に持って、桜の木が揺れるのを見ながらコードを書いた。これが日本で生活を築くことの美しさだと思う。`,
  },
  vn: {
    excerpt: 'Đèn neon và ẩm thực đường phố dưới hoa mận',
    body: `Osaka sống động theo cách mà ít thành phố nào có được. Các quầy hàng ăn ở Dotonbori, năng lượng của đám đông, ánh đèn neon phản chiếu trên mặt đường ướt lúc 2 giờ sáng — đây là thành phố không chịu ngủ.

Nhưng xa khỏi tiếng ồn, những bông hoa mận trong Công viên Lâu đài Osaka nở nhẹ nhàng vào đầu tháng Hai. Màu hồng và trắng mềm mại, tương phản với chủ nghĩa tối đa thông thường của thành phố.

Tôi ngồi trên ghế công viên với takoyaki trên tay, máy tính xách tay trên tay kia, viết code trong khi cây anh đào đung đưa phía trên đầu.`,
  },
  ne: {
    excerpt: 'बेर फूलमुनि नियोन बत्ती र सडकको खाना',
    body: `ओसाका कम नगरहरूले जस्तो जीवन्त तरिकामा बाँच्छ। डोटोन्बोरीका खाना स्टलहरू, भीडको ऊर्जा, रातको दुई बजे भिजेको ढुंगामा प्रतिबिम्बित हुने नियोन बत्तीहरू — यो सुत्न नमान्ने सहर हो।

तर कोलाहलबाट टाढा, ओसाका क्यासल पार्कका बेरका फूलहरू फेब्रुअरी सुरुमा चुपचाप फुल्छन्। कोमल गुलाबी र सेतो, सहरको सामान्य अतिवादसँग विपरीत।

एउटा हातमा ताकोयाकी, अर्कोमा ल्यापटप लिएर, चेरी रूखहरू माथि हल्लिँदा कोड लेखें।`,
  },
  id: {
    excerpt: 'Lampu neon dan makanan jalanan di bawah bunga plum',
    body: `Osaka hidup dengan cara yang hanya sedikit kota bisa menandinginya. Warung makanan di Dotonbori, energi keramaian, neon yang memantul di trotoar basah pukul 2 pagi — ini adalah kota yang menolak untuk tidur.

Tapi jauh dari kebisingan, bunga plum di Taman Kastil Osaka mekar dengan tenang di awal Februari. Merah muda lembut dan putih, kontras dengan maksimalisme kota yang biasa.

Saya duduk di bangku taman dengan takoyaki di satu tangan, laptop di tangan lain, menulis kode sementara pohon ceri berayun di atasnya. Ini, menurut saya, adalah keindahan membangun kehidupan di Jepang.`,
  },
}

const thoughtsContent = {
  en: {
    excerpt: '"Sometimes, you just need to disconnect to reconnect."',
    body: `There's a forest trail I found outside of the city. No cell reception. No notifications. Just the sound of wind in cedar trees and the occasional crow.

I go there when the codebase feels tangled, or when a problem I've been chasing refuses to yield. Invariably, the solution arrives on the walk back.

Disconnecting is not failure. It's maintenance. The same discipline that keeps servers healthy applies to humans too.`,
  },
  mm: {
    excerpt: '"တစ်ခါတစ်ရံ ပြန်လည်ချိတ်ဆက်ရန် ချိတ်ဆက်မှုဖြတ်ရသည်"',
    body: `မြို့ပြင် တောနက်ထဲတွင် လမ်းကြောင်းတစ်ခုကို တွေ့ထားသည်။ ဖုန်းလိုင်းမရှိ၊ notification မရှိ၊ ထင်းရှူးပင်ရွက်တွင် လေတိုက်သံနှင့် တစ်ခါတစ်ရံ ကျီးကန်ဟောင်သံသာ ကြားရသည်။

Code base ရှုပ်ထွေးသောအခါ သို့မဟုတ် လိုက်လံနေသောပြဿနာကို မဖြေရှင်းနိုင်သောအခါ ထိုနေရာသို့ သွားသည်။ အမြဲတမ်း ပြန်လမ်းတွင် အဖြေသည် ရောက်လာသည်။

ချိတ်ဆက်မှုဖြတ်ခြင်းသည် ရှုံးနိမ့်ခြင်းမဟုတ်။ ပြုပြင်ထိန်းသိမ်းခြင်းပင် ဖြစ်သည်။`,
  },
  jp: {
    excerpt: '「時には、繋がり直すために切り離す必要がある」',
    body: `街の外に森のトレイルを見つけた。携帯の電波なし。通知なし。杉の木を吹き抜ける風の音と、時折聞こえるカラスの声だけ。

コードベースが絡み合っていると感じるとき、または追いかけていた問題が解決しないとき、そこへ行く。帰り道には、決まって解決策が浮かんでくる。

切り離すことは失敗ではない。それはメンテナンスだ。サーバーを健全に保つ規律は、人間にも同様に適用される。`,
  },
  vn: {
    excerpt: '"Đôi khi, bạn cần ngắt kết nối để kết nối lại"',
    body: `Có một con đường mòn trong rừng tôi tìm thấy ngoài thành phố. Không có sóng điện thoại. Không có thông báo. Chỉ có tiếng gió trong cây tuyết tùng và tiếng quạ thỉnh thoảng.

Tôi đến đó khi codebase cảm thấy rối rắm, hoặc khi một vấn đề tôi đang theo đuổi không chịu nhượng bộ. Thường thì giải pháp xuất hiện trên đường về.

Ngắt kết nối không phải là thất bại. Đó là bảo trì.`,
  },
  ne: {
    excerpt: '"कहिलेकाहीं, पुन: जडान गर्न विडान गर्नु पर्छ"',
    body: `सहर बाहिर एउटा वन पगडण्डी फेला पारेको छु। मोबाइल सिग्नल छैन। सूचनाहरू छैनन्। देवदारका रुखहरूमा हावाको आवाज र कहिलेकाहीं काग मात्र सुनिन्छ।

कोडबेस उल्झिएको लागे वा पछ्याइरहेको समस्याले नदिएजस्तो लागे, त्यहाँ जान्छु। फर्कने बाटोमा समाधान आइपुग्छ।

विडान गर्नु असफलता होइन। यो मर्मत हो।`,
  },
  id: {
    excerpt: '"Terkadang, kamu perlu memutus sambungan untuk terhubung kembali"',
    body: `Ada jalur hutan yang saya temukan di luar kota. Tidak ada sinyal ponsel. Tidak ada notifikasi. Hanya suara angin di pohon cedar dan sesekali gagak.

Saya pergi ke sana ketika codebase terasa kusut, atau ketika masalah yang saya kejar tidak mau menyerah. Solusi selalu datang dalam perjalanan pulang.

Memutus sambungan bukan kegagalan. Itu adalah pemeliharaan. Disiplin yang sama yang menjaga server tetap sehat berlaku untuk manusia juga.`,
  },
}

const kaigoContent = {
  en: {
    excerpt: '"Life is not ever easy — keep patient and resilient."',
    body: `Before I wrote my first line of code professionally, I spent years as a care worker — Kaigo — in Japan. Early mornings, late nights, the weight of responsibility for another person's dignity.

It taught me patience in a way no programming book can. It taught me to read between the lines — to understand what someone needs even when they can't articulate it. These are skills that make a better engineer, not just a better human.

I don't regret the path. I carry it into every project, every team interaction, every line of code I write. Empathy is a feature, not a bug.`,
  },
  mm: {
    excerpt: '"ဘဝသည် လွယ်ကူလေ့မရှိ — သည်းခံမှုနှင့် ခံနိုင်ရည်ရှိသူ ဖြစ်ပါ"',
    body: `ကျွန်တော် ပထမဆုံး code ကို ပရော်ဖက်ရှင်နယ်အနေဖြင့် မရေးမှီ၊ ဂျပန်တွင် Kaigo ဟုခေါ်သော ပြုစုနာထမ်းသမားအဖြစ် နှစ်ပေါင်းများစွာ ဖြတ်သန်းခဲ့သည်။ နံနက်စော်တိုင်း၊ ညနက်တိုင်း၊ တစ်ဦးတစ်ယောက်၏ ဂုဏ်သိက္ကာအတွက် တာဝန်ဝတ္တရားလေးများ ပတ္တနားဘိတ်ဖြင့် ဖြတ်ကျော်ခဲ့သည်။

ကျွန်တော်ကို programming စာအုပ်တစ်အုပ်မျှ မပေးနိုင်သောပုံစံဖြင့် သည်းခံမှုကို သင်ပေးသည်။ တစ်ဦးတစ်ယောက် မပြောနိုင်သောအခါပင် ၎င်းတို့ဘာလိုသည်ကို နားလည်ရန် — လိုင်းကြားဖတ်တတ်ရန် သင်ပေးသည်။

ကျွန်တော် ထိုလမ်းကြောင်းကို နှမြောမနည်း။ ၎င်းကို ပရောဂျက်တစ်ခုတိုင်း၊ team interaction တစ်ခုတိုင်း၊ ရေးသောကုဒ်တုိင်းတွင် သယ်ဆောင်သွားသည်။`,
  },
  jp: {
    excerpt: '"人生は決して簡単ではない — 忍耐と回復力を持とう"',
    body: `プロとして最初のコードを書く前、私は日本で介護士として何年も過ごした。早朝、深夜、他人の尊厳に対する責任の重さ。

どんなプログラミングの本も教えてくれない形で、忍耐を教わった。相手が言葉にできないときでも何が必要かを理解する — 行間を読む力を学んだ。それはより良いエンジニアを作るスキルであり、より良い人間を作るスキルでもある。

その道を後悔していない。それをすべてのプロジェクト、すべてのチームとのやり取り、すべてのコードの行に持ち込んでいる。共感はバグではなく、機能だ。`,
  },
  vn: {
    excerpt: '"Cuộc sống không bao giờ dễ dàng — hãy kiên nhẫn và kiên cường"',
    body: `Trước khi viết dòng code chuyên nghiệp đầu tiên, tôi đã dành nhiều năm làm nhân viên chăm sóc — Kaigo — tại Nhật Bản. Sáng sớm, đêm khuya, sức nặng của trách nhiệm với phẩm giá của người khác.

Nó dạy tôi sự kiên nhẫn theo cách không sách lập trình nào có thể làm. Nó dạy tôi đọc giữa các dòng — hiểu những gì ai đó cần ngay cả khi họ không thể diễn đạt.

Tôi không hối tiếc về con đường đó. Tôi mang nó vào mọi dự án, mọi tương tác nhóm, mọi dòng code tôi viết.`,
  },
  ne: {
    excerpt: '"जीवन कहिल्यै सजिलो छैन — धैर्य र लचिलोपन राख"',
    body: `पेशेवर रूपमा पहिलो कोड लेख्नु अघि, मैले जापानमा Kaigo — हेरचाह कार्यकर्ताको रूपमा वर्षौं बिताएँ। बिहानको झिसमिसे, राति ढिलो, अर्को व्यक्तिको मर्यादाको जिम्मेवारीको बोझ।

यसले मलाई कुनै प्रोग्रामिङ पुस्तकले सिकाउन नसक्ने तरिकामा धैर्य सिकायो। कसैले बोल्न नसक्दा पनि के चाहिन्छ भनेर बुझ्न — लाइनबीचको कुरा पढ्न सिकायो।

त्यो बाटोलाई पछुताउँदिन। यसलाई हरेक परियोजना, हरेक टोली अन्तरक्रिया, हरेक कोड लाइनमा बोकेर जान्छु।`,
  },
  id: {
    excerpt: '"Hidup tidak pernah mudah — tetap sabar dan tangguh"',
    body: `Sebelum menulis baris kode profesional pertama saya, saya menghabiskan bertahun-tahun sebagai pekerja perawatan — Kaigo — di Jepang. Pagi-pagi buta, malam larut, beban tanggung jawab atas martabat orang lain.

Itu mengajarkan saya kesabaran dengan cara yang tidak bisa dilakukan buku pemrograman manapun. Mengajarkan membaca antara baris — memahami apa yang seseorang butuhkan bahkan ketika mereka tidak bisa mengungkapkannya.

Saya tidak menyesal dengan jalan itu. Saya membawanya ke setiap proyek, setiap interaksi tim, setiap baris kode yang saya tulis. Empati adalah fitur, bukan bug.`,
  },
}

export const BLOG_POSTS = [
  {
    id: 'kyoto', size: 'large',
    date: 'Jan 15, 2026', tag: 'Travel',
    img: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1200&q=90',
    title: { en: 'Kyoto: Winter Camellias', mm: 'ကျိုတို: ဆောင်းရာသီ ကမေလီးယား', jp: '京都：冬の椿', vn: 'Kyoto: Hoa Trà Mùa Đông', ne: 'क्योटो: जाडोको क्यामेलिया', id: 'Kyoto: Kamellia Musim Dingin' },
    translations: kyotoContent,
  },
  {
    id: 'osaka', size: 'medium',
    date: 'Feb 02, 2026', tag: 'Travel',
    img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=90',
    title: { en: 'Osaka: Plum Blossoms', mm: 'အိုဆာကာ: သင်္ဘောသဖန်း', jp: '大阪：梅の花', vn: 'Osaka: Hoa Mận', ne: 'ओसाका: बेरका फूल', id: 'Osaka: Bunga Plum' },
    translations: osakaContent,
  },
  {
    id: 'thoughts', size: 'medium',
    date: 'Mar 10, 2026', tag: 'Musings',
    img: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=90',
    title: { en: 'Solitude in Nature', mm: 'သဘာဝတွင် တစ်ဦးတည်း', jp: '自然の中の孤独', vn: 'Cô Đơn Trong Thiên Nhiên', ne: 'प्रकृतिमा एकान्त', id: 'Kesendirian di Alam' },
    translations: thoughtsContent,
  },
  {
    id: 'kaigo-experience', size: 'wide',
    date: 'Apr 10, 2026', tag: 'Care Giving',
    img: 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1200&q=90',
    title: { en: 'Life of a Care Giver (Kaigo)', mm: 'ပြုစုနာထမ်းသမားဘဝ', jp: '介護士の生活', vn: 'Cuộc Sống Người Chăm Sóc', ne: 'हेरचाहकर्ताको जीवन', id: 'Kehidupan Seorang Perawat' },
    translations: kaigoContent,
  },
]

export const INTERESTS = [
  { title: 'Cosmology', desc: 'Unraveling the mysteries of the universe and celestial mechanics.', icon: 'fas fa-globe-asia', color: '#0ea5e9', page: 'cosmology.html' },
  { title: 'Quantum Theory', desc: 'Exploring the fundamental nature of reality and particles.', icon: 'fas fa-atom', color: '#10b981', page: 'quantum-theory.html' },
  { title: 'Linguistics', desc: 'Mastering Japanese (N3+) & English communication arts.', icon: 'fas fa-language', color: '#f97316', page: 'linguistics.html' },
  { title: 'FE / IT Study', desc: 'Fundamental Engineering, Algorithms & System Architecture.', icon: 'fas fa-laptop-code', color: '#06b6d4', page: 'fe-it-study.html' },
  { title: 'Occultism', desc: 'Ancient wisdom, symbolism, and the hidden arts.', icon: 'fas fa-eye', color: '#8b5cf6', page: 'occultism.html' },
  { title: 'Fortune Prediction', desc: 'Astrology, Tarot, and analyzing destiny\'s path.', icon: 'fas fa-star', color: '#f59e0b', page: 'fortune-prediction.html' },
  { title: 'General Knowledge', desc: 'History, Philosophy, and Random Curiosities.', icon: 'fas fa-lightbulb', color: '#ef4444', page: 'general-knowledge.html' },
  { title: 'Unconditional Joke', desc: 'Humor, Satire, and Light-hearted moments.', icon: 'fas fa-theater-masks', color: '#eab308', page: 'unconditional-jokes.html' },
]
