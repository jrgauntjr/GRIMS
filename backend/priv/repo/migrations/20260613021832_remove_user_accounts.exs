defmodule Grims.Repo.Migrations.RemoveUserAccounts do
  use Ecto.Migration

  @tables ~w(inventory_items todos schedules reports)

  def up do
    for table <- @tables do
      execute("DROP INDEX IF EXISTS #{table}_user_id_index")
      execute("ALTER TABLE #{table} DROP CONSTRAINT IF EXISTS #{table}_user_id_fkey")
      execute("ALTER TABLE #{table} DROP COLUMN IF EXISTS user_id")
    end

    execute("DROP TABLE IF EXISTS users_tokens")
    execute("DROP TABLE IF EXISTS users")
  end

  def down do
    raise "cannot restore removed user account tables and columns"
  end
end
