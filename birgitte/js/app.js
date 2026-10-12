(function () {
'use strict';

/* ================= state ================= */
var KEY = 'birgitte.prototype.v1';
var S = { lang: 'en', saved: [], cart: [], over: {}, added: [], series: null, inbox: [], order: null };
try { var raw = localStorage.getItem(KEY); if (raw) Object.assign(S, JSON.parse(raw)); } catch (e) {}
if (!S.series) S.series = BIRG.series.map(function (s) { return Object.assign({}, s); });
var persistWarned = false;
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); }
  catch (e) { if (!persistWarned) { persistWarned = true; toast(t('sOnlySession')); } }
}
function t(k) { return (STR[S.lang] && STR[S.lang][k]) || STR.en[k] || k; }
var $ = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function money(n) { return n == null ? t('priceOnRequest') : (S.lang === 'da' ? n.toLocaleString('da-DK') + ' DKK' : 'DKK ' + n.toLocaleString('en-US')); }
var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ================= works ================= */
function allWorks() {
  var base = BIRG.works.concat(S.added);
  return base.map(function (w) {
    var o = S.over[w.id]; return o ? Object.assign({}, w, o) : w;
  });
}
function shown() { return allWorks().filter(function (w) { return w.visible !== false; }); }
function seriesWorks(sid) { return shown().filter(function (w) { return w.series === sid; }); }
function getW(id) { return allWorks().filter(function (w) { return w.id === id; })[0]; }
function patch(id, p) { S.over[id] = Object.assign({}, S.over[id] || {}, p); persist(); }
function statusLabel(s) { return t(s === 'sold' ? 'sold' : s === 'reserved' ? 'reserved' : 'available'); }
function title(w) { return w.title; }
function sizeText(w) { return w.size + ' · ' + w.cm.map(function (n) { return String(n).replace('.', S.lang === 'da' ? ',' : '.'); }).join(' × ') + ' cm'; }
function setTint(c) { document.documentElement.style.setProperty('--tint', c || '#e6dfd3'); }

/* ================= toast / layer ================= */
var toastT;
function toast(m) { var e = $('#toast'); e.textContent = m; e.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { e.classList.remove('on'); }, 2200); }
var lastFocus = null;
function openLayer(html, cls) {
  lastFocus = document.activeElement;
  var L = $('#layer');
  L.innerHTML = '<div class="scrim" data-close></div><div class="' + (cls || 'drawer') + '" role="dialog" aria-modal="true">' + html + '</div>';
  var d = L.lastChild; var f = $('input,textarea,select,button', d); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
  return d;
}
function closeLayer() { $('#layer').innerHTML = ''; if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true }); }
document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeLayer(); closeNav(); } });

/* ================= chrome ================= */
function chrome() {
  var r = route().name;
  var cur = function (n) { return r === n ? ' aria-current="page"' : ''; };
  var cc = S.saved.length, ac = S.cart.length;
  var links = '<a href="#/series"' + cur('series') + '>' + t('series') + '</a>' +
    '<a href="#/birgitte"' + cur('about') + '>' + t('about') + '</a>' +
    '<a href="#/collection"' + cur('collection') + '>' + t('collection') + (cc ? '<span class="count">' + cc + '</span>' : '') + '</a>' +
    '<a href="#/cart"' + cur('cart') + '>' + t('acquire') + (ac ? '<span class="count">' + ac + '</span>' : '') + '</a>' +
    '<button class="lang" data-lang aria-label="Language">' + (S.lang === 'en' ? '<b>EN</b> / DA' : 'EN / <b>DA</b>') + '</button>';
  $('#nav').innerHTML = links;
  $('#sheet-nav').innerHTML = '<button class="x" data-closenav>' + t('close') + '</button>' + links.replace('class="count"', 'class="count"');
  $('#menu-btn').textContent = t('menu');
  var st = r === 'studio';
  document.body.classList.toggle('studio', st);
  $('#proto').innerHTML = '<span class="t">' + t('protoTag') + '</span>' + (st ? '<button data-nav-to="#/">' + t('backToSite') + '</button>' : '<button data-nav-to="#/studio">' + t('viewAs') + '</button>');
  document.documentElement.lang = S.lang;
}
function closeNav() { $('#sheet-nav').classList.remove('open'); $('#menu-btn').setAttribute('aria-expanded', 'false'); }

/* ================= router ================= */
function route() {
  var h = (location.hash || '#/').replace(/^#\/?/, '').split('/');
  var n = h[0] || 'home';
  if (n === 'birgitte') return { name: 'about' };
  if (n === 'work') return { name: 'work', id: h[1] };
  if (n === 'series') return { name: 'series', id: h[1] };
  return { name: n };
}
var cleanup = [];
var rendering = 0;
function render(instant) {
  var m = $('#view'); var go = function () {
    cleanup.forEach(function (f) { f(); }); cleanup = [];
    var r = route(); chrome(); closeNav(); closeLayer();
    var V = { home: home, series: series, work: work, about: about, collection: collection, cart: cart, studio: studio }[r.name] || home;
    m.innerHTML = V(r) + (r.name === 'studio' ? '' : footer());
    window.scrollTo(0, 0);
    m.classList.remove('leaving');
    setTint(null);
    if (V.after) V.after(r);
    reveals();
  };
  if (instant || reduce) go(); else { m.classList.add('leaving'); var id = ++rendering; setTimeout(function () { if (id === rendering) go(); }, 280); }
}
function footer() {
  return '<footer class="foot"><span>© Birgitte Lund</span><span>' + t('madeWith') + '</span><a class="link" href="#/studio">' + t('studio') + '</a></footer>';
}
function reveals() {
  var els = $$('.reveal, .statement'); if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('in'); }); return; }
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { threshold: .18 });
  els.forEach(function (e) { io.observe(e); }); cleanup.push(function () { io.disconnect(); });
}
function tintOnView(sel) {
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) setTint(x.target.getAttribute('data-tint')); }); }, { threshold: .6 });
  $$(sel).forEach(function (e) { io.observe(e); }); cleanup.push(function () { io.disconnect(); });
}

