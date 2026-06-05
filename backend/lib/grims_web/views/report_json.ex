defmodule GrimsWeb.ReportJSON do
  def index(%{reports: reports}) do
    %{data: for(report <- reports, do: data(report))}
  end

  def show(%{report: report}) do
    %{data: data(report)}
  end

  def run(%{result: result}) do
    %{data: result}
  end

  defp data(report) do
    %{
      id: report.id,
      slug: report.slug,
      title: report.title,
      description: report.description || "",
      source: report.source,
      sort_field: report.sort_field,
      sort_direction: report.sort_direction,
      group_by: report.group_by || "",
      columns: report.columns || [],
      filters: report.filters || %{},
      custom: true,
      inserted_at: report.inserted_at,
      updated_at: report.updated_at
    }
  end
end
