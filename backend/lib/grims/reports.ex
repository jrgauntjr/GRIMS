defmodule Grims.Reports do
  @moduledoc """
  Saved custom report definitions (filters, columns, sort).
  """

  import Ecto.Query, only: [from: 2]
  alias Grims.Repo
  alias Grims.Reports.BuiltIn
  alias Grims.Reports.Report
  alias Grims.Reports.Runner

  def list_reports do
    Repo.all(from r in Report, order_by: [desc: r.inserted_at])
  end

  def get_report!(id), do: Repo.get!(Report, id)

  def get_report(id), do: Repo.get(Report, id)

  def get_report_by_slug(slug) when is_binary(slug) do
    Repo.get_by(Report, slug: slug)
  end

  def create_report(attrs \\ %{}) do
    attrs = ensure_slug(attrs)

    %Report{}
    |> Report.changeset(attrs)
    |> Repo.insert()
  end

  def update_report(%Report{} = report, attrs) do
    attrs =
      attrs
      |> maybe_regenerate_slug(report)

    report
    |> Report.changeset(attrs)
    |> Repo.update()
  end

  def delete_report(%Report{} = report) do
    Repo.delete(report)
  end

  def run_report(id_or_slug) when is_binary(id_or_slug) do
    case resolve_report(id_or_slug) do
      {:ok, %Report{} = report} -> Runner.run(report)
      {:ok, slug} when is_binary(slug) -> Runner.run(slug)
      {:error, :not_found} = err -> err
    end
  end

  defp resolve_report(id_or_slug) do
    cond do
      BuiltIn.builtin?(id_or_slug) ->
        {:ok, id_or_slug}

      match?({:ok, _}, Ecto.UUID.cast(id_or_slug)) ->
        case get_report(id_or_slug) do
          %Report{} = report -> {:ok, report}
          nil -> {:error, :not_found}
        end

      true ->
        case get_report_by_slug(id_or_slug) do
          %Report{} = report -> {:ok, report}
          nil -> {:error, :not_found}
        end
    end
  end

  defp ensure_slug(attrs) when is_map(attrs) do
    slug = Map.get(attrs, "slug") || Map.get(attrs, :slug)

    if present?(slug) do
      attrs
    else
      title = Map.get(attrs, "title") || Map.get(attrs, :title) || ""
      Map.put_new(attrs, "slug", unique_slug(title))
    end
  end

  defp maybe_regenerate_slug(attrs, %Report{} = report) do
    title = Map.get(attrs, "title") || Map.get(attrs, :title)
    slug = Map.get(attrs, "slug") || Map.get(attrs, :slug)

    cond do
      present?(slug) ->
        attrs

      present?(title) && title != report.title ->
        Map.put(attrs, "slug", unique_slug(title, report.id))

      true ->
        attrs
    end
  end

  defp unique_slug(title, exclude_id \\ nil) do
    base = slugify(title)
    base = if base == "", do: "report", else: base
    candidate_slug(base, 1, exclude_id)
  end

  defp candidate_slug(base, n, exclude_id) do
    slug = if n == 1, do: base, else: "#{base}-#{n}"

    case get_report_by_slug(slug) do
      %Report{id: ^exclude_id} ->
        slug

      %Report{} ->
        candidate_slug(base, n + 1, exclude_id)

      nil ->
        slug
    end
  end

  defp slugify(title) when is_binary(title) do
    title
    |> String.downcase()
    |> String.replace(~r/[^a-z0-9]+/u, "-")
    |> String.trim("-")
  end

  defp slugify(_), do: ""

  defp present?(value) when is_binary(value), do: String.trim(value) != ""
  defp present?(_), do: false
end
