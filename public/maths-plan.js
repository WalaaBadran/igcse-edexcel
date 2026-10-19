// Settings that let the shared tools (help.js, plan.js, sync.js) work on IGCSE Edexcel Maths, which has no ⚡ Revise tab.
// window.RVD: key 'y8m-rv' → every saved key starting 'y8m-' is this subject's progress (💾 Save online moves all of them).
// The 📅 Study plan is for the next assessment with a date (topics.js). Its quick check asks how sure the student feels
// about each topic (no quiz questions), and its tasks point to Learn a topic, Today's 5, Try again and My test paper.
(function () {
  const A = window.Y8M_ASSESSMENTS || [];
  const d = new Date(), today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  // shareable copy: no school dates, so the student types their test date; the quick check asks about these core topics
  const CORE = ['Fractions, decimals and percentages', 'Percentages', 'Ratio', 'Indices', 'Rounding, estimation and calculators', 'Simplifying and substitution',
    'Expanding and factorising', 'Forming and solving equations', 'Sequences and nth term', 'Straight-line graphs', 'Angles and parallel lines', 'Area and perimeter',
    'Circles: area and circumference', 'Volume and surface area (prisms and cylinders)', 'Pythagoras', 'Averages and range', 'Probability'];
  const next = A.find(a => a.date && a.date >= today) || { name: 'your maths test', date: '', topics: CORE };
  const OPTS = ['😟 I find it hard', '🙂 It\'s OK', '😀 I\'m confident'];
  window.RVD = {
    key: 'y8m-rv', name: next.name,
    quiz: next.topics.map(t => ({ t, q: `How sure do you feel about ${t}?`, o: OPTS, a: 2, rate: true }))
  };
  const link = t => '#/questions/' + encodeURIComponent(t);
  const load = k => { try { return JSON.parse(localStorage.getItem(k)) || {}; } catch (e) { return {}; } };
  window.Y8M_PLAN = {
    name: next.name, exam: next.date || '', manual: true, rate: true, learn: 'questions', exam_q: 'worksheet',
    tasks: esc => ({
      read: t => ['📚', `Learn <b>${esc(t)}</b>: 5 questions, easiest first (use the working space and the hints)`, link(t)],
      quiz: t => ['✍️', `Practise <b>${esc(t)}</b>: 5 more questions without hints, then check`, link(t)],
      dump: t => ['🩹', `<b>${esc(t)}</b> again: mark it as a topic you find hard and do your “Not yet” questions`, link(t)],
      dumpBoth: ['🔁', 'Try again: the questions you marked “Not yet” (Home)', '#/'],
      examQ: ['✏️', 'Make a 10-question test paper on your assessment topics, do it on paper, then mark it', '#/worksheet'],
      mixed: ['🎯', `Mixed practice: tick all the ${esc(next.name)} topics in My test paper and do 5 questions`, '#/worksheet'],
      daily: ['☀️', "Today's 5 (Home)", '#/'],
      review: t => ['🔁', `Quick review of <b>${esc(t)}</b>: 3 questions you haven't done yet`, link(t)]
    }),
    week: (from, to) => {   // 📤 Share my week: what a parent wants to see
      const P = load('y8m-progress-v1'), W = load('y8m-weak-v1'), f = from.getTime(), t = to.getTime() + 864e5;
      const week = Object.values(P).filter(x => x.t >= f && x.t < t);
      const got = week.filter(x => x.s === 'got').length, not = week.filter(x => x.s === 'not').length;
      const days = new Set(week.map(x => x.d)).size, hard = Object.keys(W);
      const why = { method: "didn't know the method", slip: 'careless slips', read: 'misreading the question' }, wc = k => week.filter(x => x.why === k).length;
      const top = Object.keys(why).filter(wc).sort((a, b) => wc(b) - wc(a))[0];
      return `✍️ ${got + not} exam questions marked this week (✓ ${got} got it · ✗ ${not} not yet) on ${days} day${days === 1 ? '' : 's'}`
        + (top ? `\n🔍 Most “not yet” answers were from ${why[top]}` : '')
        + (hard.length ? `\n🩹 Topics I find hard: ${hard.join(', ')}` : '');
    }
  };
})();
