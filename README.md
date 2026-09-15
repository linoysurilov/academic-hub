# Personal AI Hub

Frontend and backend are separate so they can be hosted independently:

| App | Directory | Host |
| --- | --- | --- |
| React PWA | `frontend/` | [Vercel](https://vercel.com) — set **Root Directory** to `frontend` |
| FastAPI | `backend/` | [Render](https://render.com) or [Railway](https://railway.app) — set root to `backend` |

## Environment

Copy the templates, then fill real values:

- `.env.example` — map of every cloud variable
- `frontend/.env.example` → `frontend/.env` (or Vercel project env)
- `backend/.env.example` → `backend/.env` (or Render / Railway env)

After the frontend URL exists, set backend `FRONTEND_ORIGINS` to that origin (and keep `FRONTEND_ORIGIN_REGEX` for Vercel previews). After the API URL exists, set frontend `VITE_API_BASE` to it (no trailing slash).

## Local

```bash
docker compose up db
# backend
cd backend && pip install -r requirements.txt && uvicorn main:app --reload --port 8000
# frontend
cd frontend && npm install && npm run dev
```

On a phone on the same network, open `http://<your-lan-ip>:5173`. Vite is bound to `0.0.0.0`. Install as a home-screen app from the browser share sheet (Add to Home Screen).
