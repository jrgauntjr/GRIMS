import { Link } from 'react-router-dom'
import reportLight from '../assets/report_light.png'
import { BUILT_IN_REPORTS } from '../data/builtInReports.js'
import { listCustomReports } from '../data/customReports.js'
import './BuiltReports.css'

export default function BuiltReports() {
  const customReports = listCustomReports()

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
            Built-in summaries for inventory and repair work. Custom reports can
            be saved from the create flow.
          </p>
        </div>
        <Link to="/reports/new" className="built-reports__create">
          Create a report
        </Link>
      </header>

      {customReports.length > 0 && (
        <>
          <h2 className="built-reports__section-title">Your reports</h2>
          <nav
            className="built-reports__grid built-reports__grid--custom"
            aria-label="Custom reports"
          >
            {customReports.map((report) => (
              <Link
                key={report.slug}
                to={`/reports/${report.slug}`}
                className="built-reports__tile built-reports__tile--custom"
              >
                <span className="built-reports__tile-badge">Custom</span>
                <span className="built-reports__tile-title">{report.title}</span>
                <span className="built-reports__tile-desc">{report.description}</span>
              </Link>
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
