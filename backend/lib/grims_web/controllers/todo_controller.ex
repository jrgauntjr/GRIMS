defmodule GrimsWeb.TodoController do
  use GrimsWeb, :controller

  alias Grims.Todos
  alias Grims.Todos.Todo

  action_fallback GrimsWeb.FallbackController

  def index(conn, _params) do
    todos = Todos.list_todos()
    render(conn, :index, todos: todos)
  end

  def create(conn, %{"todo" => todo_params}) when is_map(todo_params) do
    with {:ok, %Todo{} = todo} <- Todos.create_todo(todo_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/todos/#{todo}")
      |> render(:show, todo: todo)
    end
  end

  def create(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def show(conn, %{"id" => id}) do
    with {:ok, todo} <- get_todo_or_error(id),
         do: render(conn, :show, todo: todo)
  end

  def update(conn, %{"id" => id, "todo" => todo_params}) when is_map(todo_params) do
    with {:ok, todo} <- get_todo_or_error(id),
         {:ok, %Todo{} = todo} <- Todos.update_todo(todo, todo_params),
         do: render(conn, :show, todo: todo)
  end

  def update(conn, _params) do
    conn
    |> put_status(:unprocessable_entity)
    |> put_view(json: GrimsWeb.ErrorJSON)
    |> render(:"422")
  end

  def delete(conn, %{"id" => id}) do
    with {:ok, todo} <- get_todo_or_error(id),
         {:ok, %Todo{}} <- Todos.delete_todo(todo),
         do: send_resp(conn, :no_content, "")
  end

  defp get_todo_or_error(id) do
    case Todos.get_todo(id) do
      nil -> {:error, :not_found}
      todo -> {:ok, todo}
    end
  end
end
