#!/usr/bin/env node
// Fabrique une vidéo verticale (1080 × 1920) à partir d'un seul fichier video.json : voix, calage des mots,
// sous-titres, scènes animées, musique, contrôle des débordements, planche d'aperçu, rendu MP4.
//   node make.mjs videos/ma-video.json [autres.json…] [--rendu] [--brouillon] [--sans-controle] [--sans-planche]
// Tout ce qui est produit va à côté du json : fabrique/<id>/ (travail) et rendus/<id>.mp4, -planche.jpg, -couverture.jpg, .txt
import { execFileSync, spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ic, ICONES } from "./lib/icons.mjs";
import { CACHE, gsap, logoMarque, slug } from "./lib/logos.mjs";
import { RUNTIME } from "./lib/runtime.mjs";
import { boite, riche, SCENES, TYPES } from "./lib/scenes.mjs";
import { arr, caler, esc, jetons, legendes, norm, texteVoix } from "./lib/text.mjs";

const ICI = dirname(fileURLToPath(import.meta.url));
const SKILL = join(ICI, "..");
const HF = "hyperframes@0.8.92";
const ENV = { ...process.env, HYPERFRAMES_NO_TELEMETRY: "1", DO_NOT_TRACK: "1", HYPERFRAMES_SKIP_SKILLS: "1" };
// « nested_structure » ne concerne que l'affichage dans HyperFrames Studio, pas le rendu
// « duplicate_media » : la même image à deux endroits, sans effet sur le rendu
const IGNORES = new Set(["nested_structure_needs_subcomposition", "duplicate_media_discovery_risk"]);
const args = process.argv.slice(2);
const option = (n) => args.includes(`--${n}`);
const fichiers = args.filter((a) => !a.startsWith("--"));
if (!fichiers.length) {
  console.error("usage : node make.mjs <video.json>… [--rendu] [--brouillon] [--sans-controle] [--sans-planche]");
  process.exit(1);
}
const lancer = (cmd, a, o = {}) => execFileSync(cmd, a, { encoding: "utf8", maxBuffer: 1 << 28, env: ENV, ...o });
const duree = (f) => Number(lancer("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).trim());
const lufs = (f) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", f, "-af", "ebur128", "-f", "null", "-"], { encoding: "utf8" });
  return Number((r.stderr.match(/I:\s+(-?[\d.]+) LUFS/g) ?? []).at(-1)?.match(/-?[\d.]+/)[0] ?? -20);
};
const python = () => {
  if (process.env.VIDEO_COURTE_PYTHON) return process.env.VIDEO_COURTE_PYTHON;
  const venv = join(SKILL, ".venv", "bin", "python");
  return existsSync(venv) ? venv : "python3";
};

let bilan = 0;
for (const f of fichiers) {
  try { await fabriquer(resolve(f)); } catch (e) { bilan = 1; console.error(`✗ ${basename(f)} : ${e.message}`); }
}
process.exit(bilan);

async function fabriquer(fichierJson) {
  const BASE = dirname(fichierJson);
  const spec = JSON.parse(readFileSync(fichierJson, "utf8"));
  const id = spec.id ?? basename(fichierJson, ".json");
  const avis = [];
  verifier(spec, BASE);
  const TRAVAIL = join(BASE, "fabrique", id);
  const PROJET = join(TRAVAIL, "projet");
  const RENDUS = join(BASE, "rendus");
  for (const d of [join(PROJET, "medias"), join(PROJET, "fonts"), RENDUS]) mkdirSync(d, { recursive: true });
  const rush = spec.rush ? resolve(BASE, spec.rush) : null;

  // ---------- 1. la voix et le temps de chaque mot ----------
  const phrases = spec.phrases.map((p) => ({ ...p, toks: jetons(p.texte) }));
  if (rush || spec.voix?.fichier) {
    const source = rush ?? resolve(BASE, spec.voix.fichier);
    const wav = join(TRAVAIL, "voix.wav");
    lancer("ffmpeg", ["-v", "error", "-y", "-i", source, "-vn", "-ac", "1", "-ar", "48000", wav]);
    const mots = transcrire(wav, TRAVAIL, spec.langue ?? "fr");
    const tous = caler(phrases.flatMap((p) => p.toks), mots);
    let k = 0;
    for (const p of phrases) { p.mots = tous.slice(k, (k += p.toks.length)); p.debut = p.mots[0].debut; p.fin = p.mots.at(-1).fin; }
  } else {
    const v = { nom: "fr-FR-RemyMultilingualNeural", debit: "+4%", ...(spec.voix ?? {}) };
    const demande = { voix: v, blanc: spec.blanc ?? 0.35, phrases: phrases.map((p) => ({ texte: texteVoix(p.texte, spec.prononcer), pause: p.pause ?? 0 })) };
    writeFileSync(join(TRAVAIL, "demande.json"), JSON.stringify(demande));
    const r = spawnSync(python(), [join(ICI, "voice.py"), join(TRAVAIL, "demande.json"), TRAVAIL], { encoding: "utf8", env: ENV });
    if (r.status !== 0) throw new Error(`voix : ${(r.stderr || r.stdout).trim().split("\n").slice(-3).join(" ")}${/edge_tts/.test(r.stderr) ? " (lancez scripts/install.sh)" : ""}`);
    const voix = JSON.parse(readFileSync(join(TRAVAIL, "voix.json"), "utf8"));
    phrases.forEach((p, i) => {
      const vp = voix.phrases[i];
      p.mots = caler(p.toks, vp.mots.length ? vp.mots : [{ texte: p.texte, debut: vp.debut, fin: vp.fin }]);
      p.debut = vp.debut; p.fin = vp.fin;
    });
  }
  const finVoix = phrases.at(-1).fin;
  const fin = spec.fin ?? null;
  const finAudio = fin?.audio ? resolve(BASE, fin.audio) : null;
  const tFin = arr(finVoix + 0.5);
  const DUREE = arr(fin ? tFin + (finAudio ? duree(finAudio) + 1 : 2.2) : finVoix + 0.9);

  // ---------- 2. les logos, les médias ----------
  const logos = new Map();
  for (const nom of collecterLogos(spec)) logos.set(nom, await logoMarque(nom));
  for (const [nom, l] of logos) if (!l) avis.push(`logo « ${nom} » introuvable (Simple Icons, web3icons) : une pastille avec ses initiales le remplace (ou donnez un fichier : "medias/${slug(nom)}.svg")`);
  const copies = new Map();
  const media = (chemin) => {
    const src = resolve(BASE, chemin);
    if (!existsSync(src)) throw new Error(`média introuvable : ${chemin}`);
    if (!copies.has(src)) {
      const nom = `${copies.size}-${basename(src).replace(/[^\w.-]/g, "_")}`;
      copyFileSync(src, join(PROJET, "medias", nom));
      copies.set(src, `medias/${nom}`);
    }
    return copies.get(src);
  };
  let uniques = 0;
  const visuel = (v, t, o = {}) => {
    const x = typeof v === "string" ? lireVisuel(v) : v;
    const cadre = (cls, contenu, style = "") => `<div class="tuile ${cls}" style="width:${t}px;height:${t}px${style}">${contenu}</div>`;
    if (x.logo) {
      const L = logos.get(x.logo);
      if (!L) return cadre("", `<b style="font-size:${Math.round(t * 0.34)}px;letter-spacing:-0.04em">${esc(x.logo.slice(0, 2).toUpperCase())}</b>`);
      const u = `l${++uniques}`;
      const g = (s) => (L.svg ? L.svg.replace(/id="([^"]+)"/g, `id="${u}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${u}$1)`).replace(/<svg[^>]*?>/, (tete) => tete.replace(/\s(width|height|class)="[^"]*"/g, "").replace("<svg", `<svg width="${s}" height="${s}"`))
        : `<svg viewBox="0 0 24 24" width="${s}" height="${s}">${L.d.map((d) => `<path d="${d}" fill="${o.couleur ?? L.hex}"/>`).join("")}</svg>`);
      return o.nu ? g(t) : cadre("", g(Math.round(t * 0.58)));
    }
    if (x.icone) return o.nu ? ic(x.icone, t, o.couleur ?? "var(--accent)", 2) : cadre("ic-t", ic(x.icone, Math.round(t * 0.5), "#fff", 2.2));
    if (x.emoji) return o.nu ? `<span class="emoji" style="font-size:${Math.round(t * 0.8)}px">${x.emoji}</span>` : cadre("", `<span class="emoji" style="font-size:${Math.round(t * 0.56)}px">${x.emoji}</span>`);
    if (x.image && extname(x.image).toLowerCase() === ".svg") {
      const src = resolve(BASE, x.image);
      if (!existsSync(src)) throw new Error(`média introuvable : ${x.image}`);
      const u = `l${++uniques}`;
      const svg = (n) => readFileSync(src, "utf8").replace(/<\?xml[^>]*>/, "").replace(/id="([^"]+)"/g, `id="${u}$1"`).replace(/url\(#([^)]+)\)/g, `url(#${u}$1)`)
        .replace(/<svg[^>]*?>/, (tete) => tete.replace(/\s(width|height|class)="[^"]*"/g, "").replace("<svg", `<svg width="${n}" height="${n}"`));
      return o.nu ? svg(t) : cadre("", svg(Math.round(t * 0.72)));
    }
    if (x.image) return o.nu ? `<img src="${media(x.image)}" style="width:${t}px;height:${t}px;object-fit:contain" />` : cadre("", `<img src="${media(x.image)}" />`);
    throw new Error(`visuel incompris : ${JSON.stringify(v)}`);
  };

  // ---------- 3. les scènes ----------
  // Une phrase avec « scene » ouvre une scène ; sans « scene », elle prolonge la précédente
  // (avec un rush, une phrase sans scène montre le visage ; "scene": "suite" prolonge la scène).
  const groupes = [];
  phrases.forEach((p, i) => {
    const s = p.scene;
    if (s && s !== "suite") groupes.push({ p: s, phrases: [i] });
    else if (s === "suite" || !rush) { if (groupes.length && groupes.at(-1).p) groupes.at(-1).phrases.push(i); else groupes.push({ p: null, phrases: [i] }); }
    else groupes.push({ p: null, phrases: [i] });
  });
  const vrais = groupes.filter((g) => g.p);
  const ENTREES = ["zoom", "monte", "plonge", "tourne"];
  let piste = 5;
  const scenes = [];
  const pousses = [];
  vrais.forEach((g, k) => {
    const sid = `s${k}`;
    const ph = g.phrases.map((i) => phrases[i]);
    const i0 = g.phrases[0];
    const debut = i0 === 0 ? 0 : arr(Math.max(0, ph[0].debut - 0.22));
    const apres = groupes[groupes.indexOf(g) + 1];
    const finScene = !apres ? (fin ? arr(tFin + 0.3) : DUREE) : apres.p ? arr(Math.max(0, phrases[apres.phrases[0]].debut - 0.22) + 0.3) : arr(phrases[apres.phrases[0]].debut + 0.05);
    const motsScene = ph.flatMap((p) => p.mots);
    const mot = (texte, depuis = debut) => {
      const cible = norm(String(texte).split(/\s+/)[0].replace(/^(l|d|qu|j|n|s|c|m|t)['’]/i, "") ?? "");
      if (!cible) return null;
      // « animation » trouve aussi « l'animation »
      const w = motsScene.find((x) => x.debut >= depuis - 0.01 && [x.texte, x.texte.replace(/^(l|d|qu|j|n|s|c|m|t)['’]/i, "")].some((y) => norm(y).startsWith(cible)));
      if (!w) { avis.push(`scène ${k + 1} (${g.p.type}) : mot « ${texte} » introuvable dans ses phrases`); return null; }
      return arr(w.debut);
    };
    const c = {
      id: sid, debut, fin: finScene, phrases: ph, media, visuel, mot,
      piste: () => piste++,
      forts: () => motsScene.filter((w) => w.fort).map((w) => [w.texte, arr(w.debut)]),
      temps(n, aus = [], decal = 0) {
        const res = [];
        const t0 = (ph[0].mots[0]?.debut ?? debut + 0.2) + decal, t1 = ph.at(-1).fin;
        let avant = debut;
        for (let j = 0; j < n; j++) {
          let t = aus[j] ? mot(aus[j], avant) : null;
          if (t === null) t = n > 1 && n === ph.length && !decal ? ph[j].mots[0]?.debut ?? t0 : t0 + (j * Math.max(0.6, (t1 - t0) * 0.8)) / Math.max(1, n);
          t = arr(Math.max(t, avant + (j ? 0.25 : 0)));
          res.push(t);
          avant = t;
        }
        return res;
      },
    };
    if (!SCENES[g.p.type]) throw new Error(`scène ${k + 1} : type « ${g.p.type} » inconnu (${TYPES.join(", ")})`);
    const r = SCENES[g.p.type](g.p, c);
    scenes.push({ id: sid, debut, fin: finScene, entree: g.p.entree ?? (debut < 0.1 ? "aucune" : ENTREES[k % ENTREES.length]), sortie: g.p.sortie ?? "zoom", ...r });
    // une poussée de caméra sur le premier mot fort de chaque phrase (pas plus d'une toutes les 1,6 s)
    for (const p of ph) {
      const w = p.mots.find((x) => x.fort);
      if (w && w.debut > 0.6 && (!pousses.length || w.debut - pousses.at(-1)[1] > 1.6)) pousses.push([sid, arr(w.debut)]);
    }
    // une phrase que le titre écrit déjà en grand n'a pas de sous-titre
    if (g.p.type === "titre") {
      const ecrit = norm((g.p.lignes ?? [g.p.texte ?? ""]).join(" "));
      if (ecrit && ecrit === norm(ph[0].texte)) ph[0].sansLegende = true;
    }
  });
  if (fin && finAudio && fin.texte) phrases.forEach((p) => { if (norm(p.texte) === norm(fin.texte)) p.sansLegende = true; });

  // ---------- 4. les sous-titres ----------
  const caps = legendes(phrases.map((p) => ({ mots: p.mots, debut: p.debut, fin: p.fin, sansLegende: p.sansLegende || spec.sousTitres === false })));
  const couvert = (t) => scenes.some((s) => t >= s.debut && t < s.fin - 0.2) || (fin && t >= tFin);
  for (const cp of caps) cp.bas = !!rush && !couvert(cp.t0 + 0.05);

  // ---------- 5. la page HyperFrames ----------
  const TACHES = [
    { c: "#ffd2b8", x: -160, y: 120, t: 760 }, { c: "#e2dbff", x: 560, y: 620, t: 720 },
    { c: "#cfe6ff", x: -220, y: 1180, t: 780 }, { c: "#d6f3e4", x: 600, y: 1420, t: 700 },
  ];
  const taches = TACHES.map((t, k) => `<div class="tache t${k}" style="left:${t.x}px;top:${t.y}px;width:${t.t}px;height:${t.t}px;background:${t.c}"></div>`).join("");
  const htmlScenes = scenes.map((s) => `<section class="scene" id="${s.id}">${rush ? `<div class="fond-scene">${taches}</div>` : ""}<div class="cam"><div class="zoom">${s.html}</div></div></section>`).join("\n");
  const htmlCaps = caps.map((cp) => `<div class="cap${cp.bas ? " bas" : ""}" id="${cp.id}" style="font-size:${cp.taille}px">${cp.mots.map((w) => `<span class="w${w.fort ? " acc" : ""}">${esc(w.txt)}</span>`).join("")}</div>`).join("\n");
  const marque = spec.marque ? `<div id="marque" class="verre pilule">${spec.marque.visuel ? visuel(spec.marque.visuel, 50, { nu: true }) : ""}<span>${esc(spec.marque.nom ?? "")}</span></div>` : "";
  const htmlFin = fin ? `<section class="scene" id="fin">${rush ? `<div class="fond-scene">${taches}</div>` : ""}<div class="cam"><div class="zoom">
      ${fin.visuel ?? spec.marque?.visuel ? `<div class="abs" id="fin-v" style="${boite(540, 830, 230, 230)}">${visuel(fin.visuel ?? spec.marque.visuel, 230)}</div>` : ""}
      <div class="abs fin-t centre" id="fin-t" style="left:60px;right:60px;top:990px;height:100px">${riche(fin.texte ?? spec.marque?.nom ?? "")}</div>
      ${fin.sous ? `<div class="abs fin-s centre" id="fin-s" style="left:60px;right:60px;top:1100px;height:60px">${riche(fin.sous)}</div>` : ""}</div></div></section>` : "";
  const couleurs = spec.couleurs ? `:root { ${Object.entries({ accent: "--accent", accent2: "--accent-2", fond: "--fond", encre: "--encre" }).filter(([k]) => spec.couleurs[k]).map(([k, v]) => `${v}: ${spec.couleurs[k]};`).join(" ")} }` : "";
  const js = [
    rush ? "" : TACHES.map((t, k) => `tl.fromTo("#fond .t${k}", { x: 0, y: 0, scale: 1 }, { x: ${k % 2 ? -90 : 110}, y: ${k < 2 ? 120 : -110}, scale: ${k % 2 ? 1.18 : 0.88}, duration: ${DUREE}, ease: "sine.inOut" }, 0);`).join("\n"),
    spec.marque ? `entre("#marque", 0.5, "monte"); ${fin ? `sort("#marque", ${arr(tFin - 0.4)}, { y: 30, scale: 0.9 });` : ""}` : "",
    caps.map((cp) => `legende("${cp.id}", ${cp.t0}, ${cp.t1}, ${JSON.stringify(cp.mots.flatMap((w, k) => (w.fort ? [[k, w.t]] : [])))});`).join("\n"),
    scenes.map((s) => `scene("${s.id}", ${s.debut}, ${s.fin}, "${s.entree}", "${s.sortie}");\n${s.js ?? ""}`).join("\n"),
    pousses.map(([sid, t]) => `pousse("#${sid} > .cam > .zoom", ${t}, 1.035);`).join("\n"),
    fin ? `scene("fin", ${arr(tFin - 0.2)}, ${DUREE}, "zoom", "aucune"); entre("#fin-v", ${arr(tFin)}, "pop"); entre("#fin-t", ${arr(tFin + 0.15)}, "monte"); entre("#fin-s", ${arr(tFin + 0.3)}, "monte");` : "",
  ].join("\n");
  const html = `<!doctype html>
<!-- ${esc(spec.titre ?? id)} · fabriqué par claude-code-ai-video (style blanc) -->
<html lang="${spec.langue ?? "fr"}">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1080, height=1920" />
    <title>${esc(spec.titre ?? id)}</title>
    <script src="gsap.min.js"></script>
    <style>
${readFileSync(join(SKILL, "assets", "style.css"), "utf8")}
${couleurs}
${scenes.map((s) => s.css ?? "").join("\n")}
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="video" data-start="0" data-duration="${DUREE}" data-width="1080" data-height="1920">
      <audio id="son" src="son.wav" data-start="0" data-duration="${DUREE}" data-track-index="1" data-volume="1"></audio>
      ${rush ? `<video id="rush" src="${media(spec.rush)}" muted playsinline data-start="0" data-duration="${DUREE}" data-track-index="2"></video>` : ""}
      <div id="film" class="clip" data-start="0" data-duration="${DUREE}" data-track-index="0">
        ${rush ? "" : `<div id="fond">${taches}</div>`}
${htmlScenes}
${htmlFin}
        <div id="legendes">
${htmlCaps}
        </div>
        ${marque}
      </div>
    </div>
    <script>
${RUNTIME}
${js}
tl.set({}, {}, ${DUREE});
window.__timelines["video"] = tl;
    </script>
  </body>
</html>
`;
  writeFileSync(join(PROJET, "index.html"), html);
  writeFileSync(join(PROJET, "meta.json"), JSON.stringify({ id: "video", name: id }) + "\n");
  copyFileSync(await gsap(), join(PROJET, "gsap.min.js"));
  for (const f of ["Inter.ttf", "InstrumentSerif-Italic.ttf"]) copyFileSync(join(SKILL, "assets", "fonts", f), join(PROJET, "fonts", f));

  // ---------- 6. le son : voix à -16 LUFS, musique qui s'efface sous la voix, souffles aux changements de scène ----------
  const tmp = join(TRAVAIL, "son");
  mkdirSync(tmp, { recursive: true });
  const voix = join(TRAVAIL, "voix.wav");
  const entrees = ["-i", voix];
  const st = "aresample=48000,aformat=channel_layouts=stereo";
  const filtres = [`[0:a]${st},volume=${(-16 - lufs(voix)).toFixed(2)}dB[v0]`];
  let parole = "[v0]";
  if (finAudio) {
    entrees.push("-i", finAudio);
    const ms = Math.round(tFin * 1000);
    filtres.push(`[1:a]${st},volume=${(-16 - lufs(finAudio)).toFixed(2)}dB,adelay=${ms}|${ms}[fa]`, `[v0][fa]amix=inputs=2:normalize=0[v1]`);
    parole = "[v1]";
  }
  const pistes = [];
  if (spec.musique) {
    const mus = resolve(BASE, spec.musique);
    const idx = entrees.filter((x) => x === "-i").length;
    entrees.push("-stream_loop", "-1", "-i", mus);
    filtres.push(`${parole}apad=whole_dur=${DUREE},asplit=2[voix][cle]`,
      `[${idx}:a]${st},atrim=0:${DUREE},volume=${(-27 - lufs(mus)).toFixed(2)}dB,afade=t=in:st=0:d=0.8,afade=t=out:st=${arr(DUREE - 2.2)}:d=2.1[mus]`,
      `[mus][cle]sidechaincompress=threshold=0.02:ratio=7:attack=15:release=380:makeup=1[musd]`);
    pistes.push("[voix]", "[musd]");
  } else pistes.push(parole);
  if (spec.sons !== false) {
    const souffle = join(CACHE, "souffle.wav");
    if (!existsSync(souffle)) {
      mkdirSync(CACHE, { recursive: true });
      lancer("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "anoisesrc=d=0.5:c=pink:a=0.7:seed=7", "-af", "highpass=f=500,lowpass=f=6000,afade=t=in:d=0.22,afade=t=out:st=0.22:d=0.28", "-ar", "48000", souffle]);
    }
    for (const s of [...scenes.filter((x) => x.debut > 0.1), ...(fin ? [{ debut: tFin - 0.2 }] : [])]) {
      const idx = entrees.filter((x) => x === "-i").length, ms = Math.round(Math.max(0, s.debut - 0.12) * 1000);
      entrees.push("-i", souffle);
      filtres.push(`[${idx}:a]${st},volume=0.14,adelay=${ms}|${ms}[b${idx}]`);
      pistes.push(`[b${idx}]`);
    }
  }
  filtres.push(`${pistes.join("")}amix=inputs=${pistes.length}:normalize=0,apad=whole_dur=${DUREE},atrim=0:${DUREE},loudnorm=I=-14:TP=-1.2:LRA=9[out]`);
  lancer("ffmpeg", ["-v", "error", "-y", ...entrees, "-filter_complex", filtres.join(";"), "-map", "[out]", "-ar", "48000", join(PROJET, "son.wav")]);

  // ---------- 7. contrôle, planche, rendu ----------
  const milieux = scenes.map((s) => arr(Math.min(s.fin - 0.4, Math.max(s.debut + 1.2, (s.debut + s.fin) / 2))));
  const ligne = [`${id} : ${DUREE.toFixed(1)} s · ${phrases.length} phrases · ${scenes.length} scènes · ${caps.length} sous-titres`];
  if (!option("sans-controle")) ligne.push(controler(PROJET, [...milieux, ...scenes.map((s) => arr(Math.max(s.debut + 0.8, s.fin - 0.6))), ...caps.map((cp) => arr((cp.t0 + cp.t1) / 2))].slice(0, 70)));
  const finsScenes = scenes.map((s) => arr(Math.max(s.debut + 0.8, s.fin - 0.6)));
  if (!option("sans-planche")) ligne.push(planche(PROJET, [0, ...finsScenes, ...(fin ? [arr(DUREE - 0.5)] : [])], join(RENDUS, `${id}-planche.jpg`), join(RENDUS, `${id}-couverture.jpg`)));
  if (spec.publication) writeFileSync(join(RENDUS, `${id}.txt`), publication(spec.publication));
  for (const a of avis) console.log(`  ⚠ ${a}`);
  if (option("rendu")) {
    const mp4 = join(RENDUS, `${id}.mp4`);
    lancer("npx", ["--yes", HF, "render", PROJET, "-o", mp4, "-q", option("brouillon") ? "draft" : "delivery", "--fps", "30", "--quiet"], { stdio: ["ignore", "ignore", "pipe"] });
    ligne.push(`✓ ${mp4}`);
  }
  console.log(ligne.join("\n  "));
}

// ---------- outils ----------
function verifier(spec, base) {
  if (!Array.isArray(spec.phrases) || !spec.phrases.length) throw new Error("« phrases » manque (au moins une phrase : { \"texte\": \"…\" })");
  spec.phrases.forEach((p, i) => {
    if (!p.texte?.trim()) throw new Error(`phrase ${i + 1} : « texte » vide`);
    const s = p.scene;
    if (s && s !== "suite" && !TYPES.includes(s.type)) throw new Error(`phrase ${i + 1} : type de scène « ${s?.type} » inconnu (${TYPES.join(", ")})`);
  });
  if (spec.phrases[0].scene === undefined && !spec.rush) throw new Error("la phrase 1 doit avoir une scène (l'image 1 est l'affiche : un « titre » en général)");
  for (const f of [spec.rush, spec.musique, spec.voix?.fichier, spec.fin?.audio].filter(Boolean)) if (!existsSync(resolve(base, f))) throw new Error(`fichier introuvable : ${f}`);
  const mots = spec.phrases.reduce((n, p) => n + jetons(p.texte).length, 0);
  if (mots > 230) console.log(`  ⚠ ${mots} mots : plus de 90 s de voix, c'est long pour une vidéo courte`);
}

function lireVisuel(v) {
  const m = v.match(/^(logo|icone|emoji):(.+)$/);
  if (m) {
    if (m[1] === "icone" && !ICONES.includes(m[2])) throw new Error(`icône « ${m[2]} » inconnue (connues : ${ICONES.join(", ")})`);
    return { [m[1]]: m[2] };
  }
  if (/[/.]/.test(v)) return { image: v };
  throw new Error(`visuel « ${v} » : écrivez logo:nom, icone:nom, emoji:🔑 ou un chemin d'image`);
}

function collecterLogos(x, acc = new Set()) {
  if (typeof x === "string") { const m = x.match(/^logo:(.+)$/); if (m) acc.add(m[1]); }
  else if (Array.isArray(x)) x.forEach((y) => collecterLogos(y, acc));
  else if (x && typeof x === "object") {
    if (typeof x.logo === "string" && !/[:/]/.test(x.logo)) acc.add(x.logo);
    // « marques » accepte des noms nus : ["bitcoin", "ethereum"]
    if (Array.isArray(x.marques)) x.marques.forEach((m) => { if (typeof m === "string" && !/[:/]/.test(m)) acc.add(m); });
    Object.values(x).forEach((y) => collecterLogos(y, acc));
  }
  return acc;
}

// la transcription mot à mot d'une voix enregistrée (whisper, en local), gardée en cache
function transcrire(wav, travail, langue) {
  const cle = `${statSync(wav).size}`;
  const sortie = join(travail, `transcription-${cle}.json`);
  if (!existsSync(sortie)) {
    const dir = join(travail, "transcription");
    rmSync(dir, { recursive: true, force: true });
    lancer("npx", ["--yes", HF, "transcribe", wav, "--model", "large-v3-turbo", "--language", langue, "--dir", dir, "--json"], { stdio: ["ignore", "ignore", "pipe"] });
    copyFileSync(join(dir, "transcript.json"), sortie);
  }
  return JSON.parse(readFileSync(sortie, "utf8")).map((w) => ({ texte: w.text.trim(), debut: w.start, fin: w.end }));
}

// le contrôle HyperFrames (débordements, contrastes, erreurs d'exécution), résumé en quelques lignes
function controler(projet, instants) {
  const r = spawnSync("npx", ["--yes", HF, "check", projet, "--json", "--at", instants.join(","), "--no-contrast"], { encoding: "utf8", env: ENV, maxBuffer: 1 << 28 });
  let rapport;
  try { rapport = JSON.parse(r.stdout.slice(r.stdout.indexOf("{"))); } catch { return `contrôle illisible : ${(r.stderr || r.stdout).trim().split("\n").slice(-2).join(" ")}`; }
  const problemes = [];
  const fouille = (x) => {
    if (Array.isArray(x)) x.forEach(fouille);
    else if (x && typeof x === "object") {
      if ((x.severity === "error" || x.severity === "warning") && (x.message || x.code) && !IGNORES.has(x.code) && !/rouleau|odo|tache/.test(x.selector ?? "")) problemes.push(x);
      else Object.values(x).forEach(fouille);
    }
  };
  fouille(rapport);
  const vus = new Set();
  const lignes = problemes.filter((p) => {
    const k = `${p.code}|${p.selector ?? p.element ?? ""}`;
    return !vus.has(k) && vus.add(k);
  }).map((p) => `${p.severity === "error" ? "✗" : "⚠"} ${p.code ?? ""} ${p.selector ?? p.element ?? ""} ${p.time !== undefined ? `@${p.time}s ` : ""}${String(p.message ?? "").slice(0, 160)}`.replace(/\s+/g, " ").trim());
  const erreurs = problemes.filter((p) => p.severity === "error").length;
  return lignes.length ? `contrôle : ${erreurs} erreur(s), ${lignes.length - erreurs} avertissement(s)\n    ${lignes.slice(0, 15).join("\n    ")}` : "contrôle : aucun débordement, aucune erreur";
}

// une seule image de contrôle (les moments clés en vignettes), et la couverture (l'image 1)
function planche(projet, instants, jpg, couverture) {
  const dir = join(projet, "snapshots");
  rmSync(dir, { recursive: true, force: true });
  const r = spawnSync("npx", ["--yes", HF, "snapshot", projet, "--at", instants.map((t) => t.toFixed(2)).join(","), "--no-end", "--describe", "false", "-o", dir], { encoding: "utf8", env: ENV });
  const pngs = existsSync(dir) ? readdirSync(dir).filter((f) => extname(f) === ".png").sort((a, b) => statSync(join(dir, a)).mtimeMs - statSync(join(dir, b)).mtimeMs || a.localeCompare(b, "en", { numeric: true })) : [];
  if (!pngs.length) return `planche impossible : ${(r.stderr || r.stdout).trim().split("\n").slice(-2).join(" ")}`;
  const seq = join(dir, "seq");
  mkdirSync(seq, { recursive: true });
  pngs.forEach((f, k) => copyFileSync(join(dir, f), join(seq, `${String(k).padStart(3, "0")}.png`)));
  const cols = Math.min(6, pngs.length);
  lancer("ffmpeg", ["-v", "error", "-y", "-framerate", "1", "-i", join(seq, "%03d.png"), "-vf", `scale=270:-1,tile=${cols}x${Math.ceil(pngs.length / cols)}:padding=6:color=white`, "-frames:v", "1", "-q:v", "4", jpg]);
  lancer("ffmpeg", ["-v", "error", "-y", "-i", join(seq, "000.png"), "-q:v", "2", couverture]);
  return `planche : ${jpg}`;
}

function publication(p) {
  const tags = (p.hashtags ?? []).map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ");
  return [p.titre ? `TITRE : ${p.titre}` : "", p.legende ? `LÉGENDE :\n${p.legende}${tags ? `\n\n${tags}` : ""}` : "", p.commentaire ? `COMMENTAIRE ÉPINGLÉ :\n${p.commentaire}` : ""].filter(Boolean).join("\n\n") + "\n";
}
