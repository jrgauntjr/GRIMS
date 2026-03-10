defmodule GrimsWeb.ScheduleJSON do
  def index(%{schedules: schedules}) do
    %{data: for(schedule <- schedules, do: data(schedule))}
  end

  def show(%{schedule: schedule}) do
    %{data: data(schedule)}
  end

  defp data(schedule) do
    %{
      id: schedule.id,
      customer_name: schedule.customer_name,
      customer_number: schedule.customer_number,
      console: schedule.console,
      status: schedule.status,
      description: schedule.description,
      inserted_at: schedule.inserted_at,
      updated_at: schedule.updated_at
    }
  end
end
