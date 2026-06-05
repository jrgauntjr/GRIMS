# AGENTS.md

This file provides guidance to AI coding agents when working with code in this repository.

## Project Overview

GRIMS is a monorepo with an Elixir/Phoenix JSON API backend and a React (Vite) frontend. PostgreSQL is the database.

This application is a retro game shop inventory manager with built-in job scheduling, reporting (including custom report creation), and a to-do list.

In development, Vite serves the React UI and proxies `/api` to Phoenix. In production, Phoenix serves the built SPA from `priv/static/` via `PageController` while exposing JSON under `/api`.

## Repository Layout

- `backend/` — Phoenix 1.8 app (app name: `:grims`). JSON API and production SPA host.
- `frontend/` — React 19 SPA built with Vite 7.
- `.tool-versions` — asdf version pinning (Erlang 27.2, Elixir 1.18.2, Node 22.14.0).

## Where to look

| Topic | Document |
|-------|----------|
| React, routing, API client, UI patterns | `frontend/AGENTS.md` |
| Phoenix, Ecto, JSON API, tests | `backend/AGENTS.md` |
| Product status and roadmap (humans) | `README.md` |

## Prerequisites

- PostgreSQL running locally
- `asdf install` from `.tool-versions`
- First-time backend: `cd backend && mix setup`
- First-time frontend: `cd frontend && npm install`

All commands run from Ubuntu or WSL on Windows. Use `asdf` for runtime versions.

## Run the application

Development uses two terminal sessions:

1. **Backend** — `cd backend && mix phx.server` → http://localhost:4000
2. **Frontend** — `cd frontend && npm run dev` → http://localhost:5173

The Vite dev server proxies `/api` to the Phoenix server. Do not hardcode `http://localhost:4000` in frontend code.

### Pre-push checklist

- Backend: `cd backend && mix precommit`
- Frontend: `cd frontend && npm run lint`

Full command reference lives in `backend/AGENTS.md` and `frontend/AGENTS.md`.

## Adding a full-stack feature

1. Backend: migration → context/schema → controller + JSON view → controller tests (`backend/AGENTS.md`)
2. Frontend: API module in `src/api/` → component/page → route + nav link (`frontend/AGENTS.md`)
3. Run `mix precommit` and `npm run lint` before pushing

## Feature maturity

Core areas (todos, jobs/scheduling, inventory, reports) are implemented but still evolving. Security hardening and HTTPS are planned — do not remove or weaken security-related code without being asked. See `README.md` for the current human-facing roadmap.

## Agent guidelines

See `frontend/AGENTS.md` for React, routing, API client, and styling conventions.

See `backend/AGENTS.md` for Phoenix, Elixir, Ecto, JSON API, and testing conventions.
