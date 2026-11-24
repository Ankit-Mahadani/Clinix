#!/bin/sh
set -e

PORT="${PORT:-8000}"
echo "[MediTrack] Initializing runtime container on port ${PORT}..."

# Verify database connection if using PostgreSQL or DATABASE_URL
if [ "$DB_ENGINE" = "django.db.backends.postgresql" ] || [ -n "$DATABASE_URL" ]; then
  echo "[MediTrack] Verifying database connectivity..."
  python -c "
import sys, time, os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'meditrack.settings.prod' if os.environ.get('DJANGO_SETTINGS_MODULE') == 'meditrack.settings.prod' else 'meditrack.settings.dev')
django.setup()
from django.db import connection
for attempt in range(30):
    try:
        connection.ensure_connection()
        print('[MediTrack] Database connection established successfully.')
        sys.exit(0)
    except Exception as exc:
        time.sleep(1)
print('[MediTrack] Notice: Database connection verification timed out, proceeding to migration...')
" || true
fi

# Apply database migrations
echo "[MediTrack] Applying database migrations..."
python manage.py migrate --noinput

# Collect static files for WhiteNoise
echo "[MediTrack] Collecting static assets..."
python manage.py collectstatic --noinput --clear

# Seed demo clinical records (default to true for demonstration/review environments)
SEED_DEMO="${SEED_DEMO:-true}"
if [ "$SEED_DEMO" = "true" ] || [ "$SEED_DEMO" = "1" ]; then
  echo "[MediTrack] Seeding demo clinical data..."
  python manage.py seed_demo || echo "[MediTrack] Demo seeding skipped or already present."
fi

echo "[MediTrack] Starting Gunicorn WSGI application server on 0.0.0.0:${PORT}..."
exec gunicorn meditrack.wsgi:application \
  --bind "0.0.0.0:${PORT}" \
  --workers "${GUNICORN_WORKERS:-3}" \
  --threads "${GUNICORN_THREADS:-2}" \
  --timeout "${GUNICORN_TIMEOUT:-60}" \
  --access-logfile - \
  --error-logfile -
