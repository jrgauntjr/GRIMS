defmodule GrimsWeb.PageController do
  use GrimsWeb, :controller

  def index(conn, _params) do
    index_path = Application.app_dir(:grims, "priv/static/index.html")

    conn
    |> put_resp_header("cache-control", "no-cache, no-store, must-revalidate")
    |> send_file(200, index_path)
  end
end
