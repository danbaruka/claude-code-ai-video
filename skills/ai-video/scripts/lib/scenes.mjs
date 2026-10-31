// Les types de scènes. Chacun reçoit ses paramètres (p) et le contexte de la scène (c), et rend { html, js }.
// Les positions sont celles d'un écran 1080 × 1920 : sous-titres en haut (y 250 à 520), contenu entre y 560 et 1400,
// marque en bas à gauche (y 1436), rien sous y 1520 (l'interface des réseaux le couvre).
// Le js appelle les fonctions de la page (runtime.mjs) : entre, sort, pulse, secoue, trace, tape, compteur…
import { arr, esc, jetons, norm } from "./text.mjs";

export const TYPES = ["titre", "chiffre", "liste", "etapes", "duel", "logos", "telephone", "navigateur", "image", "chat",
  "alerte", "graphique", "terminal", "citation", "carte", "html"];

export const boite = (x, y, w, h) => `left:${arr(x - w / 2)}px;top:${arr(y - h / 2)}px;width:${w}px;height:${h}px`;
// *mot* → le mot fort (italique, couleur d'accent)
export const riche = (t) => esc(t).replace(/\*([^*]+)\*/g, `<span class="acc">$1</span>`);
const visibles = (t) => String(t).replace(/\*/g, "").length;
const lettres = (t) => [...String(t)].map((ch) => `<span class="l">${esc(ch)}</span>`).join("");
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

// le compteur à rouleaux : chaque chiffre tourne avant de tomber sur le bon (compteur() dans la page)
function odo(texte, h) {
  const n = [...texte].filter((ch) => /\d/.test(ch)).length;
  let k = 0;
  return `<span class="odo" style="height:${h}px;line-height:${h}px">${[...texte].map((ch) => {
    if (!/\d/.test(ch)) return `<span class="fixe" style="height:${h}px;width:${ch === " " ? 0.26 : 0.34}em">${ch === " " ? "&nbsp;" : esc(ch)}</span>`;
    return `<span class="col" style="height:${h}px;width:0.6em"><span class="rouleau" data-c="${ch}" data-k="${k++}">${Array.from({ length: 10 * (n + 2) }, (_, j) => `<span style="height:${h}px">${j % 10}</span>`).join("")}</span></span>`;
  }).join("")}</span>`;
}