/* ================= HOME / entrance ================= */
function fl(cls, id, speed) {
  var w = getW(id); if (!w) return '';
  return '<a class="float ' + cls + '" href="#/work/' + w.id + '" data-speed="' + speed + '" data-tint="' + w.tint + '" aria-label="' + esc(title(w)) + '"><img src="' + w.img + '" alt="' + esc(title(w)) + '"><figcaption>' + esc(title(w)) + '</figcaption></a>';
}
function pick(cls, id) {
  var w = getW(id); if (!w) return '';
  return '<a class="pick reveal ' + cls + '" href="#/work/' + w.id + '" data-tint="' + w.tint + '"><img src="' + w.img + '" alt="' + esc(title(w)) + '" loading="lazy"><div class="cap"><span class="serif">' + esc(title(w)) + '</span><small>' + sizeText(w) + '<br>' + (w.status === 'sold' ? t('sold') : money(w.price)) + '</small></div></a>';
}
function home() {
  var words = BIRG.artist.statement.split(' ').map(function (w, i) { return '<span class="w" style="--i:' + i + '">' + esc(w) + ' </span>'; }).join('');
  return '<section class="hero" aria-label="Birgitte Lund">' +
    '<h1 class="mega"><span class="ln"><span>The Spirit</span></span><span class="ln"><span>of Strange</span></span><span class="ln"><span>Flowers</span></span></h1>' +
    fl('f1', '09', .1) + fl('f2', '16', -.06) + fl('f3', '06', .26) + fl('f4', '05', .04) +
    '<div class="hero-meta"><span class="eyebrow">Birgitte Lund</span><span class="serif">' + t('originalWorks') + '</span></div>' +
    '<span class="cue">' + t('scroll') + '</span></section>' +
    '<section class="statement" data-tint="#9c4a1a"><p>' + words + '</p><cite>Birgitte Lund</cite></section>' +
    '<section class="selection"><div class="eyebrow">' + t('fromSeries') + '</div>' + pick('pk1', '09') + pick('pk2', '03') + pick('pk3', '19') + pick('pk4', '16') + '</section>' +
    '<section class="cta-band"><a href="#/series">' + t('enter') + ' →</a><div class="row"><a class="link" href="#/birgitte">' + t('meetB') + '</a></div></section>';
}
home.after = function () {
  tintOnView('.float, .pick, .statement');
  if (reduce) return;
  var fs = $$('.float'); var ticking = false;
  function upd() { ticking = false; var y = window.scrollY; fs.forEach(function (f) { f.style.transform = 'translate3d(0,' + (-y * parseFloat(f.getAttribute('data-speed'))).toFixed(1) + 'px,0)'; }); }
  function on() { if (!ticking) { ticking = true; requestAnimationFrame(upd); } }
  window.addEventListener('scroll', on, { passive: true }); cleanup.push(function () { window.removeEventListener('scroll', on); });
};

