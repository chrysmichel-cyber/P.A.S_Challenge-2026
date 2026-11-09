/* Zoom et déplacement d’une photo (galerie du musée).
   Les calculs sont purs (testés sous Node) ; attach() ne fait que relier la souris, le doigt et le clavier. */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else { root.LCA = root.LCA || {}; root.LCA.photoZoom = api; }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const MIN = 1, MAX = 6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const create = () => ({ scale: 1, x: 0, y: 0 });
  /* Garde l’image couvrant le cadre : pas de vide au bord quand on a zoomé. w et h = taille du cadre. */
  function fit(s, w, h) {
    s.scale = clamp(s.scale, MIN, MAX);
    const mx = (s.scale - 1) * w / 2, my = (s.scale - 1) * h / 2;
    s.x = clamp(s.x, -mx, mx); s.y = clamp(s.y, -my, my);
    if (s.scale === 1) { s.x = 0; s.y = 0; }
    return s;
  }
  /* Zoom en gardant fixe le point (cx, cy) mesuré depuis le centre du cadre. */
  function zoomAt(s, factor, cx, cy, w, h) {
    const old = s.scale, next = clamp(old * factor, MIN, MAX), k = next / old;
    s.x = cx - (cx - s.x) * k; s.y = cy - (cy - s.y) * k; s.scale = next;
    return fit(s, w, h);
  }
  function pan(s, dx, dy, w, h) { s.x += dx; s.y += dy; return fit(s, w, h); }
  function reset(s) { s.scale = 1; s.x = 0; s.y = 0; return s; }
  const css = s => 'translate(' + Math.round(s.x * 10) / 10 + 'px,' + Math.round(s.y * 10) / 10 + 'px) scale(' + Math.round(s.scale * 1000) / 1000 + ')';

  /* Branche le zoom sur un cadre et son image. Renvoie { zoomIn, zoomOut, reset, state, detach }. */
  function attach(frame, img, onChange) {
    const s = create(), ptrs = new Map(); let pinch = 0, detached = false;
    const size = () => { const r = frame.getBoundingClientRect(); return { w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2 }; };
    const apply = () => { img.style.transform = css(s); frame.classList.toggle('zoomed', s.scale > 1.001); if (onChange) onChange(s); };
    const zoomBy = (f, ex, ey) => { const z = size(); zoomAt(s, f, ex === undefined ? 0 : ex - z.cx, ey === undefined ? 0 : ey - z.cy, z.w, z.h); apply(); };
    const onWheel = e => { e.preventDefault(); zoomBy(e.deltaY < 0 ? 1.18 : 1 / 1.18, e.clientX, e.clientY); };
    const onDown = e => { frame.setPointerCapture && frame.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); pinch = 0; };
    const onMove = e => {
      if (!ptrs.has(e.pointerId)) return;
      const p = ptrs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y; ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (ptrs.size > 1) {
        const a = Array.from(ptrs.values()), d = Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y);
        if (pinch) zoomBy(d / pinch, (a[0].x + a[1].x) / 2, (a[0].y + a[1].y) / 2); pinch = d;
      } else if (s.scale > 1) { const z = size(); pan(s, dx, dy, z.w, z.h); apply(); }
    };
    const onUp = e => { ptrs.delete(e.pointerId); pinch = 0; };
    const onDbl = e => { if (s.scale > 1.001) { reset(s); apply(); } else zoomBy(2.4, e.clientX, e.clientY); };
    const onKey = e => {
      if (e.key === '+' || e.key === '=') { zoomBy(1.25); e.preventDefault(); }
      else if (e.key === '-') { zoomBy(1 / 1.25); e.preventDefault(); }
      else if (e.key === '0') { reset(s); apply(); e.preventDefault(); }
      else if (s.scale > 1 && /^Arrow/.test(e.key)) { const z = size(), st = 40; pan(s, e.key === 'ArrowLeft' ? st : e.key === 'ArrowRight' ? -st : 0, e.key === 'ArrowUp' ? st : e.key === 'ArrowDown' ? -st : 0, z.w, z.h); apply(); e.preventDefault(); e.stopPropagation(); }
    };
    const L = [['wheel', onWheel, { passive: false }], ['pointerdown', onDown], ['pointermove', onMove], ['pointerup', onUp], ['pointercancel', onUp], ['dblclick', onDbl], ['keydown', onKey]];
    L.forEach(([n, f, o]) => frame.addEventListener(n, f, o));
    apply();
    return {
      state: s,
      zoomIn: () => zoomBy(1.4), zoomOut: () => zoomBy(1 / 1.4), reset: () => { reset(s); apply(); },
      detach() { if (detached) return; detached = true; L.forEach(([n, f, o]) => frame.removeEventListener(n, f, o)); reset(s); img.style.transform = ''; frame.classList.remove('zoomed'); }
    };
  }
  return { MIN, MAX, create, fit, zoomAt, pan, reset, css, attach };
});
