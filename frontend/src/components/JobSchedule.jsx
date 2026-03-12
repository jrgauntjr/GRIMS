import { useState, useEffect } from 'react'
import { fetchSchedules, createSchedule, updateSchedule, deleteSchedule } from '../api/schedules'
import './JobSchedule.css'

export default function JobSchedule({ readOnly = false }) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newSchedule, setNewSchedule] = useState({
    customer_name: '',
    customer_number: '',
    console: '',
    status: 'open',
    description: '',
  })

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchSchedules()
      setSchedules(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleFieldChange = (e) => {
    const { name, value } = e.target
    setNewSchedule((prev) => ({ ...prev, [name]: value }))
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    if (readOnly) return

    const trimmed = {
      customer_name: newSchedule.customer_name.trim(),
      customer_number: newSchedule.customer_number.trim(),
      console: newSchedule.console.trim(),
      status: newSchedule.status.trim() || 'open',
      description: newSchedule.description.trim(),
    }

    if (!trimmed.customer_name || !trimmed.customer_number || !trimmed.console || !trimmed.description) {
      return
    }

    try {
      const created = await createSchedule(trimmed)
      setSchedules((prev) => [created, ...prev])
      setNewSchedule({
        customer_name: '',
        customer_number: '',
        console: '',
        status: 'open',
        description: '',
      })
    } catch (e) {
      setError(e.message)
    }
  }

  const handleStatusChange = async (schedule, nextStatus) => {
    if (readOnly) return
    try {
      const updated = await updateSchedule(schedule.id, { ...schedule, status: nextStatus })
      setSchedules((prev) => prev.map((s) => (s.id === schedule.id ? updated : s)))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    if (readOnly) return
    try {
      await deleteSchedule(id)
      setSchedules((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) return <div className="job-schedule job-schedule-loading">Loading…</div>

  return (
    <div className="job-schedule">
      <h1>Jobs</h1>
      {error && (
        <div className="job-schedule-error" role="alert">
          {error}
        </div>
      )}

      {!readOnly && (
        <form className="job-schedule-form" onSubmit={handleAdd}>
          <input
            type="text"
            name="customer_name"
            value={newSchedule.customer_name}
            onChange={handleFieldChange}
            placeholder="Customer name"
          />
          <input
            type="text"
            name="customer_number"
            value={newSchedule.customer_number}
            onChange={handleFieldChange}
            placeholder="Customer number"
          />
          <input
            type="text"
            name="console"
            value={newSchedule.console}
            onChange={handleFieldChange}
            placeholder="Console (e.g. SNES, PS2)"
          />
          <select name="status" value={newSchedule.status} onChange={handleFieldChange}>
            <option value="open">Open</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            name="description"
            value={newSchedule.description}
            onChange={handleFieldChange}
            placeholder="Problem description"
          />
          <button type="submit">Add ticket</button>
        </form>
      )}

      <ul className="job-schedule-items">
        {schedules.length === 0 ? (
          <li className="job-schedule-empty">No tickets yet.</li>
        ) : readOnly ? (
          schedules.map((schedule) => (
            <li key={schedule.id} className={`job-schedule-item status-${schedule.status}`}>
              <span className="job-schedule-customer">{schedule.customer_name}</span>
              <span className="job-schedule-console">{schedule.console}</span>
              <span className="job-schedule-status-label">{schedule.status}</span>
            </li>
          ))
        ) : (
          schedules.map((schedule) => (
            <li key={schedule.id} className={`job-schedule-item status-${schedule.status}`}>
              <div className="job-schedule-main">
                <div className="job-schedule-header">
                  <span className="job-schedule-customer">
                    {schedule.customer_name} ({schedule.customer_number})
                  </span>
                  <span className="job-schedule-console">{schedule.console}</span>
                </div>
                <div className="job-schedule-description">{schedule.description}</div>
              </div>
              <div className="job-schedule-meta">
                <div className="job-schedule-status">
                  <select
                    value={schedule.status}
                    onChange={(e) => handleStatusChange(schedule, e.target.value)}
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="job-schedule-delete"
                  onClick={() => handleDelete(schedule.id)}
                  aria-label={`Delete ticket for ${schedule.customer_name}`}
                >
                  ×
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}