#!/bin/sh
set -e

echo "[MediTrack] Initializing runtime container..."

# Wait for PostgreSQL if DB_ENGINE is postgresql
if [ "$DB_ENGINE" = "django.db.backends.postgresql" ] || [ -z "$DB_ENGINE" ]; then
  DB_HOST="${DB_HOST:-db}"
  DB_PORT="${DB_PORT:-5432}"

  echo "[MediTrack] Waiting for PostgreSQL at $DB_HOST:$DB_PORT..."
  while ! nc -z "$DB_HOST" "$DB_PORT"; do
    sleep 0.5
  done
  echo "[MediTrack] PostgreSQL is ready and accepting connections."
fi

# Apply migrations
echo "[MediTrack] Applying database migrations..."
python manage.py migrate --noinput

# Seed demo data
echo "[MediTrack] Seeding demo data..."
python manage.py seed_demo

# Collect static files if in production mode
if [ "$DJANGO_SETTINGS_MODULE" = "meditrack.settings.prod" ]; then
  echo "[MediTrack] Collecting static files..."
  python manage.py collectstatic --noinput
fi

echo "[MediTrack] Starting Gunicorn application server on port 8000..."
exec gunicorn meditrack.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers 3 \
  --timeout 60 \
  --access-logfile - \
  --error-logfile -
