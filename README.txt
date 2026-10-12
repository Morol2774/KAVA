Kava Coffee House — business-card website (concept)
====================================================

Open index.html in a browser. No build step, no server code.
Tip: opened straight from disk, some browsers hide the window-light effect; on hosting or a local server (python3 -m http.server) it shows as designed.

Contents
- index.html  — the whole site (styles and scripts inside)
- img/        — photos, videos (.mp4 + .webm) and poster frames
- logo/       — Kava badge and "K" mark traced from the brand image (SVG + PNG)

To publish: upload the folder to any static hosting (Netlify, Vercel, GitHub Pages, Cloudflare Pages) over HTTPS.

Before launch
- Replace stock photos and videos with real Kava shots:
  img/v-*.mp4/.webm (A day at Kava videos), img/p-*.webp (side photos),
  img/m-tea.webp (shows another tea brand's tag), img/proof-cupcakes.webp (another bakery's labels),
  interior/stock images (room, shelf, patio, coffee, cheesecake).
- Ask the owners for the original logo file and swap logo/ + the inline SVG symbols in index.html.
- Check hours, address and menu items with the owners; add prices only as final all-in prices.
- No forms, cookies or trackers on the site. If analytics is added later, it must stay off until visitor consent.
- Add security headers on the host (HTTPS redirect, HSTS, Content-Security-Policy, X-Content-Type-Options, Referrer-Policy).
