defmodule GrimsWeb.InventoryJSON do
  def index(%{inventory_items: inventory_items}) do
    %{data: for(item <- inventory_items, do: data(item))}
  end

  def show(%{inventory_item: inventory_item}) do
    %{data: data(inventory_item)}
  end

  defp data(item) do
    %{
      id: item.id,
      igdb_id: item.igdb_id,
      name: item.name,
      platforms: item.platforms || [],
      release_year: item.release_year,
      qty: item.qty,
      condition: item.condition,
      notes: item.notes || "",
      inserted_at: item.inserted_at,
      updated_at: item.updated_at
    }
  end
end
