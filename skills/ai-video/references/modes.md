# The three modes: generated, images, filmed

## 1. Fully generated (nothing to film)

The JSON alone is enough. The voice comes from **edge-tts**: Microsoft's neural voices, free and with no key, but you must be online. List them all with `<skill>/.venv/bin/edge-tts --list-voices`.

| Voice (`voix.nom`) | Accent | Notes |
|---|---|---|
| `en-US-AndrewMultilingualNeural`, `en-US-AvaMultilingualNeural`, `en-US-BrianMultilingualNeural`, `en-US-EmmaMultilingualNeural` | US English | calm, natural |
| `en-GB-RyanNeural`, `en-GB-SoniaNeural` | British English | |
| `fr-FR-RemyMultilingualNeural` | France | male, calm (**the default**) |
| `fr-FR-VivienneMultilingualNeural` | France | female, calm |
| `fr-CA-ThierryNeural`, `fr-CA-SylvieNeural` | Québec | |
| `fr-BE-GerardNeural`, `fr-CH-ArianeNeural` | Belgium, Switzerland | |

Settings:
- **`langue`**: set `"en"` for English, along with an English voice. Captions are then split on English word groups.
- **`debit`** (speed): `"+4%"` by default. Stay between `-5%` and `+10%`: any faster and the voice loses clarity.
- **`blanc`** (gap): the silence between sentences, 0.35 s by default. Add `"pause": 0.4` to a sentence that needs weight.
- **`prononcer`**: affects the voice only. The text on screen does not change.
  `{"AI": "A I", "USDT": "U S D T", "Ledger": "Ledjer", "GitHub": "Git Hub"}`
- **Music**: `"musique": "medias/background.mp3"`.
  - It loops, is set to -27 LUFS, and ducks under the voice.
  - Use royalty-free music: the YouTube Audio Library, Pixabay Music, or music you made yourself.

## 2. With images (screenshots, photos, pages, your own voice)

- **Media** goes in `videos/medias/` and is referenced from the JSON (`"image": "medias/app.png"`).
- **Phone screenshots**: take them vertically. They go into `telephone`, with `defile` for a long page and `zoom` to show a button.
- **Computer screenshots and web pages** go into `navigateur`. A tall screenshot can scroll.
- **Photos**: use `image`, as a `carte` or `plein` (full screen).
  - Only use images you have the right to use: your own, or free stock (Unsplash, Pexels, Freepik with a licence).
- **A screen recording** (MP4): `telephone` with `video`. It plays muted; the sound stays the voice.
- **Your own voice**, recorded on a phone or a mic: `"voix": { "fichier": "medias/my-voice.m4a" }`.
  - The sentences must follow what you say.
  - The voice is transcribed locally (whisper large-v3-turbo, through HyperFrames, about 30 s the first time), then synced word by word to the sentences.
  - "Ums" and extra words do no harm.
- **A cloned voice** (ElevenLabs, VoxCPM or another tool): make the audio file with that tool, then pass it in `voix.fichier`, like a recorded voice.

## 3. Filmed (a talking-head clip)

```json
{ "id": "my-clip", "rush": "medias/clip.mp4", "langue": "en", "marque": { "nom": "BDan" },
  "phrases": [
    { "texte": "Your bank charges you 25 dollars per transfer." },
    { "texte": "With a stablecoin, it's under one dollar.", "scene": { "type": "graphique", "barres": [{ "label": "Bank", "valeur": 25, "affiche": "$25" }, { "label": "USDT", "valeur": 1, "affiche": "< $1" }], "fort": 1 } },
    { "texte": "But watch out for one thing.", "scene": "suite" },
    { "texte": "Always keep your keys." }
  ] }
```

- **The face and the scenes.**
  - The clip's audio is the voice.
  - The face shows on sentences without a scene, with white captions in the lower middle.
  - A scene covers the screen (white background) for the length of its idea, then the face comes back. `"scene": "suite"` keeps the scene on the next sentence.
- **Writing the sentences.**
  - Run it once with a single sentence, then read `fabrique/<id>/transcription-*.json`.
  - Copy out the sentences, fixing misheard words. The sync tolerates small differences.
- **Cut first.** Remove fluffs, long silences and retakes in your editing app. This skill dresses a clean clip; it does not do the rough cut.
- **Filming**: shoot vertically (1080 × 1920), with the face in the top third. Captions and scenes fit around it.

## What stays on your machine

Everything is built locally: the page, the render (headless Chrome, through HyperFrames) and the transcription (whisper).

Only these go over the Internet:
- in generated mode, the sentence text, sent to Microsoft's voice service;
- the first download of the tools (HyperFrames, GSAP) and of the logos.

The script turns HyperFrames telemetry off.