/* ================= SERIES / the hang ================= */
var filter = 'all';
function series(r) {
  var ser = S.series.filter(function (s) { return s.id === r.id; })[0] || S.series[0];
  var ws = seriesWorks(ser.id);
  var sizes = []; ws.forEach(function (w) { if (sizes.indexOf(w.size) < 0) sizes.push(w.size); }); sizes.sort();
  var vis = ws.filter(function (w) { return filter === 'all' || w.size === filter; });
  var others = S.series.filter(function (s) { return s.id !== ser.id; });
  var tabs = S.series.length > 1 ? '<div class="filters" role="group" aria-label="Series" style="margin-right:30px">' + S.series.map(function (s) { return '<button aria-pressed="' + (s.id === ser.id) + '" data-series="' + s.id + '">' + esc(s.title) + '</button>'; }).join('') + '</div>' : '';
  var intro = ser.id === 'strange-flowers' ? esc(BIRG.artist.statement) : esc(ser.text || '');
  return '<div class="series-head"><div><div class="eyebrow">' + (ser.current ? t('currentSeries') : t('series')) + '</div><h1 class="h1">' + esc(ser.title) + '</h1></div><p>' + intro + '</p></div>' +
    '<div class="tools"><div style="display:flex;flex-wrap:wrap;gap:6px 0">' + tabs + '<div class="filters" role="group" aria-label="Size"><button aria-pressed="' + (filter === 'all') + '" data-filter="all">' + t('all') + '</button>' +
    sizes.map(function (s) { return '<button aria-pressed="' + (filter === s) + '" data-filter="' + s + '">' + s + '</button>'; }).join('') + '</div></div><span class="note">' + vis.length + ' ' + t(vis.length === 1 ? 'work' : 'works') + ' · ' + t('trueScale') + '</span></div>' +
    '<div class="wall-wrap"><div class="wall" id="wall" tabindex="0" aria-label="' + esc(ser.title) + '">' +
    vis.map(function (w) {
      var h = w.cm[1] * (w.ratio ? 1 : 1);
      return '<a class="hang' + (w.status === 'sold' ? ' is-sold' : '') + '" href="#/work/' + w.id + '" data-tint="' + w.tint + '" draggable="false"><div class="slot"><img style="--h:' + h + '" src="' + w.img + '" alt="' + esc(title(w)) + '" draggable="false"></div>' +
        '<div class="label"><b>' + esc(title(w)) + '</b>' + sizeText(w) + '<br><span class="dot ' + w.status + '"></span>' + (w.status === 'available' ? (w.price != null ? money(w.price) : t('priceOnRequest')) : statusLabel(w.status)) + '</div></a>';
    }).join('') + '</div><div class="progress"><i id="prog"></i></div><div class="hint"><span>←  →</span><span>' + t('scroll') + '</span></div></div>' +
    '<div style="height:12vh"></div>';
}
series.after = function () {
  var wall = $('#wall'); if (!wall) return;
  var prog = $('#prog');
  function up() { var max = wall.scrollWidth - wall.clientWidth; var p = max > 0 ? wall.scrollLeft / max : 0; var w = Math.max(.12, wall.clientWidth / wall.scrollWidth); prog.style.width = (w * 100) + '%'; prog.style.left = (p * (1 - w) * 100) + '%'; }
  wall.addEventListener('scroll', up, { passive: true }); up();
  wall.addEventListener('wheel', function (e) { if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) { var max = wall.scrollWidth - wall.clientWidth; var atEnd = (e.deltaY > 0 && wall.scrollLeft >= max - 1) || (e.deltaY < 0 && wall.scrollLeft <= 0); if (!atEnd) { e.preventDefault(); wall.scrollLeft += e.deltaY; } } }, { passive: false });
  var down = false, sx = 0, sl = 0, moved = false;
  wall.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = false; sx = e.clientX; sl = wall.scrollLeft; });
  window.addEventListener('pointermove', mv); window.addEventListener('pointerup', upx);
  function mv(e) { if (!down) return; var dx = e.clientX - sx; if (Math.abs(dx) > 5) { moved = true; wall.classList.add('dragging'); } if (moved) wall.scrollLeft = sl - dx; }
  function upx() { down = false; wall.classList.remove('dragging'); }
  wall.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
  cleanup.push(function () { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', upx); });
  tintOnView('.hang');
  if (history.state && history.state.wall) wall.scrollLeft = history.state.wall;
};

/* ================= ARTWORK ================= */
function work(r) {
  var w = getW(r.id); if (!w || w.visible === false) return '<div class="simple"><p class="empty">—</p><p><a class="link" href="#/series">' + t('backSeries') + '</a></p></div>';
  var ser = S.series.filter(function (s) { return s.id === w.series; })[0] || S.series[0];
  var list = seriesWorks(w.series); var i = list.findIndex(function (x) { return x.id === w.id; });
  var prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  var story = S.lang === 'da' && w.storyDa ? w.storyDa : w.story;
  if (typeof story === 'string') story = story.split(/\n+/).filter(Boolean);
  var inCart = S.cart.indexOf(w.id) >= 0, isSaved = S.saved.indexOf(w.id) >= 0;
  var rows = '<div><dt>' + t('size') + '</dt><dd>' + w.size + '</dd></div><div><dt>' + t('mounted') + '</dt><dd>' + w.cm.join(' × ') + ' cm</dd></div>' +
    (w.unmounted ? '<div><dt>' + t('unmounted') + '</dt><dd>' + w.unmounted.join(' × ') + ' cm</dd></div>' : '') +
    (w.medium ? '<div><dt>' + t('medium') + '</dt><dd>' + esc(w.medium) + '</dd></div>' : '') +
    (w.year ? '<div><dt>' + t('year') + '</dt><dd>' + esc(w.year) + '</dd></div>' : '') +
    '<div><dt>' + t('price') + '</dt><dd class="price">' + (w.status === 'sold' ? '—' : money(w.price)) + '</dd></div>' +
    '<div><dt>' + t('availability') + '</dt><dd><span class="dot ' + w.status + '"></span>' + statusLabel(w.status) + '</dd></div>';
  var buy;
  if (w.status === 'sold') buy = '<p class="sold-note">' + t('soldNote') + '</p><a class="btn" href="#/series">' + t('soldMore') + '</a>';
  else if (w.status === 'reserved') buy = '<p class="unique">' + t('reservedNote') + '</p><div class="row"><button class="btn" data-ask="' + w.id + '">' + t('askAbout') + '</button></div>';
  else buy = '<div class="row">' + (w.price != null
    ? (inCart ? '<a class="btn primary" href="#/cart">' + t('acquire') + ' →</a>' : '<button class="btn primary" data-acquire="' + w.id + '">' + t('acquireWork') + '</button>') + '<button class="btn" data-ask="' + w.id + '">' + t('askAbout') + '</button>'
    : '<button class="btn primary" data-ask="' + w.id + '" data-price="1">' + t('askPrice') + '</button>') + '</div><p class="unique">' + t('unique') + '</p>';
  var sim = shown().filter(function (x) { return x.size === w.size && x.id !== w.id; });
  return '<div class="work" data-tint="' + w.tint + '"><div class="viewing"><div class="frame" data-look="' + w.id + '"><img src="' + w.img + '" alt="' + esc(title(w)) + '"></div>' +
    '<div class="acts"><button class="link" data-look="' + w.id + '">' + t('lookCloser') + '</button><button class="link" data-wall="' + w.id + '">' + t('onWall') + '</button></div></div>' +
    '<div class="info"><div class="crumb"><a href="#/series/' + ser.id + '">' + esc(ser.title) + '</a> → ' + esc(title(w)) + '</div><div class="eyebrow">' + esc(ser.title) + '</div><h1>' + esc(title(w)) + '</h1>' +
    (story && story.length ? '<div class="story clamp" id="story">' + story.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '</div>' + (story.length > 1 || story[0].length > 160 ? '<button class="link story-more" data-more aria-expanded="false">' + t('more') + '</button>' : '') : '') +
    '<dl class="facts">' + rows + '</dl><div class="buy">' + buy + '<button class="link" style="font-size:13.5px;margin-top:6px" data-save="' + w.id + '" aria-pressed="' + isSaved + '">' + (isSaved ? '● ' + t('saved') : '○ ' + t('save')) + '</button></div></div></div>' +
    '<nav class="pn" aria-label="Works"><a class="pv" href="#/work/' + prev.id + '"><img src="' + prev.img + '" alt=""><div><small>← ' + t('prev') + '</small><span class="serif">' + esc(title(prev)) + '</span></div></a>' +
    '<a class="nx" href="#/work/' + next.id + '"><img src="' + next.img + '" alt=""><div><small>' + t('next') + ' →</small><span class="serif">' + esc(title(next)) + '</span></div></a></nav>' +
    (sim.length ? '<section class="similar"><h2>' + t('similar') + ' (' + w.size + ')</h2><div class="strip">' + sim.map(function (x) { return '<a href="#/work/' + x.id + '"><img src="' + x.img + '" alt="' + esc(title(x)) + '" loading="lazy">' + esc(title(x)) + '<br>' + (x.status === 'sold' ? t('sold') : money(x.price)) + '</a>'; }).join('') + '</div></section>' : '');
}
work.after = function (r) { var w = getW(r.id); if (w) setTint(w.tint); };

/* look closer */
function lookCloser(id) {
  var w = getW(id); if (!w) return;
  lastFocus = document.activeElement;
  var L = $('#layer'); L.innerHTML = '<div class="lightbox" role="dialog" aria-modal="true" aria-label="' + esc(title(w)) + '"><button class="x" data-close>' + t('close') + '</button><img src="' + w.img + '" alt="' + esc(title(w)) + '"><span class="tip">' + esc(title(w)) + '</span></div>';
  var lb = $('.lightbox'); lb.addEventListener('click', function (e) {
    if (e.target.closest('.x')) return;
    var img = $('img', lb); var z = lb.classList.contains('zoom');
    if (!z) { var rc = img.getBoundingClientRect(); var fx = (e.clientX - rc.left) / rc.width, fy = (e.clientY - rc.top) / rc.height; lb.classList.add('zoom'); var r2 = img.getBoundingClientRect(); lb.scrollLeft = fx * img.offsetWidth - innerWidth / 2; lb.scrollTop = fy * img.offsetHeight - innerHeight / 2; }
    else lb.classList.remove('zoom');
  });
  $('.x', lb).focus();
}

/* see it on a wall, at true size */
function onWall(id) {
  var w = getW(id); if (!w) return;
  lastFocus = document.activeElement;
  var tones = { plaster: ['#e8e3da', '#201e1b', '#d7d1c7', '#cbc4b8'], clay: ['#c9b6a2', '#201e1b', '#b6a08a', '#a58e77'], ink: ['#26262b', '#eee9e0', '#37373d', '#2f2f34'] };
  var imgW = w.cm[0], imgH = w.cm[1];
  // image ratio can differ slightly from sheet; keep the sheet height true
  var iw = imgH * w.ratio;
  var cx = 200, floor = 250, eye = 150;
  function svg(tone, close) {
    var c = tones[tone], so = c[2], fl = c[3], ink = c[1];
    var vw = Math.max(iw * 3.6, 150), vh = vw * 0.62, vb = close ? ((cx - vw / 2) + ' ' + (floor - eye - vh / 2) + ' ' + vw + ' ' + vh) : '40 52 320 218';
    return '<svg viewBox="' + vb + '" preserveAspectRatio="xMidYMid meet" role="img" aria-label="' + esc(title(w)) + '">' +
      '<defs><filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000" flood-opacity=".35"/></filter></defs>' +
      '<rect x="0" y="' + floor + '" width="400" height="20" fill="' + fl + '"/><rect x="0" y="' + floor + '" width="400" height=".5" fill="' + ink + '" opacity=".35"/>' +
      '<g fill="' + so + '"><rect x="100" y="' + (floor - 86) + '" width="200" height="60" rx="8"/><rect x="92" y="' + (floor - 62) + '" width="24" height="56" rx="8" fill="' + fl + '"/><rect x="284" y="' + (floor - 62) + '" width="24" height="56" rx="8" fill="' + fl + '"/><rect x="116" y="' + (floor - 44) + '" width="168" height="30" rx="5" fill="' + fl + '"/><rect x="100" y="' + (floor - 8) + '" width="4" height="8"/><rect x="296" y="' + (floor - 8) + '" width="4" height="8"/></g>' +
      '<g stroke="' + ink + '" stroke-width=".5" opacity=".6"><line x1="40" y1="' + (floor - 170) + '" x2="40" y2="' + floor + '"/><line x1="36" y1="' + (floor - 170) + '" x2="44" y2="' + (floor - 170) + '"/></g><text x="48" y="' + (floor - 166) + '" font-size="5" fill="' + ink + '" font-family="Hanken Grotesk,sans-serif" opacity=".7">170 cm</text>' +
      '<image href="' + w.img + '" x="' + (cx - iw / 2) + '" y="' + (floor - eye - imgH / 2) + '" width="' + iw + '" height="' + imgH + '" filter="url(#sh)"/></svg>';
  }
  var L = $('#layer');
  var tone = 'plaster', close = false;
  function paint() { var c = tones[tone]; L.innerHTML = '<div class="wallview" style="--wallc:' + c[0] + ';--wallink:' + c[1] + '" role="dialog" aria-modal="true" aria-label="' + t('onWall') + '">' + svg(tone, close) + '<div class="bar"><span>' + esc(title(w)) + ' · ' + w.size + ' · ' + t('onWallNote') + '</span><div class="tones">' +
    ['plaster', 'clay', 'ink'].map(function (k) { return '<button data-tone="' + k + '" aria-pressed="' + (k === tone) + '">' + t('wall' + k[0].toUpperCase() + k.slice(1)) + '</button>'; }).join('') + '<button data-zoom aria-pressed="' + close + '">' + t('closer') + '</button><button data-close>' + t('close') + '</button></div></div></div>'; }
  paint();
  L.onclick = function (e) { if (e.target.closest('[data-zoom]')) { close = !close; paint(); return; } var b = e.target.closest('[data-tone]'); if (b) { tone = b.getAttribute('data-tone'); paint(); } };
}

/* enquiry */
function askDrawer(id, price) {
  var w = getW(id); if (!w) return;
  var pre = price ? (S.lang === 'da' ? 'Hej Birgitte, jeg vil gerne høre om prisen på ' : 'Hello Birgitte, I would like to know the price of ') + title(w) + '.' : (S.lang === 'da' ? 'Hej Birgitte, jeg vil gerne vide mere om ' : 'Hello Birgitte, I would like to know more about ') + title(w) + '.';
  var d = openLayer('<button class="x" data-close>' + t('close') + '</button><div class="eyebrow">' + t('enquiry') + '</div><h2>' + esc(title(w)) + '</h2><div class="mini"><img src="' + w.img + '" alt=""><div class="eyebrow">' + sizeText(w) + '</div></div>' +
    '<form id="ask"><label class="field"><span>' + t('name') + '</span><input name="name" required autocomplete="name"></label><label class="field"><span>' + t('email') + '</span><input type="email" name="email" required autocomplete="email"></label>' +
    '<label class="field"><span>' + t('message') + '</span><textarea name="msg">' + esc(pre) + '</textarea></label><button class="btn primary" type="submit">' + t('send') + '</button></form>');
  $('#ask', d).addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    S.inbox.unshift({ id: 'm' + Date.now(), type: 'enquiry', date: Date.now(), name: f.name.value, email: f.email.value, msg: f.msg.value, items: [id], status: 'new' }); persist(); chrome();
    d.innerHTML = '<button class="x" data-close>' + t('close') + '</button><p class="sent">' + t('enquirySent') + '</p><button class="btn" data-close>' + t('close') + '</button>';
  });
}

