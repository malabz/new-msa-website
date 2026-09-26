#!/usr/bin/env bash
set -euo pipefail
cd -- "$(dirname -- "$0")"
if ! command -v node >/dev/null; then
  echo '请先安装 Node.js 24：https://nodejs.org/' >&2
  exit 1
fi
node scripts/start-preview.mjs
