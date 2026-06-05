defmodule Grims.Reports.Report do
  @moduledoc false
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  @sources ~w(inventory jobs todos)
  @sort_directions ~w(asc desc)

  schema "reports" do
    field :slug, :string
    field :title, :string
    field :description, :string, default: ""
    field :source, :string
    field :sort_field, :string
    field :sort_direction, :string, default: "asc"
    field :group_by, :string, default: ""
    field :columns, {:array, :string}, default: []
    field :filters, :map, default: %{}

    timestamps(type: :utc_datetime)
  end

  def changeset(report, attrs) do
    report
    |> cast(attrs, [
      :slug,
      :title,
      :description,
      :source,
      :sort_field,
      :sort_direction,
      :group_by,
      :columns,
      :filters
    ])
    |> validate_required([:title, :source, :sort_field, :sort_direction, :columns])
    |> validate_inclusion(:source, @sources)
    |> validate_inclusion(:sort_direction, @sort_directions)
    |> normalize_columns()
    |> normalize_filters()
    |> validate_columns_not_empty()
  end

  defp validate_columns_not_empty(changeset) do
    case get_field(changeset, :columns) do
      list when is_list(list) and list != [] -> changeset
      _ -> add_error(changeset, :columns, "must include at least one column")
    end
  end

  defp normalize_columns(changeset) do
    case fetch_change(changeset, :columns) do
      {:ok, list} when is_list(list) ->
        normalized =
          list
          |> Enum.map(fn
            col when is_binary(col) -> String.trim(col)
            col when is_atom(col) -> col |> Atom.to_string() |> String.trim()
            _ -> ""
          end)
          |> Enum.reject(&(&1 == ""))

        put_change(changeset, :columns, normalized)

      _ ->
        changeset
    end
  end

  defp normalize_filters(changeset) do
    case fetch_change(changeset, :filters) do
      {:ok, filters} when is_map(filters) ->
        normalized =
          filters
          |> Enum.map(fn
            {key, value} when is_binary(key) -> {key, normalize_filter_value(value)}
            {key, value} when is_atom(key) -> {Atom.to_string(key), normalize_filter_value(value)}
          end)
          |> Map.new()

        put_change(changeset, :filters, normalized)

      _ ->
        changeset
    end
  end

  defp normalize_filter_value(value) when is_binary(value), do: value
  defp normalize_filter_value(value) when is_integer(value), do: Integer.to_string(value)
  defp normalize_filter_value(value) when is_boolean(value), do: to_string(value)
  defp normalize_filter_value(value), do: value
end
