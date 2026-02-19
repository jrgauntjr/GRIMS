# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

GRIMS is a monorepo with an Elixir/Phoenix API backend and a React (Vite) frontend. The backend serves JSON APIs consumed by the React SPA. PostgreSQL is the database.

## Repository Layout

- `backend/` — Phoenix 1.8 API app (app name: `:grims`). No HTML views or asset pipeline — API-only.
- `frontend/` — React 19 SPA built with Vite 7.
- `.tool-versions` — asdf version pinning (Erlang 27.2, Elixir 1.18.2, Node 22.14.0).

## Development Commands

All commands run from within WSL (Ubuntu). Use `asdf` for runtime version management.

### Backend (`backend/`)

```sh
# First-time setup (install deps, create DB, run migrations, seed)
mix setup

# Start the Phoenix server (default: http://localhost:4000)
mix phx.server
# or with interactive Elixir shell:
iex -S mix phx.server

# Run all tests (creates/migrates test DB automatically)
mix test

# Run a single test file
mix test test/path/to_test.exs

# Run a single test by line number
mix test test/path/to_test.exs:42

# Re-run only previously failed tests
mix test --failed

# Pre-commit check (compile warnings-as-errors, unlock unused deps, format, test)
mix precommit

# Format code
mix format

# Generate an Ecto migration
mix ecto.gen.migration migration_name

# Reset database (drop + create + migrate + seed)
mix ecto.reset

# Generate a JSON API resource (context + schema + controller + tests)
mix phx.gen.json ContextName SchemaName schema_names field:type
```

### Frontend (`frontend/`)

```sh
# Install dependencies
npm install

# Start dev server (default: http://localhost:5173)
npm run dev

# Production build
npm run build

# Lint
npm run lint

# Preview production build locally
npm run preview
```

## Architecture

### Backend

The Phoenix app follows standard Phoenix 1.8 conventions:

- **`lib/grims/`** — Business logic (contexts, schemas, repo). Add new domain modules here as contexts (e.g. `Grims.Accounts`, `Grims.Inventory`).
- **`lib/grims_web/`** — Web layer (router, controllers, JSON views, endpoint, telemetry).
- **`lib/grims_web/router.ex`** — All API routes live under the `scope "/api", GrimsWeb` block using the `:api` pipeline.
- **`config/`** — Per-environment config. Database credentials are in `dev.exs` / `test.exs`; production config uses `runtime.exs` with environment variables.
- **`priv/repo/migrations/`** — Ecto database migrations.
- **`test/`** — Tests mirror the `lib/` structure. `test/support/` has shared test helpers and fixtures.

The backend uses `--binary-id` so all Ecto schemas use UUIDs as primary keys by default.

### Frontend

Standard Vite + React structure:

- **`src/`** — React components, pages, hooks, and utilities.
- **`src/main.jsx`** — App entry point.
- **`public/`** — Static assets served as-is.
- **`vite.config.js`** — Vite configuration. Will need a proxy config added to forward `/api` requests to Phoenix during development.

### Cross-cutting

- The backend runs on port **4000**, the frontend dev server on port **5173**.
- In development, configure a Vite proxy in `vite.config.js` to forward `/api` calls to `http://localhost:4000`.
- In production, the React build output (`frontend/dist/`) should be served by Phoenix or a reverse proxy (nginx, etc.).

## Backend-Specific Guidelines

See `backend/AGENTS.md` for detailed Phoenix, Elixir, Ecto, and testing conventions. Key highlights:

- Use `mix precommit` before pushing changes.
- Use `:req` (Req) for HTTP requests — never HTTPoison, Tesla, or :httpc.
- Ecto schemas use `:string` for both `varchar` and `text` columns.
- Always preload associations in queries when they'll be accessed downstream.
- Generate migrations with `mix ecto.gen.migration` — never create migration files manually.
- In tests, use `start_supervised!/1` for processes and `Process.monitor/1` instead of `Process.sleep/1`.
