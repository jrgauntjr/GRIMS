defmodule GrimsWeb.PageController do
  use GrimsWeb, :controller

  def index(conn, _params) do
    index_path = Application.app_dir(:grims, "priv/static/index.html")
    send_file(conn, 200, index_path)
  end
end
