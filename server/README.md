# The Data Vault - Backend API (FastAPI + uv)

High-performance, lightweight FastAPI backend powering the real-time competitive scoring and leaderboard for ABN AMRO's The Data Vault.

## Running Locally with `uv`

### 1. Run the Development Server
From the project root:
```bash
cd server
uv run uvicorn main:app --reload --port 8000
```
Or from the root directory:
```bash
uv run --project server uvicorn server.main:app --reload --port 8000
```

### 2. Interactive Swagger API Docs
Open your browser to:
[http://localhost:8000/docs](http://localhost:8000/docs)

### 3. Database
* **Local development**: Automatically creates and uses SQLite database (`vault.db`) in the `server` directory with zero setup.
* **Production deployment (Render / Koyeb / Neon / Supabase)**: Set the environment variable `DATABASE_URL=postgresql://user:password@host/dbname` and it will automatically connect to PostgreSQL.

