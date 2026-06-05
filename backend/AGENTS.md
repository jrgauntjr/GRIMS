# AGENTS.md

This file provides guidance to AI coding agents when working with the GRIMS Phoenix backend.

For monorepo setup, ports, and running both apps, see the root `AGENTS.md`. For React and API client conventions, see `frontend/AGENTS.md`.

## Project Overview

The backend is a Phoenix 1.8 JSON API app (`:grims`). It exposes REST endpoints under `/api` for the React SPA. Business logic lives in contexts under `lib/grims/`; HTTP handling lives in `lib/grims_web/`.

There is no LiveView or server-rendered HTML UI. In production, `PageController` serves the built SPA from `priv/static/index.html`; all feature UI is in the frontend.

Primary keys are UUIDs (`--binary-id`).

## API surface

| Endpoint | Context | Controller | JSON module |
|----------|---------|------------|-------------|
| `/api/todos` | `Grims.Todos` | `TodoController` | `TodoJSON` |
| `/api/schedules` | `Grims.Schedules` | `ScheduleController` | `ScheduleJSON` |
| `/api/inventories` | `Grims.Inventories` | `InventoryController` | `InventoryJSON` |
| `/api/reports` | `Grims.Reports` | `ReportController` | `ReportJSON` |
| `GET /api/reports/:id/run` | `Grims.Reports` | `ReportController` | `ReportJSON` |
| `GET /api/games/search` | `Grims.Igdb` | `GameSearchController` | `GameSearchJSON` |

Use `TodoController`, `TodoJSON`, and `test/grims_web/controllers/inventory_controller_test.exs` as reference patterns for new resources.

### Environment variables

Game search (`Grims.Igdb`) requires Twitch/IGDB credentials:

- `IGDB_CLIENT_ID`
- `IGDB_CLIENT_SECRET`

Set these in the environment when working on inventory game search locally.

## Repository Layout

- **`lib/grims/`** — Contexts, schemas, and domain logic (e.g. `Grims.Todos`, `Grims.Inventories`).
- **`lib/grims/<context>/<schema>.ex`** — Ecto schemas (e.g. `Grims.Todos.Todo`).
- **`lib/grims_web/controllers/`** — JSON API controllers.
- **`lib/grims_web/views/`** — JSON rendering modules (`*JSON.ex`), plus shared `ChangesetJSON` and `ErrorJSON`.
- **`lib/grims_web/router.ex`** — API routes under `scope "/api", GrimsWeb`.
- **`config/`** — Environment config. Dev/test DB credentials in `dev.exs` / `test.exs`; production uses `runtime.exs`.
- **`priv/repo/migrations/`** — Ecto migrations.
- **`test/`** — Tests mirror `lib/`. Controller tests use `GrimsWeb.ConnCase`.

## Development Commands

All commands run from `backend/`:

```sh
# First-time setup (deps, DB, migrations, seeds)
mix setup

# Start the API server (http://localhost:4000)
mix phx.server

# Run all tests
mix test

# Run a single test file or line
mix test test/grims_web/controllers/todo_controller_test.exs
mix test test/grims_web/controllers/todo_controller_test.exs:42

# Re-run only failed tests
mix test --failed

# Pre-commit check (compile warnings-as-errors, format, test)
mix precommit

# Format Elixir code
mix format

# Generate a migration
mix ecto.gen.migration migration_name

# Reset database
mix ecto.reset

# Scaffold a JSON API resource (context, schema, controller, tests)
mix phx.gen.json ContextName SchemaName schema_names field:type
```

Run `mix precommit` before pushing backend changes.

## Architecture

### Contexts and schemas

- Put CRUD and domain logic in context modules (`Grims.Todos`, `Grims.Reports`, etc.).
- Schemas live in nested modules (`Grims.Todos.Todo`) with changeset functions.
- Controllers should stay thin: parse params, call the context, render JSON or return errors.

### JSON API layer

- API routes use the `:api` pipeline and live under `/api`.
- Controllers use `action_fallback GrimsWeb.FallbackController` for shared error handling.
- Each resource has a matching `*JSON` module in `lib/grims_web/views/` (e.g. `GrimsWeb.TodoJSON`).
- Successful responses wrap records in a `data` key:

  ```elixir
  def show(%{todo: todo}), do: %{data: data(todo)}
  ```

- Validation errors render via `GrimsWeb.ChangesetJSON` as `%{errors: ...}`.
- Not-found and generic errors render via `GrimsWeb.ErrorJSON`.
- `DELETE` success returns `204 No Content` with an empty body.

