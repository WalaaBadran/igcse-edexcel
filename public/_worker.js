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
// 💬 Your say (23 Oct 2026): mistake, add, opinion, often, improve; idea and dislike are kept for pages still cached on phones
const CHAT_KINDS = ['mistake', 'add', 'opinion', 'often', 'improve', 'idea', 'dislike', 'other'];
let chatReady = false;
async function chatSetup(db) {
  if (chatReady) return;
  // ⚡ made once; then one quick check instead of three statements each time a server copy starts
  try { const r = await db.prepare("SELECT val FROM vkeys WHERE name = 'schema-chat'").first(); if (r && r.val === 'c1') { chatReady = true; return; } } catch (e) {}
  await db.prepare('CREATE TABLE IF NOT EXISTS chat (id INTEGER PRIMARY KEY AUTOINCREMENT, thread TEXT, site TEXT, sender TEXT, kind TEXT, page TEXT, url TEXT, msg TEXT, created INTEGER, done INTEGER DEFAULT 0)').run();
  await db.prepare('CREATE INDEX IF NOT EXISTS chat_thread ON chat (thread)').run();
  try {   // the older "Flag a mistake" messages become conversations too (once)
    await db.prepare("INSERT INTO chat (thread, site, sender, kind, page, url, msg, created, done) SELECT 'flag-' || id, site, 'student', 'mistake', page, url, msg, created, done FROM flags WHERE NOT EXISTS (SELECT 1 FROM chat WHERE chat.thread = 'flag-' || flags.id)").run();
  } catch (e) {}
  await db.prepare('CREATE TABLE IF NOT EXISTS vkeys (name TEXT PRIMARY KEY, val TEXT)').run();
  await db.prepare("INSERT OR REPLACE INTO vkeys (name, val) VALUES ('schema-chat', 'c1')").run();
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
// two owner keys open the private page (23 Oct 2026): the laptop's key (audit-team/owner-visits.key) and the newer key a
// cloud session made for Year 8 English; both work on every site, so the device set-up (/__me) goes through all 11 sites
const VISITS_HASHES = ['a3c878a98dd187788a3e71c30df3c20b4bf227e80e6a39854b1aa84334970441', 'd80298765ede9f05e36f4b9416ecc97f3b20a7168fc3d010bf9510ecc696c836'];
const VSITES = { 'year9-english': 'Y9 English', 'year8-english': 'Y8 English', 'year9-science': 'Y9 Science', 'year8-science': 'Y8 Science',
  'year9-geography': 'Y9 Geography', 'year8-geography': 'Y8 Geography', 'year9-history': 'Y9 History', 'year8-history': 'Y8 History',
  'year9-math': 'Y9 Maths', 'year8-math': 'Y8 Maths', 'year8-spanish': 'Y8 Spanish', 'year9-french': 'Y9 French', 'igcse-edexcel': 'IGCSE Maths (shared)' };
let visitsReady = false;
// ⚡ VSCHEMA: the tables below are made once; after that ONE quick check replaces ~16 table statements each time a server copy
// starts (user 2026-10-21: show links were slow, about 10 s from the year page to a subject). Change it whenever a table changes.
const VSCHEMA = 'v14';
const VDLK = Object.assign(Object.create(null), { dl: '⬇️ Downloaded', file: '📄 Opened', print: '🖨️ Printed' });   // not 'open': a show link's 'open' row = a go started   // ⬇️ kinds of file use (help.js fileUse)
const vDlName = f => String(f || '').replace(/[\u0000-\u001f<>"`\\]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
async function visitsTable(db) {
  if (visitsReady) return;
  try { const r = await db.prepare("SELECT val FROM vkeys WHERE name = 'schema-visits'").first(); if (r && r.val === VSCHEMA) { visitsReady = true; return; } } catch (e) {}
  await db.prepare('CREATE TABLE IF NOT EXISTS visits (day TEXT, site TEXT, opens INTEGER, devices INTEGER, PRIMARY KEY (day, site))').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS vdev (day TEXT, site TEXT, dev TEXT, PRIMARY KEY (day, site, dev))').run();
  for (const c of ['at', 'kind']) { try { await db.prepare(`ALTER TABLE vdev ADD COLUMN ${c} TEXT`).run(); } catch (e) {} }   // added in v3
  for (const c of ['secs', 'pages']) { try { await db.prepare(`ALTER TABLE vdev ADD COLUMN ${c} INTEGER`).run(); } catch (e) {} }   // added in v5
  await db.prepare('CREATE TABLE IF NOT EXISTS vuse (day TEXT, site TEXT, part TEXT, n INTEGER, PRIMARY KEY (day, site, part))').run();   // v6: parts used
  await db.prepare('CREATE TABLE IF NOT EXISTS vpass (tok TEXT PRIMARY KEY, site TEXT, uses INTEGER, created INTEGER)').run();   // v6: show links
  try { await db.prepare('ALTER TABLE vpass ADD COLUMN devh TEXT').run(); } catch (e) {}   // v9: the one device a show link works on
  try { await db.prepare('ALTER TABLE vdev ADD COLUMN pass INTEGER').run(); } catch (e) {}   // v10: that device had the 🔑 class pass
  await db.prepare('CREATE TABLE IF NOT EXISTS vguest (tok TEXT PRIMARY KEY, scope TEXT, exp INTEGER)').run();   // v7: guest visits across sites
  try { await db.prepare('ALTER TABLE vguest ADD COLUMN pass TEXT').run(); } catch (e) {}
  await db.prepare('CREATE TABLE IF NOT EXISTS vgdev (g TEXT, site TEXT, devh TEXT, PRIMARY KEY (g, site))').run();   // v9: the device of each guest visit
  // v7: when each show link was opened and which sites the visit went to (user 2026-10-21: "can i know if the friend visited the
  // show link everytime he uses it"); kept on this server only, nothing on the visitor's device
  await db.prepare('CREATE TABLE IF NOT EXISTS vpassuse (pass TEXT, at INTEGER, site TEXT, kind TEXT)').run();
  // v8 (user 2026-10-21: "did the friend use the link, for how long, what did he check, which pages"): time and pages of each go
  for (const [c, t] of [['part', 'TEXT'], ['secs', 'INTEGER']]) { try { await db.prepare(`ALTER TABLE vpassuse ADD COLUMN ${c} ${t}`).run(); } catch (e) {} }
  // v12 (23 Oct 2026): 👥 the class goal: how many answers the whole class gave on each site each week (totals only)
  await db.prepare('CREATE TABLE IF NOT EXISTS vgoal (site TEXT, week TEXT, n INTEGER, PRIMARY KEY (site, week))').run();
  // v13 (user 2026-10-23: "if someone downloaded let me know"): ⬇️ files downloaded, opened or printed, totals per day (60 days)
  await db.prepare('CREATE TABLE IF NOT EXISTS vdl (day TEXT, site TEXT, kind TEXT, item TEXT, part TEXT, n INTEGER, last INTEGER, PRIMARY KEY (day, site, kind, item))').run();
  // v14 (user 2026-10-25: "a pop up survey percentage … how much benefit they get"): 📊 the weekly answers, how many students
  // chose each % (0, 10 … 100) on each site in each survey round (a round starts Sunday 11 pm UAE; was 6:00 until 25 Oct); totals only
  await db.prepare('CREATE TABLE IF NOT EXISTS vrate (site TEXT, week TEXT, p INTEGER, n INTEGER, PRIMARY KEY (site, week, p))').run();
  await db.prepare('CREATE TABLE IF NOT EXISTS vkeys (name TEXT PRIMARY KEY, val TEXT)').run();
  await db.prepare("INSERT OR REPLACE INTO vkeys (name, val) VALUES ('schema-visits', ?1)").bind(VSCHEMA).run();
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
  await db.prepare('DELETE FROM vgdev WHERE g NOT IN (SELECT tok FROM vguest)').run();
  await db.prepare('INSERT INTO vguest (tok, scope, exp, pass) VALUES (?1, ?2, ?3, ?4)').bind(await vsha('guest:' + gs), scope, now + 6 * 3600e3, pass).run();
  await db.prepare("INSERT INTO vpassuse (pass, at, site, kind) VALUES (?1, ?2, ?3, 'open')").bind(pass, now, scope).run();
  return gs;
}
// 🔒 for showing, not for sharing (user 2026-10-21: "the links i send to friends for showing only not for sharing, this is very
// important"). A show link, and the guest visit it starts, work on ONE device: the first one that opens it. That device gets
// one small cookie (a random number, only for show-link visitors, kept 14 days); the server keeps only its hash. During the
// visit the sites open at a guest address, /__g/<visit>/..., not at their plain address, so a copy of what is in the address
// bar does not open on another device, and stops when the visit ends.
const vDevCookie = request => ((request.headers.get('cookie') || '').match(/(?:^|;\s*)vgd=([a-f0-9]{32})/) || [])[1] || '';
const vNewHex = () => (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 32);
const vDevSet = dv => `vgd=${dv}; Path=/; Max-Age=1209600; HttpOnly; Secure; SameSite=Lax`;
async function vGuestDev(db, gh, site, dv, bind) {   // is this guest visit tied to this device on this site? (bind: tie it now if it is free)
  const dh = dv ? await vsha('dev:' + dv) : '';
  let row = await db.prepare('SELECT devh FROM vgdev WHERE g = ?1 AND site = ?2').bind(gh, site).first();
  if (!row && bind && dh) {
    await db.prepare('INSERT OR IGNORE INTO vgdev (g, site, devh) VALUES (?1, ?2, ?3)').bind(gh, site, dh).run();
    row = await db.prepare('SELECT devh FROM vgdev WHERE g = ?1 AND site = ?2').bind(gh, site).first();
  }
  return !!(row && dh && row.devh === dh);
}
const vGuestPage = (title, body, setCk) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>body{margin:0 auto;padding:24px 16px;font:17px/1.5 system-ui,sans-serif;background:#f4f6fb;color:#1d2433;max-width:560px}@media (prefers-color-scheme:dark){body{background:#12151c;color:#e8ecf3}}h1{font-size:24px}</style></head><body>${body}</body></html>`,
  { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer', ...(setCk ? { 'set-cookie': setCk } : {}) } });
// 📚 the Maths past-papers check for the owner only (user 2026-10-21: "keep this on my site not students site"); the page is
// hub-work/owner_papers.html, put in here by add_visits.py; it opens only with the owner key, like the private page
const OWNER_PAPERS = "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><meta name=\"robots\" content=\"noindex,nofollow\"><title>4MA1 Papers on the Sites</title>\n<link rel=\"preconnect\" href=\"https://fonts.googleapis.com\"><link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n<link rel=\"stylesheet\" href=\"https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=IBM+Plex+Mono:wght@500;600&display=swap\">\n<style>\n/* Layout: one column of exam series in date order; each paper is a tile, colour = on the site / gaps / missing */\n:root { --bg: #F6F7F9; --card: #FFFFFF; --fg: #1B2230; --muted: #5A6475; --line: #DDE2EA; --accent: #2B5BA8;\n  --ok: #1F7A4D; --ok-bg: #E6F4EC; --part: #9A5B00; --part-bg: #FFF2DC; --miss: #B42318; --miss-bg: #FDE8E6;\n  --body: \"Atkinson Hyperlegible\", \"Segoe UI\", system-ui, sans-serif; --mono: \"IBM Plex Mono\", ui-monospace, Consolas, monospace; }\n@media (prefers-color-scheme: dark) { :root:not([data-theme=\"light\"]) { --bg: #12161D; --card: #1A2029; --fg: #E7EBF2; --muted: #9AA5B5; --line: #2C3441; --accent: #8DB2F2;\n  --ok: #6FD3A0; --ok-bg: #16312A; --part: #F5C06B; --part-bg: #3A2C12; --miss: #FF8E84; --miss-bg: #3D1C1A; color-scheme: dark } }\n:root[data-theme=\"dark\"] { --bg: #12161D; --card: #1A2029; --fg: #E7EBF2; --muted: #9AA5B5; --line: #2C3441; --accent: #8DB2F2;\n  --ok: #6FD3A0; --ok-bg: #16312A; --part: #F5C06B; --part-bg: #3A2C12; --miss: #FF8E84; --miss-bg: #3D1C1A; color-scheme: dark }\nbody { background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 16px; line-height: 1.5; }\n.wrap { max-width: 980px; margin: 0 auto; padding-block: 28px 48px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 18px; }\nh1 { font-size: clamp(26px, 4vw, 34px); line-height: 1.15; margin: 0; text-wrap: balance; }\n.lede { color: var(--muted); margin: 0; max-width: 68ch; }\n.sum { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 10px; }\n.stat { background: var(--card); border: 1px solid var(--line); border-radius: 12px; padding: 12px 14px; }\n.stat b { display: block; font-size: 28px; font-variant-numeric: tabular-nums; line-height: 1.1; }\n.stat span { color: var(--muted); font-size: 14px; }\n.stat.ok b { color: var(--ok); } .stat.part b { color: var(--part); } .stat.miss b { color: var(--miss); }\n.legend { display: flex; flex-wrap: wrap; gap: 8px 16px; font-size: 14px; color: var(--muted); }\n.legend i { display: inline-block; width: 12px; height: 12px; border-radius: 3px; margin-right: 6px; vertical-align: -1px; }\n.series { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px 16px; display: grid; gap: 8px; min-width: 0; }\n.shead { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 4px 12px; }\n.shead h2 { font-size: 19px; margin: 0; }\n.count { font-size: 14px; color: var(--muted); font-variant-numeric: tabular-nums; }\n.snote { margin: 0; font-size: 14px; color: var(--muted); }\n.tiles { display: grid; grid-template-columns: repeat(auto-fill, minmax(112px, 1fr)); gap: 8px; }\n.tile { border-radius: 10px; padding: 8px 10px; display: grid; gap: 2px; border: 1px solid transparent; min-width: 0; }\n.tile b { font-family: var(--mono); font-size: 16px; }\n.tile span { font-size: 13px; line-height: 1.35; overflow-wrap: anywhere; }\n.tile.ok { background: var(--ok-bg); color: var(--ok); }\n.tile.part { background: var(--part-bg); color: var(--part); }\n.tile.miss { background: var(--miss-bg); color: var(--miss); border-color: var(--miss); }\n.tile.noms { border-color: var(--miss); } .tile .nomsnote { color: var(--miss); font-weight: 600; }\n.box { background: var(--card); border: 1px solid var(--line); border-radius: 14px; padding: 14px 18px; }\n.box h2 { font-size: 19px; margin: 0 0 6px; }\n.box ul { margin: 6px 0 0; padding-left: 20px; } .box li { margin: 2px 0; }\n.misslist li { color: var(--miss); }\n.newchip { font-style: normal; font-family: var(--body); font-size: 11px; font-weight: 700; letter-spacing: .02em; background: var(--accent); color: var(--card); border-radius: 999px; padding: 1px 7px; margin-left: 6px; vertical-align: 2px; }\n.part2 { margin-top: 10px; display: grid; gap: 8px; } .part2 h2 { font-size: 24px; margin: 0; }\n.small { font-size: 14px; color: var(--muted); }\na { color: var(--accent); }\n</style>\n</head><body>\n<div class=\"wrap\">\n  <header style=\"display:grid;gap:8px\"><a href=\"{{BACK}}\" style=\"font-size:14px\">\u2190 Back to my private page</a><h1>4MA1 papers on the Maths sites</h1>\n  <p class=\"lede\">Every Edexcel International GCSE Maths A (4MA1) paper, in date order, checked against the question bank on the Year 8, Year 9 and IGCSE Maths sites (updated 22 October 2026). R = the time-zone version of a paper.</p></header>\n  <div class=\"box\"><h2>Added on 21 and 22 October</h2><ul class=\"small\">\n    <li>22 October, late night: November 2005 and May/June 2006 (3H and 4H): 83 questions as pictures, from scanned MyMathsCloud copies with the ribbon removed; no mark scheme exists online for them, so worked solutions (written with AI help) will be added. All 28 4400 papers are now on the sites.</li>\n    <li>22 October, night: the four 2004 Higher papers of the 4400 course (May 2004 3H and 4H, November 2004 3H and 4H): 85 questions with their Pearson mark schemes, from MyMathsCloud copies with the corner ribbon removed (you said yes); every picture checked for the ribbon. November 2005 and May/June 2006 stay off: MyMathsCloud\u2019s \u201cmark schemes\u201d for them are a tutor\u2019s handwritten answers, not Pearson\u2019s.</li>\n    <li>22 October, evening: the oldest course, 4400 (2004\u20132010): 20 Higher papers from Dynamic Papers, 437 questions, each checked by eye and none showing the website\u2019s stamp.</li>\n    <li>22 October, later: the older course too (4MA0, June 2011 \u2013 January 2019). 15 missing papers added (June 2013 3HR, January 2015 2FR, June 2015 1FR and 2FR, June 2018 1F, 1FR, 2F and 2FR, January 2019 1F, 2F, 2FR, 3H, 3HR, 4H and 4HR) and every gap filled: 111 of its 112 papers are now on the sites with every question. January 2019 1FR could not be found online. 4MA0 questions shown to students: 1670 \u2192 2169.</li>\n    <li>22 October: missing last questions found by a new check against each paper (June 2019 1HR Q25 and 2HR Q23\u201324, January 2020 1HR Q23, November 2021 2H Q22), and the two sample (SAMs) Higher papers now have pictures for all their questions.</li>\n    <li>22 October: the 7 November papers (November 2023 1F, 1H and 2F; November 2024 1F, 1H, 2F and 2H) from Pearson\u2019s own website: 178 questions, each with its picture; 137 new to students, the rest shared between the Foundation and Higher paper. November 2023 2H now links to Pearson too.</li>\n    <li>7 papers: June 2021 1H and 2H, November 2023 2H, June 2019 2F and 2FR, Specimen 1F and 2F (176 questions, each with its picture; 136 new to students, the rest already there from the paper they share).</li>\n    <li>June 2019 1H: questions 5, 9 and 20.</li>\n    <li>The gaps in 38 papers: 150 questions (85 never added, 65 whose picture had failed its check). 89 are new to students; the other 61 were already there as the Foundation or Higher copy.</li>\n    <li>Repeats: 98 questions were showing twice (the same question on the Foundation and Higher paper, not matched before). Each now shows once.</li>\n    <li>10 question pictures already on the sites were missing their first line; they are cut again.</li>\n    <li>The new questions' topics were sorted with AI help (questions shared with a Higher paper keep the classified's topic). Two of the book's topics were corrected once their pictures showed the question.</li></ul></div>\n  <div class=\"sum\"><div class=\"stat\"><b>116</b><span>4MA1 papers exist (June 2018 \u2013 June 2025 + specimens)</span></div>\n    <div class=\"stat ok\"><b>116</b><span>on the sites, every question</span></div>\n    <div class=\"stat part\"><b>0</b><span>on the sites, some questions missing</span></div>\n    <div class=\"stat miss\"><b>0</b><span>not on the sites at all</span></div></div>\n  <div class=\"legend\"><span><i style=\"background:var(--ok-bg);border:1px solid var(--ok)\"></i>On the sites</span><span><i style=\"background:var(--part-bg);border:1px solid var(--part)\"></i>On the sites, some questions missing</span><span><i style=\"background:var(--miss-bg);border:1px solid var(--miss)\"></i>Not on the sites</span><span><span class=\"newchip\" style=\"margin:0 6px 0 0\">New</span>added on 21\u201322 October (57 papers)</span></div>\n  <section class=\"series\"><div class=\"shead\"><h2>June 2018</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 27 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 24 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2019</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 23 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2019</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2F<i class=\"newchip\">New</i></b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2FR<i class=\"newchip\">New</i></b><span>All 27 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2020</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 27 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2020</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <p class=\"snote\">The May/June 2020 exams were cancelled and the same papers were sat in November 2020 (Physics &amp; Maths Tutor files them as \u201cJune 2020\u201d).</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 27 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2021</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2021</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <p class=\"snote\">No R (time-zone) papers this series.</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1H<i class=\"newchip\">New</i></b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2H<i class=\"newchip\">New</i></b><span>All 23 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2021</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <p class=\"snote\">No R (time-zone) papers this series.</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 21 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2022</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 23 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2022</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 27 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 28 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 27 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 25 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2023</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2023</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 28 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 28 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2023</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <p class=\"snote\">No R (time-zone) papers this series. From Pearson\u2019s own website (not on Physics &amp; Maths Tutor).</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F<i class=\"newchip\">New</i></b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1H<i class=\"newchip\">New</i></b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2F<i class=\"newchip\">New</i></b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H<i class=\"newchip\">New</i></b><span>All 24 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2024</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 28 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2024</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <p class=\"snote\">No R (time-zone) papers this series. From Pearson\u2019s own website (not on Physics &amp; Maths Tutor).</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F<i class=\"newchip\">New</i></b><span>All 27 questions</span></div><div class=\"tile ok\"><b>1H<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2F<i class=\"newchip\">New</i></b><span>All 27 questions</span></div><div class=\"tile ok\"><b>2H<i class=\"newchip\">New</i></b><span>All 25 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2025</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1HR</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 28 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 27 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2HR</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>Specimen papers</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <p class=\"snote\">Pearson\u2019s sample papers for the course. The Foundation mark schemes are printed sideways with no question totals, so the site links to them instead of showing cut-outs.</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>1H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2F<i class=\"newchip\">New</i></b><span>All 26 questions</span></div><div class=\"tile ok\"><b>2H</b><span>All 22 questions</span></div></div></section>\n  <div class=\"part2\"><h2>Older course: 4MA0 (June 2011 \u2013 January 2019)</h2>\n  <p class=\"lede\">The course before 4MA1, kept on the sites for extra practice. Its Higher papers are 3H and 4H.</p>\n  <div class=\"sum\"><div class=\"stat\"><b>112</b><span>4MA0 papers exist</span></div>\n    <div class=\"stat ok\"><b>111</b><span>on the sites, every question</span></div>\n    <div class=\"stat miss\"><b>1</b><span>not on the sites (January 2019 1FR: not online; Pearson\u2019s file is a copy of 1F)</span></div></div></div>\n  <section class=\"series\"><div class=\"shead\"><h2>June 2011</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 26 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 24 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2012</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2012</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 19 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2013</h2><span class=\"count\">4 of 4 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 19 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 28 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2013</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>3HR<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 23 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2014</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 19 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2014</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 21 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2015</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2FR<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 20 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2015</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1FR<i class=\"newchip\">New</i></b><span>All 21 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>2FR<i class=\"newchip\">New</i></b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 21 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2016</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 18 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 19 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 24 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2016</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 19 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 21 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2017</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 21 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2017</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 24 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2018</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <div class=\"tiles\"><div class=\"tile ok\"><b>1F</b><span>All 24 questions</span></div><div class=\"tile ok\"><b>1FR</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>2F</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2FR</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 25 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 19 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>June 2018</h2><span class=\"count\">8 of 8 on the sites</span></div>\n  <p class=\"snote\">From Exam Papers Practice (Physics &amp; Maths Tutor\u2019s June 2018 papers are the new 4MA1 course).</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F<i class=\"newchip\">New</i></b><span>All 20 questions</span></div><div class=\"tile ok\"><b>1FR<i class=\"newchip\">New</i></b><span>All 20 questions</span></div><div class=\"tile ok\"><b>2F<i class=\"newchip\">New</i></b><span>All 23 questions</span></div><div class=\"tile ok\"><b>2FR<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>3H</b><span>All 21 questions</span></div><div class=\"tile ok\"><b>3HR</b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4H</b><span>All 20 questions</span></div><div class=\"tile ok\"><b>4HR</b><span>All 25 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>January 2019</h2><span class=\"count\">7 of 8 on the sites</span></div>\n  <p class=\"snote\">The last 4MA0 series. Paper 1FR is not online: Pearson\u2019s website has its mark scheme, but the question-paper file there is a copy of Paper 1F (checked 22 October).</p><div class=\"tiles\"><div class=\"tile ok\"><b>1F<i class=\"newchip\">New</i></b><span>All 23 questions</span></div><div class=\"tile miss\"><b>1FR</b><span>Not on the sites</span></div><div class=\"tile ok\"><b>2F<i class=\"newchip\">New</i></b><span>All 22 questions</span></div><div class=\"tile ok\"><b>2FR<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 24 questions</span></div><div class=\"tile ok\"><b>3HR<i class=\"newchip\">New</i></b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 23 questions</span></div><div class=\"tile ok\"><b>4HR<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section>\n  <div class=\"part2\"><h2>Oldest course: 4400 (May 2004 \u2013 November 2010)</h2>\n  <p class=\"lede\">Higher papers only (3H and 4H); no Foundation 4400 papers were found anywhere. The only copies used before were MyMathsCloud\u2019s watermarked ones, so students saw none of these until 22 October. Now from Dynamic Papers (Pearson\u2019s papers; their website stamp is erased before cutting, so it never appears in a picture), and the four 2004 papers from MyMathsCloud copies with their corner ribbon removed (no link to the branded copy).</p>\n  <div class=\"sum\"><div class=\"stat\"><b>28</b><span>4400 Higher papers</span></div>\n    <div class=\"stat ok\"><b>28</b><span>on the sites, every question</span></div>\n    <div class=\"stat miss\"><b>4</b><span>of them without a mark scheme (November 2005, May/June 2006: none exists online), marked \u2757 in red below; every question has a worked solution instead</span></div></div></div>\n  <section class=\"series\"><div class=\"shead\"><h2>May/June 2004</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 20 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2004</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 20 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 23 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>May/June 2005</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 19 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2005</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok noms\"><b>3H<i class=\"newchip\">New</i></b><span>All 21 questions</span><span class=\"nomsnote\">\u2757 No mark scheme: worked solutions instead</span></div><div class=\"tile ok noms\"><b>4H<i class=\"newchip\">New</i></b><span>All 21 questions</span><span class=\"nomsnote\">\u2757 No mark scheme: worked solutions instead</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>May/June 2006</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok noms\"><b>3H<i class=\"newchip\">New</i></b><span>All 23 questions</span><span class=\"nomsnote\">\u2757 No mark scheme: worked solutions instead</span></div><div class=\"tile ok noms\"><b>4H<i class=\"newchip\">New</i></b><span>All 18 questions</span><span class=\"nomsnote\">\u2757 No mark scheme: worked solutions instead</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2006</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 25 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>May/June 2007</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 19 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 21 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2007</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 26 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>May/June 2008</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 23 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2008</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 20 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>May/June 2009</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2009</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 25 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>May/June 2010</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section><section class=\"series\"><div class=\"shead\"><h2>November 2010</h2><span class=\"count\">2 of 2 on the sites</span></div><div class=\"tiles\"><div class=\"tile ok\"><b>3H<i class=\"newchip\">New</i></b><span>All 21 questions</span></div><div class=\"tile ok\"><b>4H<i class=\"newchip\">New</i></b><span>All 22 questions</span></div></div></section>\n  <div class=\"box\"><h2>Nothing missing</h2><p class=\"small\" style=\"margin:0\">Every 4MA1 paper is on the sites with all its questions.</p></div>\n  <div class=\"box\"><h2>How this was checked</h2><ul class=\"small\">\n    <li>Which papers exist: the 4MA1 lists on Save My Exams and Physics &amp; Maths Tutor (16 series, newest June 2025). There were no January exams after 2023, and the November series have no R versions.</li>\n    <li>\u201cMissing Q\u2026\u201d means that question number is not in the question bank, or is there without a picture (so it never appears in practice). Questions that are the same on the Foundation and Higher paper are kept once and count as present. A missing last question cannot be spotted this way.</li>\n    <li>372 of the 4MA1 questions on the sites have no cut-out mark-scheme picture; for those the site points to the question number in the official mark scheme.</li>\n    <li>Every paper was also checked against its own PDF: the number of questions it has and its 100 marks, so a missing last question shows up too.</li>\n    <li>For extra practice the sites also hold the older course, 4MA0 (June 2011 \u2013 January 2019: 111 of its 112 papers, every question), and all 28 Higher papers of the 4400 course (2004\u20132010; November 2005 and May/June 2006 without mark schemes).</li></ul></div>\n  <p class=\"small\">Sources: <a href=\"https://www.savemyexams.com/igcse/maths/edexcel/a/past-papers/paper-1\">Save My Exams, Paper 1</a> \u00b7 <a href=\"https://www.savemyexams.com/igcse/maths/edexcel/a/past-papers/paper-2/\">Save My Exams, Paper 2</a> \u00b7 <a href=\"https://www.physicsandmathstutor.com/past-papers/gcse-maths/edexcel-igcse-a-paper-1/\">Physics &amp; Maths Tutor, Paper 1</a> \u00b7 <a href=\"https://www.physicsandmathstutor.com/past-papers/gcse-maths/edexcel-igcse-a-paper-2/\">Physics &amp; Maths Tutor, Paper 2</a></p>\n</div>\n</body></html>\n";
const VKEEP = 3;   // how many show links are kept (the newest)
const vHost = s => VHOST[s] || `${s}.deirarevise.workers.dev`;
const vsha = async t => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(t)))].map(b => b.toString(16).padStart(2, '0')).join('');
const vOwner = async k => VISITS_HASHES.includes(await vsha('deirarevise-visits:' + k));
// a rough device type for the owner page, e.g. "Phone · iPhone · Safari" (nothing that identifies a person)
const vKind = ua => {
  const type = /iPad|Tablet/i.test(ua) ? 'Tablet' : /Mobi|iPhone|Android/i.test(ua) ? 'Phone' : 'Computer';
  const os = /iPhone/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows' : /CrOS/.test(ua) ? 'Chromebook' : /Mac OS X/.test(ua) ? 'Mac' : /Linux/.test(ua) ? 'Linux' : 'other';
  const br = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox/.test(ua) ? 'Firefox' : /Safari/.test(ua) ? 'Safari' : 'other browser';
  return `${type} · ${os} · ${br}`;
};
const vTime = () => new Date(Date.now() + 4 * 3600e3).toISOString().slice(11, 16);   // UAE time
// 📱 the owner's devices (user, 23 Oct 2026: "recognize my phone so not counted"): besides 'vown' in the browser's storage (which
// iPhone Safari may clear after 7 days without a visit), /__me sets a long-lasting cookie that the counter checks on the server
const vMine = request => /(?:^|;\s*)vown=1(?:;|$)/.test(request.headers.get('cookie') || '');
const vDay = (back = 0) => new Date(Date.now() + 4 * 3600e3 - back * 864e5).toISOString().slice(0, 10);   // UAE date
const vWeek = (back = 0) => { const d = new Date(Date.now() + 4 * 3600e3 - back * 7 * 864e5); d.setUTCDate(d.getUTCDate() - (d.getUTCDay() + 6) % 7); return d.toISOString().slice(0, 10); };   // the Monday of the UAE week
// 📊 the survey round (help.js asks from Sunday 11 pm UAE): the date of the Sunday it started, back = rounds before this one
// the round an answer is filed under: 'launch' for the first round (25 Oct 2026 until the first Sunday round, 1 Nov 11 pm)
const vRound = () => { const w = vSun(); return w < '2026-11-01' ? 'launch' : w; };
const vSun = (back = 0) => { const d = new Date(Date.now() + 4 * 3600e3 - 23 * 3600e3 - back * 7 * 864e5); d.setUTCDate(d.getUTCDate() - d.getUTCDay()); return d.toISOString().slice(0, 10); };
// 👥 this week's class goal: 10% more than last week's answers, rounded to 50 (at least 200; 300 in the first week)
const vGoalOf = last => Math.max(200, last ? Math.ceil(last * 1.1 / 50) * 50 : 300);
async function visitsHook(request, env, ctx) {
  const url = new URL(request.url);
  // 🔑 class pass (CLASSPASS block below): its own routes, and the lock when the owner turns it on; never blocks on an error
  try { const c = await cpHook(request, env, url); if (c) return c; } catch (e) {}
  if (url.pathname === '/__visit' && request.method === 'POST') {
    const site = url.hostname.split('.')[0];
    if (!env.DB || !VSITES[site] || request.headers.get('sec-fetch-site') === 'cross-site' || vMine(request)) return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    const dev = (url.searchParams.get('d') || '').slice(0, 64), day = vDay();
    if (VDLK[url.searchParams.get('dl')]) {   // ⬇️ a file downloaded, opened or printed: a total per day, site and file, no device number
      const dk = url.searchParams.get('dl'), f = vDlName(url.searchParams.get('f')), p = (url.searchParams.get('p') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30);
      if (f) {
        const job = (async () => { await visitsTable(env.DB);
          await env.DB.prepare('INSERT INTO vdl (day, site, kind, item, part, n, last) VALUES (?1, ?2, ?3, ?4, ?5, 1, ?6) ON CONFLICT (day, site, kind, item) DO UPDATE SET n = n + 1, last = ?6').bind(day, site, dk, f, p, Date.now()).run();
          if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM vdl WHERE day < ?1').bind(vDay(60)).run(); })().catch(() => {});
        if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
      }
      return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
    }
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
        if (await cpHas(request, env.DB)) await env.DB.prepare('UPDATE vdev SET pass = 1 WHERE day = ?1 AND site = ?2 AND dev = ?3 AND pass IS NULL').bind(day, site, (await vsha(day + ':' + site + ':' + dev)).slice(0, 32)).run();
        if (isNew) await env.DB.prepare('DELETE FROM vdev WHERE day < ?1').bind(vDay(3)).run();
      }
      await env.DB.prepare('INSERT INTO visits (day, site, opens, devices) VALUES (?1, ?2, 1, ?3) ON CONFLICT (day, site) DO UPDATE SET opens = opens + 1, devices = devices + ?3').bind(day, site, isNew).run();
    })().catch(() => {});
    if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }
  // 👥 class goal (fun.js): add answers to this week's total for this site (at most 40 at a time), or read the total and the goal
  if (url.pathname === '/__q' && request.method === 'POST') {
    const site = url.hostname.split('.')[0], n = Math.min(Math.max(Math.round(+url.searchParams.get('n') || 0), 0), 40);
    if (env.DB && VSITES[site] && n && request.headers.get('sec-fetch-site') !== 'cross-site' && !vMine(request)) {
      const job = (async () => { await visitsTable(env.DB); await env.DB.prepare('INSERT INTO vgoal (site, week, n) VALUES (?1, ?2, ?3) ON CONFLICT (site, week) DO UPDATE SET n = n + ?3').bind(site, vWeek(), n).run(); })().catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
    }
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }
  if (url.pathname === '/__goal' && request.method === 'GET') {
    const site = url.hostname.split('.')[0]; let n = 0, last = 0;
    if (env.DB && VSITES[site]) try {
      await visitsTable(env.DB);
      const r = (await env.DB.prepare('SELECT week, n FROM vgoal WHERE site = ?1 AND week IN (?2, ?3)').bind(site, vWeek(), vWeek(1)).all()).results || [];
      r.forEach(x => { if (x.week === vWeek()) n = x.n; else last = x.n; });
    } catch (e) {}
    return new Response(JSON.stringify({ week: vWeek(), n, last, goal: vGoalOf(last) }), { headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
  }
  // 📊 the Sunday "how much does this site help you?" pop-up (help.js): one answer, 0–100 in steps of 10, added to this survey
  // round's totals for the site; no device number, nothing that identifies anyone; the owner's devices are not counted
  if (url.pathname === '/__rate' && request.method === 'POST') {
    const site = url.hostname.split('.')[0], ps = url.searchParams.get('p') || '';
    if (env.DB && VSITES[site] && /^(100|[1-9]?0)$/.test(ps) && request.headers.get('sec-fetch-site') !== 'cross-site' && !vMine(request)) {
      const job = (async () => { await visitsTable(env.DB); await env.DB.prepare('INSERT INTO vrate (site, week, p, n) VALUES (?1, ?2, ?3, 1) ON CONFLICT (site, week, p) DO UPDATE SET n = n + 1').bind(site, vRound(), +ps).run(); })().catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
    }
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
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer',
        'set-cookie': 'vown=1; Path=/; Max-Age=34560000; Secure; HttpOnly; SameSite=Lax' } });   // 📱 about 400 days on this site
  }
  // 💬 owner actions from the private page (forms, so they work without any script): reply, finish a conversation,
  // make or stop a "show link"
  if (/^\/__visits\/(reply|done|pass|stop|reopen|solved|lockon|lockoff|joinnew|del|delused)$/.test(url.pathname) && request.method === 'POST') {
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
      if (VHUBS[ps]) {   // only a year hub + all its subjects (user, 23 Oct 2026: "only year 9 hub ... and same year 8")
        const tok = (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 32);
        await env.DB.prepare('INSERT INTO vpass (tok, site, uses, created) VALUES (?1, ?2, 2, ?3)').bind(await vsha('pass:' + tok), ps, Date.now()).run();
        // only the newest show links are kept (user 2026-10-21: "don't save, just the last ones created"): older ones and their
        // records are deleted, and stop working
        await env.DB.prepare(`DELETE FROM vpassuse WHERE pass IN (SELECT tok FROM vpass ORDER BY created DESC LIMIT -1 OFFSET ${VKEEP})`).run();
        await env.DB.prepare(`DELETE FROM vpass WHERE tok IN (SELECT tok FROM vpass ORDER BY created DESC LIMIT -1 OFFSET ${VKEEP})`).run();
        back += '&newpass=' + encodeURIComponent(ps + ':' + tok);
      }
      back += '#show';
    }
    if (op === 'lockon' || op === 'lockoff' || op === 'joinnew') { await cpOwnerSet(env.DB, op); back += '#classpass'; }   // 🔑 class pass
    if (op === 'del') {   // 🗑 delete one show link and its records (it stops working)
      const row = await env.DB.prepare('SELECT tok FROM vpass WHERE rowid = ?').bind(Number(f.get('id')) || 0).first();
      if (row) { await env.DB.prepare('DELETE FROM vpassuse WHERE pass = ?').bind(row.tok).run(); await env.DB.prepare('DELETE FROM vpass WHERE tok = ?').bind(row.tok).run(); }
      back += '#show';
    }
    if (op === 'delused') {   // 🗑 every used-up, stopped or expired show link at once (user 2026-10-23: "delete any link i will not open again")
      const gone = 'SELECT tok FROM vpass WHERE uses <= 0 OR created <= ?1';
      await env.DB.prepare(`DELETE FROM vpassuse WHERE pass IN (${gone})`).bind(Date.now() - 14 * 864e5).run();
      await env.DB.prepare(`DELETE FROM vpass WHERE tok IN (${gone})`).bind(Date.now() - 14 * 864e5).run();
      back += '#show';
    }
    if (op === 'stop' || op === 'reopen') {   // ⏹ stop a link, or ↩ give a stopped / used-up link one more go (user 2026-10-21); both are noted
      const id = Number(f.get('id')) || 0, row = await env.DB.prepare('SELECT tok, site FROM vpass WHERE rowid = ?').bind(id).first();
      if (row) {
        await env.DB.prepare(op === 'stop' ? 'UPDATE vpass SET uses = 0 WHERE rowid = ?' : 'UPDATE vpass SET uses = 1, created = MAX(created, ?2 - 13 * 864e5) WHERE rowid = ?1 AND uses = 0').bind(...(op === 'stop' ? [id] : [id, Date.now()])).run();
        await env.DB.prepare('INSERT INTO vpassuse (pass, at, site, kind) VALUES (?1, ?2, ?3, ?4)').bind(row.tok, Date.now(), row.site, op).run();
      }
      back += '#show';
    }
    return new Response(null, { status: 303, headers: { location: back, 'cache-control': 'no-store' } });
  }
  // 👀 the show link itself. Opening it only shows a button (message apps open links to make previews, and that must not use
  // one of the two goes); the button uses one go and opens the site in guest mode: help.js then saves nothing on that device
  // and nothing is counted.
  // 👀 during a show-link visit, help.js sends the pages opened and the minutes of use (only with the visit's own number),
  // and each file downloaded, opened or printed (user 2026-10-23: "let me know how they use it and if they download from it")
  if (url.pathname === '/__guestuse' && request.method === 'POST') {
    const g = url.searchParams.get('g') || '';
    if (env.DB && /^[a-f0-9]{32}$/.test(g)) {
      const job = (async () => {
        await visitsTable(env.DB);
        const r = await env.DB.prepare('SELECT exp, pass FROM vguest WHERE tok = ?1').bind(await vsha('guest:' + g)).first();
        if (!(r && r.exp > Date.now() && r.pass)) return;
        const dk = url.searchParams.get('dl') || '';
        if (VDLK[dk]) { await env.DB.prepare('INSERT INTO vpassuse (pass, at, site, kind, part, secs) VALUES (?1, ?2, ?3, ?4, ?5, 0)').bind(r.pass, Date.now(), url.hostname.split('.')[0], dk, vDlName(url.searchParams.get('f'))).run(); return; }
        const p = (url.searchParams.get('p') || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30), t = Math.min(Math.max(+url.searchParams.get('t') || 0, 0), 600);
        if (p || t) await env.DB.prepare("INSERT INTO vpassuse (pass, at, site, kind, part, secs) VALUES (?1, ?2, ?3, 'use', ?4, ?5)").bind(r.pass, Date.now(), url.hostname.split('.')[0], p, t).run();
      })().catch(() => {});
      if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job;
    }
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store' } });
  }
  // 👀 the guest address /__g/<visit>/...: pages open only on the visit's own device and only while the visit lasts; then the
  // site's normal file is served (the Worker carries on with the address without /__g/<visit>)
  const gp = url.pathname.match(/^\/__g\/([a-f0-9]{32})(\/.*)?$/);
  if (gp) {
    if (!gp[2]) return Response.redirect(`${url.origin}/__g/${gp[1]}/${url.search}`, 302);
    if (['GET', 'HEAD'].includes(request.method) && (request.headers.get('sec-fetch-dest') === 'document' || gp[2] === '/' || /\.html?$/.test(gp[2]))) {
      let ok = false, mine = false;
      if (env.DB) {
        const gh = await vsha('guest:' + gp[1]), ck = vDevCookie(request), dh = ck ? await vsha('dev:' + ck) : '';
        let r = null;
        try { r = await env.DB.prepare('SELECT g.exp AS exp, d.devh AS devh FROM vguest g LEFT JOIN vgdev d ON d.g = g.tok AND d.site = ?2 WHERE g.tok = ?1').bind(gh, url.hostname.split('.')[0]).first(); }
        catch (e) { await visitsTable(env.DB); r = await env.DB.prepare('SELECT g.exp AS exp, d.devh AS devh FROM vguest g LEFT JOIN vgdev d ON d.g = g.tok AND d.site = ?2 WHERE g.tok = ?1').bind(gh, url.hostname.split('.')[0]).first(); }
        ok = !!(r && r.exp > Date.now()); mine = !!(ok && dh && r.devh === dh);
      }
      if (!ok) return vGuestPage('Visit ended', `<h1>This visit has ended</h1><p>A guest visit lasts a few hours. Please ask the person who sent the link for a new one.</p>`);
      if (!mine) return vGuestPage('For one person only', `<h1>🔒 This page is for one person only</h1><p>It is part of a guest visit that was sent to someone to look at on their own device. It does not open on other devices. Please ask the person who made the site.</p>`);
    }
    const inner = new URL(url); inner.pathname = gp[2];
    return new Request(inner.toString(), request);
  }
  // 👀 arriving from the hub or another subject site during a guest visit: this site opens in guest mode too, on this device only
  const gm = url.pathname.match(/^\/__guest\/([a-f0-9]{32})$/);
  if (gm && request.method === 'GET') {
    let ok = false, mine = false; const ck = vDevCookie(request), dv = ck || vNewHex();
    if (env.DB) {
      await visitsTable(env.DB); const gh = await vsha('guest:' + gm[1]);
      const r = await env.DB.prepare('SELECT exp, pass FROM vguest WHERE tok = ?1').bind(gh).first(); ok = !!(r && r.exp > Date.now());
      if (ok) mine = await vGuestDev(env.DB, gh, url.hostname.split('.')[0], dv, true);
      if (ok && mine && r.pass) { const job = env.DB.prepare("INSERT INTO vpassuse (pass, at, site, kind) VALUES (?1, ?2, ?3, 'site')").bind(r.pass, Date.now(), url.hostname.split('.')[0]).run().catch(() => {}); if (ctx && ctx.waitUntil) ctx.waitUntil(job); else await job; }
    }
    const to = url.searchParams.get('to') || '/', safeTo = /^\/(?!\/)/.test(to) ? to : '/';
    if (!ok) return vGuestPage('Visit ended', `<h1>This visit has ended</h1><p>A guest visit lasts a few hours. Please ask the person who sent the link for a new one.</p>`);
    if (!mine) return vGuestPage('For one person only', `<h1>🔒 This page is for one person only</h1><p>It is part of a guest visit that was sent to someone to look at on their own device. It does not open on other devices. Please ask the person who made the site.</p>`);
    return vGuestPage('Opening…', `<p>Opening…</p><script>try { sessionStorage.setItem('guest', '1'); sessionStorage.setItem('gtok', ${JSON.stringify(gm[1])}); } catch (e) {} location.replace(${JSON.stringify('/__g/' + gm[1] + safeTo)});</script>`, ck ? '' : vDevSet(dv));
  }
  const sm = url.pathname.match(/^\/__show\/([a-f0-9]{32})$/);
  if (sm && (request.method === 'GET' || request.method === 'POST')) {
    const site = url.hostname.split('.')[0], h = await vsha('pass:' + sm[1]), since = Date.now() - 14 * 864e5;
    // 🔒 for showing, not for sharing (user 2026-10-21: "the links i send to friends for showing only not for sharing, this is very
    // important"): the first device that opens the link gets a small cookie for this link page only, and the link then works on
    // that device only; a forwarded copy does not open
    const ck = vDevCookie(request);
    let left = 0, opened = false, gs = '', other = false, setCk = '';
    if (env.DB) {
      await visitsTable(env.DB);
      const row = await env.DB.prepare('SELECT uses, devh FROM vpass WHERE tok = ?1 AND site = ?2 AND created > ?3').bind(h, site, since).first();
      other = !!(row && row.devh && row.devh !== (ck ? await vsha('dev:' + ck) : ''));
      if (request.method === 'POST' && row && !other) {
        const dv = ck || vNewHex(), dh = await vsha('dev:' + dv);
        const r = await env.DB.prepare('UPDATE vpass SET uses = uses - 1, devh = COALESCE(devh, ?4) WHERE tok = ?1 AND site = ?2 AND uses > 0 AND created > ?3 AND (devh IS NULL OR devh = ?4)').bind(h, site, since, dh).run();
        opened = !!(r.meta && r.meta.changes);
        if (opened) { gs = await vGuestNew(env.DB, site, h); await vGuestDev(env.DB, await vsha('guest:' + gs), site, dv, true); if (!ck) setCk = vDevSet(dv); }
      } else if (row) left = row.uses;
    }
    const name = VSITES[site] || 'study site';
    const body = opened ? `<p>Opening ${name}…</p><script>try { sessionStorage.setItem('guest', '1'); sessionStorage.setItem('gtok', ${JSON.stringify(gs)}); } catch (e) {} location.replace(${JSON.stringify('/__g/' + gs + '/')});</script>`
      : other ? `<h1>🔒 This link is for one person only</h1><p>It was sent to someone to look at the site on their own device, and it has already been opened there. It does not open on other devices. Please ask the person who made the site.</p>`
      // only the site's name and the button, no message (user 2026-10-23: "remove the message in the beginning, i don't want to
      // inform them"); the button stays so that message apps making a link preview don't use a go
      : left > 0 ? `<h1>👀 ${name}</h1><form method="post"><button type="submit">Open the site</button></form>`
      : `<h1>This link has stopped working</h1><p>It could be opened twice, and it has been used. Please ask the person who sent it for a new one.</p>`;
    return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${name}</title>
<style>body{margin:0;padding:24px 16px;font:17px/1.5 system-ui,sans-serif;background:#f4f6fb;color:#1d2433;max-width:560px;margin-inline:auto}
@media (prefers-color-scheme:dark){body{background:#12151c;color:#e8ecf3}}h1{font-size:24px}button{font:inherit;font-weight:700;padding:12px 22px;border-radius:999px;border:0;background:#0E8F6E;color:#fff;cursor:pointer}</style></head><body>${body}</body></html>`,
      { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer', ...(setCk ? { 'set-cookie': setCk } : {}) } });
  }
  if (url.pathname === '/__visits/papers' && request.method === 'GET') {
    const k = url.searchParams.get('k') || '';
    if (!(await vOwner(k))) return new Response('Not found', { status: 404, headers: { 'x-robots-tag': 'noindex' } });
    return new Response(OWNER_PAPERS.replace('{{BACK}}', `/__visits?k=${encodeURIComponent(k)}`), { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer' } });
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
      devs = (await env.DB.prepare('SELECT day, site, at, kind, secs, pages FROM vdev WHERE day >= ?1 ORDER BY day DESC, at DESC').bind(vDay(1)).all()).results || []; }   // today and yesterday only (user 2026-10-21); older days are in the counts
    // 💬 messages, 📊 parts used (last 7 days), 👀 show links (v6, 2026-10-21)
    let chats = [], uses = [], passes = [], puse = [], goals = [], dls = [], rates = [];
    if (env.DB) {
      await chatSetup(env.DB);
      chats = (await env.DB.prepare('SELECT id, thread, site, sender, kind, page, url, msg, created, done FROM chat ORDER BY id DESC LIMIT 2000').all()).results || [];
      uses = (await env.DB.prepare('SELECT site, part, SUM(n) AS n FROM vuse WHERE day >= ?1 GROUP BY site, part ORDER BY n DESC').bind(vDay(6)).all()).results || [];
      passes = (await env.DB.prepare(`SELECT rowid AS id, tok, site, uses, created FROM vpass WHERE created > ?1 ORDER BY created DESC LIMIT ${VKEEP}`).bind(Date.now() - 14 * 864e5).all()).results || [];
      puse = (await env.DB.prepare('SELECT pass, at, site, kind, part, secs FROM vpassuse WHERE at > ?1 ORDER BY at').bind(Date.now() - 15 * 864e5).all()).results || [];
      try { await visitsTable(env.DB); goals = (await env.DB.prepare('SELECT site, week, n FROM vgoal WHERE week >= ?1').bind(vWeek(1)).all()).results || []; } catch (e) {}   // 👥 class goal
      try { dls = (await env.DB.prepare('SELECT day, site, kind, item, part, n, last FROM vdl WHERE day >= ?1 ORDER BY last DESC LIMIT 300').bind(vDay(6)).all()).results || []; } catch (e) {}   // ⬇️ files
      try { rates = (await env.DB.prepare('SELECT site, week, p, n FROM vrate WHERE week >= ?1').bind(vSun(3)).all()).results || []; } catch (e) {}   // 📊 weekly survey
    }
    // 🔑 class pass: the lock, the class links, and how many recent devices already have the pass
    let cpi = null, cpT = { n: 0, p: 0 }, cp3 = { n: 0, p: 0 };
    if (env.DB) try {
      cpi = await cpOwner(env.DB);
      cpT = await env.DB.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(pass), 0) AS p FROM vdev WHERE site != 'igcse-edexcel' AND day = ?1").bind(vDay()).first() || cpT;
      cp3 = await env.DB.prepare("SELECT COUNT(*) AS n, COALESCE(SUM(pass), 0) AS p FROM vdev WHERE site != 'igcse-edexcel' AND day >= ?1").bind(vDay(2)).first() || cp3;   // today and the 2 days before (vdev keeps 4)
    } catch (e) {}
    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const KIND = { mistake: '🚩 Mistake', add: '➕ Add something', opinion: '❤️ Opinion', often: '📅 How often', improve: '🛠️ Make it better', idea: '💡 Idea to improve', dislike: '👎 Doesn’t like', other: '💬 Message' };
    const when = ms => { const d = new Date(ms + 4 * 3600e3); return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', timeZone: 'UTC' }) + ' ' + d.toISOString().slice(11, 16); };
    const threads = {}; for (const c of chats.slice().reverse()) (threads[c.thread] = threads[c.thread] || []).push(c);
    const tlist = Object.values(threads).sort((a, b) => b[b.length - 1].id - a[a.length - 1].id);
    const openT = tlist.filter(m => m.some(x => !x.done)), doneT = tlist.filter(m => m.every(x => x.done)).slice(0, 30);
    const waiting = openT.filter(m => m[m.length - 1].sender === 'student').length;
    const hid = (n, v) => `<input type="hidden" name="${n}" value="${esc(v)}">`;
    const QUICK = ['✅ Thank you! It is fixed now.', '🎉 Done! It is on the site now.', '👍 Thank you, good idea! I will add it.', '🔍 Thank you, I am checking it.', '🙏 Thank you for telling me.'];
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
    const stud = chats.filter(x => x.sender === 'student' && !/^TEST from the site builder/i.test(x.msg || ''));   // not the builder's tests
    // by site: [site, mistakes, add (+ old ideas), make it better (+ old dislikes), opinions + how often, other]
    const fb = Object.keys(VSITES).map(s => { const c = (...kk) => stud.filter(x => x.site === s && kk.includes(x.kind)); return [s, c('mistake'), c('add', 'idea'), c('improve', 'dislike'), c('opinion', 'often'), c('other')]; }).filter(r => r.slice(1).some(l => l.length));
    // ❤️ opinions and 📅 how often (💬 Your say, 23 Oct 2026): the one-tap answers, counted once per conversation (its newest answer)
    const OPN = { like: ['😍 Love it', '🙂 Like it', '😐 It’s OK', '🙁 Don’t like it'], useful: ['💯 Very useful', '👍 Useful', '🤏 A little', '👎 Not useful'], often: ['🔥 Every day', '📆 A few times a week', '📝 Only before tests', '👋 This is my first time'] };
    const opnRows = Object.keys(VSITES).map(s => {
      const last = {}; stud.filter(x => x.site === s && (x.kind === 'opinion' || x.kind === 'often')).forEach(x => {
        for (const [g, labels] of Object.entries(OPN)) { const hit = labels.find(l => (x.msg || '').includes(l)); if (hit && !last[x.thread + g]) last[x.thread + g] = [g, hit]; }   // newest first, so the first one seen is kept
      });
      const n = {}; Object.values(last).forEach(([g, l]) => { n[g] = n[g] || {}; n[g][l] = (n[g][l] || 0) + 1; });
      return [s, n];
    }).filter(([, n]) => Object.keys(n).length);
    const opnCell = (n, g) => n[g] ? OPN[g].filter(l => n[g][l]).map(l => `${esc(l)} <b>${n[g][l]}</b>`).join(' · ') : '<small>–</small>';
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
    const goes = tok => {   // each go: when, about how long, and the sites with the pages opened on each
      const all = puse.filter(x => x.pass === tok), ev = all.filter(x => x.kind !== 'stop' && x.kind !== 'reopen');
      const notes = all.filter(x => x.kind === 'stop' || x.kind === 'reopen').map(x => `<small>${x.kind === 'stop' ? '⏹ stopped by you' : '↩ reopened by you'} at ${when(x.at)}</small>`).join('<br>');
      if (!ev.length) return (notes ? notes + '<br>' : '') + '<small>not opened yet</small>';
      const out = [];
      for (const x of ev) {
        if (x.kind === 'open' || !out.length) out.push({ at: x.at, secs: 0, sites: new Map(), files: [] });
        const g = out[out.length - 1], nm = siteName(x.site);
        if (VDLK[x.kind]) { g.files.push(`${VDLK[x.kind]}: ${esc(x.part || 'a file')} <small>(${esc(nm)}, ${when(x.at).slice(-5)})</small>`); continue; }
        if (!g.sites.has(nm)) g.sites.set(nm, new Set());
        if (x.kind === 'use') { g.secs += x.secs || 0; if (x.part) g.sites.get(nm).add(uname(x.part)); }
      }
      const mins = g => g.secs >= 60 ? `about ${Math.round(g.secs / 60)} min` : g.secs ? 'under 1 min' : '<small>time not recorded</small>';
      return out.map((g, i) => `<b>Go ${i + 1}:</b> ${when(g.at)} · ${mins(g)}<br>${[...g.sites].map(([s, ps]) => `<b>${esc(s)}</b>${ps.size ? ': ' + [...ps].map(esc).join(', ') : ''}`).join(' · ')}${g.files.length ? '<br>' + g.files.join('<br>') : '<br><small>no downloads or prints</small>'}`).join('<br>') + (notes ? '<br>' + notes : '');
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
    // ⬇️ files downloaded, opened or printed (students; show-link visits are in 👀 Show links); today's count also in the menu
    const dlToday = dls.filter(x => x.day === vDay()).reduce((a, x) => a + x.n, 0);
    const dlHTML = dls.length ? `<div class="wrap"><table style="min-width:0"><tr><th>Last time</th><th>Site</th><th style="text-align:left">What</th><th>Times</th></tr>${dls.map(x => `<tr><td>${when(x.last)}</td><td>${esc(VSITES[x.site] || x.site)}</td><td class="l">${VDLK[x.kind] || '📄 Opened'}: <b>${esc(x.item)}</b>${x.part ? ` <small>· ${esc(uname(x.part))}</small>` : ''}</td><td><b>${x.n}</b>${x.day !== vDay() ? ` <small>on ${nice(x.day)}</small>` : ''}</td></tr>`).join('')}</table></div>` : '<p>Nothing yet: counting started on 23 Oct 2026.</p>';
    // 📊 Sunday survey: each site's average % this round and the 3 before (rounds start Sunday 11 pm UAE)
    // the first real round starts Sun 1 Nov 2026, 11 pm (no device can answer earlier); anything filed before it was a test
    const rWeeks = [0, 1, 2, 3].map(vSun).filter(w => w >= '2026-11-01'); if (rWeeks.length < 4) rWeeks.push('launch');   // + the launch round (25 Oct–1 Nov)
    const rAvg = (s, w) => { const l = rates.filter(r => r.site === s && r.week === w), n = l.reduce((a, r) => a + r.n, 0); return n ? [Math.round(l.reduce((a, r) => a + r.p * r.n, 0) / n), n] : null; };
    const rCell = a => a ? `<td><b style="color:${a[0] >= 70 ? 'var(--brand)' : a[0] >= 40 ? '#b45309' : '#b42318'}">${a[0]}%</b><br><small>${a[1]} answer${a[1] === 1 ? '' : 's'}</small></td>` : '<td class="z">–</td>';
    const rSites = Object.keys(VSITES).filter(s => rates.some(r => r.site === s && rWeeks.includes(r.week)));
    const rateHTML = rSites.length ? `<div class="wrap"><table style="min-width:0"><tr><th>Site</th>${rWeeks.map((w, i) => `<th>${i ? '' : 'Now: '}${w === 'launch' ? 'first round<br><small>25 Oct – 1 Nov</small>' : `from ${nice(w)}<br><small>11 pm</small>`}</th>`).join('')}</tr>${rSites.map(s => `<tr><td>${esc(VSITES[s])}</td>${rWeeks.map(w => rCell(rAvg(s, w))).join('')}</tr>`).join('')}</table></div>`
      : '<p>No answers yet: the first round started on 25 Oct; after it, the pop-up comes every Sunday from 11 pm (UAE time).</p>';
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
<p style="margin:0 0 8px" class="small">🔄 Updated at <b>${new Date(Date.now() + 4 * 3600e3).toISOString().slice(11, 19)}</b> (UAE time). This page refreshes by itself every 30 seconds while it is on screen, and as soon as you come back to it. <a href="#" id="rnow">↻ Refresh now</a></p>
<div class="nav"><a href="#msgs">💬 Messages${waiting ? ` (${waiting} new)` : ''}</a><a href="#rate">📊 Survey %</a><a href="#fb">❤️ Opinions &amp; ideas</a><a href="#use">📊 What they use</a><a href="#dl">⬇️ Downloads${dlToday ? ` (${dlToday} today)` : ''}</a><a href="#show">👀 Show links</a><a href="#visits">📈 Visits</a><a href="/__visits/papers?k=${encodeURIComponent(k)}">📚 Maths papers</a><a href="https://year9.deirarevise.workers.dev/" target="_blank" rel="noopener">🏠 Year 9 hub</a><a href="https://year8.deirarevise.workers.dev/" target="_blank" rel="noopener">🏠 Year 8 hub</a></div><p>Each box: how many <b>devices</b> opened that site that day (UAE time). A device counts once a day per site, however many times it opens it. <small>"· 3 used"</small> = how many of them really used it (2 minutes or more of tapping, typing, scrolling, watching a video or listening). Day total = all the sites' boxes for that day added up; a student who used 3 sites counts 3 there. Total row = each site's days added up. Counting started on 19 Oct 2026. Only you have this link: please keep it private.</p>
<p id="me" style="color:var(--brand);font-weight:600"></p>
<script>(function () { var own = false; try { own = localStorage.getItem('vown') === '1'; } catch (e) {}
  var me = document.getElementById('me'), go = ${JSON.stringify(meUrl)}, done = /[?&]done=1/.test(location.search);
  if (own) { me.textContent = '✓ Your own visits on this device are not counted. '; if (go) { var a = document.createElement('a'); a.href = go; a.textContent = 'Set up this device again (after a new site is added)'; me.appendChild(a); } }
  else if (go && !done) location.replace(go);
  else me.textContent = 'This device could not be set up, so your visits on it may still be counted.';
})();</script>
<h2 id="msgs">💬 Messages from students</h2><p>Sent with the 💬 Your say button on every page: 🚩 mistakes, ➕ things to add, ❤️ what they think, 📅 how often they use it and 🛠️ ideas to make it better. No names. Your reply appears on the phone or computer that sent the message, the next time the student opens that site. New messages appear here within 30 seconds.</p>
${openT.length ? openT.map(m => thread(m, true)).join('') : '<p><b>No open messages.</b></p>'}
${doneT.length ? `<details><summary>Finished conversations (${doneT.length})</summary>${doneT.map(m => thread(m, false)).join('')}</details>` : ''}
<h2 id="rate">📊 How much each site helps (Sunday survey)</h2><p>First round: from 25 Oct (launch). Then every Sunday from 11 pm (UAE time), the next time a student opens a site, a pop-up asks <b>“How much does this site help you with your studies?”</b> (0–100%). It shows once: the student slides and sends, or taps anywhere outside the box to skip; then it waits for the next Sunday 11 pm. Each box: the average answer and how many students answered. No names and no device numbers. Your own devices and show links are never asked. <b>👀 To see it yourself:</b> <a href="https://year9-history.deirarevise.workers.dev/?rate=preview" target="_blank" rel="noopener">open a preview</a> (any site works with <code>?rate=preview</code> at the end; nothing is saved).</p>
${rateHTML}
<h2 id="fb">❤️ What students think and suggest, by site</h2><p>Every message by site, newest first. <b style="color:#b42318">Open</b> = still to do (it is also at the top of Messages, where you reply or tap ✅ Solved); <b>finished</b> = done. Test messages from building the site are not counted.</p>
${rateRows.length ? `<p><b>👍 / 👎 Was this page helpful?</b> One-tap answers at the bottom of each page (last 7 days), by part of the site:</p><div class="wrap" style="margin-bottom:12px"><table style="min-width:0"><tr><th>Site</th><th style="text-align:left">Part: 👍 helpful · 👎 not helpful</th></tr>${rateRows.map(([s, l]) => `<tr><td>${esc(VSITES[s])}</td><td class="l">${l.map(([p, [u, d]]) => `${esc(uname(p))}: 👍 <b>${u}</b> · 👎 <b${d > u ? ' style="color:#b42318"' : ''}>${d}</b>`).join(' &nbsp;|&nbsp; ')}</td></tr>`).join('')}</table></div>` : ''}
${opnRows.length ? `<p><b>❤️ What they think, and 📅 how often they use it</b> (one-tap answers from 💬 Your say; each student counted once, with their newest answer):</p><div class="wrap" style="margin-bottom:12px"><table style="min-width:0"><tr><th>Site</th><th style="text-align:left">Do they like it?</th><th style="text-align:left">Is it useful?</th><th style="text-align:left">How often?</th></tr>${opnRows.map(([s, n]) => `<tr><td>${esc(VSITES[s])}</td><td class="l">${opnCell(n, 'like')}</td><td class="l">${opnCell(n, 'useful')}</td><td class="l">${opnCell(n, 'often')}</td></tr>`).join('')}</table></div>` : ''}
${fb.length ? `<div class="wrap"><table style="min-width:0"><tr><th>Site</th><th>🚩 Mistakes</th><th>➕ Add</th><th>🛠️ Better</th><th>❤️ Opinions</th><th>💬 Other</th><th>Still open</th></tr>${fb.map(([s, ...g]) => { const op = g.flat().filter(x => !x.done).length; return `<tr><td>${esc(VSITES[s])}</td>${g.map(l => `<td>${l.length}</td>`).join('')}<td>${op ? `<b style="color:#b42318">${op}</b>` : '0'}</td></tr>`; }).join('')}</table></div>
${fb.map(([s, ...g]) => `<details${g.flat().some(x => !x.done) ? ' open' : ''}><summary><b>${esc(VSITES[s])}</b></summary><ul>${g.flat().sort((a, b) => b.id - a.id).slice(0, 20).map(x => `<li>${x.done ? '<small>finished</small>' : '<b style="color:#b42318">open</b>'} · ${KIND[x.kind] || KIND.other}: “${esc(x.msg)}” <small>· page: ${esc(x.page || 'Home')} · ${when(x.created)}</small></li>`).join('')}</ul></details>`).join('')}` : '<p>None yet.</p>'}
<h2 id="use">📊 What students use (last 7 days)</h2><p>How many times each part was opened, all devices together. No device numbers and no names: just totals. Your own devices are not counted.</p>
${goals.length ? `<p><b>👥 Class goal: answers given this week</b> (questions answered, written answers checked, key terms… all students together; the goal is shown on each site's Home page):</p><div class="wrap" style="margin-bottom:12px"><table style="min-width:0"><tr><th>Site</th><th>This week</th><th>Goal</th><th>Last week</th></tr>${Object.keys(VSITES).filter(s => goals.some(g => g.site === s)).map(s => { const w = (goals.find(g => g.site === s && g.week === vWeek()) || {}).n || 0, l = (goals.find(g => g.site === s && g.week === vWeek(1)) || {}).n || 0; return `<tr><td>${esc(VSITES[s])}</td><td><b>${w}</b></td><td>${vGoalOf(l)}</td><td>${l}</td></tr>`; }).join('')}</table></div>` : ''}
${useRows.length ? `<div class="wrap"><table style="min-width:0"><tr><th>Site</th><th style="text-align:left">Parts opened (most used first)</th></tr>${useRows.map(([s, l]) => `<tr><td>${esc(VSITES[s])}</td><td class="l">${l.slice(0, 14).map(u => `${esc(uname(u.part))} <b>${u.n}</b>`).join(' · ')}</td></tr>`).join('')}</table></div>` : '<p>Nothing yet: counting started on 21 Oct 2026.</p>'}
${cpi ? `<h2 id="classpass">🔑 Class pass (no password)</h2><p>Every phone, tablet or computer that uses the sites gets a <b>class pass</b> on its own: nothing to type, no names, nothing for the students to do. When the lock is on, the sites open <b>only on devices with the pass</b>, so a site’s name written down and given to someone else does not open. Show links work as before.</p>
<p>Devices that already have the pass: today <b>${cpT.p} of ${cpT.n}</b>, last 3 days <b>${cp3.p} of ${cp3.n}</b> (each site and day counted once; a device gets it on its first visit, so it shows from its next visit). Turn the lock on when this is close to all of them, for example after a week.</p>
${cpi.lock ? `<p>🔒 <b>The lock is ON</b> (since ${when(cpi.lock)}). A device without the pass gets it on its own if it has used that site before (until ${when(cpi.lock + 14 * 864e5).slice(0, -6)}), or if it has the pass on another of the study sites. Any other device sees “This site is for one class” and needs the class link once.</p><form method="post" action="/__visits/lockoff" style="margin:0 0 10px">${hid('k', k)}<button type="submit" class="ghost">🔓 Turn the lock off (everything opens again at once)</button></form>`
  : `<p>🔓 <b>The lock is off</b>: anyone who has a site’s address can open it.</p><form method="post" action="/__visits/lockon" style="margin:0 0 10px">${hid('k', k)}<button type="submit">🔒 Turn the lock on</button></form>`}
<p><b>Class links</b> for a new phone, tablet or computer: one tap, no password. Send them only in the class group.</p>
<p>Year 9: <span id="j9">${esc(cpi.join9)}</span> <button type="button" class="ghost" data-copy="j9">Copy</button><br>Year 8: <span id="j8">${esc(cpi.join8)}</span> <button type="button" class="ghost" data-copy="j8">Copy</button> <span id="jd" class="small"></span></p>
<form method="post" action="/__visits/joinnew" style="margin:0 0 10px">${hid('k', k)}<button type="submit" class="ghost">Make new class links</button> <span class="small">the old class links stop working; devices that have the pass keep it</span></form>` : ''}
<h2 id="dl">⬇️ Downloads and prints (last 7 days)</h2><p>Every time a student downloads a file (a worksheet, a paper, a PDF…), opens one, or prints a page, newest first, with how many times that day. All students together: no names and no device numbers. Your own devices and their own saved backups are not counted.</p>
${dlHTML}
<h2 id="show">👀 Show links</h2><p>A link for someone outside the class, for example a friend, <b>to show them, not to share</b>. It works <b>only on the first device that opens it</b> (a forwarded copy will not open), it can be opened <b>twice only</b>, then it stops (and after 14 days). Choose a year group’s hub to show the hub page <b>and all its subject sites</b>: each go is one visit of about 6 hours, moving freely between them. While they use it, nothing is saved on their device, they are not counted, and the message buttons are hidden. Below you see, for each go: when it was opened, about how long it lasted on the subject sites, the pages looked at on each site, and any file they downloaded, opened or printed. The link page shows only the site’s name and an Open button. While they look, the address bar shows a private guest address that works only on their device and stops when the visit ends. Only your <b>3 newest</b> links are kept: making a new one deletes older ones (they stop working), and 🗑 Delete removes one at once. <b>Don’t press “Open” yourself to test a link</b>: the first device that presses it is the only one it will work on. (Students use the sites without a password, so someone who deliberately writes down a site’s name could still open it.)</p>
<form method="post" action="/__visits/pass" style="display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:0 0 10px">${hid('k', k)}<label for="ps">Show:</label><select id="ps" name="site">${Object.keys(VHUBS).map(s => `<option value="${s}">${esc(vPassName(s))}</option>`).join('')}</select><button type="submit">Make a show link</button></form>
${newLink ? `<div class="newlink"><b>Your new show link</b> (it is shown only now):<br><span id="nl">${esc(newLink)}</span><br><button type="button" id="cp" style="margin-top:8px">Copy the link</button> <span id="cpd" class="small"></span></div>` : ''}
${passes.length ? `<div class="wrap" style="margin-top:10px"><table style="min-width:0"><tr><th>Link for</th><th>Made</th><th>Goes left</th><th style="text-align:left">Opened (UAE time) and sites visited</th><th></th></tr>${passes.map(p => `<tr><td>${esc(vPassName(p.site))}</td><td>${when(p.created)}</td><td>${p.uses > 0 ? p.uses + ' of 2' : 'used up / stopped'}</td><td class="l">${goes(p.tok)}</td><td>${p.uses > 0 ? `<form method="post" action="/__visits/stop" style="margin:0">${hid('k', k)}${hid('id', p.id)}<button type="submit" class="ghost">Stop it</button></form>` : `<form method="post" action="/__visits/reopen" style="margin:0">${hid('k', k)}${hid('id', p.id)}<button type="submit" class="ghost" title="The same link works one more time">↩ Reopen (1 more go)</button></form>`}<form method="post" action="/__visits/del" style="margin:6px 0 0">${hid('k', k)}${hid('id', p.id)}<button type="submit" class="ghost" data-sure="Tap again to delete" title="Remove it from the list; it stops working">🗑 Delete</button></form></td></tr>`).join('')}</table></div>
${passes.some(p => p.uses <= 0) ? `<form method="post" action="/__visits/delused" style="margin:10px 0 0">${hid('k', k)}<button type="submit" class="ghost" data-sure="Tap again: delete all used-up links">🗑 Delete all used-up / stopped links</button></form>` : ''}` : ''}
<h2 id="visits">📈 Visits</h2>
<div class="wrap"><table><tr><th>Day</th>${sites.map(s => `<th>${VSITES[s]}</th>`).join('')}<th>Day total</th></tr>
${days.length ? days.map(d => `<tr><td>${nice(d)}</td>${sites.map(s => cell(d, s)).join('')}<td><b>${sum(rows.filter(r => r.day === d))[0]}</b>${used2(d) ? `<small> · ${used2(d)} used</small>` : ''}</td></tr>`).join('') : `<tr><td colspan="${sites.length + 2}">No visits counted yet. Open any site, then refresh this page.</td></tr>`}
<tr class="t"><td><b>Total</b></td>${sites.map(s => `<td>${pair(sum(rows.filter(r => r.site === s)))}</td>`).join('')}<td>${pair(sum(rows))}</td></tr></table></div>
<h2 style="margin:20px 0 4px">🆕 Which devices (today and yesterday)</h2><p>Each new device, with the time it first opened that site (UAE) and its type. Use it to tell your own devices from anyone else's. <b>Time used</b> counts only while the student is tapping, typing, scrolling, watching a video or listening; it arrives after 15 seconds of use and then every minute. <small>starting…</small> = opened in the last few minutes, no time sent yet. <small>quick look</small> = opened and left within seconds. This page updates itself every minute.</p>
<div class="wrap"><table style="min-width:0"><tr><th>Day</th><th>Site</th><th>First opened</th><th>Device</th><th>Time used</th><th>Pages</th></tr>
${devs.length ? devs.map(r => `<tr><td>${nice(r.day)}</td><td>${VSITES[r.site] || r.site}</td><td>${r.at || '<small>before times were saved</small>'}</td><td>${r.kind || '<small>not saved</small>'}</td><td>${mins(r)}</td><td>${r.pages || 1}</td></tr>`).join('') : '<tr><td colspan="6">No devices yet.</td></tr>'}</table></div>
<p style="margin-top:12px">Open this page once on each phone or laptop you use, and your visits on it stop being counted (numbers up to 19 Oct may include yours). A phone in private mode, or the same phone in a different browser, counts as another device. Cloudflare Web Analytics (dash.cloudflare.com) also has visit numbers; it counts everyone, you too.</p>
<script>(function () {   // refresh every 30 seconds, but never while you are typing a reply
  var busy = function () { return !!document.querySelector('[data-armed]') || [].some.call(document.querySelectorAll('textarea'), function (t) { return t.value.trim() || t === document.activeElement; }); };
  var fresh = function () { location.reload(); };
  setInterval(function () { if (!busy() && document.visibilityState === 'visible') fresh(); }, 30000);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible' && !busy()) fresh(); });   // coming back to this tab
  var rn = document.getElementById('rnow'); if (rn) rn.onclick = function (e) { e.preventDefault(); fresh(); };
  document.addEventListener('click', function (e) {   // a ready answer fills the reply box, to send as it is or edit
    var b = e.target.closest && e.target.closest('[data-q]'); if (!b) return;
    var ta = b.closest('form').querySelector('textarea'); ta.value = b.getAttribute('data-q'); ta.focus();
  });
  document.addEventListener('click', function (e) {   // 🔑 copy a class link
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return;
    var t = document.getElementById(b.getAttribute('data-copy')).textContent, d = document.getElementById('jd');
    try { navigator.clipboard.writeText(t).then(function () { d.textContent = 'Copied'; }, function () { d.textContent = 'Select the link and copy it'; }); } catch (er) { d.textContent = 'Select the link and copy it'; }
  });
  document.addEventListener('click', function (e) {   // 🗑 delete buttons: the first tap asks "Tap again", the second deletes (no pop-up,
    var b = e.target.closest && e.target.closest('[data-sure]'); if (!b) return;   // some browsers block yes/no pop-ups)
    if (b.getAttribute('data-armed') === '1') return;
    e.preventDefault(); b.setAttribute('data-armed', '1'); b.textContent = b.getAttribute('data-sure'); b.style.background = '#b42318'; b.style.color = '#fff';
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
// CLASSPASS start (hub-work/classpass_worker.js: in every subject site's Worker through add_visits.py, and in both year hubs
// through make_year_pages.py)
// 🔑 Class pass, no password (user 2026-10-21: "find solution without password"). The sites recognise the class's own phones,
// tablets and computers. Every device that uses a site gets a class pass on its own (help.js / year.js ask quietly): one small
// cookie, a random number with a signature, kept 400 days and renewed; no personal data, never used for counting.
// While the owner's lock is OFF (the start) nothing changes for anyone. When the owner turns it ON (private page), a page on a
// plain address opens only on a device with the pass. A device without it is checked automatically, with nothing to type:
//   1. for 14 days after the lock goes on, a device that has used this site before (study data in this browser) gets the pass;
//   2. the other study sites are asked in turn whether this device has the pass there (quick redirects; a signed ticket
//      that lasts 2 minutes comes back and this site gives the pass too);
//   3. otherwise: "This site is for one class", and the class link (/join/<code> on the year page, shown on the owner's page)
//      gives the pass with one tap.
// Show-link visits (/__show/, /__guest/, /__g/) keep their own one-device rules. The IGCSE copy stays open to everyone.
const CP_RING = ['year9', 'year8', 'year9-english', 'year9-science', 'year9-math', 'year9-geography', 'year9-history',
  'year8-english', 'year8-science', 'year8-math', 'year8-geography', 'year8-history', 'year8-spanish', 'year9-french'].map(s => s + '.deirarevise.workers.dev');
const CP_HUBS = { 'year9.deirarevise.workers.dev': 'year9', 'year8.deirarevise.workers.dev': 'year8' };
const CP_GRACE = 14 * 864e5;
let cpReady = false, cpKey = null, cpLockAt = 0, cpLockRead = 0;
const cpRand = () => (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, '').slice(0, 32);
async function cpSetup(db) {
  if (cpReady) return;
  try { const r = await db.prepare("SELECT COUNT(*) AS n FROM vkeys WHERE name IN ('cp-secret', 'cp-lock', 'cp-join-year9', 'cp-join-year8')").first(); if (r && r.n === 4) { cpReady = true; return; } } catch (e) {}   // ⚡ made already
  await db.prepare('CREATE TABLE IF NOT EXISTS vkeys (name TEXT PRIMARY KEY, val TEXT)').run();
  await db.prepare("INSERT OR IGNORE INTO vkeys (name, val) VALUES ('cp-secret', ?1)").bind(cpRand() + cpRand()).run();
  await db.prepare("INSERT OR IGNORE INTO vkeys (name, val) VALUES ('cp-lock', '0')").run();
  for (const y of ['year9', 'year8']) await db.prepare('INSERT OR IGNORE INTO vkeys (name, val) VALUES (?1, ?2)').bind('cp-join-' + y, cpRand().slice(0, 12)).run();
  cpReady = true;
}
async function cpSign(db, text) {   // HMAC with the secret kept in the shared database (never in a repo)
  if (!cpKey) {
    await cpSetup(db); const r = await db.prepare("SELECT val FROM vkeys WHERE name = 'cp-secret'").first();
    cpKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(r.val), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  }
  return [...new Uint8Array(await crypto.subtle.sign('HMAC', cpKey, new TextEncoder().encode(text)))].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 32);
}
async function cpLock(db, fresh) {   // 0 = lock off, otherwise when it was turned on (read again at most once a minute)
  if (fresh || Date.now() - cpLockRead > 60e3) {
    await cpSetup(db); const r = await db.prepare("SELECT val FROM vkeys WHERE name = 'cp-lock'").first();
    cpLockAt = +(r && r.val) || 0; cpLockRead = Date.now();
  }
  return cpLockAt;
}
const cpCookie = request => (request.headers.get('cookie') || '').match(/(?:^|;\s*)vcp=([a-f0-9]{32})\.([a-f0-9]{32})/) || [];
async function cpHas(request, db) { const m = cpCookie(request); return !!(m[1] && (await cpSign(db, 'pass|' + m[1])) === m[2]); }
async function cpNew(db, keep) { const id = keep || cpRand(); return `vcp=${id}.${await cpSign(db, 'pass|' + id)}; Path=/; Max-Age=34560000; HttpOnly; Secure; SameSite=Lax`; }
const cpPage = (title, body, status) => new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${title}</title><style>body{margin:0 auto;padding:24px 16px;font:17px/1.5 system-ui,sans-serif;background:#f4f6fb;color:#1d2433;max-width:560px}@media (prefers-color-scheme:dark){body{background:#12151c;color:#e8ecf3}}h1{font-size:24px}</style></head><body>${body}</body></html>`,
  { status: status || 200, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow', 'referrer-policy': 'no-referrer', 'x-frame-options': 'DENY' } });
const CP_ONE_CLASS = '<h1>🔒 This site is for one class</h1><p>These revision sites were made by a parent for one class, so they open only on the class’s own phones, tablets and computers.</p>'
  + '<p><b>In the class?</b> Open the <b>class link</b> from your class group once on this device. There is no password.</p>'
  + '<p><b>Someone sent you a show link?</b> Please open that link again.</p>';
async function cpHook(request, env, url) {
  const host = url.hostname, p = url.pathname;
  if (!env.DB || !CP_RING.includes(host)) return null;   // the IGCSE copy (and local copies) stay open
  const db = env.DB;
  // 1. quietly from help.js / year.js: this device gets its pass, or has it renewed
  if (p === '/__class/claim' && request.method === 'POST') {
    if (request.headers.get('sec-fetch-site') === 'cross-site') return new Response(null, { status: 403 });
    const m = cpCookie(request), ok = !!(m[1] && (await cpSign(db, 'pass|' + m[1])) === m[2]), lock = await cpLock(db);
    if (!ok && lock && Date.now() > lock + CP_GRACE) return new Response(null, { status: 403, headers: { 'cache-control': 'no-store' } });
    return new Response(null, { status: 204, headers: { 'cache-control': 'no-store', 'set-cookie': await cpNew(db, ok ? m[1] : '') } });
  }
  // 2. the class link on the year page: /join/<code>
  const jm = p.match(/^\/join\/([a-z0-9]{12})$/);
  if (jm && CP_HUBS[host]) {
    await cpSetup(db); const r = await db.prepare('SELECT val FROM vkeys WHERE name = ?1').bind('cp-join-' + CP_HUBS[host]).first();
    if (!(r && r.val === jm[1])) return cpPage('Class link', '<h1>This class link has changed</h1><p>Please ask for the new class link in your class group.</p>', 404);
    const m = cpCookie(request), ok = !!(m[1] && (await cpSign(db, 'pass|' + m[1])) === m[2]);
    return new Response(null, { status: 302, headers: { location: '/', 'cache-control': 'no-store', 'set-cookie': await cpNew(db, ok ? m[1] : '') } });
  }
  // 3. another study site asks: does this device have the pass here? Yes: a ticket goes back. No: ask the next site.
  if (p === '/__class/vouch' && request.method === 'GET') {
    let to = null; try { to = new URL(url.searchParams.get('to') || ''); } catch (e) {}
    if (!to || to.protocol !== 'https:' || !CP_RING.includes(to.hostname)) return cpPage('Not found', '<p>Not found.</p>', 404);
    const back = to.pathname + to.search + to.hash;
    if (await cpHas(request, db)) {
      const exp = Date.now() + 120e3;
      return Response.redirect(`https://${to.hostname}/__class/in?t=${exp}.${await cpSign(db, 'in|' + to.hostname + '|' + exp)}&to=${encodeURIComponent(back)}`, 302);
    }
    let i = (+url.searchParams.get('n') || 0) + 1;
    while (i < CP_RING.length && CP_RING[i] === to.hostname) i++;
    if (i < CP_RING.length) return Response.redirect(`https://${CP_RING[i]}/__class/vouch?n=${i}&to=${encodeURIComponent(to.href)}`, 302);
    return Response.redirect(`https://${to.hostname}/__class/none?to=${encodeURIComponent(back)}`, 302);
  }
  // 4. back with a ticket: this site gives the pass too, then opens the page
  if (p === '/__class/in' && request.method === 'GET') {
    const [exp, sig] = String(url.searchParams.get('t') || '').split('.'), to = url.searchParams.get('to') || '/', safe = /^\/(?!\/)/.test(to) ? to : '/';
    if (!(+exp > Date.now() && +exp < Date.now() + 300e3 && sig === await cpSign(db, 'in|' + host + '|' + exp)))
      return Response.redirect(`https://${host}/__class/none?to=${encodeURIComponent(safe)}`, 302);
    return new Response(null, { status: 302, headers: { location: safe, 'cache-control': 'no-store', 'set-cookie': await cpNew(db, '') } });
  }
  // 5. no pass anywhere
  if (p === '/__class/none') {
    const to = url.searchParams.get('to') || '/';
    if (!(await cpLock(db))) return Response.redirect(`https://${host}${/^\/(?!\/)/.test(to) ? to : '/'}`, 302);
    return cpPage('For one class', CP_ONE_CLASS, 403);
  }
  // 6. the lock: a page on a plain address needs the pass (files, messages and show links are not pages here)
  const dest = request.headers.get('sec-fetch-dest');
  const page = ['GET', 'HEAD'].includes(request.method) && (dest === 'document' || dest === 'iframe' || p === '/' || /\.(html?|pdf)$/i.test(p));
  if (!page || p.startsWith('/__') || p.startsWith('/api/')) return null;
  const lock = await cpLock(db);
  if (!lock || await cpHas(request, db)) return null;
  const claim = Date.now() < lock + CP_GRACE, start = CP_RING[0] === host ? 1 : 0;
  // a short page that does steps 1 and 2 (no loops: one try a minute in this tab), else the "one class" message
  return cpPage('Opening…', `<div id="m"><p>Opening…</p></div><noscript>${CP_ONE_CLASS}</noscript><script>(async () => {
  const none = () => location.replace('/__class/none?to=' + encodeURIComponent(location.pathname + location.search + location.hash));
  try {
    const last = +sessionStorage.getItem('cp-try') || 0; if (Date.now() - last < 60e3) return none();
    sessionStorage.setItem('cp-try', String(Date.now()));
    let used = false; try { used = localStorage.length > 0 && sessionStorage.getItem('guest') !== '1'; } catch (e) {}
    if (used && ${claim}) { const r = await fetch('/__class/claim', { method: 'POST', credentials: 'same-origin' }); if (r.status === 204) { location.reload(); return; } }
    location.replace('https://${CP_RING[start]}/__class/vouch?n=${start}&to=' + encodeURIComponent(location.href));
  } catch (e) { none(); }
})();</script>`, 403);
}
// for the owner's page: the lock, the class links, and how many devices already have the pass
async function cpOwner(db) {
  await cpSetup(db); const rows = (await db.prepare("SELECT name, val FROM vkeys WHERE name LIKE 'cp-%' AND name != 'cp-secret'").all()).results || [];
  const v = Object.fromEntries(rows.map(r => [r.name, r.val]));
  return { lock: +v['cp-lock'] || 0, join9: `https://year9.deirarevise.workers.dev/join/${v['cp-join-year9']}`, join8: `https://year8.deirarevise.workers.dev/join/${v['cp-join-year8']}` };
}
async function cpOwnerSet(db, op) {
  await cpSetup(db);
  if (op === 'lockon') await db.prepare("UPDATE vkeys SET val = ?1 WHERE name = 'cp-lock'").bind(String(Date.now())).run();
  if (op === 'lockoff') await db.prepare("UPDATE vkeys SET val = '0' WHERE name = 'cp-lock'").run();
  if (op === 'joinnew') for (const y of ['year9', 'year8']) await db.prepare('UPDATE vkeys SET val = ?1 WHERE name = ?2').bind(cpRand().slice(0, 12), 'cp-join-' + y).run();
  await cpLock(db, true);
}
// CLASSPASS end
// VISITS end

export default {
  async fetch(request, env, ctx) {
    { const v = await visitsHook(request, env, ctx); if (v instanceof Request) request = v; else if (v) return v; }
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
