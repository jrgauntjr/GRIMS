defmodule Grims.Desktop.Postgres do
  @moduledoc false

  @default_port 5433
  @default_user "grims"
  @default_database "grims_desktop"

  def child_spec do
    %{
      id: Grims.Desktop.PostgresShutdown,
      start: {Grims.Desktop.PostgresShutdown, :start_link, []}
    }
  end

  @doc """
  Starts bundled PostgreSQL when available beside the desktop binary.

  Returns `:bundled` when a local PostgreSQL bundle was started, or `:system`
  when no bundle was found and an external `DATABASE_URL` should be used.
  """
  def ensure_started! do
    case postgres_home() do
      nil ->
        if bundled_required?() do
          raise bundled_missing_message()
        else
          :system
        end

      home ->
        start_bundled!(home)
        :bundled
    end
  end

  def stop do
    case postgres_home() do
      nil ->
        :ok

      home ->
        if running?(home) do
          run_cmd!(Path.join(home, "bin/pg_ctl"), ["-D", data_dir(), "stop", "fast"], home)
        end

        :ok
    end
  end

  def default_database_url do
    "ecto://#{@default_user}@127.0.0.1:#{port()}/#{@default_database}"
  end

  def port do
    System.get_env("GRIMS_POSTGRES_PORT", "#{@default_port}")
    |> String.to_integer()
  end

  def postgres_home do
    explicit = System.get_env("GRIMS_POSTGRES_HOME")

    cond do
      is_binary(explicit) and explicit != "" ->
        explicit

      home = grims_home() ->
        Path.join(home, "postgres")

      true ->
        nil
    end
    |> case do
      nil -> nil
      path -> if postgres_installed?(path), do: path, else: nil
    end
  end

  def data_dir do
    base =
      System.get_env("XDG_DATA_HOME") ||
        Path.join(System.get_env("HOME") || "~", ".local/share")

    Path.join(base, "grims/postgres-data")
  end

  defp grims_home do
    cond do
      home = System.get_env("GRIMS_HOME") ->
        home

      bin = System.get_env("GRIMS_BIN") ->
        Path.dirname(bin)

      File.exists?(Path.join(File.cwd!(), "postgres")) ->
        File.cwd!()

      true ->
        nil
    end
  end

  defp bundled_required? do
    System.get_env("GRIMS_BUNDLE_POSTGRES") in ~w(1 true yes TRUE YES) or
      (is_binary(grims_home()) and postgres_installed?(Path.join(grims_home(), "postgres")))
  end

  defp postgres_installed?(home) do
    File.exists?(Path.join(home, "bin/postgres")) and
      File.exists?(Path.join(home, "bin/initdb")) and
      File.exists?(Path.join(home, "bin/pg_ctl"))
  end

  defp start_bundled!(home) do
    File.mkdir_p!(Path.dirname(data_dir()))
    maybe_init_cluster!(home)

    unless running?(home) do
      log_path = Path.join(Path.dirname(data_dir()), "postgres.log")

      run_cmd!(
        Path.join(home, "bin/pg_ctl"),
        [
          "-D",
          data_dir(),
          "-l",
          log_path,
          "-o",
          "-p #{port()} -h 127.0.0.1",
          "start"
        ],
        home
      )
    end

    case wait_until_ready(home) do
      :ok ->
        :ok

      {:error, :timeout} ->
        raise """
        Bundled PostgreSQL did not become ready on port #{port()}.

        Check #{Path.join(Path.dirname(data_dir()), "postgres.log")} for details.
        """
    end
  end

  defp maybe_init_cluster!(home) do
    if File.exists?(Path.join(data_dir(), "PG_VERSION")) do
      :ok
    else
      File.mkdir_p!(data_dir())

      run_cmd!(
        Path.join(home, "bin/initdb"),
        [
          "-D",
          data_dir(),
          "--username=#{@default_user}",
          "--auth-host=trust",
          "--auth-local=trust",
          "--encoding=UTF8",
          "--locale=C"
        ],
        home
      )
    end
  end

  defp running?(home) do
    pg_isready = Path.join(home, "bin/pg_isready")

    if File.exists?(pg_isready) do
      run_cmd(pg_isready, ["-h", "127.0.0.1", "-p", Integer.to_string(port())], home) == 0
    else
      false
    end
  end

  defp wait_until_ready(home, attempts \\ 40) do
    if running?(home) do
      :ok
    else
      if attempts > 0 do
        Process.sleep(250)
        wait_until_ready(home, attempts - 1)
      else
        {:error, :timeout}
      end
    end
  end

  defp run_cmd(cmd, args, home) do
    {_, exit_code} =
      System.cmd(cmd, args,
        env: cmd_env(home),
        stderr_to_stdout: true
      )

    exit_code
  end

  defp run_cmd!(cmd, args, home) do
    {output, exit_code} =
      System.cmd(cmd, args,
        env: cmd_env(home),
        stderr_to_stdout: true
      )

    if exit_code != 0 do
      raise """
      Command failed: #{cmd} #{Enum.join(args, " ")}

      #{output}
      """
    end

    output
  end

  defp cmd_env(home) do
    [
      {"LD_LIBRARY_PATH", ld_library_path(home)},
      {"PATH", "#{Path.join(home, "bin")}:#{System.get_env("PATH", "/usr/bin")}"}
    ]
  end

  defp ld_library_path(home) do
    [
      Path.join(home, "lib/grims-vendor"),
      Path.join(home, "lib"),
      Path.join(home, "lib64"),
      System.get_env("LD_LIBRARY_PATH")
    ]
    |> Enum.reject(&(&1 in [nil, ""]))
    |> Enum.join(":")
  end

  defp bundled_missing_message do
    """
      Bundled PostgreSQL was not found.

      Build a desktop package first:

          cd backend && MIX_ENV=prod mix desktop.package.linux

      Or set GRIMS_POSTGRES_HOME to a PostgreSQL binary directory.
    """
  end
end

defmodule Grims.Desktop.PostgresShutdown do
  @moduledoc false
  use GenServer

  def start_link do
    GenServer.start_link(__MODULE__, [], name: __MODULE__)
  end

  @impl true
  def init(state), do: {:ok, state}

  @impl true
  def terminate(_reason, _state) do
    Grims.Desktop.Postgres.stop()
    :ok
  end
end
