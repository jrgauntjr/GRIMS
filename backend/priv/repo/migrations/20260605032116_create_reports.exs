defmodule Grims.Repo.Migrations.CreateReports do
  use Ecto.Migration

  def change do
    create table(:reports, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :slug, :string, null: false
      add :title, :string, null: false
      add :description, :string, default: ""
      add :source, :string, null: false
      add :sort_field, :string, null: false
      add :sort_direction, :string, null: false, default: "asc"
      add :group_by, :string, default: ""
      add :columns, {:array, :string}, null: false, default: []
      add :filters, :map, null: false, default: %{}

      timestamps(type: :utc_datetime)
    end

    create unique_index(:reports, [:slug])
    create index(:reports, [:source])
  end
end
