defmodule GrimsWeb.DesktopControllerTest do
  use GrimsWeb.ConnCase, async: true

  test "returns desktop mode flag", %{conn: conn} do
    conn = get(conn, ~p"/api/desktop")
    assert json_response(conn, 200)["data"]["desktop"] == false
  end

  test "returns desktop true when GRIMS_DESKTOP is set", %{conn: _conn} do
    System.put_env("GRIMS_DESKTOP", "1")
    on_exit(fn -> System.delete_env("GRIMS_DESKTOP") end)

    conn = build_conn() |> get(~p"/api/desktop")
    assert json_response(conn, 200)["data"]["desktop"] == true
  end

  test "shutdown returns 403 when not in desktop mode", %{conn: conn} do
    conn = post(conn, ~p"/api/desktop/shutdown")
    assert %{"errors" => %{"detail" => detail}} = json_response(conn, 403)
    assert detail =~ "not available"
  end
end
