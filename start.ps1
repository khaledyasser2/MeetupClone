# first-time-start.ps1
# Windows-native bootstrap for this repo (PowerShell).
# Mirrors the bash script steps:
# - docker compose up -d --build
# - composer install
# - ensure .env + key:generate
# - clear caches
# - migrate
# - npm install + build via one-off node container
# - seed (best-effort)

$ErrorActionPreference = "Stop"

function Say($msg) {
  Write-Host ""
  Write-Host "==> $msg" -ForegroundColor Cyan
}

function Die($msg) {
  Write-Host ""
  Write-Host "ERROR: $msg" -ForegroundColor Red
  exit 1
}

# Config (override via env vars if needed)
$APP_SERVICE = if ($env:APP_SERVICE) { $env:APP_SERVICE } else { "app" }
$NODE_SERVICE = if ($env:NODE_SERVICE) { $env:NODE_SERVICE } else { "node" }
$BACKEND_DIR = if ($env:BACKEND_DIR) { $env:BACKEND_DIR } else { "backend" }

# --- preflight ---
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  Die "Docker not found. Install Docker Desktop."
}

# Check docker compose v2
try {
  docker compose version | Out-Null
} catch {
  Die "'docker compose' not available. Ensure Docker Desktop is installed and Compose v2 is enabled."
}

if (-not (Test-Path ".\docker-compose.yml")) {
  Die "docker-compose.yml not found in current directory. Run this from repo root."
}

if (-not (Test-Path ".\$BACKEND_DIR")) {
  Die "Backend dir '$BACKEND_DIR' not found."
}

# --- start containers ---
Say "Starting containers (build if needed)"
docker compose up -d --build

# --- composer install ---
Say "Installing PHP dependencies (composer install) in service: $APP_SERVICE"
docker compose exec $APP_SERVICE composer install --no-interaction --prefer-dist

# --- ensure .env exists ---
Say "Ensuring .env exists (copy from .env.example if missing)"
docker compose exec $APP_SERVICE bash -lc 'test -f .env || cp .env.example .env' | Out-Null

# --- generate app key ---
Say "Generating APP_KEY"
docker compose exec $APP_SERVICE php artisan key:generate --force

# --- clear caches ---
Say "Clearing Laravel caches"
try { docker compose exec $APP_SERVICE php artisan config:clear | Out-Null } catch {}
try { docker compose exec $APP_SERVICE php artisan cache:clear  | Out-Null } catch {}
try { docker compose exec $APP_SERVICE php artisan route:clear  | Out-Null } catch {}
try { docker compose exec $APP_SERVICE php artisan view:clear   | Out-Null } catch {}

# --- best-effort wait for DB ---
Say "Waiting for DB to be reachable (best effort)"
for ($i = 1; $i -le 30; $i++) {
  try {
    docker compose exec -T $APP_SERVICE php artisan migrate:status | Out-Null
    break
  } catch {
    Start-Sleep -Seconds 2
  }
}

# --- migrate ---
Say "Running migrations"
docker compose exec $APP_SERVICE php artisan migrate --force

# --- node install/build via one-off container ---
Say "Installing Node dependencies (npm install) via one-off container: $NODE_SERVICE"
docker compose run --rm $NODE_SERVICE npm install

Say "Building frontend assets (npm run build) via one-off container: $NODE_SERVICE"
docker compose run --rm $NODE_SERVICE npm run build

# --- verify manifest exists ---
Say "Verifying Vite manifest exists"
docker compose exec $APP_SERVICE bash -lc 'test -f public/build/manifest.json && echo "OK: public/build/manifest.json exists" || (echo "Missing: public/build/manifest.json" && exit 1)'

# --- seed (best-effort) ---
Say "Seeding database (best effort)"
try {
  docker compose exec $APP_SERVICE php artisan db:seed --force | Out-Null
} catch {
  Write-Host "Seed failed (continuing). You can run manually: docker compose exec $APP_SERVICE php artisan db:seed" -ForegroundColor Yellow
}

Say "Done."
Write-Host "Open: http://localhost:8080" -ForegroundColor Green
