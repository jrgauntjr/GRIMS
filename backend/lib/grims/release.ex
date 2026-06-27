defmodule Grims.Release do
  @moduledoc false

  @app :grims

  def migrate do
    load_app()

    for repo <- repos() do
      {:ok, _, _} = Ecto.Migrator.with_repo(repo, &Ecto.Migrator.run(&1, :up, all: true))
    end
  end

  def create do
    load_app()

    Enum.reduce_while(repos(), :ok, fn repo, _acc ->
      case repo.__adapter__().storage_up(repo.config()) do
        :ok -> {:halt, :ok}
        {:error, :already_up} -> {:halt, {:error, :already_up}}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  defp repos, do: Application.fetch_env!(@app, :ecto_repos)

  defp load_app do
    Application.load(@app)
    Enum.each(repos(), &Application.load/1)
  end
end
