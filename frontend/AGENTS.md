# AGENTS.md

This file provides guidance to AI coding agents when working with the GRIMS React frontend.

For monorepo setup, ports, and running both apps, see the root `AGENTS.md`.

## Project Overview

The frontend is a React 19 SPA built with Vite 7. It is the user-facing UI for GRIMS. All data comes from the Phoenix JSON API under `/api`, proxied to `http://localhost:4000` during development.

## Repository Layout

- **`src/main.jsx`** — App entry point; mounts `App` into the DOM.
- **`src/App.jsx`** — Top-level layout, navigation, and React Router routes.
- **`src/pages/`** — Route-level components. Keep these thin; delegate UI and logic to `components/`.
- **`src/components/`** — Feature components and their co-located CSS files.
- **`src/api/`** — API client modules. All HTTP calls go through `request.js`.
- **`src/data/`** — Static config and built-in report definitions (not fetched from the API).
- **`src/utils/`** — Shared frontend utilities.
- **`src/assets/`** — Images and other imported static assets.
- **`public/`** — Static files served as-is by Vite.
- **`vite.config.js`** — Vite config, including the `/api` dev proxy.

## Development Commands

All commands run from `frontend/`:

```sh
# Install dependencies (first time or after package changes)
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Production build (output in dist/)
npm run build

# Lint
npm run lint

# Preview production build locally
npm run preview
```

There is no frontend test script yet. Do not invent one unless asked.

Run `npm run lint` after frontend changes. The backend uses `mix precommit` separately.

## App map

| Route | Page | Component(s) | API module |
|-------|------|--------------|------------|
| `/` | `pages/Home.jsx` | `TodoList`, `JobSchedule` (read-only) | `api/todos.js`, `api/schedules.js` |
| `/todos` | `pages/Todos.jsx` | `TodoList` | `api/todos.js` |
| `/jobs` | `pages/Jobs.jsx` | `JobSchedule` | `api/schedules.js` |
| `/inventory` | `pages/Inventory.jsx` | `InventoryManage` | `api/inventories.js` |
| `/reports/*` | `pages/Reports.jsx` | `BuiltReports`, `ReportCreate`, `ReportDetail`, `ReportResults` | `api/reports.js` |

Game search for inventory uses `GET /api/games/search` via `searchGames()` in `api/inventories.js`.

## Architecture

### Routing

- Top-level routes live in `src/App.jsx` using `react-router-dom`.
- Nested routes belong in the matching page component (see `src/pages/Reports.jsx`).
- Add new nav links in `App.jsx` when introducing a new top-level page.

### Pages vs components

- **Pages** wire a route to one or more components.
- **Components** own state, effects, forms, and feature UI.
- Prefer adding or extending a component over putting feature logic directly in a page.

### API layer

- Use `src/api/request.js` for all HTTP requests. Do not add axios or other HTTP clients.
- Add domain-specific functions in `src/api/<resource>.js` (e.g. `todos.js`, `schedules.js`).
- API modules should export named async functions (`fetchTodos`, `createTodo`, etc.), not raw fetch calls scattered in components.
- Request paths are relative to `/api` (e.g. `request('/todos')` hits `/api/todos`).
- Phoenix controllers expect JSON bodies wrapped by resource name:

  ```js
  body: JSON.stringify({ todo: { title, completed, tags } })
  ```

- List/show responses use a `data` key. API modules should unwrap `data.data` before returning to components.
- Backend fields are snake_case in JSON. Map to camelCase in the API module when components expect it (see `src/api/reports.js`).
- Resource IDs are UUID strings from the backend.

### Data fetching

- No React Query, SWR, or similar — components fetch with `useEffect` and local state.
- Follow the `loading` / `error` pattern in `components/TodoList.jsx`.
- Do not add data-fetching libraries unless explicitly asked.

### Static config vs API data

- **`src/api/`** — Phoenix-backed resources (todos, schedules, inventories, reports).
- **`src/data/`** — Static or built-in config not stored in the database (e.g. `builtInReports.js`, `reportFormConfig.js`). Reports use both: built-in definitions in `data/`, saved reports from the API.

### Error handling

`request.js` throws `Error` on non-2xx responses (except 204). It reads Phoenix error payloads from `errors.detail`, a string/object `errors`, or falls back to `statusText`.

- **404 / generic errors** — usually `errors.detail` as a string.
- **422 validation errors** — `errors` is a nested object keyed by field name (from `ChangesetJSON`). Components that show field-level errors must handle this shape, not only `errors.detail`.

Components should catch errors and surface them in UI state.

### Styling

- Global styles: `src/index.css`, `src/App.css`.
- Component styles: co-located `ComponentName.css` imported in the component file.
- Match existing class naming and layout patterns before introducing new styling approaches.
- No CSS-in-JS or component library is in use.

## Conventions

- Use functional components and React hooks (`useState`, `useEffect`, `useMemo`, etc.).
- Source files use `.jsx` for components and `.js` for non-JSX modules.
- Use ES modules (`import` / `export`). The project uses `"type": "module"`.
- Do not convert the codebase to TypeScript unless explicitly asked.
- Do not hardcode `http://localhost:4000` in frontend code; use `/api` paths so the Vite proxy works in development.
- Static feature config that does not belong in the database lives in `src/data/`.

## Adding a new page

1. Add a route and nav link in `src/App.jsx`.
2. Create a thin page in `src/pages/`.
3. Build or extend a component in `src/components/` (with co-located CSS if needed).
4. Add or extend a module in `src/api/` if the page needs backend data.
5. Implement the matching Phoenix endpoint in `backend/` (see `backend/AGENTS.md`).

Keep request/response shapes aligned with Phoenix JSON views under `backend/lib/grims_web/views/`.
