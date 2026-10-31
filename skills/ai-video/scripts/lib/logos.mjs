// Les vrais logos des marques, gardés en cache sur la machine :
//  1. Simple Icons (CC0, simpleicons.org) : plus de 3 000 marques, le glyphe dans la couleur de la marque ;
//  2. web3icons (MIT, github.com/0xa3k5/web3icons) : wallets, exchanges, réseaux et jetons crypto, en couleurs
//     (MetaMask, Ledger, Phantom, Trust, Binance, BTC, USDT…).
// « logo:bitcoin » ; un fichier local (« medias/marque.svg ») marche aussi.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const SI = "https://cdn.jsdelivr.net/npm/simple-icons@13.21.0";
const W3 = "https://cdn.jsdelivr.net/npm/@web3icons/core@4.0.58/dist/svgs";
export const CACHE = join(process.env.XDG_CACHE_HOME ?? join(homedir(), ".cache"), "ai-video");

// le slug d'une marque, comme Simple Icons le calcule depuis son nom (« Trust Wallet » → « trustwallet »)
const REMPLACE = { "+": "plus", ".": "dot", "&": "and", đ: "d", ħ: "h", ı: "i", ĸ: "k", ŀ: "l", ł: "l", ß: "ss", ŧ: "t" };
export const slug = (nom) => nom.toLowerCase().replace(/[+.&đħıĸŀłßŧ]/g, (c) => REMPLACE[c]).normalize("NFD").replace(/[^a-z\d]/g, "");

async function telecharger(url, fichier) {
  if (existsSync(fichier)) return readFileSync(fichier, "utf8");
  if (existsSync(`${fichier}.absent`)) return null;
  mkdirSync(join(fichier, ".."), { recursive: true });
  const r = await fetch(url).catch(() => null);
  if (!r?.ok) { if (r?.status === 404) writeFileSync(`${fichier}.absent`, ""); return null; }
  const txt = await r.text();
  writeFileSync(fichier, txt);
  return txt;
}

let couleurs = null;
async function couleur(s) {
  if (!couleurs) {
    const brut = await telecharger(`${SI}/_data/simple-icons.json`, join(CACHE, "simple-icons.json"));
    const liste = brut ? JSON.parse(brut) : [];
    couleurs = Object.fromEntries((Array.isArray(liste) ? liste : liste.icons ?? []).map((x) => [x.slug ?? slug(x.title), `#${x.hex}`]));
  }
  return couleurs[s];
}

// → { d: [tracés], hex } (glyphe d'une couleur), { svg } (logo en couleurs) ou null
export async function logoMarque(nom) {
  const s = slug(nom);
  const si = await telecharger(`${SI}/icons/${s}.svg`, join(CACHE, "logos", "si", `${s}.svg`));
  if (si?.includes("<path")) {
    let hex = (await couleur(s)) ?? "#111216";
    // une couleur trop claire disparaît sur le verre blanc : on la fonce
    const [r, g, b] = [1, 3, 5].map((k) => parseInt(hex.slice(k, k + 2), 16));
    if (0.299 * r + 0.587 * g + 0.114 * b > 205) hex = "#111216";
    return { d: [...si.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map((m) => m[1]), hex };
  }
  // web3icons : « metamask », « trust » (Trust Wallet), « BTC », « ethereum »…
  const essais = [["wallets", s.replace(/wallet$/, "")], ["wallets", s], ["exchanges", s], ["networks", s], ["tokens", nom.toUpperCase().replace(/[^A-Z0-9]/g, "")]];
  for (const [famille, n] of essais) {
    const js = await telecharger(`${W3}/${famille}/branded/${n}.svg.js`, join(CACHE, "logos", "w3", famille, `${n}.js`));
    const m = js?.match(/'(<svg[\s\S]*?<\/svg>)[^']*'/);
    if (m) return { svg: m[1].replace(/\\n/g, "").replace(/\s+/g, " ") };
  }
  return null;
}

export async function gsap() {
  const f = join(CACHE, "gsap-3.14.2.min.js");
  const txt = await telecharger("https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js", f);
  if (!txt) throw new Error("GSAP introuvable : vérifiez la connexion pour le premier lancement");
  return f;
}
