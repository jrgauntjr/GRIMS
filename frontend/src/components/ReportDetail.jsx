import { Link, useParams } from 'react-router-dom'
import { getBuiltInReport } from '../data/builtInReports.js'
import { getCustomReport } from '../data/customReports.js'
import { REPORT_SOURCES, getSourceConfig } from '../data/reportFormConfig.js'
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
  const builtIn = getBuiltInReport(slug)
  const custom = getCustomReport(slug)
  const report = builtIn ?? custom

  if (!report) {
    return (
      <div className="built-reports built-reports--detail">
        <p className="built-reports__error">Report not found.</p>
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
        {custom && <span className="built-reports__tile-badge">Custom</span>}
        <h1>{report.title}</h1>
        <p className="built-reports__lede">{report.description}</p>
      </header>
      {custom && (
        <section className="built-reports__panel" aria-labelledby="report-config-heading">
          <h2 id="report-config-heading" className="built-reports__h2">
            Saved configuration
          </h2>
          <ReportDefinitionSummary report={custom} />
        </section>
      )}
      <section className="built-reports__panel" aria-labelledby="report-preview-heading">
        <h2 id="report-preview-heading" className="built-reports__h2">
          Preview
        </h2>
        <p className="built-reports__muted">
          Report output will load here once the backend report runner is wired
          up. This page is ready for tables, charts, or export actions.
        </p>
      </section>
    </div>
  )
}
