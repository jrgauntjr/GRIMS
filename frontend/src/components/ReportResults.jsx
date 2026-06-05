import { useMemo, useState } from 'react'
import { buildChartData } from '../utils/reportChart.js'
import './BuiltReports.css'

function formatCell(value) {
  if (value == null || value === '') return '—'
  if (Array.isArray(value)) return value.join(', ')
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const d = new Date(value)
    if (!Number.isNaN(d.getTime())) return d.toLocaleString()
  }
  return String(value)
}

function ReportBarChart({ chartData }) {
  const maxValue = Math.max(...chartData.bars.map((bar) => bar.value), 1)

  return (
    <div
      className="built-reports__chart"
      role="img"
      aria-label={`Bar chart of ${chartData.valueLabel}`}
    >
      {chartData.bars.map((bar) => {
        const heightPct = Math.max((bar.value / maxValue) * 100, bar.value > 0 ? 4 : 0)

        return (
          <div key={bar.key} className="built-reports__chart-bar-col">
            <span className="built-reports__chart-bar-value">{bar.value}</span>
            <div className="built-reports__chart-bar-track">
              <div
                className="built-reports__chart-bar"
                style={{ height: `${heightPct}%` }}
                title={`${bar.label}: ${bar.value}`}
              />
            </div>
            <span className="built-reports__chart-bar-label" title={bar.label}>
              {bar.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function ReportResults({ result, loading, error }) {
  const [view, setView] = useState('rows')
  const chartData = useMemo(
    () => (result ? buildChartData(result) : null),
    [result],
  )

  if (loading) {
    return <p className="built-reports__muted">Running report…</p>
  }

  if (error) {
    return (
      <p className="built-reports__error" role="alert">
        {error}
      </p>
    )
  }

  if (!result) {
    return null
  }

  const { columns = [], rows = [], row_count: rowCount = 0, mode } = result

  if (rows.length === 0) {
    return <p className="built-reports__empty">No rows match this report.</p>
  }

  const activeView = view === 'chart' && chartData ? 'chart' : 'rows'

  return (
    <>
      <div className="built-reports__results-toolbar">
        <p className="built-reports__results-meta" aria-live="polite">
          {rowCount} row{rowCount === 1 ? '' : 's'}
          {mode === 'aggregate' ? ' (aggregated)' : ''}
          {mode === 'metrics' ? ' (summary)' : ''}
          {activeView === 'chart' && chartData
            ? ` · ${chartData.valueLabel} by category`
            : ''}
        </p>
        <div
          className="built-reports__view-toggle"
          role="group"
          aria-label="Results view"
        >
          <button
            type="button"
            className="built-reports__view-btn"
            aria-pressed={activeView === 'rows'}
            onClick={() => setView('rows')}
          >
            Rows
          </button>
          <button
            type="button"
            className="built-reports__view-btn"
            aria-pressed={activeView === 'chart'}
            onClick={() => setView('chart')}
            disabled={!chartData}
            title={chartData ? undefined : 'No chartable data in this report'}
          >
            Bar graph
          </button>
        </div>
      </div>
      {activeView === 'chart' && chartData ? (
        <ReportBarChart chartData={chartData} />
      ) : (
        <div className="built-reports__table-wrap">
          <table className="built-reports__table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col.key} scope="col">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.id ?? `row-${index}`}>
                  {columns.map((col) => (
                    <td key={col.key}>{formatCell(row[col.key])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
