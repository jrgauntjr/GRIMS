import { useMemo, useState } from 'react'
import inventoryLight from '../assets/inventory_light.png'
import './InventoryManage.css'

/** Sample rows shaped like future IGDB normalize step — replace with API later */
const MOCK_CATALOG = [
  {
    igdbId: 'mock-101',
    name: 'The Legend of Zelda: A Link to the Past',
    platforms: ['SNES'],
    releaseYear: 1991,
    summary: 'Top-down action-adventure; cornerstone of 16-bit era.',
  },
  {
    igdbId: 'mock-102',
    name: 'Super Mario World',
    platforms: ['SNES'],
    releaseYear: 1990,
    summary: 'Pack-in platformer that defined the Super Nintendo launch.',
  },
  {
    igdbId: 'mock-103',
    name: 'Final Fantasy VII',
    platforms: ['PlayStation'],
    releaseYear: 1997,
    summary: 'JRPG blockbuster that widened the genre globally.',
  },
  {
    igdbId: 'mock-104',
    name: 'Metal Gear Solid',
    platforms: ['PlayStation'],
    releaseYear: 1998,
    summary: 'Cinematic stealth action from Kojima Productions.',
  },
  {
    igdbId: 'mock-105',
    name: 'Sonic the Hedgehog 2',
    platforms: ['Genesis'],
    releaseYear: 1992,
    summary: 'Speed-focused platformer with co-op Tails.',
  },
  {
    igdbId: 'mock-106',
    name: 'Castlevania: Symphony of the Night',
    platforms: ['PlayStation'],
    releaseYear: 1997,
    summary: 'Metroidvania landmark with RPG-lite progression.',
  },
  {
    igdbId: 'mock-107',
    name: 'Pokémon Red / Blue',
    platforms: ['Game Boy'],
    releaseYear: 1998,
    summary: 'Collect-and-battle RPG that launched a franchise.',
  },
  {
    igdbId: 'mock-108',
    name: 'Street Fighter II Turbo',
    platforms: ['SNES'],
    releaseYear: 1993,
    summary: 'Competitive fighting staple with faster pacing.',
  },
]

function normalize(s) {
  return s.trim().toLowerCase()
}

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
  const [shelfSortTitle, setShelfSortTitle] = useState('az')
  const [shelfPlatform, setShelfPlatform] = useState('')
  const [shelfYear, setShelfYear] = useState('')

  const results = useMemo(() => {
    const q = normalize(query)
    if (!q) return []
    return MOCK_CATALOG.filter((game) => {
      const inTitle = normalize(game.name).includes(q)
      const inPlatform = game.platforms.some((p) => normalize(p).includes(q))
      const inSummary = normalize(game.summary).includes(q)
      const yearStr = String(game.releaseYear)
      const inYear = yearStr.includes(q)
      return inTitle || inPlatform || inSummary || inYear
    })
  }, [query])

  function addLine(game) {
    const id =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `inv-${Date.now()}-${Math.random().toString(16).slice(2)}`
    setInventory((prev) => [
      ...prev,
      {
        id,
        igdbId: game.igdbId,
        name: game.name,
        platforms: game.platforms,
        releaseYear: game.releaseYear,
        qty: 1,
        condition: 'good',
        notes: '',
      },
    ])
  }

  function removeLine(id) {
    setInventory((prev) => prev.filter((row) => row.id !== id))
  }

  function updateLine(id, patch) {
    setInventory((prev) =>
      prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    )
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
          and notes on your shelf. Results here use local mock data; swapping in
          the Phoenix API response should keep this layout intact.
        </p>
        <div className="inventory-manage__badge-row">
          <span className="inventory-manage__badge">UI temp </span>
          <span className="inventory-manage__badge">IGDB via API next</span>
        </div>
      </header>

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
        {!trimmed && (
          <p className="inventory-manage__muted">
            Start typing to filter the stand-in catalog ({MOCK_CATALOG.length}{' '}
            titles). With IGDB connected, the same search bar will call your
            backend instead.
          </p>
        )}
        {trimmed && results.length === 0 && (
          <p className="inventory-manage__empty">
            No matching games. Try another spelling or broader keywords — live
            IGDB search will return richer matches.
          </p>
        )}
        {results.length > 0 && (
          <>
            <p className="inventory-manage__results-meta" aria-live="polite">
              {results.length} result{results.length === 1 ? '' : 's'} for &quot;
              {trimmed}&quot;
            </p>
            <ul className="inventory-manage__result-grid">
              {results.map((game) => (
                  <li key={game.igdbId} className="inventory-manage__card">
                    <GameCover game={game} />
                    <div className="inventory-manage__card-body">
                      <h3 className="inventory-manage__title">{game.name}</h3>
                      <span className="inventory-manage__igdb-pill">
                        ID {game.igdbId.replace(/^mock-/, '')} · preview
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
        {inventory.length === 0 ? (
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
