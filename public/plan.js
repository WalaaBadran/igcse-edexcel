/* 📅 Study plan shared by all subject sites (copied into each site as plan.js; wired by hub-work/add_plan.py).
   Optional cfg (Year 8 Maths): rate (quick check = how sure you feel per topic), tasks(esc) (own tasks instead of ⚡ Revise), week() (Share my week lines).
   A short diagnostic (2 questions per topic, from this site's quiz bank in window.RVD) sets Plan A, B or C, then a
   day-by-day plan runs to the exam date. Weakest topics come first and get extra time.
   When the assessment's topics change (new study guide), the plan asks for a new diagnostic.
   PLAN.view(sub, cfg): cfg = { name, exam: 'YYYY-MM-DD' or '', learn, quiz, exam_q, paper, empty: message when there are no topics } (routes without '#/'). */
(function () {
  const D = window.RVD; if (!D) return;
  const EXAM_TAG = (document.currentScript && document.currentScript.dataset.exam) || '';
  const KEY = D.key.replace(/-rv$/, '') + '-plan';
  const get = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const put = s => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) {} };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const TOPICS = [...new Set(D.quiz.map(q => q.t))];
  const SIG = TOPICS.join('|');                       // changes when a new assessment's topics go in
  const DAY = 864e5, today = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
  const iso = d => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  const nice = d => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const LEVELS = {
    A: { min: 20, about: 'Step by step: one topic at a time, with extra practice on the harder ones.' },
    B: { min: 25, about: 'Steady: each topic once, extra practice where you need it, then exam questions.' },
    C: { min: 30, about: 'Fast track: quick reviews, then lots of exam-style questions and a timed paper.' }
  };
  let T = null;   // diagnostic in progress: { qs, i, ans: [option chosen, or null] }

  // the quick check in progress survives a refresh (this browser only)
  const TK = 'session-' + KEY + '-check';
  const keepT = () => { try { T ? localStorage.setItem(TK, JSON.stringify({ sig: SIG, t: Date.now(), T })) : localStorage.removeItem(TK); } catch (e) {} };
  const loadT = () => { try { const x = JSON.parse(localStorage.getItem(TK) || 'null'); return x && x.sig === SIG && Date.now() - x.t < 864e5 && x.T.ans ? x.T : null; } catch (e) { return null; } };
  function startTest() {
    const qs = [];
    TOPICS.forEach(t => { const pool = D.quiz.filter(q => q.t === t).sort(() => Math.random() - .5); qs.push(...pool.slice(0, 2)); });
    T = { qs: qs.sort(() => Math.random() - .5), i: 0, ans: qs.map(() => null) }; keepT();
  }
  // Answering moves on; ← Back and Skip → move freely (user, 2026-10-18), and an answer can be changed until the last one is given.
  function move(d) {
    if (d < 0) T.i = Math.max(0, T.i - 1);
    else if (T.i + 1 < T.qs.length) T.i++;
    else { const k = T.ans.indexOf(null); if (k >= 0) T.i = k; }
    keepT(); render();
  }
  function answer(k) {
    T.ans[T.i] = k;
    if (T.ans.indexOf(null) < 0) {
      const right = {}; T.qs.forEach((q, i) => { const r = right[q.t] || (right[q.t] = [0, 0]); r[1]++; if (q.rate) r[0] += T.ans[i] / (q.o.length - 1); else if (T.ans[i] === q.a) r[0]++; });   // rate: 😟 0, 🙂 ½, 😀 1
      const ok = Object.values(right).reduce((s, x) => s + x[0], 0), pct = Math.round(100 * ok / T.qs.length);
      const s = get();
      put({ sig: SIG, lvl: pct >= 80 ? 'C' : pct >= 50 ? 'B' : 'A', pct, scores: right, start: iso(today()), ticks: s.sig === SIG ? s.ticks || {} : {} });
      T = null; keepT(); location.hash = '#/plan/result'; return;
    }
    move(1);
  }

  /* the plan: a list of sessions, then fitted into the days left */
  function sessions(s, cfg) {
    const score = t => { const x = s.scores[t]; return x ? x[0] / x[1] : 0; };
    const order = TOPICS.slice().sort((a, b) => score(a) - score(b));
    const weak = order.filter(t => score(t) < .5);
    const L = h => cfg[h] ? `#/${cfg[h]}` : '';
    const read = t => ['📖', `Read your notes on <b>${esc(t)}</b>`, L('learn')];
    const quiz = t => ['❓', `Quiz yourself on <b>${esc(t)}</b>`, L('quiz')];
    const dump = t => ['🧠', `Brain dump: write all you remember about <b>${esc(t)}</b>, then check`, '#/revise/dump'];
    let examQ = ['📝', 'Answer one exam-style question, then mark it', L('exam_q')];
    let mixed = ['🎯', 'Confidence quiz on everything', '#/revise/quiz'], dumpBoth = ['🧠', 'Quick brain dump of both topics', '#/revise/dump'];
    let read_ = read, quiz_ = quiz, dump_ = dump;
    if (cfg.tasks) { const o = cfg.tasks(esc); read_ = o.read || read; quiz_ = o.quiz || quiz; dump_ = o.dump || dump; examQ = o.examQ || examQ; mixed = o.mixed || mixed; dumpBoth = o.dumpBoth || dumpBoth; }   // a site's own tasks
    const out = [];
    if (s.lvl === 'A') {
      order.forEach(t => out.push([t, [read_(t), dump_(t)]]));
      weak.forEach(t => out.push([t + ' (again)', [quiz_(t), dump_(t)]]));
      out.push(['Mixed review', [mixed], 1], ['Exam practice', [examQ], 1]);
    } else if (s.lvl === 'B') {
      order.forEach(t => out.push([t, [read_(t), quiz_(t)]]));
      weak.forEach(t => out.push([t + ' (again)', [dump_(t), quiz_(t)]]));
      out.push(['Exam practice', [examQ], 1], ['Mixed review', [mixed], 1], ['Exam practice', [examQ], 1]);
    } else {
      for (let i = 0; i < order.length; i += 2) {
        const pair = order.slice(i, i + 2);
        out.push([pair.join(' + '), [...pair.map(quiz_), dumpBoth]]);
      }
      out.push(['Exam practice', [examQ], 1], ['Exam practice', [examQ, examQ], 1], ['Timed paper', [['⏱️', 'Do a timed paper, then mark it', L('paper') || L('exam_q')]], 1]);
    }
    return out.map(([title, tasks, tail]) => [title, tasks.filter(x => x[2] !== ''), !!tail]);
  }
  function fit(list, n, cfg) {   // n days: merge sessions if too many; if too few, add review days but keep exam practice at the end
    const spread = (xs, m) => { const ds = Array.from({ length: m }, () => []); xs.forEach((x, i) => ds[Math.min(m - 1, Math.floor(i * m / xs.length))].push(x)); return ds; };
    if (list.length >= n) return spread(list, n);
    const tail = list.filter(x => x[2]), core = list.filter(x => !x[2]);
    const days = [...spread(core, n - tail.length), ...tail.map(x => [x])];
    const seen = []; let k = 0;   // review days take turns through the topics done so far
    return days.map(d => {
      if (d.length) { d.forEach(x => { const t = x[0].replace(/ \(again\)$/, ''); if (!x[2] && !seen.includes(t)) seen.push(t); }); return d; }
      const t = seen.length ? seen[k++ % seen.length] : TOPICS[0];
      const rv = cfg && cfg.tasks && cfg.tasks(esc).review;
      return [['Review: ' + t, [rv ? rv(t) : ['🔁', `Quick review of <b>${esc(t)}</b>: brain dump it, then fix one mistake`, '#/revise/dump']]]];
    });
  }

  function resultHTML(s) {
    const rows = TOPICS.map(t => { const x = s.scores[t] || [0, 0], p = x[1] ? x[0] / x[1] : 0;
      return `<li><span class="pl-dot ${p >= .99 ? 'g' : p >= .5 ? 'm' : 'w'}"></span>${esc(t)} <span class="muted small">${CFG.rate ? (p >= .99 ? '😀 confident' : p >= .5 ? '🙂 OK' : '😟 hard') : `${x[0]}/${x[1]}`}</span></li>`; }).join('');
    return `<h1>📅 Your study plan</h1>
<div class="card"><p class="muted small" style="margin:0">${CFG.rate ? `Your confidence in the quick check: ${s.pct}%.` : `You got ${s.pct}% in the quick check.`}</p>
<h2 style="margin:6px 0">Your plan: Plan ${s.lvl}</h2><p style="margin:0">${LEVELS[s.lvl].about}</p>
<p class="small muted" style="margin:8px 0 0">Plans A, B and C are just different routes. None is better than another.</p></div>
<div class="card" style="margin-top:12px"><h3>How each topic went</h3><ul class="pl-topics">${rows}</ul>
<p class="small muted" style="margin:6px 0 0"><span class="pl-dot g"></span> strong <span class="pl-dot m"></span> OK <span class="pl-dot w"></span> needs work: these come first in your plan.</p></div>
<p><a class="btn" href="#/plan">See my plan</a></p>`;
  }

  function planHTML(s, cfg) {
    const t0 = today(), start = new Date(s.start + 'T00:00:00');
    const exam = cfg.exam ? new Date(cfg.exam + 'T00:00:00') : null;
    const end = exam || new Date(start.getTime() + 14 * DAY);
    const n = Math.max(1, Math.round((end - start) / DAY));
    const left = exam ? Math.round((exam - t0) / DAY) : null;
    const head = `<h1>📅 My study plan</h1>
<p class="muted">${esc(cfg.name || D.name)} · <b>Plan ${s.lvl}</b> · about ${LEVELS[s.lvl].min} minutes a day (suggested)</p>
<div class="card pl-count">${exam ? (left > 0 ? `<b>${left} day${left === 1 ? '' : 's'}</b> until the exam on ${nice(exam)}` : left === 0 ? '<b>Exam day today. Good luck!</b>' : '<b>This exam is finished.</b> Your next plan appears when the next assessment is added.')
      : cfg.manual ? dateEditor(cfg) + '<p class="small muted" style="margin:8px 0 0">Until you add it, this is a 2-week plan.</p>' : 'The exam date isn\'t set yet, so this is a 2-week plan. It will fit itself to the date once it\'s added.'}${exam && cfg.manual ? ' <a href="#/plan/date" class="small">change date</a>' : ''}</div>`
      + (exam && left > 0 && left <= 3 ? '<a class="card pl-tipcard" href="#/plan/tips">🌟 <b>It\'s exam week!</b> Read the exam-week tips →</a>' : '')
      + `<div class="pl-tools"><a class="btn ghost small" href="#/plan/remind">🔔 Daily reminder</a><button type="button" class="btn ghost small" data-plact="print">🖨️ Print my plan</button><button type="button" class="btn ghost small" data-plact="share">📤 Share my week</button><a class="btn ghost small" href="#/plan/tips">🌟 Exam-week tips</a></div><div class="pl-msg small" role="status"></div>`;
    if (exam && left < 0) return head;
    const days = fit(sessions(s, cfg), n, cfg), daily = (cfg.tasks && cfg.tasks(esc).daily) || ['⚡', 'Daily 5 questions', '#/revise/daily'];
    const body = days.map((list, i) => {
      const d = new Date(start.getTime() + i * DAY), past = d < t0, now = iso(d) === iso(t0);
      const tasks = [daily, ...list.flatMap(x => x[1]), ...(i === days.length - 1 ? [['🌟', 'Read the exam-week tips', '#/plan/tips']] : [])];
      const done = tasks.every((_, j) => s.ticks[i + '.' + j]);
      return `<details class="card pl-day${now ? ' now' : ''}${done ? ' done' : ''}"${now || (!past && i === 0) ? ' open' : ''}>
<summary><b>${now ? 'Today' : nice(d)}</b> <span class="muted">${esc(list.map(x => x[0]).join(' · '))}</span>${done ? ' ✅' : ''}</summary>
<ul>${tasks.map(([ic, txt, href], j) => `<li><label><input type="checkbox" data-pl="${i}.${j}"${s.ticks[i + '.' + j] ? ' checked' : ''}> ${ic} ${txt}</label>${href ? ` <a href="${href}" class="small">Open</a>` : ''}</li>`).join('')}</ul></details>`;
    }).join('');
    const skipNote = s.skipped ? `<div class="card" style="margin-bottom:12px"><p style="margin:0">This is the <b>standard plan</b>, because you skipped the quick check. <a href="#/plan/check">Do the quick check</a> (about 5 minutes) to put your weakest topics first.</p></div>` : '';
    return head + skipNote + body + `<p class="small muted pl-foot" style="margin-top:16px">Missed a day? Just carry on from today. <a href="#/plan/check">Do the quick check again</a> to update your plan.</p>`;
  }

  /* plan dates shared by the reminder and "share my week" */
  function span(s, cfg) {
    const start = new Date(s.start + 'T00:00:00'), exam = cfg.exam ? new Date(cfg.exam + 'T00:00:00') : null;
    return { start, exam, last: new Date((exam ? exam.getTime() : start.getTime() + 14 * DAY) - DAY) };
  }

  /* 🔔 Daily reminder: an event that repeats every day until the exam, added to the phone's own calendar */
  function remindHTML(s, cfg) {
    const site = document.title.split(':')[0].trim();
    return `<h1>🔔 Daily reminder</h1><div class="card"><p style="margin:0">Pick a time. Your phone's calendar will remind you to study every day until ${cfg.exam ? 'the exam' : 'the end of your plan'}.</p>
<p><label>Time: <input type="time" id="pltime" value="17:00" style="font:inherit;padding:6px 8px"></label></p>
<p><button type="button" class="btn" data-plact="ics">📱 iPhone, iPad or other calendar</button></p>
<p><button type="button" class="btn ghost" data-plact="gcal">📅 Google Calendar (most Android phones)</button></p>
<p class="small muted" style="margin:0">iPhone: tap the first button, then <b>Add All</b>. Android: tap Google Calendar, then <b>Save</b>. Nothing is sent to this site. The reminder says "${esc(site)}: study time (${LEVELS[s.lvl].min} min)".</p></div>
<p><a href="#/plan">← Back to my plan</a></p>`;
  }
  function reminder(kind, s, cfg) {
    const t = (document.getElementById('pltime') || {}).value || '17:00', [hh, mm] = t.split(':');
    const sp = span(s, cfg), first = today() > sp.start ? today() : sp.start, min = LEVELS[s.lvl].min;
    const ymd = d => iso(d).replace(/-/g, ''), at = ymd(first) + 'T' + hh + mm + '00';
    const endT = new Date(2000, 0, 1, +hh, +mm + min), to = ymd(first) + 'T' + String(endT.getHours()).padStart(2, '0') + String(endT.getMinutes()).padStart(2, '0') + '00';
    const site = document.title.split(':')[0].trim(), title = `📚 ${site}: study time (${min} min)`;
    const link = location.origin + location.pathname + '#/plan';
    if (kind === 'gcal') {
      const u = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent(title) + '&dates=' + at + '/' + to
        + '&recur=' + encodeURIComponent('RRULE:FREQ=DAILY;UNTIL=' + ymd(sp.last)) + '&details=' + encodeURIComponent('Open your study plan: ' + link);
      window.open(u, '_blank', 'noopener'); return;
    }
    const ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//study site//plan//EN', 'BEGIN:VEVENT',
      'UID:' + Date.now() + '-' + Math.random().toString(36).slice(2) + '@study-plan', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z',
      'DTSTART:' + at, 'DTEND:' + to, 'RRULE:FREQ=DAILY;UNTIL=' + ymd(sp.last) + 'T235959', 'SUMMARY:' + title, 'DESCRIPTION:Open your study plan: ' + link,
      'BEGIN:VALARM', 'TRIGGER:PT0M', 'ACTION:DISPLAY', 'DESCRIPTION:' + title, 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })); a.download = 'study-reminder.ics';
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }

  /* 📤 Share my week: a short message for a parent, made on the phone (nothing is sent by the site) */
  function weekMsg(s, cfg) {
    const site = document.title.split(':')[0].trim(), t0 = today(), from = new Date(t0.getTime() - 6 * DAY);
    let rv = {}; try { rv = JSON.parse(localStorage.getItem(D.key)) || {}; } catch (e) {}
    const daily = Object.keys(rv.daily || {}).filter(k => k >= iso(from) && k <= iso(t0) && (rv.daily[k].res || []).filter(Boolean).length >= 5).length;
    const streak = rv.streak && [iso(t0), iso(new Date(t0.getTime() - DAY))].includes(rv.streak.last) ? rv.streak.n : 0;
    const sp = span(s, cfg);
    const tasks = Object.keys(s.ticks || {}).filter(k => { const d = new Date(sp.start.getTime() + +k.split('.')[0] * DAY); return d >= from && d <= t0; }).length;
    const left = sp.exam ? Math.round((sp.exam - t0) / DAY) : null;
    return `📚 ${site}: my week (${nice(from)} to ${nice(t0)})\n${cfg.week ? cfg.week(from, t0) : `⚡ Daily 5 done on ${daily} of the last 7 days · 🔥 streak ${streak}`}\n📅 Study plan ${s.lvl}: ${tasks} task${tasks === 1 ? '' : 's'} ticked this week`
      + (left > 0 ? `\n⏳ ${left} day${left === 1 ? '' : 's'} until the exam` : '');
  }
  function share(s, cfg) {
    const text = weekMsg(s, cfg), out = document.querySelector('.pl-msg');
    if (navigator.share) { navigator.share({ text }).catch(() => {}); return; }
    (navigator.clipboard ? navigator.clipboard.writeText(text).then(() => { out.textContent = '✓ Copied. Paste it in a message to your parent.'; }) : Promise.reject()).catch(() => {
      out.innerHTML = 'Copy this and send it to your parent:<textarea readonly rows="4" style="width:100%;margin-top:6px"></textarea>'; out.querySelector('textarea').value = text; });
  }

  /* 🖨️ Print my plan: every day opened, menus hidden */
  function printPlan() {
    const ds = [...document.querySelectorAll('.pl-day')], was = ds.map(d => d.open);
    ds.forEach(d => d.open = true); document.body.classList.add('plprint');
    let undone = true;
    const done = () => { if (!undone) return; undone = false; ds.forEach((d, i) => d.open = was[i]); document.body.classList.remove('plprint'); };
    window.addEventListener('afterprint', done, { once: true }); window.print(); setTimeout(done, 1500);
  }

  /* 🌟 Exam-week tips (general advice) */
  function tipsHTML() {
    const card = (h, items) => `<div class="card" style="margin-top:12px"><h3>${h}</h3><ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">${items.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
    return `<h1>🌟 Exam-week tips</h1><p class="muted">General tips for the last few days. Your study plan already includes the practice.</p>`
      + card('3 days to go', ['No big new topics now. Go back over the topics marked <b>needs work</b> in your quick check.', 'Do one exam-style question with a timer, then mark it and fix your mistakes.', 'Look at your <b>Surprises</b> list in Revise: these are answers you were sure of but got wrong.'])
      + card('2 days to go', ['Brain dump each topic: write everything you remember, then check what you missed.', 'Learn the small things: key words, quotes, formulas or map places.', 'Short sessions with breaks work better than one long session.'])
      + card('The day before', ['Light review only: about 20 to 30 minutes.', 'Get your things ready: pens, pencil, ruler, and anything else your teacher said to bring.', 'Go to bed early. Sleep helps your memory.'])
      + card('On the day', ['Eat breakfast and drink water.', 'Read every question twice. Underline the key words.', 'Look at the marks: more marks means write more.', 'Answer the questions you know first, then go back.', 'Leave a few minutes at the end to check your answers.'])
      + card('Feeling nervous?', ['That is normal, and it shows you care.', 'Breathe in slowly for 4, out slowly for 4, a few times.', 'Remember: you have practised. Do your best, that is enough.'])
      + '<p><a href="#/plan">← Back to my plan</a></p>';
  }

  /* cfg.exam: one exam date for the whole year group ('' = not known yet).
     Non-core subjects (cfg.manual): each student types their own exam date. */
  const DKEY = KEY.replace(/-plan$/, '') + '-examdate';
  const myDate = () => { try { const x = JSON.parse(localStorage.getItem(DKEY)); return x && x.sig === SIG ? x.date : ''; } catch (e) { return ''; } };
  const setDate = d => { try { localStorage.setItem(DKEY, JSON.stringify({ sig: SIG, date: d })); } catch (e) {} };
  function dateEditor(cfg) {
    return `<p style="margin:0 0 8px">When is your exam? If you're not sure, ask your teacher.</p>
<div class="pl-tools"><input type="date" id="pldate" value="${esc(cfg.exam || '')}" style="font:inherit;padding:6px 8px"><button type="button" class="btn small" data-plact="savedate">Save date</button></div>`;
  }
  function examFor(cfg) {
    return { exam: cfg.manual ? myDate() : (typeof cfg.exam === 'string' ? cfg.exam : '') };
  }

  let CFG = {};
  function view(sub, cfg) {
    cfg = cfg || {};
    const s = get();
    if (sub === 'tips') return tipsHTML();
    // no topics to plan yet (Year 9 Maths before a group is chosen): say what to do instead of a check with 0 questions
    if (!TOPICS.length) return `<h1>📅 My study plan</h1><div class="card"><p style="margin:0">${cfg.empty || 'The topics for the next assessment are not on this site yet, so a plan cannot be made. Please check again soon.'}</p></div>`;
    if (cfg.manual && !myDate() && s.sig !== SIG && !['check', 'go', 'result', 'date', 'skip'].includes(sub)) {   // non-core: the date comes first
      const ex0 = examFor(cfg);
      return `<h1>📅 My study plan</h1><p class="muted">Step 1 of 2: your exam date. Step 2: a quick check.</p><div class="card">${dateEditor(Object.assign({}, cfg, ex0))}</div>
<p class="small"><a href="#/plan/check">Skip: I don't know the date yet</a></p>`;
    }
    if (sub === 'date') { const ex0 = examFor(cfg); return `<h1>📅 My exam date</h1><div class="card">${dateEditor(Object.assign({}, cfg, ex0))}</div><p><a href="#/plan">← Back to my plan</a></p>`; }
    cfg = CFG = Object.assign({}, cfg, examFor(cfg));
    if (sub === 'skip') {   // no quick check: the standard plan (Plan B, topics in lesson order)
      put({ sig: SIG, lvl: 'B', skipped: true, pct: null, scores: Object.fromEntries(TOPICS.map(t => [t, [1, 1]])), start: iso(today()), ticks: s.sig === SIG ? s.ticks || {} : {} });
      setTimeout(() => { location.hash = '#/plan'; }, 0); return '';
    }
    if (sub === 'check' || sub === 'go') {
      if (sub === 'check') { T = null; keepT(); return `<h1>📅 Quick check</h1><div class="card">${cfg.rate ? `<p style="margin:0">For each of the ${TOPICS.length} topics, say how sure you feel. The site then makes <b>your</b> study plan, with the topics you find hardest first. Nobody else sees it.</p>
<p class="small muted">Be honest: it's only for your plan.</p>` : `<p style="margin:0">Answer ${TOPICS.length * 2} short questions so the site can make <b>your</b> study plan. It is not a test and nobody else sees your score.</p><p class="small muted" style="margin:6px 0 0">🤖 Questions written with AI help from your lessons, not from past papers.</p>
<p class="small muted">Take your time. If you don't know, choose your best guess.</p>`}<a class="btn" href="#/plan/go">Start</a>
<p class="small" style="margin:12px 0 0"><a href="#/plan/skip">Skip the quick check: give me the standard plan</a></p></div>`; }
      if (!T) T = loadT();
      if (!T) startTest();
      const q = T.qs[T.i], done = T.ans.filter(x => x != null).length, last = T.i + 1 >= T.qs.length;
      const fwd = !last ? (T.ans[T.i] != null ? 'Next →' : 'Skip →') : T.ans.some((x, k) => x == null && k !== T.i) ? 'Go to a skipped question →' : '';
      return `<h1>📅 Quick check</h1><p class="muted small">Question ${T.i + 1} of ${T.qs.length} · ${esc(q.t)} · ${done} answered</p>
<div class="pl-bar"><span style="width:${100 * done / T.qs.length}%"></span></div>
<div class="card"><h3>${esc(q.q)}</h3>${q.o.map((o, k) => `<button type="button" class="pl-opt${T.ans[T.i] === k ? ' on' : ''}" data-pla="${k}">${esc(o)}</button>`).join('')}
<div class="pl-nav">${T.i > 0 ? '<button type="button" class="pl-navb" data-plmove="-1">← Back</button>' : ''}<span style="flex:1"></span>${fwd ? `<button type="button" class="pl-navb" data-plmove="1">${fwd}</button>` : ''}</div></div>`;
    }
    if (s.sig !== SIG) return `<h1>📅 My study plan</h1><div class="card">${s.sig ? '<p style="margin:0"><b>New assessment!</b> The topics have changed, so let\'s make a new plan.</p>' : ''}
<p style="margin:${s.sig ? '8px' : '0'} 0 0">Do a quick check (about 5 minutes). The site then makes a day-by-day plan for you, up to the exam.</p>
<p><a class="btn" href="#/plan/check">Start the quick check</a></p>
<p class="small" style="margin:0"><a href="#/plan/skip">Skip the quick check: give me the standard plan</a></p></div>`;
    if (sub === 'result') return resultHTML(s);
    if (sub === 'remind') return remindHTML(s, cfg);
    return planHTML(s, cfg);
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-pla]'); if (b && T) answer(+b.dataset.pla);
    const mv = e.target.closest('[data-plmove]'); if (mv && T) { move(+mv.dataset.plmove); return; }
    const qd = e.target.closest('[data-pldate]');
    if (qd) { setDate(qd.dataset.pldate); if (location.hash === '#/plan') render(); else location.hash = '#/plan'; return; }
    const sd = e.target.closest('[data-plact="savedate"]');
    if (sd) { const v = (document.getElementById('pldate') || {}).value; if (v) { setDate(v); if (location.hash === '#/plan') render(); else location.hash = '#/plan'; } return; }
    const a = e.target.closest('[data-plact]'); if (!a) return;
    const s = get(), act = a.dataset.plact;
    if (act === 'print') printPlan(); else if (act === 'share') share(s, CFG); else reminder(act, s, CFG);
  });
  document.addEventListener('change', e => {
    const c = e.target.closest('[data-pl]'); if (!c) return;
    const s = get(); s.ticks = s.ticks || {}; if (c.checked) s.ticks[c.dataset.pl] = 1; else delete s.ticks[c.dataset.pl]; put(s);
    const day = c.closest('.pl-day'); if (day) day.classList.toggle('done', [...day.querySelectorAll('[data-pl]')].every(x => x.checked));
  });
  let render = () => window.dispatchEvent(new HashChangeEvent('hashchange'));
  const css = document.createElement('style');
  css.textContent = `.pl-opt { display: block; width: 100%; text-align: left; margin: 8px 0; padding: 12px 14px; border-radius: 10px; border: 2px solid var(--line, #d0d5dd); background: var(--card, #fff); color: var(--ink, #101828); font: inherit; cursor: pointer; }
.pl-opt:hover { border-color: var(--brand, #888); }
.pl-opt.on { border-color: var(--brand, #888); background: color-mix(in srgb, var(--brand, #888) 12%, var(--card, #fff)); font-weight: 600; }
.pl-nav { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
.pl-navb { font: inherit; font-weight: 700; padding: 9px 14px; border-radius: 10px; border: 1px solid var(--line, #d0d5dd); background: var(--card, #fff); color: var(--ink, #101828); cursor: pointer; }
.pl-bar { height: 8px; border-radius: 99px; background: var(--line, #e4e7ec); margin: 4px 0 12px; overflow: hidden; } .pl-bar span { display: block; height: 100%; background: var(--brand, #888); }
.pl-topics { list-style: none; padding: 0; margin: 6px 0 0; line-height: 1.9; }
.pl-dot { display: inline-block; width: 11px; height: 11px; border-radius: 50%; margin-right: 6px; vertical-align: middle; } .pl-dot.g { background: #16A34A; } .pl-dot.m { background: #F59E0B; } .pl-dot.w { background: #DC2626; }
.pl-count { margin: 10px 0 12px; border-left: 4px solid var(--brand, #888); }
.pl-day { margin: 8px 0; padding: 12px 14px; } .pl-day summary { cursor: pointer; line-height: 1.5; } .pl-day.now { border: 2px solid var(--brand, #888); } .pl-day.done { opacity: .75; }
.pl-splash { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 24px; background: radial-gradient(circle at 50% 30%, #1E293B, #0B1120); color: #fff; text-align: center; animation: plfade .35s ease-out; }
.pl-sp-in { max-width: 420px; width: 100%; }
.pl-sp-sub { font-size: 20px; font-weight: 700; opacity: .85; letter-spacing: .02em; }
.pl-sp-big { font-size: clamp(110px, 38vw, 180px); font-weight: 800; line-height: 1; margin: 18px 0 4px; color: #FDE68A; text-shadow: 0 6px 30px rgba(253,230,138,.25); }
.pl-sp-txt { font-size: 26px; font-weight: 700; }
.pl-sp-date { font-size: 18px; margin-top: 8px; opacity: .8; }
.pl-sp-tip { font-size: 17px; line-height: 1.5; margin: 22px auto 0; padding: 12px 16px; border-radius: 14px; background: rgba(255,255,255,.08); }
.pl-sp-btns { display: flex; flex-direction: column; gap: 10px; margin-top: 26px; }
.pl-sp-go, .pl-sp-x { display: block; padding: 15px; border-radius: 14px; font: inherit; font-size: 18px; font-weight: 700; text-decoration: none; cursor: pointer; }
.pl-sp-go { background: #FDE68A; color: #111827; border: 0; } .pl-sp-x { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,.4); }
.pl-sp-go:focus-visible, .pl-sp-x:focus-visible { outline: 3px solid #fff; outline-offset: 3px; }
@keyframes plfade { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .pl-splash { animation: none; } }
@media print { .pl-splash { display: none !important; } }
.pl-tools { display: flex; flex-wrap: wrap; gap: 8px; margin: 0 0 6px; } .pl-msg:empty { display: none; } .pl-msg { margin: 6px 0; }
.pl-tipcard { display: block; margin: 0 0 12px; border-left: 4px solid #F59E0B; text-decoration: none; color: inherit; }
@media print { body.plprint header, body.plprint .bar, body.plprint #subnav, body.plprint .flagbar, body.plprint .newsbar, body.plprint .pl-tools, body.plprint .pl-msg, body.plprint .pl-day a, body.plprint .pl-foot { display: none !important; }
  body.plprint .pl-day { break-inside: avoid; box-shadow: none; border: 1px solid #999; opacity: 1; } body.plprint .pl-day summary { list-style: none; } }
.pl-day ul { list-style: none; padding: 0; margin: 10px 0 0; } .pl-day li { margin: 8px 0; line-height: 1.45; } .pl-day input { width: 20px; height: 20px; vertical-align: -4px; margin-right: 4px; }`;
  document.head.appendChild(css);
  /* ⏳ Countdown screen on every subject site (user, 2026-10-15).
     Date: the script tag's data-exam (core subjects), else the date the student typed in the Study plan.
     Shown once each time the site is opened (once per visit). No date yet: asks for the date. */
  function splash(dateISO, force) {
    const when = dateISO ? new Date(dateISO + 'T00:00:00') : null, left = when ? Math.round((when - today()) / DAY) : null;
    if (left !== null && left < 0) return;
    if (!force) {
      try {
        // Shown every time the site is opened (user, 2026-10-15), not once a day.
        if (document.querySelector('.splash, .launch-splash, [id$="splash"]')) return;   // a launch celebration is showing
        // Once per visit (user 2026-10-19: "only when opening the subject site not at every screen"): a reload
        // (update bar, online saving, dictionary switch, phone reopening the app) does not show it again.
        if (sessionStorage.getItem('pl-splash-seen') === '1') return;
        sessionStorage.setItem('pl-splash-seen', '1');
      } catch (e) {}
    }
    const site = document.title.split(':')[0].trim(), soon = left !== null && left <= 3;
    const d = document.createElement('div');
    d.className = 'pl-splash'; d.setAttribute('role', 'dialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-label', 'Exam countdown');
    d.innerHTML = `<div class="pl-sp-in"><div class="pl-sp-sub">${esc(site)}</div>`
      + (left === null ? '<div class="pl-sp-big" style="font-size:80px">📅</div><div class="pl-sp-txt">Is your exam date out?</div><div class="pl-sp-date">Enter your exam date, make your study plan, and get ready for the exam.</div>'
        : (left === 0 ? '<div class="pl-sp-big">TODAY</div><div class="pl-sp-txt">is your exam day. Good luck! 🍀</div>'
        : left === 1 ? '<div class="pl-sp-big" style="font-size:64px">TOMORROW</div><div class="pl-sp-txt">is your exam. One last revision today!</div>'
        : `<div class="pl-sp-big">${left}</div><div class="pl-sp-txt">day${left === 1 ? '' : 's'} until your exam</div>`)
        + `<div class="pl-sp-date">${nice(when)}</div>`)
      + (soon && window.SPLASH_NOTE ? `<div class="pl-sp-tip" style="font-weight:600">${window.SPLASH_NOTE}</div>` : '')
      + `<div class="pl-sp-tip">${left === null ? 'Not sure of the date yet? Ask your teacher, then come back.' : left === 0 ? 'Eat breakfast, drink water, and read every question twice.' : soon ? 'It\'s exam week: follow your plan and read the exam-week tips.' : 'A little every day: follow your study plan.'}</div>
<div class="pl-sp-btns"><a class="pl-sp-go" href="#/plan${left === null ? '/date' : soon ? '/tips' : ''}">${left === null ? '📅 Enter my exam date' : soon ? '🌟 Exam-week tips' : '📅 Open my study plan'}</a><button type="button" class="pl-sp-x">Continue</button></div></div>`;
    const keys = e => { if (e.key === 'Escape') close(); };
    const close = () => { d.remove(); document.removeEventListener('keydown', keys); };
    d.querySelector('.pl-sp-x').onclick = close; d.querySelectorAll('a').forEach(x => { x.onclick = close; });
    document.addEventListener('keydown', keys);
    document.body.appendChild(d); d.querySelector('.pl-sp-x').focus();
  }
  function splashDate() {
    return EXAM_TAG.split('|')[0] || myDate();
  }
  // Wait a moment so a launch celebration (if any) appears first; the countdown then waits for the next visit.
  // Only when the site is opened at its home page: a direct link (e.g. ⚡ Revise from the year page) goes straight there.
  // ...and still on Home when it shows (23 Oct 2026: tapping a menu button at once let it cover the next page)
  const home = () => /^#?\/?$/.test(location.hash);
  const boot = () => { if (home()) setTimeout(() => { if (home()) splash(splashDate()); }, 600); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else setTimeout(boot, 0);

  window.PLAN = { view, splash: d => splash(d, true) };
})();
