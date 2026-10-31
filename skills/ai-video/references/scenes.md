# The scene catalog

Each scene is an object `"scene": { "type": "…", … }` placed on the sentence that opens it. It lasts until the next scene.
- Every text field accepts `*strong word*`.
- Every `visuel` accepts `logo:name`, `icone:name`, `emoji:🔑`, or an image path.
- `au` fields take a word spoken during the scene: the element appears at that moment.

Common optional fields:
- `entree`, the way in: `zoom`, `monte` (rise), `plonge` (dive), `tourne` (flip) or `fondu` (fade). By default it rotates from one scene to the next.
- `sortie`, the way out: the same values, plus `aucune` (none).

Keys and type names are French: write them exactly as below.

## titre — the hook, or a punchy line
```json
{ "type": "titre", "lignes": ["Your crypto", "is not in", "your *wallet*"], "visuel": "icone:portefeuille", "sous": "Explained in 45 s" }
```
- `lignes`: 1 to 4 lines of 16 characters at most. Or use `texte`, which is split into lines automatically.
- `taille`: the size in px. It is set automatically from the longest line, between 84 and 172.
- When the title shows exactly the spoken sentence, that sentence's caption is hidden automatically.

## chiffre — a number that counts up to its value
```json
{ "type": "chiffre", "valeur": "2.2", "apres": "billion dollars stolen", "label": "Crypto hacks in 2024", "source": "Chainalysis, 2025", "au": "billion", "couleur": "accent", "visuel": "icone:alerte" }
```
- `avant` and `apres` go before and after the number.
- The counter spins on the `au` word (by default, the first number spoken).
- `couleur: "accent"` shows the number in the accent colour.
- `source` shows in small type at the bottom. Add it whenever the number is not yours.

## liste — 2 to 6 points, one by one
```json
{ "type": "liste", "titre": "4 wallets", "items": [{ "texte": "MetaMask", "visuel": "logo:metamask", "au": "MetaMask" }, { "texte": "Phantom", "visuel": "logo:phantom" }, "A point without a visual"] }
```
- The point being spoken lights up while the earlier ones fade. One second after the last point, all of them come back as a recap.
- Without `visuel`, a round number takes its place. A point holds about 26 characters.

## etapes — a method in 2 to 5 steps
```json
{ "type": "etapes", "items": [{ "texte": "Open the app", "detail": "Settings tab", "au": "open" }, { "texte": "Turn on 2FA" }, { "texte": "Write down the codes" }] }
```
The numbers are linked by a line that draws itself. The current step is black and the earlier ones fade.

## duel — A versus B
```json
{ "type": "duel", "gauche": { "titre": "Exchange", "texte": "It holds your keys", "visuel": "logo:binance" }, "droite": { "titre": "Wallet", "texte": "You hold your keys", "visuel": "icone:cle", "au": "wallet" }, "perdant": "gauche", "au_perdant": "risk", "vs": "VS" }
```
- `gauche` is the left card, `droite` the right one.
- `perdant` ("loser", optional): that card greys out and gets crossed out on the `au_perdant` word, while the other one grows.
- `vs`: the text in the round badge (`VS`, `≠`, `→`, `or`).

## logos — brands, coins, apps
```json
{ "type": "logos", "marques": ["bitcoin", "ethereum", "solana"], "legende": "The 3 most traded" }
{ "type": "logos", "centre": "icone:portefeuille", "marques": [{ "visuel": "logo:metamask", "au": "MetaMask" }, "phantom", "trust", "ledger"] }
{ "type": "logos", "marques": [{ "visuel": "logo:ledger", "nom": "Ledger", "au": "Ledger" }] }
```
- 1 to 3 brands sit in a row. With a `centre` and 3 to 6 brands, they orbit around it.
- `nom` shows the name under the logo. A bare name (`"bitcoin"`) means `logo:bitcoin`.
- Sources: Simple Icons (over 3,000 brands) first, then web3icons (crypto wallets, exchanges, networks and tokens).
- Examples: `bitcoin`, `ethereum`, `solana`, `tether`, `binance`, `coinbase`, `metamask`, `ledger`, `phantom`, `trust`, `BTC`, `USDT`, `claude`, `openai`, `supabase`, `vercel`, `googlechrome`, `whatsapp`, `telegram`, `revolut`, `paypal`, `visa`.

## telephone — a screenshot or video in a real iPhone
```json
{ "type": "telephone", "image": "medias/app.png", "defile": 700, "zoom": { "au": "button", "x": 0.5, "y": 0.8, "echelle": 1.8 }, "pilules": [{ "texte": "Settings", "visuel": "icone:cle", "au": "settings", "cote": "gauche" }] }
```
- `image` is a vertical screenshot, ideally 1170 px wide. `video` is a screen-recording MP4, played muted.
- `defile` ("scroll"): how many px the screenshot scrolls, for a long page.
- `zoom`: the camera moves into the screen on a word. `x` and `y` go from 0 to 1, and `echelle` is the zoom factor.
- `pilules` ("pills"): 3 at most, on either side of the phone. `cote` is `gauche` (left) or `droite` (right).

## navigateur — a website
```json
{ "type": "navigateur", "url": "github.com/danbaruka/claude-code-ai-video", "image": "medias/page.png", "defile": 600, "pilule": "Free" }
{ "type": "navigateur", "url": "example.com", "titre": "The page title", "texte": "A line from the page." }
```
- The URL types itself out letter by letter.
- Without `image`, a simplified page is drawn (title, text, grey lines).
- `pilule_au` sets the word on which the pill appears.

## image — a photo or screenshot
```json
{ "type": "image", "src": "medias/photo.jpg", "cadre": "carte", "legende": "One sheet to review" }
```
- `cadre` ("frame") is `carte` (framed card, the default) or `plein` (full screen, with a white veil at the top for the captions).
- The image slowly moves in (Ken Burns).

