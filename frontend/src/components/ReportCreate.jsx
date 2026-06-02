import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  REPORT_SOURCES,
  SORT_DIRECTIONS,
  defaultFormState,
  getSourceConfig,
} from '../data/reportFormConfig.js'
import { saveCustomReport } from '../data/customReports.js'
import './BuiltReports.css'

function toggleColumn(columns, value) {
  if (columns.includes(value)) {
    return columns.filter((c) => c !== value)
  }
  return [...columns, value]
}

export default function ReportCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState(defaultFormState())
  const [error, setError] = useState(null)
  const [savedSlug, setSavedSlug] = useState(null)

  const sourceConfig = useMemo(
    () => getSourceConfig(form.source),
    [form.source],
  )

  function setField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function setFilter(key, value) {
    setForm((prev) => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
    }))
  }

  function handleSourceChange(source) {
    setForm({
      ...defaultFormState(source),
      name: form.name,
      description: form.description,
    })
  }

  function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    const name = form.name.trim()
    if (!name) {
      setError('Report name is required.')
      return
    }
    if (form.columns.length === 0) {
      setError('Select at least one column.')
      return
    }

    const saved = saveCustomReport({
      title: name,
      description: form.description.trim() || 'Custom report',
      source: form.source,
      sortField: form.sortField,
      sortDirection: form.sortDirection,
      groupBy: form.groupBy,
      columns: form.columns,
      filters: form.filters,
    })

    setSavedSlug(saved.slug)
  }

  if (savedSlug) {
    return (
      <div className="built-reports built-reports--detail">
        <section className="built-reports__panel built-reports__panel--success">
          <h2 className="built-reports__h2">Report saved</h2>
          <p className="built-reports__muted">
            &quot;{form.name.trim()}&quot; is in your report library (stored locally
            until the backend is connected).
          </p>
          <div className="built-reports__form-actions">
            <button
              type="button"
              className="built-reports__btn built-reports__btn--primary"
              onClick={() => navigate(`/reports/${savedSlug}`)}
            >
              View report
            </button>
            <Link to="/reports" className="built-reports__btn built-reports__btn--ghost">
              Back to reports
            </Link>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="built-reports built-reports--detail built-reports--form">
      <Link to="/reports" className="built-reports__back">
        ← Back to reports
      </Link>
      <header className="built-reports__detail-header">
        <h1>Create a report</h1>
        <p className="built-reports__lede">
          Name your report, pick a data source, then choose filters, columns, and
          sort order.
        </p>
      </header>

      <form className="built-reports__form" onSubmit={handleSubmit}>
        {error && (
          <p className="built-reports__error" role="alert">
            {error}
          </p>
        )}

        <section
          className="built-reports__panel"
          aria-labelledby="report-basics-heading"
        >
          <h2 id="report-basics-heading" className="built-reports__h2">
            Basics
          </h2>
          <div className="built-reports__field">
            <label className="built-reports__label" htmlFor="report-name">
              Report name
            </label>
            <input
              id="report-name"
              className="built-reports__input"
              type="text"
              value={form.name}
              onChange={(e) => setField('name', e.target.value)}
              placeholder="e.g. SNES sealed stock"
              required
            />
          </div>
          <div className="built-reports__field">
            <label className="built-reports__label" htmlFor="report-description">
              Description <span className="built-reports__optional">(optional)</span>
            </label>
            <textarea
              id="report-description"
              className="built-reports__textarea"
              rows={2}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="What this report is for…"
            />
          </div>
        </section>

        <section
          className="built-reports__panel"
          aria-labelledby="report-source-heading"
        >
          <h2 id="report-source-heading" className="built-reports__h2">
            Data source
          </h2>
          <div className="built-reports__source-grid">
            {REPORT_SOURCES.map((src) => (
              <label
                key={src.value}
                className={`built-reports__source-card${
                  form.source === src.value ? ' built-reports__source-card--active' : ''
                }`}
              >
                <input
                  type="radio"
                  name="report-source"
                  value={src.value}
                  checked={form.source === src.value}
                  onChange={() => handleSourceChange(src.value)}
                />
                <span className="built-reports__source-label">{src.label}</span>
                <span className="built-reports__source-desc">{src.description}</span>
              </label>
            ))}
          </div>
        </section>

        <section
          className="built-reports__panel"
          aria-labelledby="report-filters-heading"
        >
          <h2 id="report-filters-heading" className="built-reports__h2">
            Filters
          </h2>
          {form.source === 'inventory' && (
            <div className="built-reports__field-row">
              <div className="built-reports__field">
                <label className="built-reports__label" htmlFor="filter-platform">
                  Platform contains
                </label>
                <input
                  id="filter-platform"
                  className="built-reports__input"
                  type="text"
                  value={form.filters.platform}
                  onChange={(e) => setFilter('platform', e.target.value)}
                  placeholder="e.g. SNES"
                />
              </div>
              <div className="built-reports__field">
                <label className="built-reports__label" htmlFor="filter-condition">
                  Condition
                </label>
                <select
                  id="filter-condition"
                  className="built-reports__select"
                  value={form.filters.condition}
                  onChange={(e) => setFilter('condition', e.target.value)}
                >
                  {sourceConfig.conditions.map((c) => (
                    <option key={c.value || 'any'} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="built-reports__field built-reports__field--narrow">
                <label className="built-reports__label" htmlFor="filter-min-qty">
                  Min qty
                </label>
                <input
                  id="filter-min-qty"
                  className="built-reports__input"
                  type="number"
                  min={0}
                  value={form.filters.minQty}
                  onChange={(e) => setFilter('minQty', e.target.value)}
                />
              </div>
              <div className="built-reports__field built-reports__field--narrow">
                <label className="built-reports__label" htmlFor="filter-max-qty">
                  Max qty
                </label>
                <input
                  id="filter-max-qty"
                  className="built-reports__input"
                  type="number"
                  min={0}
                  value={form.filters.maxQty}
                  onChange={(e) => setFilter('maxQty', e.target.value)}
                />
              </div>
              <div className="built-reports__field built-reports__field--narrow">
                <label className="built-reports__label" htmlFor="filter-year-from">
                  Year from
                </label>
                <input
                  id="filter-year-from"
                  className="built-reports__input"
                  type="number"
                  min={1970}
                  max={2100}
                  value={form.filters.yearFrom}
                  onChange={(e) => setFilter('yearFrom', e.target.value)}
                />
              </div>
              <div className="built-reports__field built-reports__field--narrow">
                <label className="built-reports__label" htmlFor="filter-year-to">
                  Year to
                </label>
                <input
                  id="filter-year-to"
                  className="built-reports__input"
                  type="number"
                  min={1970}
                  max={2100}
                  value={form.filters.yearTo}
                  onChange={(e) => setFilter('yearTo', e.target.value)}
                />
              </div>
            </div>
          )}

          {form.source === 'jobs' && (
            <div className="built-reports__field-row">
              <div className="built-reports__field">
                <label className="built-reports__label" htmlFor="filter-job-status">
                  Status
                </label>
                <select
                  id="filter-job-status"
                  className="built-reports__select"
                  value={form.filters.status}
                  onChange={(e) => setFilter('status', e.target.value)}
                >
                  {sourceConfig.statuses.map((s) => (
                    <option key={s.value || 'any'} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="built-reports__field">
                <label className="built-reports__label" htmlFor="filter-job-console">
                  Console contains
                </label>
                <input
                  id="filter-job-console"
                  className="built-reports__input"
                  type="text"
                  value={form.filters.console}
                  onChange={(e) => setFilter('console', e.target.value)}
                  placeholder="e.g. Game Boy"
                />
              </div>
            </div>
          )}

          {form.source === 'todos' && (
            <div className="built-reports__field-row">
              <div className="built-reports__field">
                <label className="built-reports__label" htmlFor="filter-todo-completion">
                  Completion
                </label>
                <select
                  id="filter-todo-completion"
                  className="built-reports__select"
                  value={form.filters.completion}
                  onChange={(e) => setFilter('completion', e.target.value)}
                >
                  {sourceConfig.completion.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="built-reports__field">
                <label className="built-reports__label" htmlFor="filter-todo-tag">
                  Tag contains
                </label>
                <input
                  id="filter-todo-tag"
                  className="built-reports__input"
                  type="text"
                  value={form.filters.tag}
                  onChange={(e) => setFilter('tag', e.target.value)}
                  placeholder="e.g. inventory"
                />
              </div>
            </div>
          )}
        </section>

        <section
          className="built-reports__panel"
          aria-labelledby="report-output-heading"
        >
          <h2 id="report-output-heading" className="built-reports__h2">
            Output
          </h2>
          <div className="built-reports__field-row">
            <div className="built-reports__field">
              <label className="built-reports__label" htmlFor="report-sort-field">
                Sort by
              </label>
              <select
                id="report-sort-field"
                className="built-reports__select"
                value={form.sortField}
                onChange={(e) => setField('sortField', e.target.value)}
              >
                {sourceConfig.sortFields.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="built-reports__field">
              <label className="built-reports__label" htmlFor="report-sort-direction">
                Direction
              </label>
              <select
                id="report-sort-direction"
                className="built-reports__select"
                value={form.sortDirection}
                onChange={(e) => setField('sortDirection', e.target.value)}
              >
                {SORT_DIRECTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="built-reports__field">
              <label className="built-reports__label" htmlFor="report-group-by">
                Group by
              </label>
              <select
                id="report-group-by"
                className="built-reports__select"
                value={form.groupBy}
                onChange={(e) => setField('groupBy', e.target.value)}
              >
                {sourceConfig.groupBy.map((g) => (
                  <option key={g.value || 'none'} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <fieldset className="built-reports__columns">
            <legend className="built-reports__label">Columns</legend>
            <div className="built-reports__column-grid">
              {sourceConfig.columns.map((col) => (
                <label key={col.value} className="built-reports__check">
                  <input
                    type="checkbox"
                    checked={form.columns.includes(col.value)}
                    onChange={() =>
                      setField('columns', toggleColumn(form.columns, col.value))
                    }
                  />
                  <span>{col.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section
          className="built-reports__panel built-reports__panel--preview"
          aria-labelledby="report-preview-heading"
        >
          <h2 id="report-preview-heading" className="built-reports__h2">
            Summary
          </h2>
          <dl className="built-reports__summary">
            <div>
              <dt>Name</dt>
              <dd>{form.name.trim() || '—'}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>
                {REPORT_SOURCES.find((s) => s.value === form.source)?.label ?? '—'}
              </dd>
            </div>
            <div>
              <dt>Columns</dt>
              <dd>
                {form.columns.length === 0
                  ? 'None selected'
                  : form.columns
                      .map(
                        (v) =>
                          sourceConfig.columns.find((c) => c.value === v)?.label ?? v,
                      )
                      .join(', ')}
              </dd>
            </div>
            <div>
              <dt>Sort</dt>
              <dd>
                {sourceConfig.sortFields.find((f) => f.value === form.sortField)?.label ??
                  '—'}{' '}
                ({form.sortDirection === 'asc' ? 'ascending' : 'descending'})
              </dd>
            </div>
            {form.groupBy && (
              <div>
                <dt>Group by</dt>
                <dd>
                  {sourceConfig.groupBy.find((g) => g.value === form.groupBy)?.label ??
                    form.groupBy}
                </dd>
              </div>
            )}
          </dl>
        </section>

        <div className="built-reports__form-actions">
          <button type="submit" className="built-reports__btn built-reports__btn--primary">
            Save report
          </button>
          <Link to="/reports" className="built-reports__btn built-reports__btn--ghost">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
