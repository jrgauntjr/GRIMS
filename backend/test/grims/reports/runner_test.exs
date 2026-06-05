defmodule Grims.Reports.RunnerTest do
  use Grims.DataCase, async: true

  alias Grims.Inventories
  alias Grims.Reports
  alias Grims.Reports.Runner

  describe "built-in reports" do
    test "inventory-by-platform aggregates qty by platform" do
      insert_inventory(%{
        "name" => "Game A",
        "platforms" => ["SNES"],
        "qty" => 2
      })

      insert_inventory(%{
        "name" => "Game B",
        "platforms" => ["SNES", "Genesis"],
        "qty" => 1
      })

      assert {:ok, %{mode: "aggregate", row_count: 2, rows: rows}} =
               Runner.run("inventory-by-platform")

      snes = Enum.find(rows, &(&1["platform"] == "SNES"))
      genesis = Enum.find(rows, &(&1["platform"] == "Genesis"))

      assert snes["lines"] == 2
      assert snes["qty"] == 3
      assert genesis["lines"] == 1
      assert genesis["qty"] == 1
    end

    test "low-stock filters by quantity threshold" do
      insert_inventory(%{"name" => "Rare", "qty" => 1})
      insert_inventory(%{"name" => "Common", "qty" => 10})

      assert {:ok, %{row_count: 1, rows: rows}} = Runner.run("low-stock")
      assert hd(rows)["name"] == "Rare"
    end
  end

  describe "custom reports" do
    test "filters and projects inventory columns" do
      insert_inventory(%{
        "name" => "Zelda",
        "platforms" => ["SNES"],
        "condition" => "sealed",
        "qty" => 1
      })

      insert_inventory(%{
        "name" => "Mario",
        "platforms" => ["NES"],
        "condition" => "good",
        "qty" => 3
      })

      {:ok, report} =
        Reports.create_report(%{
          "title" => "Sealed only",
          "source" => "inventory",
          "sort_field" => "name",
          "sort_direction" => "asc",
          "columns" => ["name", "qty", "condition"],
          "filters" => %{"condition" => "sealed"}
        })

      assert {:ok, %{mode: "rows", row_count: 1, rows: rows}} = Runner.run(report)
      assert hd(rows) == %{"name" => "Zelda", "qty" => 1, "condition" => "sealed"}
    end
  end

  defp insert_inventory(attrs) do
    base = %{
      "igdb_id" => "igdb-#{System.unique_integer()}",
      "name" => "Test Game",
      "platforms" => ["SNES"],
      "release_year" => 1991,
      "qty" => 1,
      "condition" => "good"
    }

    {:ok, _} = Inventories.create_inventory_item(Map.merge(base, attrs))
  end
end
