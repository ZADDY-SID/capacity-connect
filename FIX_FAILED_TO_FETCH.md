# Fix: "Failed to fetch" on Registration (capacity-connect)

## 1. Why you see this error

Your site is split in two parts:

| Part | Where it runs now |
|------|-------------------|
| Frontend (React/Vite) | ✅ Deployed on Vercel: `https://capacity-connect-ashy.vercel.app` |
| Backend (Flask API) | ❌ **Not deployed** — only exists on your laptop as `http://localhost:5000` |

Look at the old code in `frontend/src/services/api.ts`:

```ts
const API_BASE = import.meta.env.PROD
  ? (import.meta.env.VITE_API_URL || 'http://localhost:5000')  // ← problem
  : '/api';
```

On Vercel (`PROD=true`) with no `VITE_API_URL` set, the browser tries to call
`http://localhost:5000/auth/register` **from the visitor's own computer**.
There is no server there, and browsers also block `http://` calls from an
`https://` page. Result: `TypeError: Failed to fetch`.

There were 3 more hidden bugs that would have broken you even after deploying:

1. **Missing `/api` prefix** — Flask routes live at `/api/auth/...` but the prod
   fallback had no `/api`, so it would 404.
2. **Session cookies blocked cross-site** — `config.py` used `SameSite=Lax, Secure=False`,
   which browsers reject when frontend (Vercel) and backend (Render) are on
   different domains. Login would never "stick".
3. **Hardcoded CORS list** — no way to configure the frontend URL via env vars.

All of these are now fixed in this working copy. You just need to push,
deploy the backend, and connect the two.

---

## 2. What I already fixed in code

| File | Fix |
|------|-----|
| `frontend/src/services/api.ts` | Smart `VITE_API_URL` handling (accepts URL with or without `/api`), clear console warning + friendly error instead of raw "Failed to fetch" |
| `backend/config.py` | Production cookie mode (`SameSite=None; Secure=True`) on Render, `DATABASE_URL` support (Postgres) with SQLite fallback |
| `backend/app.py` | CORS origins read from `FRONTEND_URL` / `ALLOWED_ORIGINS` env vars + defaults |
| `backend/requirements.txt` | Added `gunicorn` + `psycopg2-binary` for hosting |
| `render.yaml` (new) | One-click Render Blueprint for the backend |
| `backend/Procfile` (new) | Fallback start command for Render/Railway |
| `frontend/.env.example` (new) | Documents the required `VITE_API_URL` variable |
| `.gitignore` | Allow tracking `.env.example` |

TypeScript (`tsc -b`) and Python (`py_compile`) both pass.

---

## 3. Step-by-step: get registration working

### Step A — Push the fixed code to GitHub

```bash
cd capacity-connect
git add -A
git commit -m "Fix production backend wiring: VITE_API_URL, CORS, secure cookies, Render deploy files"
git push origin main
```

(If your default branch is `master`, use `git push origin master`.)

### Step B — Deploy the backend on Render (free)

1. Go to https://dashboard.render.com → **New → Web Service** (or **New → Blueprint** and pick this repo — the `render.yaml` fills everything automatically).
2. Connect your GitHub repo `ZADDY-SID/capacity-connect`.
3. Use these settings (if doing manual Web Service):
   - **Name:** `capacity-connect-backend`
   - **Region:** closest to you (e.g. Singapore)
   - **Root Directory:** `backend`
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 120`
   - **Instance type:** Free
4. **Environment variables** (Render → Environment tab):
   | Key | Value |
   |-----|-------|
   | `FLASK_ENV` | `production` |
   | `PYTHON_VERSION` | `3.11.0` |
   | `SECRET_KEY` | click **Generate** |
   | `FRONTEND_URL` | `https://capacity-connect-ashy.vercel.app` |
5. Click **Create Web Service** and wait ~2-4 minutes.
6. Copy your backend URL, e.g. `https://capacity-connect-backend-xxxx.onrender.com`.

### Step C — Seed the demo data (one time)

Render free disks are ephemeral, so the database starts empty — demo logins
won't exist until you seed:

1. In Render → your service → **Shell** tab.
2. Run:
   ```bash
   python seed.py
   ```
   You should see `Database seeded successfully with rich demo data!`

> ⚠️ `seed.py` wipes all tables. Run it once for the demo; don't re-run it
> after real users register (or their accounts will be deleted).

### Step D — Verify the backend is alive

Open in your browser:

```
https://YOUR-BACKEND-NAME.onrender.com/api/health
```

Expected:

```json
{"status": "healthy", "platform": "Capacity Connect", "tagline": "Learn. Grow. Achieve."}
```

> ⏳ First request on Render free tier takes 30-60s (cold start). Refresh once if it spins.

### Step E — Connect Vercel frontend to the backend

1. Go to https://vercel.com → your project `capacity-connect` → **Settings → Environment Variables**.
2. Add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://YOUR-BACKEND-NAME.onrender.com/api` ← note the `/api` at the end
   - **Environments:** ✅ Production (and Preview is fine too)
3. **You MUST redeploy** — Vite bakes env vars in at build time:
   **Deployments tab → ⋯ on latest → Redeploy** (uncheck "use existing build cache" is safer).
4. Wait for the build to finish.

### Step F — Test

1. Open `https://capacity-connect-ashy.vercel.app`.
2. If the backend was sleeping, wait ~60s, then try **Get Started → Complete Registration**.
3. Also test demo logins:
   - `trainee@capacityconnect.com` / `trainee123`
   - `trainer@capacityconnect.com` / `trainer123`
   - `admin@capacityconnect.com` / `admin123`

---

## 4. Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Still "cannot reach the backend, may be sleeping" | Render free cold start | Wait 60s, retry. Open `/api/health` in a tab first to wake it. |
| "Backend not configured" message | `VITE_API_URL` missing at build time | Check Vercel env var spelling, then **Redeploy** (not just save). |
| CORS error in console | Backend doesn't allow your Vercel URL | Check `FRONTEND_URL` on Render matches exactly (no trailing slash), then Manual Deploy. |
| Login works but refresh logs you out | Cookies blocked (old code) | Make sure you pushed the new `config.py` and Render redeployed with `FLASK_ENV=production`. |
| Register says "email already exists" | You already created it / seeded demo users | Log in instead, or use a fresh email. |
| Mixed-content / http error | `VITE_API_URL` is `http://` | Must be `https://` Render URL. |

### How to debug in 30 seconds

1. Open the site → press `F12` → **Console** tab → try registering.
2. If you see the `[Capacity Connect] VITE_API_URL is not set!` warning, the env var didn't make it into the build → redo Step E.
3. Go to **Network** tab → find the failed `register` request → check the **Request URL**. It must be `https://...onrender.com/api/auth/register`. If it's `localhost`, the env var is missing.

---

## 5. Local development still works as before

```bash
# Terminal 1
cd backend
python app.py        # http://127.0.0.1:5000

# Terminal 2
cd frontend
npm run dev          # http://localhost:5173 (proxies /api → Flask)
```

No `VITE_API_URL` needed locally — dev uses the Vite `/api` proxy.

---

## 6. Going further (optional, later)

- **Persistent Postgres:** Render free SQLite resets on redeploy. Add a free Render Postgres instance and set its `DATABASE_URL` on the web service — `config.py` already supports it.
- **Custom domain:** if you add one on Vercel, also append it to Render's `FRONTEND_URL` (comma-separated).
- **Uptime ping:** free Render sleeps after 15 min idle. A free cron ping to `/api/health` every 10 min keeps demos snappy.
