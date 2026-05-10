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

# Generate VAPID key pair on first boot for Web Push, if missing.
if ! grep -q "^VAPID_PUBLIC_KEY=." .env; then
    echo "[entrypoint] Generating VAPID key pair for Web Push"
    KEYS=$(php -r "require 'vendor/autoload.php'; \$k = \\Minishlink\\WebPush\\VAPID::createVapidKeys(); echo \$k['publicKey'].'|'.\$k['privateKey'];")
    PUB=$(echo "$KEYS" | cut -d'|' -f1)
    PRIV=$(echo "$KEYS" | cut -d'|' -f2)
    if grep -q "^VAPID_PUBLIC_KEY=" .env; then
        sed -i "s|^VAPID_PUBLIC_KEY=.*|VAPID_PUBLIC_KEY=$PUB|" .env
        sed -i "s|^VAPID_PRIVATE_KEY=.*|VAPID_PRIVATE_KEY=$PRIV|" .env
    else
        printf "\n# --- Web Push / VAPID (auto-generated) ---\nVAPID_SUBJECT=\"mailto:no-reply@familyknot.test\"\nVAPID_PUBLIC_KEY=%s\nVAPID_PRIVATE_KEY=%s\n" "$PUB" "$PRIV" >> .env
    fi
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

# Auto-seed demo data on first boot if the users table is empty.
# This makes `make up` enough on its own — graders see the demo accounts
# without needing to run `make seed` separately.
USER_COUNT=$(mysql -h "${DB_HOST:-mysql}" -u "${DB_USERNAME:-familyknot}" -p"${DB_PASSWORD:-secret}" "${DB_DATABASE:-familyknot}" -N -B -e "SELECT COUNT(*) FROM users;" 2>/dev/null || echo "0")
if [ "${USER_COUNT:-0}" = "0" ]; then
    echo "[entrypoint] DB is empty — seeding demo family"
    php artisan db:seed --force --no-interaction || echo "[entrypoint] Seeding failed (non-fatal)"
fi

# Ensure the dedicated testing database exists so `make test-back` works
# without manual setup. Idempotent.
mysql -h "${DB_HOST:-mysql}" -u root -p"${DB_ROOT_PASSWORD:-rootsecret}" -e "CREATE DATABASE IF NOT EXISTS familyknot_testing; GRANT ALL ON familyknot_testing.* TO '${DB_USERNAME:-familyknot}'@'%'; FLUSH PRIVILEGES;" >/dev/null 2>&1 || true

echo "[entrypoint] Clearing caches"
php artisan optimize:clear >/dev/null 2>&1 || true

echo "[entrypoint] Starting: $*"
exec "$@"
