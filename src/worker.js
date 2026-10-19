// IGCSE Edexcel Maths (shareable copy of Year 8 Maths): open to anyone with the link (no password). Serves the static files in ./public.
// Safety on every response: HTTPS only, only this site's own scripts may run (a fresh nonce per page),
// no embedding in other sites, no MIME guessing, no leaking the address, and no search-engine indexing.

// 📈 Cloudflare Web Analytics (hub-work/add_analytics.py): counts visits, no cookies, nothing that identifies anyone.
const CF_BEACON = '88e2d1b5e3be41adbbef3c7b7eb60f25';
const beaconTag = nonce => `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${CF_BEACON}"}'${nonce ? ` nonce="${nonce}"` : ''}></script>`;
function secure(response, request) {
  let out = new Response(response.body, response);
  const html = out.headers.get('content-type')?.toLowerCase().startsWith('text/html');
  const nonce = crypto.randomUUID().replaceAll('-', '');
  out.headers.set('content-security-policy', [
    "default-src 'self'", `script-src 'self'${html ? ` 'nonce-${nonce}' https://static.cloudflareinsights.com` : ''}`, "script-src-attr 'none'",
    "style-src 'self' 'unsafe-inline'", "img-src 'self' data:", "font-src 'self'", "connect-src 'self' https://cloudflareinsights.com",
    "object-src 'none'", "frame-src 'none'", "frame-ancestors 'none'", "base-uri 'none'", "form-action 'self'", 'upgrade-insecure-requests'
  ].join('; '));
  out.headers.set('strict-transport-security', 'max-age=31536000');
  out.headers.set('x-frame-options', 'DENY');
  out.headers.set('x-content-type-options', 'nosniff');
  out.headers.set('referrer-policy', 'no-referrer');
  out.headers.set('permissions-policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  out.headers.set('x-robots-tag', 'noindex, nofollow, noarchive');
  if (html && request.method !== 'HEAD' && out.body) {
    // Each page gets its own nonce, so it must not be cached or answered with a 304.
    out.headers.set('cache-control', 'no-store');
    out.headers.delete('etag');
    out.headers.delete('last-modified');
    out = new HTMLRewriter().on('script', { element(el) { el.setAttribute('nonce', nonce); } })
      .on('body', { element(el) { el.append(beaconTag(nonce), { html: true }); } }).transform(out);
  }
  return out;
}

// SYNC start (hub-work/sync_worker.js, inserted by hub-work/add_sync.py)
// Optional online saving, turned on by a parent. Progress is stored under a random code made of 3 words and 4 digits.
// No names, emails or phone numbers are stored. Only a hash of the code is kept, so the codes cannot be read back.
// Wrong codes are counted per (daily-hashed) connection and paused for 15 minutes after 10 misses.
const SYNC_WORDS = ('apple arrow badge beach bell berry bird boat bread brick bridge brush cake camel candle canoe castle cat cave chalk ' +
  'cherry cloud clock coral cotton crab crown cup daisy desert dolphin dragon drum eagle earth falcon feather fern field fig ' +
  'flame flute forest fox frog garden gate ginger glass globe goat gold grape hammer harbor hawk hill honey horse ice island ' +
  'jade jelly kettle kite koala ladder lake lamp lemon lily lion llama lotus magnet mango maple marble meadow melon mint moon ' +
  'moss mountain nest north oak ocean olive orange otter owl palm panda paper parrot peach pearl pebble pepper piano pine ' +
  'planet plum pond puzzle quartz rabbit rain rainbow river robin rocket rose ruby sail salt sand seal shell silver sky snow ' +
  'spark spoon star stone storm sugar sun swan tiger tomato tower train tulip turtle valley violet wave whale willow wind wolf zebra').split(' ');
const SYNC_SITES = new Set(['eng9', 'eng8', 'geo9', 'geo8', 'his8', 'sci9', 'mat8']);
const syncJson = (o, status = 200) => new Response(JSON.stringify(o), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
async function syncHash(s) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
}
function syncNewCode() {
  const r = new Uint32Array(4); crypto.getRandomValues(r);
  const w = i => SYNC_WORDS[r[i] % SYNC_WORDS.length];
  return `${w(0)}-${w(1)}-${w(2)}-${String(r[3] % 10000).padStart(4, '0')}`;
}
const syncNorm = c => String(c || '').toLowerCase().trim().replace(/[\s_]+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60);
let syncTables = false;
async function syncSetup(db) {
  if (syncTables) return;
  await db.batch([
    db.prepare('CREATE TABLE IF NOT EXISTS sync_users (uid TEXT PRIMARY KEY, created INTEGER, last_used INTEGER, consent INTEGER)'),
    db.prepare('CREATE TABLE IF NOT EXISTS sync_data (uid TEXT, site TEXT, data TEXT, updated INTEGER, PRIMARY KEY (uid, site))'),
    db.prepare('CREATE TABLE IF NOT EXISTS sync_fails (k TEXT PRIMARY KEY, n INTEGER, until INTEGER)')
  ]);
  syncTables = true;
}
async function syncCount(db, k, now, max) {   // true when this connection has used up its tries
  const f = await db.prepare('SELECT n, until FROM sync_fails WHERE k = ?').bind(k).first();
  return !!(f && f.until > now && f.n >= max);
}
const syncBump = (db, k, now) => db.prepare('INSERT INTO sync_fails (k, n, until) VALUES (?, 1, ?) ON CONFLICT(k) DO UPDATE SET n = CASE WHEN until < ? THEN 1 ELSE n + 1 END, until = ?')
  .bind(k, now + 15 * 60e3, now, now + 15 * 60e3).run();
async function syncApi(request, env, url) {
  if (!env.DB) return syncJson({ error: 'Online saving is not set up yet.' }, 503);
  if (request.method !== 'POST') return syncJson({ error: 'Method not allowed' }, 405);
  if (request.headers.get('origin') !== url.origin) return syncJson({ error: 'Please use this site.' }, 403);
  let body;
  try { const t = await request.text(); if (t.length > 400000) return syncJson({ error: 'Too much data.' }, 413); body = JSON.parse(t) || {}; }
  catch (e) { return syncJson({ error: 'Bad request' }, 400); }
  const db = env.DB, now = Date.now(), op = url.pathname.slice('/api/sync/'.length);
  if (op === 'status') return syncJson({ ok: true });
  await syncSetup(db);
  const ip = await syncHash('ip:' + (request.headers.get('cf-connecting-ip') || '') + ':' + new Date(now).toISOString().slice(0, 10));
  if (op === 'new') {
    if (body.consent !== true) return syncJson({ error: 'A parent or guardian needs to agree first.' }, 400);
    if (await syncCount(db, 'new:' + ip, now, 10)) return syncJson({ error: 'Too many new codes. Please wait 15 minutes.' }, 429);
    await syncBump(db, 'new:' + ip, now);
    const code = syncNewCode();
    await db.prepare('INSERT INTO sync_users (uid, created, last_used, consent) VALUES (?, ?, ?, 1)').bind(await syncHash('sync:' + code), now, now).run();
    if (Math.random() < 0.05) {   // now and then: remove codes unused for a year, and old try counters
      const old = now - 365 * 864e5;
      await db.batch([
        db.prepare('DELETE FROM sync_data WHERE uid IN (SELECT uid FROM sync_users WHERE last_used < ?)').bind(old),
        db.prepare('DELETE FROM sync_users WHERE last_used < ?').bind(old),
        db.prepare('DELETE FROM sync_fails WHERE until < ?').bind(now)
      ]);
    }
    return syncJson({ code });
  }
  const site = String(body.site || '');
  if (!SYNC_SITES.has(site)) return syncJson({ error: 'Unknown subject.' }, 400);
  if (await syncCount(db, 'try:' + ip, now, 10)) return syncJson({ error: 'Too many wrong codes. Please wait 15 minutes.' }, 429);
  const code = syncNorm(body.code), uid = await syncHash('sync:' + code);
  const user = code.length >= 10 ? await db.prepare('SELECT last_used FROM sync_users WHERE uid = ?').bind(uid).first() : null;
  if (!user) { await syncBump(db, 'try:' + ip, now); return syncJson({ error: 'That code was not found. Check it and try again.' }, 404); }
  if (now - user.last_used > 864e5) await db.prepare('UPDATE sync_users SET last_used = ? WHERE uid = ?').bind(now, uid).run();
  if (op === 'pull') {
    const r = await db.prepare('SELECT data, updated FROM sync_data WHERE uid = ? AND site = ?').bind(uid, site).first();
    return syncJson({ data: r ? r.data : null, updated: r ? r.updated : 0 });
  }
  if (op === 'push') {
    const data = typeof body.data === 'string' ? body.data : '';
    if (!data || data.length > 300000) return syncJson({ error: 'Too much data.' }, 413);
    await db.prepare('INSERT INTO sync_data (uid, site, data, updated) VALUES (?, ?, ?, ?) ON CONFLICT(uid, site) DO UPDATE SET data = excluded.data, updated = excluded.updated')
      .bind(uid, site, data, now).run();
    return syncJson({ updated: now });
  }
  if (op === 'delete') {
    await db.batch([db.prepare('DELETE FROM sync_data WHERE uid = ?').bind(uid), db.prepare('DELETE FROM sync_users WHERE uid = ?').bind(uid)]);
    return syncJson({ deleted: true });
  }
  return syncJson({ error: 'Not found' }, 404);
}
// SYNC end
// FLAGS: 🚩 Flag a mistake (help.js) sends the student's note here with one tap (user, 2026-10-19: "send automatically").
// Flags wait in the shared database until the parent's daily check reads them (audit-team/site_audit.py). Reading needs a key
// kept only on the parent's computer; only its SHA-256 is here. No names or personal details are asked for.
const FLAG_KEY_HASH = 'a0eb9a84d213e5cf0ebe1aa4249164074d84be882ecc1c3e7d6a14737285bc85';
const flagClean = (x, n) => String(x == null ? '' : x).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').slice(0, n);
async function flagApi(request, env, url) {
  if (!env.DB) return syncJson({ error: 'Sending is not set up yet.' }, 503);
  if (request.method !== 'POST') return syncJson({ error: 'Method not allowed' }, 405);
  let body;
  try { const t = await request.text(); if (t.length > 6000) return syncJson({ error: 'That is too long.' }, 413); body = JSON.parse(t) || {}; }
  catch (e) { return syncJson({ error: 'Bad request' }, 400); }
  const db = env.DB, now = Date.now(), op = url.pathname.replace(/^\/api\/flag\/?/, '');
  await syncSetup(db);
  await db.prepare('CREATE TABLE IF NOT EXISTS flags (id INTEGER PRIMARY KEY AUTOINCREMENT, site TEXT, page TEXT, url TEXT, msg TEXT, created INTEGER, done INTEGER DEFAULT 0)').run();
  const ip = await syncHash('ip:' + (request.headers.get('cf-connecting-ip') || '') + ':' + new Date(now).toISOString().slice(0, 10));
  if (op === '') {
    if (request.headers.get('origin') !== url.origin) return syncJson({ error: 'Please use this site.' }, 403);
    if (await syncCount(db, 'flag:' + ip, now, 20)) return syncJson({ error: 'Thank you! You have sent a lot just now. Please wait 15 minutes.' }, 429);
    const msg = flagClean(body.text, 1000).trim();
    if (msg.length < 2) return syncJson({ error: 'Please type what is wrong first.' }, 400);
    await syncBump(db, 'flag:' + ip, now);
    await db.prepare('INSERT INTO flags (site, page, url, msg, created) VALUES (?, ?, ?, ?, ?)')
      .bind(url.hostname.split('.')[0], flagClean(body.page, 200), flagClean(body.url, 300), msg, now).run();
    return syncJson({ ok: true });
  }
  if (op === 'list' || op === 'done') {
    if (await syncCount(db, 'flagkey:' + ip, now, 5)) return syncJson({ error: 'Too many tries. Please wait 15 minutes.' }, 429);
    if (await syncHash('flags:' + String(body.key || '')) !== FLAG_KEY_HASH) { await syncBump(db, 'flagkey:' + ip, now); return syncJson({ error: 'Not allowed' }, 403); }
    if (op === 'done') { await db.prepare('UPDATE flags SET done = 1 WHERE id = ?').bind(Number(body.id) || 0).run(); return syncJson({ ok: true }); }
    const r = await db.prepare('SELECT id, site, page, url, msg, created, done FROM flags WHERE id > ? ORDER BY id LIMIT 500').bind(Number(body.after) || 0).all();
    return syncJson({ flags: r.results || [] });
  }
  return syncJson({ error: 'Not found' }, 404);
}
// FLAGS end

// VISITS start (hub-work/visits_worker.js, inserted by hub-work/add_visits.py)
// 📈 Visit counter + the owner's private numbers page (user 2026-10-19: "another way to see numbers directly on my site as owner").
// The page (help.js) sends one tiny ping per page load with a random device number kept in that browser. Each device counts
// ONCE a day per site, however often it opens it (user 2026-10-19: "count each device for each link daily once a day even with
// multi-entry"); only a hash of (day, site, number) is stored, for 3 days, so devices can't be followed from day to day.
// No cookies, no IP addresses, nothing that identifies anyone. Owner page: /__visits?k=<private key> (key kept off GitHub;
// only its hash is here). The owner's own devices are not counted ("don't count my visits"): the owner page sends the device
// once through /__me on every site, which saves 'vown' in that site's browser storage, and help.js then sends no ping.
const VISITS_HASH = 'a3c878a98dd187788a3e71c30df3c20b4bf227e80e6a39854b1aa84334970441';
const VSITES = { 'year9-english': 'Y9 English', 'year8-english': 'Y8 English', 'year9-science': 'Y9 Science', 'year8-science': 'Y8 Science',
  'year9-geography': 'Y9 Geography', 'year8-geography': 'Y8 Geography', 'year9-history': 'Y9 History', 'year8-history': 'Y8 History',
  'year9-math': 'Y9 Maths', 'year8-math': 'Y8 Maths', 'igcse-edexcel': 'IGCSE Maths (shared)' };
let visitsReady = false;
async function visitsTable(db) {
  if (visitsReady) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS visits (day TEXT, site TEXT, opens INTEGER, devices INTEGER, PRIMARY KEY (day, site))').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS vdev (day TEXT, site TEXT, dev TEXT, PRIMARY KEY (day, site, dev))').run();
  for (const c of ['at', 'kind']) { try { await db.prepare(`ALTER TABLE vdev ADD COLUMN ${c} TEXT`).run(); } catch (e) {} }   // added in v3
  for (const c of ['secs', 'pages']) { try { await db.prepare(`ALTER TABLE vdev ADD COLUMN ${c} INTEGER`).run(); } catch (e) {} }   // added in v5
  visitsReady = true;
}
const vsha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
const vOwner = async k => (await vsha('deirarevise-visits:' + k)) === VISITS_HASH;
// a rough device type for the owner page, e.g. "Phone · iPhone · Safari" (nothing that identifies a person)
const vKind = ua => {
  const type = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Phone' : 'Computer';
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'Chromebook' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'other';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'other browser';
  return `${type} · ${os} · ${br}`;
};
const vTime = () => new Date(Date.now() + 4 * 3600e3).toISOString().slice(11, 16);   // UAE time
const vDay = (back = 0) => new Date(Date.now() + 4 * 3600e3 - back * 864e5).toISOString().slice(0, 10);   // UAE date
async function visitsHook(request, env, ctx) {
  const url = new URL(request.url);
  if (url.pathname === '/__visit' && request.method === 'POST') {
    const site = url.hostname.split('.')[0];
    if (!env.DB || !VSITES[site] || request.headers.get('sec-fetch-site') === 'cross-site') return new Response(null, { status: 204 });
    const dev = (url.searchParams.get('d') || '').slice(0, 64), day = vDay();
    if (url.searchParams.get('u') === '1') {   // ⏱ time used and pages opened, added to today's row for this device
      const t = Math.min(Math.max(+url.searchParams.get('t') || 0, 0), 3600), pg = Math.min(Math.max(+url.searchParams.get('p') || 0, 0), 500);
      if (dev && (t || pg)) {
        const job = (async () => { await visitsTable(env.DB);
          await env.DB.prepare('UPDATE vdev SET secs = COALESCE(secs, 0) + ?1, pages = COALESCE(pages, 0) + ?2 WHERE day = ?3 AND site = ?4 AND dev = ?5')
            .bind(t, pg, day, site, (await vsha(day + ':' + site + ':' + dev)).slice(0, 32)).run(); })().catch(() => {});
        if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
      }
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }
    const job = (async () => {
      await visitsTable(env.DB);
      let isNew = url.searchParams.get('n') === '0' ? 0 : 1;   // n: older pages still cached on phones
      if (dev) {
        const r = await env.DB.prepare('INSERT OR IGNORE INTO vdev (day, site, dev, at, kind) VALUES (?1, ?2, ?3, ?4, ?5)').bind(day, site, (await vsha(day + ':' + site + ':' + dev)).slice(0, 32), vTime(), vKind(request.headers.get('user-agent') || '')).run();
        isNew = r.meta && r.meta.changes ? 1 : 0;
        if (isNew) await env.DB.prepare('DELETE FROM vdev WHERE day < ?1').bind(vDay(3)).run();
      }
      await env.DB.prepare('INSERT INTO visits (day, site, opens, devices) VALUES (?1, ?2, 1, ?3) ON CONFLICT (day, site) DO UPDATE SET opens = opens + 1, devices = devices + ?3').bind(day, site, isNew).run();
    })().catch(() => {});
    if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }
  if (url.pathname === '/__me' && request.method === 'GET') {   // mark this device as the owner's on every site, one after another
    const k = url.searchParams.get('k') || '', list = Object.keys(VSITES), i = +url.searchParams.get('i') || 0, back = url.searchParams.get('b') || '';
    if (!(await vOwner(k)) || !VSITES[back]) return new Response('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });
    const dom = url.hostname.split('.').slice(1).join('.'), q = encodeURIComponent(k);
    const next = i + 1 < list.length ? `https://${list[i + 1]}.${dom}/__me?k=${q}&i=${i + 1}&b=${back}` : `https://${back}.${dom}/__visits?k=${q}&done=1`;
    return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visits</title>
<p style="font:16px system-ui;padding:16px">Setting up this device (${i + 1} of ${list.length})…</p>
<script>try { localStorage.setItem('vown', '1'); } catch (e) {} location.replace(${JSON.stringify(next)});</script>`,
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' } });
  }
  if (url.pathname === '/__visits' && request.method === 'GET') {
    const k = url.searchParams.get('k') || '';
    if (!(await vOwner(k))) return new Response('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });
    const site = url.hostname.split('.')[0], dom = url.hostname.split('.').slice(1).join('.');
    const meUrl = VSITES[site] ? `https://${Object.keys(VSITES)[0]}.${dom}/__me?k=${encodeURIComponent(k)}&i=0&b=${site}` : '';
    let rows = [], devs = [];
    const okDay = d => /^\d{4}-\d{2}-\d{2}$/.test(d || '');
    if (env.DB && okDay(url.searchParams.get('recount'))) {   // owner clean-up: keep only devices counted with a device number
      await visitsTable(env.DB); const d = url.searchParams.get('recount');
      await env.DB.prepare('UPDATE visits SET devices = (SELECT COUNT(*) FROM vdev WHERE vdev.day = visits.day AND vdev.site = visits.site) WHERE day = ?1').bind(d).run();
    }
    if (env.DB && VSITES[url.searchParams.get('drop')] && okDay(url.searchParams.get('day'))) {   // owner clean-up: remove one site's day
      await visitsTable(env.DB); const st = url.searchParams.get('drop'), d = url.searchParams.get('day');
      await env.DB.prepare('DELETE FROM visits WHERE site = ?1 AND day = ?2').bind(st, d).run();
      await env.DB.prepare('DELETE FROM vdev WHERE site = ?1 AND day = ?2').bind(st, d).run();
    }
    if (env.DB) { await visitsTable(env.DB); rows = (await env.DB.prepare('SELECT day, site, opens, devices FROM visits ORDER BY day DESC').all()).results || [];
      devs = (await env.DB.prepare('SELECT day, site, at, kind, secs, pages FROM vdev ORDER BY day DESC, at DESC').all()).results || []; }
    const used = (d, s) => devs.filter(x => x.day === d && x.site === s && (x.secs || 0) >= 120).length;
    const mins = x => x.secs ? (x.secs < 60 ? 'under 1 min' : Math.round(x.secs / 60) + ' min') : '–';
    const days = [...new Set(rows.map(r => r.day))].slice(0, 30), sites = Object.keys(VSITES);
    const cell = (d, s) => { const r = rows.find(x => x.day === d && x.site === s); return r ? `<td><b>${r.devices}</b>${used(d, s) ? `<small> · ${used(d, s)} used</small>` : ''}</td>` : '<td class="z">0</td>'; };   // 0, not "–" (user 2026-10-19)
    const sum = list => list.reduce((a, r) => [a[0] + r.devices, a[1] + r.opens], [0, 0]);
    const nice = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    const pair = ([a]) => `<b>${a}</b>`;
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Visits</title>
<style>:root{--bg:#f4f6fb;--card:#fff;--ink:#1d2433;--muted:#5b6475;--line:#e4e7ec;--brand:#0E8F6E}
@media (prefers-color-scheme:dark){:root{--bg:#12151c;--card:#1c212b;--ink:#e8ecf3;--muted:#9aa3b2;--line:#2c3340;--brand:#34D3A3}}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif;padding:16px}h1{margin:0 0 4px}p{color:var(--muted);margin:0 0 12px}
.wrap{overflow-x:auto;background:var(--card);border-radius:12px;box-shadow:0 2px 12px #0001}table{border-collapse:collapse;width:100%;min-width:640px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:center;white-space:nowrap}th:first-child,td:first-child{text-align:left;position:sticky;left:0;background:var(--card)}
th{font-size:13px;color:var(--muted)}td.z{color:var(--muted)}small{color:var(--muted)}tr.t td{border-top:2px solid var(--brand)}</style></head><body>
<h1>📈 Visits</h1><p>Each box: how many <b>devices</b> opened that site that day (UAE time). A device counts once a day per site, however many times it opens it. <small>"· 3 used"</small> = how many of them really used it (2 minutes or more of tapping, typing or scrolling). Counting started on 19 Oct 2026. Only you have this link: please keep it private.</p>
<p id="me" style="color:var(--brand);font-weight:600"></p>
<script>(function () { var own = false; try { own = localStorage.getItem('vown') === '1'; } catch (e) {}
  var me = document.getElementById('me'), go = ${JSON.stringify(meUrl)}, done = /[?&]done=1/.test(location.search);
  if (own) me.textContent = '✓ Your own visits on this device are not counted.';
  else if (go && !done) location.replace(go);
  else me.textContent = 'This device could not be set up, so your visits on it may still be counted.';
})();</script>
<div class="wrap"><table><tr><th>Day</th>${sites.map(s => `<th>${VSITES[s]}</th>`).join('')}<th>All sites</th></tr>
${days.length ? days.map(d => `<tr><td>${nice(d)}</td>${sites.map(s => cell(d, s)).join('')}<td>${pair(sum(rows.filter(r => r.day === d)))}</td></tr>`).join('') : `<tr><td colspan="${sites.length + 2}">No visits counted yet. Open any site, then refresh this page.</td></tr>`}
<tr class="t"><td><b>Total</b></td>${sites.map(s => `<td>${pair(sum(rows.filter(r => r.site === s)))}</td>`).join('')}<td>${pair(sum(rows))}</td></tr></table></div>
<h2 style="margin:20px 0 4px">🆕 Which devices (last 3 days)</h2><p>Each new device, with the time it first opened that site (UAE) and its type. Use it to tell your own devices from anyone else's. Times were saved from 19 Oct evening.</p>
<div class="wrap"><table style="min-width:0"><tr><th>Day</th><th>Site</th><th>First opened</th><th>Device</th><th>Time used</th><th>Pages</th></tr>
${devs.length ? devs.map(r => `<tr><td>${nice(r.day)}</td><td>${VSITES[r.site] || r.site}</td><td>${r.at || '<small>before times were saved</small>'}</td><td>${r.kind || '<small>not saved</small>'}</td><td>${mins(r)}</td><td>${r.pages || '–'}</td></tr>`).join('') : '<tr><td colspan="6">No devices yet.</td></tr>'}</table></div>
<p style="margin-top:12px">Open this page once on each phone or laptop you use, and your visits on it stop being counted (numbers up to 19 Oct may include yours). A phone in private mode, or the same phone in a different browser, counts as another device. Cloudflare Web Analytics (dash.cloudflare.com) also has visit numbers; it counts everyone, you too.</p></body></html>`;
    return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' } });
  }
  return null;
}
// VISITS end

export default {
  async fetch(request, env, ctx) {
    { const v = await visitsHook(request, env, ctx); if (v) return v; }
    const url = new URL(request.url);
    if (url.protocol === 'http:') { url.protocol = 'https:'; return Response.redirect(url.toString(), 301); }
    if (url.pathname === '/api/flag' || url.pathname.startsWith('/api/flag/')) return secure(await flagApi(request, env, url), request);
    if (url.pathname.startsWith('/api/sync/')) return secure(await syncApi(request, env, url), request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    const clean = new Request(request);
    clean.headers.delete('if-none-match');
    clean.headers.delete('if-modified-since');
    return secure(await env.ASSETS.fetch(clean), request);
  },
};
