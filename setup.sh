#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_DIR="$ROOT_DIR/multi-language-modules/nodejs-typescript"

echo "Architect-Prime setup"
echo "====================="

if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "Created .env from .env.example"
fi

if command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js module dependencies..."
  (cd "$NODE_DIR" && npm install && npm run build)
else
  echo "npm not found; skip Node.js dependency installation"
fi

echo "Setup complete. Next commands:"
echo "  cd multi-language-modules/nodejs-typescript"
echo "  npm run dev"
echo "  open http://localhost:3000/health"
echo "  open http://localhost:3000/docs"
