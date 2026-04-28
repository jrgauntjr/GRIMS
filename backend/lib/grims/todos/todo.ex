defmodule Grims.Todos.Todo do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "todos" do
    field :title, :string
    field :completed, :boolean, default: false
    field :tags, {:array, :string}, default: []

    timestamps(type: :utc_datetime)
  end

  @doc false
  def changeset(todo, attrs) do
    todo
    |> cast(attrs, [:title, :completed, :tags])
    |> validate_required([:title])
    |> normalize_tags()
  end

  defp normalize_tags(changeset) do
    case Ecto.Changeset.fetch_change(changeset, :tags) do
      {:ok, list} when is_list(list) ->
        normalized =
          list
          |> Enum.map(fn
            tag when is_binary(tag) -> String.trim(tag)
            _ -> ""
          end)
          |> Enum.reject(&(&1 == ""))

        Ecto.Changeset.put_change(changeset, :tags, normalized)

      _ ->
        changeset
    end
  end
end
