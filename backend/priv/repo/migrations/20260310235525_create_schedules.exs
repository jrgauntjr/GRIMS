defmodule Grims.Repo.Migrations.CreateSchedules do
  use Ecto.Migration

  def change do
    create table(:schedules, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :customer_name, :string, null: false
      add :customer_number, :string, null: false
      add :console, :string, null: false
      add :status, :string, null: false, default: "open"
      add :description, :string, null: false

      timestamps(type: :utc_datetime)
    end
  end
end
