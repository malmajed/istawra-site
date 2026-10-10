/* Private Advisory floating link (all pages).
   - Reuses the existing header link, so there is only one advisory link and it keeps
     its place in the keyboard order and its language-correct destination.
   - Starts at the header link’s position, then docks when that position scrolls away.
   - Can be dragged; a drag never triggers navigation. The position is kept in memory
     for this page only: no cookies, localStorage or sessionStorage.
   - Once the header leaves the view, it docks at the outside edge of the screen.
   - Stays inside the viewport, never covers navigation, notices, fields, buttons or
     links or reading content; hides when no clear candidate position exists. */
'use strict';
(() => {
  const link = document.querySelector('header .advisory-brand');
  if (!link || link.classList.contains('pa-circle')) return;
  const ar = document.documentElement.lang.toLowerCase().startsWith('ar');
  const label = ar ? 'استشارات خاصة للقيادات' : 'Private Advisory for Leaders';

  // Hold the header link's original space so the header layout does not change.
  const original = link.getBoundingClientRect();
  const anchor = document.createElement('span');
  anchor.className = 'pa-anchor';
  anchor.setAttribute('aria-hidden', 'true');
  link.before(anchor);

  link.className = 'pa-circle';
  link.lang = ar ? 'ar' : 'en';
  link.dir = ar ? 'rtl' : 'ltr';
  link.textContent = label;
  link.setAttribute('aria-label', label);

  const M = 12;                       // minimum gap from the viewport edge and from obstacles
  const narrow = () => innerWidth <= 640;
  function sizeAnchor() {
    // Desktop: keep the old link's exact footprint. Phones: the old link was a thin
    // full-width row, so give the circle its own row height to avoid covering the
    // logo or the menu button.
    const s = link.offsetWidth || 108;
    anchor.style.width = original.width + 'px';
    anchor.style.height = (narrow() ? Math.max(original.height, s + 6) : original.height) + 'px';
  }
  sizeAnchor();

  let inlineFallback = false;
  let dragged = null;                 // {x, y} viewport position chosen by the visitor
  let drag = null, suppressClick = false, queued = false;

  const vw = () => document.documentElement.clientWidth;
  const vh = () => innerHeight;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(n, Math.max(lo, hi)));
  const S = () => link.offsetWidth || 108;

  function fit(p) { const s = S(); return { x: clamp(p.x, M, vw() - s - M), y: clamp(p.y, M, vh() - s - M) }; }
  function put(p) { link.style.left = p.x + 'px'; link.style.top = p.y + 'px'; }

  // Two kinds of obstacle, weighted: things people click or type into (navigation,
  // notices, fields, buttons, footer and content links) must never be covered; reading
  // text should be covered as little as possible.
  const HARD = 'header nav a, header .language, header .brand, header summary, details[open] nav a, main a, ' +
    '.notice, .cookie-notice, .cookie-banner, .consent-banner, [data-notice], [role="alert"], [role="dialog"], ' +
    'input:not([type="hidden"]), select, textarea, button:not(.pa-circle), footer a';
  const SOFT = 'main p, main li, main h1, main h2, main h3, main h4, main figure, main img, main blockquote, main td, main th';
  function rects(sel) {
    const out = [];
    for (const n of document.querySelectorAll(sel)) {
      if (n === link || link.contains(n)) continue;
      const r = n.getBoundingClientRect();
      if (!r.width || !r.height || r.bottom < 0 || r.top > vh()) continue;
      out.push(r);
    }
    return out;
  }
  function overlap(p, rs, pad) {
    const s = S(); let area = 0;
    for (const o of rs) {
      const w = Math.min(p.x + s, o.right + pad) - Math.max(p.x, o.left - pad);
      const h = Math.min(p.y + s, o.bottom + pad) - Math.max(p.y, o.top - pad);
      if (w > 0 && h > 0) area += w * h;
    }
    return area;
  }

  function layout() {
    queued = false;
    if (drag || inlineFallback) return;
    const s = S(), hard = rects(HARD), soft = rects(SOFT);
    const endX = ar ? M : vw() - s - M, startX = ar ? vw() - s - M : M;
    const bottom = vh() - s - M;
    // Start at the old header link. Once the header has left the view, dock at the
    // outside edge (bottom corner on the reading side's end) unless the visitor has
    // placed it somewhere themselves.
    // Where the old header link is on screen right now (it scrolls with the header).
    const r = anchor.getBoundingClientRect();
    const inHeader = { x: r.left + (r.width - s) / 2, y: r.top + (r.height - s) / 2 };
    const headerGone = r.top < 0;               // the header has started to scroll away
    if (!dragged && !headerGone) { show(true); put(fit(inHeader)); return; }   // at rest in the header
    const preferred = fit(dragged || { x: endX, y: bottom });
    const candidates = [preferred, { x: endX, y: bottom }, { x: startX, y: bottom }, { x: endX, y: M }, { x: startX, y: M }];
    for (const x of [endX, startX]) for (let y = bottom; y >= M; y -= 24) candidates.push({ x, y });
    // Preserve a dragged position only while it remains clear of controls AND text.
    const best = candidates.find(c => overlap(c, hard, 4) === 0 && overlap(c, soft, 4) === 0);
    if (best) { put(best); show(true); return; }
    if (document.activeElement === link) {
      // Keep keyboard focus on the same link, in normal header flow. Never hide
      // a focused link or leave it floating across another control or paragraph.
      inlineFallback = true;
      anchor.style.display = 'none';
      link.style.position = 'relative';
      link.style.left = 'auto'; link.style.top = 'auto';
      show(true);
      link.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    } else show(false);
  }
  function show(on) { link.style.visibility = on ? '' : 'hidden'; }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(layout); } }

  // Dragging (optional). Navigation happens only on a click without movement.
  link.addEventListener('pointerdown', e => {
    if (e.button !== 0 || !e.isPrimary) return;
    const r = link.getBoundingClientRect();
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, left: r.left, top: r.top, moved: false };
    suppressClick = false;
  });
  link.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) > 8) {
      drag.moved = true; link.classList.add('pa-dragging');
      try { link.setPointerCapture(e.pointerId); } catch {}
    }
    if (drag.moved) { e.preventDefault(); const p = fit({ x: drag.left + dx, y: drag.top + dy }); put(p); dragged = p; }
  });
  function end(e) {
    if (!drag || drag.id !== e.pointerId) return;
    suppressClick = drag.moved; drag = null; link.classList.remove('pa-dragging');
    try { if (link.hasPointerCapture(e.pointerId)) link.releasePointerCapture(e.pointerId); } catch {}
    queue();
  }
  link.addEventListener('pointerup', end);
  link.addEventListener('pointercancel', end);
  link.addEventListener('click', e => { if (suppressClick) { e.preventDefault(); suppressClick = false; } });
  link.addEventListener('dragstart', e => e.preventDefault());
  link.addEventListener('blur', () => {
    if (inlineFallback) {
      inlineFallback = false;
      anchor.style.display = '';
      link.style.position = '';
    }
    queue();
  });

  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', () => { sizeAnchor(); if (dragged) dragged = fit(dragged); queue(); });
  document.addEventListener('toggle', queue, true);   // mobile menu opened or closed
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queue);
  layout();
})();
