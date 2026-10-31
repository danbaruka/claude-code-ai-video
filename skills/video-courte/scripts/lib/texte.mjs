// Le texte d'une vidéo : les mots affichés, leur calage sur la voix, et le découpage en sous-titres.

export const arr = (x) => Math.round(x * 1000) / 1000;
export const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

// Le texte que la voix doit lire : sans les étoiles, avec la prononciation demandée (« AI » → « aï »).
export function texteVoix(texte, prononcer = {}) {
  let t = texte.replace(/\*/g, "");
  for (const [mot, dit] of Object.entries(prononcer)) {
    const motif = mot.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    t = t.replace(new RegExp(`(?<![\\p{L}\\p{N}])${motif}(?![\\p{L}\\p{N}])`, "gu"), dit);
  }
  return t;
}

// Les mots affichés d'une phrase. *mot* (ou *deux mots*) marque le mot fort ; la ponctuation seule reste collée
// au mot d'avant (« vraiment ? »), un guillemet ouvrant au mot d'après.
export function jetons(texte) {
  const out = [];
  let dedans = false, avant = "";
  for (const brut of texte.trim().split(/\s+/)) {
    const etoiles = (brut.match(/\*/g) ?? []).length;
    const fort = dedans || etoiles > 0;
    if (etoiles % 2) dedans = !dedans;
    const t = brut.replace(/\*/g, "");
    if (!t) continue;
    if (!/[\p{L}\p{N}]/u.test(t)) {
      if (/^[«(“"]+$/.test(t)) { avant += t + (t === "«" ? " " : ""); continue; }
      if (out.length) { out.at(-1).texte += (/^[?!:;»]/.test(t) ? " " : " ") + t; continue; }
    }
    out.push({ texte: avant + t, fort });
    avant = "";
  }
  return out;
}

// Cale les mots affichés sur les mots minutés (voix de synthèse ou transcription) par un alignement global :
// un mot de la voix peut manquer (« 100 jours » lu d'un bloc), un mot de la transcription peut être en trop (« euh »).
// Les mots affichés sans partenaire prennent un temps interpolé entre leurs voisins.
export function caler(toks, mots) {
  const n = toks.length, m = mots.length;
  const a = toks.map((t) => norm(t.texte)), b = mots.map((w) => norm(w.texte));
  const proche = (x, y) => x && y && (x === y ? 3 : Math.min(x.length, y.length) >= 2 && (x.startsWith(y) || y.startsWith(x)) ? 1 : -2);
  const S = Array.from({ length: n + 1 }, () => new Float64Array(m + 1));
  const P = Array.from({ length: n + 1 }, () => new Uint8Array(m + 1));
  for (let i = 1; i <= n; i++) { S[i][0] = -i; P[i][0] = 1; }
  for (let j = 1; j <= m; j++) { S[0][j] = -0.5 * j; P[0][j] = 2; }
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const d = S[i - 1][j - 1] + (proche(a[i - 1], b[j - 1]) || -2), h = S[i - 1][j] - 1, g = S[i][j - 1] - 0.5;
      if (d >= h && d >= g) { S[i][j] = d; P[i][j] = 0; } else if (h >= g) { S[i][j] = h; P[i][j] = 1; } else { S[i][j] = g; P[i][j] = 2; }
    }
  }
  const lien = new Array(n).fill(-1);
  for (let i = n, j = m; i > 0 || j > 0;) {
    const p = i && j ? P[i][j] : i ? 1 : 2;
    if (p === 0) { if (proche(a[i - 1], b[j - 1]) > 0) lien[i - 1] = j - 1; i--; j--; } else if (p === 1) i--; else j--;
  }
  const out = toks.map((t, i) => (lien[i] >= 0 ? { ...t, debut: mots[lien[i]].debut, fin: mots[lien[i]].fin } : { ...t }));
  for (let i = 0; i < n; i++) {
    if (out[i].debut !== undefined) continue;
    let k = i;
    while (k < n && out[k].debut === undefined) k++;
    const t0 = i > 0 ? out[i - 1].fin : (mots[0]?.debut ?? 0);
    const t1 = k < n ? out[k].debut : Math.max(t0 + 0.3 * (k - i), mots.at(-1)?.fin ?? t0);
    const pas = (t1 - t0) / (k - i);
    for (let q = i; q < k; q++) { out[q].debut = arr(t0 + pas * (q - i)); out[q].fin = arr(t0 + pas * (q - i + 1)); }
  }
  return out;
}

// ---------- les sous-titres ----------
// Coupés par groupes de sens (« ce que vous lui donnez »), jamais au milieu d'un nom (« Claude Code », « 10 000 »),
// et un morceau ne finit pas sur un mot qui ouvre un groupe (« ce », « les »).
const DEBUTS = new Set(["ce", "ceux", "qui", "que", "quelles", "quels", "les", "des", "de", "du", "a", "au", "aux", "pour", "avec",
  "dans", "sans", "si", "ni", "et", "ou", "mais", "chez", "sur", "en", "la", "le", "une", "un", "mes", "vos", "votre", "ton", "ta",
  "tes", "ma", "mon", "ses", "son", "sa", "comme", "quand", "parce", "alors", "puis", "ne", "the", "a", "to", "of", "and", "your"]);
const ouvre = (w) => DEBUTS.has(norm(w.texte)) || /^(l|d|qu|n|j|s|c)['’]/i.test(w.texte);
const petit = (w) => DEBUTS.has(norm(w.texte));
const finDePhrase = (w) => /[,.:;?!…]$/.test(w.texte);
const colles = (x, y) => (/^\d/.test(norm(x.texte)) && /^\d{3}/.test(norm(y.texte))) || /^[A-ZÉ]/.test(y.texte) && /^[A-ZÉ]/.test(x.texte) && !finDePhrase(x);
const MAXC = 20, MAXW = 4, CLAUSE = 26;

function morceaux(mots) {
  const toks = [];
  for (const w of mots) {
    const avant = toks.at(-1);
    if (avant && colles(avant, w) && (avant.texte + " " + w.texte).length <= MAXC) { avant.texte += ` ${w.texte}`; avant.fin = w.fin; avant.fort ||= w.fort; continue; }
    toks.push({ ...w });
  }
  const long = (a) => a.map((x) => x.texte).join(" ").length;
  const res = [];
  let cur = [];
  for (const w of toks) {
    if (cur.length) {
      const avec = [...cur, w];
      const tient = long(avec) <= MAXC && avec.length <= MAXW;
      const clause = finDePhrase(w) && long(avec) <= CLAUSE && avec.length <= 5;
      if (!tient && !clause) {
        let j = cur.length;
        if (!ouvre(w)) for (let k = cur.length - 1; k >= 2; k--) if (ouvre(cur[k])) { j = k; break; }
        while (j > 1 && petit(cur[j - 1])) j--;
        res.push(cur.slice(0, j));
        cur = cur.slice(j);
        const reste = [...cur, w];
        if (cur.length && !(long(reste) <= MAXC && reste.length <= MAXW) && !(finDePhrase(w) && long(reste) <= CLAUSE)) { res.push(cur); cur = []; }
      }
    }
    cur.push(w);
    if (finDePhrase(w)) { res.push(cur); cur = []; }
  }
  if (cur.length) res.push(cur);
  if (res.length > 1 && res.at(-1).length === 1 && res.at(-1)[0].texte.length <= 4 && long([...res.at(-2), ...res.at(-1)]) <= CLAUSE) res.at(-2).push(...res.pop());
  // un morceau affiché moins de 0,45 s rejoint le suivant s'il reste court : chaque sous-titre doit pouvoir se lire
  for (let j = 0; j < res.length - 1; j++) {
    if (res[j + 1][0].debut - res[j][0].debut < 0.45 && long([...res[j], ...res[j + 1]]) <= CLAUSE) { res[j].push(...res.splice(j + 1, 1)[0]); j--; }
  }
  return res;
}

// phrases : [{ mots: [{ texte, fort, debut, fin }], debut, fin, sansLegende }] → les sous-titres minutés
export function legendes(phrases) {
  const caps = [];
  phrases.forEach((ph, i) => {
    if (ph.sansLegende || !ph.mots.length) return;
    const mx = morceaux(ph.mots);
    mx.forEach((mo, j) => {
      const t0 = caps.length === 0 && mo[0].debut < 0.6 ? 0 : arr(Math.max(0, mo[0].debut - 0.06));
      const suite = phrases[i + 1]?.mots[0]?.debut;
      const suivant = mx[j + 1]?.[0].debut ?? (suite !== undefined && suite - ph.fin < 1.1 ? suite : ph.fin + 0.45);
      const mots = mo.map((w) => ({ txt: w.texte.replace(/[,.:;…]+$/, ""), fort: !!w.fort, t: arr(w.debut) }));
      const lg = mots.map((w) => w.txt).join(" ").length;
      caps.push({ id: `c${caps.length}`, t0, t1: arr(suivant - 0.06), taille: Math.max(68, Math.min(116, Math.floor(950 / (0.58 * Math.max(6, lg))))), mots });
    });
  });
  return caps;
}
