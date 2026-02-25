const API_BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.errors?.detail || err.errors || res.statusText);
  }
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchTodos() {
  const data = await request('/todos');
  return data.data;
}

export async function createTodo(todo) {
  const data = await request('/todos', {
    method: 'POST',
    body: JSON.stringify({ todo: { title: todo.title, completed: todo.completed ?? false } }),
  });
  return data.data;
}

export async function updateTodo(id, todo) {
  const data = await request(`/todos/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ todo }),
  });
  return data.data;
}

export async function deleteTodo(id) {
  await request(`/todos/${id}`, { method: 'DELETE' });
}
