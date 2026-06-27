defmodule Grims.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    postgres_shutdown =
      if Grims.Desktop.enabled?() do
        child =
          case Grims.Desktop.Postgres.ensure_started!() do
            :bundled -> Grims.Desktop.Postgres.child_spec()
            :system -> nil
          end

        Grims.Desktop.setup_database!()
        child
      end

    children =
      [
        postgres_shutdown,
        GrimsWeb.Telemetry,
        Grims.Repo,
        {DNSCluster, query: Application.get_env(:grims, :dns_cluster_query) || :ignore},
        {Phoenix.PubSub, name: Grims.PubSub},
        GrimsWeb.Endpoint
      ]
      |> Enum.reject(&is_nil/1)

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: Grims.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    GrimsWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
