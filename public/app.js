(function () {
  const LEVELS = ['Very easy', 'Easy', 'Medium', 'Hard', 'Very hard'];
  const assess = window.Y8M_ASSESSMENT || { name: '', date: '', topics: [] };
  const $ = id => document.getElementById(id);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function box(group, value, text) {
    return `<label><input type="checkbox" name="${group}" value="${esc(value)}"> ${esc(text)}</label>`;
  }

  // Several assessments (topics.js): the student picks one here; Today's 5, Learn a topic and the progress panel follow it.
  const ALL = window.Y8M_ASSESSMENTS || (assess.name ? [assess] : []);
  const niceDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  function renderAssessment() {
    const date = niceDate(assess.date);
    const opts = [window.Y8M_ALL_TOPICS, ...ALL].filter(Boolean);
    const pick = opts.length > 1 ? `<div class="assesspick" role="group" aria-label="What to practise"><span class="small"><b>Focus:</b></span>${opts.map(a => a.locked ? `<button type="button" class="chip" disabled title="Not taught yet" style="opacity:.6">🔒 ${esc(a.name)} · opens ${esc(niceDate(a.opens))}</button>` : `<button type="button" class="chip" data-pickassess="${esc(a.id)}" aria-pressed="${a === assess}">${a.all ? '🌍 ' : '🎯 '}${esc(a.name)}${a.date ? ' · ' + esc(niceDate(a.date).replace(/ \d{4}$/, '')) : ''}</button>`).join('')}</div>` : '';
    $('assess').innerHTML = assess.all
      ? `${pick}<b>🌍 All topics</b><p style="margin:6px 0">Practise anything from the course: Today's 5, Learn a topic and your progress use every topic.</p><a href="#/worksheet">✏️ Make my test paper</a>: tick the topics you want, or Select all.`
      : assess.name
      ? `${pick}<b>${esc(assess.name)}${date ? ' · ' + esc(date) : ''}</b>${assess.list ? `<ul style="margin:6px 0 6px 18px;padding:0">${assess.list.map(x => `<li>${esc(x)}</li>`).join('')}</ul><span class="small muted">${esc(assess.from || "From the school's Year 8 scheme of work.")}</span><br>` : '<br>'}<a href="#/worksheet">✏️ Make my test paper</a>: press <b>${esc(assess.name)} topics</b> there to tick all of these at once.`
      : 'No assessment set yet.';
    const btns = $('assessbtns');
    if (btns) btns.innerHTML = ALL.filter(a => !a.locked).map(a => `<button class="btn ghost small" type="button" data-all="assess" data-a="${esc(a.id)}">${esc(a.name)} topics</button>`).join('');
  }

  function checked(name) {
    return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(i => i.value);
  }

  // ✏️ Worksheets: real past-paper questions (pictures cut from the official papers), chosen by topic, difficulty and tier,
  // with the official mark schemes and worked solutions at the end. Same topics and difficulty levels as 📚 Learn a topic (learn.js).
  const groupSubs = (P, gs) => new Set(gs.flatMap(g => P.groups[+g][2]));
  function wsPool() {
    const P = window.Y8M_PP; if (!P) return [];
    const subs = groupSubs(P, checked('topic')), ls = checked('level').map(Number), tier = $('tier').value;
    return P.q.filter(r => (r[10] & PIC_Q) && subs.has(r[0]) && ls.includes(r[1]) && (tier === 'ALL' || tierOf(r[4]) === tier) && !r[11]);
  }

  function update() {
    if (!window.Y8M_PP) { $('avail').textContent = 'loading…'; return; }
    const n = wsPool().length, none = !checked('topic').length || !checked('level').length;
    $('avail').textContent = none ? 'tick at least one topic and one difficulty' : `${n} question${n === 1 ? '' : 's'} to choose from`;
    $('msg').textContent = '';
    document.querySelectorAll('#topics details.tg').forEach(d => { const k = d.querySelectorAll('input:checked').length, c = d.querySelector('[data-tgc]'); if (c) c.textContent = k ? ` · ${k} ticked` : ''; });
  }

  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  let WS = null;   // the test on screen: { pick, parts, view: 'q' | 'ms' | 'mark', name, marks: {question number: marks got}, made }
  // The last test is kept on this device (question ids and the marks entered), so it can be marked days later (user, 2026-10-18).
  const LKEY = 'y8m-lasttest';
  const lastTest = () => { try { return JSON.parse(localStorage.getItem(LKEY)); } catch (e) { return null; } };
  const keepTest = () => { try { localStorage.setItem(LKEY, JSON.stringify({ ids: WS.pick.map(r => r[9]), marks: WS.marks, made: WS.made, name: WS.name, f: WS.formula })); } catch (e) {} };
  function makeWorksheet() {
    ppLoad(() => {
      const pool = wsPool(), want = Math.min(Math.max(parseInt($('count').value, 10) || 10, 1), PP_ALL);
      if (!pool.length) { $('msg').textContent = 'Choose at least one topic and one difficulty first.'; return; }
      const pick = shuffle(pool).slice(0, want).sort((a, b) => a[1] - b[1] || a[0] - b[0]);
      const formula = $('formula').checked;
      WS = { pick, formula, parts: sheetParts(pick, 'my test paper', true, formula), view: 'q', name: 'igcse-edexcel-maths-test-' + new Date().toISOString().slice(0, 10), marks: {}, made: Date.now() };
      keepTest(); drawSheet();
      $('sheet').scrollIntoView({ behavior: 'smooth', block: 'start' });
      $('msg').textContent = `Your test paper is ready below: ${pick.length} question${pick.length === 1 ? '' : 's'}.`;
    });
  }
  function openLastTest() {
    ppLoad(() => {
      const L = lastTest(); if (!L) return;
      const byId = new Map(window.Y8M_PP.q.map(r => [r[9], r])), pick = L.ids.map(id => byId.get(id)).filter(Boolean);
      const formula = L.f !== undefined ? L.f : true;   // tests kept before 23 Oct 2026 had the sheet
      WS = { pick, formula, parts: sheetParts(pick, 'my test paper', true, formula), view: 'mark', name: L.name, marks: L.marks || {}, made: L.made };
      drawSheet(); $('sheet').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
  function lastTestNote() {   // on the test page: "📝 Mark my last test paper"
    const L = lastTest(), box = $('lasttest'); if (!box) return;
    box.innerHTML = L && !WS ? `<div class="card note" style="margin:12px 0 0"><b>📝 Did your last test on paper?</b> <span class="small">(${L.ids.length} questions, made ${new Date(L.made).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})</span><div class="row"><button class="btn small" type="button" data-ws="marklast">Mark my last test paper</button></div></div>` : '';
  }
  const groupOf = sub => (window.Y8M_PP.groups.find(g => g[2].includes(sub)) || [, 'Other'])[1];
  function markHTML() {
    const P = window.Y8M_PP, done = WS.pick.filter((r, i) => WS.marks[i] != null).length;
    const rows = WS.pick.map((r, i) => { const max = r[6] || 1, v = WS.marks[i];
      return `<div class="mk"><div class="row" style="margin:0"><b>Question ${i + 1}</b><span class="small muted">${esc(P.subs[r[0]][1])} · ${max} mark${max === 1 ? '' : 's'}</span><span class="spacer"></span>
        <label class="small">Marks I got <select data-mk="${i}"><option value="">–</option>${Array.from({ length: max + 1 }, (_, k) => `<option value="${k}"${v === k ? ' selected' : ''}>${k}</option>`).join('')}</select> / ${max}</label>
        <button class="btn small ghost" type="button" data-ws="mkms" data-i="${i}">${r[10] & 2 ? '✅ Mark scheme' : '📄 Question'}</button></div><div class="mkms" id="mkms${i}"></div></div>`; }).join('');
    return `<h2 style="margin-top:0">📝 Mark my test</h2><p class="small muted">Do the test on paper first. Then, for each question, compare your answer with the mark scheme and choose the marks you got. Be honest: it's only for you. (<span id="mkcount">${done}</span> of ${WS.pick.length} marked)</p>
      ${rows}<div class="row"><button class="btn" type="button" data-ws="mkdone">✅ See my results</button></div><div id="mkres">${WS.showRes ? resultsHTML() : ''}</div>`;
  }
  function resultsHTML() {
    const P = window.Y8M_PP, got = {}, max = {}; let g = 0, m = 0;
    WS.pick.forEach((r, i) => { const t = groupOf(r[0]), mx = r[6] || 1, v = WS.marks[i] || 0; got[t] = (got[t] || 0) + v; max[t] = (max[t] || 0) + mx; g += v; m += mx; });
    const pct = m ? Math.round(100 * g / m) : 0, topics = Object.keys(max).sort((a, b) => got[a] / max[a] - got[b] / max[b]);
    const next = topics.filter(t => got[t] / max[t] < 0.5);
    return `<div class="card" style="margin-top:14px"><h3 style="margin-top:0">Your score: ${g} / ${m} (${pct}%)</h3>
      ${topics.map(t => `<div class="prow"><span>${esc(t)}</span><span class="lbar"><span style="width:${Math.round(100 * got[t] / max[t])}%"></span></span><span class="small muted">${got[t]}/${max[t]}</span></div>`).join('')}
      ${next.length ? `<p style="margin:12px 0 6px"><b>📌 Revise next:</b> ${next.map(esc).join(', ')}</p><div class="row" style="margin-top:0"><button class="btn" type="button" data-ws="mkweak">🩹 Add them to my hard topics</button><a class="btn ghost" href="#/questions/${encodeURIComponent(next[0])}">📚 Practise ${esc(next[0])}</a></div>`
        : '<p style="margin:12px 0 0">🎉 Well done: you got at least half the marks on every topic. Try a harder test next time.</p>'}
      <p class="small muted" style="margin:10px 0 0">Questions with full marks count as “Got it”; the others come back in <b>Try again</b> on Home.</p></div>`;
  }
  function drawSheet(note) {
    lastTestNote();
    if (!WS) { $('sheet').innerHTML = ''; return; }
    const v = WS.view, q = v === 'q', mk = v === 'mark', what = q ? 'question paper' : v === 'sol' ? 'worked solutions' : 'mark scheme';
    $('sheet').innerHTML = `<div class="sheet"><div class="noprint wsbar">
      <div class="wstabs" role="tablist"><button type="button" role="tab" aria-selected="${q}" data-ws="view" data-v="q">📄 Question paper</button><button type="button" role="tab" aria-selected="${v === 'ms'}" data-ws="view" data-v="ms">✅ Mark scheme</button><button type="button" role="tab" aria-selected="${v === 'sol'}" data-ws="view" data-v="sol">📒 Worked solutions</button><button type="button" role="tab" aria-selected="${mk}" data-ws="view" data-v="mark">📝 Mark my test</button></div>
      ${mk ? `<div class="row" style="margin-top:10px"><button class="btn ghost" type="button" data-ws="close">Close</button></div>` : `<div class="row" style="margin-top:10px"><button class="btn" type="button" data-ws="print">🖨 Print the ${what}</button><button class="btn ghost" type="button" data-ws="pdf">⬇ Download the ${what} (PDF)</button><button class="btn ghost" type="button" data-ws="close">Close</button></div>`}
      <p class="small muted" id="wsnote" style="margin:8px 0 0">${note || (q ? 'Below is a preview of the question paper. The mark scheme and the worked solutions are on the other tabs, so you can print each one separately. After doing the test, use 📝 Mark my test.' : mk ? 'Your marks are saved on this device, so you can finish marking later.' : v === 'sol' ? 'Below is a preview of the step-by-step worked solutions, in the same order as the questions.' : 'Below is a preview of the official mark scheme. The step-by-step solutions are on the 📒 Worked solutions tab.')}</p></div>
      <div class="wsview">${mk ? markHTML() : (q ? WS.parts.paper : v === 'sol' ? WS.parts.sol : WS.parts.mark).replace(/<img /g, '<img loading="lazy" ')}</div></div>`;
  }
  async function downloadSheet(btn) {
    const v = WS.view, note = $('wsnote'), file = `${WS.name}${v === 'q' ? '' : v === 'sol' ? '-worked-solutions' : '-mark-scheme'}.pdf`;
    btn.disabled = true;
    try {
      await window.Y8M_PDF.save(v === 'q' ? WS.parts.paperBlocks : v === 'sol' ? WS.parts.solBlocks : WS.parts.markBlocks, file, f => { if (note) note.textContent = `Making the PDF… ${Math.round(f * 100)}%`; });
      if (note) note.textContent = `✓ Saved as ${file} (look in your Downloads).`;
    } catch (e) { if (note) note.textContent = 'The PDF could not be made on this device. Use 🖨 Print and choose "Save as PDF" instead.'; }
    btn.disabled = false;
  }

  // Topic checkboxes grouped under the six chapter headings (pp.js groups, made by papers-work/pp_groups.py).
  function groupBoxes(name) {
    const P = window.Y8M_PP;
    return P.chapters.map(([tp, cname]) => {
      const gs = P.groups.map((g, i) => [g, i]).filter(([g]) => g[0] === tp);
      // a folded group per chapter (23 Oct 2026: 63 topic boxes put the button 6 phone screens down)
      return gs.length ? `<details class="tg"><summary class="gh">${esc(cname)} <span class="small muted" style="font-weight:600">(${gs.length} topic${gs.length === 1 ? '' : 's'}<span data-tgc></span>)</span></summary><div class="checks">${gs.map(([g, i]) => box(name, String(i), g[1])).join('')}</div></details>` : '';
    }).join('');
  }

  // Real exam questions by topic: the classified's sorting. Each question has a picture cut from the official paper and one of
  // its mark scheme (pp/q, pp/ms, © Pearson). pp.js loads on first use.
  // pp.js rows: [subtopic, band, spec, series, paper, question, marks, paper link, mark-scheme link, id, pictures (1 question, 2 mark scheme)]
  const PP_BAND = ['Easy', 'Medium', 'Hard', 'Very hard'];
  const tierOf = p => /F/.test(p) ? 'F' : 'H';
  const MON = { '01': 'January', '03': 'March', '05': 'May', '06': 'June', '10': 'October', '11': 'November' };
  const seriesName = s => { const m = /^(\d{4})-(\d{2})$/.exec(s); return m ? `${MON[m[2]] || m[2]} ${m[1]}` : ({ spec: 'Specimen', sams: 'Sample paper', unseen: 'Practice paper' }[s] || s); };
  let ppWait = null;
  const ppNote = t => { const m = $('ppmsg'); if (m) m.textContent = t; };
  function ppLoad(then) {   // pp.js, then the worked solutions; everyone waiting is called once both have loaded
    if (window.Y8M_PP && !ppWait) { then(); return; }
    if (ppWait) { ppWait.push(then); return; }
    ppWait = [then]; ppNote('Loading the questions…');
    const s = document.createElement('script');
    s.src = 'pp.js?v=15';
    s.onload = () => {   // the worked solutions come next; the questions work without them
      const w = document.createElement('script'); w.src = 'solutions.js?v=83';
      w.onload = w.onerror = () => { ppNote(''); const q = ppWait; ppWait = null; q.forEach(f => f()); };
      document.body.appendChild(w);
    };
    s.onerror = () => { ppWait = null; ppNote('The questions did not load. Check your connection and reload the page.'); };
    document.body.appendChild(s);
  }
  const PIC_Q = 1, PIC_MS = 2, PP_ALL = 100;   // a printed test holds at most 100 questions
  const SOL = () => window.Y8M_SOL || {};
  const solMeta = id => (window.Y8M_SOL_UNCHECKED || []).includes(id) ? '(written with AI help; this paper has no official mark scheme, so it could not be checked against one)' : '(written with AI help, checked against the official mark scheme)';   // 22 Oct 2026: 4400 Nov 2005 / June 2006
  // ✅ Model answers by Physics & Maths Tutor (user, 22 Oct 2026: use them instead of the AI-written steps where they exist).
  // ma.js maps a question-paper link to PMT's model-answer PDF and each question's page. Link only: PMT's work is not copied.
  const maLink = r => { const P_ = window.Y8M_PP, m = r && r[7] >= 0 && (window.Y8M_MA || {})[P_.urls[r[7]]]; if (!m) return ''; const pg = m[1][r[5]];
    return `<a class="btn small" href="${m[0]}${pg ? '#page=' + pg : ''}" target="_blank" rel="noopener">📄 Open the model answer (Question ${r[5]}${pg ? ', page ' + pg : ''})</a>`; };
  const maUrl = r => { const m = r && r[7] >= 0 && (window.Y8M_MA || {})[window.Y8M_PP.urls[r[7]]]; if (!m) return ''; const pg = m[1][r[5]]; return m[0] + (pg ? '#page=' + pg : ''); };
  const maHTML = r => maLink(r) ? `<div class="sol"><b>✅ Model answer by a maths tutor</b> <span class="meta">(from Physics &amp; Maths Tutor; opens their PDF of the whole paper)</span><p style="margin:8px 0 0">${maLink(r)}</p></div>` : '';
  // 🎯 the mark each step earns (user, 24 Oct 2026: "can the solving show the mark at each step telling them what should they do to get
  // each mark of the question?"): Y8M_SOLMK[id][k] = [official mark-scheme code, what earns it], or 0 for a step with no mark
  const MKS = () => window.Y8M_SOLMK || {};
  const mkStep = (id, k, s) => { const m = (MKS()[id] || [])[k]; return esc(s) + (m ? ` <span class="mkp">${esc(m[0])}</span> <span class="mkw">${esc(m[1])}</span>` : ''); };
  const mkText = (id, k, s) => { const m = (MKS()[id] || [])[k]; return m ? `${s}   [${m[0]}: ${m[1]}]` : s; };
  const mkLeg = id => MKS()[id] ? '<p class="mkleg">🎯 The mark each step earns: <b>M</b> method · <b>A</b> accuracy · <b>B</b> on its own · <b>P</b> process · <b>C</b> communication</p>' : '';
  const solHTML = id => SOL()[id] ? `<div class="sol"><b>📝 Worked solution</b> <span class="meta">${solMeta(id)}</span>${mkLeg(id)}<ol>${SOL()[id].map((x, k) => `<li>${mkStep(id, k, x)}</li>`).join('')}</ol></div>` : '';
  const specLabel = s => s === 'GCSE' ? 'GCSE' : 'IGCSE ' + s;
  // A test is three documents, each to preview, print or download: the question paper, the official mark scheme (user, 2026-10-18) and the
  // worked solutions (user, 24 Oct 2026: "a printable copy of the solving like there is a printable copy of mark scheme").
  // sheetParts gives both as HTML (preview and print) and as blocks for pdf.js (⬇ Download PDF).
  // 📐 Formula sheet (user: on by default 2026-10-18; the box starts empty since 2026-10-23): the official IGCSE 4MA1 sheet. Foundation sheet when every
  // question is from a Foundation paper, otherwise the Higher sheet (it has everything on the Foundation one and more).
  function sheetParts(pick, title, withSol = true, formula = true) {
    const P = window.Y8M_PP;
    const fsrc = `pp/formula-${pick.every(r => tierOf(r[4]) === 'F') ? 'F' : 'H'}.webp`;
    const marks = pick.reduce((a, r) => a + (r[6] || 0), 0), topicsTxt = [...new Set(pick.map(r => P.subs[r[0]][1]))].join(', ');
    const levels = [0, 1, 2, 3].map(b => [PP_BAND[b], pick.filter(r => r[1] === b).length]).filter(x => x[1]).map(([b, k]) => `${b} ${k}`).join(' · ');
    const src = r => `Edexcel ${specLabel(r[2])} · ${seriesName(r[3])} · Paper ${r[4]} · Question ${r[5]}`;
    const info = `${pick.length} questions${marks ? ` · ${marks} marks` : ''}`, copy = 'Questions and mark schemes © Pearson Education Ltd, cut from the official papers.';
    const solNote = 'Worked solutions were written with AI help and checked against the official mark schemes.';
    const msMissing = r => r[8] >= 0 ? `This one is not cut out yet: see question ${r[5]} in the official mark scheme.` : 'No mark scheme was published.';
    const paper = `<h2>IGCSE Edexcel Maths: ${esc(title)}</h2><p class="meta">Name: ____________________ Date: ____________ · ${info}<br>Topics: ${esc(topicsTxt)}<br>Difficulty: ${levels}<br>${copy}</p>`
      + (formula ? `<div class="formula"><img src="${fsrc}" alt="Formulae sheet"></div><div class="page-break"></div>` : '')
      + pick.map((r, i) => `<div class="ppq"><p><b>Question ${i + 1}</b>${r[6] ? ` (${r[6]} marks)` : ''} <span class="meta">${esc(src(r))} · ${esc(P.subs[r[0]][1])} · ${PP_BAND[r[1]]}</span></p><img src="pp/q/${r[9]}.webp" alt="Question ${i + 1}"></div>`).join('');
    const mark = `<h2>IGCSE Edexcel Maths: ${esc(title)}: mark scheme</h2><p class="meta">${info} · the official mark schemes, in the same order as the questions.${withSol ? ' The step-by-step solutions are a separate document: 📒 Worked solutions.' : ''}<br>${copy}</p>`
      + pick.map((r, i) => `<div class="ppq"><p><b>Question ${i + 1}</b>${r[6] ? ` (${r[6]} marks)` : ''} <span class="meta">${esc(src(r))}</span></p>${r[10] & PIC_MS ? `<img src="pp/ms/${r[9]}.webp" alt="Mark scheme ${i + 1}">` : r[8] >= 0 ? `<p class="meta">This one is not cut out yet: see question ${r[5]} in the <a href="${esc(P.urls[r[8]])}">official mark scheme</a>.</p>` : '<p class="meta">No mark scheme was published.</p>'}</div>`).join('');
    const nSol = pick.filter(r => SOL()[r[9]] || maLink(r)).length, noSol = 'No worked solution for this one yet: use the mark scheme.';
    const solInfo = `${info} · step-by-step solutions, in the same order as the questions (${nSol} of ${pick.length} questions have one).`;
    const legLong = pick.some(r => MKS()[r[9]]) ? '🎯 Each step shows the mark it earns in the official mark scheme. M = method mark (for the right working). A = accuracy mark (for the right answer; it needs the method mark). B = a mark on its own (for a correct answer or fact). P = process mark (for a correct step in solving a problem). C = communication mark (for a clear statement or reason).' : '';
    const sol = `<h2>IGCSE Edexcel Maths: ${esc(title)}: worked solutions</h2><p class="meta">${solInfo} ${solNote}<br>${copy}</p>${legLong ? `<p class="mkleg">${legLong}</p>` : ''}`
      + pick.map((r, i) => `<div class="ppq"><p><b>Question ${i + 1}</b>${r[6] ? ` (${r[6]} marks)` : ''} <span class="meta">${esc(src(r))}</span></p>${maHTML(r)}${solHTML(r[9])}${SOL()[r[9]] || maLink(r) ? '' : `<p class="meta">${noSol}</p>`}</div>`).join('');
    const paperBlocks = [{ t: 'title', text: `IGCSE Edexcel Maths: ${title}` }, { t: 'meta', text: `Name: ______________________    Date: ______________    ${info}` }, { t: 'meta', text: `Topics: ${topicsTxt}` }, { t: 'meta', text: `Difficulty: ${levels}` }, { t: 'note', text: copy },
      ...(formula ? [{ t: 'img', src: fsrc, fit: true }, { t: 'break' }] : []),
      ...pick.flatMap((r, i) => [{ t: 'head', text: `Question ${i + 1}${r[6] ? ` (${r[6]} marks)` : ''}`, sub: `${src(r)} · ${P.subs[r[0]][1]} · ${PP_BAND[r[1]]}` }, { t: 'img', src: `pp/q/${r[9]}.webp` }])];
    const markBlocks = [{ t: 'title', text: `IGCSE Edexcel Maths: ${title}: mark scheme` }, { t: 'meta', text: `${info} · the official mark schemes, in the same order as the questions.` }, { t: 'note', text: copy },
      ...pick.flatMap((r, i) => [{ t: 'head', text: `Question ${i + 1}${r[6] ? ` (${r[6]} marks)` : ''}`, sub: src(r) },
        r[10] & PIC_MS ? { t: 'img', src: `pp/ms/${r[9]}.webp` } : { t: 'note', text: msMissing(r) }])];
    const solBlocks = [{ t: 'title', text: `IGCSE Edexcel Maths: ${title}: worked solutions` }, { t: 'meta', text: solInfo }, { t: 'note', text: solNote + ' ' + copy }, ...(legLong ? [{ t: 'note', text: legLong }] : []),
      ...pick.flatMap((r, i) => [{ t: 'head', text: `Question ${i + 1}${r[6] ? ` (${r[6]} marks)` : ''}`, sub: src(r) },
        ...(maLink(r) ? [{ t: 'note', text: 'Model answer by Physics & Maths Tutor (online): ' + maUrl(r) }] : []),
        ...(SOL()[r[9]] ? [{ t: 'steps', title: 'Worked solution ' + solMeta(r[9]), items: SOL()[r[9]].map((s, k) => mkText(r[9], k, s)) }] : maLink(r) ? [] : [{ t: 'note', text: noSol }])])];
    return { paper, mark, sol, paperBlocks, markBlocks, solBlocks };
  }
  function sheetHTML(pick, title, withMs, withSol) {   // question paper, then the mark schemes, then the worked solutions (📚 Learn a topic → print this topic)
    const x = sheetParts(pick, title, withSol);
    return x.paper + (withMs ? '<div class="page-break"></div>' + x.mark : '') + (withSol ? '<div class="page-break"></div>' + x.sol : '');
  }
  // Tall pictures are split at blank lines, so a printed page never cuts through a line of text.
  function sliceTall(box) {
    const PAGE = 1.3;
    for (const img of [...box.querySelectorAll('img')]) {
      if (img.closest('.formula')) continue;   // the formula sheet stays one whole page
      const W = img.naturalWidth, H = img.naturalHeight;
      if (!W || H < W * (PAGE + 0.1)) continue;
      let px;
      try { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'); g.drawImage(img, 0, 0); px = g.getImageData(0, 0, W, H).data; } catch (e) { continue; }
      const blank = y => { for (let x = Math.floor(W * 0.03); x < W * 0.97; x += 2) { const k = (y * W + x) * 4; if (px[k] < 200 || px[k + 1] < 200 || px[k + 2] < 200) return false; } return true; };
      const cuts = [0];
      while (H - cuts[cuts.length - 1] > W * PAGE) {
        const top = cuts[cuts.length - 1], want = Math.floor(top + W * PAGE), low = Math.floor(top + W * 0.5);
        let cut = want;
        for (let y = want; y > low; y--) if (blank(y) && blank(y - 3) && blank(y + 3)) { cut = y; break; }
        cuts.push(cut);
      }
      cuts.push(H);
      const wrap = document.createElement('div');
      for (let i = 0; i < cuts.length - 1; i++) {
        const s = document.createElement('div'); s.className = 'slice'; s.style.aspectRatio = `${W} / ${cuts[i + 1] - cuts[i]}`;
        const im = document.createElement('img'); im.src = img.src; im.alt = ''; im.style.marginTop = `${-cuts[i] / W * 100}%`;
        s.appendChild(im); wrap.appendChild(s);
      }
      img.replaceWith(wrap);
    }
  }
  function printSheet(html) {   // print only this test: a copy at the top of the page, so long tests split into pages properly
    let box = $('ppprint');
    if (!box) { box = document.createElement('div'); box.id = 'ppprint'; document.body.appendChild(box); }
    box.innerHTML = html; document.body.classList.add('ppmode');
    const loaded = () => Promise.all([...box.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; })));
    loaded().then(() => { sliceTall(box); return loaded(); }).then(() => window.print());
  }
  window.addEventListener('afterprint', () => document.body.classList.remove('ppmode'));
  function render() {
    $('levels').innerHTML = PP_BAND.map((n, i) => box('level', String(i), `${i + 2}. ${n}`)).join('');
    ppLoad(() => {
      $('topics').innerHTML = groupBoxes('topic');
      update();
    });
    // nothing is ticked to start with: each student chooses (user, 2026-10-18)
    renderAssessment();
    update();
    lastTestNote();
  }

  document.addEventListener('click', e => {
    const ws = e.target.closest('[data-ws]');
    if (ws && WS) {
      const act = ws.dataset.ws;
      if (act === 'view') { WS.view = ws.dataset.v; drawSheet(); }
      else if (act === 'print') printSheet(WS.view === 'q' ? WS.parts.paper : WS.view === 'sol' ? WS.parts.sol : WS.parts.mark);
      else if (act === 'pdf') downloadSheet(ws);
      else if (act === 'close') { WS = null; drawSheet(); }
      else if (act === 'mkms') { const i = +ws.dataset.i, r = WS.pick[i], box = $('mkms' + i); box.innerHTML = box.innerHTML ? '' : `<img class="lq" src="pp/${r[10] & 2 ? 'ms' : 'q'}/${r[9]}.webp" alt="">${r[10] & 2 ? maHTML(r) + ((window.Y8M_SOL || {})[r[9]] ? solHTML(r[9]) : '') : ''}`; }
      else if (act === 'mkdone') {
        WS.showRes = true; keepTest();
        const L = window.Y8M_LEARN; if (L) WS.pick.forEach((r, i) => { if (WS.marks[i] != null) L.mark(r[9], WS.marks[i] >= (r[6] || 1) ? 'got' : 'not'); });
        $('mkres').innerHTML = resultsHTML(); $('mkres').scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      else if (act === 'mkweak') { const L = window.Y8M_LEARN; if (L) { const got = {}, max = {}; WS.pick.forEach((r, i) => { const t = groupOf(r[0]); got[t] = (got[t] || 0) + (WS.marks[i] || 0); max[t] = (max[t] || 0) + (r[6] || 1); }); Object.keys(max).filter(t => got[t] / max[t] < 0.5).forEach(t => L.addWeak(t)); } ws.textContent = '✓ Added to 🩹 Topics I find hard'; ws.disabled = true; }
    }
    else if (ws && ws.dataset.ws === 'marklast') openLastTest();
  });
  document.addEventListener('change', e => {
    const mk = e.target.closest('[data-mk]');
    if (mk && WS) { const i = +mk.dataset.mk; if (mk.value === '') delete WS.marks[i]; else WS.marks[i] = +mk.value; keepTest(); const c = $('mkcount'); if (c) c.textContent = WS.pick.filter((r, k) => WS.marks[k] != null).length; return; }
    if (e.target.matches('input[type=checkbox]')) update();
  });
  $('tier').addEventListener('change', update);
  $('count').addEventListener('input', update);
  $('make').addEventListener('click', makeWorksheet);
  document.addEventListener('click', e => {
    const pa = e.target.closest('[data-pickassess]');
    if (pa) { if (window.Y8M_pickAssessment) window.Y8M_pickAssessment(pa.dataset.pickassess); return; }
    const b = e.target.closest('[data-all]'); if (!b) return;
    const mode = b.dataset.all, name = b.dataset.for || 'topic', G = (window.Y8M_PP || {}).groups || [];
    const A = ALL.find(a => a.id === b.dataset.a) || assess;
    document.querySelectorAll(`input[name="${name}"]`).forEach(i => {
      i.checked = mode === 'on' ? true : mode === 'off' ? false : A.topics.includes((G[+i.value] || [])[1]);
    });
    update();
  });
  window.Y8M_TOOLS = { ppLoad, sheetHTML, sheetParts, printSheet, mkStep, mkLeg };   // for learn.js
  render();
})();
