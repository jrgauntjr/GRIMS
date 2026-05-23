defmodule GrimsWeb.GameSearchJSON do
  def index(%{games: games}) do
    %{data: games}
  end
end
