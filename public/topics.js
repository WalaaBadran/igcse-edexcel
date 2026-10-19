// Edit this file when an assessment or topic list changes. The site reads it automatically.
// Assessments are named like the school's Year 8 Scheme of Work: 1.1 = Term 1 first assessment, 1.2 = Term 1 second, then Term 2, Term 3.
// topics = the site's past-paper topic names (pp.js groups, papers-work/pp_groups.py); list = the school's wording, word for word.
// date: 'YYYY-MM-DD', or '' if not known. On Home students choose a focus (saved on the device): 🌍 All topics (the default:
// they don't only study for assessments, user 2026-10-18) or one assessment.
// Shareable copy: no school assessments, so students practise every topic (🌍 All topics).
window.Y8M_ASSESSMENTS = [];
(function () {
  const A = window.Y8M_ASSESSMENTS, KEY = 'y8m-assessment';

  // 🔒 Term 2 and 3 open on the first day of that term (school calendar 2026–2027; user, 2026-10-19: "keep them not available to open until terms start")
  const TERM_STARTS = { '2': '2027-01-04', '3': '2027-04-12' };   // opens on the term's first day (school calendar); earlier terms stay open all year
  const d0 = new Date(), TODAY = d0.getFullYear() + '-' + String(d0.getMonth() + 1).padStart(2, '0') + '-' + String(d0.getDate()).padStart(2, '0');
  (A || []).forEach(a => { const o = TERM_STARTS[String(a.id)[0]]; if (o && TODAY < o) { a.locked = true; a.opens = o; } });
  let id = null; try { id = localStorage.getItem(KEY); } catch (e) {}
  window.Y8M_ALL_TOPICS = { id: 'all', name: 'All topics', all: true, topics: [] };
  window.Y8M_ASSESSMENT = A.find(a => a.id === id && !a.locked) || window.Y8M_ALL_TOPICS;
  window.Y8M_pickAssessment = id => { try { localStorage.setItem(KEY, id); } catch (e) {} location.reload(); };
})();
