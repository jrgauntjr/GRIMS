import { request } from './request.js';

export async function fetchDesktopMode() {
  const data = await request('/desktop');
  return data.data.desktop === true;
}

export async function shutdownDesktop() {
  await request('/desktop/shutdown', { method: 'POST' });
}
