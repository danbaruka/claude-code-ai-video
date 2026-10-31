// Les fonctions d'animation de la page (GSAP, une seule timeline en pause que HyperFrames fait avancer image par image).
// Tout est déterministe : pas de hasard, pas d'horloge. Une entrée avant 0,1 s est ignorée : l'élément est déjà là
// sur l'image 1, celle que montrent les fils d'actualité.
export const RUNTIME = String.raw`
window.__timelines = window.__timelines || {};
const tl = gsap.timeline({ paused: true });
const $$ = (s) => (typeof s === "string" ? Array.from(document.querySelectorAll(s)) : [s]);
const net = (sel, t) => tl.set(sel, { filter: "none" }, t);
const ENTREES = {
  pop: [{ opacity: 0, scale: 0.55, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "back.out(1.7)" }],
  monte: [{ opacity: 0, y: 80, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }],
  descend: [{ opacity: 0, y: -80, filter: "blur(12px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.7, ease: "expo.out" }],
  gauche: [{ opacity: 0, x: -240, filter: "blur(12px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.75, ease: "expo.out" }],
  droite: [{ opacity: 0, x: 240, filter: "blur(12px)" }, { opacity: 1, x: 0, filter: "blur(0px)", duration: 0.75, ease: "expo.out" }],
  zoom: [{ opacity: 0, scale: 1.6, filter: "blur(16px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.75, ease: "expo.out" }],
  tourne: [{ opacity: 0, rotationY: -85, transformPerspective: 1500 }, { opacity: 1, rotationY: 0, duration: 0.85, ease: "expo.out" }],
  fondu: [{ opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power1.out" }],
};
function entre(sel, t, type = "pop", o = {}) {
  if (t < 0.1 || !$$(sel).length) return;
  const [de, a] = ENTREES[type];
  const vars = { ...a };
  if (o.duree) vars.duration = o.duree;
  if (o.stagger) vars.stagger = o.stagger;
  tl.fromTo(sel, { ...de }, vars, t);
  if ("filter" in de) net(sel, t + vars.duration + (o.stagger ? o.stagger * ($$(sel).length - 1) : 0) + 0.02);
}
function sort(sel, t, o = {}) { tl.to(sel, { opacity: 0, scale: o.scale ?? 0.8, y: o.y ?? 0, duration: o.duree ?? 0.35, ease: "power2.in" }, t); }
function scene(id, t0, t1, entree, sortie) {
  const el = document.getElementById(id);
  const E = {
    zoom: [{ opacity: 0, scale: 0.9, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }],
    monte: [{ opacity: 0, y: 160, filter: "blur(16px)" }, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6, ease: "expo.out" }],
    tourne: [{ opacity: 0, rotationY: -60, transformPerspective: 2000, filter: "blur(10px)" }, { opacity: 1, rotationY: 0, filter: "blur(0px)", duration: 0.75, ease: "expo.out" }],
    plonge: [{ opacity: 0, scale: 1.35, filter: "blur(20px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 0.65, ease: "expo.out" }],
    fondu: [{ opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power1.out" }],
  };
  const S = {
    zoom: { opacity: 0, scale: 1.1, filter: "blur(18px)" }, monte: { opacity: 0, y: -160, filter: "blur(16px)" },
    tourne: { opacity: 0, rotationY: 60, transformPerspective: 2000, filter: "blur(10px)" }, plonge: { opacity: 0, scale: 1.6, filter: "blur(20px)" },
    fondu: { opacity: 0 },
  };
  tl.set(el, { visibility: "visible" }, t0);
  if (t0 >= 0.1) {
    const [de, a] = E[entree] || E.zoom;
    tl.fromTo(el, de, a, t0);
    if ("filter" in de) net(el, t0 + a.duration + 0.02);
  }
  if (sortie !== "aucune") tl.to(el, { ...(S[sortie] || S.zoom), duration: 0.38, ease: "power2.in" }, t1 - 0.38);
  tl.set(el, { visibility: "hidden" }, t1);
}
function pousse(sel, t, e = 1.04) { tl.to(sel, { scale: e, duration: 0.5, ease: "power2.out" }, t); tl.to(sel, { scale: 1, duration: 0.9, ease: "power2.inOut" }, t + 0.6); }
function trace(sel, t, d = 0.8) {
  $$(sel).forEach((p) => { const L = p.getTotalLength(); tl.fromTo(p, { strokeDasharray: L + " " + L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: d, ease: "power2.inOut" }, t); });
}
function tape(sel, t, d) { const l = $$(sel + " .l"); tl.fromTo(l, { opacity: 0 }, { opacity: 1, duration: 0.01, stagger: d / Math.max(1, l.length) }, t); }
function tourne(sel, t0, t1, deg) { tl.fromTo(sel, { rotation: 0 }, { rotation: deg, duration: Math.max(0.1, t1 - t0), ease: "none" }, t0); }
function flotte(sel, t0, t1, amp = 12, periode = 2.6) {
  const n = Math.max(1, Math.floor((t1 - t0) / periode));
  tl.fromTo(sel, { y: 0 }, { y: -amp, duration: periode / 2, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1, immediateRender: false }, t0);
}
function compteur(sel, t, h, d = 1.3) {
  $$(sel + " .rouleau").forEach((r) => {
    const c = Number(r.dataset.c), k = Number(r.dataset.k), y = -((k + 1) * 10 + c) * h;
    if (t < 0.1) tl.set(r, { y }, 0); else tl.fromTo(r, { y: 0 }, { y, duration: d + k * 0.14, ease: "power3.out" }, t);
  });
}
function secoue(sel, t, a = 4) { tl.to(sel, { keyframes: [{ rotation: -a, duration: 0.07 }, { rotation: a, duration: 0.08 }, { rotation: -a / 2, duration: 0.07 }, { rotation: 0, duration: 0.08 }] }, t); }
function pulse(sel, t, e = 1.12, d = 0.18) { tl.to(sel, { scale: e, duration: d, ease: "power2.out", yoyo: true, repeat: 1 }, t); }
function legende(id, t0, t1, forts = []) {
  const el = document.getElementById(id);
  const w = el.querySelectorAll(".w");
  tl.set(el, { visibility: "visible" }, t0);
  const total = t1 - t0;
  const din = Math.min(0.42, Math.max(0.12, total * 0.42)), st = Math.min(0.055, total * 0.06);
  const finEntree = t0 < 0.1 ? t0 : t0 + din + st * (w.length - 1);
  const sortie = Math.max(finEntree + 0.01, t1 - 0.16);
  if (t0 >= 0.1) tl.fromTo(w, { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: din, ease: "power3.out", stagger: st, immediateRender: false }, t0);
  for (const [k, t] of forts) tl.fromTo(w[k], { scale: 1 }, { scale: 1.08, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, immediateRender: false }, Math.max(t, finEntree + 0.01));
  tl.to(el, { opacity: 0, y: -12, duration: Math.max(0.04, t1 - sortie), ease: "power1.in" }, sortie);
  tl.set(el, { visibility: "hidden" }, t1);
}
`;
