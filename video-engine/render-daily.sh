#!/usr/bin/env bash
# Renders today's assets into ../social/<date>/ : video.mp4 (silent, yuv420p, faststart), cover.jpg, pin.jpg, plus check frames in out/.
# Usage: ./render-daily.sh 2026-11-18 [coverFrame]   (coverFrame defaults to 18 = 0.6 s, the hook frame)
set -euo pipefail
cd "$(dirname "$0")"
DATE=${1:?date YYYY-MM-DD}; COVER=${2:-18}
DEST=../social/$DATE; mkdir -p "$DEST" out
[ -d node_modules ] || npm ci --no-audit --no-fund
npx tsc
npx remotion render Daily out/raw.mp4 --codec=h264 --pixel-format=yuv420p --muted --crf=14 --log=error
ffmpeg -loglevel error -y -i out/raw.mp4 -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -color_range tv -an -movflags +faststart "$DEST/video.mp4"
npx remotion still Daily out/cover.png --frame="$COVER" --log=error
ffmpeg -loglevel error -y -i out/cover.png -q:v 2 "$DEST/cover.jpg"
npx remotion still Pin out/pin.png --log=error
ffmpeg -loglevel error -y -i out/pin.png -q:v 2 "$DEST/pin.jpg"
# check frames every 3 s + contact sheet to LOOK at before publishing
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$DEST/video.mp4")
i=0; for t in 0 3 6 9 12 $(python3 -c "print(round($DUR-0.5,1))"); do ffmpeg -loglevel error -y -ss "$t" -i "$DEST/video.mp4" -frames:v 1 "out/check_$i.png"; i=$((i+1)); done
ffmpeg -loglevel error -y $(for k in $(seq 0 $((i-1))); do echo -i out/check_$k.png; done) -filter_complex "hstack=$i,scale=2160:-1" out/contact.png
ffprobe -v error -show_entries format=duration:stream=codec_type,codec_name,pix_fmt,width,height -of compact "$DEST/video.mp4"
echo "Done -> $DEST (look at out/contact.png and out/pin.png)"
