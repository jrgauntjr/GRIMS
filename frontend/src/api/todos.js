import { request } from './request.js';

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
