/* ============================================================================
 * blog.js — all logic for blog.html, externalised so the page needs NO inline
 * <script> blocks and NO inline event-handler attributes. This lets the CSP use
 * a strict `script-src 'self'` (no 'unsafe-inline'). All DOM wiring uses
 * addEventListener. Loaded as a classic script AFTER api.js and BEFORE the
 * Google Translate element.js (which calls window.googleTranslateElementInit).
 * ========================================================================== */
(function () {
  'use strict';

  const $app = document.getElementById('app');
  const API = (window.PortfolioAPI && PortfolioAPI.BASE_URL) || '';

  const REACTIONS = [
    { key: 'love', e: '❤️', l: 'Love it' }, { key: 'clap', e: '👏', l: 'Bravo' },
    { key: 'fire', e: '🔥', l: 'Fire' }, { key: 'idea', e: '💡', l: 'Insightful' },
    { key: 'great', e: '🙌', l: 'Great post!' }, { key: 'inspiring', e: '✨', l: 'Very inspiring!' },
    { key: 'helpful', e: '🙏', l: 'Helpful!' },
  ];

  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = (s) => { try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return ''; } };

  // Pull extra image URLs out of the article body so we can build a gallery.
  function extractImages(content, heroUrl) {
    const imgs = []; if (heroUrl) imgs.push(heroUrl);
    let text = content || '';
    text = text.replace(/!\[[^\]]*\]\((https?:\/\/[^)\s]+)\)/g, (_, u) => { imgs.push(u); return ''; });
    text = text.replace(/(?:^|\s)(https?:\/\/\S+\.(?:jpe?g|png|webp|gif|avif)(?:\?\S*)?)/gi, (_, u) => { imgs.push(u); return ''; });
    return { images: [...new Set(imgs)], text: text.replace(/\n{3,}/g, '\n\n').trim() };
  }

  /* ---------------- LIST VIEW ---------------- */
  async function renderList() {
    $app.innerHTML = `
      <header class="list-head">
        <h1>The <b>Blog</b></h1>
        <div class="sub">// thoughts on code, care, and everything between</div>
        <div class="searchbar"><input id="q" placeholder="Search articles…"/><button id="qbtn">Search</button></div>
      </header>
      <div id="list" class="grid"><div class="spin">Loading articles…</div></div>`;

    const load = async () => {
      const search = document.getElementById('q').value.trim() || undefined;
      try {
        const r = await PortfolioAPI.getArticles({ page: 1, pageSize: 50, published: true, search });
        const items = r?.data?.items ?? [];
        document.getElementById('list').innerHTML = items.length ? items.map(cardHTML).join('') : `<p class="muted center">No articles found.</p>`;
      } catch (e) { document.getElementById('list').innerHTML = `<p class="muted center">Couldn't load: ${esc(e.message)}</p>`; }
    };
    document.getElementById('qbtn').addEventListener('click', load);
    document.getElementById('q').addEventListener('keydown', (e) => { if (e.key === 'Enter') load(); });
    load();
  }

  function cardHTML(a) {
    const img = a.imageUrl || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=900&q=80';
    const reacts = Object.values(a.reactions || {}).reduce((x, y) => x + (y || 0), 0);
    return `<a class="card" href="blog.html?id=${a.id}">
      <div class="ph"><img src="${esc(img)}" alt="" loading="lazy"></div>
      <div class="body">
        <div class="meta">${esc(a.author || '')} · ${fmt(a.publishedDate || a.createdAt)}</div>
        <h3>${esc(a.title)}</h3>
        <p>${esc((a.content || '').replace(/!\[[^\]]*\]\([^)]*\)/g, '').slice(0, 120))}…</p>
        <div class="foot"><span>♥ ${a.likeCount || 0}</span><span>💬 ${reacts}</span></div>
      </div></a>`;
  }

  /* ---------------- ARTICLE (EDITORIAL) VIEW ---------------- */
  async function renderArticle(id) {
    try {
      const r = await PortfolioAPI.getArticle(id);
      const a = r?.data;
      if (!a) { $app.innerHTML = `<p class="spin">Article not found. <a href="blog.html">← All posts</a></p>`; return; }

      const fromContent = extractImages(a.content, a.imageUrl);
      const apiImgs = Array.isArray(a.imageUrls) ? a.imageUrls : [];
      const images = [...new Set([...apiImgs, ...fromContent.images])];
      const text = fromContent.text;
      const hero = images[0] || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1600&q=85';
      const galleryImgs = images.slice(1);
      const paras = text.split(/\n{2,}/).filter(Boolean);
      let pull = ''; const panes = [];
      paras.forEach((p, i) => { if (i === 1 && p.length < 160 && !pull) { pull = p; } else { panes.push(p); } });
      const tags = (a.tags || '').split(',').map((t) => t.trim()).filter(Boolean);

      $app.innerHTML = `
      <article class="article">
        <a class="backlink" href="blog.html">← All posts</a>
        <div class="hero"><div class="kicker">// reading · MTN.Digitosphere</div><img src="${esc(hero)}" alt="${esc(a.title)}"></div>

        <div class="headpane">
          <div class="by">by <b>${esc(a.author || 'Unknown')}</b> · ${fmt(a.publishedDate || a.createdAt)}</div>
          <h1>${esc(a.title)}</h1>
          ${tags.length ? `<div class="tags">${tags.map((t) => `<span class="tag">#${esc(t)}</span>`).join('')}</div>` : ''}
        </div>

        ${(galleryImgs.length || a.videoUrl) ? galleryHTML(galleryImgs, a.videoUrl) : ''}

        <div class="body-editorial">
          ${panes.map((p, i) => {
            const out = `<div class="pane">${esc(p)}</div>`;
            return (pull && i === 0) ? out + `<blockquote class="pull">“${esc(pull)}”</blockquote>` : out;
          }).join('')}
        </div>

        ${interactionsHTML(a)}
      </article>`;
      wireGallery();
      wireInteractions(a);
    } catch (e) {
      $app.innerHTML = `<p class="spin">Couldn't load this article: ${esc(e.message)}<br><a href="blog.html">← All posts</a></p>`;
    }
  }

  function galleryHTML(imgs, videoUrl) {
    const videoItem = videoUrl ? `<figure class="popitem popvideo">
      <span class="pop-badge" style="background:var(--magenta);color:#fff">▶ VIDEO</span>
      <video src="${esc(videoUrl)}" controls playsinline preload="metadata"></video>
    </figure>` : '';
    return `<section class="popwrap">
      <div class="lbl">✦ <b>GALLERY</b> ✦ revenge&nbsp;pop</div>
      <div class="popgal">
        ${videoItem}
        ${imgs.map((u, i) => `<figure class="popitem" data-full="${esc(u)}">
          ${(!videoUrl && i === 0) ? '<span class="pop-badge">POP!</span>' : ''}
          <img src="${esc(u)}" alt="" loading="lazy">
        </figure>`).join('')}
      </div>
    </section>`;
  }

  function wireGallery() {
    const lb = document.getElementById('lb'), lbimg = document.getElementById('lbimg');
    document.querySelectorAll('.popitem[data-full]').forEach((it) => {
      it.addEventListener('click', () => { lbimg.src = it.dataset.full; lb.classList.add('open'); });
    });
    const close = () => lb.classList.remove('open');
    document.getElementById('lbx').addEventListener('click', close);
    lb.addEventListener('click', (e) => { if (e.target === lb) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function interactionsHTML(a) {
    const counts = a.reactions || {};
    return `
    <section class="interactions">
      <div class="ix-row">
        <button class="ix-btn" id="likeBtn"><span id="heart">♡</span> <span id="likeN">${a.likeCount || 0}</span> <span class="muted">likes</span></button>
        <div class="share">
          <button data-net="facebook" title="Share on Facebook"><b>f</b></button>
          <button data-net="twitter" title="Share on X">𝕏</button>
          <button data-net="linkedin" title="Share on LinkedIn">in</button>
          <button data-net="copy" title="Copy link">🔗</button>
        </div>
      </div>
      <div class="reactions">
        <div class="lbl">Quick reaction — pick one</div>
        <div class="chips" id="chips">
          ${REACTIONS.map((r) => `<button class="chip" data-key="${r.key}"><span>${r.e}</span><span>${r.l}</span>${counts[r.key] ? `<span class="n">${counts[r.key]}</span>` : ''}</button>`).join('')}
        </div>
        <p id="thanks" class="muted" style="margin-top:12px;display:none;color:var(--cyan)">Thanks for your reaction! 🎉</p>
      </div>
    </section>`;
  }

  function wireInteractions(a) {
    const id = a.id;
    const shareUrl = `${API}/share/${id}`;
    const likeKey = 'mtn_liked_' + id;
    let liked = localStorage.getItem(likeKey) === '1';
    let likeN = a.likeCount || 0;
    const heart = document.getElementById('heart'), likeNEl = document.getElementById('likeN'), likeBtn = document.getElementById('likeBtn');
    const paint = () => { heart.textContent = liked ? '♥' : '♡'; likeNEl.textContent = likeN; likeBtn.classList.toggle('liked', liked); };
    paint();
    likeBtn.addEventListener('click', async () => {
      liked = !liked; likeN += liked ? 1 : -1; localStorage.setItem(likeKey, liked ? '1' : '0'); paint();
      try { liked ? await PortfolioAPI.likeArticle(id) : await PortfolioAPI.unlikeArticle(id); } catch {}
    });

    let sent = false;
    document.querySelectorAll('#chips .chip').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (sent) return; sent = true; btn.classList.add('sent');
        let n = btn.querySelector('.n'); if (!n) { n = document.createElement('span'); n.className = 'n'; btn.appendChild(n); }
        n.textContent = String(parseInt(n.textContent || '0', 10) + 1);
        document.getElementById('thanks').style.display = 'block';
        try { await PortfolioAPI.reactArticle(id, btn.dataset.key); } catch {}
      });
    });

    document.querySelectorAll('.share button').forEach((b) => {
      b.addEventListener('click', () => {
        const u = encodeURIComponent(shareUrl), t = encodeURIComponent(a.title || '');
        const links = {
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
          twitter: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
        };
        if (b.dataset.net === 'copy') { navigator.clipboard?.writeText(shareUrl); b.textContent = '✓'; setTimeout(() => { b.textContent = '🔗'; }, 1200); }
        else window.open(links[b.dataset.net], '_blank', 'noopener,width=600,height=540');
      });
    });
  }

  /* ---------------- TRANSLATION (EN / 日本語 / မြန်မာ) ---------------- */
  function applyLang(code, tries) {
    tries = tries || 0;
    const combo = document.querySelector('.goog-te-combo');
    if (!combo) { if (tries < 25) setTimeout(() => applyLang(code, tries + 1), 300); return; }
    combo.value = (code === 'en') ? '' : code;   // '' restores original English
    combo.dispatchEvent(new Event('change'));
  }
  function setGoogCookie(code) {
    const kill = 'googtrans=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/';
    document.cookie = kill; document.cookie = kill + ';domain=.' + location.hostname;
    if (code !== 'en') {
      const v = 'googtrans=/en/' + code + ';path=/';
      document.cookie = v; document.cookie = v + ';domain=.' + location.hostname;
    }
  }
  function updateLangUI(code) {
    document.querySelectorAll('.langsw button').forEach((b) => b.classList.toggle('active', b.dataset.lang === code));
  }
  function setLang(code) {
    localStorage.setItem('blog_tlang', code);
    setGoogCookie(code);
    applyLang(code);
    updateLangUI(code);
  }
  // Google Translate's external script calls this global on load.
  window.googleTranslateElementInit = function () {
    new google.translate.TranslateElement(
      { pageLanguage: 'en', includedLanguages: 'en,ja,my', autoDisplay: false },
      'google_translate_element');
  };

  /* ---------------- BOOT ---------------- */
  // Wire the language switcher buttons (no inline handlers).
  document.querySelectorAll('.langsw button').forEach((b) =>
    b.addEventListener('click', () => setLang(b.dataset.lang)));

  if (window.PortfolioAPI) PortfolioAPI.wakeBackend();
  const id = new URLSearchParams(location.search).get('id');
  if (id) renderArticle(id); else renderList();

  // Restore the reader's last language.
  const saved = localStorage.getItem('blog_tlang') || 'en';
  updateLangUI(saved);
  if (saved !== 'en') { setGoogCookie(saved); setTimeout(() => applyLang(saved), 900); }
})();
