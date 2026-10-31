#!/usr/bin/env python3
"""La voix de synthèse d'une vidéo (edge-tts : voix Microsoft gratuite, sans clé), phrase par phrase,
avec le temps de chaque mot. Appelé par make.mjs ; on ne le lance pas à la main.

    python voix.py demande.json dossier/

demande.json : {"voix": {"nom": "fr-FR-RemyMultilingualNeural", "debit": "+4%"}, "blanc": 0.35,
                "phrases": [{"texte": "…", "pause": 0}]}
Écrit dossier/voix.wav (48 kHz mono) et dossier/voix.json (début, fin et mots de chaque phrase).
Une phrase déjà dite avec la même voix n'est pas refaite (cache dans dossier/phrases/).
"""
import asyncio
import hashlib
import json
import subprocess
import sys
import wave
from pathlib import Path

import edge_tts

TAUX = 48000
DEBUT = 0.2  # la voix commence après 0,2 s : l'image 1 reste l'affiche


async def dire(texte, voix, debit, mp3):
    com = edge_tts.Communicate(texte, voix, rate=debit, boundary="WordBoundary")
    mots = []
    with open(mp3, "wb") as f:
        async for bout in com.stream():
            if bout["type"] == "audio":
                f.write(bout["data"])
            elif bout["type"] == "WordBoundary":
                mots.append({"texte": bout["text"], "t": bout["offset"] / 1e7, "fin": (bout["offset"] + bout["duration"]) / 1e7})
    return mots


def separer(mots):
    """La voix rend parfois « 100 jours » d'un seul tenant : on coupe au prorata des lettres."""
    sortie = []
    for m in mots:
        parts = m["texte"].split()
        if len(parts) < 2:
            sortie.append(m)
            continue
        total, t = sum(len(p) for p in parts), m["t"]
        for p in parts:
            d = (m["fin"] - m["t"]) * len(p) / total
            sortie.append({"texte": p, "t": t, "fin": t + d})
            t += d
    return sortie


def pcm(mp3):
    return subprocess.run(["ffmpeg", "-v", "error", "-i", str(mp3), "-f", "s16le", "-ac", "1", "-ar", str(TAUX), "-"],
                          check=True, capture_output=True).stdout


async def main(demande, dossier):
    d = json.loads(Path(demande).read_text())
    v = d["voix"]
    cache = Path(dossier) / "phrases"
    cache.mkdir(parents=True, exist_ok=True)
    son = bytearray(b"\0\0" * int(DEBUT * TAUX))
    phrases = []
    for i, p in enumerate(d["phrases"]):
        cle = hashlib.sha1(f"{v['nom']}|{v.get('debit', '+0%')}|{p['texte']}".encode()).hexdigest()[:12]
        mp3, js = cache / f"{cle}.mp3", cache / f"{cle}.json"
        if not (mp3.exists() and js.exists()):
            for essai in range(4):
                try:
                    mots = await dire(p["texte"], v["nom"], v.get("debit", "+0%"), mp3)
                    break
                except Exception as e:  # le service coupe parfois : on réessaie
                    print(f"  phrase {i + 1} : nouvel essai ({e})", file=sys.stderr)
                    await asyncio.sleep(2 + essai * 3)
            else:
                raise SystemExit(f"phrase {i + 1} : la voix ne répond pas (connexion ?)")
            js.write_text(json.dumps(mots, ensure_ascii=False))
        mots = separer(json.loads(js.read_text()))
        brut = pcm(mp3)
        d0 = max(0.0, mots[0]["t"] - 0.05) if mots else 0.0
        d1 = min(len(brut) / 2 / TAUX, (mots[-1]["fin"] + 0.14) if mots else len(brut) / 2 / TAUX)
        a, b = int(d0 * TAUX) * 2, int(d1 * TAUX) * 2
        t = len(son) / 2 / TAUX
        son += brut[a:b]
        phrases.append({"debut": round(t, 3), "fin": round(t + d1 - d0, 3),
                        "mots": [{"texte": m["texte"], "debut": round(t + m["t"] - d0, 3), "fin": round(t + m["fin"] - d0, 3)} for m in mots]})
        if i < len(d["phrases"]) - 1:
            son += b"\0\0" * int((d.get("blanc", 0.35) + p.get("pause", 0)) * TAUX)
    son += b"\0\0" * int(0.3 * TAUX)
    with wave.open(str(Path(dossier) / "voix.wav"), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAUX)
        w.writeframes(bytes(son))
    (Path(dossier) / "voix.json").write_text(json.dumps({"duree": round(len(son) / 2 / TAUX, 3), "phrases": phrases}, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main(sys.argv[1], sys.argv[2]))
