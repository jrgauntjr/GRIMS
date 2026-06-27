defmodule Grims.Reports.Runner do
  @moduledoc false

  alias Grims.Inventories
  alias Grims.Reports.BuiltIn
  alias Grims.Reports.Report
  alias Grims.Schedules
  alias Grims.Todos

  @low_stock_threshold 2

  @column_labels %{
    "inventory" => %{
      "name" => "Title",
      "platforms" => "Platform",
      "release_year" => "Year",
      "qty" => "Qty",
      "condition" => "Condition",
      "notes" => "Notes",
      "igdb_id" => "IGDB ID",
      "inserted_at" => "Added"
    },
    "jobs" => %{
      "customer_name" => "Customer",
      "customer_number" => "Phone",
      "console" => "Console",
      "status" => "Status",
      "description" => "Description",
      "inserted_at" => "Opened"
    },
    "todos" => %{
      "title" => "Title",
      "completed" => "Completed",
      "tags" => "Tags",
      "inserted_at" => "Added"
    }
  }

  @aggregate_labels %{
    "platform" => "Platform",
    "condition" => "Condition",
    "release_year" => "Year",
    "status" => "Status",
    "console" => "Console",
    "completed" => "Completed",
    "lines" => "Lines",
    "qty" => "Total qty",
    "count" => "Count",
    "metric" => "Metric",
    "value" => "Value"
  }

  def run(%Report{} = report) do
    {:ok, run_custom(report)}
  end

  def run(slug) when is_binary(slug) do
    if BuiltIn.builtin?(slug) do
      {:ok, run_builtin(slug)}
    else
      {:error, :not_found}
    end
  end

  def run(_), do: {:error, :not_found}

  defp run_builtin("inventory-by-platform") do
    rows =
      Inventories.list_inventory_items()
      |> Enum.map(&inventory_row/1)
      |> aggregate_inventory_by_platform()

    result("aggregate", aggregate_columns("platform"), rows)
  end

  defp run_builtin("inventory-by-condition") do
    rows =
      Inventories.list_inventory_items()
      |> Enum.map(&inventory_row/1)
      |> aggregate_inventory_by_field("condition")

    result("aggregate", aggregate_columns("condition"), rows)
  end

  defp run_builtin("low-stock") do
    rows =
      Inventories.list_inventory_items()
      |> Enum.map(&inventory_row/1)
      |> Enum.filter(fn row -> row["qty"] <= @low_stock_threshold end)
      |> sort_rows("name", "asc")

    columns = column_defs(["name", "platforms", "qty", "condition"], "inventory")
    result("rows", columns, rows)
  end

  defp run_builtin("open-jobs") do
    rows =
      Schedules.list_schedules()
      |> Enum.map(&job_row/1)
      |> Enum.filter(fn row -> row["status"] in ["open", "in_progress"] end)
      |> sort_rows("inserted_at", "desc")

    columns =
      column_defs(["customer_name", "console", "status", "description"], "jobs")

    result("rows", columns, rows)
  end

  defp run_builtin("jobs-by-status") do
    rows =
      Schedules.list_schedules()
      |> Enum.map(&job_row/1)
      |> aggregate_jobs_by_status()

    result("aggregate", aggregate_columns("status"), rows)
  end

  defp run_builtin("shelf-summary") do
    items = Inventories.list_inventory_items()

    platform_set =
      items
      |> Enum.flat_map(&(&1.platforms || []))
      |> MapSet.new()

    rows = [
      %{"metric" => "Shelf lines", "value" => Integer.to_string(length(items))},
      %{
        "metric" => "Total quantity",
        "value" => Integer.to_string(Enum.sum(Enum.map(items, & &1.qty)))
      },
      %{
        "metric" => "Unique titles",
        "value" => Integer.to_string(items |> Enum.map(& &1.name) |> Enum.uniq() |> length())
      },
      %{
        "metric" => "Platforms represented",
        "value" => Integer.to_string(MapSet.size(platform_set))
      }
    ]

    columns = column_defs(["metric", "value"], nil)
    result("metrics", columns, rows)
  end

  defp run_builtin(_), do: {:error, :not_found}

  defp run_custom(%Report{} = report) do
    rows = load_rows(report.source)
    rows = filter_rows(rows, report.filters || %{}, report.source)
    rows = sort_rows(rows, report.sort_field, report.sort_direction)

    if present?(report.group_by) do
      rows = aggregate_custom(rows, report.group_by, report.source)
      columns = aggregate_columns(report.group_by)
      result("aggregate", columns, rows)
    else
      columns = column_defs(report.columns, report.source)
      rows = project_rows(rows, report.columns)
      result("rows", columns, rows)
    end
  end

  defp load_rows("inventory"),
    do: Inventories.list_inventory_items() |> Enum.map(&inventory_row/1)

  defp load_rows("jobs"), do: Schedules.list_schedules() |> Enum.map(&job_row/1)
  defp load_rows("todos"), do: Todos.list_todos() |> Enum.map(&todo_row/1)
  defp load_rows(_), do: []

  defp filter_rows(rows, filters, "inventory") do
    platform = filter_string(filters, ["platform"])
    condition = filter_string(filters, ["condition"])
    min_qty = filter_int(filters, ["minQty", "min_qty"])
    max_qty = filter_int(filters, ["maxQty", "max_qty"])
    year_from = filter_int(filters, ["yearFrom", "year_from"])
    year_to = filter_int(filters, ["yearTo", "year_to"])

    rows
    |> Enum.filter(fn row ->
      platform_match =
        if platform == "", do: true, else: platform_match?(row["platforms"], platform)

      condition_match = condition == "" or row["condition"] == condition
      min_match = is_nil(min_qty) or row["qty"] >= min_qty
      max_match = is_nil(max_qty) or row["qty"] <= max_qty
      year = row["release_year"]
      from_match = is_nil(year_from) or (is_integer(year) and year >= year_from)
      to_match = is_nil(year_to) or (is_integer(year) and year <= year_to)

      platform_match and condition_match and min_match and max_match and from_match and to_match
    end)
  end

  defp filter_rows(rows, filters, "jobs") do
    status = filter_string(filters, ["status"])
    console = filter_string(filters, ["console"])

    rows
    |> Enum.filter(fn row ->
      status_match = status == "" or row["status"] == status

      console_match =
        console == "" or
          String.contains?(String.downcase(row["console"] || ""), String.downcase(console))

      status_match and console_match
    end)
  end

  defp filter_rows(rows, filters, "todos") do
    completion =
      filter_string(filters, ["completion"]) |> then(fn v -> if v == "", do: "all", else: v end)

    tag = filter_string(filters, ["tag"])

    rows
    |> Enum.filter(fn row ->
      completion_match =
        case completion do
          "open" -> row["completed"] == false
          "done" -> row["completed"] == true
          _ -> true
        end

      tag_match =
        if tag == "",
          do: true,
          else:
            (row["tags"] || [])
            |> Enum.any?(fn t -> String.contains?(String.downcase(t), String.downcase(tag)) end)

      completion_match and tag_match
    end)
  end

  defp filter_rows(rows, _, _), do: rows

  defp sort_rows(rows, field, direction) do
    sorted =
      Enum.sort_by(rows, fn row -> sort_key(row, field) end, sort_direction(direction))

    sorted
  end

  defp sort_direction("desc"), do: :desc
  defp sort_direction(_), do: :asc

  defp sort_key(row, "platforms"),
    do: (row["platforms"] || []) |> Enum.join(", ") |> String.downcase()

  defp sort_key(row, "tags"), do: (row["tags"] || []) |> Enum.join(", ") |> String.downcase()
  defp sort_key(row, "completed"), do: row["completed"] == true
  defp sort_key(row, field), do: row[field]

  defp aggregate_custom(rows, "platform", "inventory"), do: aggregate_inventory_by_platform(rows)

  defp aggregate_custom(rows, field, "inventory") when field in ["condition", "release_year"],
    do: aggregate_inventory_by_field(rows, field)

  defp aggregate_custom(rows, "status", "jobs"), do: aggregate_jobs_by_status(rows)
  defp aggregate_custom(rows, "console", "jobs"), do: aggregate_jobs_by_field(rows, "console")

  defp aggregate_custom(rows, "completed", "todos") do
    rows
    |> Enum.group_by(& &1["completed"])
    |> Enum.map(fn {completed, group} ->
      %{
        "completed" => format_bool(completed),
        "count" => length(group)
      }
    end)
    |> sort_rows("completed", "asc")
  end

  defp aggregate_custom(rows, _, _), do: rows

  defp aggregate_inventory_by_platform(rows) do
    rows
    |> explode_platforms()
    |> aggregate_inventory_by_field("platform")
  end

  defp explode_platforms(rows) do
    Enum.flat_map(rows, fn row ->
      case row["platforms"] do
        [] -> [%{row | "platform" => "Unknown"}]
        platforms -> Enum.map(platforms, fn p -> Map.put(row, "platform", p) end)
      end
    end)
  end

  defp aggregate_inventory_by_field(rows, field) do
    rows
    |> Enum.group_by(& &1[field])
    |> Enum.map(fn {key, group} ->
      %{
        field => format_group_key(key),
        "lines" => length(group),
        "qty" => Enum.sum(Enum.map(group, & &1["qty"]))
      }
    end)
    |> sort_rows(field, "asc")
  end

  defp aggregate_jobs_by_status(rows), do: aggregate_jobs_by_field(rows, "status")

  defp aggregate_jobs_by_field(rows, field) do
    rows
    |> Enum.group_by(& &1[field])
    |> Enum.map(fn {key, group} ->
      %{
        field => format_group_key(key),
        "count" => length(group)
      }
    end)
    |> sort_rows(field, "asc")
  end

  defp project_rows(rows, columns) do
    Enum.map(rows, fn row ->
      Map.take(row, columns)
    end)
  end

  defp aggregate_columns("platform"), do: column_defs(["platform", "lines", "qty"], nil)
  defp aggregate_columns("condition"), do: column_defs(["condition", "lines", "qty"], nil)
  defp aggregate_columns("release_year"), do: column_defs(["release_year", "lines", "qty"], nil)
  defp aggregate_columns("status"), do: column_defs(["status", "count"], nil)
  defp aggregate_columns("console"), do: column_defs(["console", "count"], nil)
  defp aggregate_columns("completed"), do: column_defs(["completed", "count"], nil)
  defp aggregate_columns(_), do: column_defs(["lines", "qty"], nil)

  defp column_defs(keys, source) when is_list(keys) do
    Enum.map(keys, fn key ->
      %{key: key, label: column_label(key, source)}
    end)
  end

  defp column_label(key, source) when is_binary(source) do
    Map.get(@column_labels, source, %{})
    |> Map.get(key, Map.get(@aggregate_labels, key, humanize(key)))
  end

  defp column_label(key, _), do: Map.get(@aggregate_labels, key, humanize(key))

  defp humanize(key) do
    key
    |> String.replace("_", " ")
    |> String.split()
    |> Enum.map_join(" ", &String.capitalize/1)
  end

  defp result(mode, columns, rows) do
    formatted_rows = Enum.map(rows, &format_row/1)

    %{
      mode: mode,
      columns: columns,
      rows: formatted_rows,
      row_count: length(formatted_rows)
    }
  end

  defp format_row(row) when is_map(row) do
    Map.new(row, fn {k, v} -> {k, format_value(v)} end)
  end

  defp format_value(%DateTime{} = dt), do: DateTime.to_iso8601(dt)
  defp format_value(value) when is_list(value), do: value
  defp format_value(value) when is_boolean(value), do: format_bool(value)
  defp format_value(value), do: value

  defp format_bool(true), do: "Yes"
  defp format_bool(false), do: "No"
  defp format_bool(value), do: to_string(value)

  defp format_group_key(nil), do: "Unknown"
  defp format_group_key(value), do: to_string(value)

  defp inventory_row(item) do
    %{
      "id" => item.id,
      "igdb_id" => item.igdb_id,
      "name" => item.name,
      "platforms" => item.platforms || [],
      "release_year" => item.release_year,
      "qty" => item.qty,
      "condition" => item.condition,
      "notes" => item.notes || "",
      "inserted_at" => item.inserted_at
    }
  end

  defp job_row(schedule) do
    %{
      "id" => schedule.id,
      "customer_name" => schedule.customer_name,
      "customer_number" => schedule.customer_number,
      "console" => schedule.console,
      "status" => schedule.status,
      "description" => schedule.description,
      "inserted_at" => schedule.inserted_at
    }
  end

  defp todo_row(todo) do
    %{
      "id" => todo.id,
      "title" => todo.title,
      "completed" => todo.completed,
      "tags" => todo.tags || [],
      "inserted_at" => todo.inserted_at
    }
  end

  defp platform_match?(platforms, query) do
    down = String.downcase(query)

    Enum.any?(platforms || [], fn platform ->
      String.contains?(String.downcase(platform), down)
    end)
  end

  defp filter_string(filters, keys) do
    keys
    |> Enum.find_value("", fn key ->
      case Map.get(filters, key) do
        value when is_binary(value) -> String.trim(value)
        _ -> nil
      end
    end)
  end

  defp filter_int(filters, keys) do
    case filter_string(filters, keys) do
      "" ->
        nil

      value ->
        case Integer.parse(value) do
          {int, _} -> int
          :error -> nil
        end
    end
  end

  defp present?(value) when is_binary(value), do: String.trim(value) != ""
  defp present?(_), do: false
end
