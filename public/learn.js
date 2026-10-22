// 📚 Learn a topic + 🏠 Today's 5 + 🩹 Topics I find hard: real exam questions one at a time, easiest first.
// Every question has a working space (a squared drawing pad + "My answer"). Help stays hidden until the student asks
// (user, 2026-10-18): 🤔 I'm stuck → one hint at a time (the first steps of the worked solution), 📝 I don't know → the full
// worked solution, ✅ I've finished → the official mark scheme. Then "Got it / Not yet", saved on this device; "Not yet"
// questions come back the next day in "Try again". Uses pp.js (questions), solutions.js and app.js tools.
(function () {
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) || d; } catch (e) { return d; } };
  const put = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
  const KEY = 'y8m-progress-v1', WKEY = 'y8m-weak-v1', AKEY = 'y8m-answers-v1';
  let PROG = store(KEY, {}), WEAK = store(WKEY, {}), ANS = store(AKEY, {});
  const save = () => put(KEY, PROG);
  const BAND = ['Easy', 'Medium', 'Hard', 'Very hard'];
  const P = () => window.Y8M_PP, SOL = () => window.Y8M_SOL || {}, T = () => window.Y8M_TOOLS;
  // ✅ Model answers by Physics & Maths Tutor (user, 22 Oct 2026: use them instead of the AI-written steps where they exist).
  // ma.js maps a question-paper link to PMT's model-answer PDF and each question's page. Link only: PMT's work is not copied.
  const maLink = r => { const P_ = window.Y8M_PP, m = r && r[7] >= 0 && (window.Y8M_MA || {})[P_.urls[r[7]]]; if (!m) return ''; const pg = m[1][r[5]];
    return `<a class="btn small" href="${m[0]}${pg ? '#page=' + pg : ''}" target="_blank" rel="noopener">📄 Open the model answer (Question ${r[5]}${pg ? ', page ' + pg : ''})</a>`; };
  const maHTML = r => maLink(r) ? `<div class="sol"><b>✅ Model answer by a maths tutor</b> <span class="meta">(from Physics &amp; Maths Tutor; opens their PDF of the whole paper)</span><p style="margin:8px 0 0">${maLink(r)}</p></div>` : '';
  const solMeta = id => (window.Y8M_SOL_UNCHECKED || []).includes(id) ? '(written with AI help; this paper has no official mark scheme, so it could not be checked against one)' : '(written with AI help, checked against the official mark scheme)';   // 22 Oct 2026: 4400 Nov 2005 / June 2006
  const assess = window.Y8M_ASSESSMENT || { topics: [] };
  const live = r => (r[10] & 1) && !r[11];
  const state = id => (PROG[id] || {}).s;
  const groupIndex = name => P().groups.findIndex(g => g[1] === name);
  const focusGis = () => assess.all ? P().groups.map((_, i) => i) : assess.topics.map(groupIndex).filter(i => i >= 0);   // 🌍 All topics or one assessment
  const VID = () => window.Y8M_VIDEOS || {};   // 🎬 Corbettmaths videos per topic (videos.js)
  const groupOfSub = sub => (P().groups.find(g => g[2].includes(sub)) || [])[1];
  const vidLink = v => `<a href="${esc(v[2])}" target="_blank" rel="noopener">▶ ${esc(v[1])}</a> <span class="small muted">(video ${esc(v[0])})</span> · <a class="small" href="${esc(v[3])}" target="_blank" rel="noopener">practice sheet</a>`;
  let ROWS_P = null, ROWS = [];   // each topic's questions, worked out once (it was ~300 passes over all 4,752 per click: a visible lag)
  const rowsOf = gi => {
    if (ROWS_P !== P()) { ROWS_P = P(); ROWS = []; }
    if (!ROWS[gi]) { const subs = new Set(P().groups[gi][2]); ROWS[gi] = P().q.filter(r => live(r) && subs.has(r[0])); }
    return ROWS[gi];   // shared: callers only read it (easyFirst copies before sorting)
  };
  const easyFirst = rows => rows.slice().sort((a, b) => a[1] - b[1] || (!!SOL()[b[9]] - !!SOL()[a[9]]) || ((state(a[9]) === 'got') - (state(b[9]) === 'got')));
  const today = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
  function seeded(seed) {   // the same "random" numbers all day, so Today's 5 stays the same until tomorrow (mulberry32)
    let h = 2166136261; for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
    return () => { h = (h + 0x6D2B79F5) | 0; let t = Math.imul(h ^ (h >>> 15), 1 | h); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const stats = rows => ({ n: rows.length, got: rows.filter(r => state(r[9]) === 'got').length, tried: rows.filter(r => state(r[9])).length, not: rows.filter(r => state(r[9]) === 'not').length });
  const bar = (got, n) => `<span class="lbar"><span style="width:${n ? Math.round(100 * got / n) : 0}%"></span></span>`;

  // ---------- 🩹 topics I find hard: the ones the student marked, plus any with 2 or more "Not yet" answers
  function weakList() {
    const out = [];
    P().groups.forEach((g, gi) => {
      const marked = !!WEAK[g[1]], auto = !marked && stats(rowsOf(gi)).not >= 2;
      if (marked || auto) out.push({ gi, auto });
    });
    return out;
  }
  function weakRows() {   // mixed from every hard topic: "Not yet" first, then not tried (easiest first), then the ones already got
    const rank = r => state(r[9]) === 'not' ? 0 : !state(r[9]) ? 1 : 2;
    const lists = weakList().map(w => easyFirst(rowsOf(w.gi)).sort((a, b) => rank(a) - rank(b) || a[1] - b[1]));
    const out = [];
    for (let k = 0; out.length < 30 && lists.some(l => l.length > k); k++) lists.forEach(l => { if (l[k] && out.length < 30) out.push(l[k]); });
    return out;
  }

  // ---------- one question at a time
  let RUN = null;   // {title, rows, i, hint, sol, ms, from, res: {question number: 'got' | 'not'}}
  let SKIP_HASH = false;   // start() draws the page itself: the hashchange it causes must not draw it a second time
  function start(title, rows, from) { RUN = { title, rows, i: 0, hint: 0, sol: false, ms: false, from, res: {} }; if (location.hash !== '#/questions') { SKIP_HASH = true; location.hash = '#/questions'; } draw(); }
  const PADS = {};   // drawings, kept while the page is open: {question id: [strokes]}
  function runHTML() {
    const R = RUN, r = R.rows[R.i];
    if (!r) {
      const marks = Object.values(R.res), got = marks.filter(x => x === 'got').length, not = marks.filter(x => x === 'not').length;
      return `<div class="card"><h2 style="margin-top:0">🎉 Finished: ${esc(R.title)}</h2><p>You got <b>${got}</b> of ${marks.length}${not ? `. <b>${not}</b> marked “Not yet” will come back tomorrow in <b>Try again</b> on the home page` : ''}.</p>
        <div class="row"><button class="btn ghost" type="button" data-l="prev">← Back</button><button class="btn" type="button" data-l="again">Do them again</button><button class="btn ghost" type="button" data-l="back">${R.from === 'home' ? '← Home' : R.from === 'weak' ? '← My hard topics' : '← Back to the topic'}</button></div></div>`;
    }
    const steps = SOL()[r[9]] || [], P_ = P(), checked = R.ms || R.sol;
    const hints = steps.length > 1 ? steps.slice(0, Math.min(R.hint, steps.length - 1)) : [];
    const moreHints = steps.length > 1 && R.hint < steps.length - 1 && !R.sol;
    const help = [
      moreHints && !R.ms ? `<button class="btn ghost" type="button" data-l="hint">🤔 I'm stuck: ${R.hint ? 'another hint' : 'give me a hint'}</button>` : '',
      (steps.length || maLink(r)) && !R.sol && !R.ms ? `<button class="btn ghost" type="button" data-l="sol">📝 I don't know: show me how</button>` : '',
      !R.ms && r[10] & 2 ? `<button class="btn" type="button" data-l="ms">✅ I've finished: check my answer</button>` : '',
      !R.ms && !(r[10] & 2) && steps.length && !R.sol ? `<button class="btn" type="button" data-l="sol">✅ I've finished: check my answer</button>` : '',
      (VID()[groupOfSub(r[0])] || [])[0] ? `<a class="btn small ghost" href="${esc(VID()[groupOfSub(r[0])][0][2])}" target="_blank" rel="noopener">🎬 Watch a video</a>` : '',
    ].join('');
    return `<div class="card lcard"><div class="row" style="margin-top:0"><button class="btn small ghost" type="button" data-l="back">← ${R.from === 'home' ? 'Home' : R.from === 'weak' ? 'Hard topics' : 'Topic'}</button><b>${esc(R.title)}</b><span class="spacer"></span><span class="pill">Question ${R.i + 1} of ${R.rows.length}</span><span class="pill grey">${BAND[r[1]]}${r[6] ? ` · ${r[6]} marks` : ''}</span></div>
      <p class="small muted" style="margin:8px 0 4px">${esc(P_.subs[r[0]][1])}${state(r[9]) ? ` · last time: ${state(r[9]) === 'got' ? '✓ got it' : '✗ not yet'}` : ''}</p>
      <img class="lq" src="pp/q/${r[9]}.webp" alt="Exam question">
      <div class="work"><div class="row" style="margin:0 0 6px"><b>✍️ My working</b><span class="spacer"></span>
        <button class="btn small ghost" type="button" data-pad="pen" aria-pressed="true">✏️ Pen</button><button class="btn small ghost" type="button" data-pad="rub" aria-pressed="false">🧽 Rubber</button><button class="btn small ghost" type="button" data-pad="undo">↶ Undo</button><button class="btn small ghost" type="button" data-pad="clear">Clear</button></div>
        <canvas class="pad" data-id="${r[9]}" aria-label="Working space: draw or write with your finger, pen or mouse"></canvas>
        <label class="wkans"><b>My answer</b> <input type="text" data-ans="${r[9]}" value="${esc(ANS[r[9]] || '')}" placeholder="Write your final answer" autocomplete="off"></label>
        <p class="small muted" style="margin:6px 0 0">Work it out here or on paper. The help below stays hidden until you ask for it.</p></div>
      ${help ? `<div class="row">${help}</div>` : ''}
      ${hints.length && !R.sol ? `<div class="lhint">${hints.map((h, k) => `<p><b>💡 Hint ${k + 1}:</b> ${esc(h)}</p>`).join('')}<p class="small muted">Hints are the first steps of the worked solution ${solMeta(r[9])}.</p></div>` : ''}
      ${R.ms ? `<p class="small" style="margin:12px 0 0"><b>✅ The official mark scheme</b> <span class="muted">· compare it with your answer</span></p><img class="lq" src="pp/ms/${r[9]}.webp" alt="Mark scheme">` : ''}
      ${R.sol && maLink(r) ? maHTML(r) + (steps.length ? (R.ai ? '' : `<div class="row"><button class="btn small ghost" type="button" data-l="ai">📝 Show the AI-written steps too</button></div>`) : '') : ''}
      ${R.sol && (!maLink(r) || R.ai) && steps.length ? `<div class="sol"><b>📝 Step-by-step solution</b> <span class="meta">${solMeta(r[9])}</span><ol>${steps.map(x => `<li>${esc(x)}</li>`).join('')}</ol></div>` : ''}
      ${R.ms && (steps.length || maLink(r)) && !R.sol ? `<div class="row"><button class="btn small ghost" type="button" data-l="sol">${maLink(r) ? '✅ See the model answer' : '📝 See the step-by-step solution'}</button></div>` : ''}
      ${!steps.length && !(r[10] & 2) ? '<p class="small muted">No mark scheme or solution for this one yet.</p>' : !steps.length && !R.ms && !maLink(r) ? '<p class="small muted">No step-by-step solution for this one yet: check with the mark scheme.</p>' : ''}
      ${R.why ? whyHTML() : checked || (!steps.length && !(r[10] & 2)) ? `<div class="row lmark"><span class="small"><b>How did you do?</b></span><button class="btn" type="button" data-l="got">✓ Got it</button><button class="btn ghost" type="button" data-l="not">✗ Not yet</button></div>` : ''}
      <div class="row lnav">${R.i ? '<button class="btn small ghost" type="button" data-l="prev">← Back</button>' : ''}<span class="spacer"></span><button class="btn small ghost" type="button" data-l="skip">${R.res[R.i] ? 'Next →' : 'Skip →'}</button></div></div>`;
  }


  // ---------- 🔍 why did I get it wrong? After ✗ Not yet the student picks a reason; Home shows the pattern and a tip (user, 2026-10-18)
  const WHY = {
    method: ['🤷', "I didn't know how to do it", "Use 🤔 I'm stuck for one hint at a time, then do a similar question straight away in Learn a topic."],
    slip: ['✏️', 'I knew how, but made a slip', 'Write every step in the working space, and check your answer against the question before you finish.'],
    read: ['👀', 'I misread the question', 'Underline what the question asks for (and the units) before you start.'],
  };
  function whyHTML() {
    return `<div class="lwhy"><p style="margin:0 0 6px"><b>What went wrong?</b> <span class="small muted">Knowing why helps you fix it.</span></p><div class="row" style="margin-top:0">${Object.entries(WHY).map(([k, [ic, t]]) => `<button class="btn ghost" type="button" data-l="why" data-w="${k}">${ic} ${esc(t)}</button>`).join('')}<button class="btn small ghost" type="button" data-l="why" data-w="">Skip</button></div></div>`;
  }
  function mistakesHTML() {
    const since = Date.now() - 30 * 864e5, list = Object.values(PROG).filter(x => x.s === 'not' && x.why && x.t > since);
    if (list.length < 3) return '';
    const n = k => list.filter(x => x.why === k).length, top = Object.keys(WHY).sort((a, b) => n(b) - n(a))[0];
    return `<div class="card" style="margin-top:14px"><b>🔍 Why my answers go wrong</b> <span class="small muted">(last 30 days)</span>
      ${Object.entries(WHY).map(([k, [ic, t]]) => `<div class="prow"><span>${ic} ${esc(t)}</span>${bar(n(k), list.length)}<span class="small muted">${n(k)}</span></div>`).join('')}
      <p style="margin:10px 0 0"><b>Tip:</b> ${esc(WHY[top][2])}</p></div>`;
  }

  // ---------- the drawing pad (squared paper; finger, pen or mouse). Strokes are stored as fractions of the width, so they survive a redraw.
  let TOOL = 'pen';
  function setupPad() {
    const c = document.querySelector('canvas.pad'); if (!c) return;
    const id = c.dataset.id, strokes = PADS[id] || (PADS[id] = []);
    const W = c.clientWidth, H = Math.round(Math.min(360, Math.max(260, W * 0.45))), dpr = window.devicePixelRatio || 1;
    c.style.height = H + 'px'; c.width = W * dpr; c.height = H * dpr;
    const g = c.getContext('2d'); g.scale(dpr, dpr); g.lineCap = g.lineJoin = 'round';
    const paint = s => { g.globalCompositeOperation = s.rub ? 'destination-out' : 'source-over'; g.strokeStyle = '#1B2333'; g.lineWidth = s.rub ? 22 : 2.6; g.beginPath(); s.p.forEach(([x, y], k) => k ? g.lineTo(x * W, y * W) : g.moveTo(x * W, y * W)); if (s.p.length === 1) g.lineTo(s.p[0][0] * W + 0.1, s.p[0][1] * W); g.stroke(); };
    const all = () => { g.clearRect(0, 0, W, H); strokes.forEach(paint); };
    all();
    let cur = null;
    const pt = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) / W, (e.clientY - b.top) / W]; };
    c.onpointerdown = e => { e.preventDefault(); c.setPointerCapture(e.pointerId); cur = { rub: TOOL === 'rub', p: [pt(e)] }; strokes.push(cur); paint(cur); };
    c.onpointermove = e => { if (!cur) return; e.preventDefault(); cur.p.push(pt(e)); g.globalCompositeOperation = cur.rub ? 'destination-out' : 'source-over'; g.lineWidth = cur.rub ? 22 : 2.6; const n = cur.p.length; g.beginPath(); g.moveTo(cur.p[n - 2][0] * W, cur.p[n - 2][1] * W); g.lineTo(cur.p[n - 1][0] * W, cur.p[n - 1][1] * W); g.stroke(); };
    c.onpointerup = c.onpointercancel = () => { cur = null; };
    c.redraw = all;
    document.querySelectorAll('[data-pad="pen"],[data-pad="rub"]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.pad === TOOL)));
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pad]'); if (!b) return;
    const c = document.querySelector('canvas.pad'); if (!c) return;
    const strokes = PADS[c.dataset.id] || [];
    if (b.dataset.pad === 'pen' || b.dataset.pad === 'rub') { TOOL = b.dataset.pad; document.querySelectorAll('[data-pad="pen"],[data-pad="rub"]').forEach(x => x.setAttribute('aria-pressed', String(x.dataset.pad === TOOL))); }
    else if (b.dataset.pad === 'undo') { strokes.pop(); c.redraw && c.redraw(); }
    else if (b.dataset.pad === 'clear') { strokes.length = 0; c.redraw && c.redraw(); }
  });
  document.addEventListener('input', e => {
    const a = e.target.closest('[data-ans]'); if (!a) return;
    ANS[a.dataset.ans] = a.value.slice(0, 300); if (!a.value) delete ANS[a.dataset.ans];
    const keys = Object.keys(ANS); if (keys.length > 300) delete ANS[keys[0]];
    put(AKEY, ANS);
  });

  // ---------- topic picker and topic page
  let TOPIC = null;
  function weakHTML() {
    const w = weakList(), G = P().groups;
    return `<div class="card weak"><h2 style="margin:0 0 4px">🩹 Topics I find hard</h2>
      ${w.length ? `<p class="small muted" style="margin:0 0 8px">Practise them mixed together: questions you got wrong come first, then the easiest new ones.</p>
        <div class="row" style="margin:0 0 10px">${w.map(x => `<span class="wchip"><a href="#/questions" data-l="topic" data-g="${x.gi}">${esc(G[x.gi][1])}</a>${x.auto ? ' <span class="small muted">(from your “Not yet” answers)</span>' : `<button type="button" data-l="unweak" data-g="${x.gi}" aria-label="Remove ${esc(G[x.gi][1])}">✕</button>`}</span>`).join('')}</div>
        <button class="btn" type="button" data-l="weakgo">▶ Practise my hard topics</button>`
      : `<p class="small muted" style="margin:0">Open any topic below and press <b>☆ I find this hard</b>. Topics where you press “Not yet” twice are added here by themselves.</p>`}</div>`;
  }
  function pickerHTML() {
    const G = P().groups, A = assess.all ? [] : focusGis();
    const btn = gi => { const s = stats(rowsOf(gi)); return `<button class="tbtn" type="button" data-l="topic" data-g="${gi}"><b>${WEAK[G[gi][1]] ? '🩹 ' : ''}${esc(G[gi][1])}</b><span class="small muted">${s.got} of ${s.n} done</span>${bar(s.got, s.n)}</button>`; };
    return `${weakHTML()}${A.length ? `<h2>🎯 ${esc(assess.name || 'Assessment')} topics</h2><div class="tgrid">${A.map(btn).join('')}</div>` : ''}
      ${P().chapters.map(([tp, name]) => `<details${A.length ? '' : ' open'}><summary><b>${esc(name)}</b></summary><div class="tgrid">${G.map((g, i) => g[0] === tp ? btn(i) : '').join('')}</div></details>`).join('')}`;
  }
  function topicHTML(gi) {
    const g = P().groups[gi], rows = rowsOf(gi), s = stats(rows), withSol = rows.filter(r => SOL()[r[9]]).length, weak = !!WEAK[g[1]];
    const by = BAND.map((b, k) => [b, rows.filter(r => r[1] === k)]).filter(x => x[1].length);
    return `<div class="card"><div class="row" style="margin-top:0"><button class="btn small ghost" type="button" data-l="topics">← All topics</button><span class="spacer"></span><button class="btn small ${weak ? '' : 'ghost'}" type="button" data-l="${weak ? 'unweak' : 'weak'}" data-g="${gi}" aria-pressed="${weak}">${weak ? '🩹 In my hard topics ✕' : '☆ I find this hard'}</button></div>
      <h2 style="margin:10px 0 4px">${esc(g[1])}</h2><p class="small muted" style="margin:0">${s.n} real exam questions · ${withSol} with step-by-step solutions · you have done ${s.got}</p>${bar(s.got, s.n)}
      ${(VID()[g[1]] || []).length ? `<div class="vids"><b>🎬 Learn it first</b> <span class="small muted">free short videos from Corbettmaths (opens their site)</span><ul>${VID()[g[1]].map(v => `<li>${vidLink(v)}</li>`).join('')}</ul></div>` : ''}
      <div class="row"><button class="btn" type="button" data-l="ladder" data-g="${gi}">▶ Practise: easiest first</button>${s.not ? `<button class="btn ghost" type="button" data-l="redo" data-g="${gi}">🔁 Only my “Not yet” (${s.not})</button>` : ''}</div>
      <p class="small muted">Or start at a level:</p><div class="row" style="margin-top:0">${by.map(([b, rs]) => `<button class="btn small ghost" type="button" data-l="level" data-g="${gi}" data-b="${BAND.indexOf(b)}">${b} (${rs.length})</button>`).join('')}</div>
      <p class="small" style="margin-top:12px"><a href="#" data-l="ppopen" data-g="${gi}">👁️ Open this topic as one paper</a> · <a href="#" data-l="print" data-g="${gi}">🖨 Print it</a> <span class="muted">(up to 100 questions, with mark schemes)</span></p></div>`;
  }
  function draw() {
    const box = $('learn'); if (!box) return;
    if (!P()) { box.innerHTML = '<p class="muted">Loading the questions…</p>'; T() && T().ppLoad(draw); return; }
    box.innerHTML = RUN ? runHTML() : TOPIC !== null ? topicHTML(TOPIC) : pickerHTML();
    if (RUN) setupPad();
    drawHome();
  }
  // for ✏️ My test paper → 📝 Mark my test: record results and add hard topics through here, so nothing overwrites anything
  window.Y8M_LEARN = {
    mark: (id, st) => { PROG[id] = { s: st, t: Date.now(), d: today() }; save(); drawHome(); },
    addWeak: name => { WEAK[name] = 1; put(WKEY, WEAK); drawHome(); }
  };
  window.addEventListener('resize', () => { const c = document.querySelector('canvas.pad'); if (c && c.clientWidth * (window.devicePixelRatio || 1) !== c.width) setupPad(); });

  // ---------- home: today's 5, try again, hard topics, progress
  function todays5() {
    const gis = focusGis();
    const pool = gis.flatMap(rowsOf).filter(r => r[1] <= 1).sort((a, b) => a[9] < b[9] ? -1 : 1);
    const rnd = seeded(today()), pick = [], used = new Set();
    const sol = pool.filter(r => SOL()[r[9]]), src = !assess.all && sol.length >= 5 ? sol : pool;   // all topics: any easy or medium question
    while (pick.length < 5 && used.size < src.length) { const r = src[Math.floor(rnd() * src.length)]; if (!used.has(r[9])) { used.add(r[9]); pick.push(r); } }
    return pick.sort((a, b) => a[1] - b[1]);
  }
  function tryAgain() {
    const P_ = P(), byId = new Map(P_.q.map(r => [r[9], r])), now = Date.now();
    return Object.entries(PROG).filter(([id, v]) => v.s === 'not' && now - v.t > 18 * 3600e3 && byId.has(id)).map(([id]) => byId.get(id));
  }
  // Home is redrawn only when it is on screen; changes made elsewhere mark it to be redrawn when the student goes back to it
  // (drawing it behind every question was most of the delay when a question opened)
  let HOME_DIRTY = true;
  const homeShown = () => !/^#\/\w/.test(location.hash);   // '' or '#/' is Home
  function drawHome() {
    const box = $('today'); if (!box || !P()) return;
    if (!homeShown()) { HOME_DIRTY = true; return; }
    HOME_DIRTY = false;
    const t5 = todays5(), done5 = t5.filter(r => (PROG[r[9]] || {}).d === today()).length, again = tryAgain(), weak = weakList();
    const gis = focusGis();
    box.innerHTML = `<div class="homegrid">
      <div class="hcard"><span class="hic">☀️</span><b>Today's 5</b><span class="small muted">Five real exam questions ${assess.all ? 'from all topics' : `on your ${esc(assess.name || 'assessment')} topics`}. A new set every day.</span>${bar(done5, 5)}<span class="small">${done5} of 5 done today</span><button class="btn" type="button" data-l="t5">${done5 ? 'Carry on' : 'Start'}</button></div>
      <div class="hcard"><span class="hic">🩹</span><b>Topics I find hard</b><span class="small muted">Practise the topics you struggle with. Space to work it out, and help only when you ask for it.</span><span class="small"><b>${weak.length}</b> topic${weak.length === 1 ? '' : 's'}</span>${weak.length ? '<button class="btn" type="button" data-l="weakgo">Practise them</button>' : '<a class="btn ghost" href="#/questions">Choose my hard topics</a>'}</div>
      <div class="hcard"><span class="hic">🔁</span><b>Try again</b><span class="small muted">Questions you marked “Not yet” come back here the next day, until you get them.</span><span class="small"><b>${again.length}</b> waiting</span>${again.length ? `<button class="btn" type="button" data-l="again2">Try them now</button>` : '<span class="small muted">Nothing waiting. 👍</span>'}</div>
    </div>
    ${assess.all ? `<div class="card" style="margin-top:14px"><b>📈 My progress by chapter</b>${P().chapters.map(([tp, name]) => { const rows = P().groups.map((g, i) => g[0] === tp ? rowsOf(i) : []).flat(), s = stats(rows); return `<div class="prow"><a href="#/questions">${esc(name)}</a>${bar(s.got, s.n)}<span class="small muted">${s.got}/${s.n}</span></div>`; }).join('')}<p class="small muted" style="margin:8px 0 0">Saved on this device.</p></div>` : ''}
    ${!assess.all && gis.length ? `<div class="card" style="margin-top:14px"><b>📈 My ${esc(assess.name || 'assessment')} progress</b>${gis.map(gi => { const s = stats(rowsOf(gi)); return `<div class="prow"><a href="#/questions" data-l="topic" data-g="${gi}">${esc(P().groups[gi][1])}</a>${bar(s.got, s.n)}<span class="small muted">${s.got}/${s.n}</span></div>`; }).join('')}<p class="small muted" style="margin:8px 0 0">Saved on this device.</p></div>` : ''}
    ${mistakesHTML()}`;
  }

  // ---------- clicks
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-l]'); if (!el) return;
    const a = el.dataset.l, gi = el.dataset.g !== undefined ? +el.dataset.g : null;
    if (a === 'print') { e.preventDefault(); const rows = easyFirst(rowsOf(gi)).slice(0, 100); T().printSheet(T().sheetHTML(rows, P().groups[gi][1], true, true)); return; }
    // 👁️ see the paper on screen first (user 2026-10-19: "for any printable make it available for open or viewing also")
    if (a === 'ppopen') { e.preventDefault(); const rows = easyFirst(rowsOf(gi)).slice(0, 100), v = document.createElement('div'); v.id = 'ppview';
      v.style.cssText = 'position:fixed;inset:0;z-index:1500;overflow:auto;background:var(--bg,#fff)';
      v.innerHTML = `<div style="position:sticky;top:0;z-index:1;display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 12px;background:var(--card,#fff);border-bottom:1px solid var(--line,#ddd)"><b style="flex:1;min-width:140px">${esc(P().groups[gi][1])}: one paper</b><button class="btn small" type="button" data-l="print" data-g="${gi}">🖨 Print</button><button class="btn small ghost" type="button" data-l="ppclose">Close ✕</button></div>
        <style>#ppview img{max-width:100%!important;height:auto!important}#ppview{overflow-x:hidden}</style><div style="max-width:820px;margin:0 auto;padding:12px">${T().sheetHTML(rows, P().groups[gi][1], true, true)}</div>`;
      document.getElementById('ppview')?.remove(); document.body.appendChild(v); return; }
    if (a === 'ppclose') { e.preventDefault(); document.getElementById('ppview')?.remove(); return; }
    if (a === 'topic') { e.preventDefault(); RUN = null; TOPIC = gi; if (location.hash !== '#/questions') location.hash = '#/questions'; }
    else if (a === 'topics') { TOPIC = null; }
    else if (a === 'weak' || a === 'unweak') { const n = P().groups[gi][1]; if (a === 'weak') WEAK[n] = 1; else delete WEAK[n]; put(WKEY, WEAK); }
    else if (a === 'weakgo') { const rows = weakRows(); if (rows.length) start('My hard topics', rows, location.hash === '#/questions' ? 'weak' : 'home'); return; }
    else if (a === 'ladder') { start(P().groups[gi][1], easyFirst(rowsOf(gi)), 'topic'); return; }
    else if (a === 'level') { const b = +el.dataset.b; start(`${P().groups[gi][1]} · ${BAND[b]}`, easyFirst(rowsOf(gi)).filter(r => r[1] >= b), 'topic'); return; }
    else if (a === 'redo') { start(`${P().groups[gi][1]} · Not yet`, easyFirst(rowsOf(gi)).filter(r => state(r[9]) === 'not'), 'topic'); return; }
    else if (a === 't5') { const t5 = todays5(); start("Today's 5", t5.filter(r => (PROG[r[9]] || {}).d !== today()).concat(t5.filter(r => (PROG[r[9]] || {}).d === today())), 'home'); return; }
    else if (a === 'again2') { start('Try again', tryAgain(), 'home'); return; }
    else if (a === 'hint') { RUN.hint++; }
    else if (a === 'sol') { RUN.sol = true; }
    else if (a === 'ai') { RUN.ai = true; }
    else if (a === 'ms') { RUN.ms = true; }
    else if (a === 'not' && !RUN.why) { RUN.why = true; }   // ask why first
    else if (a === 'got' || a === 'not' || a === 'skip' || a === 'why') {
      const r = RUN.rows[RUN.i];
      if (a === 'why') { PROG[r[9]] = { s: 'not', t: Date.now(), d: today(), ...(el.dataset.w ? { why: el.dataset.w } : {}) }; save(); RUN.res[RUN.i] = 'not'; }
      else if (a !== 'skip') { PROG[r[9]] = { s: a, t: Date.now(), d: today() }; save(); RUN.res[RUN.i] = a; }
      RUN.i++; RUN.hint = 0; RUN.sol = false; RUN.ai = false; RUN.ms = false; RUN.why = false;
    }
    else if (a === 'again') { RUN.i = 0; RUN.res = {}; }
    else if (a === 'prev') { RUN.i = Math.max(0, RUN.i - 1); RUN.hint = 0; RUN.sol = false; RUN.ai = false; RUN.ms = false; RUN.why = false; }
    else if (a === 'back') { const from = RUN && RUN.from; RUN = null; if (from === 'home') { location.hash = '#/'; drawHome(); return; } if (from === 'weak') TOPIC = null; }
    draw();
    if (['got', 'why', 'skip', 'prev', 'topic', 'topics', 'back', 'again'].includes(a)) $('learn') && $('learn').scrollIntoView({ block: 'start' });
  });
  function deepLink() {   // #/questions/<topic name> (links from the 📅 Study plan) opens that topic
    const m = location.hash.match(/^#\/questions\/(.+)$/);
    if (m && P()) { const gi = groupIndex(decodeURIComponent(m[1])); if (gi >= 0) { RUN = null; TOPIC = gi; } }
  }
  window.addEventListener('hashchange', () => {
    if (/^#\/questions/.test(location.hash)) { if (SKIP_HASH) { SKIP_HASH = false; return; } deepLink(); draw(); }
    else if (HOME_DIRTY && homeShown()) drawHome();
  });
  const go = () => { if (!P() && /^#\/questions\//.test(location.hash)) T() && T().ppLoad(() => { deepLink(); draw(); }); deepLink(); draw(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else setTimeout(go, 0);
})();
