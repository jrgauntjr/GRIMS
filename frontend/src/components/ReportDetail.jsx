import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { deleteReport, fetchReport, runReport } from '../api/reports.js'
import { getBuiltInReport } from '../data/builtInReports.js'
import { REPORT_SOURCES, getSourceConfig } from '../data/reportFormConfig.js'
import ReportResults from './ReportResults.jsx'
import './BuiltReports.css'

function ReportDefinitionSummary({ report }) {
  const sourceConfig = getSourceConfig(report.source)
  const sourceLabel =
    REPORT_SOURCES.find((s) => s.value === report.source)?.label ?? report.source

  return (
    <dl className="built-reports__summary">
      <div>
        <dt>Data source</dt>
        <dd>{sourceLabel}</dd>
      </div>
      <div>
        <dt>Columns</dt>
        <dd>
          {report.columns
            .map(
              (v) => sourceConfig.columns.find((c) => c.value === v)?.label ?? v,
            )
            .join(', ')}
        </dd>
      </div>
      <div>
        <dt>Sort</dt>
        <dd>
          {sourceConfig.sortFields.find((f) => f.value === report.sortField)?.label ??
            report.sortField}{' '}
          ({report.sortDirection === 'asc' ? 'ascending' : 'descending'})
        </dd>
      </div>
      {report.groupBy && (
        <div>
          <dt>Group by</dt>
          <dd>
            {sourceConfig.groupBy.find((g) => g.value === report.groupBy)?.label ??
              report.groupBy}
          </dd>
        </div>
      )}
      <div>
        <dt>Filters</dt>
        <dd>
          <ul className="built-reports__filter-list">
            {(() => {
              const active = Object.entries(report.filters ?? {}).filter(
                ([, v]) => v !== '' && v != null && v !== 'all',
              )
              if (active.length === 0) {
                return <li>No filters applied</li>
              }
              return active.map(([key, value]) => (
                <li key={key}>
                  {key}: {String(value)}
                </li>
              ))
            })()}
          </ul>
        </dd>
      </div>
    </dl>
  )
}

export default function ReportDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const builtIn = getBuiltInReport(slug)
  const [custom, setCustom] = useState(null)
  const [error, setError] = useState(null)
  const [runResult, setRunResult] = useState(null)
  const [runLoading, setRunLoading] = useState(true)
  const [runError, setRunError] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    if (!custom) return

    if (
      !window.confirm(
        `Delete "${custom.title}"? This cannot be undone.`,
      )
    ) {
      return
    }

    setDeleting(true)
    setError(null)

    try {
      await deleteReport(custom.slug)
      navigate('/reports')
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  useEffect(() => {
    if (builtIn) return undefined

    let cancelled = false

    fetchReport(slug)
      .then((report) => {
        if (!cancelled) setCustom(report)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })

    return () => {
      cancelled = true
    }
  }, [slug, builtIn])

  useEffect(() => {
    let cancelled = false

    runReport(slug)
      .then((result) => {
        if (!cancelled) setRunResult(result)
      })
      .catch((err) => {
        if (!cancelled) setRunError(err.message)
      })
      .finally(() => {
        if (!cancelled) setRunLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  const report = builtIn ?? custom
  const metaLoading = !builtIn && !custom && !error

  if (metaLoading) {
    return (
      <div className="built-reports built-reports--detail">
        <Link to="/reports" className="built-reports__back">
          ← Back to reports
        </Link>
        <p className="built-reports__muted">Loading report…</p>
      </div>
    )
  }

  if (!report) {
    return (
      <div className="built-reports built-reports--detail">
        <p className="built-reports__error" role="alert">
          {error ?? 'Report not found.'}
        </p>
        <Link to="/reports" className="built-reports__back">
          ← Back to reports
        </Link>
      </div>
    )
  }

  return (
    <div className="built-reports built-reports--detail">
      <Link to="/reports" className="built-reports__back">
        ← Back to reports
      </Link>
      <header className="built-reports__detail-header">
        <div className="built-reports__detail-title-row">
          <div>
            {custom && <span className="built-reports__tile-badge">Custom</span>}
            <h1>{report.title}</h1>
          </div>
          {custom && (
            <button
              type="button"
              className="built-reports__btn built-reports__btn--danger"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete report'}
            </button>
          )}
        </div>
        <p className="built-reports__lede">{report.description}</p>
      </header>
      {error && (
        <p className="built-reports__error" role="alert">
          {error}
        </p>
      )}
      {custom && (
        <section className="built-reports__panel" aria-labelledby="report-config-heading">
          <h2 id="report-config-heading" className="built-reports__h2">
            Saved configuration
          </h2>
          <ReportDefinitionSummary report={custom} />
        </section>
      )}
      <section className="built-reports__panel" aria-labelledby="report-results-heading">
        <h2 id="report-results-heading" className="built-reports__h2">
          Results
        </h2>
        <ReportResults
          key={slug}
          result={runResult}
          loading={runLoading}
          error={runError}
        />
      </section>
    </div>
  )
}
