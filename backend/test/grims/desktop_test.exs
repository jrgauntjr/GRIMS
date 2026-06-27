defmodule Grims.DesktopTest do
  use ExUnit.Case, async: true

  alias Grims.Desktop
  alias Grims.Desktop.Postgres

  test "parse_env_line/1 skips blanks and comments" do
    assert Desktop.parse_env_line("") == :skip
    assert Desktop.parse_env_line("  ") == :skip
    assert Desktop.parse_env_line("# comment") == :skip
  end

  test "parse_env_line/1 parses KEY=VALUE pairs" do
    assert Desktop.parse_env_line("DATABASE_URL=ecto://localhost/grims") ==
             {:ok, "DATABASE_URL", "ecto://localhost/grims"}

    assert Desktop.parse_env_line(~s(SECRET_KEY_BASE="abc123")) ==
             {:ok, "SECRET_KEY_BASE", "abc123"}
  end

  test "default bundled database url" do
    assert Postgres.default_database_url() ==
             "ecto://grims@127.0.0.1:5433/grims_desktop"
  end
end
