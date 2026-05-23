defmodule Grims.Inventories do
  @moduledoc """
  Shelf inventory: physical stock lines keyed by IGDB game id (multiple lines per game allowed).
  """

  import Ecto.Query, only: [from: 2]
  alias Grims.Repo
  alias Grims.Inventories.Inventory

  def list_inventory_items do
    Repo.all(from i in Inventory, order_by: [desc: i.inserted_at])
  end

  def get_inventory_item!(id), do: Repo.get!(Inventory, id)

  def get_inventory_item(id), do: Repo.get(Inventory, id)

  def create_inventory_item(attrs \\ %{}) do
    %Inventory{}
    |> Inventory.changeset(attrs)
    |> Repo.insert()
  end

  def update_inventory_item(%Inventory{} = inventory, attrs) do
    inventory
    |> Inventory.changeset(attrs)
    |> Repo.update()
  end

  def delete_inventory_item(%Inventory{} = inventory) do
    Repo.delete(inventory)
  end
end
