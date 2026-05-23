import { useEffect, useMemo, useState } from 'react'
import inventoryLight from '../assets/inventory_light.png'
import {
  createInventory,
  deleteInventory,
  fetchInventories,
  searchGames,
  updateInventory,
} from '../api/inventories.js'
import './InventoryManage.css'

/** Stable hue pair for placeholder “box art” until IGDB cover URLs exist */
function coverGradientStyle(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h + seed.charCodeAt(i) * (i + 1)) % 360
  }
  return {
    '--cover-a': `hsl(${h} 42% 32%)`,
    '--cover-b': `hsl(${(h + 48) % 360} 48% 22%)`,
  }
}

function GameCover({ game }) {
  const url = game.coverUrl
  if (url) {
    return (
      <div
        className="inventory-manage__cover"
        style={{ backgroundImage: `url(${url})` }}
        role="img"
        aria-label={`Cover: ${game.name}`}
      />
    )
  }
  const initial = game.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'
  return (
    <div
      className="inventory-manage__cover inventory-manage__cover--placeholder"
      style={coverGradientStyle(game.igdbId)}
      title="Cover art will load from IGDB"
      aria-hidden="true"
    >
      <span className="inventory-manage__cover-initial">{initial}</span>
    </div>
  )
}

const CONDITIONS = [
  { value: 'sealed', label: 'Sealed' },
  { value: 'cib', label: 'Complete in box' },
  { value: 'good', label: 'Good' },
  { value: 'acceptable', label: 'Acceptable' },
  { value: 'parts', label: 'Parts / repair' },
]

