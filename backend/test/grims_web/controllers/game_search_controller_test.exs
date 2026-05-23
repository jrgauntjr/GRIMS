defmodule GrimsWeb.GameSearchControllerTest do
  use GrimsWeb.ConnCase, async: true

  test "returns empty data for short query", %{conn: conn} do
    conn = get(conn, ~p"/api/games/search?q=a")
    assert json_response(conn, 200)["data"] == []
  end

  test "returns 503 when IGDB is not configured", %{conn: conn} do
    original = Application.get_env(:grims, :igdb)
    Application.put_env(:grims, :igdb, client_id: nil, client_secret: nil)

    on_exit(fn -> Application.put_env(:grims, :igdb, original) end)

    conn = get(conn, ~p"/api/games/search?q=zelda")
    assert %{"errors" => %{"detail" => detail}} = json_response(conn, 503)
    assert detail =~ "not configured"
  end
end
