defmodule Grims.Repo.Migrations.CreateInventoryItems do
  use Ecto.Migration

  def change do
    create table(:inventory_items, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :igdb_id, :string, null: false
      add :name, :string, null: false
      add :platforms, {:array, :string}, null: false, default: []
      add :release_year, :integer
      add :qty, :integer, null: false, default: 1
      add :condition, :string, null: false, default: "good"
      add :notes, :string, default: ""

      timestamps(type: :utc_datetime)
    end

    create index(:inventory_items, [:igdb_id])
    create index(:inventory_items, [:release_year])
  end
end
