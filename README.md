# Valorant Stats Bot

A Discord bot built with **TypeScript** that shows Valorant player statistics via the **Tracker.gg** API.

## ✨ Features
- Slash command `/valorant <riot_id>` (e.g. `player#NA1`)
- Real‑time embed with rating, K/D/A, matches, wins, headshots
- Rate‑limited API calls with **Redis** cache (5 min TTL)
- Docker‑ready, CI‑friendly, configurable via `.env`

## 🚀 Getting Started
1. **Clone & install**
   ```bash
   git clone https://github.com/IN3PIRE/valorant-stats-bot.git
   cd valorant-stats-bot
   npm ci   # or yarn install / pnpm i
   ```
2. **Create a Discord bot**
   - Enable the *bot* scope, give it `Send Messages`, `Embed Links`, and `Slash Commands` permissions.
   - Copy the bot token.
3. **Grab a Tracker.gg API key** from https://tracker.gg/developer.
4. **Configure** – copy `.env.example` to `.env` and fill in the values.
5. **Run locally**
   ```bash
   npm run dev   # hot‑reloading with tsx
   ```
   The bot will register the `/valorant` command globally (may take up to an hour).

## 🐳 Docker
```bash
# Build
docker build -t valorant-stats-bot .
# Run (make sure .env is present or pass env vars)
docker run -d --env-file .env -p 3000:3000 valorant-stats-bot
```

## 📦 Scripts
| Script | Description |
|--------|--------------|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run the compiled bot |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run Jest tests (to be added) |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker image |

## 🛠️ Configuration (env vars)
- `DISCORD_TOKEN` – Discord bot token (**required**)
- `TRACKER_GG_API_KEY` – Tracker.gg API key (**required**)
- `PREFIX` – Command prefix (default `!v`, not used for slash commands)
- `REDIS_URL` – Connection string for Redis cache (default `redis://localhost:6379`)
- `LOG_LEVEL` – Winston log level (`info`, `debug`, `warn`, `error`)
- `MAX_API_REQUESTS_PER_MINUTE` – Hard limit for Tracker.gg calls (default `60`)

## 📈 Roadmap
- ⬜ Add ranking graph over time (store snapshots in DB)
- ⬜ Add support for other games (League, CS2) via same service layer
- ⬜ Unit & integration tests
- ⬜ Add optional analytics with PostgreSQL

---
*Created by IN3PIRE – open source under the MIT license.*