/* ================= ABOUT ================= */
function about() {
  var picks = [['09', '20% 14%'], ['06', '50% 40%'], ['02', '14% 24%'], ['16', '50% 14%'], ['03', '22% 22%'], ['19', '48% 30%']];
  return '<section class="about"><div class="portrait"><img src="assets/birgitte.jpg" alt="Birgitte Lund"></div><div><div class="eyebrow">' + t('artist') + '</div><h1 class="h1">Birgitte<br><em>Lund</em></h1>' +
    '<blockquote>“' + esc(BIRG.artist.statement) + '”</blockquote>' +
    '<div class="keyfacts"><div><span>' + t('facts') + '</span><span>' + esc(BIRG.series[0].title) + '</span></div><div><span>' + t('originalWorks') + '</span><span>' + t('nineteen') + '</span></div><div><span>' + t('size') + '</span><span>' + t('sizesRange') + '</span></div></div>' +
    '<a class="btn primary" href="#/series">' + t('enter') + ' →</a></div></section>' +
    '<section class="close"><h2>' + t('lookingClosely') + '</h2><div class="details">' + picks.map(function (p) { var w = getW(p[0]); return w ? '<a href="#/work/' + w.id + '"><div class="crop" style="background-image:url(' + w.img + ');background-position:' + p[1] + '"></div>' + t('detailOf') + esc(title(w)) + '</a>' : ''; }).join('') + '</div></section>';
}
about.after = function () { setTint('#9a8f86'); };