export const SCENES = {
  // le titre géant : l'affiche de l'image 1, ou un mot qui doit claquer
  titre(p, c) {
    const lignes = p.lignes ?? coupe(p.texte ?? "", 14);
    const lmax = Math.max(...lignes.map(visibles));
    const t = p.taille ?? clamp(Math.floor(1000 / (0.56 * lmax)), 84, 172);
    const h = Math.round(lignes.length * t * 1.04);
    const tv = p.visuel ? 300 : 0;
    const total = h + (tv ? 70 + tv : 0) + (p.sous ? 90 : 0);
    const y0 = Math.max(580, Math.round(990 - total / 2));
    const html = `<div class="abs titre" id="${c.id}-t" style="left:50px;right:50px;top:${y0}px;font-size:${t}px">${lignes.map((l) => `<div class="tl">${riche(l)}</div>`).join("")}</div>
      ${p.visuel ? `<div class="abs" id="${c.id}-v" style="${boite(540, y0 + h + 70 + tv / 2, tv, tv)}">${c.visuel(p.visuel, tv)}</div>` : ""}
      ${p.sous ? `<div class="abs sous centre" id="${c.id}-s" style="left:60px;right:60px;top:${y0 + h + (tv ? 70 + tv : 0) + 30}px">${riche(p.sous)}</div>` : ""}`;
    // sur l'image 1, tout est déjà là : c'est la couverture que montrent les fils
    const t1 = c.debut < 0.1 ? 0 : c.debut;
    const js = [`entre("#${c.id}-t .tl", ${t1 + 0.05}, "monte", { stagger: 0.09 });`];
    if (p.visuel) js.push(`entre("#${c.id}-v", ${t1 && t1 + 0.3}, "pop"); flotte("#${c.id}-v", ${c.debut + 1}, ${c.fin}, 10);`);
    if (p.sous) js.push(`entre("#${c.id}-s", ${t1 && t1 + 0.45}, "monte");`);
    // le mot fort du titre bat quand la voix le dit
    const accTitre = (lignes.join(" ").match(/\*([^*]+)\*/g) ?? []).map(norm);
    c.forts().filter(([mot]) => accTitre.some((a) => a.startsWith(norm(mot)))).slice(0, 3)
      .forEach(([, t0]) => js.push(`pulse("#${c.id}-t .acc", ${t0}, 1.06, 0.16);`));
    return { html, js: js.join("\n") };
  },

  // un nombre qui compte jusqu'à sa valeur
  chiffre(p, c) {
    const valeur = `${p.avant ?? ""}${p.valeur}`;
    const t = p.taille ?? clamp(Math.floor(940 / (0.62 * valeur.length)), 120, 270);
    const yv = p.visuel ? 700 : 0;
    const yn = p.visuel ? 960 : 900;
    const tc = c.mot(p.au ?? String(p.valeur).match(/\d+/)?.[0] ?? "") ?? c.debut + 0.3;
    const html = `${p.visuel ? `<div class="abs" id="${c.id}-v" style="${boite(540, yv, 190, 190)}">${c.visuel(p.visuel, 190)}</div>` : ""}
      <div class="abs nombre centre${p.couleur === "accent" ? " fort" : ""}" id="${c.id}-n" style="left:30px;right:30px;top:${yn - t / 2}px;height:${t}px;font-size:${t}px">${odo(valeur, t)}</div>
      ${p.apres ? `<div class="abs apres centre" id="${c.id}-a" style="left:60px;right:60px;top:${yn + t / 2 + 20}px">${riche(p.apres)}</div>` : ""}
      ${p.label ? `<div class="verre pilule abs" id="${c.id}-l" style="${boite(540, yn + t / 2 + 190, Math.min(940, 120 + visibles(p.label) * 21), 100)};justify-content:center">${riche(p.label)}</div>` : ""}
      ${p.source ? `<div class="mention centre" id="${c.id}-src" style="left:60px;right:60px;top:1350px">Source : ${esc(p.source)}</div>` : ""}`;
    const js = [`entre("#${c.id}-n", ${c.debut + 0.05}, "zoom"); compteur("#${c.id}-n", ${arr(tc - 0.25)}, ${t});`];
    if (p.visuel) js.push(`entre("#${c.id}-v", ${c.debut + 0.15}, "pop");`);
    if (p.apres) js.push(`entre("#${c.id}-a", ${arr(tc + 0.5)}, "monte");`);
    if (p.label) js.push(`entre("#${c.id}-l", ${arr(c.mot(p.label_au ?? "") ?? tc + 0.9)}, "pop");`);
    if (p.source) js.push(`entre("#${c.id}-src", ${arr(tc + 1.1)}, "fondu");`);
    return { html, js: js.join("\n") };
  },

  // des points qui arrivent un par un ; le point dit s'allume, les autres s'effacent un peu
  liste(p, c) {
    const it = p.items.map((x) => (typeof x === "string" ? { texte: x } : x));
    const n = it.length;
    const h = n <= 3 ? 150 : n === 4 ? 132 : 114;
    const gap = 26, fs = n <= 3 ? 48 : n === 4 ? 44 : 40;
    const total = n * h + (n - 1) * gap + (p.titre ? 80 : 0);
    const y0 = Math.round(990 - total / 2);
    const ts = c.temps(n, it.map((x) => x.au));
    const html = `${p.titre ? `<div class="abs etiq centre" id="${c.id}-ti" style="left:60px;right:60px;top:${y0}px;height:50px;font-size:30px">${esc(p.titre)}</div>` : ""}
      ${it.map((x, k) => {
        const y = y0 + (p.titre ? 80 : 0) + k * (h + gap) + h / 2;
        return `<div class="verre ligne" id="${c.id}-i${k}" style="${boite(540, y, 920, h)};font-size:${fs}px">
          <div class="ligne-on"></div>
          ${x.visuel ? `<div class="ligne-v">${c.visuel(x.visuel, h - 40)}</div>` : `<div class="ligne-n centre" style="width:${h - 46}px;height:${h - 46}px;font-size:${Math.round(h * 0.36)}px">${k + 1}</div>`}
          <div class="ligne-t">${riche(x.texte)}</div></div>`;
      }).join("")}`;
    const js = [p.titre ? `entre("#${c.id}-ti", ${c.debut + 0.05}, "fondu");` : ""];
    ts.forEach((t, k) => {
      js.push(`entre("#${c.id}-i${k}", ${arr(t - 0.15)}, "gauche"); tl.fromTo("#${c.id}-i${k} .ligne-on", { opacity: 0 }, { opacity: 1, duration: 0.25 }, ${arr(t - 0.1)});`);
      if (k > 0) js.push(`tl.to("#${c.id}-i${k - 1}", { opacity: 0.5, duration: 0.3 }, ${arr(t - 0.15)}); tl.to("#${c.id}-i${k - 1} .ligne-on", { opacity: 0, duration: 0.2 }, ${arr(Math.max(t - 0.15, ts[k - 1] + 0.16))});`);
    });
    const recap = ts.at(-1) + 1.4;
    if (recap < c.fin - 0.6) js.push(`tl.to("#${c.id} .ligne", { opacity: 1, duration: 0.35 }, ${arr(recap)});`);
    return { html, js: js.join("\n") };
  },

  // des étapes numérotées, reliées par un trait qui se dessine
  etapes(p, c) {
    const it = p.items.map((x) => (typeof x === "string" ? { texte: x } : x));
    const n = it.length;
    const h = n <= 3 ? 220 : n === 4 ? 180 : 150;
    const y0 = Math.round(990 - (n * h) / 2 + h / 2);
    const ts = c.temps(n, it.map((x) => x.au));
    const html = `<svg class="abs" style="left:0;top:0;width:1080px;height:1920px" viewBox="0 0 1080 1920"><path id="${c.id}-fil" d="M190 ${y0} V${y0 + (n - 1) * h}" stroke="var(--gris-3)" stroke-width="6" stroke-linecap="round" fill="none"/></svg>
      ${it.map((x, k) => `<div class="numero centre" id="${c.id}-n${k}" style="${boite(190, y0 + k * h, 116, 116)};font-size:62px">${k + 1}</div>
        <div class="abs etape" id="${c.id}-e${k}" style="left:290px;width:720px;top:${y0 + k * h - h / 2 + 10}px;height:${h - 20}px">
          <div class="etape-t">${riche(x.texte)}</div>${x.detail ? `<div class="etape-d">${riche(x.detail)}</div>` : ""}</div>`).join("")}`;
    const js = [];
    ts.forEach((t, k) => {
      js.push(`entre("#${c.id}-n${k}", ${arr(t - 0.2)}, "pop"); entre("#${c.id}-e${k}", ${arr(t - 0.1)}, "droite");`);
      if (k > 0) js.push(`tl.to("#${c.id}-e${k - 1}", { opacity: 0.45, duration: 0.3 }, ${arr(t - 0.1)});`);
    });
    if (n > 1) js.push(`trace("#${c.id}-fil", ${arr(ts[0])}, ${arr(Math.max(0.6, ts.at(-1) - ts[0]))});`);
    return { html, js: js.join("\n") };
  },

  // deux choses face à face ; le perdant s'efface et se barre
  duel(p, c) {
    const cote = (x, k) => `<div class="verre duel centre" id="${c.id}-${k}" style="${boite(k === "g" ? 292 : 788, 1000, 440, 620)}">
      ${x.visuel ? `<div>${c.visuel(x.visuel, 160)}</div>` : ""}<div class="duel-t">${riche(x.titre ?? "")}</div>${x.texte ? `<div class="duel-x">${riche(x.texte)}</div>` : ""}
      <svg class="abs barre" style="left:40px;top:60px;width:360px;height:500px" viewBox="0 0 360 500"><path id="${c.id}-${k}-x1" d="M30 30 L330 470" /><path id="${c.id}-${k}-x2" d="M330 30 L30 470"/></svg></div>`;
    const [tg, td] = c.temps(2, [p.gauche.au, p.droite.au]);
    const html = `${cote(p.gauche, "g")}${cote(p.droite, "d")}<div class="vs centre" id="${c.id}-vs" style="${boite(540, 1000, 124, 124)}">${esc(p.vs ?? "VS")}</div>`;
    const js = [`entre("#${c.id}-g", ${arr(tg - 0.15)}, "gauche"); entre("#${c.id}-d", ${arr(td - 0.15)}, "droite"); entre("#${c.id}-vs", ${arr(td + 0.1)}, "pop");`];
    if (p.perdant) {
      const k = p.perdant === "gauche" ? "g" : "d", autre = k === "g" ? "d" : "g";
      const tp = c.mot(p.au_perdant ?? "") ?? Math.max(td + 1, (td + c.fin) / 2);
      js.push(`tl.to("#${c.id}-${k}", { opacity: 0.5, scale: 0.94, filter: "grayscale(1)", duration: 0.4 }, ${arr(tp)}); tl.set("#${c.id}-${k} .barre path", { opacity: 0.7 }, ${arr(tp + 0.05)});
        trace("#${c.id}-${k}-x1", ${arr(tp + 0.05)}, 0.25); trace("#${c.id}-${k}-x2", ${arr(tp + 0.25)}, 0.25);
        tl.to("#${c.id}-${autre}", { scale: 1.06, duration: 0.45, ease: "back.out(2)" }, ${arr(tp + 0.1)});`);
    }
    return { html, js: js.join("\n") };
  },

  // des logos de marques : seuls, en rang, ou en orbite autour d'un centre
  logos(p, c) {
    const m = p.marques.map((x) => (typeof x === "string" ? { visuel: x.includes(":") || x.includes("/") ? x : `logo:${x}` } : x));
    const n = m.length;
    const ts = c.temps(n, m.map((x) => x.au));
    let html = "";
    const js = [], noms = new Set();
    if (p.centre && n >= 3) {
      const R = 330, t = 172;
      html += `<div class="abs" id="${c.id}-c" style="${boite(540, 990, 250, 250)}">${typeof p.centre === "string" && !p.centre.includes(":") ? `<div class="verre rond centre centre-txt" style="width:250px;height:250px">${riche(p.centre)}</div>` : c.visuel(p.centre, 250)}</div>
        <div class="abs orbite" id="${c.id}-o" style="${boite(540, 990, 2 * R, 2 * R)}">${m.map((x, k) => {
          const a = (-90 + (360 / n) * k) * Math.PI / 180;
          return `<div class="abs sat" id="${c.id}-m${k}" style="${boite(R + R * Math.cos(a), R + R * Math.sin(a), t, t)}">${c.visuel(x.visuel, t)}</div>`;
        }).join("")}</div>`;
      js.push(`entre("#${c.id}-c", ${c.debut + 0.05}, "zoom");`, `tourne("#${c.id}-o", ${c.debut}, ${c.fin}, 40); tourne("#${c.id} .sat", ${c.debut}, ${c.fin}, -40);`);
    } else {
      const t = n === 1 ? 360 : n === 2 ? 300 : n === 3 ? 260 : 220;
      const cols = n <= 3 ? n : 3, rangs = Math.ceil(n / cols);
      m.forEach((x, k) => {
        const col = k % cols, rang = Math.floor(k / cols);
        const dans = rang === rangs - 1 ? n - rang * cols : cols;
        const pas = Math.min(t + 70, 960 / dans);
        const cx = 540 + (col - (dans - 1) / 2) * pas, cy = 990 + (rang - (rangs - 1) / 2) * (t + 90);
        html += `<div class="abs" id="${c.id}-m${k}" style="${boite(cx, cy, t, t)}">${c.visuel(x.visuel, t)}</div>`;
        if (x.nom) { html += `<div class="abs nom centre" id="${c.id}-nm${k}" style="${boite(cx, cy + t / 2 + 40, t + 60, 50)}">${esc(x.nom)}</div>`; noms.add(k); }
      });
    }
    ts.forEach((t, k) => js.push(`entre("#${c.id}-m${k}${noms.has(k) ? `, #${c.id}-nm${k}` : ""}", ${arr(t - 0.15)}, "pop");`));
    if (p.legende) {
      html += `<div class="verre pilule abs" id="${c.id}-lg" style="${boite(540, 1350, Math.min(940, 120 + visibles(p.legende) * 21), 96)};justify-content:center">${riche(p.legende)}</div>`;
      js.push(`entre("#${c.id}-lg", ${arr(c.mot(p.legende_au ?? "") ?? ts.at(-1) + 0.5)}, "monte");`);
    }
    return { html, js: js.join("\n") };
  },

  // une capture ou une vidéo dans un vrai iPhone
  telephone(p, c) {
    const w = 480, h = Math.round(w * 2.07);
    const media = p.video
      ? `<video id="${c.id}-vid" class="ecran-media" src="${c.media(p.video)}" muted playsinline data-start="${c.debut}" data-duration="${arr(c.fin - c.debut)}" data-track-index="${c.piste()}"></video>`
      : `<img class="ecran-media" id="${c.id}-img" src="${c.media(p.image)}" style="${p.defile ? "height:auto;min-height:100%;object-fit:initial" : ""}" />`;
    const pil = (p.pilules ?? []).map((x) => (typeof x === "string" ? { texte: x } : x));
    const ts = c.temps(pil.length, pil.map((x) => x.au), 0.9);
    const html = `${iphone(540, 1020, w, `<div class="ecran-in" id="${c.id}-in">${media}</div>`, `${c.id}-tel`)}
      ${pil.map((x, k) => {
        const gauche = (x.cote ?? (k % 2 ? "droite" : "gauche")) === "gauche";
        const lg = Math.min(520, 110 + visibles(x.texte) * 20);
        return `<div class="verre pilule abs" id="${c.id}-p${k}" style="${boite(gauche ? 60 + lg / 2 : 1020 - lg / 2, 760 + k * 230, lg, 96)}">${x.visuel ? c.visuel(x.visuel, 56, { nu: true }) : ""}${riche(x.texte)}</div>`;
      }).join("")}`;
    const js = [`tl.fromTo("#${c.id}-tel", { y: 560, rotationX: 12, opacity: 0, transformPerspective: 1800 }, { y: 0, rotationX: 0, opacity: 1, duration: 0.9, ease: "expo.out" }, ${c.debut + 0.05});`];
    if (p.defile) js.push(`tl.fromTo("#${c.id}-img", { y: 0 }, { y: -${typeof p.defile === "number" ? p.defile : 900}, duration: ${arr(Math.max(1, (c.fin - c.debut) * 0.75))}, ease: "power1.inOut" }, ${arr(c.debut + 0.9)});`);
    if (p.zoom) js.push(`tl.to("#${c.id}-in", { scale: ${p.zoom.echelle ?? 1.8}, transformOrigin: "${Math.round((p.zoom.x ?? 0.5) * 100)}% ${Math.round((p.zoom.y ?? 0.3) * 100)}%", duration: 0.8, ease: "power3.inOut" }, ${arr(c.mot(p.zoom.au ?? "") ?? (c.debut + c.fin) / 2)});`);
    ts.forEach((t, k) => js.push(`entre("#${c.id}-p${k}", ${arr(t - 0.1)}, "pop");`));
    return { html, js: js.join("\n") };
  },

  // une fenêtre de navigateur : une capture, ou une page simplifiée
  navigateur(p, c) {
    const corps = p.image
      ? `<img class="nav-img" id="${c.id}-img" src="${c.media(p.image)}" />`
      : `<div class="nav-page">${p.titre ? `<div class="nav-titre">${riche(p.titre)}</div>` : ""}${p.texte ? `<div class="nav-texte">${riche(p.texte)}</div>` : ""}
          <div class="squel" style="width:92%"></div><div class="squel" style="width:78%"></div><div class="squel" style="width:85%"></div><div class="squel" style="width:60%"></div></div>`;
    const html = `<div class="verre nav" id="${c.id}-w" style="${boite(540, 1000, 940, 780)}">
        <div class="nav-barre"><i></i><i></i><i></i><div class="nav-url" id="${c.id}-u">${p.url ? `${lettres(p.url)}` : ""}</div></div>
        <div class="nav-corps">${corps}</div></div>
      ${p.pilule ? `<div class="verre pilule abs" id="${c.id}-p" style="${boite(540, 1340, Math.min(900, 120 + visibles(p.pilule) * 21), 96)};justify-content:center">${riche(p.pilule)}</div>` : ""}`;
    const js = [`entre("#${c.id}-w", ${c.debut + 0.05}, "monte");`];
    if (p.url) js.push(`tape("#${c.id}-u", ${c.debut + 0.45}, ${arr(Math.min(1, 0.04 * p.url.length))});`);
    if (p.image && p.defile) js.push(`tl.fromTo("#${c.id}-img", { y: 0 }, { y: -${typeof p.defile === "number" ? p.defile : 600}, duration: ${arr(Math.max(1, (c.fin - c.debut) * 0.7))}, ease: "power1.inOut" }, ${arr(c.debut + 1)});`);
    if (p.pilule) js.push(`entre("#${c.id}-p", ${arr(c.mot(p.pilule_au ?? "") ?? c.debut + 1.2)}, "pop");`);
    return { html, js: js.join("\n") };
  },

  // une photo ou une capture, en carte ou plein écran, qui avance doucement (Ken Burns)
  image(p, c) {
    const plein = p.cadre === "plein";
    const html = plein
      ? `<div class="abs plein" id="${c.id}-cadre"><img id="${c.id}-img" src="${c.media(p.src)}" /><div class="voile"></div></div>`
      : `<div class="abs photo" id="${c.id}-cadre" style="${boite(540, 990, 880, 840)}"><img id="${c.id}-img" src="${c.media(p.src)}" /></div>`;
    const lg = p.legende ? `<div class="verre pilule abs" id="${c.id}-lg" style="${boite(540, plein ? 1330 : 1340, Math.min(900, 120 + visibles(p.legende) * 21), 96)};justify-content:center">${riche(p.legende)}</div>` : "";
    const js = [`entre("#${c.id}-cadre", ${c.debut + 0.05}, "${plein ? "fondu" : "zoom"}");`,
      `tl.fromTo("#${c.id}-img", { scale: 1.12 }, { scale: 1, duration: ${arr(c.fin - c.debut)}, ease: "none" }, ${c.debut});`];
    if (p.legende) js.push(`entre("#${c.id}-lg", ${arr(c.mot(p.legende_au ?? "") ?? c.debut + 0.8)}, "monte");`);
    return { html: html + lg, js: js.join("\n") };
  },

  // une conversation : vos messages s'écrivent, les réponses arrivent après trois points
  chat(p, c) {
    const msgs = p.messages;
    const ts = c.temps(msgs.length, msgs.map((x) => x.au));
    const H = 690;
    let y = 0;
    const pos = msgs.map((x) => {
      const lignes = Math.ceil(visibles(x.texte) / 27);
      const hh = lignes * 46 + 44;
      const r = { y, hh };
      y += hh + 24;
      return r;
    });
    const nom = p.app ?? "";
    const html = `<div class="verre chat" id="${c.id}-w" style="${boite(540, 990, 880, 820)}">
        <div class="chat-tete">${p.visuel ? c.visuel(p.visuel, 64) : ""}<b>${esc(nom)}</b>${p.mention ? `<span class="chat-m">${esc(p.mention)}</span>` : ""}</div>
        <div class="chat-fil"><div class="chat-in" id="${c.id}-in">${msgs.map((x, k) => `<div class="bulle ${x.de === "moi" ? "moi" : "lui"}" id="${c.id}-b${k}" style="top:${pos[k].y}px">${x.de === "moi" ? lettres(x.texte.replace(/\*/g, "")) : riche(x.texte)}</div>${x.de === "moi" ? "" : `<div class="points" id="${c.id}-d${k}" style="top:${pos[k].y}px"><i></i><i></i><i></i></div>`}`).join("")}</div></div></div>`;
    const js = [`entre("#${c.id}-w", ${c.debut + 0.05}, "monte");`];
    msgs.forEach((x, k) => {
      const t = ts[k];
      const bas = pos[k].y + pos[k].hh;
      if (bas > H) js.push(`tl.to("#${c.id}-in", { y: ${-(bas - H)}, duration: 0.45, ease: "power2.inOut" }, ${arr(t - 0.5)});`);
      if (x.de === "moi") js.push(`entre("#${c.id}-b${k}", ${arr(t - 0.2)}, "monte"); tape("#${c.id}-b${k}", ${arr(t - 0.1)}, ${arr(Math.min(1.4, 0.035 * visibles(x.texte)))});`);
      else js.push(`tl.fromTo("#${c.id}-d${k}", { opacity: 0 }, { opacity: 1, duration: 0.15 }, ${arr(t - 0.75)}); tl.to("#${c.id}-d${k}", { opacity: 0, duration: 0.1 }, ${arr(t - 0.12)}); entre("#${c.id}-b${k}", ${arr(t - 0.1)}, "monte");`);
    });
    return { html, js: js.join("\n") };
  },

  // un avertissement (danger, attention), une bonne nouvelle (ok) ou une info
  alerte(p, c) {
    const niv = p.niveau ?? "danger";
    const defaut = { danger: "alerte", attention: "alerte", ok: "coche", info: "etincelle" }[niv] ?? "alerte";
    const v = p.visuel ?? `icone:${defaut}`;
    const html = `<div class="verre alerte centre ${niv}" id="${c.id}-w" style="${boite(540, 1040, 880, 600)}">
        <div class="al-t" style="font-size:${visibles(p.titre ?? "") > 22 ? 54 : 62}px">${riche(p.titre ?? "")}</div>${p.texte ? `<div class="al-x">${riche(p.texte)}</div>` : ""}</div>
      <div class="onde-al ${niv}" id="${c.id}-r1" style="${boite(540, 740, 190, 190)}"></div><div class="onde-al ${niv}" id="${c.id}-r2" style="${boite(540, 740, 190, 190)}"></div>
      <div class="pastille-al centre ${niv}" id="${c.id}-i" style="${boite(540, 740, 190, 190)}">${c.visuel(v, 100, { nu: true, couleur: "#fff" })}</div>`;
    const ta = c.debut + 0.2;
    const fois = Math.max(1, Math.floor((c.fin - ta - 0.5) / 1.4));
    const js = [`entre("#${c.id}-w", ${c.debut + 0.05}, "zoom"); entre("#${c.id}-i", ${arr(ta)}, "pop"); secoue("#${c.id}-i", ${arr(ta + 0.6)}, 8);`,
      `tl.fromTo("#${c.id}-r1, #${c.id}-r2", { scale: 1, opacity: 0.5 }, { scale: 1.9, opacity: 0, duration: 1.4, ease: "power1.out", repeat: ${fois - 1}, stagger: 0.7 }, ${arr(ta + 0.3)});`];
    return { html, js: js.join("\n") };
  },

  // des barres qui montent, ou une courbe qui se dessine
  graphique(p, c) {
    let html = `<div class="verre graph" id="${c.id}-w" style="${boite(540, 1000, 900, 760)}">${p.titre ? `<div class="g-titre">${riche(p.titre)}</div>` : ""}</div>`;
    const js = [`entre("#${c.id}-w", ${c.debut + 0.05}, "monte");`];
    if (p.courbe) {
      const v = p.courbe, max = Math.max(...v), min = Math.min(...v, 0);
      const pts = v.map((x, k) => [170 + (k * 740) / (v.length - 1), 1270 - ((x - min) / (max - min || 1)) * 460]);
      const d = pts.map(([x, y], k) => `${k ? "L" : "M"}${arr(x)} ${arr(y)}`).join(" ");
      html += `<svg class="abs" style="left:0;top:0;width:1080px;height:1920px" viewBox="0 0 1080 1920"><defs><linearGradient id="${c.id}-gr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity="0.28"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
        <path id="${c.id}-aire" d="${d} L${pts.at(-1)[0]} 1290 L${pts[0][0]} 1290 Z" fill="url(#${c.id}-gr)"/>
        <path id="${c.id}-c" d="${d}" fill="none" stroke="var(--accent)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
        <circle id="${c.id}-pt" cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="16" fill="var(--accent)"/></svg>
        ${p.unite ? `<div class="abs g-val centre" id="${c.id}-v" style="${boite(Math.min(880, pts.at(-1)[0]), pts.at(-1)[1] - 70, 300, 70)}">${esc(p.derniere ?? `${v.at(-1)} ${p.unite}`)}</div>` : ""}`;
      const t = c.mot(p.au ?? "") ?? c.debut + 0.4;
      js.push(`tl.fromTo("#${c.id}-aire", { opacity: 0 }, { opacity: 1, duration: 1 }, ${arr(t + 0.6)}); trace("#${c.id}-c", ${arr(t)}, 1.4); entre("#${c.id}-pt", ${arr(t + 1.35)}, "pop");`);
      if (p.unite) js.push(`entre("#${c.id}-v", ${arr(t + 1.45)}, "monte");`);
    } else {
      const b = p.barres, n = b.length, max = Math.max(...b.map((x) => x.valeur));
      const fort = p.fort ?? b.findIndex((x) => x.valeur === max);
      const bw = Math.min(150, 620 / n), pas = 740 / n;
      const ts = c.temps(n, b.map((x) => x.au));
      b.forEach((x, k) => {
        const hb = Math.max(14, (x.valeur / max) * 420), cx = 170 + pas * (k + 0.5);
        html += `<div class="abs barre-g${k === fort ? " fort" : ""}" id="${c.id}-b${k}" style="left:${arr(cx - bw / 2)}px;top:${arr(1270 - hb)}px;width:${arr(bw)}px;height:${arr(hb)}px"></div>
          <div class="abs g-val centre" id="${c.id}-v${k}" style="${boite(cx, 1270 - hb - 40, pas, 56)}">${esc(x.affiche ?? `${x.valeur}${p.unite ?? ""}`)}</div>
          <div class="abs g-lab centre" id="${c.id}-l${k}" style="${boite(cx, 1310, pas, 44)}">${esc(x.label)}</div>`;
        js.push(`tl.fromTo("#${c.id}-b${k}", { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.7, ease: "expo.out" }, ${arr(ts[k] - 0.15)}); entre("#${c.id}-v${k}, #${c.id}-l${k}", ${arr(ts[k] + 0.2)}, "fondu");`);
      });
    }
    return { html, js: js.join("\n") };
  },

  // une ligne de commande qui s'écrit
  terminal(p, c) {
    const n = p.lignes.length;
    const h = 150 + n * 72;
    const ts = c.temps(n, (p.au ?? []).concat(new Array(n).fill(undefined)).slice(0, n));
    const html = `<div class="term" id="${c.id}-w" style="${boite(540, 990, 940, h)}"><div class="term-barre"><i></i><i></i><i></i><span>${esc(p.titre ?? "Terminal")}</span></div>
      ${p.lignes.map((l, k) => `<div class="term-l" id="${c.id}-l${k}"><b>$</b> ${lettres(l)}</div>`).join("")}</div>`;
    const js = [`entre("#${c.id}-w", ${c.debut + 0.05}, "monte");`];
    ts.forEach((t, k) => js.push(`tl.fromTo("#${c.id}-l${k}", { opacity: 0 }, { opacity: 1, duration: 0.05 }, ${arr(t - 0.15)}); tape("#${c.id}-l${k}", ${arr(t - 0.1)}, ${arr(Math.min(1.3, 0.035 * p.lignes[k].length))});`));
    return { html, js: js.join("\n") };
  },

  // une phrase citée, mot après mot
  citation(p, c) {
    const mots = jetons(p.texte);
    const t = clamp(Math.floor(2600 / Math.sqrt(visibles(p.texte) * 6)), 58, 104);
    const html = `<div class="abs guillemet centre" id="${c.id}-g" style="${boite(540, 690, 240, 240)}">“</div>
      <div class="abs cite centre" id="${c.id}-t" style="left:80px;right:80px;top:800px;height:440px;font-size:${t}px">${mots.map((m) => `<span class="w${m.fort ? " acc" : ""}">${esc(m.texte)}</span>`).join(" ")}</div>
      ${p.auteur ? `<div class="verre pilule abs" id="${c.id}-a" style="${boite(540, 1330, Math.min(900, 140 + visibles(p.auteur) * 21 + (p.visuel ? 70 : 0)), 100)};justify-content:center">${p.visuel ? c.visuel(p.visuel, 60, { nu: true }) : ""}${esc(p.auteur)}</div>` : ""}`;
    const fin = Math.min(c.fin - 0.8, c.debut + 0.3 + mots.length * 0.22);
    const js = [`entre("#${c.id}-g", ${c.debut + 0.05}, "pop");`, `tl.fromTo("#${c.id}-t .w", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, stagger: ${arr((fin - c.debut - 0.3) / mots.length)} }, ${c.debut + 0.2});`];
    if (p.auteur) js.push(`entre("#${c.id}-a", ${arr(fin + 0.2)}, "monte");`);
    return { html, js: js.join("\n") };
  },

  // une carte : un visuel, un titre, un texte, des pastilles
  carte(p, c) {
    const pil = p.pilules ?? [];
    const html = `<div class="verre carte" id="${c.id}-w" style="${boite(540, 1000, 880, 740)}">
        ${p.visuel ? `<div class="carte-v" id="${c.id}-v">${c.visuel(p.visuel, 190)}</div>` : ""}
        ${p.titre ? `<div class="carte-t">${riche(p.titre)}</div>` : ""}${p.texte ? `<div class="carte-x">${riche(p.texte)}</div>` : ""}
        ${pil.length ? `<div class="carte-p">${pil.map((x, k) => `<span class="mini" id="${c.id}-p${k}">${riche(x)}</span>`).join("")}</div>` : ""}</div>`;
    const ts = c.temps(pil.length, [], 1);
    const js = [`entre("#${c.id}-w", ${c.debut + 0.05}, "zoom");`];
    if (p.visuel) js.push(`entre("#${c.id}-v", ${c.debut + 0.3}, "pop");`);
    ts.forEach((t, k) => js.push(`entre("#${c.id}-p${k}", ${arr(t)}, "pop");`));
    return { html, js: js.join("\n") };
  },

  // une scène écrite à la main, pour le moment qui mérite un visuel unique
  // {{debut}}, {{fin}} et {{mot:Ledger}} sont remplacés par les temps de la scène
  html(p, c) {
    const remplace = (s) => String(s ?? "").replace(/\{\{debut\}\}/g, c.debut).replace(/\{\{fin\}\}/g, c.fin)
      .replace(/\{\{mot:([^}]+)\}\}/g, (_, m) => String(c.mot(m) ?? c.debut)).replace(/\{\{media:([^}]+)\}\}/g, (_, f) => c.media(f));
    return { html: remplace(p.html), js: remplace(p.js), css: p.css };
  },
};

// un vrai iPhone (proportions d'un iPhone 16 Pro) ; « ecran » est son contenu
export function iphone(x, y, w, ecran, id) {
  const h = Math.round(w * 2.07);
  return `<div class="iphone" id="${id}" style="${boite(x, y, w, h)}"><div class="ip-bouton" style="left:-0.9%;top:19%;height:4.5%"></div><div class="ip-bouton" style="left:-0.9%;top:27%;height:8%"></div><div class="ip-bouton" style="right:-0.9%;top:25%;height:12%"></div><div class="ip-cadre"><div class="ip-noir"><div class="ip-ecran">${ecran}<div class="ip-ilot"></div><div class="ip-reflet"></div></div></div></div></div>`;
}

// coupe un texte en lignes d'environ « max » caractères, sans casser un *mot fort*
export function coupe(texte, max) {
  const lignes = [];
  let cur = "";
  for (const m of texte.split(/\s+/)) {
    if (cur && visibles(`${cur} ${m}`) > max) { lignes.push(cur); cur = m; } else cur = cur ? `${cur} ${m}` : m;
  }
  if (cur) lignes.push(cur);
  return lignes;
}
