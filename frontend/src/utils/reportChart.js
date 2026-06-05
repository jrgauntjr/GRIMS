const VALUE_COLUMN_PRIORITY = ['count', 'qty', 'lines', 'value']

function parseNumeric(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function formatChartLabel(value) {
  if (value == null || value === '') return 'Unknown'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

function pickValueColumn(columns, rows) {
  for (const key of VALUE_COLUMN_PRIORITY) {
    const col = columns.find((c) => c.key === key)
    if (col && rows.some((row) => parseNumeric(row[key]) != null)) {
      return col
    }
  }

  return columns.find((col) =>
    rows.some((row) => parseNumeric(row[col.key]) != null),
  )
}

function countByFirstColumn(columns, rows) {
  const labelCol = columns[0]
  if (!labelCol) return null

  const counts = new Map()

  for (const row of rows) {
    const label = formatChartLabel(row[labelCol.key])
    counts.set(label, (counts.get(label) ?? 0) + 1)
  }

  const bars = [...counts.entries()].map(([label, value], index) => ({
    key: `count-${index}`,
    label,
    value,
  }))

  return {
    labelKey: labelCol.key,
    valueKey: 'count',
    valueLabel: 'Count',
    bars,
  }
}

function buildBars(rows, labelKey, valueKey) {
  return rows.map((row, index) => ({
    key: row.id ?? `bar-${index}`,
    label: formatChartLabel(row[labelKey]),
    value: parseNumeric(row[valueKey]) ?? 0,
  }))
}

export function buildChartData(result) {
  const { columns = [], rows = [], mode } = result
  if (!rows.length || !columns.length) return null

  const colByKey = Object.fromEntries(columns.map((col) => [col.key, col]))

  if (mode === 'metrics') {
    const valueCol = colByKey.value ?? columns[1]
    const labelCol = colByKey.metric ?? columns[0]

    if (!valueCol || !labelCol) return null

    return {
      labelKey: labelCol.key,
      valueKey: valueCol.key,
      valueLabel: valueCol.label,
      bars: buildBars(rows, labelCol.key, valueCol.key),
    }
  }

  if (mode === 'aggregate') {
    const labelCol = columns[0]
    const valueCol = pickValueColumn(columns, rows)

    if (!labelCol) return null
    if (!valueCol) return countByFirstColumn(columns, rows)

    return {
      labelKey: labelCol.key,
      valueKey: valueCol.key,
      valueLabel: valueCol.label,
      bars: buildBars(rows, labelCol.key, valueCol.key),
    }
  }

  const valueCol = pickValueColumn(columns, rows)

  if (valueCol) {
    const labelCol =
      columns.find((col) => col.key !== valueCol.key) ?? columns[0]

    return {
      labelKey: labelCol.key,
      valueKey: valueCol.key,
      valueLabel: valueCol.label,
      bars: buildBars(rows, labelCol.key, valueCol.key),
    }
  }

  return countByFirstColumn(columns, rows)
}