/* ================= COLLECTION ================= */
function collection() {
  var ws = S.saved.map(getW).filter(Boolean);
  return '<div class="simple"><div class="eyebrow">' + t('trueScale') + '</div><h1 class="h1">' + t('collectionTitle') + '</h1><p class="lead">' + t('collectionLead') + '</p>' +
    (ws.length ? '<div class="shelf">' + ws.map(function (w) {
      return '<div class="it"><a href="#/work/' + w.id + '"><img style="--h:' + w.cm[1] + '" src="' + w.img + '" alt="' + esc(title(w)) + '"></a><a class="serif" href="#/work/' + w.id + '" style="text-decoration:none">' + esc(title(w)) + '</a><span class="m">' + sizeText(w) + ' · ' + (w.status === 'sold' ? t('sold') : money(w.price)) + '</span><div class="ac">' +
        (w.status === 'available' ? (w.price != null ? '<button class="link" data-acquire="' + w.id + '">' + t('acquireWork') + '</button>' : '<button class="link" data-ask="' + w.id + '" data-price="1">' + t('askPrice') + '</button>') : '') + '<button class="link" data-save="' + w.id + '">' + t('remove') + '</button></div></div>';
    }).join('') + '</div>' : '<p class="empty">' + t('collectionEmpty') + '</p>') + '</div>';
}

/* ================= CART / acquisition ================= */
var step = 'cart';
function cart() {
  if (step === 'done') return '<div class="simple"><h1 class="h1">' + t('thanksTitle') + '</h1><p class="lead" style="margin-top:24px">' + t('thanksBody') + '</p><div class="shelf">' + (S.order || []).map(function (id) { var w = getW(id); return w ? '<div class="it"><img style="--h:' + w.cm[1] + '" src="' + w.img + '" alt=""><span class="serif">' + esc(title(w)) + '</span></div>' : ''; }).join('') + '</div><a class="btn" href="#/series">' + t('backSeries') + '</a></div>';
  var ws = S.cart.map(getW).filter(Boolean);
  var total = ws.reduce(function (a, w) { return a + (w.status === 'available' ? (w.price || 0) : 0); }, 0);
  var head = '<div class="eyebrow">' + t('protoNoPay') + '</div><h1 class="h1">' + t('cartTitle') + '</h1><p class="lead">' + t('cartLead') + '</p>';
  if (!ws.length) return '<div class="simple">' + head + '<p class="empty">' + t('cartEmpty') + '</p><p style="margin-top:24px"><a class="btn" href="#/series">' + t('backSeries') + '</a></p></div>';
  var lines = '<div class="lines">' + ws.map(function (w) {
    return '<div class="line"><a href="#/work/' + w.id + '"><img src="' + w.img + '" alt=""></a><div><span class="serif">' + esc(title(w)) + '</span><span class="m">' + sizeText(w) + '</span></div><span>' + (w.status === 'available' ? money(w.price) : statusLabel(w.status)) + '</span><button class="link" data-uncart="' + w.id + '">' + t('remove') + '</button></div>';
  }).join('') + '</div>';
  if (step === 'form') return '<div class="simple">' + head + lines + '<div class="total"><span class="eyebrow">' + t('total') + '</span><span class="serif">' + money(total) + '</span></div>' +
    '<h2 class="serif" style="font-size:30px;font-weight:300;margin:10px 0 20px">' + t('details') + '</h2><form id="order" style="max-width:560px"><div class="two"><label class="field"><span>' + t('name') + '</span><input name="name" required autocomplete="name"></label><label class="field"><span>' + t('email') + '</span><input type="email" name="email" required autocomplete="email"></label></div>' +
    '<label class="field"><span>' + t('address') + '</span><textarea name="address" required autocomplete="street-address"></textarea></label><label class="field"><span>' + t('note') + '</span><textarea name="note"></textarea></label><button class="btn primary" type="submit">' + t('place') + '</button><p class="unique" style="margin-top:10px">' + t('protoNoPay') + '</p></form></div>';
  return '<div class="simple">' + head + lines + '<div class="total"><div><span class="eyebrow">' + t('total') + '</span><br><span class="serif">' + money(total) + '</span></div><button class="btn primary" data-step="form"' + (total ? '' : ' disabled') + '>' + t('continue') + ' →</button></div></div>';
}
cart.after = function () {
  var f = $('#order'); if (!f) return;
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var ids = S.cart.filter(function (id) { var w = getW(id); return w && w.status === 'available'; });
    if (!ids.length) return;
    var total = ids.reduce(function (a, id) { return a + (getW(id).price || 0); }, 0);
    S.inbox.unshift({ id: 'o' + Date.now(), type: 'order', date: Date.now(), name: f.name.value, email: f.email.value, msg: (f.address.value + (f.note.value ? '\n\n' + f.note.value : '')), items: ids, total: total, status: 'new' });
    ids.forEach(function (id) { patch(id, { status: 'reserved' }); });
    S.order = ids; S.cart = []; persist(); step = 'done'; render(true);
  });
};

