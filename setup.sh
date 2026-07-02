#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
NODE_DIR="$ROOT_DIR/multi-language-modules/nodejs-typescript"

echo "Architect-Prime v0.2.0-beta setup"
echo "=================================="

if [ ! -f "$ROOT_DIR/.env" ]; then
  cp "$ROOT_DIR/.env.example" "$ROOT_DIR/.env"
  echo "Created root .env from .env.example"
fi

if [ ! -f "$NODE_DIR/.env" ]; then
  cp "$NODE_DIR/.env.example" "$NODE_DIR/.env"
  echo "Created Node.js module .env from .env.example"
fi

if command -v npm >/dev/null 2>&1; then
  echo "Installing Node.js module dependencies..."
  (
    cd "$NODE_DIR"
    export DATABASE_URL="${DATABASE_URL:-file:./dev.db}"
    npm ci
    npm run prisma:generate
    npm run prisma:migrate
    npm run build
  )
else
  echo "npm not found; skip Node.js dependency installation"
fi

echo "Setup complete. Next commands:"
echo "  cd multi-language-modules/nodejs-typescript"
echo "  npm run dev"
echo "  open http://localhost:3000/health"
echo "  open http://localhost:3000/docs"
