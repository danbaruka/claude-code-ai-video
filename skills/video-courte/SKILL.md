---
name: video-courte
description: Fabrique des vidéos verticales courtes (TikTok, Reels, YouTube Shorts, 30 à 90 s) dans un style blanc net et animé, à partir d'un seul fichier video.json, en très peu de tokens. Trois modes. « Généré » ajoute une voix de synthèse gratuite et du motion design. « Images » met vos captures, photos et pages web dans un vrai iPhone, un navigateur ou en plein écran. « Filmé » ajoute des sous-titres et des scènes animées sur un rush. Le skill écrit le script, fait la voix, cale les sous-titres mot par mot, anime chaque scène, pose musique et bruitages, vérifie qu'aucun texte ne déborde et rend le MP4. À utiliser dès qu'on demande une vidéo courte, un short, un reel, un TikTok, une vidéo explicative animée, un lot de vidéos, une vidéo sans tournage, des sous-titres animés, ou de produire beaucoup de vidéos vite et pour pas cher, même sans le mot « skill ».
---

# video-courte

Une vidéo = **un fichier `video.json`** : les phrases dites, et pour chaque idée forte, une scène choisie dans un catalogue de 16 types.
Le script `scripts/fabriquer.mjs` fait tout le reste. Vous n'écrivez **jamais** de HTML, de CSS ni d'animation à la main, sauf pour le moment unique qui le mérite (type `html`).

```
idée ─► script (phrases) ─► video.json ─► fabriquer.mjs ─► planche.jpg (relire) ─► --rendu ─► MP4 + couverture + légende
```

## Avant la première vidéo (une seule fois)

```sh
sh <skill>/scripts/installer.sh      # vérifie node ≥ 18, ffmpeg, python3 ; installe edge-tts dans <skill>/.venv
```

`<skill>` est le dossier de ce fichier. Le premier rendu télécharge HyperFrames (npx), GSAP et les logos, puis tout est en cache.

## Le déroulé

