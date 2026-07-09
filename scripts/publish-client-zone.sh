#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
UI_DIR="$ROOT_DIR/tveco-invoice-generator-web-ui"
WEBSITE_DIR="$ROOT_DIR/tvec-website"
TARGET_DIR="$WEBSITE_DIR/client-zone"

: "${TVECO_API_URL:=https://tveco.co.za/api}"
: "${TVECO_PUBLIC_APP_URL:=https://tveco.co.za/client-zone}"

echo "Building client zone from $UI_DIR"
pushd "$UI_DIR" >/dev/null
MSYS_NO_PATHCONV=1 \
VITE_USE_API=true \
VITE_API_URL="$TVECO_API_URL" \
VITE_PUBLIC_APP_URL="$TVECO_PUBLIC_APP_URL" \
VITE_BASE_PATH=/client-zone/ \
npm run build
popd >/dev/null

echo "Syncing build output to $TARGET_DIR"
rm -rf "$TARGET_DIR"
mkdir -p "$TARGET_DIR"
cp -R "$UI_DIR/dist/." "$TARGET_DIR/"

touch "$TARGET_DIR/.nojekyll"

echo "Client zone published to $TARGET_DIR"
