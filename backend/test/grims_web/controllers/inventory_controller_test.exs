defmodule GrimsWeb.InventoryControllerTest do
  use GrimsWeb.ConnCase, async: true

  alias Grims.Inventories
  alias Grims.Inventories.Inventory

  @valid_attrs %{
    "igdb_id" => "1942",
    "name" => "The Legend of Zelda: A Link to the Past",
    "platforms" => ["SNES"],
    "release_year" => 1991,
    "qty" => 2,
    "condition" => "cib",
    "notes" => "Box worn"
  }

  defp inventory_item_fixture(attrs \\ %{}) do
    {:ok, item} =
      attrs
      |> Enum.into(@valid_attrs)
      |> Inventories.create_inventory_item()

    item
  end

  describe "index" do
    test "lists all inventory items", %{conn: conn} do
      item = inventory_item_fixture()
      conn = get(conn, ~p"/api/inventories")
      assert [%{"id" => id}] = json_response(conn, 200)["data"]
      assert id == item.id
    end
  end

  describe "create" do
    test "renders item when data is valid", %{conn: conn} do
      conn =
        post(conn, ~p"/api/inventories", inventory: @valid_attrs)

      assert %{"id" => id} = json_response(conn, 201)["data"]
      assert %Inventory{} = Inventories.get_inventory_item!(id)
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/inventories", inventory: %{})
      assert json_response(conn, 422)["errors"]
    end
  end

  describe "show" do
    test "renders item", %{conn: conn} do
      item = inventory_item_fixture()
      conn = get(conn, ~p"/api/inventories/#{item}")
      assert json_response(conn, 200)["data"]["id"] == item.id
    end

    test "returns 404 when missing", %{conn: conn} do
      conn = get(conn, ~p"/api/inventories/#{Ecto.UUID.generate()}")
      assert json_response(conn, 404)
    end
  end

  describe "update" do
    test "renders item when data is valid", %{conn: conn} do
      item = inventory_item_fixture()
      conn = put(conn, ~p"/api/inventories/#{item}", inventory: %{qty: 5, notes: "Updated"})
      assert json_response(conn, 200)["data"]["qty"] == 5
    end
  end

  describe "delete" do
    test "deletes chosen item", %{conn: conn} do
      item = inventory_item_fixture()
      conn = delete(conn, ~p"/api/inventories/#{item}")
      assert response(conn, 204)
      refute Inventories.get_inventory_item(item.id)
    end
  end
end
