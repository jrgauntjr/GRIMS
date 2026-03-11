import { request } from './request.js';

export async function fetchSchedules() {
    const data = await request('/schedules')
    return data.data;
}

export async function createSchedule(schedule){
    return
}

export async function updateSchedule(id, schedule){
    return
}

export async function deleteSchedule(id){
    await request(`/schedules/${id}`, { method: 'DELETE' });
}

// TODO: add when backend schedule API exists
// export async function fetchSchedules() { ... }
// export async function createSchedule(schedule) { ... }
// export async function updateSchedule(id, schedule) { ... }
// export async function deleteSchedule(id) { ... }