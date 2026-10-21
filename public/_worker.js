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
// FLAGS: 💬 Messages to the parent who made the sites, like a chat (user 2026-10-21: "i don't want flags to whatsapp or email,
// i want it like chat to my private admin page"; "suggestions to improve and what they don't like about each site").
// help.js sends 🚩 mistakes, 💡 ideas and 👎 dislikes here; they appear at once on the owner's private page (/__visits?k=…),
// where the parent can reply. A reply shows only on the device that sent the message: that device keeps a random
// conversation number in its own browser storage. No names, accounts, e-mails or phone numbers. (hub-work/chat_worker.js,
// inserted by hub-work/add_chat.py; it replaced the older flags-only block and kept its key for audit-team/check_flags.py.)
const FLAG_KEY_HASH = 'a0eb9a84d213e5cf0ebe1aa4249164074d84be882ecc1c3e7d6a14737285bc85';
const flagClean = (x, n) => String(x == null ? '' : x).replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, ' ').slice(0, n);
const CHAT_KINDS = ['mistake', 'idea', 'dislike', 'other'];
let chatReady = false;
async function chatSetup(db) {
  if (chatReady) return;
  await db.prepare('CREATE TABLE IF NOT EXISTS chat (id INTEGER PRIMARY KEY AUTOINCREMENT, thread TEXT, site TEXT, sender TEXT, kind TEXT, page TEXT, url TEXT, msg TEXT, created INTEGER, done INTEGER DEFAULT 0)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS chat_thread ON chat (thread)').run();
  try {   // the older "Flag a mistake" messages become conversations too (once)
    await db.prepare("INSERT INTO chat (thread, site, sender, kind, page, url, msg, created, done) SELECT 'flag-' || id, site, 'student', 'mistake', page, url, msg, created, done FROM flags WHERE NOT EXISTS (SELECT 1 FROM chat WHERE chat.thread = 'flag-' || flags.id)").run();
  } catch (e) {}
  chatReady = true;
}
const chatThread = t => /^[A-Za-z0-9-]{16,64}$/.test(String(t || '')) ? String(t) : '';
async function chatAdd(request, env, url, body, thread) {
  const db = env.DB, now = Date.now();
  const ip = await syncHash('ip:' + (request.headers.get('cf-connecting-ip') || '') + ':' + new Date(now).toISOString().slice(0, 10));
  if (request.headers.get('origin') !== url.origin) return syncJson({ error: 'Please use this site.' }, 403);
  if (await syncCount(db, 'flag:' + ip, now, 20)) return syncJson({ error: 'Thank you! You have sent a lot just now. Please wait 15 minutes.' }, 429);
  const msg = flagClean(body.text, 1000).trim();
  if (msg.length < 2) return syncJson({ error: 'Please type your message first.' }, 400);
  await syncBump(db, 'flag:' + ip, now);
  const kind = CHAT_KINDS.includes(body.kind) ? body.kind : 'other';
  await db.prepare('INSERT INTO chat (thread, site, sender, kind, page, url, msg, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .bind(thread, url.hostname.split('.')[0], 'student', kind, flagClean(body.page, 200), flagClean(body.url, 300), msg, now).run();
  await db.prepare('UPDATE chat SET done = 0 WHERE thread = ?').bind(thread).run();   // a new message reopens the conversation
  return null;
}
const chatList = async (db, thread) => ((await db.prepare('SELECT id, sender, kind, msg, created FROM chat WHERE thread = ? ORDER BY id LIMIT 200').bind(thread).all()).results || [])
  .map(r => ({ id: r.id, from: r.sender === 'owner' ? 'owner' : 'me', kind: r.kind, msg: r.msg, at: r.created }));
async function chatApi(request, env, url) {   // /api/chat: send a message, or read this device's conversation
  if (!env.DB) return syncJson({ error: 'Sending is not set up yet.' }, 503);
  await syncSetup(env.DB); await chatSetup(env.DB);
  if (request.method === 'GET') {
    const t = chatThread(url.searchParams.get('t'));
    return t ? syncJson({ msgs: await chatList(env.DB, t) }) : syncJson({ msgs: [] });
  }
  if (request.method !== 'POST') return syncJson({ error: 'Method not allowed' }, 405);
  let body;
  try { const t = await request.text(); if (t.length > 6000) return syncJson({ error: 'That is too long.' }, 413); body = JSON.parse(t) || {}; }
  catch (e) { return syncJson({ error: 'Bad request' }, 400); }
  const thread = chatThread(body.t);
  if (!thread) return syncJson({ error: 'Bad request' }, 400);
  const bad = await chatAdd(request, env, url, body, thread); if (bad) return bad;
  return syncJson({ ok: true, msgs: await chatList(env.DB, thread) });
}
async function flagApi(request, env, url) {   // the older 🚩 button (pages still cached on phones) + the daily check's list
  if (!env.DB) return syncJson({ error: 'Sending is not set up yet.' }, 503);
  if (request.method !== 'POST') return syncJson({ error: 'Method not allowed' }, 405);
  let body;
  try { const t = await request.text(); if (t.length > 6000) return syncJson({ error: 'That is too long.' }, 413); body = JSON.parse(t) || {}; }
  catch (e) { return syncJson({ error: 'Bad request' }, 400); }
  const db = env.DB, now = Date.now(), op = url.pathname.replace(/^\/api\/flag\/?/, '');
  await syncSetup(db); await chatSetup(db);
  if (op === '') {
    const bad = await chatAdd(request, env, url, { ...body, kind: 'mistake' }, 'flag-' + crypto.randomUUID()); if (bad) return bad;
    return syncJson({ ok: true });
  }
  if (op === 'list' || op === 'done') {   // audit-team/check_flags.py (key kept only on the parent's computer)
    const ip = await syncHash('ip:' + (request.headers.get('cf-connecting-ip') || '') + ':' + new Date(now).toISOString().slice(0, 10));
    if (await syncCount(db, 'flagkey:' + ip, now, 5)) return syncJson({ error: 'Too many tries. Please wait 15 minutes.' }, 429);
    if (await syncHash('flags:' + String(body.key || '')) !== FLAG_KEY_HASH) { await syncBump(db, 'flagkey:' + ip, now); return syncJson({ error: 'Not allowed' }, 403); }
    if (op === 'done') { await db.prepare('UPDATE chat SET done = 1 WHERE thread = (SELECT thread FROM chat WHERE id = ?)').bind(Number(body.id) || 0).run(); return syncJson({ ok: true }); }
    const r = await db.prepare("SELECT id, site, kind, page, url, msg, created, done FROM chat WHERE sender = 'student' AND id > ? ORDER BY id LIMIT 500").bind(Number(body.after) || 0).all();
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
  await db.prepare('CREATE TABLE IF NOT EXISTS vuse (day TEXT, site TEXT, part TEXT, n INTEGER, PRIMARY KEY (day, site, part))').run();   // v6: parts used
  await db.prepare('CREATE TABLE IF NOT EXISTS vpass (tok TEXT PRIMARY KEY, site TEXT, uses INTEGER, created INTEGER)').run();   // v6: show links
  await db.prepare('CREATE TABLE IF NOT EXISTS vguest (tok TEXT PRIMARY KEY, scope TEXT, exp INTEGER)').run();   // v7: guest visits across sites
  try { await db.prepare('ALTER TABLE vguest ADD COLUMN pass TEXT').run(); } catch (e) {}
  // v7: when each show link was opened and which sites the visit went to (user 2026-10-21: "can i know if the friend visited the
  // show link everytime he uses it"); kept on this server only, nothing on the visitor's device
  await db.prepare('CREATE TABLE IF NOT EXISTS vpassuse (pass TEXT, at INTEGER, site TEXT, kind TEXT)').run();
  visitsReady = true;
}
// where each site lives: all on deirarevise.workers.dev, except IGCSE Edexcel Maths on its own pages.dev link (user 2026-10-19:
// "for this site can we change deira revise")
const VHOST = { 'igcse-edexcel': 'igcse-edexcel.pages.dev' };
// 👀 a show link can also be for a year group's hub page and all its subject sites (user 2026-10-21: "i want the show link for
// the hub site and subsites"): one go = one visit of about 6 hours, moving freely between the hub and the subjects in guest mode
const VHUBS = { 'hub-year9': ['Year 9: hub + all subjects', 'year9.deirarevise.workers.dev'], 'hub-year8': ['Year 8: hub + all subjects', 'year8.deirarevise.workers.dev'] };
const vPassName = s => (VHUBS[s] || [])[0] || VSITES[s] || s;
const vPassHost = s => VHUBS[s] ? VHUBS[s][1] : vHost(s);
async function vGuestNew(db, scope, pass) {   // a guest visit: valid about 6 hours on the hub and every subject site
  const gs = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 32), now = Date.now();
  await db.prepare('DELETE FROM vguest WHERE exp < ?1').bind(now - 864e5).run();
  await db.prepare('INSERT INTO vguest (tok, scope, exp, pass) VALUES (?1, ?2, ?3, ?4)').bind(await vsha('guest:' + gs), scope, now + 6 * 3600e3, pass).run();
  await db.prepare("INSERT INTO vpassuse (pass, at, site, kind) VALUES (?1, ?2, ?3, 'open')").bind(pass, now, scope).run();
  return gs;
}
const vHost = s => VHOST[s] || `${s}.deirarevise.workers.dev`;
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
    if (url.searchParams.has('use')) {   // 📊 which parts were opened (user 2026-10-21: "without knowing the persons can i know how they are using it"):
      // only totals per day, site and part (e.g. "exam:3,topic:5,tool-ask:1"), never a device number
      const parts = String(url.searchParams.get('use') || '').split(',').slice(0, 25).map(x => x.split(':'))
        .filter(([p, n]) => /^[a-z0-9-]{1,30}$/.test(p || '') && +n > 0).map(([p, n]) => [p, Math.min(+n, 100)]);
      if (parts.length) {
        const job = (async () => { await visitsTable(env.DB);
          await env.DB.batch(parts.map(([p, n]) => env.DB.prepare('INSERT INTO vuse (day, site, part, n) VALUES (?1, ?2, ?3, ?4) ON CONFLICT (day, site, part) DO UPDATE SET n = n + ?4').bind(day, site, p, n))); })().catch(() => {});
        if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
      }
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }
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
      let isNew = url.searchParams.get('n') === '1' ? 1 : 0;   // n: older pages still cached on phones; no number at all (storage blocked) = not a new device each load
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
    const q = encodeURIComponent(k);
    const next = i + 1 < list.length ? `https://${vHost(list[i + 1])}/__me?k=${q}&i=${i + 1}&b=${back}` : `https://${vHost(back)}/__visits?k=${q}&done=1`;
    return new Response(`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visits</title>
<p style="font:16px system-ui;padding:16px">Setting up this device (${i + 1} of ${list.length})…</p>
<script>try { localStorage.setItem('vown', '1'); } catch (e) {} location.replace(${JSON.stringify(next)});</script>`,
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' } });
  }
  // 💬 owner actions from the private page (forms, so they work without any script): reply, finish a conversation,
  // make or stop a "show link"
  if (/^\/__visits\/(reply|done|pass|stop|solved)$/.test(url.pathname) && request.method === 'POST') {
    let f; try { f = await request.formData(); } catch (e) { return new Response('Bad request', { status: 400 }); }
    const k = String(f.get('k') || '');
    if (!env.DB || !(await vOwner(k))) return new Response('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });
    await visitsTable(env.DB); await chatSetup(env.DB);
    const op = url.pathname.split('/')[2], t = String(f.get('t') || '').slice(0, 80);
    let back = `/__visits?k=${encodeURIComponent(k)}&done=1`;
    if (op === 'reply') {
      const text = flagClean(f.get('text'), 2000).trim();
      const s = t && text ? await env.DB.prepare('SELECT site FROM chat WHERE thread = ? LIMIT 1').bind(t).first() : null;
      if (s) await env.DB.prepare("INSERT INTO chat (thread, site, sender, kind, page, url, msg, created, done) VALUES (?, ?, 'owner', 'reply', '', '', ?, ?, 0)").bind(t, s.site, text, Date.now()).run();
      back += '#msgs';
    }
    if (op === 'done') { await env.DB.prepare('UPDATE chat SET done = ? WHERE thread = ?').bind(f.get('undo') ? 0 : 1, t).run(); back += '#msgs'; }
    if (op === 'solved') {   // ✅ one tap: the student is told it is solved and thanked, and the conversation is finished
      // (user 2026-10-21: "inform the one who flags a mistake if solved and say thanks for flagging and helping to improve")
      const s = t ? await env.DB.prepare("SELECT site, MAX(kind = 'mistake') AS mk FROM chat WHERE thread = ? AND sender = 'student'").bind(t).first() : null;
      if (s && s.site && !/^flag-/.test(t)) {
        const text = s.mk ? '✅ It is fixed now. Thank you for flagging it and helping to improve the site! 🌟' : '✅ Done! Thank you for your idea and for helping to improve the site! 🌟';
        await env.DB.prepare("INSERT INTO chat (thread, site, sender, kind, page, url, msg, created, done) VALUES (?, ?, 'owner', 'reply', '', '', ?, ?, 1)").bind(t, s.site, text, Date.now()).run();
      }
      await env.DB.prepare('UPDATE chat SET done = 1 WHERE thread = ?').bind(t).run(); back += '#msgs';
    }
    if (op === 'pass') {   // 👀 a link for someone outside the class: opens twice, then stops (user 2026-10-21)
      const ps = String(f.get('site') || '');
      if (VSITES[ps] || VHUBS[ps]) {
        const tok = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 32);
        await env.DB.prepare('INSERT INTO vpass (tok, site, uses, created) VALUES (?1, ?2, 2, ?3)').bind(await vsha('pass:' + tok), ps, Date.now()).run();
        back += '&newpass=' + encodeURIComponent(ps + ':' + tok);
      }
      back += '#show';
    }
    if (op === 'stop') { await env.DB.prepare('UPDATE vpass SET uses = 0 WHERE rowid = ?').bind(Number(f.get('id')) || 0).run(); back += '#show'; }
    return new Response(null, { status: 303, headers: { location: back, 'cache-control': 'no-store' } });
  }
  // 👀 the show link itself. Opening it only shows a button (message apps open links to make previews, and that must not use
  // one of the two goes); the button uses one go and opens the site in guest mode: help.js then saves nothing on that device
  // and nothing is counted.
  // 👀 arriving from the hub or another subject site during a guest visit: this site opens in guest mode too
  const gm = url.pathname.match(/^\/__guest\/([a-f0-9]{32})$/);
  if (gm && request.method === 'GET') {
    let ok = false;
    if (env.DB) {
      await visitsTable(env.DB); const r = await env.DB.prepare('SELECT exp, pass FROM vguest WHERE tok = ?1').bind(await vsha('guest:' + gm[1])).first(); ok = !!(r && r.exp > Date.now());
      if (ok && r.pass) await env.DB.prepare("INSERT INTO vpassuse (pass, at, site, kind) VALUES (?1, ?2, ?3, 'site')").bind(r.pass, Date.now(), url.hostname.split('.')[0]).run();
    }
    const to = url.searchParams.get('to') || '/', safeTo = /^\/(?!\/)/.test(to) ? to : '/';
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>Opening…</title></head><body style="font:17px system-ui;padding:24px 16px">${ok
      ? `<p>Opening…</p><script>try { sessionStorage.setItem('guest', '1'); sessionStorage.setItem('gtok', ${JSON.stringify(gm[1])}); } catch (e) {} location.replace(${JSON.stringify(safeTo)});</script>`
      : '<h1>This visit has ended</h1><p>A guest visit lasts a few hours. Please ask the person who sent the link for a new one.</p>'}</body></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' } });
  }
  const sm = url.pathname.match(/^\/__show\/([a-f0-9]{32})$/);
  if (sm && (request.method === 'GET' || request.method === 'POST')) {
    const site = url.hostname.split('.')[0], h = await vsha('pass:' + sm[1]), since = Date.now() - 14 * 864e5;
    let left = 0, opened = false, gs = '';
    if (env.DB) {
      await visitsTable(env.DB);
      if (request.method === 'POST') {
        const r = await env.DB.prepare('UPDATE vpass SET uses = uses - 1 WHERE tok = ?1 AND site = ?2 AND uses > 0 AND created > ?3').bind(h, site, since).run();
        opened = !!(r.meta && r.meta.changes);
        if (opened) gs = await vGuestNew(env.DB, site, h);
      } else {
        const r = await env.DB.prepare('SELECT uses FROM vpass WHERE tok = ?1 AND site = ?2 AND created > ?3').bind(h, site, since).first();
        left = r ? r.uses : 0;
      }
    }
    const name = VSITES[site] || 'study site';
    const body = opened ? `<p>Opening ${name}…</p><script>try { sessionStorage.setItem('guest', '1'); sessionStorage.setItem('gtok', ${JSON.stringify(gs)}); } catch (e) {} location.replace('/');</script>`
      : left > 0 ? `<h1>👀 ${name}</h1><p>You have been sent a link to look at this revision site. It opens in guest mode: nothing is saved on your device. The person who sent it can see when it is opened.</p>
<p>This link works <b>${left === 1 ? 'one more time' : 'twice'}</b>.</p><form method="post"><button type="submit">Open the site</button></form>`
      : `<h1>This link has stopped working</h1><p>It could be opened twice, and it has been used. Please ask the person who sent it for a new one.</p>`;
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${name}</title>
<style>body{margin:0;padding:24px 16px;font:17px/1.5 system-ui,sans-serif;background:#f4f6fb;color:#1d2433;max-width:560px;margin-inline:auto}
@media (prefers-color-scheme:dark){body{background:#12151c;color:#e8ecf3}}h1{font-size:24px}button{font:inherit;font-weight:700;padding:12px 22px;border-radius:999px;border:0;background:#0E8F6E;color:#fff;cursor:pointer}</style></head><body>${body}</body></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' } });
  }
  if (url.pathname === '/__visits' && request.method === 'GET') {
    const k = url.searchParams.get('k') || '';
    if (!(await vOwner(k))) return new Response('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });
    const site = url.hostname.split('.')[0];
    const meUrl = VSITES[site] ? `https://${vHost(Object.keys(VSITES)[0])}/__me?k=${encodeURIComponent(k)}&i=0&b=${site}` : '';
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
    // 💬 messages, 📊 parts used (last 7 days), 👀 show links (v6, 2026-10-21)
    let chats = [], uses = [], passes = [], puse = [];
    if (env.DB) {
      await chatSetup(env.DB);
      chats = (await env.DB.prepare('SELECT id, thread, site, sender, kind, page, url, msg, created, done FROM chat ORDER BY id DESC LIMIT 2000').all()).results || [];
      uses = (await env.DB.prepare('SELECT site, part, SUM(n) AS n FROM vuse WHERE day >= ?1 GROUP BY site, part ORDER BY n DESC').bind(vDay(6)).all()).results || [];
      passes = (await env.DB.prepare('SELECT rowid AS id, tok, site, uses, created FROM vpass WHERE created > ?1 ORDER BY created DESC LIMIT 20').bind(Date.now() - 14 * 864e5).all()).results || [];
      puse = (await env.DB.prepare('SELECT pass, at, site, kind FROM vpassuse WHERE at > ?1 ORDER BY at').bind(Date.now() - 15 * 864e5).all()).results || [];
    }
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const KIND = { mistake: '🚩 Mistake', idea: '💡 Idea to improve', dislike: '👎 Doesn’t like', other: '💬 Message' };
    const when = ms => { const d = new Date(ms + 4 * 3600e3); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) + ' ' + d.toISOString().slice(11, 16); };
    const threads = {}; for (const c of chats.slice().reverse()) (threads[c.thread] = threads[c.thread] || []).push(c);
    const tlist = Object.values(threads).sort((a, b) => b[b.length - 1].id - a[a.length - 1].id);
    const openT = tlist.filter(m => m.some(x => !x.done)), doneT = tlist.filter(m => m.every(x => x.done)).slice(0, 30);
    const waiting = openT.filter(m => m[m.length - 1].sender === 'student').length;
    const hid = (n, v) => `<input type="hidden" name="${n}" value="${esc(v)}">`;
    const QUICK = ['✅ Thank you! It is fixed now.', '👍 Thank you, good idea! I will add it.', '🔍 Thank you, I am checking it.', '🙏 Thank you for telling me.'];
    const thread = (m, isOpen) => {
      const s = m[0].site, first = m.find(x => x.sender === 'student') || m[0], kinds = [...new Set(m.filter(x => x.sender === 'student').map(x => x.kind))];
      const link = `https://${vHost(s)}${first.url && first.url.startsWith('/') ? first.url : '/'}`, canReply = !/^flag-/.test(m[0].thread);
      return `<div class="th${isOpen && m[m.length - 1].sender === 'student' ? ' new' : ''}"><div class="thh"><b>${esc(VSITES[s] || s)}</b> ${kinds.map(x => `<span class="k k-${esc(x)}">${KIND[x] || KIND.other}</span>`).join(' ')} <small>· page: ${esc(first.page || 'Home')} · <a href="${esc(link)}" target="_blank" rel="noopener">open it</a></small></div>
${m.map(x => `<div class="b ${x.sender === 'owner' ? 'mine' : 'st'}"><div>${esc(x.msg).replace(/\n/g, '<br>')}</div><small>${x.sender === 'owner' ? 'You' : 'Student'} · ${when(x.created)}</small></div>`).join('')}
${isOpen ? (canReply ? `<form method="post" action="/__visits/reply" class="rf">${hid('k', k)}${hid('t', m[0].thread)}<div class="qr">${QUICK.map(q => `<button type="button" class="ghost" data-q="${esc(q)}">${esc(q)}</button>`).join('')}</div><textarea name="text" rows="2" required placeholder="Write a reply, or tap a ready answer above and edit it. The student sees it on the phone or computer they used."></textarea><button type="submit">Send reply</button></form>`
        : '<p class="small">Sent before replies existed, so the student can’t see a reply.</p>')
        + `<div class="qr">${canReply ? `<form method="post" action="/__visits/solved" class="df">${hid('k', k)}${hid('t', m[0].thread)}<button type="submit">✅ Solved: thank them &amp; finish</button></form>` : ''}<form method="post" action="/__visits/done" class="df">${hid('k', k)}${hid('t', m[0].thread)}<button type="submit" class="ghost">✓ Done (no message)</button></form></div>`
        : `<form method="post" action="/__visits/done" class="df">${hid('k', k)}${hid('t', m[0].thread)}${hid('undo', '1')}<button type="submit" class="ghost">↩ Open again</button></form>`}</div>`;
    };
    const stud = chats.filter(x => x.sender === 'student');
    const fb = Object.keys(VSITES).map(s => { const c = kk => stud.filter(x => x.site === s && x.kind === kk); return [s, c('idea'), c('dislike'), c('mistake'), c('other')]; }).filter(r => r.slice(1).some(l => l.length));
    const UN = { home: 'Home page', exam: 'Exam questions', topics: 'Topics', topic: 'A topic (notes, quiz, cards)', quiz: 'Quiz', test: 'Test', paper: 'Practice paper', print: 'Print papers',
      library: 'Downloads', revise: '⚡ Revise', help: '❓ Help', plan: '📅 Study plan', progress: 'My progress', textbook: '📘 Textbook practice', gt: '🎟️ Golden tickets',
      a: 'An assessment page', more: 'More', start: 'Start here', summary: 'Summary', equations: 'Equations', quick: 'Quick check', lab: 'Practicals', cheat: 'Cheat sheet', year: 'The whole year',
      'tool-ask': '🤖 Ask AI', 'tool-read': '🔊 Read aloud', 'tool-big': 'A+ Bigger text', 'tool-sticky': '📌 Sticky note', 'tool-notes': '📝 My notes', 'tool-msg': '💬 Message sent' };
    const uname = p => UN[p] || (p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' '));
    const rate = uses.filter(u => /^(up|dn)-/.test(u.part)); uses = uses.filter(u => !/^(up|dn)-/.test(u.part));   // 👍/👎 "Was this page helpful?"
    const rateRows = Object.keys(VSITES).map(s => {
      const parts = {}; rate.filter(u => u.site === s).forEach(u => { const p = u.part.slice(3), o = parts[p] = parts[p] || [0, 0]; o[u.part.startsWith('up-') ? 0 : 1] += u.n; });
      return [s, Object.entries(parts).sort((a, b) => (b[1][0] + b[1][1]) - (a[1][0] + a[1][1]))];
    }).filter(([, l]) => l.length);
    const useRows = Object.keys(VSITES).map(s => [s, uses.filter(u => u.site === s)]).filter(([, l]) => l.length);
    const np = (url.searchParams.get('newpass') || '').split(':');
    const newLink = (VSITES[np[0]] || VHUBS[np[0]]) && /^[a-f0-9]{32}$/.test(np[1] || '') ? `https://${vPassHost(np[0])}/__show/${np[1]}` : '';
    // each go of a show link: when it was opened and the sites that visit went to (hub = "Hub")
    const siteName = s => /^year\d$/.test(s) ? 'Hub' : (VSITES[s] || s);
    const goes = tok => {
      const ev = puse.filter(x => x.pass === tok); if (!ev.length) return '<small>not opened yet</small>';
      const out = []; for (const x of ev) { if (x.kind === 'open' || !out.length) out.push({ at: x.at, sites: [siteName(x.site)] }); else if (!out[out.length - 1].sites.includes(siteName(x.site))) out[out.length - 1].sites.push(siteName(x.site)); }
      return out.map((g, i) => `<b>Go ${i + 1}:</b> ${when(g.at)} · ${g.sites.map(esc).join(', ')}`).join('<br>');
    };
    const used2 = d => devs.filter(x => x.day === d && (x.secs || 0) >= 120).length;
    const used = (d, s) => devs.filter(x => x.day === d && x.site === s && (x.secs || 0) >= 120).length;
    // no time yet: still in its first seconds (opened in the last 3 minutes), or opened and left at once (user 2026-10-20: the "–" looked like a fault)
    const nowMin = (([h, m]) => +h * 60 + +m)(vTime().split(':')), fresh = x => x.day === vDay() && x.at && nowMin - (([h, m]) => +h * 60 + +m)(x.at.split(':')) <= 3;
    const mins = x => x.secs ? (x.secs < 60 ? 'under 1 min' : Math.floor(x.secs / 60) + ' min') : `<small>${fresh(x) ? 'starting…' : 'quick look'}</small>`;
    const days = [...new Set(rows.map(r => r.day))].slice(0, 30), sites = Object.keys(VSITES);
    const cell = (d, s) => { const r = rows.find(x => x.day === d && x.site === s); return r ? `<td><b>${r.devices}</b>${used(d, s) ? `<small> · ${used(d, s)} used</small>` : ''}</td>` : '<td class="z">0</td>'; };   // 0, not "–" (user 2026-10-19)
    const sum = list => list.reduce((a, r) => [a[0] + r.devices, a[1] + r.opens], [0, 0]);
    const nice = d => new Date(d + 'T00:00:00Z').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
    const pair = ([a]) => `<b>${a}</b>`;
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${waiting ? `(${waiting}) ` : ''}Visits</title>
<style>:root{--bg:#f4f6fb;--card:#fff;--ink:#1d2433;--muted:#5b6475;--line:#e4e7ec;--brand:#0E8F6E}
@media (prefers-color-scheme:dark){:root{--bg:#12151c;--card:#1c212b;--ink:#e8ecf3;--muted:#9aa3b2;--line:#2c3340;--brand:#34D3A3}}
body{margin:0;background:var(--bg);color:var(--ink);font:15px/1.5 system-ui,sans-serif;padding:16px}h1{margin:0 0 4px}p{color:var(--muted);margin:0 0 12px}
.wrap{overflow-x:auto;background:var(--card);border-radius:12px;box-shadow:0 2px 12px #0001}table{border-collapse:collapse;width:100%;min-width:640px}
th,td{padding:8px 10px;border-bottom:1px solid var(--line);text-align:center;white-space:nowrap}th:first-child,td:first-child{text-align:left;position:sticky;left:0;background:var(--card)}
th{font-size:13px;color:var(--muted)}td.z{color:var(--muted)}small{color:var(--muted)}tr.t td{border-top:2px solid var(--brand)}
h2{margin:22px 0 4px}.th{background:var(--card);border-radius:12px;box-shadow:0 2px 12px #0001;padding:12px;margin:0 0 12px;display:grid;gap:8px;max-width:760px}
.th.new{outline:2px solid var(--brand)}.thh{line-height:1.7}.k{display:inline-block;padding:1px 9px;border-radius:999px;font-size:13px;font-weight:600;background:var(--bg)}
.k-mistake{color:#b42318}.k-dislike{color:#9a5b00}.k-idea{color:var(--brand)}.b{max-width:85%;padding:8px 12px;border-radius:14px;white-space:normal;overflow-wrap:anywhere}
.b.st{background:var(--bg);justify-self:start;border-bottom-left-radius:4px}.b.mine{background:var(--brand);color:#fff;justify-self:end;border-bottom-right-radius:4px}.b.mine small{color:#e6fff6}
.rf{display:grid;gap:6px}.qr{display:flex;flex-wrap:wrap;gap:6px}.qr button{font-size:13px;padding:4px 10px}.rf textarea{font:inherit;font-size:16px;padding:8px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:inherit}
button{font:inherit;font-weight:600;padding:8px 14px;border-radius:999px;border:0;background:var(--brand);color:#fff;cursor:pointer;justify-self:start}button.ghost{background:transparent;color:var(--brand);border:1px solid var(--line)}
select{font:inherit;padding:7px;border-radius:8px}.newlink{background:var(--card);border:2px solid var(--brand);border-radius:12px;padding:12px;overflow-wrap:anywhere;max-width:760px}
.nav{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 8px}.nav a{padding:4px 12px;border-radius:999px;background:var(--card);text-decoration:none;color:inherit;border:1px solid var(--line)}
td.l{text-align:left;white-space:normal}</style></head><body>
<h1>📈 Visits${waiting ? ` <small style="color:var(--brand)">· 💬 ${waiting} new</small>` : ''}</h1>
<div class="nav"><a href="#msgs">💬 Messages${waiting ? ` (${waiting} new)` : ''}</a><a href="#fb">💡 Ideas &amp; dislikes</a><a href="#use">📊 What they use</a><a href="#show">👀 Show links</a><a href="#visits">📈 Visits</a></div><p>Each box: how many <b>devices</b> opened that site that day (UAE time). A device counts once a day per site, however many times it opens it. <small>"· 3 used"</small> = how many of them really used it (2 minutes or more of tapping, typing, scrolling, watching a video or listening). Day total = all the sites' boxes for that day added up (user 2026-10-20: "total views for each day"); a student who used 3 sites counts 3 there. Total row = each site's days added up. Counting started on 19 Oct 2026. Only you have this link: please keep it private.</p>
<p id="me" style="color:var(--brand);font-weight:600"></p>
<script>(function () { var own = false; try { own = localStorage.getItem('vown') === '1'; } catch (e) {}
  var me = document.getElementById('me'), go = ${JSON.stringify(meUrl)}, done = /[?&]done=1/.test(location.search);
  if (own) { me.textContent = '✓ Your own visits on this device are not counted. '; if (go) { var a = document.createElement('a'); a.href = go; a.textContent = 'Set up this device again (after a new site is added)'; me.appendChild(a); } }
  else if (go && !done) location.replace(go);
  else me.textContent = 'This device could not be set up, so your visits on it may still be counted.';
})();</script>
<h2 id="msgs">💬 Messages from students</h2><p>Mistakes, ideas and things they don’t like, sent with the buttons at the bottom of every page. No names. Your reply appears on the phone or computer that sent the message, the next time the student opens that site. New messages appear here within 30 seconds.</p>
${openT.length ? openT.map(m => thread(m, true)).join('') : '<p><b>No open messages.</b></p>'}
${doneT.length ? `<details><summary>Finished conversations (${doneT.length})</summary>${doneT.map(m => thread(m, false)).join('')}</details>` : ''}
<h2 id="fb">💡 What students suggest and don’t like, by site</h2><p>Every 💡 idea to improve and 👎 thing they don’t like, newest first (open or finished).</p>
${rateRows.length ? `<p><b>👍 / 👎 Was this page helpful?</b> One-tap answers at the bottom of each page (last 7 days), by part of the site:</p><div class="wrap" style="margin-bottom:12px"><table style="min-width:0"><tr><th>Site</th><th style="text-align:left">Part: 👍 helpful · 👎 not helpful</th></tr>${rateRows.map(([s, l]) => `<tr><td>${esc(VSITES[s])}</td><td class="l">${l.map(([p, [u, d]]) => `${esc(uname(p))}: 👍 <b>${u}</b> · 👎 <b${d > u ? ' style="color:#b42318"' : ''}>${d}</b>`).join(' &nbsp;|&nbsp; ')}</td></tr>`).join('')}</table></div>` : ''}
${fb.length ? `<div class="wrap"><table style="min-width:0"><tr><th>Site</th><th>💡 Ideas</th><th>👎 Don’t like</th><th>🚩 Mistakes</th><th>💬 Other</th></tr>${fb.map(([s, i, d, mk, o]) => `<tr><td>${esc(VSITES[s])}</td><td>${i.length}</td><td>${d.length}</td><td>${mk.length}</td><td>${o.length}</td></tr>`).join('')}</table></div>
${fb.filter(([, i, d]) => i.length || d.length).map(([s, i, d]) => `<details open><summary><b>${esc(VSITES[s])}</b></summary><ul>${[...i, ...d].sort((a, b) => b.id - a.id).slice(0, 15).map(x => `<li>${KIND[x.kind]}: “${esc(x.msg)}” <small>· ${when(x.created)}</small></li>`).join('')}</ul></details>`).join('')}` : '<p>None yet.</p>'}
<h2 id="use">📊 What students use (last 7 days)</h2><p>How many times each part was opened, all devices together. No device numbers and no names: just totals. Your own devices are not counted.</p>
${useRows.length ? `<div class="wrap"><table style="min-width:0"><tr><th>Site</th><th style="text-align:left">Parts opened (most used first)</th></tr>${useRows.map(([s, l]) => `<tr><td>${esc(VSITES[s])}</td><td class="l">${l.slice(0, 14).map(u => `${esc(uname(u.part))} <b>${u.n}</b>`).join(' · ')}</td></tr>`).join('')}</table></div>` : '<p>Nothing yet: counting started on 21 Oct 2026.</p>'}
<h2 id="show">👀 Show links</h2><p>A link for someone outside the class, for example a friend. It can be opened <b>twice only</b>, then it stops (and after 14 days). Choose a year group’s hub to show the hub page <b>and all its subject sites</b>: each go is one visit of about 6 hours, moving freely between them. While they use it, nothing is saved on their device, they are not counted, and the message buttons are hidden. Below you see when each go was opened and which sites were visited (the link page tells them you can see when it is opened). The sites have no password, so it can’t stop someone who copies a normal web address.</p>
<form method="post" action="/__visits/pass" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px">${hid('k', k)}<label for="ps">Show:</label><select id="ps" name="site">${[...Object.keys(VHUBS), ...Object.keys(VSITES)].map(s => `<option value="${s}">${esc(vPassName(s))}</option>`).join('')}</select><button type="submit">Make a show link</button></form>
${newLink ? `<div class="newlink"><b>Your new show link</b> (it is shown only now):<br><span id="nl">${esc(newLink)}</span><br><button type="button" id="cp" style="margin-top:8px">Copy the link</button> <span id="cpd" class="small"></span></div>` : ''}
${passes.length ? `<div class="wrap" style="margin-top:10px"><table style="min-width:0"><tr><th>Link for</th><th>Made</th><th>Goes left</th><th style="text-align:left">Opened (UAE time) and sites visited</th><th></th></tr>${passes.map(p => `<tr><td>${esc(vPassName(p.site))}</td><td>${when(p.created)}</td><td>${p.uses > 0 ? p.uses + ' of 2' : 'used up / stopped'}</td><td class="l">${goes(p.tok)}</td><td>${p.uses > 0 ? `<form method="post" action="/__visits/stop" style="margin:0">${hid('k', k)}${hid('id', p.id)}<button type="submit" class="ghost">Stop it</button></form>` : ''}</td></tr>`).join('')}</table></div>` : ''}
<h2 id="visits">📈 Visits</h2>
<div class="wrap"><table><tr><th>Day</th>${sites.map(s => `<th>${VSITES[s]}</th>`).join('')}<th>Day total</th></tr>
${days.length ? days.map(d => `<tr><td>${nice(d)}</td>${sites.map(s => cell(d, s)).join('')}<td><b>${sum(rows.filter(r => r.day === d))[0]}</b>${used2(d) ? `<small> · ${used2(d)} used</small>` : ''}</td></tr>`).join('') : `<tr><td colspan="${sites.length + 2}">No visits counted yet. Open any site, then refresh this page.</td></tr>`}
<tr class="t"><td><b>Total</b></td>${sites.map(s => `<td>${pair(sum(rows.filter(r => r.site === s)))}</td>`).join('')}<td>${pair(sum(rows))}</td></tr></table></div>
<h2 style="margin:20px 0 4px">🆕 Which devices (last 3 days)</h2><p>Each new device, with the time it first opened that site (UAE) and its type. Use it to tell your own devices from anyone else's. <b>Time used</b> counts only while the student is tapping, typing, scrolling, watching a video or listening; it arrives after 15 seconds of use and then every minute. <small>starting…</small> = opened in the last few minutes, no time sent yet. <small>quick look</small> = opened and left within seconds. This page updates itself every minute.</p>
<div class="wrap"><table style="min-width:0"><tr><th>Day</th><th>Site</th><th>First opened</th><th>Device</th><th>Time used</th><th>Pages</th></tr>
${devs.length ? devs.map(r => `<tr><td>${nice(r.day)}</td><td>${VSITES[r.site] || r.site}</td><td>${r.at || '<small>before times were saved</small>'}</td><td>${r.kind || '<small>not saved</small>'}</td><td>${mins(r)}</td><td>${r.pages || 1}</td></tr>`).join('') : '<tr><td colspan="6">No devices yet.</td></tr>'}</table></div>
<p style="margin-top:12px">Open this page once on each phone or laptop you use, and your visits on it stop being counted (numbers up to 19 Oct may include yours). A phone in private mode, or the same phone in a different browser, counts as another device. Cloudflare Web Analytics (dash.cloudflare.com) also has visit numbers; it counts everyone, you too.</p>
<script>(function () {   // refresh every 30 seconds, but never while you are typing a reply
  setInterval(function () {
    var busy = [].some.call(document.querySelectorAll('textarea'), function (t) { return t.value.trim() || t === document.activeElement; });
    if (!busy && document.visibilityState === 'visible') location.reload();
  }, 30000);
  document.addEventListener('click', function (e) {   // a ready answer fills the reply box, to send as it is or edit
    var b = e.target.closest && e.target.closest('[data-q]'); if (!b) return;
    var ta = b.closest('form').querySelector('textarea'); ta.value = b.getAttribute('data-q'); ta.focus();
  });
  var cp = document.getElementById('cp');
  if (cp) cp.onclick = function () {
    var t = document.getElementById('nl').textContent, d = document.getElementById('cpd');
    try { navigator.clipboard.writeText(t).then(function () { d.textContent = 'Copied'; }, function () { d.textContent = 'Select the link and copy it'; }); } catch (e) { d.textContent = 'Select the link and copy it'; }
  };
})();</script></body></html>`;
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
    if (url.pathname === '/api/chat') return secure(await chatApi(request, env, url), request);
    if (url.pathname === '/api/flag' || url.pathname.startsWith('/api/flag/')) return secure(await flagApi(request, env, url), request);
    if (url.pathname.startsWith('/api/sync/')) return secure(await syncApi(request, env, url), request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response('Method not allowed', { status: 405, headers: { allow: 'GET, HEAD' } });
    const clean = new Request(request);
    clean.headers.delete('if-none-match');
    clean.headers.delete('if-modified-since');
    return secure(await env.ASSETS.fetch(clean), request);
  },
};
