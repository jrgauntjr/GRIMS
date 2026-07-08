defmodule GrimsWeb.DesktopLaunchController do
  use GrimsWeb, :controller

  alias Grims.Desktop

  def show(conn, _params) do
    if Desktop.enabled?() do
      conn
      |> put_resp_content_type("text/html")
      |> send_resp(200, launcher_html())
    else
      conn
      |> put_status(:not_found)
      |> text("Not found")
    end
  end

  defp launcher_html do
    """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>GRIMS</title>
    </head>
    <body>
      <script>
        (function () {
          var url = "/?desktop=1";
          var app = window.open(url, "grims_desktop");
          if (app) {
            setTimeout(function () { window.close(); }, 300);
          } else {
            window.location.replace(url);
          }
        })();
      </script>
    </body>
    </html>
    """
  end
end
