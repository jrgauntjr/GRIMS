defmodule GrimsWeb.DesktopController do
  use GrimsWeb, :controller

  alias Grims.Desktop

  def show(conn, _params) do
    json(conn, %{data: %{desktop: Desktop.enabled?()}})
  end

  def shutdown(conn, _params) do
    if Desktop.enabled?() do
      spawn(fn ->
        Process.sleep(250)
        Desktop.shutdown!()
      end)

      conn
      |> send_resp(204, "")
      |> halt()
    else
      conn
      |> put_status(:forbidden)
      |> json(%{errors: %{detail: "Desktop shutdown is not available"}})
    end
  end
end
