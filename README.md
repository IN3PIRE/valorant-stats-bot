# Valorant Stats Bot 🎮🤖

[![License](https://img.shields.io/github/license/IN3PIRE/valorant-stats-bot)](https://github.com/IN3PIRE/valorant-stats-bot/blob/main/LICENSE)
[![Stars](https://img.shields.io/github/stars/IN3PIRE/valorant-stats-bot?style=social)](https://github.com/IN3PIRE/valorant-stats-bot/stargazers)
[![Discord](https://img.shields.io/discord/1062168623308121320?logo=discord&label=Discord%20Server)](https://discord.gg/your-invite)
[![CI](https://github.com/IN3PIRE/valorant-stats-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/IN3PIRE/valorant-stats-bot/actions/workflows/ci.yml)

A **modern, Type‑Script Discord bot** that displays Valorant player statistics using the **Tracker.gg** API.

## ✨ Features
- **Slash command** `/valorant <riot_id>` (e.g. `player#NA1`).
- Rich embed with rating, K/D/A, matches played, wins, headshots.
- **Rate‑limited** API calls with a **Redis** cache (5 min TTL).
- Fully **Dockerised** and ready for CI/CD.
- Environment‑driven configuration (`.env`).
- Extensible architecture – add more games or analytics later.

## 🚀 Quick Start
```bash
# Clone & install dependencies
git clone https://github.com/IN3PIRE/valorant-stats-bot.git
cd valorant-stats-bot
npm ci   # or yarn install / pnpm i
```

### 1️⃣ Create a Discord Bot
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications).
2. Create a new application → *Bot* → enable **Send Messages**, **Embed Links**, **Slash Commands**.
3. Copy the **Bot Token**.

### 2️⃣ Obtain a Tracker.gg API Key
Sign up at <https://tracker.gg/developer> and generate an API key.

### 3️⃣ Configure the bot
```bash
cp .env.example .env
# Edit .env and fill in the values:
# DISCORD_TOKEN=your_bot_token
# TRACKER_GG_API_KEY=your_tracker_api_key
```

### 4️⃣ Run locally (hot‑reload)
```bash
npm run dev
```
The bot registers the `/valorant` command globally (propagation may take up to an hour).

## 🐳 Docker
```bash
# Build the image
docker build -t valorant-stats-bot .
# Run (ensure .env is present or pass env vars)
docker run -d --env-file .env -p 3000:3000 valorant-stats-bot
```

## 📦 NPM Scripts
| Script | Description |
|---|---|
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Start the compiled bot |
| `npm run dev` | Hot‑reloading with **tsx** |
| `npm run lint` | Lint with **ESLint** |
| `npm test` | Run Jest tests (to be added) |
| `npm run docker:build` | Build Docker image |
| `npm run docker:run` | Run Docker image |

## 🛠️ Configuration (environment variables)
| Variable | Description | Default |
|---|---|---|
| `DISCORD_TOKEN` | Discord bot token (**required**) | – |
| `TRACKER_GG_API_KEY` | Tracker.gg API key (**required**) | – |
| `PREFIX` | Command prefix (fallback for non‑slash) | `!v` |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `LOG_LEVEL` | Winston log level (`error`, `warn`, `info`, `debug`) | `info` |
| `MAX_API_REQUESTS_PER_MINUTE` | Hard limit for Tracker.gg calls | `60` |
| `RATE_LIMIT_WINDOW_MS` | Window for the above limit (ms) | `60000` |

## 📈 Roadmap
- ⬜ Store daily snapshots to chart rank progression.
- ⬜ Add support for other games (League of Legends, CS2) via the same service layer.
- ⬜ Write comprehensive unit & integration tests.
- ⬜ Optional analytics dashboard (PostgreSQL + Grafana).

## 🤝 Contributing
We love contributions! Please see the **[CONTRIBUTING.md](CONTRIBUTING.md)** for guidelines on how to propose changes, submit pull requests, and run tests.

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---
*Made with ❤️ by the IN3PIRE team.*
