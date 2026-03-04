defmodule Grims.Schedules do
  @moduledoc """
  The Schedules context: CRUD for job scheduling items.
  """
  import Ecto.Query, only: [from: 2]

  alias Grims.Repo
  alias Grims.Schedules.Schedule

  def list_schedules do
    Repo.all(from s in Schedule, order_by: [desc: s.inserted_at])
  end

  def get_schedule!(id), do: Repo.get!(Schedule, id)

  def get_schedule(id), do: Repo.get(Schedule, id)

  def create_schedule(attrs \\ %{}) do
    %Schedule{}
    |> Schedule.changeset(attrs)
    |> Repo.insert()
  end

  def update_schedule(%Schedule{} = schedule, attrs) do
    schedule
    |> Schedule.changeset(attrs)
    |> Repo.update()
  end

  def delete_schedule(%Schedule{} = schedule) do
    Repo.delete(schedule)
  end
end
