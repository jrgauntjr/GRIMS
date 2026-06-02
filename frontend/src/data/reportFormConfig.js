export const REPORT_SOURCES = [
  {
    value: 'inventory',
    label: 'Inventory',
    description: 'Shelf lines — games, qty, condition, and notes.',
  },
  {
    value: 'jobs',
    label: 'Repair jobs',
    description: 'Customer tickets and shop queue status.',
  },
  {
    value: 'todos',
    label: 'To-do list',
    description: 'Staff tasks, completion, and tags.',
  },
]

export const SORT_DIRECTIONS = [
  { value: 'asc', label: 'Ascending (A–Z / oldest first)' },
  { value: 'desc', label: 'Descending (Z–A / newest first)' },
]

const SOURCE_CONFIG = {
  inventory: {
    sortFields: [
      { value: 'name', label: 'Title' },
      { value: 'release_year', label: 'Release year' },
      { value: 'qty', label: 'Quantity' },
      { value: 'condition', label: 'Condition' },
    ],
    groupBy: [
      { value: '', label: 'None (row list)' },
      { value: 'platform', label: 'Platform' },
      { value: 'condition', label: 'Condition' },
      { value: 'release_year', label: 'Release year' },
    ],
    columns: [
      { value: 'name', label: 'Title', default: true },
      { value: 'platforms', label: 'Platform', default: true },
      { value: 'release_year', label: 'Year', default: true },
      { value: 'qty', label: 'Qty', default: true },
      { value: 'condition', label: 'Condition', default: true },
      { value: 'notes', label: 'Notes', default: false },
    ],
    conditions: [
      { value: '', label: 'Any condition' },
      { value: 'sealed', label: 'Sealed' },
      { value: 'cib', label: 'Complete in box' },
      { value: 'good', label: 'Good' },
      { value: 'acceptable', label: 'Acceptable' },
      { value: 'parts', label: 'Parts / repair' },
    ],
  },
  jobs: {
    sortFields: [
      { value: 'inserted_at', label: 'Date opened' },
      { value: 'customer_name', label: 'Customer name' },
      { value: 'status', label: 'Status' },
      { value: 'console', label: 'Console' },
    ],
    groupBy: [
      { value: '', label: 'None (row list)' },
      { value: 'status', label: 'Status' },
      { value: 'console', label: 'Console' },
    ],
    columns: [
      { value: 'customer_name', label: 'Customer', default: true },
      { value: 'customer_number', label: 'Phone', default: true },
      { value: 'console', label: 'Console', default: true },
      { value: 'status', label: 'Status', default: true },
      { value: 'description', label: 'Description', default: true },
      { value: 'inserted_at', label: 'Opened', default: false },
    ],
    statuses: [
      { value: '', label: 'Any status' },
      { value: 'open', label: 'Open' },
      { value: 'in_progress', label: 'In progress' },
      { value: 'done', label: 'Done' },
      { value: 'cancelled', label: 'Cancelled' },
    ],
  },
  todos: {
    sortFields: [
      { value: 'inserted_at', label: 'Date added' },
      { value: 'title', label: 'Title' },
      { value: 'completed', label: 'Completed' },
    ],
    groupBy: [
      { value: '', label: 'None (row list)' },
      { value: 'completed', label: 'Completed' },
    ],
    columns: [
      { value: 'title', label: 'Title', default: true },
      { value: 'completed', label: 'Completed', default: true },
      { value: 'tags', label: 'Tags', default: true },
      { value: 'inserted_at', label: 'Added', default: false },
    ],
    completion: [
      { value: 'all', label: 'All tasks' },
      { value: 'open', label: 'Incomplete only' },
      { value: 'done', label: 'Completed only' },
    ],
  },
}

export function getSourceConfig(source) {
  return SOURCE_CONFIG[source] ?? SOURCE_CONFIG.inventory
}

export function defaultColumnsForSource(source) {
  return getSourceConfig(source)
    .columns.filter((c) => c.default)
    .map((c) => c.value)
}

export function defaultFormState(source = 'inventory') {
  const config = getSourceConfig(source)
  return {
    name: '',
    description: '',
    source,
    sortField: config.sortFields[0]?.value ?? '',
    sortDirection: 'asc',
    groupBy: '',
    columns: defaultColumnsForSource(source),
    filters: defaultFiltersForSource(source),
  }
}

function defaultFiltersForSource(source) {
  switch (source) {
    case 'jobs':
      return { status: '', console: '' }
    case 'todos':
      return { completion: 'all', tag: '' }
    default:
      return {
        platform: '',
        condition: '',
        minQty: '',
        maxQty: '',
        yearFrom: '',
        yearTo: '',
      }
  }
}

export function filtersForSource(source) {
  return defaultFiltersForSource(source)
}
