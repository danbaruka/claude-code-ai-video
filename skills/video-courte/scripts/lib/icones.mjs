// Icônes au trait (grille 24 × 24), dessinées pour ce skill : libres comme le reste du dépôt.
// ic("cle", 64, "var(--accent)") ; la liste des noms est dans references/scenes.md.

const T = {
  alerte: `<path class="t" d="M12 3.5L2.8 19.5h18.4z"/><path class="t" d="M12 10v4.2M12 17h.01"/>`,
  appareil: `<rect class="t" x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path class="t" d="M10.5 18.5h3"/>`,
  avion: `<path class="t" d="M21.5 3.5L10.5 13.5M21.5 3.5l-7 18-4-8-8-4z"/>`,
  banque: `<path class="t" d="M3 9.5L12 4l9 5.5M4.5 20h15M6 10.5v7M10 10.5v7M14 10.5v7M18 10.5v7"/>`,
  bouclier: `<path class="t" d="M12 3l7.5 3v5.5c0 4.6-3.2 8-7.5 9.5-4.3-1.5-7.5-4.9-7.5-9.5V6z"/>`,
  bulle: `<path class="t" d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-8l-5 4v-4H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/>`,
  cadenas: `<rect class="t" x="4.5" y="10.5" width="15" height="10.5" rx="2.4"/><path class="t" d="M8 10.5V7.5a4 4 0 0 1 8 0v3M12 14.5v2.5"/>`,
  calendrier: `<rect class="t" x="3.5" y="5" width="17" height="15.5" rx="2.4"/><path class="t" d="M3.5 10h17M8 3v4M16 3v4"/>`,
  carte: `<rect class="t" x="2.5" y="5.5" width="19" height="13" rx="2.4"/><path class="t" d="M2.5 10h19M6 15h4"/>`,
  chaine: `<path class="t" d="M10 14a4.2 4.2 0 0 0 6 0l3-3a4.2 4.2 0 0 0-6-6l-1 1"/><path class="t" d="M14 10a4.2 4.2 0 0 0-6 0l-3 3a4.2 4.2 0 0 0 6 6l1-1"/>`,
  cle: `<circle class="t" cx="8" cy="15" r="4.5"/><path class="t" d="M11.2 11.8L20 3M16.5 6.5l2.5 2.5M14 9l2 2"/>`,
  cloche: `<path class="t" d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path class="t" d="M10 20.5a2 2 0 0 0 4 0"/>`,
  code: `<path class="t" d="M8.5 7L3.5 12l5 5M15.5 7l5 5-5 5M13.5 4.5l-3 15"/>`,
  coche: `<path class="t" d="M5 12.5l4.5 4.5L19 7.5"/>`,
  coeur: `<path class="t" d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.2a4.3 4.3 0 0 1 7.5 2.6C19.5 15.4 12 20 12 20z"/>`,
  croix: `<path class="t" d="M7 7l10 10M17 7L7 17"/>`,
  cube: `<path class="t" d="M12 2.8l8 4.6v9.2l-8 4.6-8-4.6V7.4z"/><path class="t" d="M4 7.4l8 4.6 8-4.6M12 12v9.2"/>`,
  dollar: `<path class="t" d="M12 2.5v19M16.5 6.5c-.8-1.3-2.5-2-4.5-2-2.6 0-4.5 1.3-4.5 3.4 0 4.8 9.5 2.4 9.5 7.6 0 2.1-2 3.6-4.8 3.6-2.2 0-4-.9-4.8-2.4"/>`,
  doc: `<path class="t" d="M6 3h8.5L19 7.5V21H6z"/><path class="t" d="M14 3v5h5M9 13h6M9 16.5h6"/>`,
  eclair: `<path class="t" d="M13 2.5L4.5 13.5H12l-1 8 8.5-11H12z"/>`,
  envoi: `<path class="t" d="M12 19V6M6 11.5l6-6 6 6"/>`,
  etincelle: `<path class="t" d="M12 3l1.8 5.4L19 10.2l-5.2 1.8L12 17.4l-1.8-5.4L5 10.2l5.2-1.8z"/>`,
  fusee: `<path class="t" d="M12 15l-3-3c1.5-4.6 4.6-8 10.5-8.5-.5 5.9-3.9 9-8.5 10.5z"/><path class="t" d="M9 12l-4 .5L3.5 15l4 .5M12 15l-.5 4L9 20.5l-.5-4M15 9.2h.01"/>`,
  globe: `<circle class="t" cx="12" cy="12" r="9"/><path class="t" d="M3 12h18M12 3c2.6 2.6 3.8 5.6 3.8 9s-1.2 6.4-3.8 9c-2.6-2.6-3.8-5.6-3.8-9S9.4 5.6 12 3z"/>`,
  graphique: `<path class="t" d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6"/>`,
  hausse: `<path class="t" d="M3 17l6-6 4 4 8-8"/><path class="t" d="M15 7h6v6"/>`,
  baisse: `<path class="t" d="M3 7l6 6 4-4 8 8"/><path class="t" d="M15 17h6v-6"/>`,
  horloge: `<circle class="t" cx="12" cy="12" r="9"/><path class="t" d="M12 7v5.5l3.5 2"/>`,
  lien: `<path class="t" d="M9.5 14.5l5-5M8 11l-2.2 2.2a3.6 3.6 0 0 0 5 5L13 16M16 13l2.2-2.2a3.6 3.6 0 0 0-5-5L11 8"/>`,
  loupe: `<circle class="t" cx="10.5" cy="10.5" r="6.5"/><path class="t" d="M15.5 15.5L21 21"/>`,
  micro: `<rect class="t" x="9" y="2.5" width="6" height="11.5" rx="3"/><path class="t" d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>`,
  oeil: `<path class="t" d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle class="t" cx="12" cy="12" r="3.2"/>`,
  ordinateur: `<rect class="t" x="3" y="4.5" width="18" height="12" rx="2"/><path class="t" d="M8 20h8M12 16.5V20"/>`,
  personne: `<circle class="t" cx="12" cy="8.5" r="3.6"/><path class="t" d="M5 20c.8-3.8 3.6-5.8 7-5.8s6.2 2 7 5.8"/>`,
  personnes: `<circle class="t" cx="9" cy="8" r="3.2"/><path class="t" d="M3 19.5c.6-3.4 3-5.2 6-5.2s5.4 1.8 6 5.2"/><circle class="t" cx="17" cy="9" r="2.6"/><path class="t" d="M16.2 14c2.5.2 4.2 1.8 4.8 4.6"/>`,
  piece: `<circle class="t" cx="12" cy="12" r="9"/><circle class="t" cx="12" cy="12" r="5.5"/><path class="t" d="M12 9.5v5"/>`,
  portefeuille: `<path class="t" d="M4 7.5h14.5a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 18V6a2.5 2.5 0 0 1 2.5-2.5H17v4"/><path class="t" d="M16 14h.01"/>`,
  robot: `<rect class="t" x="4.5" y="7.5" width="15" height="12" rx="3"/><path class="t" d="M12 7.5V4M9 12.5h.01M15 12.5h.01M9.5 16h5M2.5 12v3M21.5 12v3"/>`,
  serveur: `<rect class="t" x="3.5" y="4" width="17" height="7" rx="1.8"/><rect class="t" x="3.5" y="13" width="17" height="7" rx="1.8"/><path class="t" d="M7 7.5h.01M7 16.5h.01"/>`,
  soleil: `<circle class="t" cx="12" cy="12" r="4.2"/><path class="t" d="M12 2.5v2M12 19.5v2M4.6 4.6L6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>`,
  telechargement: `<path class="t" d="M12 3.5v12M7 11l5 5 5-5M4.5 20.5h15"/>`,
  terminal: `<rect class="t" x="2.5" y="4" width="19" height="16" rx="2.4"/><path class="t" d="M6.5 9.5l3 2.5-3 2.5M12 15h5"/>`,
  trophee: `<path class="t" d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v3.5M8.5 20.5h7M9.5 17.5h5v3h-5z"/>`,
  utilisateur: `<circle class="t" cx="12" cy="12" r="9"/><circle class="t" cx="12" cy="10" r="3.2"/><path class="t" d="M6.5 18.2c1.2-2.2 3.2-3.4 5.5-3.4s4.3 1.2 5.5 3.4"/>`,
  video: `<rect class="t" x="2.5" y="5.5" width="13.5" height="13" rx="2.4"/><path class="t" d="M16 10l5.5-3v10L16 14"/>`,
};

export const ICONES = Object.keys(T);

export function ic(nom, t = 48, couleur = "currentColor", ep = 2) {
  if (!T[nom]) throw new Error(`icône inconnue : « ${nom} » (connues : ${ICONES.join(", ")})`);
  return `<svg class="ic" viewBox="0 0 24 24" width="${t}" height="${t}" style="color:${couleur}"><g stroke-width="${ep}">${T[nom]}</g></svg>`;
}