export default function InventoryManage() {
  const [query, setQuery] = useState('')
  const [inventory, setInventory] = useState([])
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState(null)
  const [shelfLoading, setShelfLoading] = useState(true)
  const [shelfError, setShelfError] = useState(null)
  const [shelfSortTitle, setShelfSortTitle] = useState('az')
  const [shelfPlatform, setShelfPlatform] = useState('')
  const [shelfYear, setShelfYear] = useState('')

  useEffect(() => {
    let cancelled = false

    fetchInventories()
      .then((rows) => {
        if (!cancelled) setInventory(rows)
      })
      .catch((err) => {
        if (!cancelled) setShelfError(err.message)
      })
      .finally(() => {
        if (!cancelled) setShelfLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (q.length < 2) {
      setSearchResults([])
      setSearchError(null)
      setSearchLoading(false)
      return undefined
    }

    let cancelled = false
    const timer = setTimeout(() => {
      setSearchLoading(true)
      setSearchError(null)
      searchGames(q)
        .then((games) => {
          if (!cancelled) setSearchResults(games)
        })
        .catch((err) => {
          if (!cancelled) {
            setSearchResults([])
            setSearchError(err.message)
          }
        })
        .finally(() => {
          if (!cancelled) setSearchLoading(false)
        })
    }, 350)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [query])

  async function addLine(game) {
    setShelfError(null)
    try {
      const created = await createInventory({
        igdbId: game.igdbId,
        name: game.name,
        platforms: game.platforms,
        releaseYear: game.releaseYear,
        qty: 1,
        condition: 'good',
        notes: '',
      })
      setInventory((prev) => [...prev, created])
    } catch (err) {
      setShelfError(err.message)
    }
  }

  async function removeLine(id) {
    setShelfError(null)
    const previous = inventory
    setInventory((prev) => prev.filter((row) => row.id !== id))
    try {
      await deleteInventory(id)
    } catch (err) {
      setShelfError(err.message)
      setInventory(previous)
    }
  }

  async function updateLine(id, patch) {
    const row = inventory.find((r) => r.id === id)
    if (!row) return

    const next = { ...row, ...patch }
    setShelfError(null)
    setInventory((prev) =>
      prev.map((r) => (r.id === id ? next : r)),
    )

    try {
      const saved = await updateInventory(id, next)
      setInventory((prev) =>
        prev.map((r) => (r.id === id ? saved : r)),
      )
    } catch (err) {
      setShelfError(err.message)
      setInventory((prev) =>
        prev.map((r) => (r.id === id ? row : r)),
      )
    }
  }

  const shelfPlatformOptions = useMemo(() => {
    const platformSet = new Set()
    for (const row of inventory) {
      row.platforms.forEach((p) => platformSet.add(p))
    }
    return [...platformSet].sort((a, b) =>
      a.localeCompare(b, undefined, { sensitivity: 'base' }),
    )
  }, [inventory])

  const shelfYearOptions = useMemo(() => {
    const yearSet = new Set(inventory.map((row) => row.releaseYear))
    return [...yearSet].sort((a, b) => b - a)
  }, [inventory])

  /** Ignore stale platform/year if those values disappear from the shelf */
  const shelfPlatformFilter = useMemo(() => {
    if (!shelfPlatform) return ''
    return shelfPlatformOptions.includes(shelfPlatform) ? shelfPlatform : ''
  }, [shelfPlatform, shelfPlatformOptions])

  const shelfYearFilter = useMemo(() => {
    if (!shelfYear) return ''
    const n = Number.parseInt(shelfYear, 10)
    if (!Number.isFinite(n) || !shelfYearOptions.includes(n)) return ''
    return shelfYear
  }, [shelfYear, shelfYearOptions])

  const shelfRows = useMemo(() => {
    let rows = [...inventory]
    if (shelfPlatformFilter) {
      rows = rows.filter((r) => r.platforms.includes(shelfPlatformFilter))
    }
    if (shelfYearFilter) {
      const y = Number.parseInt(shelfYearFilter, 10)
      rows = rows.filter((r) => r.releaseYear === y)
    }
    rows.sort((a, b) => {
      const cmp = a.name.localeCompare(b.name, undefined, {
        sensitivity: 'base',
      })
      return shelfSortTitle === 'az' ? cmp : -cmp
    })
    return rows
  }, [inventory, shelfPlatformFilter, shelfYearFilter, shelfSortTitle])

  const shelfFiltersNarrow =
    Boolean(shelfPlatformFilter) || Boolean(shelfYearFilter)

  const trimmed = query.trim()

  return (
    <div className="inventory-manage">
      <header className="inventory-manage__header">
        <h1>Inventory <img src={inventoryLight} alt="Inventory" className="inventory-manage-icon" width={25} height={25} /></h1>
        <p className="inventory-manage__lede">
          Search IGDB-backed titles, pick a match, then track quantity, condition,
          and notes on your shelf. Shelf lines are saved in the database.
        </p>
      </header>

      {shelfError && (
        <p className="inventory-manage__error" role="alert">
          {shelfError}
        </p>
      )}

      <section
        className="inventory-manage__panel inventory-manage__panel--search"
        aria-labelledby="inventory-search-heading"
      >
        <h2 id="inventory-search-heading" className="inventory-manage__h2">
          Game search
        </h2>
        <label className="inventory-manage__label" htmlFor="inventory-game-search">
          Title, platform, year, or keywords
        </label>
        <div className="inventory-manage__search-wrap">
          <svg
            className="inventory-manage__search-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            id="inventory-game-search"
            className="inventory-manage__search"
            type="search"
            autoComplete="off"
            placeholder='Try "Zelda", "Genesis", "1997"'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </section>

      <section
        className="inventory-manage__panel"
        aria-labelledby="inventory-results-heading"
      >
        <h2 id="inventory-results-heading" className="inventory-manage__h2">
          Results
        </h2>
        {searchError && (
          <p className="inventory-manage__error" role="alert">
            {searchError}
          </p>
        )}
        {!trimmed && (
          <p className="inventory-manage__muted">
            Type at least two characters to search IGDB via the backend.
          </p>
        )}
        {trimmed && trimmed.length < 2 && (
          <p className="inventory-manage__muted">Keep typing to search…</p>
        )}
        {trimmed.length >= 2 && searchLoading && (
          <p className="inventory-manage__muted">Searching…</p>
        )}
        {trimmed.length >= 2 && !searchLoading && searchResults.length === 0 && !searchError && (
          <p className="inventory-manage__empty">
            No matching games. Try another spelling or broader keywords.
          </p>
        )}
        {searchResults.length > 0 && (
          <>
            <p className="inventory-manage__results-meta" aria-live="polite">
              {searchResults.length} result{searchResults.length === 1 ? '' : 's'} for &quot;
              {trimmed}&quot;
            </p>
            <ul className="inventory-manage__result-grid">
              {searchResults.map((game) => (
                  <li key={game.igdbId} className="inventory-manage__card">
                    <GameCover game={game} />
                    <div className="inventory-manage__card-body">
                      <h3 className="inventory-manage__title">{game.name}</h3>
                      <span className="inventory-manage__igdb-pill">
                        IGDB {game.igdbId}
                      </span>
                      <p className="inventory-manage__meta">
                        {game.platforms.join(' · ')} · {game.releaseYear}
                      </p>
                      <p className="inventory-manage__summary">{game.summary}</p>
                      <button
                        type="button"
                        className="inventory-manage__btn inventory-manage__btn--primary"
                        onClick={() => addLine(game)}
                      >
                        Add to shelf
                      </button>
                    </div>
                  </li>
                ))}
            </ul>
          </>
        )}
      </section>

      <section
        className="inventory-manage__panel inventory-manage__panel--shelf"
        aria-labelledby="inventory-shelf-heading"
      >
        <h2 id="inventory-shelf-heading" className="inventory-manage__h2">
          On the shelf
        </h2>
        {shelfLoading ? (
          <p className="inventory-manage__muted">Loading shelf…</p>
        ) : inventory.length === 0 ? (
          <p className="inventory-manage__muted">
            Nothing added yet. Use &quot;Add to shelf&quot; from the results.
          </p>
        ) : (
          <>
            <div
              className="inventory-manage__shelf-filters"
              role="group"
              aria-label="Filter and sort shelf items"
            >
              <div className="inventory-manage__shelf-filter-field">
                <label
                  className="inventory-manage__shelf-filter-label"
                  htmlFor="shelf-sort-title"
                >
                  Title
                </label>
                <select
                  id="shelf-sort-title"
                  className="inventory-manage__select inventory-manage__select--shelf-filter"
                  value={shelfSortTitle}
                  onChange={(e) => setShelfSortTitle(e.target.value)}
                >
                  <option value="az">A–Z</option>
                  <option value="za">Z–A</option>
                </select>
              </div>
              <div className="inventory-manage__shelf-filter-field">
                <label
                  className="inventory-manage__shelf-filter-label"
                  htmlFor="shelf-filter-platform"
                >
                  Platform
                </label>
                <select
                  id="shelf-filter-platform"
                  className="inventory-manage__select inventory-manage__select--shelf-filter"
                  value={shelfPlatformFilter}
                  onChange={(e) => setShelfPlatform(e.target.value)}
                >
                  <option value="">All platforms</option>
                  {shelfPlatformOptions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inventory-manage__shelf-filter-field">
                <label
                  className="inventory-manage__shelf-filter-label"
                  htmlFor="shelf-filter-year"
                >
                  Year
                </label>
                <select
                  id="shelf-filter-year"
                  className="inventory-manage__select inventory-manage__select--shelf-filter"
                  value={shelfYearFilter}
                  onChange={(e) => setShelfYear(e.target.value)}
                >
                  <option value="">All years</option>
                  {shelfYearOptions.map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {shelfFiltersNarrow && (
              <p className="inventory-manage__results-meta" aria-live="polite">
                Showing {shelfRows.length} of {inventory.length} on the shelf
              </p>
            )}
            {shelfRows.length === 0 ? (
              <p className="inventory-manage__empty">
                No lines match your shelf filters. Try clearing platform or year.
              </p>
            ) : (
              <div className="inventory-manage__table-wrap">
                <table className="inventory-manage__table">
                  <thead>
                    <tr>
                      <th scope="col">Title</th>
                      <th scope="col">Platform</th>
                      <th scope="col">Year</th>
                      <th scope="col">Qty</th>
                      <th scope="col">Condition</th>
                      <th scope="col">Notes</th>
                      <th scope="col">
                        <span className="inventory-manage__sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {shelfRows.map((row) => (
                      <tr key={row.id}>
                        <td>{row.name}</td>
                        <td>{row.platforms.join(', ')}</td>
                        <td>{row.releaseYear}</td>
                        <td>
                          <input
                            className="inventory-manage__qty"
                            type="number"
                            min={1}
                            max={999}
                            value={row.qty}
                            onChange={(e) => {
                              const n = Number.parseInt(e.target.value, 10)
                              if (!Number.isFinite(n) || n < 1) return
                              updateLine(row.id, { qty: n })
                            }}
                            aria-label={`Quantity for ${row.name}`}
                          />
                        </td>
                        <td>
                          <select
                            className="inventory-manage__select"
                            value={row.condition}
                            onChange={(e) =>
                              updateLine(row.id, { condition: e.target.value })
                            }
                            aria-label={`Condition for ${row.name}`}
                          >
                            {CONDITIONS.map((c) => (
                              <option key={c.value} value={c.value}>
                                {c.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            className="inventory-manage__notes"
                            type="text"
                            value={row.notes}
                            placeholder="SKU, variant…"
                            onChange={(e) =>
                              updateLine(row.id, { notes: e.target.value })
                            }
                            aria-label={`Notes for ${row.name}`}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="inventory-manage__btn inventory-manage__btn--danger"
                            onClick={() => removeLine(row.id)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}
