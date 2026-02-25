import { useState, useEffect } from 'react'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '../api/todos'
import './TodoList.css'

export default function TodoList() {
  const [todos, setTodos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [newTitle, setNewTitle] = useState('')

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
    try {
      const created = await createTodo({ title })
      setTodos((prev) => [created, ...prev])
    } catch (e) {
      setError(e.message)
    }
  }

  const handleToggle = async (todo) => {
    try {
      const updated = await updateTodo(todo.id, { ...todo, completed: !todo.completed })
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

  if (loading) return <div className="todo-list todo-loading">Loading…</div>
  return (
    <div className="todo-list">
      <h1>To-do</h1>
      {error && (
        <div className="todo-error" role="alert">
          {error}
        </div>
      )}
      <form onSubmit={handleAdd} className="todo-form">
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
      </form>
      <ul className="todo-items">
        {todos.length === 0 ? (
          <li className="todo-empty">No items yet. Add one above.</li>
        ) : (
          todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => handleToggle(todo)}
                aria-label={todo.title}
              />
              <span className="todo-title">{todo.title}</span>
              <button
                type="button"
                onClick={() => handleDelete(todo.id)}
                className="todo-delete"
                aria-label={`Delete ${todo.title}`}
              >
                ×
              </button>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
