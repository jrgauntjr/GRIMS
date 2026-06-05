defmodule GrimsWeb.ReportControllerTest do
  use GrimsWeb.ConnCase, async: true

  alias Grims.Reports
  alias Grims.Reports.Report

  @valid_attrs %{
    "title" => "SNES sealed stock",
    "description" => "Sealed SNES inventory",
    "source" => "inventory",
    "sort_field" => "name",
    "sort_direction" => "asc",
    "group_by" => "platform",
    "columns" => ["name", "qty", "condition"],
    "filters" => %{
      "platform" => "SNES",
      "condition" => "sealed",
      "minQty" => "1"
    }
  }

  defp report_fixture(attrs \\ %{}) do
    {:ok, report} =
      attrs
      |> Enum.into(@valid_attrs)
      |> Reports.create_report()

    report
  end

  describe "index" do
    test "lists all reports", %{conn: conn} do
      report = report_fixture()
      conn = get(conn, ~p"/api/reports")
      assert [%{"id" => id, "slug" => slug}] = json_response(conn, 200)["data"]
      assert id == report.id
      assert slug == report.slug
    end
  end

  describe "create" do
    test "renders report when data is valid", %{conn: conn} do
      conn = post(conn, ~p"/api/reports", report: @valid_attrs)

      assert %{"id" => id, "slug" => "snes-sealed-stock", "custom" => true} =
               json_response(conn, 201)["data"]

      assert %Report{} = Reports.get_report!(id)
    end

    test "renders errors when data is invalid", %{conn: conn} do
      conn = post(conn, ~p"/api/reports", report: %{})
      assert json_response(conn, 422)["errors"]
    end
  end

  describe "show" do
    test "renders report by id", %{conn: conn} do
      report = report_fixture()
      conn = get(conn, ~p"/api/reports/#{report}")
      assert json_response(conn, 200)["data"]["id"] == report.id
    end

    test "renders report by slug", %{conn: conn} do
      report = report_fixture()
      conn = get(conn, ~p"/api/reports/#{report.slug}")
      assert json_response(conn, 200)["data"]["slug"] == report.slug
    end

    test "returns 404 when missing", %{conn: conn} do
      conn = get(conn, ~p"/api/reports/missing-report")
      assert json_response(conn, 404)
    end
  end

  describe "update" do
    test "renders report when data is valid", %{conn: conn} do
      report = report_fixture()

      conn =
        put(conn, ~p"/api/reports/#{report}", report: %{
          "description" => "Updated description"
        })

      assert json_response(conn, 200)["data"]["description"] == "Updated description"
    end
  end

  describe "delete" do
    test "deletes chosen report", %{conn: conn} do
      report = report_fixture()
      conn = delete(conn, ~p"/api/reports/#{report}")
      assert response(conn, 204)
      refute Reports.get_report(report.id)
    end
  end

  describe "run" do
    test "runs a saved report by slug", %{conn: conn} do
      report = report_fixture()
      conn = get(conn, ~p"/api/reports/#{report.slug}/run")

      assert %{"mode" => mode, "row_count" => count, "columns" => columns, "rows" => _} =
               json_response(conn, 200)["data"]

      assert mode in ["rows", "aggregate", "metrics"]
      assert is_list(columns)
      assert is_integer(count)
    end

    test "runs a built-in report by slug", %{conn: conn} do
      conn = get(conn, ~p"/api/reports/shelf-summary/run")

      assert %{"mode" => "metrics", "rows" => rows} = json_response(conn, 200)["data"]
      assert length(rows) >= 1
    end

    test "returns 404 for unknown slug", %{conn: conn} do
      conn = get(conn, ~p"/api/reports/not-a-real-report/run")
      assert json_response(conn, 404)
    end
  end
end