/* ================= STUDIO ================= */
var tab = 'today';
function studio() {
  var ws = allWorks();
  var cnt = function (s) { return ws.filter(function (w) { return w.status === s && w.visible !== false; }).length; };
  var newN = S.inbox.filter(function (m) { return m.status === 'new'; }).length;
  var body;
  if (tab === 'today') {
    var value = ws.filter(function (w) { return w.status === 'available' && w.visible !== false; }).reduce(function (a, w) { return a + (w.price || 0); }, 0);
    var todo = []; if (ws.some(function (w) { return w.price == null && w.status === 'available'; })) todo.push(t('sCk1')); todo.push(t('sCk2'), t('sCk4'), t('sCk3'));
    body = '<div class="stats"><div class="stat"><b>' + cnt('available') + '</b><span>' + t('sAvail') + '</span></div><div class="stat"><b>' + cnt('reserved') + '</b><span>' + t('sResv') + '</span></div><div class="stat"><b>' + cnt('sold') + '</b><span>' + t('sSold') + '</span></div><div class="stat"><b>' + newN + '</b><span>' + t('sNew') + '</span></div></div>' +
      '<p class="lead" style="margin-bottom:24px">' + t('sValue') + ': <b style="font-weight:500">' + money(value) + '</b></p><div style="display:flex;gap:12px;flex-wrap:wrap"><button class="btn primary" data-add>' + t('sAdd') + '</button><button class="btn" data-tab="inbox">' + t('sInbox') + '</button><a class="btn" href="#/" >' + t('backToSite') + '</a></div>' +
      '<div class="checklist" style="margin-top:36px"><h3>' + t('sChecklist') + '</h3><ul>' + todo.map(function (x) { return '<li>' + x + '</li>'; }).join('') + '</ul></div><p class="tip">' + t('sTip') + ': ' + t('sFirstTip') + '</p>';
  } else if (tab === 'works') {
    body = '<div class="wlist-head"><span class="eyebrow">' + ws.length + ' ' + t('works') + '</span><button class="btn primary small" data-add>+ ' + t('sAdd') + '</button></div>' + ws.map(function (w) {
      return '<div class="wrow' + (w.visible === false ? ' hidden' : '') + '"><img src="' + w.img + '" alt=""><div><span class="serif">' + esc(title(w)) + '</span><small>' + sizeText(w) + '</small></div>' +
        '<label class="pricein"><input inputmode="numeric" data-price-in="' + w.id + '" value="' + (w.price == null ? '' : w.price) + '" placeholder="—" aria-label="' + t('sPrice') + '"><span>DKK</span></label>' +
        '<div class="seg" role="group" aria-label="' + t('sStatus') + '">' + ['available', 'reserved', 'sold'].map(function (s) { return '<button data-status="' + w.id + ':' + s + '" aria-pressed="' + (w.status === s) + '">' + statusLabel(s) + '</button>'; }).join('') + '</div>' +
        '<button class="sw" role="switch" aria-checked="' + (w.visible !== false) + '" data-vis="' + w.id + '"><i></i>' + t('sShown') + '</button><button class="link" data-edit="' + w.id + '">' + t('sEdit') + '</button></div>';
    }).join('');
  } else if (tab === 'series') {
    body = S.series.map(function (s) {
      var sw = allWorks().filter(function (w) { return w.series === s.id; });
      return '<div style="margin-bottom:36px"><h2 class="serif" style="font-size:32px;font-weight:300;margin-bottom:6px">' + esc(s.title) + '</h2><div class="eyebrow" style="margin-bottom:10px">' + sw.length + ' ' + t('works') + '</div>' +
        sw.map(function (w, i) { return '<div class="sline"><span><img class="thumb" src="' + w.img + '" alt="">' + esc(title(w)) + '</span><span><button class="link" data-move="' + w.id + ':-1" ' + (i === 0 ? 'disabled' : '') + ' aria-label="' + t('sMoveUp') + '">↑</button> &nbsp; <button class="link" data-move="' + w.id + ':1" ' + (i === sw.length - 1 ? 'disabled' : '') + ' aria-label="' + t('sMoveDown') + '">↓</button></span></div>'; }).join('') + '</div>';
    }).join('') + '<form id="newseries" style="max-width:480px;margin-top:20px"><div class="eyebrow" style="margin-bottom:10px">' + t('sNewSeries') + '</div><label class="field"><span>' + t('sSeriesName') + '</span><input name="t" required></label><button class="btn" type="submit">' + t('sCreate') + '</button></form>';
  } else {
    body = S.inbox.length ? S.inbox.map(function (m) {
      var d = new Date(m.date).toLocaleString(S.lang === 'da' ? 'da-DK' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });
      var open = m.status === 'new';
      return '<div class="inbox-item"><div class="top"><span>' + (m.type === 'order' ? t('sOrder') : t('sEnquiry')) + ' · ' + d + '</span><span class="chip ' + (open ? 'new' : '') + '">' + (m.status === 'new' ? 'New' : m.status === 'confirmed' ? t('sConfirmed') : m.status === 'released' ? t('sReleased') : '✓') + '</span></div><div class="who">' + esc(m.name) + ' <small style="font-size:14px;color:var(--muted)">' + esc(m.email) + '</small></div>' +
        '<div class="items">' + m.items.map(function (id) { var w = getW(id); return w ? '<img src="' + w.img + '" alt="' + esc(title(w)) + '" title="' + esc(title(w)) + '">' : ''; }).join('') + '</div>' +
        (m.type === 'order' ? '<div style="font-family:var(--serif);font-size:22px">' + money(m.total) + '</div>' : '') + '<p class="msg">' + esc(m.msg) + '</p><div class="acts">' +
        (m.type === 'order' && open ? '<button class="btn small primary" data-confirm="' + m.id + '">' + t('sConfirm') + '</button><button class="btn small" data-release="' + m.id + '">' + t('sRelease') + '</button>' : '') +
        (m.type !== 'order' && open ? '<button class="btn small" data-handled="' + m.id + '">' + t('sHandled') + '</button>' : '') + '<a class="btn small" href="mailto:' + esc(m.email) + '">' + t('sReply') + '</a></div></div>';
    }).join('') : '<p class="empty">' + t('sInboxEmpty') + '</p>';
  }
  var tabs = [['today', 'sToday'], ['works', 'sWorks'], ['series', 'sSeries'], ['inbox', 'sInbox']];
  return '<div class="studio-wrap"><div class="eyebrow">' + t('studio') + '</div><h1 class="h1" style="font-size:clamp(40px,5vw,72px)">' + t('sHello') + '</h1><p class="lead" style="margin-top:10px;max-width:560px">' + t('sHelloLead') + '</p>' +
    '<div class="s-tabs" role="tablist">' + tabs.map(function (x) { return '<button role="tab" aria-selected="' + (tab === x[0]) + '" data-tab="' + x[0] + '">' + t(x[1]) + (x[0] === 'inbox' && newN ? '<span class="badge">' + newN + '</span>' : '') + '</button>'; }).join('') + '</div>' + body + '</div>';
}