### Request params

- Create/update params arrive wrapped by resource name, matching the frontend API client:

  ```elixir
  def create(conn, %{"todo" => todo_params})
  def update(conn, %{"id" => id, "inventory" => inventory_params})
  ```

- Guard param shape with `when is_map(...)` clauses. Return `422` via `ErrorJSON` when the wrapper key is missing.

### Router conventions

- Standard resources use `resources "/name", Controller, except: [:new, :edit]`.
- Custom actions belong in the resource block (see `/api/reports/:id/run`).
- The router `scope` alias prefixes controller modules; do not duplicate `GrimsWeb` in route definitions.
- Dev-only tools (LiveDashboard, Swoosh mailbox) live under `/dev`, not `/api`.

### External HTTP

- Use `:req` (`Req`) for outbound HTTP. Do not add HTTPoison, Tesla, or `:httpc`.

## Adding a new API resource

1. Generate with `mix phx.gen.json` or add context, schema, controller, JSON view, and migration manually following existing resources.
2. Register routes in `router.ex` under `scope "/api", GrimsWeb`.
3. Add controller tests in `test/grims_web/controllers/`.
4. Add or extend the matching module in `frontend/src/api/`.

Keep JSON field names snake_case so the frontend can map them consistently.

## Production SPA

`PageController` serves `priv/static/index.html` for all non-API routes. Before a production deploy, build the frontend (`cd frontend && npm run build`) and copy `frontend/dist/` into `backend/priv/static/`. There is no automated deploy script yet — do not assume assets sync themselves.

## Elixir guidelines

- Elixir lists **do not support index based access via the access syntax**

  **Never do this (invalid)**:

      i = 0
      mylist = ["blue", "green"]
      mylist[i]

  Instead, **always** use `Enum.at`, pattern matching, or `List` for index based list access:

      Enum.at(mylist, i)

- Elixir variables are immutable, but can be rebound. For block expressions like `if`, `case`, and `cond`, bind the result to a variable instead of rebinding inside the block.

- **Never** nest multiple modules in the same file; it can cause cyclic dependencies and compilation errors.
- **Never** use map access syntax (`changeset[:field]`) on structs. Use `my_struct.field` or `Ecto.Changeset.get_field/2` for changesets.
- Elixir's standard library covers date and time needs. **Never** install extra dependencies unless asked, except `date_time_parser` for parsing if needed.
- Don't use `String.to_atom/1` on user input (memory leak risk).
- Predicate functions end with `?` and should not start with `is_` (reserved for guards).
- Named OTP children (e.g. `DynamicSupervisor`, `Registry`) need a `name:` in their child spec.
- Prefer `Task.async_stream/3` for concurrent work with back-pressure; pass `timeout: :infinity` when appropriate.

## Mix guidelines

- Read task docs with `mix help task_name` before using unfamiliar tasks.
- Debug tests with `mix test path/to_test.exs` or `mix test --failed`.
- `mix deps.clean --all` is almost never needed.

## Test guidelines

- **Always use `start_supervised!/1`** to start processes in tests.
- **Avoid** `Process.sleep/1` and `Process.alive?/1` in tests.
  - Wait for process exit with `Process.monitor/1`:

      ref = Process.monitor(pid)
      assert_receive {:DOWN, ^ref, :process, ^pid, :normal}

  - Synchronize on handled messages with `_ = :sys.get_state/1`.
- Controller tests assert JSON with `json_response/2` and use fixtures that call context functions.
- Use `~p"/api/..."` verified routes in test requests.

## Phoenix guidelines

- Router `scope` blocks provide a module alias for controllers in that scope.
- `Phoenix.View` is not used; JSON rendering uses `*JSON` modules.
- Do not add LiveView modules, HEEx templates, or browser pipelines for feature work in this app.

## Ecto guidelines

- **Always** preload associations in queries when they'll be accessed in JSON views or downstream code.
- Remember `import Ecto.Query` in `seeds.exs` and similar scripts.
- Schema fields use `:string` even for `:text` columns: `field :name, :string`.
- `Ecto.Changeset.validate_number/2` does not support `:allow_nil`; validations skip nil changes by default.
- Use `Ecto.Changeset.get_field/2` to read changeset fields.
- Fields set programmatically (e.g. `user_id`) must not appear in `cast/3`; set them explicitly when building the struct.
- **Always** generate migrations with `mix ecto.gen.migration migration_name_using_underscores`.
