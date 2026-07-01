#!/usr/bin/env bash
# One-time VPS bootstrap for KidQuest.
# Run on the VPS as the deploy user (pieter):
#   curl -fsSL https://raw.githubusercontent.com/pvanpuyenbroeck/kidquest/main/scripts/vps-setup.sh | bash
set -euo pipefail

APP_DIR="/opt/kidquest"
REPO="pvanpuyenbroeck/kidquest"

echo "🦕 KidQuest VPS setup"
echo "====================="

if ! command -v docker >/dev/null 2>&1; then
  echo "❌ Docker is not installed. Install Docker first."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "❌ Docker Compose plugin is not available."
  exit 1
fi

sudo mkdir -p "$APP_DIR"
sudo chown "$(whoami):$(whoami)" "$APP_DIR"

curl -fsSL "https://raw.githubusercontent.com/${REPO}/main/docker-compose.yml" \
  -o "${APP_DIR}/docker-compose.yml"

if [ ! -f "${APP_DIR}/.env" ]; then
  SECRET="$(openssl rand -hex 32)"
  cat > "${APP_DIR}/.env" <<EOF
# KidQuest productie — pas PARENT_PIN en NEXTAUTH_URL aan
PARENT_PIN="1234"
NEXTAUTH_SECRET="${SECRET}"
NEXTAUTH_URL="http://91.99.105.174:3001"
EOF
  echo "📝 Created ${APP_DIR}/.env — change PARENT_PIN before going live."
else
  echo "ℹ️  ${APP_DIR}/.env already exists, leaving it unchanged."
fi

echo ""
echo "Next steps:"
echo "  1. Edit ${APP_DIR}/.env (set PARENT_PIN and NEXTAUTH_URL to your public URL)"
echo "  2. Log in to GHCR: echo <GHCR_TOKEN> | docker login ghcr.io -u pvanpuyenbroeck --password-stdin"
echo "  3. Start: cd ${APP_DIR} && docker compose pull && docker compose up -d"
echo "  4. Check: curl -s http://localhost:3001/api/health"
echo ""
echo "✅ VPS files ready in ${APP_DIR}"
