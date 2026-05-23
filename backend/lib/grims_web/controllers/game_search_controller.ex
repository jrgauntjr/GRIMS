defmodule GrimsWeb.GameSearchController do
  use GrimsWeb, :controller

  alias Grims.Igdb

  def index(conn, params) do
    query = Map.get(params, "q", "")

    case Igdb.search(query) do
      {:ok, games} ->
        render(conn, :index, games: games)

      {:error, :not_configured} ->
        conn
        |> put_status(:service_unavailable)
        |> json(%{
          errors: %{
            detail:
              "IGDB API credentials are not configured. Set IGDB_CLIENT_ID and IGDB_CLIENT_SECRET " <>
                "in the environment (or TWITCH_CLIENT_ID / TWITCH_CLIENT_SECRET), then restart the Phoenix server."
          }
        })

      {:error, _reason} ->
        conn
        |> put_status(:bad_gateway)
        |> json(%{errors: %{detail: "IGDB search failed"}})
    end
  end
end
