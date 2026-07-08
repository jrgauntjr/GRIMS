defmodule Grims.Desktop do
  @moduledoc false

  @doc """
  Desktop mode is enabled via `GRIMS_DESKTOP=1` or when running a Burrito release.
  """
  def enabled? do
    env_flag?() or burrito_release?()
  end

  def config_dir do
    case :os.type() do
      {:win32, _} ->
        base = System.get_env("APPDATA") || Path.expand("~/AppData/Roaming")
        Path.join(base, "GRIMS")

      {:unix, :darwin} ->
        Path.join(System.get_env("HOME") || "~", "Library/Application Support/GRIMS")

      {:unix, _} ->
        base =
          System.get_env("XDG_CONFIG_HOME") ||
            Path.join(System.get_env("HOME") || "~", ".config")

        Path.join(base, "grims")
    end
  end

  def config_path, do: Path.join(config_dir(), "grims.env")

  @doc """
  Ensures `grims.env` exists, loads it into the process environment, and returns `:ok`.
  Called from `config/runtime.exs` before prod config is applied.
  """
  def load_config! do
    File.mkdir_p!(config_dir())
    ensure_config_file!()
    apply_config_file!(config_path())
    :ok
  end

  @doc """
  Creates the database (if needed) and runs migrations. Used on desktop startup.
  """
  def setup_database! do
    case Grims.Release.create() do
      :ok ->
        :ok

      {:error, :already_up} ->
        :ok

      {:error, reason} ->
        raise """
        Could not create the GRIMS database.

        #{inspect(reason)}

        Check DATABASE_URL in #{config_path()} and ensure PostgreSQL is running.
        """
    end

    Grims.Release.migrate()
  end

  @doc false
  def parse_env_line(line) when is_binary(line) do
    line = String.trim(line)

    cond do
      line == "" ->
        :skip

      String.starts_with?(line, "#") ->
        :skip

      true ->
        case String.split(line, "=", parts: 2) do
          [key, value] -> {:ok, String.trim(key), unquote_env_value(String.trim(value))}
          _ -> :skip
        end
    end
  end

  defp env_flag?, do: System.get_env("GRIMS_DESKTOP") in ~w(1 true yes TRUE YES)

  defp burrito_release? do
    root = System.get_env("RELEASE_ROOT") || System.get_env("ROOTDIR") || ""
    String.contains?(root, ".burrito")
  end

  defp ensure_config_file! do
    path = config_path()

    if File.exists?(path) do
      :ok
    else
      secret = generate_secret_key_base()

      contents = """
      # GRIMS desktop configuration
      # Edit this file to change database credentials or optional API keys.

      DATABASE_URL=#{default_database_url()}
      SECRET_KEY_BASE=#{secret}

      # Optional: enable inventory game search (https://api.igdb.com)
      # IGDB_CLIENT_ID=
      # IGDB_CLIENT_SECRET=
      """

      File.write!(path, contents)
    end
  end

  defp apply_config_file!(path) do
    path
    |> File.read!()
    |> String.split("\n")
    |> Enum.each(fn line ->
      case parse_env_line(line) do
        :skip ->
          :ok

        {:ok, key, value} ->
          if System.get_env(key) in [nil, ""] do
            System.put_env(key, value)
          end
      end
    end)
  end

  defp unquote_env_value(value) do
    value
    |> String.trim_leading("\"")
    |> String.trim_trailing("\"")
    |> String.trim_leading("'")
    |> String.trim_trailing("'")
  end

  defp generate_secret_key_base do
    64 |> :crypto.strong_rand_bytes() |> Base.encode64(padding: false)
  end

  defp default_database_url, do: Grims.Desktop.Postgres.default_database_url()

  @doc """
  Gracefully shuts down a desktop session: closes DB connections, stops bundled
  PostgreSQL when GRIMS started it, then stops the BEAM VM.
  """
  def shutdown! do
    _ = Ecto.Adapters.SQL.disconnect_all(Grims.Repo, :all)
    Grims.Desktop.Postgres.stop()
    :init.stop()
  end
end