/* image helpers for added works */
function readImage(file, cb) {
  var fr = new FileReader();
  fr.onload = function () {
    var im = new Image(); im.onload = function () {
      var max = 1300, k = Math.min(1, max / Math.max(im.width, im.height));
      var c = document.createElement('canvas'); c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      var g = c.getContext('2d'); g.drawImage(im, 0, 0, c.width, c.height);
      var tint = '#9a8f86';
      try { var d = g.getImageData(0, 0, c.width, c.height).data, r = 0, gg = 0, b = 0, n = 0; for (var i = 0; i < d.length; i += 4 * 17) { var mx = Math.max(d[i], d[i + 1], d[i + 2]), mn = Math.min(d[i], d[i + 1], d[i + 2]); if (mx - mn > 40 && mx > 40) { r += d[i]; gg += d[i + 1]; b += d[i + 2]; n++; } } if (n) tint = 'rgb(' + Math.round(r / n) + ',' + Math.round(gg / n) + ',' + Math.round(b / n) + ')'; } catch (e) {}
      cb(c.toDataURL('image/jpeg', .85), c.width / c.height, tint);
    }; im.src = fr.result;
  };
  fr.readAsDataURL(file);
}
function workForm(w) {
  var isNew = !w; w = w || { series: S.series[0].id, size: 'A3', status: 'available' };
  var nextN = allWorks().reduce(function (a, x) { return Math.max(a, x.n || 0); }, 0) + 1;
  var portrait = !w.cm || w.cm[1] >= w.cm[0];
  var d = openLayer('<button class="x" data-close>' + t('close') + '</button><div class="eyebrow">' + (isNew ? t('sAdd') : t('sEdit')) + '</div><h2>' + (isNew ? '' : esc(title(w))) + '</h2>' +
    '<form id="wf"><div class="drop"><div id="dropv">' + (w.img ? '<img src="' + w.img + '" alt="">' : t('sDrop')) + '</div><input type="file" accept="image/*" id="file" aria-label="' + t('sPhoto') + '"></div>' +
    '<label class="field"><span>' + t('sTitle') + '</span><input name="title" value="' + esc(w.title || '') + '" placeholder="Artwork No. ' + nextN + '"></label>' +
    '<div class="two"><label class="field"><span>' + t('sSeriesSel') + '</span><select name="series">' + S.series.map(function (s) { return '<option value="' + s.id + '"' + (s.id === w.series ? ' selected' : '') + '>' + esc(s.title) + '</option>'; }).join('') + '</select></label>' +
    '<label class="field"><span>' + t('sPrice') + '</span><input name="price" inputmode="numeric" value="' + (w.price == null ? '' : w.price) + '"></label></div>' +
    '<div class="two"><label class="field"><span>' + t('size') + '</span><select name="size">' + Object.keys(BIRG.sizes).map(function (s) { return '<option' + (s === w.size ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></label>' +
    '<label class="field"><span>' + t('sOrient') + '</span><select name="orient"><option value="p"' + (portrait ? ' selected' : '') + '>' + t('sPortrait') + '</option><option value="l"' + (!portrait ? ' selected' : '') + '>' + t('landscape') + '</option></select></label></div>' +
    '<label class="field"><span>' + t('sMedium') + ' (' + t('sOptional') + ')</span><input name="medium" value="' + esc(w.medium || '') + '"></label>' +
    '<label class="field"><span>' + t('sStory') + ' (' + t('sOptional') + ')</span><textarea name="story">' + esc(Array.isArray(w.story) ? w.story.join('\n\n') : (w.story || '')) + '</textarea></label>' +
    '<label class="field"><span>' + t('sStoryDa') + ' (' + t('sOptional') + ')</span><textarea name="storyDa">' + esc(Array.isArray(w.storyDa) ? w.storyDa.join('\n\n') : (w.storyDa || '')) + '</textarea></label>' +
    '<button class="btn primary" type="submit">' + t('sSave') + '</button></form>');
  var newImg = null;
  $('#file', d).addEventListener('change', function (e) { var f = e.target.files[0]; if (!f) return; readImage(f, function (url, ratio, tint) { newImg = { img: url, ratio: ratio, tint: tint }; $('#dropv', d).innerHTML = '<img src="' + url + '" alt="">'; }); });
  $('#wf', d).addEventListener('submit', function (e) {
    e.preventDefault(); var f = e.target;
    var dims = BIRG.sizes[f.size.value].slice(); if (f.orient.value === 'l') dims.reverse();
    var pr = f.price.value.replace(/[^\d]/g, ''); var data = {
      series: f.series.value, size: f.size.value, cm: dims, price: pr === '' ? null : parseInt(pr, 10), medium: f.medium.value.trim() || null,
      story: f.story.value.trim() ? f.story.value.trim().split(/\n+/) : null, storyDa: f.storyDa.value.trim() ? f.storyDa.value.trim().split(/\n+/) : null
    };
    if (isNew) {
      if (!newImg) { toast(t('sPhoto')); return; }
      var n = nextN; var nw = Object.assign({ id: 'x' + Date.now(), n: n, title: f.title.value.trim() || 'Artwork No. ' + n, status: 'available' }, newImg, data);
      S.added.push(nw); persist(); toast(t('saved2')); closeLayer(); tab = 'works'; render(true);
    } else {
      var p = Object.assign({ title: f.title.value.trim() || w.title }, data); if (newImg) Object.assign(p, newImg);
      patch(w.id, p); toast(t('saved2')); closeLayer(); render(true);
    }
  });
}

/* ================= events ================= */
document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-close],[data-lang],[data-nav-to],[data-acquire],[data-ask],[data-save],[data-look],[data-wall],[data-more],[data-filter],[data-series],[data-uncart],[data-step],[data-tab],[data-add],[data-edit],[data-status],[data-vis],[data-move],[data-confirm],[data-release],[data-handled],[data-closenav],#menu-btn,a[href^="#"]');
  if (!el) return;
  var g = function (a) { return el.getAttribute(a); };
  if (el.hasAttribute('data-close')) { closeLayer(); return; }
  if (el.id === 'menu-btn') { $('#sheet-nav').classList.add('open'); el.setAttribute('aria-expanded', 'true'); return; }
  if (el.hasAttribute('data-closenav')) { closeNav(); return; }
  if (el.hasAttribute('data-lang')) { S.lang = S.lang === 'en' ? 'da' : 'en'; persist(); render(true); return; }
  if (el.hasAttribute('data-nav-to')) { location.hash = g('data-nav-to'); return; }
  if (el.hasAttribute('data-acquire')) { var id = g('data-acquire'); if (S.cart.indexOf(id) < 0) S.cart.push(id); persist(); step = 'cart'; location.hash = '#/cart'; if (route().name === 'cart') render(true); return; }
  if (el.hasAttribute('data-ask')) { askDrawer(g('data-ask'), el.hasAttribute('data-price')); return; }
  if (el.hasAttribute('data-save')) { var sid = g('data-save'); var ix = S.saved.indexOf(sid); if (ix >= 0) S.saved.splice(ix, 1); else S.saved.push(sid); persist(); var y = scrollY; render(true); scrollTo(0, y); toast(ix >= 0 ? t('remove') + ' ✓' : t('saved')); return; }
  if (el.hasAttribute('data-look')) { lookCloser(g('data-look')); return; }
  if (el.hasAttribute('data-wall')) { onWall(g('data-wall')); return; }
  if (el.hasAttribute('data-more')) { var st = $('#story'); var c = st.classList.toggle('clamp'); el.textContent = c ? t('more') : t('less'); el.setAttribute('aria-expanded', String(!c)); return; }
  if (el.hasAttribute('data-filter')) { filter = g('data-filter'); render(true); return; }
  if (el.hasAttribute('data-series')) { location.hash = '#/series/' + g('data-series'); filter = 'all'; return; }
  if (el.hasAttribute('data-uncart')) { S.cart = S.cart.filter(function (x) { return x !== g('data-uncart'); }); persist(); render(true); return; }
  if (el.hasAttribute('data-step')) { step = g('data-step'); render(true); return; }
  if (el.hasAttribute('data-tab')) { tab = g('data-tab'); render(true); return; }
  if (el.hasAttribute('data-add')) { workForm(null); return; }
  if (el.hasAttribute('data-edit')) { workForm(getW(g('data-edit'))); return; }
  if (el.hasAttribute('data-status')) { var p = g('data-status').split(':'); patch(p[0], { status: p[1] }); render(true); toast(t('saved2')); return; }
  if (el.hasAttribute('data-vis')) { var w = getW(g('data-vis')); patch(w.id, { visible: w.visible === false }); render(true); return; }
  if (el.hasAttribute('data-move')) { var mm = g('data-move').split(':'), dir = parseInt(mm[1], 10); var order = allWorks().map(function (x) { return x.id; }); var all = allWorks(); var wk = getW(mm[0]); var same = all.filter(function (x) { return x.series === wk.series; }).map(function (x) { return x.id; }); var a = same.indexOf(wk.id), b = a + dir; if (b < 0 || b >= same.length) return;
    // reorder: swap in the base+added arrays
    var arr = BIRG.works.concat(S.added).map(function (x) { return x.id; }); var seq = (S.order_ids && S.order_ids.length ? S.order_ids : arr).slice(); arr.forEach(function (i2) { if (seq.indexOf(i2) < 0) seq.push(i2); });
    var ia = seq.indexOf(same[a]), ib = seq.indexOf(same[b]); var tmp = seq[ia]; seq[ia] = seq[ib]; seq[ib] = tmp; S.order_ids = seq; persist(); render(true); return; }
  if (el.hasAttribute('data-confirm')) { var m = S.inbox.filter(function (x) { return x.id === g('data-confirm'); })[0]; m.items.forEach(function (i3) { patch(i3, { status: 'sold' }); }); m.status = 'confirmed'; persist(); render(true); toast(t('sConfirmed')); return; }
  if (el.hasAttribute('data-release')) { var m2 = S.inbox.filter(function (x) { return x.id === g('data-release'); })[0]; m2.items.forEach(function (i4) { patch(i4, { status: 'available' }); }); m2.status = 'released'; persist(); render(true); return; }
  if (el.hasAttribute('data-handled')) { var m3 = S.inbox.filter(function (x) { return x.id === g('data-handled'); })[0]; m3.status = 'handled'; persist(); render(true); return; }
  // plain hash links: remember wall position
  if (el.tagName === 'A' && g('href').indexOf('#/') === 0) { var wl = $('#wall'); if (wl && history.replaceState) history.replaceState({ wall: wl.scrollLeft }, ''); }
});
document.addEventListener('change', function (e) {
  var i = e.target.closest('[data-price-in]'); if (!i) return;
  var v = i.value.replace(/[^\d]/g, ''); patch(i.getAttribute('data-price-in'), { price: v === '' ? null : parseInt(v, 10) }); toast(t('saved2')); render(true);
});
document.addEventListener('submit', function (e) {
  if (e.target.id === 'newseries') { e.preventDefault(); var v = e.target.t.value.trim(); if (!v) return; S.series.push({ id: 's' + Date.now(), title: v, text: '' }); persist(); toast(t('saved2')); render(true); }
});
window.addEventListener('hashchange', function () { if (route().name !== 'cart') step = step === 'done' ? 'cart' : step; render(); });

/* respect saved order for series */
var _allWorks = allWorks;
allWorks = function () { var a = _allWorks(); if (!S.order_ids) return a; return a.sort(function (x, y) { var i = S.order_ids.indexOf(x.id), j = S.order_ids.indexOf(y.id); return (i < 0 ? 999 : i) - (j < 0 ? 999 : j); }); };

render(true);
})();
