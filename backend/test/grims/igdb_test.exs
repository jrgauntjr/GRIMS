defmodule Grims.IgdbTest do
  use ExUnit.Case, async: true

  alias Grims.Igdb

  describe "normalize_game/1" do
    test "maps IGDB fields to API shape" do
      game = %{
        "id" => 42,
        "name" => "Super Metroid",
        "summary" => "Explore Zebes.",
        "first_release_date" => 708_480_000,
        "cover" => %{"image_id" => "co1234"},
        "platforms" => [%{"name" => "SNES"}]
      }

      expected_year =
        708_480_000 |> DateTime.from_unix!() |> Map.get(:year)

      assert %{
               igdb_id: "42",
               name: "Super Metroid",
               platforms: ["SNES"],
               release_year: ^expected_year,
               summary: "Explore Zebes.",
               cover_url: "https://images.igdb.com/igdb/image/upload/t_cover_big/co1234.jpg"
             } = Igdb.normalize_game(game)
    end
  end

  describe "search/1" do
    test "returns empty list for blank or short query without calling API" do
      assert {:ok, []} = Igdb.search("")
      assert {:ok, []} = Igdb.search("   ")
      assert {:ok, []} = Igdb.search("a")
    end

    test "returns not_configured when credentials are missing" do
      original = Application.get_env(:grims, :igdb)
      Application.put_env(:grims, :igdb, client_id: nil, client_secret: nil)

      on_exit(fn -> Application.put_env(:grims, :igdb, original) end)

      assert {:error, :not_configured} = Igdb.search("zelda")
    end
  end
end
