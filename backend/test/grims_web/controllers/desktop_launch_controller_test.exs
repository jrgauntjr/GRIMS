defmodule GrimsWeb.DesktopLaunchControllerTest do
  use GrimsWeb.ConnCase, async: true

  test "returns 404 when not in desktop mode", %{conn: conn} do
    conn = get(conn, ~p"/desktop/launcher")
    assert response(conn, 404) =~ "Not found"
  end

  test "returns launcher html in desktop mode", %{conn: _conn} do
    System.put_env("GRIMS_DESKTOP", "1")
    on_exit(fn -> System.delete_env("GRIMS_DESKTOP") end)

    conn = build_conn() |> get(~p"/desktop/launcher")
    body = response(conn, 200)
    assert body =~ "grims_desktop"
    assert body =~ "/?desktop=1"
  end
end
