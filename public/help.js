/* ❓ Help page shared by all subject sites (copied into each site as help.js; wired by hub-work/add_help.py).
   HELP.view(groups, o): groups = the site's NAVG menu; o = { backup: 'progress' | 'home', offline: bool, claude: bool }
   <script src="help.js" data-plain> (Year 8 Maths): no "What's new" and no "This year" box; those describe the other sites. */
(function () {
  /* 👀 Guest mode (a "show link" made on the owner's private page; user 2026-10-21: "a link to a friend outside the school that
     works twice only ... not save anything"). Everything the site would keep in this browser is kept only until the tab is
     closed (localStorage → sessionStorage), no visit or usage numbers are sent, and the message buttons are hidden.
     help.js loads before each site's own scripts, so they all see this. */
  const GA = location.pathname.match(/^\/__g\/([a-f0-9]{32})\//);   // the guest address of a show-link visit (see guest.js)
  const GUEST = (() => { try { if (GA) { sessionStorage.setItem('guest', '1'); sessionStorage.setItem('gtok', GA[1]); } return sessionStorage.getItem('guest') === '1'; } catch (e) { return false; } })();
  if (GUEST && !Storage.prototype.__guest) try {   // normally guest.js has done this already, as the first script on the page
    const L = window.localStorage, S = window.sessionStorage, P = Storage.prototype, g = P.getItem, st = P.setItem, rm = P.removeItem, cl = P.clear;
    P.getItem = function (x) { return this === L ? g.call(S, 'g:' + x) : g.call(this, x); };
    P.setItem = function (x, v) { return this === L ? st.call(S, 'g:' + x, v) : st.call(this, x, v); };
    P.removeItem = function (x) { return this === L ? rm.call(S, 'g:' + x) : rm.call(this, x); };
    P.clear = function () { return this === L ? undefined : cl.call(this); };
    P.__guest = true;
  } catch (e) {}
  // a guest visit from a hub show link continues on the other study sites: links to them go through /__guest/<visit>
  if (GUEST) document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    let u, g = null; try { u = new URL(a.href, location.href); g = sessionStorage.getItem('gtok'); } catch (er) { return; }
    if (u.host === location.host) { if (GA && !u.pathname.startsWith('/__g/')) a.href = GA[0].slice(0, -1) + u.pathname + u.search + u.hash; return; }   // stay on the guest address
    if (!g || u.host === location.host || !/^year\d[\w-]*\.deirarevise\.workers\.dev$/.test(u.host)) return;
    e.preventDefault(); location.href = 'https://' + u.host + '/__guest/' + g + '?to=' + encodeURIComponent(u.pathname + u.search + u.hash);
  }, true);
  // the part of the site on screen, e.g. "exam", "topic", "revise" ("home" for the Home page): used for the usage totals and 👍/👎
  const partNow = () => location.hash.replace(/^#\/?/, '').split(/[/?]/)[0].toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 27) || 'home';
  const sget = k => { try { return sessionStorage.getItem(k); } catch (e) { return null; } };
  const sset = (k, v) => { try { sessionStorage.setItem(k, v); } catch (e) {} };
  const PLAIN = !!(document.currentScript && document.currentScript.hasAttribute('data-plain'));
  // <script data-share src="help.js"> (IGCSE Edexcel Maths, the copy anyone may share): no "class only" wording (user 2026-10-19)
  const SHARE = !!(document.currentScript && document.currentScript.hasAttribute('data-share'));
  // 🔑 class pass (hub-work/classpass_worker.js): this device gets its pass, or renews it, quietly about every 3 weeks
  // (not in guest view, not on the IGCSE copy that anyone may share)
  if (!GUEST && !SHARE && location.protocol === 'https:') try {
    const t = +localStorage.getItem('vcp-at') || 0;
    if (Date.now() - t > 20 * 864e5) fetch('/__class/claim', { method: 'POST', credentials: 'same-origin' }).then(r => { if (r.status === 204) localStorage.setItem('vcp-at', String(Date.now())); }).catch(() => {});
  } catch (e) {}
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
      ['2026-10-21', 'Timed full answer: a quotation with one word missing or changed was only called “not in the text”, so it looked like a mistake by the site.', 'The site now shows the real words and what is different (for example “Missing: being”), and a quotation with a small typing slip still counts, with a spelling note.'],
      ['2026-10-12', '"Check my writing" only recognised a few set words, so correct answers in other words could get a ✗.', 'It now also accepts other ways of saying it (for example shows, portrays, makes us feel, on the other hand, as a result), and the quotation memory game accepts a one-letter spelling slip.'],
      ['2026-10-11', 'The automatic key-word check did not work for most question types.', 'Fixed for every question; it now recognises more methods (tricolon, irony, sensory language, direct address) and \'single\' quotation marks.'],
      ['2026-10-11', 'Writing times looked like official exam timings.', 'Labelled "suggested". Unseen passages are labelled "extra skills practice", not assessment texts.']
    ],
    'Year 8 English': [
      ['2026-10-21', 'A quotation with one word missing or changed was only called “not in the text”.', 'The site now shows the real words and what is different, and a quotation with a small typing slip still counts, with a spelling note.'],
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
  <p class="small muted" style="margin:8px 0">Mistakes that were found, and what the site says now.</p>
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
${window.ASK_AI ? `<div class="card" style="margin-top:12px"><h3>🤖 Stuck? Ask the AI helper</h3>
  <p style="margin:0">Tap <b>🤖 Ask AI</b> at the top of the screen and type what you don't understand. It looks at the page you are on and explains it in a simpler way, in English or Arabic. Tip: select some words on the page first, then tap 🤖 Ask AI to have just those words explained.</p>
  <p class="small muted" style="margin:8px 0 0">The AI can make mistakes: check with your notes or your teacher. For homework it gives hints, not answers to copy. Don't type your name or personal details.</p></div>` : ''}
<div class="card" style="margin-top:12px"><h3>💾 Your progress</h3>
  <p style="margin:0">Your answers and scores are saved on this phone or computer. Nobody else can see them.</p>
  <p style="margin:8px 0 0;padding:10px 12px;border-radius:10px;background:#FEF3C7;color:#78350F;border:2px solid #F59E0B"><b>⚠️ Without a save code, progress is saved only on this device.</b> If you clear your browser or change device, it is lost unless you move it yourself with <b>Backup</b> on ${WHERE[o.backup] || WHERE.progress}.</p>
  <p class="small muted needsync" style="margin:8px 0 0"><b>Optional:</b> a parent can turn on <b>💾 Save online</b> (bottom of every page). Progress then saves online by itself and opens on any device with the same save code.</p></div>
<div class="card" style="margin-top:12px"><h3>👪 For parents</h3>
  <ul style="margin:6px 0 0;padding-left:20px;line-height:1.6">
    <li>This site was made by a parent to help the class revise. It follows the school's study lists, but it is <b>not an official school website</b> and the teachers are not involved. If something here doesn't match your school notes, please flag it (see below).</li>
    <li>The site counts how many times each part is opened, and the 👍 / 👎 answers, as totals only, to see what helps most. Messages you send have no name attached. Nothing identifies you.</li>
    <li>No sign-up, no names, no ads.<span class="needsync"> Online saving is optional: a parent turns it on, only study progress is stored under a random code (no names, emails or phone numbers), and it can be deleted at any time.</span></li>
    ${window.ASK_AI ? '<li>The <b>🤖 Ask AI</b> helper uses a free AI model (Google’s open Gemma model, run by Cloudflare). Each question is checked for safety first, it only helps with school work, and this site does <b>not save</b> questions or answers. A daily limit keeps it free.</li>' : ''}
    ${o.claude ? '<li>Some writing tasks have an optional button that copies the answer so it can be pasted into Claude (claude.ai) for feedback. Nothing is sent unless someone chooses to do this. Claude accounts are for adults (18+), so a parent should do this step.</li>' : ''}
  </ul></div>
<div class="card" style="margin-top:12px"><h3>📣 Tell us</h3>
  <p style="margin:0">Tap <b>📣 Tell us</b> at the top of any page: 🚩 tell us about a mistake, ➕ ask for something to be added, ❤️ say what you think of the site, 📅 tell us how often you use it, or 🛠️ say what would make it better. It goes straight to the parent who made this site, with the page you were on. When they reply, the button blinks red and blue: open it to read the reply. Your messages stay there on this device. You can also tap 👍 or 👎 at the bottom of a page to say if it helped you.</p></div>
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
    ${SHARE ? '' : '<li>One small <b>class pass</b> cookie keeps these sites for the class: a random number, with no names or personal details, not used for counting. A visitor with a show link gets one small cookie that keeps the link to their own device.</li>'}
    ${window.ASK_AI ? '<li>Answers from the <b>🤖 AI helper</b> are written by a computer and <b>can be wrong</b>. Questions and answers are not saved by this site.</li>' : ''}
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
  /* 💬 Messages, like a chat (user 2026-10-21: "i want it like chat to my private admin page"; "suggestions to improve and what
     they don't like about each site"). 🚩 Flag a mistake and 💬 Ideas & feedback open the same panel. Messages go to the site's
     own /api/chat and appear on the owner's private page, where the parent can reply. This device keeps a random conversation
     number (no name), so the reply shows here, in the panel, and a notice says when there is a new one. */
  /* 💬 Your say (user 2026-10-23: "something creative for flag a mistake: suggest something to be added, their opinion on the
     site (like it or not, really useful or not), how often they use it, suggestions to improve"). Five big choices; the opinion
     and how-often ones are one tap (typing is optional). [kind, icon, title, hint, text box label, example] */
  const SAY = [
    ['mistake', '🚩', 'Found a mistake', 'Something is wrong', 'Where is it, and what is wrong?', 'For example: “Question 3: the answer should be 1497”'],
    ['add', '➕', 'Add something', 'A topic, questions or anything you need', 'What should be added?', 'For example: “more 6-mark questions on rivers”'],
    ['opinion', '❤️', 'My opinion', 'Do you like it? Is it useful?', 'Why? (you can skip this)', 'Type here…'],
    ['often', '📅', 'How often I use it', 'Just one tap', 'Anything else? (you can skip this)', 'Type here…'],
    ['improve', '🛠️', 'Make it better', 'What would help you more?', 'What would make it better?', 'For example: “bigger pictures on my phone”'],
  ];
  const LIKE = ['😍 Love it', '🙂 Like it', '😐 It’s OK', '🙁 Don’t like it'];
  const USEFUL = ['💯 Very useful', '👍 Useful', '🤏 A little', '👎 Not useful'];
  const OFTEN = ['🔥 Every day', '📆 A few times a week', '📝 Only before tests', '👋 This is my first time'];
  const chatId = make => {
    let t = get('chat-t');
    if (!t && make) { t = crypto.randomUUID ? crypto.randomUUID() : (Math.random().toString(36).slice(2) + Date.now().toString(36) + Math.random().toString(36).slice(2)); put('chat-t', t); }
    return t || '';
  };
  const escH = x => String(x).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  let newReplies = 0, readTimer = 0, hotUntil = 0;
  function chatLog(box, msgs) {
    if (!msgs || !msgs.length) { box.innerHTML = ''; return; }
    const was = +(get('chat-read') || 0);
    box.innerHTML = msgs.slice(-20).map(m => `<div class="cb ${m.from === 'owner' ? 'them' : 'me'}${m.from === 'owner' && m.id > was ? ' cbnew' : ''}"><div>${escH(m.msg).replace(/\n/g, '<br>')}</div><small>${m.from === 'owner' ? 'Reply from the parent who made this site' : 'You'} · ${new Date(m.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</small></div>`).join('');
    const top = Math.max(0, ...msgs.filter(m => m.from === 'owner').map(m => m.id));
    // a reply counts as read only after 2 seconds on screen in the open chat: if the chat is closed sooner, the button blinks
    clearTimeout(readTimer);
    if (top > was) readTimer = setTimeout(() => { if (box.isConnected) { put('chat-read', String(top)); newReplies = 0; sset('chat-new', '0'); paintReplies(); } }, 2000);
    box.scrollTop = box.scrollHeight;
  }
  /* 🚩 Report a mistake, as a chat beside the page (user 2026-10-21: "put flag a mistake ... as a chat box like flag/report a
     mistake to creator pop up at the side of the page; remove from the bottom, it is not noticeable there; make it flash blue
     like when we receive chat message till the student opens it"). A tab on the right edge of every page opens the pop-up:
     🚩 a mistake, 💡 an idea, 👎 something they don't like; the conversation and the parent's replies are kept. A new reply makes
     the tab flash blue, with a badge, until the student opens it. */
  function chatTab() {
    if (GUEST && !document.querySelector('body > .guestbadge')) {   // 👀 a show-link visit: a small reminder, where the chat button would be
      const g = document.createElement('div'); g.className = 'guestbadge'; g.setAttribute('role', 'note');
      g.textContent = '👀 Guest view, for you only · please don’t share'; document.body.appendChild(g); chatPlace();
    }
    if (GUEST || document.querySelector('.chattab')) return;
    const t = document.createElement('button'); t.type = 'button'; t.className = 'chattab';
    t.setAttribute('aria-label', 'Tell us: a mistake, an idea or what you think, to the person who made this site');
    t.innerHTML = '<span class="chattab-i" aria-hidden="true">📣</span><span class="chattab-t">Tell us</span>';
    t.onclick = () => (document.querySelector('body > .chatside') ? chatClose() : chat(''));
    // 📣 Tell us sits in the top bar, with its name, next to 🤖 Ask AI (user, 23 Oct 2026: "bigger button with its name on top
    // of the page"; the corner button was not noticed). A page without a top bar keeps the corner button.
    const bar = document.querySelector('header .bar');
    if (bar) { t.classList.add('chattop'); bar.insertBefore(t, bar.querySelector('.ask-fab')); document.documentElement.classList.add('chat-top'); }
    else document.body.appendChild(t);
    chatPlace(); addEventListener('resize', chatPlace);
    paintReplies();
  }
  function chatPlace() {   // sit just above a menu fixed at the bottom of the screen (the phone menu), if there is one
    let h = 0;
    for (const n of document.querySelectorAll('nav, .bar')) {
      if (getComputedStyle(n).position !== 'fixed') continue;
      const r = n.getBoundingClientRect(); if (r.bottom >= innerHeight - 2 && r.height < 200) h = Math.max(h, r.height);
    }
    document.documentElement.style.setProperty('--chatnav', h + 'px');
  }
  function chatClose() { const w = document.querySelector('body > .chatside'); if (w) { w.remove(); checkReplies(); } paintReplies(); }   // closing checks at once
  if (!GUEST) window.TELLUS = (kind, pre) => chat(kind || '', pre);   // e.g. ⚡ Revise: "🚩 Report a mistake in this question"
  function chat(mode, pre) {   // mode: '' (the button: the student chooses) or a kind, e.g. 'improve' after 👎; pre: a message to start with
    chatClose();
    let kind = mode, pick = {};   // nothing is chosen until the student taps, unless they came from 👎
    const w = document.createElement('section'); w.className = 'chatside'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Tell us: message the person who made this site');
    w.innerHTML = `<div class="chathead"><b>📣 Tell us</b><button type="button" class="chatx" aria-label="Close">✕</button></div>
      <p class="small muted" style="margin:2px 0 6px">Straight to the parent who made this site. No names. Your messages and the replies stay here.</p>
      <div class="chatlog" aria-live="polite"></div>
      <p class="saywhat">What would you like to tell us?</p>
      <div class="saycards" role="group" aria-label="What would you like to tell us?">${SAY.map(([k, ic, t, hint]) => `<button type="button" class="saycard" data-k="${k}" aria-pressed="false"><span class="sayi" aria-hidden="true">${ic}</span><b>${t}</b><small>${hint}</small></button>`).join('')}</div>
      <div class="sayform" hidden></div>
      <p class="small muted flagnote" style="margin:6px 0 0">It goes with the page you are on. You may get a reply here, on this device. Please don't write your name or other personal details.</p>`;
    document.body.appendChild(w); paintReplies();
    const log = w.querySelector('.chatlog'), form = w.querySelector('.sayform'), note = w.querySelector('.flagnote');
    const chips = (key, q, list) => `<p class="sayq">${q}</p><div class="sayrow" role="group" aria-label="${q}">${list.map(o => `<button type="button" class="saychip" data-g="${key}" aria-pressed="false">${o}</button>`).join('')}</div>`;
    const show = k => {   // the second step: one-tap answers and / or a text box for the chosen kind
      kind = k; pick = {};
      w.querySelectorAll('.saycard').forEach(x => x.setAttribute('aria-pressed', x.dataset.k === k));
      const s = SAY.find(x => x[0] === k) || SAY[4];
      form.innerHTML = (k === 'opinion' ? chips('like', 'Do you like this site?', LIKE) + chips('useful', 'Is it useful for your tests?', USEFUL) : '')
        + (k === 'often' ? chips('often', 'How often do you use this site?', OFTEN) : '')
        + `<label class="small" style="display:block;margin:10px 0 4px" for="chattext">${s[4]}</label>
        <textarea id="chattext" class="flagtext" rows="3" maxlength="1000" placeholder="${s[5]}"></textarea>
        <div class="flagbtns"><button type="button" class="flagsend">📨 Send</button></div>`;
      form.hidden = false;
      form.querySelectorAll('.saychip').forEach(c => c.onclick = () => { pick[c.dataset.g] = c.textContent; form.querySelectorAll(`.saychip[data-g="${c.dataset.g}"]`).forEach(x => x.setAttribute('aria-pressed', x === c)); });
      form.querySelector('.flagsend').onclick = send;
      (k === 'opinion' || k === 'often' ? form.querySelector('.saychip') : form.querySelector('textarea')).focus();
    };
    w.querySelector('.chatx').onclick = chatClose;
    w.addEventListener('keydown', e => { if (e.key === 'Escape') chatClose(); });
    w.querySelectorAll('.saycard').forEach(c => c.onclick = () => show(c.dataset.k));
    const t0 = chatId(false);
    if (t0) fetch('/api/chat?t=' + encodeURIComponent(t0)).then(r => r.json()).then(j => { chatLog(log, j.msgs); lastSeenTop = Math.max(0, ...(j.msgs || []).map(m => m.id)); }).catch(() => {});
    function send() {
      const ta = form.querySelector('textarea'), btn = form.querySelector('.flagsend'), typed = ta.value.trim();
      // one-tap answers go first, so the parent's page can count them: "Likes it: 😍 Love it", "Useful: 💯 Very useful", "Uses it: 🔥 Every day"
      const text = [pick.like && 'Likes it: ' + pick.like, pick.useful && 'Useful: ' + pick.useful, pick.often && 'Uses it: ' + pick.often, typed && ((pick.like || pick.useful || pick.often) ? 'Why: ' : '') + typed].filter(Boolean).join('\n');
      if (text.length < 2) { note.textContent = kind === 'opinion' || kind === 'often' ? 'Please tap an answer (or type a message) first.' : 'Please type your message first.'; ta.focus(); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ t: chatId(true), kind: kind || 'other', text, page: flagPage(), url: location.pathname + location.hash }) })
        .then(r => r.json().catch(() => ({})).then(j => ({ ok: r.ok, j })))
        .then(({ ok, j }) => {
          btn.disabled = false; btn.textContent = '📨 Send';
          if (ok) { hotUntil = Date.now() + 10 * 60e3; form.hidden = true; form.innerHTML = ''; kind = ''; w.querySelectorAll('.saycard').forEach(x => x.setAttribute('aria-pressed', 'false')); chatLog(log, j.msgs); lastSeenTop = Math.max(0, ...(j.msgs || []).map(m => m.id)); note.innerHTML = '<b>✅ Sent. Thank you!</b> If the parent who made this site replies, the 📣 Tell us button blinks red and blue: open it to read the reply.'; if (window.SITE_USE) SITE_USE('tool-msg'); return; }
          note.textContent = j.error || 'It did not send. Please try again in a minute.';
        })
        .catch(() => { note.textContent = 'It did not send (no internet?). Your text is still here: try again when you are online.'; btn.disabled = false; btn.textContent = '📨 Send'; });
    }
    if (mode) show(mode); else w.querySelector('.saycard').focus();
    if (mode && pre) { const ta = form.querySelector('textarea'); if (ta) { ta.value = pre; ta.focus(); ta.setSelectionRange(pre.length, pre.length); } }
  }
  // replies appear without refreshing (user 2026-10-21: "make the reply appear instantly if i solved instantly"): checked when a
  // page opens, every 10 s while the chat is open (the reply is added to the conversation), every 30 s while the page is on
  // screen, and at once when the student comes back to the tab. Only devices that have sent a message check.
  let lastSeenTop = 0;
  function checkReplies() {
    const t = chatId(false); if (GUEST || !t) return;
    fetch('/api/chat?t=' + encodeURIComponent(t)).then(r => r.json()).then(j => {
      const msgs = j.msgs || [], log = document.querySelector('body > .chatside .chatlog');
      const top = Math.max(0, ...msgs.map(m => m.id));
      if (log) { if (top !== lastSeenTop) chatLog(log, msgs); lastSeenTop = top; return; }   // chat open: show it in the conversation
      const read = +(get('chat-read') || 0);
      newReplies = msgs.filter(m => m.from === 'owner' && m.id > read).length; sset('chat-new', String(newReplies)); paintReplies();
    }).catch(() => {});
  }
  if (!GUEST) {
    let tick = 0;
    setInterval(() => {   // every 5 s while the chat is open or for 10 minutes after sending, otherwise every 60 s
      if (document.visibilityState !== 'visible' || !chatId(false)) return;
      tick++;
      if (document.querySelector('body > .chatside') || Date.now() < hotUntil || tick % 12 === 0) checkReplies();
    }, 5000);
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkReplies(); });
  }
  function paintReplies() {   // a new reply: the button blinks red and blue with a badge until the chat is opened
    const t = document.querySelector('.chattab'); if (!t) return;
    const open = !!document.querySelector('body > .chatside');
    t.classList.toggle('chatnew', newReplies > 0 && !open);
    t.querySelector('.chattab-i').textContent = open ? '✕' : newReplies ? '📩' : '📣';
    t.querySelector('.chattab-t').textContent = open ? 'Close' : newReplies ? (newReplies === 1 ? 'New reply! Tap to read' : newReplies + ' new replies! Tap to read') : 'Tell us';
    // a red number on the corner, like a phone's new-message badge (user 2026-10-21: "the color indicated a new message received")
    let n = t.querySelector('.chatcount');
    if (newReplies && !open) { if (!n) { n = document.createElement('span'); n.className = 'chatcount'; n.setAttribute('aria-hidden', 'true'); t.appendChild(n); } n.textContent = newReplies > 9 ? '9+' : String(newReplies); }
    else if (n) n.remove();
    t.setAttribute('aria-label', newReplies ? 'You have a new reply: open the chat' : 'Tell us: a mistake, an idea or what you think, to the person who made this site');
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
     fold under "More" so the box stays short on phones (2026-10-19). [date, text, only on sites whose title starts with this
     (one title or a list)]. STUDY CONTENT ONLY (user, 23 Oct 2026: "make what is new only for academic issues"): new questions,
     units and answers. Never list the site’s tools or features here (that makes the sites easy to copy), and never thank a student for flagging a mistake (user, 23 Oct 2026). */
  const NEWS = [
    ['2026-10-25', '🧱 NEW in ✍️ Practice questions: how to write the 6-mark and 8-mark answers, part by part. Sentence starters from your lessons, a model answer for each part, and 3 new questions from Lessons 2 and 5.', 'Year 8 History'],
    ['2026-10-24', '🔍 NEW: Zoom in: deep analysis. Learn how to zoom in on a word step by step (the zoom ladder), then practise on 76 zoom-in questions, including your teacher’s own, or choose your own word in any extract. Each answer gets a depth score and one thing to improve.', 'Year 9 English'],
    ['2026-10-24', '📚 Revise only what you were taught: the notes, quiz, ⚡ Revise and test practice now come only from your lesson PowerPoints and class files. Things you did not learn in class have been taken out.', ['Year 8 History', 'Year 9 History', 'Year 8 Geography', 'Year 9 Geography']],
    ['2026-10-24', '🗾 The notes, revision book and study guide were rewritten from your lesson slides and the Japan summary sheet. Past-paper questions from other exam boards were removed, so every question matches your lessons.', 'Year 9 Geography'],
    ['2026-10-24', '🏙️ NEW: Lessons 5–7: cooler, cleaner cities (London) and the global energy mix. Notes, slides, quiz and test practice, plus your teacher’s revision comics for every lesson (📖 Revision comics on the home page) and the Independent Revision Questions.', 'Year 8 Geography'],
    ['2026-10-24', '📝 NEW in Test practice: 6-mark source questions and 8-mark PEEL questions on food, water, ageing populations and the coast, using your lesson slides. Your test: six 1-mark questions, one 6-mark question and one 8-mark question (20 marks).', 'Year 8 Geography'],
    ['2026-10-24', '✍️ NEW: Practice questions on Captain Cook and the Age of Exploration: how to answer each type of question, then try, mark yourself and see a model answer.', 'Year 8 History'],
    ['2026-10-23', '🏮 NEW: Lesson 5, Chinese and European exploration: Zheng He, Spain and Portugal, and the Treaty of Tordesillas. Notes, slides, quiz and test practice, with source and PEEL questions.', 'Year 8 History'],
    ['2026-10-23', '🎖️ NEW: Lesson 5, How were soldiers recruited to fight in WWI? Posters, conscription and Indian soldiers, plus both cover-work booklets. Notes, slides, quiz and test practice, with source and PEEL questions.', 'Year 9 History'],
    ['2026-10-23', '📋 Your test: six 1-mark questions, one 6-mark question and one 8-mark question (20 marks). Test practice now has more questions like these.', ['Year 8 History', 'Year 9 History']],
    ['2026-10-23', '🗝️ NEW in ⚡ Revise: Key terms. See a key term, type what it means, check it, then see the real meaning.', ['Year 9 Geography', 'Year 8 Geography', 'Year 9 History', 'Year 8 History', 'Year 9 Science', 'Year 8 Science', 'Year 9 English', 'Year 8 English']],
    ['2026-10-23', '📝 NEW in Exam questions: Test practice. Your teacher’s own questions from the lesson PowerPoints, from 1-mark to 8-mark questions, with answers.', ['Year 8 Science', 'Year 9 Science', 'Year 8 Geography', 'Year 8 History', 'Year 9 History']],
    ['2026-10-22', '📝 NEW in Exam questions: Test practice. Your teacher’s own questions from the lesson PowerPoints, from 1-mark to 8-mark questions, with answers.', 'Year 9 Geography'],
    ['2026-10-20', '🌸 NEW: PETAL step by step. Practise each part of PETAL on its own, including 🔗 L+: linking to Orwell’s intentions and the context.', 'Year 9 English'],
    ['2026-10-20', '✍️ 1-mark quiz questions are now written answers, like in your test, with marking.', ['Year 8 History', 'Year 9 History']],
    ['2026-10-19', '📕 NEW: Textbook practice. The questions from your textbook, with the official answers.', ['Year 8 Science', 'Year 9 Science']],
    ['2026-10-19', '🚀 NEW: Get ahead. The next units of the year, with questions, to start early.', ['Year 8 Science', 'Year 9 Science']],
  ];
  const forSite = (only, site) => !only || [].concat(only).some(o => site.startsWith(o));
  function newsHTML() {
    const site = document.title, now = Date.now();
    const items = NEWS.filter(([d, , only]) => forSite(only, site) && now - Date.parse(d) < 14 * 864e5);
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
  // 👀 a show-link visit (user 2026-10-21: "did the friend use the link, for how long, what did he check, which pages"): the pages
  // opened and the minutes of use go to the server with the visit's own number only, for the person who sent the link.
  // Nothing is kept on the visitor's device.
  try {
    const gv = GUEST && sget('gtok');
    if (gv && /^[a-f0-9]{32}$/.test(gv) && navigator.sendBeacon) {
      let act = 0, lastIn = Date.now(), lastPart = '';
      ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart', 'wheel'].forEach(ev => addEventListener(ev, () => { lastIn = Date.now(); }, { passive: true, capture: true }));
      const ping = (p, t) => navigator.sendBeacon('/__guestuse?g=' + gv + (p ? '&p=' + encodeURIComponent(p) : '') + (t ? '&t=' + t : ''));
      const page = () => { const p = partNow(); if (p !== lastPart) { lastPart = p; ping(p, 0); } };
      page(); addEventListener('hashchange', page);
      setInterval(() => { if (document.visibilityState === 'visible' && Date.now() - lastIn < 120000) act += 15; if (act >= 60) { ping('', act); act = 0; } }, 15000);
      const flush = () => { if (act) { ping('', act); act = 0; } };
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); }); addEventListener('pagehide', flush);
    }
  } catch (e) {}
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
      if (!own && !GUEST && !navigator.webdriver) {   // robot / test browsers send nothing
        navigator.sendBeacon('/__visit?d=' + encodeURIComponent(id));
        // ⏱ real use or a quick look? (user 2026-10-19). Seconds count while the page is on screen AND the student is doing
        // something: tapped, typed or scrolled in the last 2 minutes, OR a video / Read aloud is playing (user 2026-10-20: "even
        // staying and using it, it gives – and very few usings"). Sent every minute while open, and when the page is left.
        // 2026-10-25 (user: "some numbers don't look realistic for the staying time"): the seconds are measured exactly (a check every
        // 5 s adds the real time since the last check; the last part is added when the page is left), and a page counts only when the
        // address really changes: the 📅 Study plan redraws itself with a pretend page change, so every tap there counted as a page.
        let act = 0, pages = 1, first = true, lastIn = Date.now(), lastTick = Date.now(), lastHash = location.hash, vis = document.visibilityState === 'visible';
        ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart', 'wheel'].forEach(ev => addEventListener(ev, () => { lastIn = Date.now(); }, { passive: true, capture: true }));
        // 📊 which parts are used (user 2026-10-21: "without knowing the persons can i know how they are using it"): page parts and
        // tools, sent as totals without the device number, every minute and when the page is left
        const use = {}, count = p => { use[p] = (use[p] || 0) + 1; };
        count(partNow());
        addEventListener('hashchange', () => { lastIn = Date.now(); if (location.hash === lastHash) return; lastHash = location.hash; pages++; count(partNow()); });
        const TOOLS = [['.ask-fab', 'tool-ask'], ['.readbtn', 'tool-read'], ['.bigbtn', 'tool-big'], ['.stk-add', 'tool-sticky'], ['.nb-openbtn', 'tool-notes']];
        document.addEventListener('click', e => { const t = e.target.closest && TOOLS.find(([sel]) => e.target.closest(sel)); if (t) count(t[1]); }, true);
        const flushUse = () => { const k = Object.keys(use); if (!k.length) return; navigator.sendBeacon('/__visit?use=' + encodeURIComponent(k.slice(0, 25).map(p => p + ':' + use[p]).join(','))); k.forEach(p => delete use[p]); };
        window.SITE_USE = count;
        setInterval(flushUse, 60000); document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flushUse(); }); addEventListener('pagehide', flushUse);
        const playing = () => { try { return [...document.querySelectorAll('video, audio')].some(m => !m.paused && !m.ended) || !!(window.speechSynthesis && speechSynthesis.speaking); } catch (e) { return false; } };
        const tick = () => { const now = Date.now(); if (vis && (now - lastIn < 120000 || playing())) act += Math.min(now - lastTick, 20000); lastTick = now; };
        setInterval(tick, 5000);
        const send = () => { tick(); const s = Math.floor(act / 1000); if (s || pages > (first ? 1 : 0)) { navigator.sendBeacon('/__visit?u=1&d=' + encodeURIComponent(id) + '&t=' + s + '&p=' + pages); act -= s * 1000; pages = 0; first = false; } };
        // the first 15 seconds of use are sent at once, so the owner's page soon shows the device is being used (user 2026-10-20: "although
        // he is still using it it gives –"); then every minute while studying, so nothing is lost if the browser is closed suddenly
        setInterval(() => { if (act >= 60000 || (first && act >= 15000)) send(); }, 5000);
        document.addEventListener('visibilitychange', () => { tick(); vis = document.visibilityState === 'visible'; if (!vis) send(); });
        addEventListener('pagehide', send);
      }
    }
  } catch (e) {}
  // 🚩 a flag on every box, question and key term on every subject site (user 2026-10-25, French site: "add flag at each stage to
  // flag not working or wrong things whether info or question", then "yes add flags to all subjects"). It opens 📣 Tell us →
  // 🚩 Found a mistake with the page name and that box's text already filled in, so the message says exactly where it is.
  // Boxes: cards, quick-revision boxes, Maths practice and test questions (innermost only, never links, the trophies card or
  // boxes that already have a report button); rows of key-term / word tables; the word asked in a typed quiz. Not in guest
  // visits (no Tell us there) and never printed.
  try {
    if (!GUEST && !SHARE && window.TELLUS) {   // not on the IGCSE copy that anyone may share
      const BLOCK = '.card, .qbox, .lq, .ppq';
      const SKIP = 'a, .funcard, .gtcard, .hcard, .newsbar, .flagbar, .dedication, .topic';
      const fcss = document.createElement('style');
      fcss.textContent = '#app .flagged{position:relative;padding-right:46px}'
        + '.qflag{position:absolute;top:8px;right:8px;width:32px;height:32px;border:1px solid var(--line,#e3e7ef);border-radius:999px;background:var(--card,#fff);font-size:14px;line-height:1;cursor:pointer;opacity:.7;padding:0;z-index:1}'
        + '.qflag:hover,.qflag:focus-visible{opacity:1;border-color:#dc2626}.qflag.inl{position:static;width:auto;height:auto;padding:2px 7px;margin-left:6px;font-size:12px;vertical-align:middle;opacity:.5}'
        + '@media print{.qflag{display:none!important}#app .flagged{padding-right:revert}}';
      document.head.appendChild(fcss);
      const btn = inl => `<button type="button" class="qflag${inl ? ' inl' : ''} noprint" data-qflag aria-label="Report a problem here" title="Something wrong or not working here? Tell us">🚩</button>`;
      const addFlags = () => {
        const app = document.getElementById('app'); if (!app) return;
        app.querySelectorAll(BLOCK).forEach(c => {
          if (c.classList.contains('flagged') || c.matches(SKIP) || c.closest('.flagbar, .rv-opts')) return;
          if (c.querySelector(BLOCK) || c.querySelector('[data-rv="flag"], [data-act="backup"], [data-qflag]')) return;   // innermost boxes only; no second report button
          if ((c.textContent || '').trim().length < 12) return;
          c.classList.add('flagged'); c.insertAdjacentHTML('beforeend', btn(false));
        });
        app.querySelectorAll('table.sumtab tr').forEach(tr => { if (tr.querySelector('th, [data-qflag]')) return; const td = tr.lastElementChild; if (td) td.insertAdjacentHTML('beforeend', btn(true)); });
        const qf = app.querySelector('form[data-qform]'), qp = qf && qf.previousElementSibling;   // 🙋 typed quiz: next to the word asked
        if (qp && qp.tagName === 'P' && !qp.querySelector('[data-qflag]')) qp.insertAdjacentHTML('beforeend', btn(true));
      };
      document.addEventListener('click', e => {
        const b = e.target.closest && e.target.closest('[data-qflag]'); if (!b || !window.TELLUS) return;
        e.preventDefault(); e.stopPropagation();   // a flag inside a flashcard or a link box must not do anything else
        const box = b.closest('.flagged, tr, p') || b.parentElement, copy = box.cloneNode(true);
        copy.querySelectorAll('button, textarea, input, select, .esk, [hidden], .ainote, .slidenote, script, style').forEach(x => x.remove());
        copy.querySelectorAll('div, p, li, td, th, h1, h2, h3, h4, .pill, b').forEach(x => x.append(' '));   // separate parts don't run together
        const txt = (copy.textContent || '').replace(/\s+/g, ' ').trim(), short = txt.length > 160 ? txt.slice(0, 160) + '…' : txt;
        const h1 = document.querySelector('#app h1, #app h2'), where = h1 ? h1.textContent.replace(/\s+/g, ' ').trim().slice(0, 60) : '';
        window.TELLUS('mistake', `🚩 ${where ? where + ' → ' : ''}“${short}”\nWhat is wrong or not working: `);
      }, true);
      let queued = false;
      const queue = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; addFlags(); }); };
      const watch = () => { const a = document.getElementById('app'); if (!a) return setTimeout(watch, 300); new MutationObserver(queue).observe(a, { childList: true, subtree: true }); queue(); };
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
    }
  } catch (e) {}
  // 🧠 Mind map and 🎧 Listen to the lesson on every notes page (user 2026-10-25, after a video about Google NotebookLM: "don't
  // forget the video i sent you about notebook"; students should stay on the sites). Both are made from what is already on the
  // page, so they add no new facts: the mind map is the page's headings with their points; the lesson is the page read by two
  // of the device's own voices (one introduces each part, the other reads it). Notes pages = at least 2 headings, a fair amount
  // of text and no answer boxes. The listening is in English, so on the language sites only the mind map is offered.
  try {
    const LANGSITE = !!(window.SKCFG || window.VBCFG || /-(french|spanish)\./.test(location.hostname));
    const ncss = document.createElement('style');
    ncss.textContent = '.nlm{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 12px}.nlm button{border:1px solid var(--line,#e3e7ef);background:var(--card,#fff);color:inherit;border-radius:999px;padding:7px 14px;font:inherit;font-size:14.5px;font-weight:700;cursor:pointer;box-shadow:0 1px 2px rgba(0,0,0,.06)}'
      + '.mm-wrap{position:fixed;inset:0;z-index:9990;background:var(--bg,#f6f7fb);overflow:auto;padding:14px 14px 80px}.mm-top{position:sticky;top:-14px;background:var(--bg,#f6f7fb);display:flex;flex-wrap:wrap;gap:8px;align-items:center;padding:10px 0;z-index:1}'
      + '.mm-top h2{margin:0 auto 0 0;font-size:19px}.mm-top button{border:1px solid var(--line,#e3e7ef);background:var(--card,#fff);color:inherit;border-radius:999px;padding:6px 12px;font:inherit;font-size:14px;cursor:pointer}'
      + '.mm ul{list-style:none;margin:0;padding-left:22px;border-left:2px solid var(--line,#d0d5dd)}.mm>ul{border-left:0;padding-left:0}.mm li{margin:6px 0;position:relative}'
      + '.mm li::before{content:"";position:absolute;left:-22px;top:17px;width:18px;border-top:2px solid var(--line,#d0d5dd)}.mm>ul>li::before{display:none}'
      + '.mm .node{display:inline-block;border:0;border-radius:12px;padding:7px 12px;font:inherit;text-align:left;cursor:pointer;max-width:100%;line-height:1.35}'
      + '.mm .n0{background:var(--brand,#4F46E5);color:#fff;font-weight:800;font-size:18px}.mm .n1{background:var(--brand-2,#E0E7FF);color:var(--ink,#1d2433);font-weight:800}.mm .n2{background:#ecfdf5;color:#065f46;font-weight:700}'
      + '.mm .leaf{display:inline-block;background:var(--card,#fff);border:1px solid var(--line,#e3e7ef);border-radius:10px;padding:6px 10px;font-size:14.5px;line-height:1.4}'
      + '.mm .node.closed::after{content:" ▸"}.mm .node.open::after{content:" ▾"}'
      + '@media (prefers-color-scheme: dark){:root:not([data-theme="light"]) .mm .n2{background:#064e3b;color:#d1fae5}}'
      + '.pod{position:fixed;left:8px;right:8px;bottom:calc(70px + env(safe-area-inset-bottom));z-index:9989;max-width:640px;margin:0 auto;background:#111827;color:#fff;border-radius:16px;padding:10px 12px;box-shadow:0 10px 30px rgba(0,0,0,.35);font-size:14px}'
      + '.pod .row2{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}.pod button{border:0;border-radius:999px;padding:6px 12px;font:inherit;font-weight:700;cursor:pointer;background:#374151;color:#fff}.pod button.on{background:#4f46e5}'
      + '.pod .now{font-size:13.5px;opacity:.9;margin-top:4px;max-height:3.9em;overflow:hidden}@media print{.nlm,.mm-wrap,.pod{display:none!important}}';
    document.head.appendChild(ncss);
    const nesc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const clean = el => { const c = el.cloneNode(true); c.querySelectorAll('button, .qflag, .say, .esk, [hidden], .noprint, .ainote, .slidenote, script, style').forEach(x => x.remove()); return (c.textContent || '').replace(/\s+/g, ' ').trim(); };
    const SKIPIN = '.nlm, .flagbar, .newsbar, .funcard, .noprint, nav, .sumhead, .qflag';
    const NOTNOTES = /^#\/(help|gt|progress|improve|games|write|year|oak|ahead|exam|models|plan|notes|stats|settings)(\/|$)|\/(list|papers)(\/|$)/;
    const say1 = t => String(t).replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\uFE0F\u200D\u20E3]/gu, '').replace(/\s+/g, ' ').trim();   // emojis are not read out
    // the page as a tree: { t, kids: [ { t, kids, leaves } ], leaves }
    function outline() {
      const app = document.getElementById('app'); if (!app) return null;
      const h1 = app.querySelector('h1'), root = { t: h1 ? clean(h1) : document.title, kids: [], leaves: [] };
      const hs = [...app.querySelectorAll('h2, h3')].filter(h => !h.closest(SKIPIN));
      if (hs.length < 2) return null;
      const top = hs.some(h => h.tagName === 'H2') ? 'H2' : 'H3';
      let cur1 = null, cur = root;
      const add = (node, el) => {
        if (el.matches('table')) { el.querySelectorAll('tr').forEach(tr => { const td = [...tr.querySelectorAll('td')]; if (td.length >= 2) node.leaves.push(clean(td[0]) + ': ' + clean(td[td.length - 1])); else if (td.length) node.leaves.push(clean(td[0])); }); return; }
        if (el.matches('ul, ol')) { el.querySelectorAll(':scope > li').forEach(li => { const t = clean(li); if (t) node.leaves.push(t); }); return; }
        const t = clean(el); if (t.length > 2) node.leaves.push(t);
      };
      // walk the page in order: headings start branches; lists, tables and paragraphs become their points
      const walker = document.createTreeWalker(app, NodeFilter.SHOW_ELEMENT, { acceptNode: n => n.closest(SKIPIN) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      for (let el = walker.nextNode(); el; el = walker.nextNode()) {
        if (el.tagName === 'H1') continue;
        if (el.tagName === top) { cur1 = { t: clean(el), kids: [], leaves: [] }; root.kids.push(cur1); cur = cur1; continue; }
        if (/^H[2-4]$/.test(el.tagName)) { const n = { t: clean(el), kids: [], leaves: [] }; (cur1 || root).kids.push(n); cur = n; continue; }
        if (el.matches('ul, ol, table, p, blockquote') && !el.parentElement.closest('li, td, th, blockquote, ul, ol, table')) add(cur, el);
      }
      const prune = n => { n.kids = n.kids.filter(k => (prune(k), k.t && (k.leaves.length || k.kids.length))); return n; };
      prune(root);
      return root.kids.length >= 2 ? root : null;
    }
    function mindmap() {
      const o = outline(); if (!o) return;
      const cut = t => t.length > 140 ? t.slice(0, 140) + '…' : t;
      const leaves = n => n.leaves.slice(0, 14).map(l => `<li><span class="leaf">${nesc(cut(l))}</span></li>`).join('') + (n.leaves.length > 14 ? `<li><span class="leaf">… ${n.leaves.length - 14} more on the page</span></li>` : '');
      const branch = (n, lvl) => `<li><button type="button" class="node n${Math.min(lvl, 2)} ${lvl ? 'closed' : 'open'}" aria-expanded="${!lvl}">${nesc(n.t)}</button><ul ${lvl ? 'hidden' : ''}>${n.kids.map(k => branch(k, lvl + 1)).join('')}${leaves(n)}</ul></li>`;
      const w = document.createElement('div'); w.className = 'mm-wrap'; w.setAttribute('role', 'dialog'); w.setAttribute('aria-label', 'Mind map');
      w.innerHTML = `<div class="mm-top"><h2>🧠 Mind map</h2><button type="button" data-mm="all">Open all</button><button type="button" data-mm="none">Close all</button><button type="button" data-mm="x">✕ Close</button></div>
        <p class="small muted" style="margin:0 0 10px">Made from this page. Tap a branch to open it.</p><div class="mm"><ul>${branch(o, 0)}</ul></div>`;
      const key = e => { if (e.key === 'Escape') { w.remove(); document.removeEventListener('keydown', key); } };
      w.addEventListener('click', e => {
        const n = e.target.closest('.node'), b = e.target.closest('[data-mm]');
        if (n) { const ul = n.nextElementSibling, open = ul.hidden; ul.hidden = !open; n.classList.toggle('open', open); n.classList.toggle('closed', !open); n.setAttribute('aria-expanded', open); }
        if (b && b.dataset.mm === 'x') { w.remove(); document.removeEventListener('keydown', key); }
        if (b && (b.dataset.mm === 'all' || b.dataset.mm === 'none')) w.querySelectorAll('.mm .node').forEach((x, i) => { if (!i) return; const op = b.dataset.mm === 'all'; x.nextElementSibling.hidden = !op; x.classList.toggle('open', op); x.classList.toggle('closed', !op); });
      });
      document.addEventListener('keydown', key); document.body.appendChild(w);
    }
    // 🎧 two voices read the page: A introduces each part, B reads its points
    let POD = null;
    const enVoices = () => { try { const v = speechSynthesis.getVoices().filter(x => /^en/i.test(x.lang)); const pref = x => (/en-GB/i.test(x.lang) ? 4 : 0) + (/natural|neural|online|google/i.test(x.name) ? 3 : 0); return v.sort((a, b) => pref(b) - pref(a)); } catch (e) { return []; } };
    function podScript(o) {
      const lines = [['A', `Welcome! Today: ${o.t}. We will go through ${o.kids.length} parts: ${o.kids.map(k => k.t).join('; ')}.`, -1]];
      o.kids.forEach((k, i) => {
        lines.push(['A', `${i ? 'Next, part' : 'Part'} ${i + 1}: ${k.t}.`, i]);
        const pts = [...k.leaves, ...k.kids.flatMap(x => [x.t + '.', ...x.leaves])];
        pts.forEach(t => String(t).split(/([.!?]\s+)/).reduce((acc, bit, j, arr) => { if (j % 2 === 0 && bit.trim()) acc.push(bit.trim() + (arr[j + 1] ? arr[j + 1].trim() : '')); return acc; }, []).forEach(sn => lines.push(['B', sn, i])));
      });
      lines.push(['A', `That is the end of ${o.t}. Well done! Now test yourself with a quiz or flashcards.`, o.kids.length - 1]);
      return lines;
    }
    function podDraw() {
      const P = POD; if (!P) return; let bar = document.querySelector('.pod');
      if (!bar) { bar = document.createElement('div'); bar.className = 'pod'; bar.setAttribute('role', 'region'); bar.setAttribute('aria-label', 'Listen to the lesson'); document.body.appendChild(bar);
        bar.addEventListener('click', e => { const b = e.target.closest('[data-pod]'); if (!b || !POD) return; const a = b.dataset.pod;
          if (a === 'x') podStop(); else if (a === 'pp') { POD.playing ? podPause() : podPlay(); } else if (a === 'next' || a === 'prev') podJump(a === 'next' ? 1 : -1);
          else if (a === 'slow') { POD.rate = POD.rate < 0.9 ? 1 : 0.8; if (POD.playing) { podPause(); podPlay(); } else podDraw(); } }); }
      const cur = P.lines[P.i] || P.lines[P.lines.length - 1], part = cur[2] >= 0 ? `Part ${cur[2] + 1} of ${P.o.kids.length}: ${P.o.kids[cur[2]].t}` : 'Introduction';
      bar.innerHTML = `<div><b>🎧 ${nesc(P.o.t)}</b> <span style="opacity:.75">· ${nesc(part)}</span></div><div class="now">${cur[0] === 'A' ? '🎙️' : '📖'} ${nesc(cur[1])}</div>
        <div class="row2"><button type="button" data-pod="prev" aria-label="Previous part">⏮</button><button type="button" data-pod="pp" class="on">${P.playing ? '⏸ Pause' : '▶️ Play'}</button><button type="button" data-pod="next" aria-label="Next part">⏭</button>
        <button type="button" data-pod="slow" class="${P.rate < 0.9 ? 'on' : ''}">🐢 Slower</button><span style="flex:1"></span><button type="button" data-pod="x">✕ Close</button></div>
        <div style="font-size:12px;opacity:.7;margin-top:4px">Read from this page by your device's voices. Nothing new is added.</div>`;
    }
    function podSpeak() {
      const P = POD; if (!P || !P.playing) return;
      if (P.i >= P.lines.length) { P.playing = false; P.done = true; P.i = P.lines.length - 1; podDraw(); return; }
      const who = P.lines[P.i][0], text = say1(P.lines[P.i][1]), vs = enVoices(), u = new SpeechSynthesisUtterance(text);
      const v = vs.length ? vs[who === 'A' ? 0 : Math.min(1, vs.length - 1)] : null; if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-GB';
      u.rate = P.rate; u.pitch = vs.length > 1 ? 1 : (who === 'A' ? 1.1 : 0.85);
      const token = P.token = (P.token || 0) + 1;
      u.onend = () => { if (POD !== P || token !== P.token || !P.playing) return; P.i++; podDraw(); setTimeout(podSpeak, who === 'A' ? 350 : 200); };
      u.onerror = u.onend; speechSynthesis.speak(u); podDraw();
    }
    function podPlay() { if (!POD) return; try { speechSynthesis.cancel(); } catch (e) {} if (POD.done) { POD.done = false; POD.i = 0; } POD.playing = true; podSpeak(); }   // ▶️ after the end starts again
    function podPause() { if (!POD) return; POD.playing = false; POD.token = (POD.token || 0) + 1; try { speechSynthesis.cancel(); } catch (e) {} podDraw(); }
    function podStop() { if (POD) POD.token = (POD.token || 0) + 1; POD = null; try { speechSynthesis.cancel(); } catch (e) {} const b = document.querySelector('.pod'); if (b) b.remove(); }
    function podJump(d) { const P = POD; if (!P) return; P.done = false; const curPart = (P.lines[P.i] || [0, 0, -1])[2], target = Math.max(-1, Math.min(P.o.kids.length - 1, curPart + d));
      const k = P.lines.findIndex(l => l[2] === target && (target < 0 || l[0] === 'A')); P.i = k < 0 ? 0 : k; if (P.playing) podPlay(); else podDraw(); }
    function podcast() { const o = outline(); if (!o || !('speechSynthesis' in window)) return; podStop(); POD = { o, lines: podScript(o), i: 0, rate: 1, playing: false, token: 0 }; podPlay(); }
    const addBar = () => {
      const app = document.getElementById('app'); if (!app || app.querySelector('.nlm')) return;
      if (/^#?\/?$/.test(location.hash) || NOTNOTES.test(location.hash) || app.querySelector('textarea, input[type=text], input[type=search], select, input[type=range]')) return;
      if ((app.textContent || '').length < 600 || !outline()) return;
      const bar = document.createElement('div'); bar.className = 'nlm noprint';
      bar.innerHTML = `<button type="button" data-nlm="map">🧠 Mind map</button>${LANGSITE ? '' : '<button type="button" data-nlm="pod">🎧 Listen to the lesson</button>'}`;
      const h1 = app.querySelector('h1'); if (h1 && h1.parentNode) h1.insertAdjacentElement('afterend', bar); else app.insertBefore(bar, app.firstChild);
    };
    document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('[data-nlm]'); if (!b) return; if (b.dataset.nlm === 'map') mindmap(); else podcast(); });
    addEventListener('hashchange', () => { if (POD && !POD.playing) podStop(); });
    let nq = false; const nqueue = () => { if (nq) return; nq = true; setTimeout(() => { nq = false; addBar(); }, 120); };
    const nwatch = () => { const a = document.getElementById('app'); if (!a) return setTimeout(nwatch, 300); new MutationObserver(nqueue).observe(a, { childList: true }); nqueue(); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', nwatch); else nwatch();
  } catch (e) {}
  // 📊 Sunday survey (user 2026-10-25: "a pop up survey percentage at the beginning of each site telling how much benefit they
  // get"; one overall %; then "show pop up screen on sundays starting 11 pm one time only not everytime they open assuring they
  // see either to choose or press anywhere on the screen to skip"): from Sunday 11 pm UAE time, the first time this device opens
  // this site, ONE question: how much does this site help you? (0–100%; nothing is chosen until tapped). Chosen or skipped (a tap
  // anywhere outside the box) = not asked again until the next Sunday 11 pm; left open and the page closed = asked again next time.
  // Only on devices that first opened the site by the Thursday before; never on the owner's devices or show links. The pop-up
  // never says "week"/"weekly" (user: "don't write weekly"). The server keeps totals per site and round only: owner page 📊 Survey %.
  // Launch round (user 2026-10-25: "no launch it now"): until the first Sunday round (1 Nov, 11 pm) every device is asked once,
  // straight away, with no "used since Thursday" wait; then the Sunday rounds go on as above.
  // 👀 Preview for the owner (user 2026-10-25: "pop up percent not showing" — it never shows on the owner's own devices):
  // <site>/?rate=preview shows it at once on any device; nothing is sent or remembered.
  try {
    const own = (() => { try { return localStorage.getItem('vown') === '1'; } catch (e) { return true; } })();
    const preview = /[?&]rate=preview(?:&|$)/.test(location.search);
    if ((/\.workers\.dev$/.test(location.hostname) && !GUEST && !own && navigator.sendBeacon) || preview) {
      const now = new Date(Date.now() + 4 * 3600e3), today = now.toISOString().slice(0, 10);   // UAE time, in the UTC fields
      const st = new Date(now.getTime() - 23 * 3600e3); st.setUTCDate(st.getUTCDate() - st.getUTCDay());
      let wk = st.toISOString().slice(0, 10);   // the Sunday whose 11 pm (UAE) started this survey round
      // restarted 25 Oct (user: "reset counting percentage and start showing the pop again"): 'launch2', so everyone is asked again
      const launch = wk < '2026-11-01'; if (launch) wk = 'launch2';
      let first = today, done = wk;
      try { first = localStorage.getItem('rate-first') || ''; if (!first) { first = today; localStorage.setItem('rate-first', today); } done = localStorage.getItem('rate-wk') || ''; } catch (e) {}
      if (preview || (done !== wk && (launch || Date.parse(wk) - Date.parse(first) >= 3 * 864e5))) {   // used since Thursday or before: a new device waits for the next Sunday
        const hs = location.hostname.split('.')[0].split('-'), sub = hs[1] || '';
        const name = 'Year ' + ((hs[0].match(/\d+/) || [''])[0]) + ' ' + (sub === 'math' ? 'Maths' : sub.charAt(0).toUpperCase() + sub.slice(1));
        let tries = 0;
        const show = () => {
          // wait while something else is on screen (launch splash, another pop-up, the update bar) or the student is typing
          const ae = document.activeElement || {};
          const seen = el => !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);   // hidden panels don't count
          const busy = [...document.querySelectorAll('#splash, .ms-wrap, .pl-splash, .upd-bar, .rate-wrap, [role="dialog"], [aria-modal="true"]')].some(seen)
            || /^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName || '') || ae.isContentEditable;
          if (busy || document.visibilityState !== 'visible') { if (++tries < 200) setTimeout(show, 3000); return; }   // look again every 3 s (up to 10 min)
          const css = document.createElement('style');
          css.textContent = '.rate-wrap{position:fixed;inset:0;z-index:9998;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;padding:16px}'
            + '.rate-card{background:var(--card,#fff);color:var(--ink,#1d2433);max-width:380px;width:100%;border-radius:20px;padding:20px 18px 16px;box-shadow:0 20px 50px rgba(0,0,0,.35);text-align:center;font-family:inherit}'
            + '.rate-card h2{margin:4px 0 6px;font-size:20px;line-height:1.3}.rate-card p{margin:0 0 12px;color:var(--muted,#5b6475);font-size:14px}'
            + '.rate-val{font-size:34px;font-weight:800;line-height:1.1;margin:2px 0 4px;color:var(--brand,#4F46E5)}.rate-val.wait{font-size:15px;font-weight:600;color:var(--muted,#5b6475);padding:9px 0}'
            + '.rate-range{width:100%;height:30px;margin:0;accent-color:var(--brand,#4F46E5);cursor:pointer}.rate-range.untouched{accent-color:#98a2b3;opacity:.75}'
            + '.rate-ends{display:flex;justify-content:space-between;font-size:12.5px;color:var(--muted,#5b6475);margin:2px 2px 14px}'
            + '.rate-go{border:0;border-radius:12px;padding:11px 24px;font:inherit;font-weight:800;background:var(--brand,#4F46E5);color:#fff;cursor:pointer}.rate-go:disabled{opacity:.45;cursor:default}'
            + '.rate-later{display:block;margin:12px auto 0;border:0;background:none;color:var(--muted,#5b6475);font:inherit;font-size:13.5px;cursor:pointer}'
            + '.rate-opts{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:4px 0 10px}.rate-opt{border:1px solid var(--line,#d0d5dd);background:var(--card,#fff);color:inherit;border-radius:999px;padding:7px 12px;font:inherit;font-size:14px;cursor:pointer}'
            + '.rate-opt[aria-pressed="true"]{background:var(--brand,#4F46E5);border-color:var(--brand,#4F46E5);color:#fff}'
            + '.rate-more{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:8px 10px;border-radius:10px;border:1px solid var(--line,#d0d5dd);background:var(--card,#fff);color:inherit;margin:0 0 10px;resize:vertical}';
          document.head.appendChild(css);
          const w = document.createElement('div'); w.className = 'rate-wrap';
          w.setAttribute('role', 'dialog'); w.setAttribute('aria-modal', 'true'); w.setAttribute('aria-labelledby', 'rate-t');
          w.innerHTML = '<div class="rate-card"><div style="font-size:30px" aria-hidden="true">📊</div><h2 id="rate-t">How much does ' + name + ' help you with your studies?</h2>'
            // user 2026-10-25: "add a message before selecting percent that it's ok not to like it 100% but you can help us to be more useful for you"
            + '<p style="color:var(--ink,#1d2433);font-size:15px">💬 It’s OK if it isn’t 100% for you! Please be honest: your answer helps us make this site more useful for you.</p>'
            + '<p>No names.</p>' + (preview ?'<p><b>👀 Preview: your answer is not saved.</b></p>' : '')
            + '<div class="rate-val wait" aria-live="polite">👉 Slide to choose</div>'
            + '<input type="range" class="rate-range untouched" min="0" max="100" step="10" value="50" aria-label="How much it helps, in percent">'
            + '<div class="rate-ends"><span>😕 0% not at all</span><span>a lot 100% 🤩</span></div>'
            + '<button type="button" class="rate-go" disabled>Send</button><button type="button" class="rate-later">or tap anywhere outside this box to skip</button></div>';
          let pick = null;
          const mark = () => { if (preview) return; try { localStorage.setItem('rate-wk', wk); } catch (e) {} };
          const close = () => { mark(); w.remove(); css.remove(); document.removeEventListener('keydown', key); };
          const key = e => { if (e.key === 'Escape') close(); };
          // the slider starts grey with no number shown; Send works only after the student moves it (user 2026-10-25: "make in sliding")
          const rg = w.querySelector('.rate-range'), val = w.querySelector('.rate-val');
          const moved = () => { pick = rg.value; rg.classList.remove('untouched'); val.classList.remove('wait'); val.textContent = pick + '%'; w.querySelector('.rate-go').disabled = false; };
          rg.addEventListener('input', moved); rg.addEventListener('change', moved); rg.addEventListener('click', moved);   // a tap on the middle = 50%
          const card = w.querySelector('.rate-card');
          const thanks = (h, p, ms) => { card.innerHTML = '<div style="font-size:34px" aria-hidden="true">💛</div><h2>' + h + '</h2>' + (p ? '<p>' + p + '</p>' : ''); setTimeout(close, ms); };
          w.querySelector('.rate-go').onclick = () => {
            if (pick === null) return;
            mark(); if (!preview) navigator.sendBeacon('/__rate?p=' + pick);
            if (+pick >= 100) { thanks('Thank you for telling us!', '', 1800); return; }
            // less than 100%: what would make it 100%? (user 2026-10-25: "when a student chooses less than 100% can we add anything
            // asking him to interact to improve to be fully satisfied"). Tap any ideas and / or type; it arrives in 📣 Tell us,
            // so the owner reads it in 💬 Messages and can reply. Optional: tap outside, Esc or the skip line to leave.
            const OPTS = ['📝 More practice questions', '💡 Clearer explanations', '🎯 More on my test topics', '📱 Easier to use on my phone', '🚩 Fix mistakes', '🎮 More fun'];
            card.innerHTML = '<div style="font-size:30px" aria-hidden="true">💛</div><h2 id="rate-t">Thank you! What would make it 100%?</h2>'
              + '<p>Tap anything that would help (more than one is fine).</p>' + (preview ? '<p><b>👀 Preview: nothing is sent.</b></p>' : '')
              + '<div class="rate-opts" role="group" aria-label="What would make it 100%">' + OPTS.map(o => '<button type="button" class="rate-opt" aria-pressed="false">' + o + '</button>').join('') + '</div>'
              + '<textarea class="rate-more" rows="2" maxlength="500" placeholder="Anything else? (optional, no names please)" aria-label="Anything else?"></textarea>'
              + '<button type="button" class="rate-go" disabled>📨 Send</button><button type="button" class="rate-later">or tap anywhere outside this box to skip</button>';
            const go = card.querySelector('.rate-go'), more = card.querySelector('.rate-more');
            const ready = () => { go.disabled = !(card.querySelector('.rate-opt[aria-pressed="true"]') || more.value.trim()); };
            card.querySelectorAll('.rate-opt').forEach(b => { b.onclick = () => { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') !== 'true'); ready(); }; });
            more.addEventListener('input', ready);
            card.querySelector('.rate-later').onclick = close;
            go.onclick = () => {
              const ideas = [...card.querySelectorAll('.rate-opt[aria-pressed="true"]')].map(b => b.textContent), typed = more.value.trim();
              if (!ideas.length && !typed) return;
              const text = 'Survey: ' + pick + '% · to make it 100%: ' + (ideas.join(', ') || '(nothing ticked)') + (typed ? '\nWhy: ' + typed : '');
              if (!preview) fetch('/api/chat', { method: 'POST', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ t: chatId(true), kind: 'improve', text, page: 'Survey pop-up', url: location.pathname + location.hash }) }).catch(() => {});
              if (window.SITE_USE && !preview) SITE_USE('tool-msg');
              thanks('Thank you!', 'The parent who made this site will read it. If there is a reply, the 📣 Tell us button blinks.', 3200);
            };
            setTimeout(() => { const f = card.querySelector('.rate-opt'); if (f) f.focus({ preventScroll: true }); }, 50);
          };
          w.querySelector('.rate-later').onclick = close;
          // a tap on the dark screen around the box = skip (only when the tap starts there too, so letting go of the slider
          // outside the box doesn't close it)
          let downOut = false;
          w.addEventListener('pointerdown', e => { downOut = e.target === w; });
          w.addEventListener('click', e => { if (e.target === w && downOut) close(); });
          document.addEventListener('keydown', key);
          document.body.appendChild(w);
          rg.focus({ preventScroll: true });
        };
        setTimeout(show, preview ? 1500 : 4000);
      }
    }
  } catch (e) {}
  // ⬇️ files downloaded, opened or printed (user 2026-10-23: "if someone downloaded let me know"; for show links "let me know how
  // they use it and if they download from it"): the file's name goes to the owner's page, as a total (students, no device
  // number) or with the show-link visit's own number. Own backups (.json) and calendar reminders (.ics) are not counted.
  try {
    const gv = GUEST && sget('gtok'), own = !GUEST && (() => { try { return localStorage.getItem('vown') === '1'; } catch (e) { return false; } })();
    if (!own && navigator.sendBeacon && (gv ? /^[a-f0-9]{32}$/.test(gv) : /\.workers\.dev$/.test(location.hostname))) {
      const FILE = /\.(pdf|docx?|pptx?|xlsx?|zip)(?=$|[?#])/i, sent = {};
      const fileUse = (kind, name) => {
        name = String(name || '').trim().slice(0, 80); if (!name || /\.(json|ics)$/i.test(name)) return;
        const key = kind + ':' + name; if (Date.now() - (sent[key] || 0) < 5000) return; sent[key] = Date.now();
        navigator.sendBeacon((gv ? '/__guestuse?g=' + gv : '/__visit?p=' + encodeURIComponent(partNow())) + '&dl=' + kind + '&f=' + encodeURIComponent(name));
      };
      const nameOf = a => {   // the file's own name; past papers also say which paper, e.g. "Paper 2F · June 2019 QP.pdf"
        if (a.getAttribute('download')) return a.getAttribute('download');
        let u; try { u = new URL(a.href, location.href); } catch (e) { return ''; }
        let n = ''; try { n = decodeURIComponent(u.pathname.split('/').pop() || ''); } catch (e) { n = u.pathname.split('/').pop() || ''; }
        const pp = u.pathname.match(/Paper-(\w+)/i); return (pp && n.indexOf(pp[1]) < 0 ? 'Paper ' + pp[1] + ' · ' : '') + n;
      };
      const linkUse = a => { if (a.hasAttribute('download')) fileUse('dl', nameOf(a)); else if (FILE.test((a.href || '').split('#')[0])) fileUse('file', nameOf(a)); };
      document.addEventListener('click', e => {   // a tap on a download or file link
        if (!e.isTrusted) return;
        const a = e.target.closest && e.target.closest('a[href]'); if (a) linkUse(a);
        const pb = e.target.closest && e.target.closest('[data-act="pdfprint"][data-f]');   // 🖨️ a PDF printed from its own frame
        if (pb) { fileUse('print', nameOf({ getAttribute: () => '', href: pb.getAttribute('data-f') })); window.__pdfPrinted = Date.now(); }
      }, true);
      const aClick = HTMLAnchorElement.prototype.click;   // files the site makes and saves itself (e.g. a worksheet PDF)
      HTMLAnchorElement.prototype.click = function () { try { if (this.hasAttribute('download')) fileUse('dl', nameOf(this)); } catch (e) {} return aClick.apply(this, arguments); };
      addEventListener('beforeprint', () => {   // 🖨️ a page printed: the part of the site and its heading, e.g. "Exam page · P1 Energy"
        if (Date.now() - (window.__pdfPrinted || 0) < 5000) return;
        const h = document.querySelector('#print h1, #print h2, #print h3') || document.querySelector('#app h2') || document.querySelector('#app h1');
        fileUse('print', [uname0(partNow()), h && h.textContent.replace(/\s+/g, ' ').trim().slice(0, 50)].filter(Boolean).join(' · '));
      });
      const uname0 = p => p ? p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ') + ' page' : 'Home page';
    }
  } catch (e) {}

  const YR = (document.title.match(/^Year (\d+)/) || [])[1] || '';   // link back to the year group's page
  const TERMS = !/Science/.test(document.title);   // Science already shows every term and unit on its own pages
  function addBars() {
    const app = document.getElementById('app'); if (!app) return;
    if (!app.querySelector(':scope > .flagbar')) {
      const d = document.createElement('div'); d.className = 'flagbar';
      d.innerHTML = (canSpeak ? `<button type="button" class="readbtn">${speaking ? '⏹ Stop reading' : '🔊 Read aloud'}</button>` : '')
        + `<button type="button" class="bigbtn" aria-pressed="${bigOn()}">A+ Bigger text</button>`
        + (GUEST ? '<p class="guestline small">👀 Guest view, shown to you only: please don’t share this site or its address. Nothing you do is saved on this device.</p>'
          : `<div class="ratebar small">${sget('rated:' + partNow()) ? 'Thank you for your answer!' : 'Was this page helpful? <button type="button" class="rateup" aria-label="Yes, it was helpful">👍</button><button type="button" class="ratedn" aria-label="No, it was not helpful">👎</button>'}</div>`)
        + `<div class="flagmsg small" role="status"></div>`
        + (YR ? `<a class="yrlink small" href="https://year${YR}.deirarevise.workers.dev/">🏠 All Year ${YR} subjects</a>` : '')
        + (SHARE ? `<p class="copyline">© 2026. A free study site made voluntarily by a parent. Exam questions and mark schemes © Pearson Education Ltd, used for free, non-commercial practice; video links go to Corbettmaths. You are welcome to share this link.</p>`
          : `<p class="copyline">© 2026. Notes, quizzes and study plans made for these revision sites. Lesson slides belong to the school, and textbook and story extracts belong to their publishers and authors; they are used here only to help the class revise. Please don't copy or share these sites outside the class.</p>`)
        + `<p class="dedication" dir="rtl" lang="ar"><b>الحمد لله الذي بنعمته تتمّ الصالحات.<br>بفضل الله وتوفيقه تمّ هذا العمل، ليكون صدقةً جاريةً عنّي وعن والديّ الكريمين.<br>نسأل الله العليّ القدير أن يجعل فيه النفع والبركة لكلّ طالب علمٍ يمرّ من هنا، وأن يتقبّله منّا بقبولٍ حسن، ويجعله في ميزان حسناتنا جميعًا.<br>ولا تنسوني وأولادي من صالح دعائكم. 🤲</b></p>`
        + `<p class="dedication en" lang="en"><b>All praise is due to Allah, by whose grace good deeds are completed.<br>By the grace of Allah and His help, this work was completed, as an ongoing charity (sadaqah jariyah) for me and my dear parents.<br>We ask Allah, the Most High, the Almighty, to make it useful and blessed for every student who passes by here, to accept it from us, and to place it in the scale of good deeds for all of us.<br>Please remember me and my children in your prayers. 🤲</b></p>`;
      if (!GUEST) {
        // 👍/👎 one tap per part of the site per visit: only totals go to the owner's page (no names, no device number)
        const rb = d.querySelector('.ratebar'), rate = up => {
          sset('rated:' + partNow(), up ? 'up' : 'dn'); if (window.SITE_USE) SITE_USE((up ? 'up-' : 'dn-') + partNow());
          rb.innerHTML = up ? 'Thank you! 👍' : 'Thank you for telling us. <button type="button" class="ratewhy">Tell us what to improve</button>';
          // 👎: ask why straight away (user, 23 Oct 2026: a 👎 on Y9 Maths gave no reason, and 👍/👎 are anonymous, so the student
          // could not be asked later): 📣 Tell us opens at 🛠️ Make it better with the question; the student can just close it
          const why = () => { chat('improve'); const l = document.querySelector('.chatside .sayform label'); if (l) l.textContent = 'What didn’t you like about this page? What would make it better?'; };
          const w = rb.querySelector('.ratewhy'); if (w) w.onclick = why;
          if (!up) why();
        };
        if (rb.querySelector('.rateup')) { rb.querySelector('.rateup').onclick = () => rate(true); rb.querySelector('.ratedn').onclick = () => rate(false); }
      }
      d.querySelector('.bigbtn').onclick = e => { setBig(!bigOn()); e.currentTarget.setAttribute('aria-pressed', bigOn()); };
      if (canSpeak) d.querySelector('.readbtn').onclick = e => speak(e.currentTarget);
      app.appendChild(d);
    }
    chatTab();
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
        const items = NEWS.filter(([d, , only]) => forSite(only, document.title) && Date.now() - Date.parse(d) < 14 * 864e5);
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
  css.textContent = `.flagbar { margin: 32px 0 76px; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
.flagbar .flagmsg { flex-basis: 100%; }
.flagpanel { color: var(--ink, #1d2433); text-align: left; max-width: 520px; margin: 8px auto 0; padding: 12px; border-radius: 12px; border: 1px solid var(--line, #E2E8F0); background: var(--card, #fff); }
.flagpanel textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 16px; padding: 8px; border-radius: 8px; border: 1px solid var(--line, #CBD5E1); background: transparent; color: inherit; }
.flagbtns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
.flagbtns a, .flagbtns button { padding: 8px 14px; border-radius: 999px; font: inherit; font-size: 15px; font-weight: 600; cursor: pointer; text-decoration: none; border: 1px solid var(--line, #CBD5E1); background: var(--card, #fff); color: inherit; }
.flagbtns .flagsend { background: var(--brand, #1D4ED8); border-color: var(--brand, #1D4ED8); color: #fff; } .flagbtns .flagsend:disabled { opacity: .6; }
.flagbar .yrlink { flex-basis: 100%; text-align: center; margin-top: 4px; }
.flagbar .ratebar { flex-basis: 100%; text-align: center; color: var(--muted, #5B6475); display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; align-items: center; }
.flagbar .ratebar button { padding: 4px 12px; font-size: 18px; }
.flagbar .ratebar .ratewhy { font-size: 14px; }
.flagbar .guestline { flex-basis: 100%; text-align: center; margin: 0; font-weight: 600; }
.chatkinds { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.chatlog { display: grid; gap: 6px; margin: 8px 0 0; max-height: 280px; overflow-y: auto; }
.chatlog:empty { display: none; }
.chatlog .cb { max-width: 85%; padding: 8px 12px; border-radius: 14px; overflow-wrap: anywhere; }
.chatlog .cbnew { animation: cbnew 1s ease-in-out 4; outline: 2px solid #DC2626; }
@keyframes cbnew { 50% { outline-color: #1D4ED8; background: color-mix(in srgb, #DC2626 14%, transparent); } }
.chatlog .cb small { display: block; font-size: 11.5px; opacity: .8; margin-top: 2px; }
.chatlog .me { justify-self: end; background: color-mix(in srgb, var(--brand, #1D4ED8) 14%, transparent); border-bottom-right-radius: 4px; }
.chatlog .them { justify-self: start; background: color-mix(in srgb, var(--muted, #5B6475) 14%, transparent); border-bottom-left-radius: 4px; }
.chatbadge { display: inline-block; margin-left: 4px; padding: 1px 8px; border-radius: 999px; background: var(--brand, #1D4ED8); color: #fff; font-size: 12px; font-weight: 700; }
.chattab { position: fixed; z-index: 58; right: max(14px, env(safe-area-inset-right, 0px)); bottom: calc(var(--chatnav, 0px) + 14px + env(safe-area-inset-bottom, 0px)); display: inline-flex; align-items: center; gap: 8px; padding: 13px 20px; border: 0; border-radius: 999px; background: var(--brand, #1D4ED8); color: #fff; font: inherit; font-size: 16px; font-weight: 700; line-height: 1.2; cursor: pointer; box-shadow: 0 6px 22px rgba(0,0,0,.28); }
.chattab:hover { filter: brightness(1.08); }
/* 📣 Tell us in the top bar (23 Oct 2026): a pill with its name, before 🤖 Ask AI; the pop-up opens under it */
.chattab.chattop { position: relative; right: auto; bottom: auto; margin-left: auto; flex: none; padding: 7px 13px; font-size: 14.5px; box-shadow: none; gap: 5px; }
.chattab.chattop + .ask-fab.ask-top { margin-left: 6px; }
@media (min-width: 601px) and (min-height: 501px), (min-width: 951px) { html.chat-top .chatside { top: calc(env(safe-area-inset-top, 0px) + 64px); bottom: auto; max-height: calc(100vh - 80px); } }   /* phones keep the full-screen chat */
/* phones: the site name, 📣 Tell us and 🤖 Ask AI stay on one line (the name gets smaller, and "…" only if it still doesn't fit) */
@media (max-width: 420px) {
  html.chat-top header .bar { flex-wrap: nowrap; gap: 8px; }
  html.chat-top header .bar .logo { font-size: 16px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .chattab.chattop, .chattab.chattop + .ask-fab.ask-top { padding: 6px 8px; font-size: 13px; }
  .chattab.chattop + .ask-fab.ask-top { margin-left: 4px; }
}
.guestbadge { position: fixed; z-index: 58; right: max(14px, env(safe-area-inset-right, 0px)); bottom: calc(var(--chatnav, 0px) + 14px + env(safe-area-inset-bottom, 0px)); padding: 9px 14px; border-radius: 999px; background: #1F2937; color: #fff; font-size: 14px; font-weight: 600; box-shadow: 0 4px 14px rgba(0,0,0,.25); pointer-events: none; }
.chattab .chatcount { position: absolute; top: -8px; right: -6px; min-width: 24px; height: 24px; padding: 0 6px; box-sizing: border-box; border-radius: 12px; background: #DC2626; color: #fff; border: 2px solid #fff; font-size: 13px; font-weight: 800; line-height: 20px; text-align: center; }
.chattab:focus-visible { outline: 3px solid #93C5FD; outline-offset: 3px; }
.chattab.chatnew { animation: chatflash 1.1s ease-in-out infinite; }
@keyframes chatflash { 0%, 49% { background: #1D4ED8; box-shadow: 0 0 0 0 rgba(37,99,235,.75); } 50%, 100% { background: #DC2626; box-shadow: 0 0 0 12px rgba(220,38,38,0); } }   /* blinks red and blue (user 2026-10-21) */
/* computers with "animation effects" turned off (prefers-reduced-motion) still blink, by colour only, nothing moves (user 2026-10-21:
   "the icon is not blinking as requested") */
@keyframes chatblink { 0%, 49% { background: #1D4ED8; } 50%, 100% { background: #DC2626; } }
@media (prefers-reduced-motion: reduce) { .chattab.chatnew { animation: chatblink 1.4s linear infinite; outline: 3px solid #93C5FD; } }
.chatside { position: fixed; z-index: 59; right: max(8px, env(safe-area-inset-right, 0px)); bottom: calc(var(--chatnav, 0px) + 78px + env(safe-area-inset-bottom, 0px)); width: min(400px, calc(100vw - 16px)); max-height: calc(100vh - var(--chatnav, 0px) - 150px); overflow-y: auto; box-sizing: border-box; padding: 12px 14px; border-radius: 16px; border: 2px solid var(--brand, #1D4ED8); background: var(--card, #fff); color: var(--ink, #1d2433); box-shadow: 0 12px 40px rgba(0,0,0,.25); text-align: left; }
/* phones (portrait, or landscape with a short screen): the chat opens full screen; tablets and laptops keep the pop-up beside the page */
@media (max-width: 600px), (max-width: 950px) and (max-height: 500px) {
  /* a small round 🚩 in the corner, so it never covers an answer (a student, 21 Oct: "i cant pick my option for the question": the
     wide button sat on the last option); it grows again to say "New reply!" when there is one */
  .chattab:not(.chatnew):not(.chattop) { width: 50px; height: 50px; padding: 0; justify-content: center; font-size: 22px; right: max(10px, env(safe-area-inset-right, 0px)); bottom: calc(var(--chatnav, 0px) + 10px + env(safe-area-inset-bottom, 0px)); }
  .chattab:not(.chatnew):not(.chattop) .chattab-t { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
  .chatside { z-index: 1000; inset: 0; width: auto; max-height: none; border: 0; border-radius: 0; box-shadow: none; padding: calc(14px + env(safe-area-inset-top, 0px)) max(16px, env(safe-area-inset-right, 0px)) calc(16px + env(safe-area-inset-bottom, 0px)) max(16px, env(safe-area-inset-left, 0px)); }
  .chatside .chathead { position: sticky; top: calc(-14px - env(safe-area-inset-top, 0px)); background: var(--card, #fff); padding: 6px 0; z-index: 1; font-size: 17px; }
  .chatside .chatlog { max-height: none; }
}
.chatside .chathead { display: flex; align-items: center; gap: 8px; }
.chatside .chathead b { flex: 1; }
.chatside .chatx { padding: 4px 10px; border-radius: 999px; border: 1px solid var(--line, #CBD5E1); background: transparent; color: inherit; font: inherit; cursor: pointer; }
.chatside textarea { width: 100%; box-sizing: border-box; font: inherit; font-size: 16px; padding: 8px; border-radius: 8px; border: 1px solid var(--line, #CBD5E1); background: transparent; color: inherit; }
.chatside .chatkind { padding: 6px 12px; border-radius: 999px; border: 1px solid var(--line, #CBD5E1); background: transparent; color: inherit; font: inherit; font-size: 14px; cursor: pointer; }
/* 📣 Tell us: five big cards, each with its own colour; nothing is coloured in until the student taps one */
.chatside .saywhat { margin: 10px 0 6px; font-weight: 700; }
.chatside .saycards { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
.chatside .saycard { --sayc: var(--brand, #1D4ED8); display: grid; grid-template-columns: auto 1fr; column-gap: 8px; align-items: center; text-align: left; padding: 10px 12px; border-radius: 14px; border: 1.5px solid var(--line, #CBD5E1); background: color-mix(in srgb, var(--sayc) 6%, var(--card, #fff)); color: inherit; font: inherit; cursor: pointer; transition: transform .12s; }
.chatside .saycard:hover { transform: translateY(-1px); border-color: var(--sayc); }
.chatside .saycard .sayi { grid-row: span 2; font-size: 24px; line-height: 1; }
.chatside .saycard b { font-size: 15px; line-height: 1.25; }
.chatside .saycard small { font-size: 12.5px; line-height: 1.3; color: var(--muted, #5B6475); }
.chatside .saycard:last-child:nth-child(odd) { grid-column: 1 / -1; }
.chatside .saycard[data-k="mistake"] { --sayc: #DC2626; } .chatside .saycard[data-k="add"] { --sayc: #16A34A; } .chatside .saycard[data-k="opinion"] { --sayc: #DB2777; }
.chatside .saycard[data-k="often"] { --sayc: #2563EB; } .chatside .saycard[data-k="improve"] { --sayc: #D97706; }
.chatside .saycard[aria-pressed="true"] { border-color: var(--sayc); background: color-mix(in srgb, var(--sayc) 16%, var(--card, #fff)); box-shadow: 0 0 0 2px color-mix(in srgb, var(--sayc) 35%, transparent); }
.chatside .sayq { margin: 10px 0 4px; font-weight: 600; font-size: 14px; }
.chatside .sayrow { display: flex; flex-wrap: wrap; gap: 6px; }
.chatside .saychip { padding: 7px 12px; border-radius: 999px; border: 1px solid var(--line, #CBD5E1); background: transparent; color: inherit; font: inherit; font-size: 14px; cursor: pointer; }
.chatside .saychip[aria-pressed="true"] { border-color: var(--brand, #1D4ED8); background: color-mix(in srgb, var(--brand, #1D4ED8) 14%, transparent); font-weight: 700; }
@media (max-width: 340px) { .chatside .saycards { grid-template-columns: 1fr; } }
.chatside .chatkind[aria-pressed="true"] { border-color: var(--brand, #1D4ED8); background: color-mix(in srgb, var(--brand, #1D4ED8) 14%, transparent); font-weight: 700; }
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
    new MutationObserver(addBars).observe(app, { childList: true }); addBars(); checkReplies();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else watch();
  window.HELP = { view };
})();
// 🔄 Automatic updates (user 2026-10-19: "sometimes even with refresh the updates not applied until i close and open";
// 2026-10-20: "i want the updates to refresh automatically like any live website").
// Every minute, and whenever the student comes back to the tab, fetch this page fresh: if it loads any script version (?v=)
// that this open page does not have, the site was updated. The new version then loads BY ITSELF at a safe moment:
//  • the student opens another page of the site (they land on that page, already updated),
//  • the student comes back to the site from another app or tab,
//  • the Home page has had no typing or tapping for 20 seconds.
// Never while an answer box is in use. "✨ Site updated" shows for a few seconds afterwards. If no safe moment comes within
// 5 minutes (e.g. a long timed paper), the old tap-to-update bar appears instead, so nothing is lost mid-answer.
// 2026-10-20 (user: "can pages auto refresh every minute but with saving the job if refresh in the middle of writing something
// to solving or doing anything"): on the subject sites (they save quizzes and papers in progress: keepSession) the update now
// loads within about a minute ANYWHERE, at the first pause of 4 seconds in typing, and not while a video, Read aloud or the AI
// chat is on. Just before, everything typed on the page, the cursor and the scroll position are saved; after the reload they
// are put back and the quiz or paper carries on where it was. Maths keeps the safe moments above.
(function () {
  const mine = () => new Set([...document.scripts].map(s => s.getAttribute('src') || '').filter(s => s.includes('?v=')));   // read at check time: the whole page has loaded by then
  let ready = 0, last = 0, lastIn = Date.now(), lastKey = 0, barShown = false;
  const typing = () => { const a = document.activeElement; return !!a && a.matches('input, textarea, select, [contenteditable=""], [contenteditable="true"]'); };
  const atHome = () => /^#?\/?$/.test(location.hash);
  const go = () => { try { sessionStorage.setItem('site-updated', '1'); } catch (e) {} location.reload(); };
  async function check() {
    // only while the page is on screen, at most every 10 minutes (each check is a request; the daily free limit is 100,000)
    if (ready || document.visibilityState !== 'visible' || Date.now() - last < 600000) return; last = Date.now();
    try {
      const r = await fetch(location.pathname + '?u=' + Date.now(), { cache: 'no-store', credentials: 'same-origin' });
      if (!r.ok) return;
      const t = await r.text();
      const fresh = [...t.matchAll(/<script[^>]*\ssrc="([^"]*\?v=[^"]*)"/g)].map(m => m[1].replace(/&amp;/g, '&'));
      const have = mine(); if (fresh.length && fresh.some(s => !have.has(s))) { ready = Date.now(); safe(); }
    } catch (e) {}
  }
  const canKeep = () => { try { return typeof keepSession === 'function'; } catch (e) { return false; } };
  const busyNow = () => {   // not now: typing this second, a video or Read aloud playing, the AI chat open
    if (Date.now() - lastKey < 4000 || document.documentElement.classList.contains('ask-open')) return true;
    try { return [...document.querySelectorAll('video, audio')].some(m => !m.paused && !m.ended) || !!(window.speechSynthesis && speechSynthesis.speaking); } catch (e) { return false; }
  };
  const fields = () => [...new Set(document.querySelectorAll('#app input, #app textarea, #app select, main input, main textarea, main select'))]
    .filter(el => !/^(password|file|hidden|submit|button|image|reset)$/.test(el.type) && !el.closest('.ask-back'));
  const fkey = (el, i) => el.dataset.ans != null ? 'a:' + el.dataset.ans : el.hasAttribute('data-qin') ? 'q:' : el.id ? '#' + el.id : el.name ? 'n:' + el.name : 'i:' + i;
  function goKeep() {   // save the work on the page, then load the new version
    try {
      if (canKeep()) keepSession();
      const els = fields(), a = document.activeElement, fi = els.indexOf(a);
      sessionStorage.setItem('upd-snap', JSON.stringify({ t: Date.now(), hash: location.hash, y: scrollY,
        f: els.map((el, i) => [fkey(el, i), el.type === 'checkbox' || el.type === 'radio' ? (el.checked ? '1' : '0') : el.value]).filter(x => x[1] !== ''),
        focus: fi >= 0 ? [fkey(a, fi), a.selectionStart, a.selectionEnd] : null }));
      sessionStorage.setItem('site-updated', 'kept');
    } catch (e) {}
    location.reload();
  }
  function restore() {   // after an update: put the saved work back
    let z = null; try { z = JSON.parse(sessionStorage.getItem('upd-snap') || 'null'); sessionStorage.removeItem('upd-snap'); } catch (e) {}
    if (!z || Date.now() - z.t > 120000 || z.hash !== location.hash) return;
    const map = new Map(z.f);
    const put = first => {
      const els = fields();
      els.forEach((el, i) => {
        const k = fkey(el, i); if (!map.has(k) || el.disabled) return; const v = map.get(k);
        if (el.type === 'checkbox' || el.type === 'radio') { if (first && el.checked !== (v === '1')) { el.checked = v === '1'; el.dispatchEvent(new Event('change', { bubbles: true })); } return; }
        if (el.value !== v && (first || el.value === '')) { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }
      });
      if (first && z.focus) { const el = els.find((e, i) => fkey(e, i) === z.focus[0]); if (el) { try { el.focus({ preventScroll: true }); el.setSelectionRange(z.focus[1], z.focus[2]); } catch (e) {} } }
      scrollTo(0, z.y);
    };
    setTimeout(() => put(true), 350); setTimeout(() => put(false), 1300);
  }
  function safe() {   // update now if this is a safe moment; after 5 minutes without one, offer the bar
    if (!ready || document.visibilityState !== 'visible') return;
    if (canKeep()) { if (!busyNow()) return goKeep(); if (Date.now() - ready > 5 * 60000) bar(); return; }
    if (typing()) return;
    if (atHome() && Date.now() - lastIn > 20000) return go();
    if (Date.now() - ready > 5 * 60000) bar();
  }
  function bar() {
    if (barShown || !document.body) return; barShown = true;
    const b = document.createElement('button'); b.type = 'button';
    b.textContent = '🔄 This site has been updated. Tap to load the new version.';
    b.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:2000;max-width:calc(100% - 32px);padding:12px 18px;border:0;border-radius:999px;background:#1D4ED8;color:#fff;font:600 15px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px #0004;cursor:pointer';
    b.onclick = go;
    document.body.appendChild(b);
  }
  ['pointerdown', 'keydown', 'input', 'scroll', 'touchstart'].forEach(ev => addEventListener(ev, () => { lastIn = Date.now(); }, { passive: true, capture: true }));
  ['keydown', 'input'].forEach(ev => addEventListener(ev, () => { lastKey = Date.now(); }, { passive: true, capture: true }));
  addEventListener('hashchange', () => { if (ready && !typing()) (canKeep() ? goKeep : go)(); });   // opening another page: it loads already updated
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { if (ready && !typing()) (canKeep() ? goKeep : go)(); else check(); } });
  window.addEventListener('focus', check);
  setInterval(check, 60000);
  setInterval(safe, 5000);
  setTimeout(check, 15000);
  // after an automatic update: a small note for a few seconds
  const note = () => {
    let how; try { how = sessionStorage.getItem('site-updated'); if (!how) return; sessionStorage.removeItem('site-updated'); } catch (e) { return; }
    if (how === 'kept') restore();
    const n = document.createElement('div'); n.setAttribute('role', 'status'); n.textContent = how === 'kept' ? '✨ Site updated. Your work is still here.' : '✨ Site updated';
    n.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:84px;z-index:2000;padding:10px 18px;border-radius:999px;background:#15803D;color:#fff;font:600 15px/1.3 system-ui,sans-serif;box-shadow:0 6px 24px #0004';
    document.body.appendChild(n); setTimeout(() => n.remove(), 3500);
  };
  if (document.body) note(); else document.addEventListener('DOMContentLoaded', note);
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

// 🩹 A page that did not start (2026-10-22 deep check): on a weak connection one of the site's files can fail to download,
// and the page then shows nothing but these shared boxes. Reload once by itself; if it happens again within a minute,
// say so with a Try again button instead of leaving an empty page.
(function () {
  const OWN = '.flagbar, .termbar, .yearcard, .newsbar, .stk-box, .ck-out, script, style';
  const empty = () => { const a = document.getElementById('app'); return !!a && ![...a.children].some(c => !c.matches(OWN)); };
  addEventListener('load', () => setTimeout(() => {
    if (!empty()) return;
    let last = 0, can = true;
    try { last = +sessionStorage.getItem('load-retry') || 0; sessionStorage.setItem('load-retry', String(Date.now())); } catch (e) { can = false; }
    if (can && Date.now() - last > 60000) return location.reload();
    const a = document.getElementById('app'), d = document.createElement('div');
    d.className = 'card'; d.style.cssText = 'margin:16px 0;border-left:4px solid #DC2626';
    d.innerHTML = '<b>⚠️ This page did not load properly.</b><p style="margin:6px 0 10px">The internet may be slow. Your saved work is safe on this device.</p><button type="button" class="btn">🔄 Try again</button>';
    d.querySelector('button').onclick = () => location.reload();
    a.prepend(d);
  }, 1500));
})();
