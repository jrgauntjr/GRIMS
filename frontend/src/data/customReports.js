const STORAGE_KEY = 'grims.customReports'

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeAll(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports))
}

function slugify(name) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function listCustomReports() {
  return readAll()
}

export function getCustomReport(slug) {
  return readAll().find((r) => r.slug === slug)
}

export function saveCustomReport(definition) {
  const reports = readAll()
  const base = slugify(definition.name) || 'report'
  let slug = base
  let n = 2
  while (reports.some((r) => r.slug === slug)) {
    slug = `${base}-${n}`
    n += 1
  }

  const report = {
    ...definition,
    slug,
    custom: true,
    createdAt: new Date().toISOString(),
  }

  writeAll([report, ...reports])
  return report
}
