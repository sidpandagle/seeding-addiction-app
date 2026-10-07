#!/usr/bin/env bash
# Renders every set into out/: A (frames.html), B (frames-b.html), C (frames-c.html),
# and Mix (one frame per topic picked from A/B/C, see MIX below).
# Each set = 8 phone screenshots (1080x1920) + a feature graphic (1024x500).
# Needs Google Chrome. Usage: bash render.sh [A|B|C|Mix ...]   (default: all sets)
set -e
cd "$(dirname "$0")"
CHROME="${CHROME:-/c/Program Files/Google/Chrome/Application/chrome.exe}"
path() { cygpath -m "$1" 2>/dev/null || echo "$1"; }
winpath() { cygpath -w "$1" 2>/dev/null || echo "$1"; }

render_set() {
  local set=$1 page=$2
  mkdir -p "out/$set"
  shoot() { "$CHROME" --headless=new --disable-gpu --hide-scrollbars --allow-file-access-from-files \
    --force-device-scale-factor=1 --window-size="$2" --screenshot="$(winpath "$PWD/out/$set/$3")" \
    "file:///$(path "$PWD/$page")#$1" 2>/dev/null; }
  for i in 1 2 3 4 5 6 7 8; do shoot "$i" 1080,1920 "0$i.png"; done
  shoot feature 1024,500 feature-graphic.png
  echo "out/$set: $(ls "out/$set" | tr '\n' ' ')"
}

# Mix: listing order, each entry is <set><frame>. Alternates phone and bento frames, spaces out the
# dark frames (hero, day & night, feature wall).
MIX="B1 C4 A3 C6 A8 C7 B2 B8"
MIX_FEATURE=B

render_mix() {
  mkdir -p out/Mix
  local n=1 f src
  for f in $MIX; do
    src="out/${f:0:1}/0${f:1}.png"
    [ -f "$src" ] || { echo "missing $src: run render.sh ${f:0:1} first"; exit 1; }
    cp "$src" "out/Mix/0$n.png"; n=$((n + 1))
  done
  cp "out/$MIX_FEATURE/feature-graphic.png" out/Mix/
  echo "out/Mix: $MIX + $MIX_FEATURE feature graphic"
}

sets="${*:-A B C Mix}"
for s in $sets; do
  case $s in
    A) render_set A frames.html ;;
    B) render_set B frames-b.html ;;
    C) render_set C frames-c.html ;;
    Mix) render_mix ;;
  esac
done