## chat — a conversation
```json
{ "type": "chat", "app": "ChatGPT", "visuel": "logo:openai", "mention": "Example", "messages": [{ "de": "moi", "texte": "Summarise this contract in 3 points.", "au": "summarise" }, { "de": "lui", "texte": "1. Term: 12 months…" }] }
```
- `de: "moi"` ("me") types itself out, in a black bubble on the right.
- `de: "lui"` ("them") arrives after three dots, in a white bubble on the left.
- The thread scrolls on its own. Use 4 messages at most.
- A made-up conversation always carries a `mention`.

## alerte — danger, warning, good news, info
```json
{ "type": "alerte", "niveau": "danger", "titre": "Never share your 12 words", "texte": "Not with support, not with a website" }
```
- `niveau` ("level") is `danger` (red), `attention` (amber), `ok` (green) or `info` (accent).
- A badge shakes, with ripples. `visuel` replaces its icon.

## graphique — bars or a line
```json
{ "type": "graphique", "titre": "BTC supply", "courbe": [42, 38, 51, 67, 61, 96], "unite": "%", "au": "rose" }
{ "type": "graphique", "titre": "Fee for one transfer", "barres": [{ "label": "Bank", "valeur": 25, "affiche": "$25" }, { "label": "USDT", "valeur": 1, "affiche": "$1" }], "fort": 1 }
```
- `barres` ("bars"): 2 to 6 bars.
  - `fort` is the index of the highlighted bar (by default, the tallest).
  - `affiche` replaces the value shown.
- `courbe` ("line"): the line draws itself, then the last point shows `derniere`, or the value followed by `unite`.

## terminal — a command typing itself
```json
{ "type": "terminal", "titre": "Terminal", "lignes": ["git clone https://github.com/danbaruka/claude-code-ai-video", "node make.mjs video.json --rendu"], "au": ["install", "run"] }
```

## citation — a quote, word by word
```json
{ "type": "citation", "texte": "Not your keys, not your *coins*.", "auteur": "The crypto saying", "visuel": "icone:cle" }
```

## carte — a concept and its explanation
```json
{ "type": "carte", "visuel": "icone:cube", "titre": "The *blockchain*", "texte": "A public ledger, copied on thousands of computers", "pilules": ["Public", "Tamper-proof"] }
```

## html — an invented visual for one unique moment
```json
{ "type": "html", "html": "<div class='abs centre' id='x-stack' style='left:140px;top:640px;width:800px;height:700px'>…</div>", "css": "#x-stack { … }", "js": "entre('#x-stack', {{debut}} + 0.1, 'pop'); pulse('#x-stack', {{mot:collapses}}, 1.1);" }
```
- **Replaced at build time**:
  - `{{debut}}` and `{{fin}}`: the scene's start and end;
  - `{{mot:xxx}}`: the time the word is spoken;
  - `{{media:medias/f.png}}`: the media path.
- **Page functions**:

  | Function | Effect |
  |---|---|
  | `entre(sel, t, type)` | makes an element appear; `type` is `pop`, `monte`, `descend`, `gauche`, `droite`, `zoom`, `tourne` or `fondu` |
  | `sort(sel, t)` | makes an element leave |
  | `pulse(sel, t, scale)` | one beat |
  | `secoue(sel, t, degrees)` | shake |
  | `trace(selPath, t, duration)` | draws an SVG path |
  | `tape(sel, t, duration)` | types out `<span class="l">` letters |
  | `tourne(sel, t0, t1, degrees)` | spin |
  | `flotte(sel, t0, t1)` | float |
  | `pousse(sel, t, scale)` | camera push |

  The GSAP timeline is also available as `tl`.
- **Useful classes**: `abs`, `centre`, `verre` (frosted glass card), `pilule`, `tuile`, `numero`, `acc` (strong word).
- **Rules**: stay inside y 560 to 1400, and prefix your ids to avoid clashes.
- Keep it for one or two scenes per video: it is the most expensive one in tokens.

## Built-in icons (French names)

| Name | Meaning |
|---|---|
| `alerte` | alert |
| `appareil` | phone |
| `avion` | plane |
| `baisse` | trend down |
| `banque` | bank |
| `bouclier` | shield |
| `bulle` | speech bubble |
| `cadenas` | lock |
| `calendrier` | calendar |
| `carte` | card |
| `chaine` | chain |
| `cle` | key |
| `cloche` | bell |
| `code` | code |
| `coche` | check |
| `coeur` | heart |
| `croix` | cross |
| `cube` | cube |
| `doc` | document |
| `dollar` | dollar |
| `eclair` | bolt |
| `envoi` | send |
| `etincelle` | sparkle |
| `fusee` | rocket |
| `globe` | globe |
| `graphique` | chart |
| `hausse` | trend up |
| `horloge` | clock |
| `lien` | link |
| `loupe` | search |
| `micro` | mic |
| `oeil` | eye |
| `ordinateur` | laptop |
| `personne` | person |
| `personnes` | people |
| `piece` | coin |
| `portefeuille` | wallet |
| `robot` | robot |
| `serveur` | server |
| `soleil` | sun |
| `telechargement` | download |
| `terminal` | terminal |
| `trophee` | trophy |
| `utilisateur` | user |
| `video` | video |

## Layout (respect it in `html`)

| Zone (1080 × 1920 screen) | Content |
|---|---|
| y 250 to 520 | captions (2 lines at most) |
| y 560 to 1400 | scene content |
| x 72 to 300, y 1436 to 1508 | brand pill |
| y > 1520 | nothing: the TikTok and Reels interface covers it |
