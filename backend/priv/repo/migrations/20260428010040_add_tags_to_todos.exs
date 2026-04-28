defmodule Grims.Repo.Migrations.AddTagsToTodos do
  use Ecto.Migration

  def change do
    alter table(:todos) do
      add :tags, {:array, :string}, default: [], null: false
    end
  end
end
