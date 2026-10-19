/* ❓ Help page shared by all subject sites (copied into each site as help.js; wired by hub-work/add_help.py).
   HELP.view(groups, o): groups = the site's NAVG menu; o = { backup: 'progress' | 'home', offline: bool, claude: bool }
   <script src="help.js" data-plain> (Year 8 Maths): no "What's new" and no "This year" box; those describe the other sites. */
(function () {
  const PLAIN = !!(document.currentScript && document.currentScript.hasAttribute('data-plain'));
  // <script data-share src="help.js"> (IGCSE Edexcel Maths, the copy anyone may share): no "class only" wording (user 2026-10-19)
  const SHARE = !!(document.currentScript && document.currentScript.hasAttribute('data-share'));
  const shareText = h => !SHARE ? h : h
    .replace('It is not run by, approved by or connected to the school or its teachers.', 'It is not run by, approved by or connected to any school or exam board.')
    .replace(/Lesson materials, past-paper questions, textbook extracts and other resources <b>belong to their owners<\/b>\. .*?Please don't share them outside the class\./,
      'Past-paper questions and mark schemes <b>belong to Pearson Education Ltd</b>, and video links go to Corbettmaths. They are used here only for <b>free, non-commercial practice</b>.');
  const ABOUT = {
    learn: 'Read and understand the topic.',
    write: 'Practise writing answers, step by step.',
    play: 'Quizzes, games and quick tests.',
    exam: 'Exam-style questions and timed papers.',
    me: 'Your own space: progress, your year plan and printing.'
  };
  const WHERE = { progress: '<a href="#/progress">📊 My progress</a>', home: 'the bottom of the <a href="#/">Home</a> page' };
  /* ✅ Corrections made: shown on each site's Help page (matched by the start of the page title). Newest first.
     Each entry: [date, what was wrong, what it says now]. Add a line whenever a reported mistake is fixed. */
  const FIXES = {
    'Year 8 Geography': [
      ['2026-10-11', 'Biopiracy was linked to pesticides and GM crops.', 'Biopiracy = taking plants or local knowledge without permission or fair payment. The pesticides/GM point is labelled as what the lesson video says.'],
      ['2026-10-11', 'The International Potato Centre was said to study "one crop".', 'It works mainly on potatoes and other root crops.'],
      ['2026-10-11', 'Wave energy "disappears".', 'The energy spreads out into less useful forms.'],
      ['2026-10-11', '"11 billion people by 2100" had no date or source.', 'Labelled as the older UN graph from the lesson, with the newer 2024 UN figure (about 10.2 billion).'],
      ['2026-10-11', 'Migration figures were given for Dubai.', 'They are figures for the whole UAE.'],
      ['2026-10-11', 'Hard engineering was said to be always better or worse than soft engineering.', 'How well each works depends on the place.'],
      ['2026-10-11', 'Yacon was said to help diabetes.', 'Labelled as a claim made in the episode, not a proven fact.'],
      ['2026-10-11', 'Graph and map questions were shown without their graph or map.', 'The slide now appears with the question.']
    ],
    'Year 9 Geography': [
      ['2026-10-11', 'A question said Japan\'s death rate has fallen.', 'The question is now about life expectancy, with a note that Japan\'s death rate is actually rising (an older population).'],
      ['2026-10-11', 'Cacti were listed as Sahara plants.', 'Drought-resistant shrubs, grasses and acacia trees (cacti are from the Americas).'],
      ['2026-10-11', 'Volcano and weather points were too certain.', '"Some gases, like carbon dioxide, collect in low areas"; warnings help but are never certain; heat stress added for the Olympics.'],
      ['2026-10-11', 'All Bedouin were described as nomadic; a pyramid "proves" a trend.', '"Some communities, traditionally" nomadic; a wide base "suggests" a trend.'],
      ['2026-10-11', 'Some graph and pyramid questions had no figure, and mark schemes were not labelled.', 'The figures now appear with their questions, and mark schemes say "official" or "suggested".']
    ],
    'Year 9 English': [
      ['2026-10-12', '"Check my writing" only recognised a few set words, so correct answers in other words could get a ✗.', 'It now also accepts other ways of saying it (for example shows, portrays, makes us feel, on the other hand, as a result), and the quotation memory game accepts a one-letter spelling slip.'],
      ['2026-10-11', 'The automatic key-word check did not work for most question types.', 'Fixed for every question; it now recognises more methods (tricolon, irony, sensory language, direct address) and \'single\' quotation marks.'],
      ['2026-10-11', 'Writing times looked like official exam timings.', 'Labelled "suggested". Unseen passages are labelled "extra skills practice", not assessment texts.']
    ],
    'Year 8 English': [
      ['2026-10-12', '"Check my writing" only recognised a few set words, so correct answers in other words could get a ✗.', 'It now also accepts other ways of saying it (for example shows, portrays, makes us feel, on the other hand, as a result), and the quotation memory game accepts a one-letter spelling slip.'],
      ['2026-10-11', 'The automatic key-word check did not work for most question types.', 'Fixed for every question; it now recognises more methods (tricolon, irony, sensory language, direct address) and \'single\' quotation marks.'],
      ['2026-10-11', 'Writing times looked like official exam timings.', 'Labelled "suggested". Unseen passages are labelled "extra skills practice", not assessment texts.']
    ],
    'Year 9 Science': [
      ['2026-10-12', 'The textbook password page refused every password (since 10 Oct).', 'Fixed: the correct class password opens the textbook chapters again.'],
      ['2026-10-11', 'The stairs question did not say the people had the same mass.', 'It now says "of the same mass".'],
      ['2026-10-11', 'Solar panels were said to produce nothing when it is cloudy.', 'They produce much less, but not usually zero.']
    ],
    'Year 8 History': [
      ['2026-10-11', 'The Lesson 3 slide says the Vikings reached America in 900 CE.', 'The notes give the evidence-based date: about 1000 CE (tree rings show Vikings were there in 1021).'],
      ['2026-10-11', 'The lesson suggests Vikings were found at Point Rosee.', 'Later digs found no proof of Vikings there; the confirmed site is L\'Anse aux Meadows.'],
      ['2026-10-11', 'The sextant is listed as a Renaissance tool.', 'It was invented in the 1750s (an earlier version, the octant, in 1731), long after Columbus and da Gama.'],
      ['2026-10-11', 'Prince Henry\'s "navigation school" at Sagres.', 'Labelled as a legend: historians have found no evidence of an actual school.']
    ]
  };
  function fixesHTML() {
    const k = Object.keys(FIXES).find(t => document.title.startsWith(t)), list = k ? FIXES[k] : [];
    if (!list.length) return '';
    const nice = d => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    return `<div class="card" id="corrections" style="margin-top:12px"><details><summary><h3 style="display:inline">✅ Corrections made (${list.length})</h3></summary>
  <p class="small muted" style="margin:8px 0">Mistakes found by checks and readers, and what the site says now. Thank you for flagging them.</p>
  <ul style="margin:0;padding-left:20px;line-height:1.55" class="small">${list.map(([d, was, now]) => `<li style="margin:0 0 8px"><b>${nice(d)}</b>: ${was}<br><span class="good" style="color:var(--good,#15803D)">Now:</span> ${now}</li>`).join('')}</ul></details></div>`;
  }
  function view(groups, o) {
    o = o || {};
    const menu = (groups || []).filter(g => g[0] !== 'home').map(g => `<li><b>${g[1]} ${g[2]}</b>: ${ABOUT[g[0]] || ''}
      <span class="small muted">${g[3].map(([k, l]) => `<a href="#/${k}">${l}</a>`).join(' · ')}</span></li>`).join('');
    return shareText(`<h1>❓ How to use this site</h1>
<p class="muted">A quick guide for students and parents.</p>
${o.video === false ? '' : `<div class="card" style="margin-top:12px"><h3>🎬 Watch: how to use this site (${o.videoMin || 2} min)</h3>
  <video controls playsinline preload="none" poster="tutorial.jpg?v=${o.videoV || 4}" src="tutorial.mp4?v=${o.videoV || 4}" style="display:block;width:100%;max-width:340px;margin:8px auto 0;border-radius:12px;background:#000"></video>
  <p class="small muted" style="margin:8px 0 0;text-align:center">Turn the sound on 🔊</p></div>`}
<div class="card" style="margin-top:12px"><h3>📅 Start with your study plan</h3>
  <p style="margin:0">Tap <a href="#/plan">📅 Study plan</a> and do the quick check (about 5 minutes). You get a plan for every day up to your exam, with your weakest topics first. You can add a daily reminder to your phone, print it, or share your week with your parent.</p></div>
<div class="card" style="margin-top:12px"><h3>📱 Put it on your home screen</h3>
  <ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">
    <li><b>iPhone or iPad (Safari):</b> tap Share ⬆️, then <b>Add to Home Screen</b>.</li>
    <li><b>Android (Chrome):</b> tap ⋮, then <b>Install app</b> or <b>Add to home screen</b>.</li>
  </ul>
  <p class="small muted" style="margin:8px 0 0">It then opens like an app.${o.offline ? ' After your first visit, most pages work without internet too.' : ''}</p></div>
<div class="card" style="margin-top:12px"><h3>🧭 What's in the menu</h3>
  <ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">${menu}</ul>
  <p class="small muted" style="margin:8px 0 0">On a phone the menu is at the bottom of the screen.</p></div>
<div class="card" style="margin-top:12px"><h3>🔊 Reading help</h3>
  <p style="margin:0">At the bottom of every page: <b>🔊 Read aloud</b> reads the page to you, and <b>A+ Bigger text</b> makes the words bigger.</p>
  <p style="margin:8px 0 0"><b>📌 Sticky note</b> sticks your own note on the page you are on, and <b>📝 My notes</b> keeps a notebook of everything you wrote, ready to print or share.</p></div>
<div class="card" style="margin-top:12px"><h3>💾 Your progress</h3>
  <p style="margin:0">Your answers and scores are saved on this phone or computer. Nobody else can see them.</p>
  <p style="margin:8px 0 0;padding:10px 12px;border-radius:10px;background:#FEF3C7;color:#78350F;border:2px solid #F59E0B"><b>⚠️ Without a save code, progress is saved only on this device.</b> If you clear your browser or change device, it is lost unless you move it yourself with <b>Backup</b> on ${WHERE[o.backup] || WHERE.progress}.</p>
  <p class="small muted needsync" style="margin:8px 0 0"><b>Optional:</b> a parent can turn on <b>💾 Save online</b> (bottom of every page). Progress then saves online by itself and opens on any device with the same save code.</p></div>
<div class="card" style="margin-top:12px"><h3>👪 For parents</h3>
  <ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">
    <li>This site was made by a parent to help the class revise. It follows the school's study lists, but it is <b>not an official school website</b> and the teachers are not involved. If something here doesn't match your school notes, please flag it (see below).</li>
    <li>No sign-up, no names, no ads.<span class="needsync"> Online saving is optional: a parent turns it on, only study progress is stored under a random code (no names, emails or phone numbers), and it can be deleted at any time.</span></li>
    ${o.claude ? '<li>Some writing tasks have an optional button that copies the answer so it can be pasted into Claude (claude.ai) for feedback. Nothing is sent unless someone chooses to do this. Claude accounts are for adults (18+), so a parent should do this step.</li>' : ''}
  </ul></div>
<div class="card" style="margin-top:12px"><h3>🐞 Found a mistake?</h3>
  <p style="margin:0">Tap <b>🚩 Flag a mistake</b> at the bottom of the page, type what is wrong and tap <b>📨 Send</b>. It goes straight to the parent who made this site, with the page you were on.</p></div>
${fixesHTML()}
<div class="card" id="declaration" style="margin-top:12px"><h3>📜 Declaration</h3>
  <ul style="margin:6px 0 0;padding-left:20px;line-height:1.6" class="small">
    <li>This is a <b>free study tool made voluntarily by a parent</b>. It is not run by, approved by or connected to the school or its teachers.</li>
    <li>It is provided <b>"as is"</b>. Care is taken to keep it accurate, but it may contain mistakes. Your school's lessons and materials always come first.</li>
    <li>Using this site does <b>not guarantee any assessment or exam result</b>. Study plans and timings are suggestions only.</li>
    <li>Lesson materials, past-paper questions, textbook extracts and other resources <b>belong to their owners</b>. They are the same kinds of materials already shared with the class, and they are gathered here only to help the class <b>revise privately</b>, not for any commercial use. Please don't share them outside the class.</li>
    <li><b>If you own any material on this site and would like it changed or removed</b>, please tell the parent who shared the link, and it will be taken down promptly.</li>
    <li>Progress is saved on your device.<span class="needsync"> <b>Online saving is optional</b> and is turned on by a parent or guardian, who can delete it at any time. Online progress that isn't used for a year is deleted automatically.</span></li>
    <li>The number of visits is counted (by the site itself and with <b>Cloudflare Web Analytics</b>), with <b>no cookies</b> and nothing that identifies you (no names, no exact location).</li>
    <li>Links to other websites are for help only. Those sites have their own rules.</li>
    <li>By using this site, students and parents accept these points.</li>
  </ul></div>`);
  }

  /* 🚩 Flag a mistake: a button at the end of every page. The student types what is wrong and taps 📨 Send: the site sends it
     straight to the parent who made it (the site's own /api/flag, user 2026-10-19), with the page it was on. No name or
     personal details are asked for. If there is no internet, the text stays in the box so they can try again. */
  function flagPage() {
    const vis = sel => [...document.querySelectorAll(sel)].find(x => x.offsetParent !== null);   // the heading of the page on screen
    const h = vis('#app h1') || vis('#app h2') || vis('main h1') || document.querySelector('.subbar a.on');
    const route = location.hash.replace(/^#\/?/, '');
    return (h ? h.textContent.replace(/\s+/g, ' ').trim() : '') || route || 'Home';
  }
  function flag(btn) {
    const out = btn.parentNode.querySelector('.flagmsg');
    if (out.querySelector('.flagpanel')) { out.innerHTML = ''; return; }   // tap again to close
    out.innerHTML = `<div class="flagpanel"><b>🚩 Report a mistake</b>
      <label class="small" style="display:block;margin:6px 0 4px">What's wrong? (for example: "Question 3: the answer should be 1497")</label>
      <textarea class="flagtext" rows="3" maxlength="1000" placeholder="Type what is wrong here…"></textarea>
      <div class="flagbtns"><button type="button" class="flagsend">📨 Send</button></div>
      <p class="small muted flagnote" style="margin:6px 0 0">It goes straight to the parent who made this site, with the page you are on. Please don't write your name or other personal details.</p></div>`;
    const ta = out.querySelector('.flagtext'), note = out.querySelector('.flagnote'), send = out.querySelector('.flagsend');
    send.onclick = () => {
      const text = ta.value.trim();
      if (text.length < 2) { note.textContent = 'Please type what is wrong first.'; ta.focus(); return; }
      send.disabled = true; send.textContent = 'Sending…';
      fetch('/api/flag', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text, page: flagPage(), url: location.pathname + location.hash }) })
        .then(r => r.json().catch(() => ({})).then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          if (ok) { out.innerHTML = '<div class="flagpanel"><b>✅ Sent. Thank you!</b><p class="small muted" style="margin:6px 0 0">The parent who made this site will check it and fix it.</p></div>'; return; }
          note.textContent = j.error || 'It did not send. Please try again in a minute.';
          send.disabled = false; send.textContent = '📨 Send';
        })
        .catch(() => { note.textContent = 'It did not send (no internet?). Your text is still here: try again when you are online.'; send.disabled = false; send.textContent = '📨 Send'; });
    };
    ta.focus();
  }
  /* storage that never breaks the page (private mode can block it) */
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };

  /* A+ Bigger text: remembered on this device */
  const bigOn = () => document.documentElement.classList.contains('bigtext');
  function setBig(on) { document.documentElement.classList.toggle('bigtext', on); put('site-bigtext', on ? '1' : null); }
  if (get('site-bigtext')) document.documentElement.classList.add('bigtext');

  /* 🔊 Read aloud: the phone's own voice reads the page, in short pieces (long ones get cut off in some browsers) */
  const canSpeak = 'speechSynthesis' in window;
  let speaking = false;
  function stopSpeak() { if (canSpeak) speechSynthesis.cancel(); speaking = false; document.querySelectorAll('.readbtn').forEach(b => b.textContent = '🔊 Read aloud'); }
  function speak(btn) {
    if (speaking) return stopSpeak();
    const app = document.getElementById('app'), copy = app.cloneNode(true);
    copy.querySelectorAll('.flagbar, .newsbar, .stk-box, .termbar, script, style, [hidden]').forEach(n => n.remove());
    document.body.appendChild(copy); copy.style.cssText = 'position:absolute;left:-9999px;top:0;width:600px';
    const text = copy.innerText.replace(/\s+/g, ' ').trim(); copy.remove();
    const parts = text.match(/[^.!?]{1,220}[.!?]*|[^.!?]+/g) || [];
    if (!parts.length) return;
    speaking = true; btn.textContent = '⏹ Stop reading';
    parts.forEach((p, i) => {
      const u = new SpeechSynthesisUtterance(p); u.lang = 'en-GB'; u.rate = 0.95;
      if (i === parts.length - 1) u.onend = stopSpeak;
      speechSynthesis.speak(u);
    });
  }
  window.addEventListener('hashchange', stopSpeak);

  /* 🆕 What's new: shown on the Home page for 2 weeks after each change, newest first; only the 2 newest are open, the rest
     fold under "More" so the box stays short on phones (2026-10-19). [date, text, only on sites whose title starts with this] */
  const NEWS = [
    ['2026-10-19', '🎟 NEW: Golden Ticket tasks. The school’s extra challenge tasks: print or do them, then hand them in to your teacher (in the menu).'],
    ['2026-10-12', '🔥 NEW in ⚡ Revise: Challenge mode. No options: type the answer from memory, then check. Harder, and better for remembering.'],
    ['2026-10-12', '📌 NEW: Sticky notes and 📝 My notes. Write your own notes on any page, then print or share them (buttons at the bottom of every page).'],
    ['2026-10-11', '🎬 A short how-to video on the Help page. 🔔 Your study plan can now remind you every day, be printed, and 📤 share your week with your parent.'],
    ['2026-10-11', '📅 NEW: your own Study plan. Do a quick check and get a day-by-day plan up to the exam.'],
    ['2026-10-11', '🧭 An easier menu, with app-style buttons at the bottom on phones.'],
    ['2026-10-11', '❓ A Help page, and 🚩 Flag a mistake, 🔊 Read aloud and A+ Bigger text at the bottom of every page.'],
    ['2026-10-11', '⚡ A new Revise tab: 5 questions a day, a confidence quiz and a brain dump.', 'Year 9 Science'],
    ['2026-10-11', '📱 You can now add it to your home screen and use it without internet.', 'Year 9 Science'],
  ];
  function newsHTML() {
    const site = document.title, now = Date.now();
    const items = NEWS.filter(([d, , only]) => (!only || site.startsWith(only)) && now - Date.parse(d) < 14 * 864e5);
    if (!items.length || get('site-news-seen') === items[items.length - 1][0] + items.length) return '';
    const li = a => a.map(([, t]) => `<li>${t}</li>`).join(''), more = items.slice(2);
    return `<b>🆕 What's new</b><ul>${li(items.slice(0, 2))}</ul>${more.length ? `<details><summary class="small">More (${more.length})</summary><ul>${li(more)}</ul></details>` : ''}<button type="button" class="newsx" aria-label="Hide what's new">✕</button>`;
  }

  /* 🗓️ The whole year (user 2026-10-19: "all sites should have term 1, 2 & 3"): window.YEAR_PLAN comes from the site's year-plan.js
     { now: 1, source: '…', terms: [{ when: 'Sep–Dec', units: [{ name, on: true (practice on this site), tbc: true }] }, …] } */
  // Term start dates (school calendar 2026–2027). A term opens on its first day; earlier terms stay open all year. YEAR_PLAN.starts overrides.
  const STARTS = Object.assign({ '1': '2026-08-31', '2': '2027-01-04', '3': '2027-04-12' }, (window.YEAR_PLAN || {}).starts || {});
  const d0 = new Date(), TODAY = d0.getFullYear() + '-' + String(d0.getMonth() + 1).padStart(2, '0') + '-' + String(d0.getDate()).padStart(2, '0');
  const NOW = ['3', '2', '1'].map(Number).find(n => STARTS[n] && TODAY >= STARTS[n]) || 1;
  const opens = n => new Date(STARTS[n] + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const termRow = n => [1, 2, 3].slice(0, n).map(i => `<span class="term${i === NOW ? ' on' : ''}">Term ${i}<br><small>${i < NOW ? '✅ Done' : i === NOW ? '✅ Here now' : '🔒 Opens ' + opens(i)}</small></span>`).join('');
  function yearHTML(open) {
    const Y = window.YEAR_PLAN; if (!Y || !Y.terms) return '';
    // 🚀 get ahead: free Oak National Academy lessons for a unit (YEAR_PLAN unit.oak), locked until its term starts
    const OAK = 'https://www.thenational.academy';
    const oakLinks = (x, n) => !x.oak ? '' : n > NOW ? `<div class="small muted">🔒 Free get-ahead lessons open ${opens(n)}</div>`
      : `<div class="small">🚀 Get ahead, free lessons from Oak National Academy:</div>` + x.oak.map(o => `<div class="small" style="margin:2px 0 4px 10px">${o.t}${o.n ? ` <span class="muted">(${o.n})</span>` : ''}<br>
        <a href="${OAK}/pupils/programmes/${o.s}-${o.y > 6 ? 'secondary' : 'primary'}-year-${o.y}/units/${o.u}/lessons${o.l ? '/' + o.l + '/overview' : ''}" target="_blank" rel="noopener">▶️ Watch &amp; quiz</a> ·
        <a href="${OAK}/teachers/programmes/${o.s}-${o.y > 6 ? 'secondary-ks' + (o.y > 9 ? 4 : 3) : 'primary-ks2'}/units/${o.u}/lessons${o.l ? '/' + o.l : ''}" target="_blank" rel="noopener">📄 Slides &amp; worksheets</a></div>`).join('');
    const u = (x, n) => `<li>${x.on ? '👉 ' : ''}${x.name}${x.on ? ' <span class="small" style="color:var(--good,#15803D)">· on this site</span>' : ''}${x.tbc ? ' <span class="small muted">(to be confirmed)</span>' : ''}${oakLinks(x, n)}</li>`;
    const anyOak = Y.terms.some(t => t.units.some(x => x.oak));
    return `<div class="termrow">${termRow(Y.terms.length)}</div>
      <details class="yrplan"${open ? ' open' : ''}><summary class="small"><b>What you will learn this year</b>${anyOak ? ' · 🚀 free get-ahead lessons' : ''}</summary>
      ${Y.terms.map((t, i) => `<div class="yrterm"><b>Term ${i + 1}</b>${t.when ? ` <span class="small muted">(${t.when})</span>` : ''}<ul>${t.units.map(x => u(x, i + 1)).join('')}</ul></div>`).join('')}
      <p class="small muted" style="margin:6px 0 0">${Y.source || ''} Practice for each topic is added here when it is taught.${anyOak ? ' Get-ahead lessons are by Oak National Academy (UK), Open Government Licence v3.0; they open on Oak’s website. Your teacher’s lessons come first.' : ''}</p></details>`;
  }
  window.YEAR_HTML = yearHTML;
  // 📈 visit count (the site's Worker): one ping per page load with a random device number; the server counts each device
  // once a day per site. The owner's devices ('vown', set from the owner's visits page) send nothing.
  try {
    if (/\.workers\.dev$/.test(location.hostname) && navigator.sendBeacon) {
      let id = '', own = false;
      try {
        own = localStorage.getItem('vown') === '1'; id = localStorage.getItem('vid') || '';
        if (!id) { id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)); localStorage.setItem('vid', id); }
        localStorage.removeItem('vday');
      } catch (e) {}
      if (!own) {
        navigator.sendBeacon('/__visit?d=' + encodeURIComponent(id));
        // ⏱ real use or a quick look? (user 2026-10-19): count seconds only while the page is on screen AND the student
        // tapped, typed or scrolled in the last 2 minutes, plus pages opened; sent when the page is hidden or closed.
        let act = 0, pages = 1, first = true, lastIn = Date.now();
        ['pointerdown', 'keydown', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastIn = Date.now(); }, { passive: true, capture: true }));
        addEventListener('hashchange', () => { pages++; lastIn = Date.now(); });
        setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastIn < 120000) act += 15; }, 15000);
        const send = () => { if (act || pages > (first ? 1 : 0)) { navigator.sendBeacon('/__visit?u=1&d=' + encodeURIComponent(id) + '&t=' + act + '&p=' + pages); act = 0; pages = 0; first = false; } };
        document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') send(); });
        addEventListener('pagehide', send);
      }
    }
  } catch (e) {}

  const YR = (document.title.match(/^Year (\d+)/) || [])[1] || '';   // link back to the year group's page
  const TERMS = !/Science/.test(document.title);   // Science already shows every term and unit on its own pages
  function addBars() {
    const app = document.getElementById('app'); if (!app) return;
    if (!app.querySelector(':scope > .flagbar')) {
      const d = document.createElement('div'); d.className = 'flagbar';
      d.innerHTML = (canSpeak ? `<button type="button" class="readbtn">${speaking ? '⏹ Stop reading' : '🔊 Read aloud'}</button>` : '')
        + `<button type="button" class="bigbtn" aria-pressed="${bigOn()}">A+ Bigger text</button><button type="button" class="flagbtn">🚩 Flag a mistake</button><div class="flagmsg small" role="status"></div>`
        + (YR ? `<a class="yrlink small" href="https://year${YR}.deirarevise.workers.dev/">🏠 All Year ${YR} subjects</a>` : '')
        + (SHARE ? `<p class="copyline">© 2026. A free study site made voluntarily by a parent. Exam questions and mark schemes © Pearson Education Ltd, used for free, non-commercial practice; video links go to Corbettmaths. You are welcome to share this link.</p>`
          : `<p class="copyline">© 2026. Notes, quizzes and study plans made for these revision sites. Lesson slides belong to the school, and textbook and story extracts belong to their publishers and authors; they are used here only to help the class revise. Please don't copy or share these sites outside the class.</p>`)
        + `<p class="dedication" dir="rtl" lang="ar"><b>الحمد لله الذي بنعمته تتمّ الصالحات.<br>بفضل الله وتوفيقه تمّ هذا العمل، ليكون صدقةً جاريةً عنّي وعن والديّ الكريمين.<br>نسأل الله العليّ القدير أن يجعل فيه النفع والبركة لكلّ طالب علمٍ يمرّ من هنا، وأن يتقبّله منّا بقبولٍ حسن، ويجعله في ميزان حسناتنا جميعًا.<br>ولا تنسوني وأولادي من صالح دعائكم. 🤲</b></p>`
        + `<p class="dedication en" lang="en"><b>All praise is due to Allah, by whose grace good deeds are completed.<br>By the grace of Allah and His help, this work was completed, as an ongoing charity (sadaqah jariyah) for me and my dear parents.<br>We ask Allah, the Most High, the Almighty, to make it useful and blessed for every student who passes by here, to accept it from us, and to place it in the scale of good deeds for all of us.<br>Please remember me and my children in your prayers. 🤲</b></p>`;
      d.querySelector('.flagbtn').onclick = e => flag(e.currentTarget);
      d.querySelector('.bigbtn').onclick = e => { setBig(!bigOn()); e.currentTarget.setAttribute('aria-pressed', bigOn()); };
      if (canSpeak) d.querySelector('.readbtn').onclick = e => speak(e.currentTarget);
      app.appendChild(d);
    }
    const home = !location.hash.replace(/^#\/?/, '');
    if (home && (TERMS || window.YEAR_PLAN) && !PLAIN && !app.querySelector(':scope > .termbar')) {
      const t = document.createElement('div'); t.className = 'termbar card';
      t.innerHTML = window.YEAR_PLAN ? `<b>🗓️ This year</b>${yearHTML(false)}` : `<b>🗓️ This year</b><div class="termrow">${termRow(3)}</div>`
        + `<p class="small muted" style="margin:6px 0 0">New topics are added here when they are taught.</p>`;
      const bar = app.querySelector(':scope > .flagbar'); app.insertBefore(t, bar || null);
    }
    if (/^#\/year\b/.test(location.hash) && window.YEAR_PLAN && !app.querySelector('.yearcard')) {
      const c = document.createElement('div'); c.className = 'yearcard card'; c.innerHTML = `<b>🗓️ The whole year</b>${yearHTML(true)}`;
      const h1 = app.querySelector('h1'); h1 ? h1.after(c) : app.insertBefore(c, app.firstChild);
    }
    if (home && !PLAIN && !app.querySelector(':scope > .newsbar')) {
      const h = newsHTML(); if (!h) return;
      const n = document.createElement('div'); n.className = 'newsbar'; n.innerHTML = h;
      n.querySelector('.newsx').onclick = () => {
        const items = NEWS.filter(([d, , only]) => (!only || document.title.startsWith(only)) && Date.now() - Date.parse(d) < 14 * 864e5);
        put('site-news-seen', items[items.length - 1][0] + items.length); n.remove();
      };
      app.insertBefore(n, app.firstChild);
    }
    // 🎬 the how-to video box stays at the top of Home, like Maths (user 2026-10-19)
    // (under an English "teacher's revision" card, which that site keeps first: never fight over the top spot)
    const tv = home && app.querySelector(':scope > [data-tutvid]');
    if (tv) { const top = app.querySelector(':scope > .prepnew'), want = top ? top.nextElementSibling : app.firstElementChild;
      if (want !== tv) app.insertBefore(tv, top ? top.nextSibling : app.firstChild); }
  }
  const css = document.createElement('style');
  css.textContent = `.flagbar { margin: 32px 0 0; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.flagbar .flagmsg { flex-basis: 100%; }
.flagpanel { color: var(--ink, #1d2433); text-align: left; max-width: 520px; margin: 8px auto 0; padding: 12px; border-radius: 12px; border: 1px solid var(--line, #E2E8F0); background: var(--card, #fff); }
.flagpanel textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 16px; padding: 8px; border-radius: 8px; border: 1px solid var(--line, #CBD5E1); background: transparent; color: inherit; }
.flagbtns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.flagbtns a, .flagbtns button { padding: 8px 14px; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid var(--line, #CBD5E1); background: var(--card, #fff); color: inherit; }
.flagbtns .flagsend { background: var(--brand, #1D4ED8); border-color: var(--brand, #1D4ED8); color: #fff; } .flagbtns .flagsend:disabled { opacity: .6; }
.flagbar .yrlink { flex-basis: 100%; text-align: center; margin-top: 4px; }
.flagbar .dedication { flex-basis: 100%; text-align: center; font-size: 12.5px; line-height: 1.8; margin: 10px 8px 4px; padding: 10px 12px; border-radius: 12px; background: color-mix(in srgb, var(--brand, #0E8F6E) 8%, transparent); font-family: 'Segoe UI', Tahoma, 'Noto Naskh Arabic', sans-serif; }
.flagbar .dedication.en { font-size: 11.5px; line-height: 1.6; margin-top: 4px; }
.flagbar .copyline { flex-basis: 100%; text-align: center; font-size: 12px; line-height: 1.4; color: var(--muted, #5B6475); margin: 6px 8px 0; }
.termbar { margin: 16px 0 0; }
.termrow { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 8px; }
.term { text-align: center; padding: 8px 4px; border-radius: 10px; border: 1px dashed var(--line, #E2E8F0); color: var(--muted, #5B6475); font-weight: 600; font-size: 15px; line-height: 1.3; }
.term.on { border: 2px solid var(--brand, #4F46E5); color: inherit; }
.term small { font-weight: 500; font-size: 12px; }
.yrplan { margin-top: 8px; } .yrplan summary { cursor: pointer; } .yrterm { margin-top: 8px; } .yrterm ul { margin: 4px 0 0; padding-left: 20px; line-height: 1.5; }
.yearcard { margin: 10px 0 14px; }
.flagbar button { background: none; border: 1px solid var(--line, #d0d5dd); color: var(--muted, #667085); border-radius: 999px; padding: 8px 16px; font: inherit; font-size: 14px; cursor: pointer; }
.flagbar button:hover { border-color: var(--brand, #888); }
.flagbar button[aria-pressed="true"] { border-color: var(--brand, #888); color: var(--brand, #333); font-weight: 700; }
.flagbar .flagmsg { flex-basis: 100%; text-align: center; color: var(--muted, #667085); }
.flagbar .flagmsg:empty { display: none; }
.newsbar { position: relative; margin: 0 0 14px; padding: 12px 40px 12px 14px; border-radius: 12px; border: 1px solid var(--line, #d0d5dd); border-left: 4px solid var(--brand, #888); background: var(--card, #fff); font-size: 15px; }
.newsbar ul { margin: 6px 0 0; padding-left: 20px; line-height: 1.5; }
.newsbar details { margin-top: 4px; } .newsbar details ul { margin-top: 4px; }
.newsbar .newsx { position: absolute; top: 6px; right: 6px; border: 0; background: none; color: var(--muted, #667085); font-size: 18px; padding: 6px 10px; cursor: pointer; }
html.bigtext main { zoom: 1.18; }
@media print { .flagbar, .newsbar { display: none; } }
html:not(.sync-on) .needsync { display: none !important; }`;
  document.head.appendChild(css);
  function watch() {
    const app = document.getElementById('app'); if (!app) return;
    new MutationObserver(addBars).observe(app, { childList: true }); addBars();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  window.HELP = { view };
})();
// 🔄 New-version check (user 2026-10-19: "sometimes even with refresh the updates not applied until i close and open").
// Every few minutes and whenever the tab comes back, fetch this page fresh; if it loads any script version (?v=) that this
// open page does not have, the site was updated: show a small bar to load the new version.
(function () {
  const mine = () => new Set([...document.scripts].map(s => s.getAttribute('src') || '').filter(s => s.includes('?v=')));   // read at check time: the whole page has loaded by then
  let shown = false, last = 0;
  async function check() {
    if (shown || Date.now() - last < 60000) return; last = Date.now();
    try {
      const r = await fetch(location.pathname + '?u=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' });
      if (!r.ok) return;
      const t = await r.text();
      const fresh = [...t.matchAll(/<script[^>]*\ssrc="([^"]*\?v=[^"]*)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
      const have = mine(); if (fresh.length && fresh.some(s => !have.has(s))) bar();
    } catch (e) {}
  }
  function bar() {
    shown = true;
    const b = document.createElement('button'); b.type = 'button';
    b.textContent = '🔄 This site has been updated. Tap to load the new version.';
    b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:2000;max-width:calc(100% - 32px);padding:12px 18px;border:0;border-radius:999px;background:#1D4ED8;color:#fff;font:600 15px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px #0004;cursor:pointer';
    b.onclick = () => location.reload();
    document.body.appendChild(b);
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  window.addEventListener('focus', check);
  setInterval(check, 3 * 60000);
  setTimeout(check, 20000);
})();
// ⚪ Nothing looks selected until the student taps it (user 2026-10-19: "there should be no tab coloured as selected until
// students tap it"). A button the site pressed by default (aria-pressed="true") looks plain until the student has tapped a
// button in that same group; after that their choice shows in the site colour, and the site remembers the group.
(function () {
  const KEY = 'picked-groups';
  let picked; try { picked = new Set(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch (e) { picked = new Set(); }
  const route = () => (location.hash.replace(/^#\/?/, '').split('/')[0] || 'home');
  const SEL = '[aria-pressed="true"], a.on, button.on, a.active, button.active, [aria-current="page"]';
  const groupOf = el => {
    if (!el.hasAttribute('aria-pressed')) {   // tab rows and menus ("on"/"active"): the row itself, on every page
      const row = el.closest('nav, [role="tablist"], .subnav, .tabs, .tabbar') || el.parentElement || {};
      return 'tab|' + (row.id || String(row.className || row.tagName || '')).slice(0, 40);
    }
    const d = el.dataset || {};
    const act = d.act || d.l || d.ws || d.tbMark && 'tbmark' || (el.closest('[role="group"]') || {}).getAttribute?.('aria-label') || '';
    const par = el.parentElement ? (el.parentElement.id || el.parentElement.className || '').toString().slice(0, 40) : '';
    return route() + '|' + (act || par);
  };
  const css = document.createElement('style');
  css.textContent = '[aria-pressed="true"].unpicked, .on.unpicked, .active.unpicked, [aria-current="page"].unpicked { background: var(--card, #fff) !important; color: var(--ink, inherit) !important; border-color: var(--line, #d0d5dd) !important; box-shadow: none !important; }';
  document.head.appendChild(css);
  function paint() {
    document.querySelectorAll(SEL).forEach(el => el.classList.toggle('unpicked', !picked.has(groupOf(el))));
    document.querySelectorAll('.unpicked').forEach(el => { if (!el.matches(SEL)) el.classList.remove('unpicked'); });
  }
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest('[aria-pressed], a, button');
    if (!el || !(el.hasAttribute('aria-pressed') || (el.parentElement && el.parentElement.querySelector(':scope > .on, :scope > .active, :scope > [aria-current="page"]')) || el.closest('nav, .subnav, .tabs, .tabbar'))) return;
    const g = groupOf(el);
    if (!picked.has(g)) { picked.add(g); try { localStorage.setItem(KEY, JSON.stringify([...picked])); } catch (er) {} }
    setTimeout(paint, 0);
  }, true);
  let t = 0;
  const go = () => { paint(); new MutationObserver(() => { clearTimeout(t); t = setTimeout(paint, 30); }).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-pressed', 'class', 'aria-current'] }); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', go); else go();
  window.addEventListener('hashchange', () => setTimeout(paint, 50));
})();
