/* 💾 Optional online saving, shared by all subject sites (copied into each site as sync.js; wired by hub-work/add_sync.py).
   A parent turns it on and gets a random save code (3 words + 4 digits). After that this subject's progress saves online
   AUTOMATICALLY and loads on any device that uses the same code. Without a code, progress stays only on the device
   (the panel says so clearly and points to Backup). Nothing personal is stored.
   Server side: /api/sync/{status,new,pull,push,delete} in each site's Worker. */
(function () {
  const D = window.RVD; if (!D) return;
  const BASE = D.key.replace(/-rv$/, '');
  const SITE = { 'y8m': 'mat8', 'y9m': 'mat9' }[BASE];
  if (!SITE) return;
  const YEAR = (document.title.match(/Year (\d+)/) || [])[1] || '';
  const LINKS = {};
  const META = 'study-sync';
  const ls = {
    get: k => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  const meta = () => { try { return JSON.parse(ls.get(META)) || {}; } catch (e) { return {}; } };
  const setMeta = m => ls.set(META, JSON.stringify(m));
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const site = document.title.split(':')[0].trim();
  const mine = k => k === BASE || k.startsWith(BASE + '-');

  /* this subject's progress = every saved key that starts with the subject's key */
  function local() {
    const o = {};
    try { Object.keys(localStorage).filter(mine).sort().forEach(k => { o[k] = localStorage.getItem(k); }); } catch (e) {}
    return o;
  }
  const str = o => JSON.stringify(Object.keys(o).sort().reduce((a, k) => (a[k] = o[k], a), {}));
  async function api(op, body, keepalive) {
    const r = await fetch('/api/sync/' + op, { method: 'POST', keepalive: !!keepalive, headers: { 'content-type': 'application/json' }, body: JSON.stringify(Object.assign({ site: SITE }, body)) });
    let j = {}; try { j = await r.json(); } catch (e) {}
    if (!r.ok) { const er = new Error(j.error || 'Something went wrong. Please try again.'); er.status = r.status; throw er; }
    return j;
  }
  const ago = t => { if (!t) return 'not yet'; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? 'just now' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }); };

  /* ---------- automatic saving ---------- */
  let busy = false, state = '';   // state: '' | 'saving' | 'offline'
  async function push(keepalive) {
    const m = meta(); if (!m.code || busy) return;
    const now = str(local()); if (now === m.base) return;
    busy = true; state = 'saving'; refreshBtn();
    try { const r = await api('push', { code: m.code, data: now }, keepalive); const m2 = meta(); m2.base = now; m2.time = r.updated; setMeta(m2); state = ''; }
    catch (e) { state = e.status === 404 ? '' : 'offline'; if (e.status === 404) setMeta({}); }
    busy = false; refreshBtn();
  }
  /* on opening: bring in anything saved from another device. Keys changed only on this device are kept;
     everything else takes the saved version. Then this device's changes are saved. */
  async function pull() {
    const m = meta(); if (!m.code) return;
    let r; try { r = await api('pull', { code: m.code }); } catch (e) { if (e.status === 404) setMeta({}); state = e.status === 404 ? '' : 'offline'; return refreshBtn(); }
    if (!r.data || r.updated <= (m.time || 0)) return push();
    let server = {}, base = {}; try { server = JSON.parse(r.data) || {}; base = JSON.parse(m.base || '{}'); } catch (e) {}
    const here = local(), merged = {};
    new Set([...Object.keys(server), ...Object.keys(here)]).forEach(k => {
      if (!mine(k)) return;
      const changedHere = here[k] !== base[k];
      const v = changedHere ? here[k] : server[k];
      if (v != null) merged[k] = v;
    });
    const before = str(here);
    Object.keys(here).forEach(k => { if (!(k in merged)) { try { localStorage.removeItem(k); } catch (e) {} } });
    Object.keys(merged).forEach(k => ls.set(k, merged[k]));
    const m2 = meta(); m2.base = r.data; m2.time = r.updated; setMeta(m2);
    if (str(merged) !== before) {   // new progress arrived: show it (once)
      let again = false; try { again = sessionStorage.getItem('study-sync-reload') === '1'; sessionStorage.setItem('study-sync-reload', '1'); } catch (e) {}
      if (!again) return location.reload();
    }
    push();
  }

  /* ---------- the panel ---------- */
  let box = null, msg = '', pending = null;
  const NOTE = `<div class="sy-warn"><b>⚠️ Without a save code, your progress is saved only on this device.</b> If you change phone, use another device or clear the browser, it is lost unless you move it yourself with <b>Backup</b> (in My progress, or at the bottom of the Home page).</div>`;
  function panelHTML() {
    const m = meta(), status = msg ? `<p class="sy-msg" role="status">${msg}</p>` : '';
    if (!m.code) return `<h2>💾 Save your progress online</h2>
<p>Use more than one phone, tablet or laptop? With a save code, your progress <b>saves online by itself</b> and opens on any device. <b>Optional.</b></p>
${NOTE}${status}
<div class="sy-card"><h3>For a parent or guardian</h3>
<p class="sy-small">Only study progress is saved (answers, scores and the study plan), under a random code. <b>No names, emails or phone numbers.</b> You can delete it at any time.</p>
<label class="sy-check"><input type="checkbox" id="syok"> <span>I am the parent or guardian. I agree to save my child's study progress online under a random code, and I understand this free tool is made by a parent, provided "as is", and not connected to the school. <a href="#/help" data-sy="decl">Read the declaration</a>.</span></label>
<button type="button" class="sy-btn" data-sy="new">Create our save code</button></div>
<div class="sy-card"><h3>Already have a save code?</h3>
<input id="sycode" placeholder="e.g. river-tiger-moon-4821" autocomplete="off" autocapitalize="none" spellcheck="false">
<button type="button" class="sy-btn ghost" data-sy="link">Use this code on this device</button></div>`;
    return `<h2>☁️ Saving online is on</h2>
<p>Your ${esc(site)} progress <b>saves online automatically</b> while you study, and opens on any device that uses your code.</p>
<p class="sy-small">Last saved: <b>${state === 'saving' ? 'saving…' : ago(m.time)}</b>${state === 'offline' ? ' · <b class="sy-red">no internet: it will save when you are back online</b>' : ''}</p>${status}
<div class="sy-card"><h3>Your save code</h3><p class="sy-code">${esc(m.code)}</p>
<p class="sy-small">Keep it private, like a password. The same code works for all your subjects: on each subject's site, tap <b>💾 Save online</b> and type it in once.</p>
<button type="button" class="sy-btn ghost" data-sy="share">📤 Send the code to my parent</button></div>
<div class="sy-card"><h3>📲 Add another device</h3><p class="sy-small">Scan this with the other phone or tablet's camera, then tap <b>Use this code</b>.</p><div class="sy-qr" id="syqr"></div></div>
<p class="sy-small"><a href="#" data-sy="off">Stop using the code on this device</a> · <a href="#" data-sy="del">Delete my saved progress</a></p>`;
  }
  function open(extra) {
    msg = extra || '';
    if (!box) {
      box = document.createElement('div'); box.className = 'sy-back'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Save online');
      box.addEventListener('click', e => { if (e.target === box) close(); });
      document.body.appendChild(box);
    }
    box.innerHTML = `<div class="sy-panel"><button type="button" class="sy-x" data-sy="close" aria-label="Close">✕</button>${panelHTML()}</div>`;
    const q = document.getElementById('syqr'); if (q) drawQR(q, linkFor(location.origin, meta().code));
  }
  const linkFor = (origin, code) => origin + '/#/sync/link/' + code;
  /* the QR library is only loaded when the panel needs it */
  let qrLib = null;
  function drawQR(el, text) {
    qrLib = qrLib || new Promise((ok, no) => { if (window.qrcode) return ok(); const s = document.createElement('script'); s.src = 'qrcode.js?v=1'; s.onload = ok; s.onerror = no; document.head.appendChild(s); });
    qrLib.then(() => { const q = window.qrcode(0, 'M'); q.addData(text); q.make(); el.innerHTML = q.createSvgTag({ cellSize: 5, margin: 3, scalable: true }); })
      .catch(() => { el.textContent = 'Type the code on the other device instead.'; });
  }
  const close = () => { if (box) { box.remove(); box = null; } refreshBtn(); };
  const share = text => navigator.share ? navigator.share({ text }).catch(() => {}) : navigator.clipboard ? navigator.clipboard.writeText(text).then(() => open('✓ Copied. Paste it in a message to your parent.')).catch(() => {}) : null;
  const hasProgress = () => Object.keys(local()).some(k => k !== BASE + '-group');

  async function act(what, el) {
    const m = meta();
    try {
      if (what === 'close') return close();
      if (what === 'decl') { close(); location.hash = '#/help'; return setTimeout(() => { const d = document.getElementById('declaration'); if (d) d.scrollIntoView({ block: 'start' }); }, 200); }
      if (what === 'new') {
        if (!document.getElementById('syok').checked) return open('Please tick the box first: a parent or guardian needs to agree.');
        el.disabled = true;
        const { code } = await api('new', { consent: true });
        setMeta({ code });
        await push();
        return open(`✅ Your save code is <b>${esc(code)}</b>. Take a screenshot or send it to your parent. From now on, progress saves by itself.`);
      }
      if (what === 'link') {
        const code = (document.getElementById('sycode').value || '').trim().toLowerCase().replace(/\s+/g, '-');
        if (!code) return open('Type your save code first.');
        el.disabled = true;
        const r = await api('pull', { code });
        if (!r.data) { setMeta({ code }); await push(); return open('✅ Code accepted. This subject\'s progress now saves online by itself.'); }
        if (!hasProgress()) { pending = { code, r }; return act('usesaved'); }
        pending = { code, r };
        return open(`Saved progress was found for ${esc(site)} (saved ${ago(r.updated)}), and this device has progress too. Which one should we keep?
<button type="button" class="sy-btn" data-sy="usesaved">Use the saved progress</button><button type="button" class="sy-btn ghost" data-sy="usehere">Keep this device's progress</button>`);
      }
      if (what === 'usesaved' && pending) {
        let data = {}; try { data = JSON.parse(pending.r.data) || {}; } catch (e) {}
        try { Object.keys(localStorage).filter(mine).forEach(k => localStorage.removeItem(k)); } catch (e) {}
        Object.keys(data).filter(mine).forEach(k => ls.set(k, data[k]));
        setMeta({ code: pending.code, base: pending.r.data, time: pending.r.updated });
        return location.reload();
      }
      if (what === 'usehere' && pending) { setMeta({ code: pending.code }); await push(); pending = null; return open('✅ This device\'s progress is now saved online, and saves by itself from now on.'); }
      if (what === 'share') {
        const links = (LINKS[YEAR] || []).map(([n, u]) => `${n}: ${linkFor(u, m.code)}`).join('\n');
        return share(`💾 Save code for the study sites: ${m.code}\nKeep it private. Open each link once on a device to turn on saving there (or tap "💾 Save online" and type the code). Progress then saves by itself.\n${links}`);
      }
      if (what === 'off') { setMeta({}); return open('This device no longer uses the code. Your progress is still on this device.'); }
      if (what === 'del') return open('⚠️ This deletes everything saved online with this code, for all subjects. <button type="button" class="sy-btn danger" data-sy="del2">Yes, delete it</button>');
      if (what === 'del2') { await api('delete', { code: m.code }); setMeta({}); return open('Deleted. Nothing is saved online any more. Your progress on this device is still here.'); }
    } catch (e) { if (el) el.disabled = false; open('⚠️ ' + esc(e.message)); }
  }

  /* ---------- the button at the bottom of every page (next to Read aloud) ---------- */
  function refreshBtn() {
    const m = meta();
    document.querySelectorAll('.sybtn').forEach(b => {
      b.textContent = !m.code ? '💾 Save online' : state === 'saving' ? '☁️ Saving…' : state === 'offline' ? '☁️ Not saved (offline)' : '☁️ Saved online ✓';
      b.classList.toggle('sy-on', !!m.code && !state);
    });
  }
  function addBtn() {
    const bar = document.querySelector('#app > .flagbar'); if (!bar || bar.querySelector('.sybtn')) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'sybtn';
    b.onclick = () => open(); bar.insertBefore(b, bar.querySelector('.flagmsg')); refreshBtn();
  }
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-sy]'); if (!el || !box || !box.contains(el)) return;
    e.preventDefault(); act(el.dataset.sy, el);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && box) close(); });
  setInterval(() => push(), 20000);                                            // save changes every 20 seconds
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') push(true); });
  window.addEventListener('online', () => { state = ''; push(); });

  /* a link like #/sync/link/<code> opens the panel with the code filled in */
  const hm = location.hash.match(/^#\/sync\/link\/([a-z0-9-]{10,60})$/i);
  if (hm) { history.replaceState(null, '', location.pathname + location.search + '#/'); setTimeout(() => { open(); const i = document.getElementById('sycode'); if (i) i.value = hm[1]; }, 300); }

  function watch() {
    const app = document.getElementById('app'); if (!app) return;
    // the button and the help text about online saving only appear once the site's database is connected
    api('status', {}).then(() => {
      document.documentElement.classList.add('sync-on');
      new MutationObserver(addBtn).observe(app, { childList: true }); addBtn();
      setTimeout(() => { try { sessionStorage.removeItem('study-sync-reload'); } catch (e) {} }, 5000);
      pull();
    }).catch(() => {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watch); else setTimeout(watch, 0);

  const css = document.createElement('style');
  css.textContent = `.sy-back { position: fixed; inset: 0; z-index: 900; background: rgba(15,20,28,.55); display: grid; place-items: center; padding: 14px; }
.sy-panel { position: relative; width: 100%; max-width: 460px; max-height: 92vh; overflow: auto; background: var(--card, #fff); color: var(--ink, #101828); border-radius: 18px; padding: 20px 18px; box-shadow: 0 10px 40px rgba(0,0,0,.3); }
.sy-panel h2 { font-size: 21px; margin: 0 30px 10px 0; } .sy-panel h3 { font-size: 16px; margin: 0 0 6px; } .sy-panel p { margin: 8px 0; line-height: 1.5; }
.sy-x { position: absolute; top: 8px; right: 8px; border: 0; background: none; font-size: 20px; padding: 8px 12px; cursor: pointer; color: var(--muted, #667085); }
.sy-warn { margin: 10px 0; padding: 12px 14px; border-radius: 12px; background: #FEF3C7; color: #78350F; border: 2px solid #F59E0B; line-height: 1.5; }
.sy-card { margin: 12px 0; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line, #d0d5dd); }
.sy-small { font-size: 14px; color: var(--muted, #667085); } .sy-red { color: #B91C1C; }
.sy-code { font-size: 22px; font-weight: 800; letter-spacing: .02em; word-break: break-all; }
.sy-check { display: flex; gap: 8px; align-items: flex-start; margin: 10px 0; font-weight: 600; } .sy-check input { width: 20px; height: 20px; margin-top: 2px; }
#sycode { width: 100%; box-sizing: border-box; font: inherit; padding: 10px 12px; border-radius: 10px; border: 1px solid var(--line, #d0d5dd); margin: 6px 0; background: transparent; color: inherit; }
.sy-btn { display: block; width: 100%; margin: 8px 0; padding: 13px; border-radius: 12px; border: 0; background: var(--brand, #4F46E5); color: #fff; font: inherit; font-weight: 700; font-size: 16px; cursor: pointer; }
.sy-btn.ghost { background: transparent; color: var(--ink, #101828); border: 2px solid var(--line, #d0d5dd); } .sy-btn.danger { background: #B91C1C; color: #fff; } .sy-btn:disabled { opacity: .6; }
.sy-qr { width: 200px; max-width: 70%; margin: 8px auto 0; background: #fff; padding: 6px; border-radius: 10px; } .sy-qr svg { display: block; width: 100%; height: auto; }
.sy-msg { padding: 10px 12px; border-radius: 10px; background: var(--brand-2, #EEF2FF); }
@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) .sy-btn:not(.ghost):not(.danger) { color: #0F141C; } }
.flagbar .sybtn.sy-on { color: #15803D; border-color: #86EFAC; }
@media print { .sy-back { display: none !important; } }`;
  document.head.appendChild(css);
  window.SYNC = { open, pull, push };   // pull and push are exposed for testing
})();
