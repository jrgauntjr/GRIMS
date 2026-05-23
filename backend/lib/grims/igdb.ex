defmodule Grims.Igdb do
  @moduledoc """
  IGDB game search via Twitch OAuth (Client-ID + secret).

  Set `IGDB_CLIENT_ID` and `IGDB_CLIENT_SECRET` in the environment.
  """

  @token_url "https://id.twitch.tv/oauth2/token"
  @games_url "https://api.igdb.com/v4/games"
  @token_key :grims_igdb_access_token

  @doc """
  Returns true when IGDB credentials are present in application config.
  """
  def configured? do
    match?({:ok, _, _}, credentials())
  end

  @doc """
  Search IGDB for games matching `query`.

  Returns `{:ok, list}` of normalized maps, `{:error, :not_configured}`, or `{:error, reason}`.
  """
  def search(query) when is_binary(query) do
    q = String.trim(query)

    cond do
      q == "" -> {:ok, []}
      String.length(q) < 2 -> {:ok, []}
      true -> search_games(q)
    end
  end

  @doc """
  Normalizes a raw IGDB API game object into API-friendly fields.
  """
  def normalize_game(%{"id" => id, "name" => name} = game) do
    %{
      igdb_id: to_string(id),
      name: name,
      platforms: platforms_from(game),
      release_year: release_year_from(game),
      summary: Map.get(game, "summary"),
      cover_url: cover_url_from(game)
    }
  end

  def normalize_game(_), do: nil

  defp search_games(query) do
    with {:ok, client_id, client_secret} <- credentials(),
         {:ok, token} <- access_token(client_id, client_secret),
         {:ok, games} <- fetch_games(client_id, token, query) do
      {:ok,
       games
       |> Enum.filter(&is_map/1)
       |> Enum.map(&normalize_game/1)
       |> Enum.reject(&is_nil/1)}
    end
  end

  defp credentials do
    # Read OS env at call time so exports work without recompiling config.
    # Twitch developer console labels these Client-ID / Secret (IGDB uses the same OAuth app).
    client_id =
      env_first([
        "IGDB_CLIENT_ID",
        "TWITCH_CLIENT_ID"
      ]) || config_credential(:client_id)

    client_secret =
      env_first([
        "IGDB_CLIENT_SECRET",
        "TWITCH_CLIENT_SECRET"
      ]) || config_credential(:client_secret)

    if present?(client_id) and present?(client_secret) do
      {:ok, String.trim(client_id), String.trim(client_secret)}
    else
      {:error, :not_configured}
    end
  end

  defp env_first(names) do
    Enum.find_value(names, fn name ->
      case System.get_env(name) do
        value when is_binary(value) and value != "" -> value
        _ -> nil
      end
    end)
  end

  defp config_credential(key) do
    Application.get_env(:grims, :igdb, [])
    |> Keyword.get(key)
    |> case do
      value when is_binary(value) and value != "" -> value
      _ -> nil
    end
  end

  defp present?(value) when is_binary(value), do: String.trim(value) != ""
  defp present?(_), do: false

  defp access_token(client_id, client_secret) do
    now = System.system_time(:second)

    case :persistent_term.get(@token_key, nil) do
      {token, expires_at} when expires_at > now + 60 ->
        {:ok, token}

      _ ->
        fetch_access_token(client_id, client_secret)
    end
  end

  defp fetch_access_token(client_id, client_secret) do
    url =
      @token_url <>
        "?client_id=#{URI.encode_www_form(client_id)}" <>
        "&client_secret=#{URI.encode_www_form(client_secret)}" <>
        "&grant_type=client_credentials"

    case Req.post(url) do
      {:ok, %{status: 200, body: %{"access_token" => token, "expires_in" => expires_in}}}
      when is_binary(token) ->
        now = System.system_time(:second)
        ttl = if is_integer(expires_in), do: expires_in, else: 3600
        :persistent_term.put(@token_key, {token, now + ttl - 300})
        {:ok, token}

      {:ok, %{status: status, body: body}} ->
        {:error, {:igdb_token, status, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp fetch_games(client_id, token, query) do
    body =
      ~s|search "#{escape_apicalypse(query)}"; fields name,summary,first_release_date,cover.image_id,platforms.name; limit 25;|

    case Req.post(@games_url,
           headers: [
             {"Client-ID", client_id},
             {"Authorization", "Bearer #{token}"}
           ],
           body: body
         ) do
      {:ok, %{status: 200, body: body}} when is_list(body) ->
        {:ok, body}

      {:ok, %{status: status, body: body}} ->
        {:error, {:igdb_search, status, body}}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp escape_apicalypse(query) do
    query |> String.replace("\\", "\\\\") |> String.replace("\"", "\\\"")
  end

  defp platforms_from(%{"platforms" => platforms}) when is_list(platforms) do
    platforms
    |> Enum.flat_map(fn
      %{"name" => name} when is_binary(name) -> [name]
      name when is_binary(name) -> [name]
      _ -> []
    end)
    |> Enum.uniq()
  end

  defp platforms_from(_), do: []

  defp release_year_from(%{"first_release_date" => unix}) when is_integer(unix) do
    unix |> DateTime.from_unix!() |> Map.get(:year)
  end

  defp release_year_from(_), do: nil

  defp cover_url_from(%{"cover" => %{"image_id" => image_id}}) when is_binary(image_id) do
    "https://images.igdb.com/igdb/image/upload/t_cover_big/#{image_id}.jpg"
  end

  defp cover_url_from(_), do: nil
end
