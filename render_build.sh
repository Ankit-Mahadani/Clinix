#!/usr/bin/env bash
# Exit immediately if a command exits with a non-zero status
set -o errexit

echo "[Render Build] Upgrading pip and installing requirements..."
pip install --upgrade pip
pip install -r requirements.txt

echo "[Render Build] Collecting static assets with WhiteNoise..."
python manage.py collectstatic --noinput --clear

echo "[Render Build] Applying database migrations..."
python manage.py migrate --noinput

echo "[Render Build] Seeding demo clinical data..."
python manage.py seed_demo || echo "[Render Build] Seeding finished."

echo "[Render Build] Build completed successfully."
