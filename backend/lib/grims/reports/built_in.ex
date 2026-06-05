defmodule Grims.Reports.BuiltIn do
  @moduledoc false

  @slugs ~w(
    inventory-by-platform
    inventory-by-condition
    low-stock
    open-jobs
    jobs-by-status
    shelf-summary
  )

  def builtin?(slug) when is_binary(slug), do: slug in @slugs
  def builtin?(_), do: false

  def slugs, do: @slugs
end
