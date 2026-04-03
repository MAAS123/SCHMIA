#!/usr/bin/env bash
set -euo pipefail

PORT="${1:-8000}"

printf "\n🚀 GeoSketch disponível em: http://localhost:%s/index.html\n\n" "$PORT"
python3 -m http.server "$PORT"
