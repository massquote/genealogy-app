#!/bin/sh
set -e

cd /var/www/html

# Make Laravel-writable directories writable by both host user and www-data
echo "[entrypoint] Fixing permissions on storage/ and bootstrap/cache/"
mkdir -p storage/framework/{cache,sessions,views,testing} storage/logs bootstrap/cache
chmod -R 777 storage bootstrap/cache 2>/dev/null || true

if [ ! -f .env ]; then
    echo "[entrypoint] Creating .env from .env.example"
    cp .env.example .env
fi

if [ ! -d vendor ]; then
    echo "[entrypoint] Installing PHP dependencies (first run)"
    composer install --no-interaction --prefer-dist --optimize-autoloader
fi

# Generate APP_KEY if missing
if ! grep -q "^APP_KEY=base64" .env; then
    echo "[entrypoint] Generating APP_KEY"
    php artisan key:generate --no-interaction --force
fi

# Wait for MySQL (defensive — depends_on with healthcheck should handle this)
echo "[entrypoint] Waiting for MySQL..."
ATTEMPTS=0
until mysql -h "${DB_HOST:-mysql}" -u "${DB_USERNAME:-familyknot}" -p"${DB_PASSWORD:-secret}" -e "SELECT 1" >/dev/null 2>&1; do
    ATTEMPTS=$((ATTEMPTS + 1))
    if [ $ATTEMPTS -gt 30 ]; then
        echo "[entrypoint] MySQL did not become available in time"
        break
    fi
    sleep 1
done

echo "[entrypoint] Running migrations"
php artisan migrate --force --no-interaction || echo "[entrypoint] Migrations skipped or failed (non-fatal on first boot)"

echo "[entrypoint] Clearing caches"
php artisan optimize:clear >/dev/null 2>&1 || true

echo "[entrypoint] Starting: $*"
exec "$@"
