# 🚀 MediTrack Production Deployment & Hosting Guide

This guide provides tested, step-by-step deployment recipes for hosting the **MediTrack** healthcare management platform across major cloud providers (Render, Railway, Fly.io, AWS/VPS Docker, and Vercel/Netlify).

---

## 📋 Production Readiness Checklist

- [x] **WSGI Production Server**: Gunicorn multi-worker configuration with configurable threads, timeout, and logging.
- [x] **Static Asset Pipeline**: `whitenoise.storage.CompressedManifestStaticFilesStorage` serves compressed, cached static files directly from Python without Nginx/S3 dependencies.
- [x] **Universal Database Connection**: `dj-database-url` automatically parses single-string `DATABASE_URL` connections provided by Render, Railway, Supabase, Neon, AWS RDS, and Heroku.
- [x] **Dynamic Port Binding**: Application automatically binds to cloud-assigned `$PORT` (Render, Railway, Fly.io, Heroku) or defaults to `8000`.
- [x] **Reverse Proxy SSL Termination**: `SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")` enables safe SSL proxying behind load balancers and Cloudflare.
- [x] **Host & CORS Whitelisting**: `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, and `CSRF_TRUSTED_ORIGINS` accept cloud wildcard patterns (`.onrender.com`, `.railway.app`, `.vercel.app`).
- [x] **Health Check Endpoint**: Public `/api/health/` checks database readiness with 200 OK.
- [x] **Automated Migrations & Demo Seeding**: Built-in runtime entrypoint runs `migrate`, `collectstatic`, and seeds initial demo records automatically.

---

## 1. 🟣 Deploy to Render (Recommended — 1-Click Blueprint)

Render provides free PostgreSQL databases and web services. A pre-configured [`render.yaml`](../render.yaml) is included in the root directory.

### Steps:
1. Push your repository to GitHub.
2. Log into [Render Dashboard](https://dashboard.render.com).
3. Click **New +** → **Blueprint**.
4. Connect your `Clinix` (or fork) repository.
5. Render will automatically detect `render.yaml` and configure:
   - **Database**: PostgreSQL 16 (`meditrack-db`)
   - **Backend Web Service**: Python 3.12 Gunicorn API (`meditrack-api`)
   - **Frontend Static Site**: React Vite SPA (`meditrack-frontend`)
6. Click **Apply**.
7. Once deployment finishes (~2 minutes):
   - Your API will be live at `https://meditrack-api.onrender.com/api/`
   - Built-in UI at `https://meditrack-api.onrender.com/`
   - React SPA at `https://meditrack-frontend.onrender.com/`
   - Swagger OpenAPI docs at `https://meditrack-api.onrender.com/api/docs/`

---

## 2. 🚂 Deploy to Railway

Railway natively detects the included [`Procfile`](../Procfile) and [`railway.json`](../railway.json).

### Steps:
1. Log into [Railway](https://railway.app).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select this repository.
4. Add a PostgreSQL database service in Railway (**New Service** → **Database** → **Add PostgreSQL**).
5. In your web service settings, add the following Environment Variables:
   ```env
   DJANGO_SETTINGS_MODULE=meditrack.settings.prod
   SECRET_KEY=your-generated-super-secure-secret-key-32chars
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   DEBUG=False
   CORS_ALLOW_ALL_ORIGINS=True
   ```
6. Railway will automatically build the image, run migrations, seed demo data, and route traffic to the container.

---

## 3. 🎈 Deploy to Fly.io

A production [`fly.toml`](../fly.toml) is included for microVM hosting.

### Steps:
```bash
# 1. Install Fly CLI (if not installed)
# macOS/Linux: curl -L https://fly.io/install.sh | sh
# Windows: iwr https://fly.io/install.ps1 -useb | iex

# 2. Authenticate
fly auth login

# 3. Create Postgres cluster
fly postgres create --name meditrack-db --vm-size shared-cpu-1x --initial-cluster-size 1

# 4. Launch app and attach database
fly launch --no-deploy
fly postgres attach meditrack-db

# 5. Set production secret key
fly secrets set SECRET_KEY="generate-random-secure-secret-key-meditrack"

# 6. Deploy
fly deploy
```

---

## 4. 🐳 Self-Hosted Production Docker / VPS (AWS EC2 / DigitalOcean / Linode)

Use the provided [`docker-compose.prod.yml`](../docker-compose.prod.yml) for full orchestration on any Ubuntu/Debian Linux VPS:

```bash
# 1. Clone repository on server
git clone https://github.com/Ankit-Mahadani/Clinix.git /opt/clinix
cd /opt/clinix

# 2. Copy and customize production environment
cp .env.example .env
nano .env # Set SECRET_KEY, DB_PASSWORD, ALLOWED_HOSTS

# 3. Launch stack with Docker Compose
docker compose -f docker-compose.prod.yml up -d --build

# 4. Verify running services
docker compose -f docker-compose.prod.yml ps
```

---

## 5. ⚡ Deploy React Frontend Separately (Vercel / Netlify)

If you wish to host the React SPA separately from the backend:

### Vercel:
1. Import repository in [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-api.onrender.com/api`
4. Deploy! Rewrites are handled automatically by [`frontend/vercel.json`](../frontend/vercel.json).

### Netlify:
1. Import repository in [Netlify](https://netlify.com).
2. Set **Base directory** to `frontend`, **Build command** to `npm run build`, and **Publish directory** to `dist`.
3. Add Environment Variable:
   - `VITE_API_URL` = `https://your-backend-api.onrender.com/api`
4. Deploy! HTML5 routing is handled automatically by [`frontend/netlify.toml`](../frontend/netlify.toml).

---

## 🔑 Production Environment Variables Reference

| Variable | Description | Required | Default / Example |
|---|---|---|---|
| `DJANGO_SETTINGS_MODULE` | Active Django settings module | Yes | `meditrack.settings.prod` |
| `SECRET_KEY` | Cryptographic signing secret | Yes in Prod | Long random string (≥ 50 chars) |
| `DATABASE_URL` | Full database connection string | Yes | `postgresql://user:pass@host:5432/meditrack_db` |
| `DEBUG` | Enable/disable debug mode | No | `False` |
| `ALLOWED_HOSTS` | Comma-separated hostnames | No | `localhost,127.0.0.1,.onrender.com,.railway.app` |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | No | `https://your-frontend.vercel.app` |
| `CORS_ALLOW_ALL_ORIGINS`| Allow all origins | No | `False` (or `True` for public API testing) |
| `CSRF_TRUSTED_ORIGINS` | Permitted CSRF origins | No | `https://*.onrender.com,https://*.vercel.app` |
| `SECURE_SSL_REDIRECT` | Force HTTP to HTTPS redirection | No | `False` (handled by cloud load balancer) |
| `SEED_DEMO` | Seed demo data on initial startup | No | `true` |
| `PORT` | Web server listening port | No | `8000` (or injected by cloud provider) |
