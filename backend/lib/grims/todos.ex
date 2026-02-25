defmodule Grims.Todos do
  @moduledoc """
  The Todos context: CRUD for todo items.
  """

  import Ecto.Query, only: [from: 2]
  alias Grims.Repo
  alias Grims.Todos.Todo

  def list_todos do
    Repo.all(from t in Todo, order_by: [desc: t.inserted_at])
  end

  def get_todo!(id), do: Repo.get!(Todo, id)

  def get_todo(id), do: Repo.get(Todo, id)

  def create_todo(attrs \\ %{}) do
    %Todo{}
    |> Todo.changeset(attrs)
    |> Repo.insert()
  end

  def update_todo(%Todo{} = todo, attrs) do
    todo
    |> Todo.changeset(attrs)
    |> Repo.update()
  end

  def delete_todo(%Todo{} = todo) do
    Repo.delete(todo)
  end
end
