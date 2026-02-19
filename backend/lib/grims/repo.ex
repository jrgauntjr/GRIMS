defmodule Grims.Repo do
  use Ecto.Repo,
    otp_app: :grims,
    adapter: Ecto.Adapters.Postgres
end
