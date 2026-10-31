# Le catalogue des scènes

Chaque scène est un objet `"scene": { "type": "…", … }` posé sur la phrase qui l'ouvre. Elle dure jusqu'à la scène suivante.
Tous les textes acceptent `*mot fort*`. Tous les `visuel` acceptent `logo:nom`, `icone:nom`, `emoji:🔑` ou un chemin d'image.
Les champs `au` prennent un mot dit pendant la scène : l'élément arrive à ce moment-là.

Champs communs, facultatifs : `entree` (`zoom`, `monte`, `plonge`, `tourne`, `fondu` ; par défaut, ça tourne d'une scène à l'autre), `sortie` (`zoom`, `monte`, `plonge`, `tourne`, `fondu`, `aucune`).

## titre — l'accroche, ou une phrase qui claque
```json
{ "type": "titre", "lignes": ["Vos cryptos", "ne sont pas dans", "votre *wallet*"], "visuel": "icone:portefeuille", "sous": "Explication en 45 s" }
```
- `lignes` : 1 à 4 lignes de 16 caractères au plus. Ou bien `texte`, coupé tout seul.
- `taille` : en px, réglée toute seule selon la plus longue ligne (84 à 172).
- Quand le titre écrit exactement la phrase dite, le sous-titre de cette phrase disparaît tout seul.

## chiffre — un nombre qui compte jusqu'à sa valeur
```json
{ "type": "chiffre", "valeur": "2,2", "apres": "milliards de dollars volés", "label": "Piratages crypto en 2024", "source": "Chainalysis, 2025", "au": "milliards", "couleur": "accent", "visuel": "icone:alerte" }
```
- Le compteur tourne sur le mot `au` (par défaut, le premier nombre dit). `couleur: "accent"` met le nombre dans la couleur d'accent.
- `source` s'affiche en petit, en bas. Mettez-la dès que le chiffre ne vient pas de vous.

## liste — 2 à 6 points qui arrivent un par un
```json
{ "type": "liste", "titre": "4 wallets", "items": [{ "texte": "MetaMask", "visuel": "logo:metamask", "au": "MetaMask" }, { "texte": "Phantom", "visuel": "logo:phantom" }, "Un point sans visuel"] }
```
- Le point dit s'allume et les précédents s'estompent. Une seconde après le dernier, tous reviennent pour le récapitulatif.
- Sans `visuel`, un numéro rond remplace le visuel. Un point tient en 26 caractères environ.

## etapes — une méthode en 2 à 5 temps
```json
{ "type": "etapes", "items": [{ "texte": "Ouvrez l'appli", "detail": "Onglet Réglages", "au": "ouvrez" }, { "texte": "Activez la 2FA" }, { "texte": "Notez les codes" }] }
```
Des numéros reliés par un trait qui se dessine. L'étape en cours est noire, les précédentes s'estompent.

## duel — A contre B
```json
{ "type": "duel", "gauche": { "titre": "Exchange", "texte": "Il garde vos clés", "visuel": "logo:binance" }, "droite": { "titre": "Wallet", "texte": "Vous gardez vos clés", "visuel": "icone:cle", "au": "wallet" }, "perdant": "gauche", "au_perdant": "risque", "vs": "VS" }
```
- `perdant` (facultatif) : cette carte se grise et se barre sur le mot `au_perdant`, pendant que l'autre grandit.
- `vs` : le texte du rond central (`VS`, `≠`, `→`, `ou`).

## logos — des marques, des cryptos, des applis
```json
{ "type": "logos", "marques": ["bitcoin", "ethereum", "solana"], "legende": "Les 3 plus échangées" }
{ "type": "logos", "centre": "icone:portefeuille", "marques": [{ "visuel": "logo:metamask", "au": "MetaMask" }, "phantom", "trust", "ledger"] }
{ "type": "logos", "marques": [{ "visuel": "logo:ledger", "nom": "Ledger", "au": "Ledger" }] }
```
- 1 à 3 marques sont mises en rang. Avec un `centre` et 3 à 6 marques, elles tournent en orbite autour.
- `nom` affiche le nom sous le logo. Un nom nu (`"bitcoin"`) vaut `logo:bitcoin`.
- Les sources : Simple Icons (plus de 3 000 marques) puis web3icons (wallets, exchanges, réseaux, jetons crypto). Exemples : `bitcoin`, `ethereum`, `solana`, `tether`, `binance`, `coinbase`, `metamask`, `ledger`, `phantom`, `trust`, `BTC`, `USDT`, `claude`, `openai`, `whatsapp`, `telegram`, `revolut`, `paypal`, `visa`.

