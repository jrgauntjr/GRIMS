defmodule Grims.Schedules.Schedule do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id

  schema "schedules" do
    field :customer_name, :string
    field :customer_number, :string        # phone number or similar
    field :console, :string                # e.g. "SNES", "PS2", "Switch"
    field :status, :string, default: "open"  # "open" | "in_progress" | "done" | "cancelled"
    field :description, :string            # what's wrong

    # inserted_at = when ticket was opened
    # updated_at  = last change
    timestamps(type: :utc_datetime)
  end

  def changeset(schedule, attrs) do
    schedule
    |> cast(attrs, [:customer_name, :customer_number, :console, :status, :description])
    |> validate_required([:customer_name, :customer_number, :console, :status, :description])
    |> validate_inclusion(:status, ["open", "in_progress", "done", "cancelled"])
  end
end
