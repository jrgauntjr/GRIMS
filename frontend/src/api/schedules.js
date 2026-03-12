import { request } from './request.js';

export async function fetchSchedules() {
  const data = await request('/schedules');
  return data.data;
}

export async function createSchedule(schedule) {
  const data = await request('/schedules', {
    method: 'POST',
    body: JSON.stringify({
      schedule: {
        customer_name: schedule.customer_name,
        customer_number: schedule.customer_number,
        console: schedule.console,
        status: schedule.status ?? 'open',
        description: schedule.description,
      },
    }),
  });
  return data.data;
}

export async function updateSchedule(id, schedule) {
  const data = await request(`/schedules/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      schedule,
    }),
  });
  return data.data;
}

export async function deleteSchedule(id) {
  await request(`/schedules/${id}`, { method: 'DELETE' });
}