## telephone — une capture ou une vidéo dans un vrai iPhone
```json
{ "type": "telephone", "image": "medias/appli.png", "defile": 700, "zoom": { "au": "bouton", "x": 0.5, "y": 0.8, "echelle": 1.8 }, "pilules": [{ "texte": "Réglages", "visuel": "icone:cle", "au": "réglages", "cote": "gauche" }] }
```
- `image` (une capture verticale, 1170 px de large idéalement) ou `video` (un MP4 d'écran, joué en muet).
- `defile` : de combien de px la capture défile (pour une page longue). `zoom` : la caméra entre dans l'écran sur un mot ; `x` et `y` vont de 0 à 1.
- `pilules` : 3 au plus, de chaque côté du téléphone.

## navigateur — un site
```json
{ "type": "navigateur", "url": "github.com/danbaruka/video-courte", "image": "medias/page.png", "defile": 600, "pilule": "Gratuit" }
{ "type": "navigateur", "url": "exemple.com", "titre": "Le titre de la page", "texte": "Une phrase de la page." }
```
L'URL s'écrit lettre à lettre. Sans `image`, une page simplifiée se dessine (titre, texte, lignes grises).

## image — une photo ou une capture
```json
{ "type": "image", "src": "medias/photo.jpg", "cadre": "carte", "legende": "Une seule planche à relire" }
```
`cadre` vaut `carte` (encadrée, par défaut) ou `plein` (plein écran, avec un voile blanc en haut pour les sous-titres). L'image avance doucement.

## chat — une conversation
```json
{ "type": "chat", "app": "ChatGPT", "visuel": "logo:openai", "mention": "Exemple fictif", "messages": [{ "de": "moi", "texte": "Résume ce contrat en 3 points.", "au": "résume" }, { "de": "lui", "texte": "1. Durée : 12 mois…" }] }
```
`moi` s'écrit lettre à lettre (bulle noire, à droite). `lui` arrive après trois points (bulle blanche, à gauche). Le fil défile tout seul. 4 messages au plus. Une conversation inventée porte toujours `mention`.

## alerte — danger, attention, bonne nouvelle, info
```json
{ "type": "alerte", "niveau": "danger", "titre": "Ne donnez jamais vos 12 mots", "texte": "Ni au support, ni à un site" }
```
`niveau` vaut `danger` (rouge), `attention` (ambre), `ok` (vert) ou `info` (accent). Une pastille secoue, avec des ondes. `visuel` remplace l'icône.

## graphique — barres ou courbe
```json
{ "type": "graphique", "titre": "Prix du BTC", "courbe": [42, 38, 51, 67, 61, 96], "unite": "k$", "au": "monté" }
{ "type": "graphique", "titre": "Frais d'un virement", "barres": [{ "label": "Banque", "valeur": 25, "affiche": "25 €" }, { "label": "USDT", "valeur": 1, "affiche": "1 €" }], "fort": 1 }
```
- `barres` : 2 à 6 barres. `fort` est l'index de la barre mise en couleur (par défaut, la plus haute). `affiche` remplace la valeur écrite.
- `courbe` : la ligne se dessine, puis le dernier point s'affiche avec `derniere` ou `valeur unite`.

## terminal — une commande qui s'écrit
```json
{ "type": "terminal", "titre": "Terminal", "lignes": ["git clone https://github.com/danbaruka/video-courte", "node fabriquer.mjs video.json --rendu"], "au": ["installez", "lancez"] }
```

## citation — une phrase de quelqu'un, mot après mot
```json
{ "type": "citation", "texte": "Pas vos clés, pas vos *cryptos*.", "auteur": "Le dicton crypto", "visuel": "icone:cle" }
```

## carte — un concept et son explication
```json
{ "type": "carte", "visuel": "icone:cube", "titre": "La *blockchain*", "texte": "Un registre public, copié sur des milliers d'ordinateurs", "pilules": ["Public", "Infalsifiable"] }
```

## html — le visuel inventé pour un moment unique
```json
{ "type": "html", "html": "<div class='abs centre' id='x-pile' style='left:140px;top:640px;width:800px;height:700px'>…</div>", "css": "#x-pile { … }", "js": "entre('#x-pile', {{debut}} + 0.1, 'pop'); pulse('#x-pile', {{mot:effondre}}, 1.1);" }
```
- Remplacés au montage : `{{debut}}`, `{{fin}}`, `{{mot:xxx}}` (le temps du mot), `{{media:medias/f.png}}` (le chemin du média).
- Fonctions de la page : `entre(sel, t, "pop|monte|descend|gauche|droite|zoom|tourne|fondu")`, `sort(sel, t)`, `pulse(sel, t, échelle)`, `secoue(sel, t, degrés)`, `trace(selPath, t, durée)`, `tape(sel, t, durée)` (sur des `<span class="l">`), `tourne(sel, t0, t1, degrés)`, `flotte(sel, t0, t1)`, `pousse(sel, t, échelle)`, et la timeline GSAP `tl`.
- Classes utiles : `abs`, `centre`, `verre` (carte en verre dépoli), `pilule`, `tuile`, `numero`, `acc` (mot fort). Restez dans la zone y 560 à 1400. Préfixez vos id pour éviter les doublons.
- Gardez-la pour une ou deux scènes par vidéo. C'est la plus chère en tokens.

## Les icônes intégrées

alerte, appareil, avion, baisse, banque, bouclier, bulle, cadenas, calendrier, carte, chaine, cle, cloche, code, coche, coeur, croix, cube, doc, dollar, eclair, envoi, etincelle, fusee, globe, graphique, hausse, horloge, lien, loupe, micro, oeil, ordinateur, personne, personnes, piece, portefeuille, robot, serveur, soleil, telechargement, terminal, trophee, utilisateur, video.

## La mise en page (à respecter dans `html`)

| Zone (écran 1080 × 1920) | Contenu |
|---|---|
| y 250 à 520 | sous-titres (2 lignes au plus) |
| y 560 à 1400 | contenu de la scène |
| x 72 à 300, y 1436 à 1508 | marque |
| y > 1520 | rien : l'interface de TikTok et des Reels le couvre |
