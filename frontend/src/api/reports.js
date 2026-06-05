import { request } from './request.js';

function reportFromApi(row) {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    source: row.source,
    sortField: row.sort_field,
    sortDirection: row.sort_direction,
    groupBy: row.group_by ?? '',
    columns: row.columns ?? [],
    filters: row.filters ?? {},
    custom: row.custom ?? true,
    insertedAt: row.inserted_at,
    updatedAt: row.updated_at,
  };
}

function reportToApi(report) {
  return {
    title: report.title,
    description: report.description ?? '',
    source: report.source,
    sort_field: report.sortField,
    sort_direction: report.sortDirection,
    group_by: report.groupBy ?? '',
    columns: report.columns ?? [],
    filters: report.filters ?? {},
  };
}

export async function fetchReports() {
  const data = await request('/reports');
  return data.data.map(reportFromApi);
}

export async function fetchReport(idOrSlug) {
  const data = await request(`/reports/${idOrSlug}`);
  return reportFromApi(data.data);
}

export async function createReport(report) {
  const data = await request('/reports', {
    method: 'POST',
    body: JSON.stringify({ report: reportToApi(report) }),
  });
  return reportFromApi(data.data);
}

export async function updateReport(idOrSlug, report) {
  const data = await request(`/reports/${idOrSlug}`, {
    method: 'PUT',
    body: JSON.stringify({ report: reportToApi(report) }),
  });
  return reportFromApi(data.data);
}

export async function deleteReport(idOrSlug) {
  await request(`/reports/${idOrSlug}`, { method: 'DELETE' });
}

export async function runReport(idOrSlug) {
  const data = await request(`/reports/${idOrSlug}/run`);
  return data.data;
}
