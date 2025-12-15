#!/usr/bin/env bash
# first-time-start
# Mac/Windows (Git Bash) agnostic bootstrap for this repo.
# Assumptions (matches your repo):
# - docker-compose.yml is in repo root
# - Laravel app lives in ./backend
# - PHP service name: "app"
# - Node service name: "node"
# - "app" container workdir is /var/www/html (mounted to ./backend)
# - Vite build outputs to public/build/manifest.json

set -euo pipefail

APP_SERVICE="${APP_SERVICE:-app}"
NODE_SERVICE="${NODE_SERVICE:-node}"
BACKEND_DIR="${BACKEND_DIR:-backend}"

say() { printf "\n\033[1m==> %s\033[0m\n" "$*"; }
die() { printf "\n\033[31mERROR:\033[0m %s\n" "$*" >&2; exit 1; }

need_cmd() {
  command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"
}

# --- preflight ---
need_cmd docker

if ! docker compose version >/dev/null 2>&1; then
  die "'docker compose' not available. Install/enable Docker Desktop or Docker Compose v2."
fi

[ -f "docker-compose.yml" ] || die "docker-compose.yml not found in current directory. Run this from repo root."
[ -d "$BACKEND_DIR" ] || die "Backend dir '$BACKEND_DIR' not found."

# --- start containers ---
say "Starting containers (build if needed)"
docker compose up -d --build

# --- composer install ---
say "Installing PHP dependencies (composer install) in service: $APP_SERVICE"
docker compose exec "$APP_SERVICE" composer install --no-interaction --prefer-dist

# --- env + key ---
say "Ensuring .env exists (copy from .env.example if missing)"
docker compose exec "$APP_SERVICE" bash -lc 'test -f .env || cp .env.example .env'

say "Generating APP_KEY (force)"
docker compose exec "$APP_SERVICE" php artisan key:generate --force

# --- clear caches (safe + fixes common 500 issues) ---
say "Clearing Laravel caches"
docker compose exec "$APP_SERVICE" php artisan config:clear || true
docker compose exec "$APP_SERVICE" php artisan cache:clear || true
docker compose exec "$APP_SERVICE" php artisan route:clear || true
docker compose exec "$APP_SERVICE" php artisan view:clear || true

# --- wait for DB (best effort) ---
say "Waiting for DB to be reachable (best effort)"
# Try for ~60s; if it still fails, we continue and let migrate show the error.
for i in $(seq 1 30); do
  if docker compose exec -T "$APP_SERVICE" php artisan migrate:status >/dev/null 2>&1; then
    break
  fi
  sleep 2
done

# --- migrate ---
say "Running migrations"
docker compose exec "$APP_SERVICE" php artisan migrate --force

# --- vite build (node service likely not running; use one-off containers) ---
say "Installing Node dependencies (npm install) via one-off container: $NODE_SERVICE"
docker compose run --rm "$NODE_SERVICE" npm install

say "Building frontend assets (npm run build) via one-off container: $NODE_SERVICE"
docker compose run --rm "$NODE_SERVICE" npm run build

# --- sanity check for manifest ---
say "Verifying Vite manifest exists"
docker compose exec "$APP_SERVICE" bash -lc 'test -f public/build/manifest.json && echo "OK: public/build/manifest.json exists" || (echo "Missing: public/build/manifest.json" && exit 1)'

# --- seed (optional but you used it) ---
say "Seeding database (DatabaseSeeder)"
docker compose exec "$APP_SERVICE" php artisan db:seed --force || true

say "Done."
say "Open: http://localhost"