1. **Le sujet en une phrase.** Si l'utilisateur n'en donne pas, proposez-en 3 et laissez-le choisir.
2. **Le script.** Lisez `references/ecrire.md` (accroches qui marchent, structure, longueur). 9 à 14 phrases, 110 à 170 mots, soit 45 à 70 s.
3. **Le fichier.** Écrivez `videos/<id>.json` dans le projet de l'utilisateur (le format est plus bas, le catalogue complet dans `references/scenes.md`). Les médias vont dans `videos/medias/`.
4. **La fabrication.** `node <skill>/scripts/fabriquer.mjs videos/<id>.json` fait la voix, la page, le contrôle et la planche, sans rendu (environ 1 min).
5. **La relecture.** Ouvrez **une seule image**, `videos/rendus/<id>-planche.jpg` : une vignette par scène, plus l'image 1. Corrigez le json, puis relancez la commande. La voix est en cache, seules les phrases changées sont refaites.
6. **Le rendu.** Ajoutez `--rendu` (environ 1 min pour 45 s de vidéo). Vous obtenez `videos/rendus/<id>.mp4`, `-couverture.jpg` (l'image 1) et `<id>.txt` (titre, légende, hashtags, commentaire épinglé).
7. **La publication.** Lisez `references/publier.md` : heures selon le pays du public, cadence, légende. Ne publiez rien sans l'accord explicite de l'utilisateur.

## Économiser les tokens : les règles qui comptent

Ce skill coûte peu parce que le modèle écrit 60 à 120 lignes de JSON par vidéo, au lieu de 250 à 400 lignes de HTML et d'animation. Pour que ça reste vrai :

- **N'ouvrez pas** `fabriquer.mjs`, `lib/*.mjs`, `style.css`, ni le `index.html` généré. Le catalogue des scènes suffit. Ouvrez le code seulement si une commande échoue et que son message ne suffit pas.
- **Ne lisez une référence que pour son étape** : `ecrire.md` pour écrire, `scenes.md` pour choisir une scène, `modes.md` pour une voix, un rush ou des captures, `publier.md` pour publier. Une référence déjà lue dans la conversation ne se relit pas.
- **Une planche, pas des captures.** Pour vérifier, regardez `<id>-planche.jpg` une fois, jamais une image par seconde. Ne regardez pas le MP4 image par image.
- **Faites confiance au contrôle.** La commande lance le contrôle HyperFrames (texte qui déborde, texte caché, erreurs) et le résume en quelques lignes. « aucun débordement, aucune erreur » veut dire que c'est bon.
- **Les lots se font en une commande.** Écrivez les N fichiers d'abord, puis `node fabriquer.mjs videos/a.json videos/b.json … --rendu`, en tâche de fond. Ne surveillez pas la sortie : attendez la fin.
- **Corrigez sur place.** Pour une retouche, modifiez seulement la phrase ou la scène en cause dans le json. Ne réécrivez pas le fichier entier.
- **Pas de recherche d'assets.** Les logos (`logo:bitcoin`, `logo:metamask`…) et 45 icônes (`icone:cle`…) sont intégrés. Ne cherchez une image sur le web que si l'utilisateur la demande.

## Le format `video.json`

```json
{
  "id": "wallet-cle",
  "titre": "Vos cryptos ne sont pas dans votre wallet",
  "voix": { "nom": "fr-FR-RemyMultilingualNeural", "debit": "+4%" },
  "marque": { "nom": "BDan", "visuel": "icone:etincelle" },
  "prononcer": { "wallet": "ouallette" },
  "phrases": [
    { "texte": "Vos cryptos ne sont pas dans votre *wallet*.",
      "scene": { "type": "titre", "lignes": ["Vos cryptos", "ne sont pas dans", "votre *wallet*"], "visuel": "icone:portefeuille" } },
    { "texte": "Cette clé tient en *douze mots*.",
      "scene": { "type": "chiffre", "valeur": "12", "apres": "mots", "au": "douze", "couleur": "accent" } },
    { "texte": "On l'appelle la phrase de récupération." }
  ],
  "fin": { "texte": "Moi, c'est BDan.", "sous": "On parle de la nouvelle technologie." },
  "publication": { "titre": "…", "legende": "…", "hashtags": ["crypto"], "commentaire": "…" }
}
```

- **`texte`** : ce que dit la voix, mot pour mot. `*mot*` marque le mot fort : il s'affiche en italique de couleur, il bat quand il est dit, et la caméra pousse dessus. Mettez-en un par phrase au plus.
- **`scene`** : elle ouvre une nouvelle scène. Une phrase **sans** scène prolonge la précédente, ce qui laisse le temps de lire (en mode filmé, elle montre le visage ; `"scene": "suite"` prolonge alors la scène).
- **`au`** : l'élément arrive sur ce mot de la phrase (par exemple `"au": "Ledger"`). Sans `au`, les éléments se répartissent seuls : un par phrase s'il y en a autant que de phrases, sinon à intervalles réguliers.
- **Les visuels**, partout où une scène en accepte un : `"logo:binance"`, `"icone:cadenas"`, `"emoji:🔑"` ou `"medias/capture.png"`.
- **Facultatifs** : `musique` (un fichier, baissé sous la voix), `couleurs` (`{"accent": "#2f6bff", "accent2": "#5fa3ff"}`), `sons: false` (sans souffles aux transitions), `blanc` (silence entre les phrases, 0,35 s), `pause` sur une phrase, `sousTitres: false`, `langue` (`"fr"` par défaut).
- **La première phrase a toujours une scène.** L'image 1 sert de couverture dans les fils : un `titre` court, qui accroche.

**Les 16 scènes** (paramètres et exemples dans `references/scenes.md`) :

| Pour montrer… | type |
|---|---|
| l'accroche, une phrase qui claque | `titre` |
| un nombre (prix, record, pourcentage) | `chiffre` |
| 2 à 6 points, outils ou conseils | `liste` |
| une méthode en 2 à 5 temps | `etapes` |
| A contre B, avant / après, mythe / réalité | `duel` |
| des marques, des cryptos, des applis | `logos` |
| une capture ou une vidéo d'appli | `telephone` |
| un site, une page | `navigateur` |
| une photo, en carte ou plein écran | `image` |
| une conversation (IA, support, arnaque) | `chat` |
| un danger, une arnaque, une bonne nouvelle | `alerte` |
| une évolution, une comparaison chiffrée | `graphique` |
| une commande, une installation | `terminal` |
| une phrase de quelqu'un | `citation` |
| un concept avec son explication | `carte` |
| le moment unique qui mérite un visuel inventé | `html` |

**Variez.** Une scène par idée forte, 6 à 10 scènes par vidéo. Le même type ne revient jamais deux fois de suite, et la suite des types change d'une vidéo à l'autre. Un style fixe ne doit pas devenir un gabarit : si trois vidéos d'affilée ont la même suite de scènes, le public décroche.

## Les trois modes (détails dans `references/modes.md`)

- **Généré** : rien d'autre que le json. La voix est edge-tts (gratuite, sans clé). Changez `voix.nom` pour une autre voix française, belge, suisse ou québécoise.
- **Images** : vos captures et photos entrent dans `telephone`, `navigateur` ou `image`, depuis `videos/medias/`. Une voix enregistrée ou clonée se donne avec `"voix": { "fichier": "medias/voix.wav" }` : elle est transcrite en local (whisper) et calée sur vos phrases.
- **Filmé** : `"rush": "medias/rush.mp4"`. Le son du rush est la voix. Les phrases sans scène montrent le visage, avec les sous-titres en bas ; une scène recouvre l'écran le temps de son idée. Écrivez les phrases d'après la transcription : le skill la cale mot à mot.

## Avant le rendu : la checklist

- [ ] La phrase 1 dit le sujet en clair, et son titre se lit en moins d'une seconde.
- [ ] Chaque mot technique est expliqué dans la même phrase ou la suivante.
- [ ] Il y a au plus un mot fort par phrase, et 6 à 10 scènes de types variés.
- [ ] Les chiffres ont une source réelle, vérifiée, et une scène `chiffre` porte `source` quand le chiffre vient d'ailleurs.
- [ ] La planche est relue, le contrôle est vert, et aucun avertissement « mot introuvable » ne reste.
- [ ] La fin donne une raison de rester (la suite, une phrase à retenir), pas une question vague.
- [ ] Les marques sont montrées pour en parler, sans faire croire à un partenariat.
- [ ] Les conversations inventées portent `"mention": "Exemple fictif"`.

## Quand ça casse

- `voix : … edge_tts` : lancez `sh <skill>/scripts/installer.sh`.
- `mot « x » introuvable` : le `au` doit reprendre un mot de la phrase de la scène, tel qu'il est écrit.
- `logo « x » introuvable` : donnez un fichier (`"medias/x.svg"`), ou essayez le nom de la marque sans espace.
- Texte qui déborde : raccourcissez le texte ou passez à une scène plus large (`carte` ou `liste` plutôt que `duel`). Ne touchez pas au CSS.
- Une phrase mal prononcée : ajoutez-la à `prononcer`, sous la forme `{"Ledger": "Lédjeur"}`.
