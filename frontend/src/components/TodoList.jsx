import { useState, useEffect, useMemo } from 'react'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todos'
import todoLight from '../assets/todo_light.png'
import './TodoList.css'

function parseTagsInput(value) {
  return value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function todoMatchesFilters(todo, filterTag, filterDateFrom, filterDateTo, filterStatus) {
  if (filterStatus === 'active' && todo.completed) return false
  if (filterStatus === 'completed' && !todo.completed) return false

  const tags = Array.isArray(todo.tags) ? todo.tags : []
  if (filterTag && !tags.includes(filterTag)) return false

  const t = new Date(todo.inserted_at).getTime()
  if (filterDateFrom) {
    const from = new Date(`${filterDateFrom}T00:00:00`).getTime()
    if (Number.isFinite(from) && t < from) return false
  }
  if (filterDateTo) {
    const to = new Date(`${filterDateTo}T23:59:59.999`).getTime()
    if (Number.isFinite(to) && t > to) return false
  }
  return true
}

export default function TodoList({ readOnly = false }) {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')
  const [newTags, setNewTags] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filterTag, setFilterTag] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchTodos()
      setTodos(data || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    setNewTitle('')
    setNewTags('')
    try {
      const tags = parseTagsInput(newTags)
      const created = await createTodo({ title, tags })
      setTodos((prev) => [created, ...prev])
    } catch (e) {
      setError(e.message)
    }
  }

  const handleToggle = async (todo) => {
    try {
      const updated = await updateTodo(todo.id, {
        ...todo,
        tags: todo.tags ?? [],
        completed: !todo.completed,
      })
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)))
    } catch (e) {
      setError(e.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await deleteTodo(id)
      setTodos((prev) => prev.filter((t) => t.id !== id))
    } catch (e) {
      setError(e.message)
    }
  }

  const uniqueTags = useMemo(() => {
    const set = new Set()
    for (const todo of todos) {
      const tags = Array.isArray(todo.tags) ? todo.tags : []
      for (const tag of tags) set.add(tag)
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [todos])

  const filteredTodos = useMemo(() => {
    return todos.filter((todo) =>
      todoMatchesFilters(todo, filterTag, filterDateFrom, filterDateTo, filterStatus),
    )
  }, [todos, filterTag, filterDateFrom, filterDateTo, filterStatus])

  const clearFilters = () => {
    setFilterTag('')
    setFilterDateFrom('')
    setFilterDateTo('')
    setFilterStatus('all')
  }

  const filtersActive =
    filterTag !== '' || filterDateFrom !== '' || filterDateTo !== '' || filterStatus !== 'all'

  if (loading) return <div className="todo-list todo-loading">Loading…</div>
  return (
    <div className={`todo-list${readOnly ? ' todo-list-readonly' : ''}`}>
      <h1>
        To-do <img src={todoLight} alt="To-do" className="todo-list-icon" width={25} height={25} />
      </h1>
      {error && (
        <div className="todo-error" role="alert">
          {error}
        </div>
      )}
      {!readOnly && (
        <form onSubmit={handleAdd} className="todo-form">
          <div className="todo-form-main">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="todo-input"
              aria-label="New todo title"
            />
            <button type="submit" className="todo-submit">
              Add
            </button>
            <button
              type="button"
              className={`todo-filter-toggle${filtersActive ? ' todo-filter-toggle--active' : ''}`}
              onClick={() => setFiltersOpen((o) => !o)}
              aria-expanded={filtersOpen}
            >
              Filters
              {filtersActive ? ' · on' : ''}
            </button>
            {todos.length > 0 && (
              <p className="todo-filter-summary" aria-live="polite">
                {filteredTodos.length === todos.length
                  ? `${todos.length} task${todos.length === 1 ? '' : 's'}`
                  : `Showing ${filteredTodos.length} of ${todos.length} tasks`}
              </p>
            )}
          </div>
          <input
            type="text"
            value={newTags}
            onChange={(e) => setNewTags(e.target.value)}
            placeholder="Tags (comma-separated, e.g. urgent, shop)"
            className="todo-input todo-input-tags"
            aria-label="Tags for this task"
          />
        </form>
      )}
      {readOnly && (
        <div className="todo-filter-bar">
          <button
            type="button"
            className={`todo-filter-toggle${filtersActive ? ' todo-filter-toggle--active' : ''}`}
            onClick={() => setFiltersOpen((o) => !o)}
            aria-expanded={filtersOpen}
          >
            Filters
            {filtersActive ? ' · on' : ''}
          </button>
          {todos.length > 0 && (
            <p className="todo-filter-summary" aria-live="polite">
              {filteredTodos.length === todos.length
                ? `${todos.length} task${todos.length === 1 ? '' : 's'}`
                : `Showing ${filteredTodos.length} of ${todos.length} tasks`}
            </p>
          )}
        </div>
      )}
      {filtersOpen && (
        <div className="todo-filters" role="region" aria-label="Filter todos">
          <div className="todo-filter-row">
            <label className="todo-filter-field">
              Tag
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                aria-label="Filter by tag"
              >
                <option value="">All tags</option>
                {uniqueTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
            <label className="todo-filter-field">
              Status
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                aria-label="Filter by status"
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </label>
          </div>
          <div className="todo-filter-row">
            <label className="todo-filter-field">
              Created from
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                aria-label="Created on or after"
              />
            </label>
            <label className="todo-filter-field">
              Created to
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                aria-label="Created on or before"
              />
            </label>
          </div>
          {filtersActive && (
            <button type="button" className="todo-filter-clear" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>
      )}
      <ul className="todo-items">
        {todos.length === 0 ? (
          <li className="todo-empty">No items yet. Add one above.</li>
        ) : filteredTodos.length === 0 ? (
          <li className="todo-empty">No items match your filters.</li>
        ) : (
          filteredTodos.map((todo) => {
            const tags = Array.isArray(todo.tags) ? todo.tags : []
            return (
              <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={readOnly ? undefined : () => handleToggle(todo)}
                  aria-label={todo.title}
                  disabled={readOnly}
                />
                <div className="todo-item-main">
                  <span className="todo-title">{todo.title}</span>
                  {tags.length > 0 && (
                    <div className="todo-tags" aria-label="Tags">
                      {tags.map((tag, i) => (
                        <span key={`${todo.id}-${i}-${tag}`} className="todo-tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleDelete(todo.id)}
                    className="todo-delete"
                    aria-label={`Delete ${todo.title}`}
                  >
                    ×
                  </button>
                )}
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
