#!/bin/sh
# Prépare video-courte une fois pour toutes : vérifie Node, ffmpeg, Python, et installe edge-tts (la voix gratuite)
# dans un environnement Python à part (scripts/../.venv), sans rien toucher au reste de la machine.
#   sh scripts/installer.sh
set -e
ICI=$(cd "$(dirname "$0")/.." && pwd)
manque=""
command -v node >/dev/null 2>&1 || manque="$manque node(>=18)"
command -v ffmpeg >/dev/null 2>&1 || manque="$manque ffmpeg"
command -v ffprobe >/dev/null 2>&1 || manque="$manque ffprobe"
command -v python3 >/dev/null 2>&1 || manque="$manque python3"
if [ -n "$manque" ]; then
  echo "À installer d'abord :$manque"
  echo "  macOS : brew install node ffmpeg python    ·    Ubuntu : sudo apt install nodejs ffmpeg python3-venv"
  exit 1
fi
node -e 'if (+process.versions.node.split(".")[0] < 18) { console.error("Node 18 ou plus est nécessaire"); process.exit(1); }'
if [ ! -x "$ICI/.venv/bin/python" ]; then
  python3 -m venv "$ICI/.venv"
fi
"$ICI/.venv/bin/pip" install -q --upgrade pip edge-tts
echo "✓ video-courte est prêt. Premier essai :"
echo "  node $ICI/scripts/fabriquer.mjs $ICI/exemples/genere.json"
