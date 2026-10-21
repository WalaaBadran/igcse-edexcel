/* 👀 Guest mode for "show links" made on the owner's private page (user 2026-10-21: "a link to a friend outside the school that
   works twice only ... not save anything"). The link's button sets sessionStorage 'guest'; from then on, in that tab, everything
   the site would keep in this browser goes to sessionStorage instead, so it is gone when the tab is closed. This file is the
   first script on every page, before any site code reads or writes storage. help.js does the rest (no visit numbers, no
   message buttons). Copied into each site by hub-work/add_chat.py. */
(function () {
  try {
    if (sessionStorage.getItem('guest') !== '1' || Storage.prototype.__guest) return;
    var L = window.localStorage, S = window.sessionStorage, P = Storage.prototype, g = P.getItem, st = P.setItem, rm = P.removeItem, cl = P.clear;
    P.getItem = function (x) { return this === L ? g.call(S, 'g:' + x) : g.call(this, x); };
    P.setItem = function (x, v) { return this === L ? st.call(S, 'g:' + x, v) : st.call(this, x, v); };
    P.removeItem = function (x) { return this === L ? rm.call(S, 'g:' + x) : rm.call(this, x); };
    P.clear = function () { return this === L ? undefined : cl.call(this); };
    P.__guest = true;
  } catch (e) {}
})();
