defmodule GrimsWeb.ReportController do
  use GrimsWeb, :controller

  alias Grims.Reports
  alias Grims.Reports.Report

  action_fallback GrimsWeb.FallbackController

  def index(conn, _params) do
    reports = Reports.list_reports()
    render(conn, :index, reports: reports)
  end

  def create(conn, %{"report" => report_params}) when is_map(report_params) do
    with {:ok, %Report{} = report} <- Reports.create_report(report_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/reports/#{report}")
      |> render(:show, report: report)
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def show(conn, %{"id" => id}) do
    with {:ok, report} <- fetch_report_or_error(id),
         do: render(conn, :show, report: report)
  end

  def update(conn, %{"id" => id, "report" => report_params}) when is_map(report_params) do
    with {:ok, report} <- fetch_report_or_error(id),
         {:ok, %Report{} = report} <- Reports.update_report(report, report_params),
         do: render(conn, :show, report: report)
  end

  def update(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, report} <- fetch_report_or_error(id),
         {:ok, %Report{}} <- Reports.delete_report(report),
         do: send_resp(conn, :no_content, "")
  end

  def run(conn, params) do
    id = Map.get(params, "report_id") || Map.get(params, "id")

    case id && Reports.run_report(id) do
      nil ->
        conn
        |> put_status(:not_found)
        |> put_view(json: GrimsWeb.ErrorJSON)
        |> render(:"404")

      {:ok, result} ->
        render(conn, :run, result: result)

      {:error, :not_found} ->
        conn
        |> put_status(:not_found)
        |> put_view(json: GrimsWeb.ErrorJSON)
        |> render(:"404")
    end
  end

  defp fetch_report_or_error(id) do
    case Ecto.UUID.cast(id) do
      {:ok, _} ->
        case Reports.get_report(id) do
          nil -> {:error, :not_found}
          report -> {:ok, report}
        end

      :error ->
        case Reports.get_report_by_slug(id) do
          nil -> {:error, :not_found}
          report -> {:ok, report}
        end
    end
  end
end
