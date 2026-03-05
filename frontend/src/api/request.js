const API_BASE = '/api';

export async function request(path, options = {}) {
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
