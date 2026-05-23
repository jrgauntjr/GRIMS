defmodule Grims.Inventories.Inventory do
  @moduledoc false
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @conditions ~w(sealed cib good acceptable parts)

  schema "inventory_items" do
    field :igdb_id, :string
    field :name, :string
    field :platforms, {:array, :string}, default: []
    field :release_year, :integer
    field :qty, :integer, default: 1
    field :condition, :string, default: "good"
    field :notes, :string, default: ""

    timestamps(type: :utc_datetime)
  end

  def changeset(inventory, attrs) do
    inventory
    |> cast(attrs, [:igdb_id, :name, :platforms, :release_year, :qty, :condition, :notes])
    |> validate_required([:igdb_id, :name, :qty, :condition])
    |> validate_number(:qty, greater_than: 0, less_than_or_equal_to: 999)
    |> validate_inclusion(:condition, @conditions)
    |> normalize_platforms()
  end

  defp normalize_platforms(changeset) do
    case fetch_change(changeset, :platforms) do
      {:ok, list} when is_list(list) ->
        normalized =
          list
          |> Enum.map(fn
            p when is_binary(p) -> String.trim(p)
            _ -> ""
          end)
          |> Enum.reject(&(&1 == ""))

        put_change(changeset, :platforms, normalized)

      _ ->
        changeset
    end
  end
end
