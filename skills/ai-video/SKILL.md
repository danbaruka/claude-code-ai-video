---
name: ai-video
description: Make short vertical videos (TikTok, Reels, YouTube Shorts, 30 to 90 s) in a clean, animated white style from one small video.json file, using very few tokens. Three modes. "Generated" adds a free neural voice and motion design. "Images" puts your screenshots, photos and web pages in a real iPhone, a browser or full screen. "Filmed" adds captions and animated scenes over a talking-head clip. The skill writes the script, makes the voice, syncs captions word by word, animates every scene, adds music and sound effects, checks that no text overflows the screen, and renders the MP4. Works in English, French and many other languages. Use it whenever someone asks for a short video, a Short, a Reel, a TikTok, an animated explainer, a batch of videos, a faceless video, animated captions, or wants to produce many videos fast and cheaply, even if they never say "skill".
---

# ai-video

One video is **one `video.json` file**: the sentences the voice says, and, for each strong idea, a scene picked from a catalog of 16 types.
The script `scripts/make.mjs` does everything else. **Never** write HTML, CSS or animation code by hand. The one exception is the single moment that deserves a custom visual (type `html`).

```
idea ─► script (sentences) ─► video.json ─► make.mjs ─► contact sheet (review) ─► --rendu ─► MP4 + cover + post text
```

> **The JSON keys are in French** (`phrases`, `texte`, `scene`, `voix`, `marque`…), and so are the scene types (`titre`, `chiffre`, `liste`…). Write them exactly as shown in this skill. The text the voice says can be in any language.

## Before the first video (once)

```sh
sh <skill>/scripts/install.sh      # checks node ≥ 18, ffmpeg, python3; installs edge-tts in <skill>/.venv
```

`<skill>` is the folder of this file. The first run downloads HyperFrames (via npx), GSAP and the logos. After that, everything is cached.

## The workflow

1. **The topic, in one sentence.** If the user gives none, suggest 3 and let them choose.
2. **The script.** Read `references/writing.md`: hooks that work, structure, length.
   - Aim for 9 to 14 sentences and 110 to 170 words.
   - Count about 2.7 words per second, plus 0.35 s between sentences: 130 words make about 50 s.
3. **The file.** Write `videos/<id>.json` in the user's project. The format is below, and the full catalog is in `references/scenes.md`. Put media files in `videos/medias/`.
4. **Build.** `node <skill>/scripts/make.mjs videos/<id>.json` makes the voice, the page, the check and the contact sheet, without rendering (about 1 min).
5. **Review.** Open **one image only**: `videos/rendus/<id>-planche.jpg`.
   - It shows frame 1, then each scene at its end (once all its elements have arrived), then the outro card.
   - Fix the JSON and run the command again. The voice is cached: only changed sentences are redone.
6. **Render.** Add `--rendu`. It takes about 1 min for 45 s of video. You get:
   - `videos/rendus/<id>.mp4`;
   - `-couverture.jpg`, the cover, which is frame 1;
   - `<id>.txt`, with the title, caption, hashtags and pinned comment.
7. **Publish.** Read `references/publishing.md` for posting times by audience country, posting cadence and captions. Never publish anything without the user's explicit go-ahead.

## Saving tokens: the rules that matter

This skill is cheap because the model writes 60 to 120 lines of JSON per video, instead of 250 to 400 lines of HTML and animation code. In a blind test, a fresh agent produced a finished 60 s video with about 65,000 tokens, including reading this skill. To keep it that way:

- **Do not open** `make.mjs`, `lib/*.mjs`, `style.css` or the generated `index.html`. The scene catalog is enough. Open the code only if a command fails and its message is not enough.
- **Read a reference only for its step**:

  | Step | Reference |
  |---|---|
  | writing | `writing.md` |
  | choosing a scene | `scenes.md` |
  | voice, footage or screenshots | `modes.md` |
  | publishing | `publishing.md` |

  Never re-read a reference already read in the conversation.
- **One contact sheet, not screenshots.** To check a video, look at `<id>-planche.jpg` once. Never grab one frame per second, and never inspect the MP4 frame by frame.
- **Trust the check.** The command runs the HyperFrames check (overflowing text, hidden text, runtime errors) and sums it up in a few lines.
  - "aucun débordement, aucune erreur" means it is clean.
  - A ✗ line must always be fixed.
  - A ⚠ line is worth reading: fix it if it affects text.
- **Batches take one command.** Write the N files first. Then run `node make.mjs videos/a.json videos/b.json … --rendu` in the background, and wait for it to finish without watching its output.
- **Edit in place.** To fix something, change only the sentence or scene at fault in the JSON. Never rewrite the whole file.
- **No asset hunting.** Logos (`logo:bitcoin`, `logo:metamask`…) and 45 icons (`icone:cle`…) are built in. Search the web for an image only if the user asks for one.

## The `video.json` format

```json
{
  "id": "wallet-key",
  "titre": "Your crypto is not in your wallet",
  "langue": "en",
  "voix": { "nom": "en-US-AndrewMultilingualNeural", "debit": "+4%" },
  "marque": { "nom": "BDan", "visuel": "icone:etincelle" },
  "prononcer": { "USDT": "U S D T" },
  "phrases": [
    { "texte": "Your crypto is not in your *wallet*.",
      "scene": { "type": "titre", "lignes": ["Your crypto", "is not in", "your *wallet*"], "visuel": "icone:portefeuille" } },
    { "texte": "The key fits in *twelve words*.",
      "scene": { "type": "chiffre", "valeur": "12", "apres": "words", "au": "twelve", "couleur": "accent" } },
    { "texte": "It's called the recovery phrase." }
  ],
  "fin": { "texte": "I'm BDan.", "sous": "Let's talk new tech.", "audio": "medias/signature.wav" },
  "publication": { "titre": "…", "legende": "…", "hashtags": ["crypto"], "commentaire": "…" }
}
```

