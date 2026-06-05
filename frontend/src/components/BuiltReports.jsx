import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import reportLight from '../assets/report_light.png'
import { deleteReport, fetchReports } from '../api/reports.js'
import { BUILT_IN_REPORTS } from '../data/builtInReports.js'
import './BuiltReports.css'

export default function BuiltReports() {
  const [customReports, setCustomReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (report) => {
    if (
      !window.confirm(
        `Delete "${report.title}"? This cannot be undone.`,
      )
    ) {
      return
    }

    setDeletingId(report.id)
    setError(null)

    try {
      await deleteReport(report.slug)
      setCustomReports((prev) => prev.filter((r) => r.id !== report.id))
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  useEffect(() => {
    let cancelled = false

    fetchReports()
      .then((rows) => {
        if (!cancelled) setCustomReports(rows)
      })
      .catch((err) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="built-reports">
      <header className="built-reports__header">
        <div className="built-reports__title-block">
          <h1>
            Reports{' '}
            <img
              src={reportLight}
              alt=""
              className="built-reports__icon"
              width={25}
              height={25}
            />
          </h1>
          <p className="built-reports__lede">
            Built-in summaries for inventory and repair work. Custom reports are
            saved in the database.
          </p>
        </div>
        <Link to="/reports/new" className="built-reports__create">
          Create a report
        </Link>
      </header>

      {error && (
        <p className="built-reports__error" role="alert">
          {error}
        </p>
      )}

      {loading && (
        <p className="built-reports__muted">Loading your reports…</p>
      )}

      {!loading && customReports.length > 0 && (
        <>
          <h2 className="built-reports__section-title">Your reports</h2>
          <nav
            className="built-reports__grid built-reports__grid--custom"
            aria-label="Custom reports"
          >
            {customReports.map((report) => (
              <div
                key={report.id}
                className="built-reports__tile built-reports__tile--custom"
              >
                <button
                  type="button"
                  className="built-reports__delete"
                  onClick={() => handleDelete(report)}
                  disabled={deletingId === report.id}
                  aria-label={`Delete ${report.title}`}
                >
                  ×
                </button>
                <Link
                  to={`/reports/${report.slug}`}
                  className="built-reports__tile-link"
                >
                  <span className="built-reports__tile-badge">Custom</span>
                  <span className="built-reports__tile-title">{report.title}</span>
                  <span className="built-reports__tile-desc">{report.description}</span>
                </Link>
              </div>
            ))}
          </nav>
        </>
      )}

      <h2 className="built-reports__section-title">Built-in reports</h2>
      <nav
        className="built-reports__grid"
        aria-label="Built-in reports"
      >
        {BUILT_IN_REPORTS.map((report) => (
          <Link
            key={report.slug}
            to={`/reports/${report.slug}`}
            className="built-reports__tile"
          >
            <span className="built-reports__tile-title">{report.title}</span>
            <span className="built-reports__tile-desc">{report.description}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
