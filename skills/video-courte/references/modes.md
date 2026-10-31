# Les trois modes : généré, images, filmé

## 1. Généré à 100 % (rien à filmer)

Le json seul suffit. La voix vient d'**edge-tts** : les voix neuronales de Microsoft, gratuites et sans clé, mais il faut être en ligne.

| Voix (`voix.nom`) | Accent | |
|---|---|---|
| `fr-FR-RemyMultilingualNeural` | France | homme, posé : **par défaut** |
| `fr-FR-VivienneMultilingualNeural` | France | femme, posée |
| `fr-FR-HenriNeural`, `fr-FR-DeniseNeural`, `fr-FR-EloiseNeural` | France | plus classiques |
| `fr-CA-ThierryNeural`, `fr-CA-AntoineNeural`, `fr-CA-JeanNeural`, `fr-CA-SylvieNeural` | Québec | |
| `fr-BE-GerardNeural`, `fr-BE-CharlineNeural` | Belgique | |
| `fr-CH-FabriceNeural`, `fr-CH-ArianeNeural` | Suisse | |
| `en-US-AndrewMultilingualNeural`, `en-US-AvaMultilingualNeural`, `en-GB-RyanNeural` | anglais | avec `"langue": "en"` |

- **`debit`** : `"+4%"` par défaut. Restez entre `-5%` et `+10%` : plus vite, la voix perd en clarté.
- **`blanc`** : le silence entre les phrases, 0,35 s par défaut. Ajoutez `"pause": 0.4` sur une phrase qui doit peser.
- **`prononcer`** : seulement pour la voix. Le texte affiché ne change pas.
  `{"AI": "aï", "wallet": "ouallette", "Ledger": "Lédjeur", "USDT": "u, s, d, t", "GitHub": "guite-heube"}`
- **La musique** : `"musique": "medias/fond.mp3"`. Elle est jouée en boucle, baissée à -27 LUFS, et s'efface sous la voix. Prenez une musique libre de droits : la bibliothèque audio de YouTube, Pixabay Music, ou une musique que vous avez fabriquée.

## 2. Avec images (captures, photos, pages, voix à vous)

- **Les médias** vont dans `videos/medias/` et se citent depuis le json (`"image": "medias/appli.png"`).
- **Les captures de téléphone** : prenez-les en vertical. Elles entrent dans `telephone` (`defile` pour une longue page, `zoom` pour montrer un bouton).
- **Les captures d'ordinateur et les pages web** vont dans `navigateur`. Une capture en hauteur peut défiler.
- **Les photos** : `image` en `carte` ou en `plein` écran. N'utilisez que des images que vous avez le droit d'utiliser : les vôtres, ou des banques libres (Unsplash, Pexels, Freepik avec licence).
- **Un enregistrement d'écran** (MP4) : `telephone` avec `video`. Il est joué en muet ; le son reste la voix.
- **Votre propre voix**, enregistrée au téléphone ou au micro :
  `"voix": { "fichier": "medias/ma-voix.m4a" }`.
  - Le texte des phrases doit suivre ce que vous dites.
  - La voix est transcrite en local (whisper large-v3-turbo, via HyperFrames, environ 30 s la première fois), puis calée mot à mot sur les phrases.
  - Les « euh » et les mots en trop ne gênent pas.
- **Une voix clonée** (ElevenLabs, VoxCPM, autre) : produisez le fichier audio avec votre outil, puis donnez-le dans `voix.fichier`, comme une voix enregistrée.

## 3. Filmé (un rush face caméra)

```json
{ "id": "mon-rush", "rush": "medias/rush.mp4", "marque": { "nom": "BDan" },
  "phrases": [
    { "texte": "Votre banque vous prend 25 euros par virement." },
    { "texte": "Avec un stablecoin, c'est moins d'un euro.", "scene": { "type": "graphique", "barres": [{ "label": "Banque", "valeur": 25, "affiche": "25 €" }, { "label": "USDT", "valeur": 1, "affiche": "< 1 €" }], "fort": 1 } },
    { "texte": "Mais attention à une chose.", "scene": "suite" },
    { "texte": "Gardez toujours vos clés." }
  ] }
```

- Le son du rush est la voix. Le visage se voit sur les phrases sans scène, avec les sous-titres blancs au milieu bas.
- Une scène couvre l'écran (fond blanc) le temps de son idée, puis le visage revient. `"scene": "suite"` garde la scène sur la phrase suivante.
- **Écrire les phrases** : lancez une première fois avec une seule phrase, puis lisez `fabrique/<id>/transcription-*.json`, ou demandez la transcription. Recopiez les phrases dites en corrigeant les mots mal entendus. Le calage tolère les petites différences.
- Coupez d'abord les ratés, les longs silences et les reprises, dans votre logiciel de montage. Ce skill habille un rush propre : il ne fait pas le dérushage.
- Filmez en vertical (1080 × 1920), le visage dans le tiers haut. Les sous-titres et les scènes se placent autour.

## Ce qui reste sur votre machine

Tout se fabrique en local : la page, le rendu (Chrome sans fenêtre, via HyperFrames) et la transcription (whisper).
Seuls passent par Internet :
- le texte des phrases, envoyé au service de voix de Microsoft (mode généré) ;
- le premier téléchargement des outils (HyperFrames, GSAP) et des logos.

La télémétrie d'HyperFrames est coupée par le script.
