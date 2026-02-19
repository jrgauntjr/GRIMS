defmodule Grims.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      GrimsWeb.Telemetry,
      Grims.Repo,
      {DNSCluster, query: Application.get_env(:grims, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: Grims.PubSub},
      # Start a worker by calling: Grims.Worker.start_link(arg)
      # {Grims.Worker, arg},
      # Start to serve requests, typically the last entry
      GrimsWeb.Endpoint
    ]

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
