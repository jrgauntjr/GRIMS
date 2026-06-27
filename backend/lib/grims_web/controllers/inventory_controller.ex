defmodule GrimsWeb.InventoryController do
  use GrimsWeb, :controller

  alias Grims.Inventories
  alias Grims.Inventories.Inventory

  action_fallback GrimsWeb.FallbackController

  def index(conn, _params) do
    items = Inventories.list_inventory_items()
    render(conn, :index, inventory_items: items)
  end

  def create(conn, %{"inventory" => inventory_params}) when is_map(inventory_params) do
    with {:ok, %Inventory{} = item} <- Inventories.create_inventory_item(inventory_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/inventories/#{item}")
      |> render(:show, inventory_item: item)
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def show(conn, %{"id" => id}) do
    with {:ok, item} <- get_item_or_error(id),
         do: render(conn, :show, inventory_item: item)
  end

  def update(conn, %{"id" => id, "inventory" => inventory_params})
      when is_map(inventory_params) do
    with {:ok, item} <- get_item_or_error(id),
         {:ok, %Inventory{} = item} <- Inventories.update_inventory_item(item, inventory_params),
         do: render(conn, :show, inventory_item: item)
  end

  def update(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, item} <- get_item_or_error(id),
         {:ok, %Inventory{}} <- Inventories.delete_inventory_item(item),
         do: send_resp(conn, :no_content, "")
  end

  defp get_item_or_error(id) do
    case Inventories.get_inventory_item(id) do
      nil -> {:error, :not_found}
      item -> {:ok, item}
    end
  end
end
