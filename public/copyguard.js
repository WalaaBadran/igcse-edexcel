/* copyguard.js — gentle protection against casual copying.
   DETERRENT ONLY, not real security: a determined person with developer tools can
   still read the page. This just stops easy right-click "Save image", drag-out,
   copy-paste of lesson/question text, and Save-page / View-source shortcuts.
   It deliberately leaves answer boxes, the notes box and the AI helper's
   "Explain this" selection fully working, and never blocks printing. */
(function () {
  'use strict';
  if (window.__copyguard) return;
  window.__copyguard = true;

  // Places where copy / paste / right-click must keep working: anything the
  // student types into, plus the AI helper panel. [data-copyok] is an escape hatch.
  var OK = 'input, textarea, select, [contenteditable], .ask-back, [data-copyok]';
  function inOK(el) { return !!(el && el.closest && el.closest(OK)); }

  // Media must not be draggable or long-press-saveable.
  var media = 'img, svg, video, canvas, picture';
  var st = document.createElement('style');
  st.textContent =
    media.split(',').map(function (s) { return s.trim(); }).join(',') +
    '{-webkit-user-drag:none;-khtml-user-drag:none;user-drag:none;-webkit-touch-callout:none}' +
    'img,svg,video,canvas{-webkit-user-select:none;-moz-user-select:none;user-select:none}';
  document.head.appendChild(st);

  // Right-click: blocked on the page (stops "Save image as" / "Copy"), but allowed
  // inside the boxes a student types in, so paste still works there.
  document.addEventListener('contextmenu', function (e) {
    if (inOK(e.target)) return;
    e.preventDefault();
  }, false);

  // Dragging an image or video out of the page.
  document.addEventListener('dragstart', function (e) {
    var t = e.target;
    if (t && t.closest && t.closest(media)) e.preventDefault();
  }, false);

  // Copy / cut of page text — blocked, unless the student is copying from a box
  // they typed in (a textarea's own selection is not reported by getSelection,
  // so answer-box copy is naturally unaffected; the inOK check covers the rest).
  function guardCopy(e) {
    if (inOK(e.target) || inOK(document.activeElement)) return;
    var sel = (window.getSelection && window.getSelection().toString()) || '';
    if (sel) { e.preventDefault(); }
  }
  document.addEventListener('copy', guardCopy, false);
  document.addEventListener('cut', guardCopy, false);

  // Save-page (Ctrl/Cmd+S) and View-source (Ctrl/Cmd+U). Printing (Ctrl+P) is left alone.
  document.addEventListener('keydown', function (e) {
    if (!(e.ctrlKey || e.metaKey) || e.altKey) return;
    var k = (e.key || '').toLowerCase();
    if (k === 's' || k === 'u') e.preventDefault();
  }, false);
})();
