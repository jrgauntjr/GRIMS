defmodule GrimsWeb.ScheduleController do
  use GrimsWeb, :controller

  alias Grims.Schedules
  alias Grims.Schedules.Schedule

  action_fallback GrimsWeb.FallbackController

  def index(conn, _params) do
    schedules = Schedules.list_schedules()
    render(conn, :index, schedules: schedules)
  end

  def create(conn, %{"schedule" => schedule_params}) when is_map(schedule_params) do
    with {:ok, %Schedule{} = schedule} <- Schedules.create_schedule(schedule_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/schedules/#{schedule}")
      |> render(:show, schedule: schedule)
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def show(conn, %{"id" => id}) do
    with {:ok, schedule} <- get_schedule_or_error(id),
         do: render(conn, :show, schedule: schedule)
  end

  def update(conn, %{"id" => id, "schedule" => schedule_params}) when is_map(schedule_params) do
    with {:ok, schedule} <- get_schedule_or_error(id),
         {:ok, %Schedule{} = schedule} <- Schedules.update_schedule(schedule, schedule_params),
         do: render(conn, :show, schedule: schedule)
  end

  def update(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, schedule} <- get_schedule_or_error(id),
         {:ok, %Schedule{}} <- Schedules.delete_schedule(schedule),
         do: send_resp(conn, :no_content, "")
  end

  defp get_schedule_or_error(id) do
    case Schedules.get_schedule(id) do
      nil -> {:error, :not_found}
      schedule -> {:ok, schedule}
    end
  end
end
