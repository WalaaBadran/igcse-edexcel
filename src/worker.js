// IGCSE Edexcel Maths moved to its own link without the account name (user 2026-10-19: "for this site can we change deira revise").
// This old Worker link only forwards visitors there, keeping the page and anything after it. The real site is public/_worker.js
// (Cloudflare Pages project "igcse-edexcel", build output directory: public).
const NEW = 'https://igcse-edexcel.pages.dev';
export default {
  async fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(NEW + url.pathname + url.search, 301);
  }
};
