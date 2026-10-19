// IGCSE Edexcel Maths: the 📅 Study plan and ❓ Help pages (shared plan.js and help.js), 💾 Backup / Restore on Home,
// 🎟 Golden Ticket tasks (gt.js), and "install as an app" (sw.js). The menu for the Help page is listed here in the shared NAVG format.
(function () {
  const $ = id => document.getElementById(id);
  const NAVG = [
    ['learn', '📚', 'Learn', [['questions', '📚 Learn a topic'], ['', '🩹 Topics I find hard (Home)']]],
    ['exam', '✏️', 'Test', [['worksheet', '✏️ My test paper']]],
    ['me', '🧑', 'Me', [['plan', '📅 Study plan'], ['help', '❓ Help']]]
  ];
  function route() {
    const m = location.hash.match(/^#\/(\w+)\/?(.*)$/) || [];
    if (m[1] === 'plan' && $('planview')) $('planview').innerHTML = window.PLAN ? PLAN.view(m[2] || '', window.Y8M_PLAN) : '<p class="muted">The study plan did not load. Please refresh the page.</p>';
    if (m[1] === 'gt' && $('gtview')) $('gtview').innerHTML = window.GT ? GT.view(m[2] || '') : '';
    if (m[1] === 'help' && $('helpview')) $('helpview').innerHTML = window.HELP ? HELP.view(NAVG, { backup: 'home', offline: true, video: false }) : '';
  }
  addEventListener('hashchange', route); route();

  // 💾 Backup / Restore: every saved Maths key (they all start with "y8m-") in one small file
  const KEYS = () => Object.keys(localStorage).filter(k => k.startsWith('y8m-'));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-bk]'); if (!b) return;
    const note = $('bknote');
    if (b.dataset.bk === 'save') {
      let data = {}; try { KEYS().forEach(k => { data[k] = localStorage.getItem(k); }); } catch (er) {}
      const blob = new Blob([JSON.stringify({ site: 'year8-maths', saved: new Date().toISOString(), data })], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'igcse-edexcel-maths-backup.json'; document.body.appendChild(a); a.click(); a.remove();
      if (note) note.textContent = '✓ Saved as igcse-edexcel-maths-backup.json. Keep it, or send it to the other device.';
    } else if (b.dataset.bk === 'load') $('bkfile').click();
    else if (b.dataset.bk === 'share') {   // 📤 a short message for a parent: this week's questions, Today's 5 days and hard topics (nothing is sent by the site)
      const t0 = new Date(), from = new Date(t0.getTime() - 6 * 864e5), nice = d => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
      const text = `📚 IGCSE Edexcel Maths: my week (${nice(from)} to ${nice(t0)})
${window.Y8M_PLAN ? Y8M_PLAN.week(from, t0) : ''}
${location.origin}`;
      const done = m => { if (note) note.textContent = m; };
      if (navigator.share) navigator.share({ text }).catch(() => {});
      else if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => done('✓ Copied. Paste it in a message to your parent.'), () => done(text));
      else done(text);
    }
  });
  document.addEventListener('change', e => {
    if (e.target.id !== 'bkfile' || !e.target.files[0]) return;
    const note = $('bknote'), r = new FileReader();
    r.onload = () => {
      try {
        const j = JSON.parse(r.result);
        if (j.site !== 'year8-maths' || !j.data) throw new Error('not ours');
        Object.entries(j.data).forEach(([k, v]) => { if (k.startsWith('y8m-')) localStorage.setItem(k, v); });
        if (note) note.textContent = '✓ Progress restored. Reloading…'; setTimeout(() => location.reload(), 700);
      } catch (er) { if (note) note.textContent = 'That file is not a IGCSE Edexcel Maths backup.'; }
    };
    r.readAsText(e.target.files[0]); e.target.value = '';
  });

  if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
})();
