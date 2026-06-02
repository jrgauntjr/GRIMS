/** Built-in report definitions — wire up to backend report runners later */
export const BUILT_IN_REPORTS = [
  {
    slug: 'inventory-by-platform',
    title: 'Inventory by platform',
    description: 'Counts and quantities grouped by console or platform.',
  },
  {
    slug: 'inventory-by-condition',
    title: 'Inventory by condition',
    description: 'Shelf lines broken down by sealed, CIB, loose, and repair stock.',
  },
  {
    slug: 'low-stock',
    title: 'Low stock',
    description: 'Titles at or below a minimum quantity threshold.',
  },
  {
    slug: 'open-jobs',
    title: 'Open repair jobs',
    description: 'Active tickets still in the shop queue.',
  },
  {
    slug: 'jobs-by-status',
    title: 'Jobs by status',
    description: 'Open, in progress, done, and cancelled counts.',
  },
  {
    slug: 'shelf-summary',
    title: 'Shelf summary',
    description: 'High-level totals across your on-hand inventory.',
  },
]

export function getBuiltInReport(slug) {
  return BUILT_IN_REPORTS.find((r) => r.slug === slug)
}