- **`phrases[].texte`**: what the voice says, word for word.
  - `*word*` marks the strong word: it shows in coloured italics, pulses when spoken, and the camera pushes in on it.
  - Use one per sentence at most.
- **`scene`**: starts a new scene.
  - A sentence **without** a scene extends the previous one, which leaves time to read.
  - In filmed mode, a sentence without a scene shows the face instead; there, `"scene": "suite"` extends the scene.
- **`au`** ("at"): the element appears on that word of the sentence, for example `"au": "Ledger"`.
  - Without `au`, elements spread out on their own: one per sentence when there are as many elements as sentences, otherwise at even intervals.
- **Visuals**, wherever a scene takes one: `"logo:binance"`, `"icone:cadenas"`, `"emoji:🔑"`, or a path such as `"medias/screenshot.png"` (`.svg` files are inlined).
- **`voix`**: the voice. `nom` is the voice name, `debit` is the speed. `fichier` points to your own recording.
- **`langue`**: `"fr"` by default. Set `"en"` for English, along with an English voice.
- **`marque`**: the small brand pill at the bottom left. `nom` is the brand name, `visuel` its logo.
- **`prononcer`**: spoken forms. They change how the voice says a word, never the text shown on screen.
- **`fin`**: the outro card, with the `marque` logo, `texte` and `sous` (a subtitle).
  - `audio` plays a recorded sign-off on the card.
  - Without `audio`, the card stays 2 s, silent.
- **`titre`**: the video's name in the files. The YouTube title goes in `publication`.
- **Optional**:

  | Key | Effect |
  |---|---|
  | `musique` | a music file, ducked under the voice |
  | `couleurs` | colours, for example `{"accent": "#2f6bff", "accent2": "#5fa3ff"}` |
  | `sons: false` | no whooshes on transitions |
  | `blanc` | silence between sentences, 0.35 s by default |
  | `pause` | extra silence after one sentence |
  | `sousTitres: false` | no captions |

- **Sentence 1 always has a scene.** Frame 1 is the cover people see in their feeds, so use a short, hooky `titre`.

**The 16 scenes** (parameters and examples in `references/scenes.md`):

| To show… | type |
|---|---|
| the hook, a punchy line | `titre` |
| a number (price, record, percentage) | `chiffre` |
| 2 to 6 points, tools or tips | `liste` |
| a method in 2 to 5 steps | `etapes` |
| A versus B, before / after, myth / fact | `duel` |
| brands, coins, apps | `logos` |
| an app screenshot or screen recording | `telephone` |
| a website, a page | `navigateur` |
| a photo, as a card or full screen | `image` |
| a conversation (AI, support, scam) | `chat` |
| a danger, a scam, good news | `alerte` |
| a trend, a comparison in numbers | `graphique` |
| a command, an install | `terminal` |
| someone's quote | `citation` |
| a concept and its explanation | `carte` |
| the one moment that deserves an invented visual | `html` |

**Vary the scenes.**
- Give each strong idea its own scene: 6 to 10 scenes per video.
- Never use the same type twice in a row, and change the order of types from one video to the next.
- A fixed style must not become a template. If three videos in a row share the same sequence of scenes, viewers drop off.

## The three modes (details in `references/modes.md`)

- **Generated**: the JSON is all you need.
  - The voice is edge-tts: free, no key, many languages.
  - Set `voix.nom` to change the voice or the accent.
- **Images**: your screenshots and photos go into `telephone`, `navigateur` or `image`, from `videos/medias/`.
  - A recorded or cloned voice goes in `"voix": { "fichier": "medias/voice.wav" }`.
  - It is transcribed locally (whisper) and synced to your sentences.
- **Filmed**: set `"rush": "medias/clip.mp4"`. The clip's audio is the voice.
  - Sentences without a scene show the face, with captions at the bottom.
  - A scene covers the screen for the length of its idea.
  - Write the sentences from the transcript: the skill syncs them word by word.

## Before rendering: the checklist

- [ ] Sentence 1 states the topic plainly, and its title reads in under a second.
- [ ] Every technical word is explained in the same sentence or the next one.
- [ ] There is at most one strong word per sentence, and 6 to 10 scenes of varied types.
- [ ] Numbers come from a real, checked source. A `chiffre` scene carries `source` when the number comes from someone else.
- [ ] The contact sheet is reviewed, the check is clean, and no "mot introuvable" (word not found) warning is left.
- [ ] The ending gives a reason to stay (what comes next, a line to remember), not a vague question.
- [ ] Brands are shown to talk about them, never to suggest a partnership.
- [ ] Made-up conversations carry `"mention": "Exemple fictif"`, or "Example" in English.

## When something breaks

| Message | What to do |
|---|---|
| `voix : … edge_tts` | run `sh <skill>/scripts/install.sh` |
| `mot « x » introuvable` | an `au` must repeat a word of its scene's sentences, as written |
| `logo « x » introuvable` | give a file (`"medias/x.svg"`), or try the brand name without spaces |
| text overflows | shorten the text, or switch to a wider scene (`carte` or `liste` rather than `duel`); do not touch the CSS |
| a word is mispronounced | add it to `prononcer`, for example `{"Ledger": "Ledjer"}` |
