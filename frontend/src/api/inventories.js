import { request } from './request.js';

function inventoryFromApi(row) {
  return {
    id: row.id,
    igdbId: row.igdb_id,
    name: row.name,
    platforms: row.platforms ?? [],
    releaseYear: row.release_year ?? null,
    qty: row.qty,
    condition: row.condition,
    notes: row.notes ?? '',
  };
}

function inventoryToApi(row) {
  return {
    igdb_id: row.igdbId,
    name: row.name,
    platforms: row.platforms ?? [],
    release_year: row.releaseYear,
    qty: row.qty,
    condition: row.condition,
    notes: row.notes ?? '',
  };
}

function gameFromApi(game) {
  return {
    igdbId: game.igdb_id,
    name: game.name,
    platforms: game.platforms ?? [],
    releaseYear: game.release_year ?? null,
    summary: game.summary ?? '',
    coverUrl: game.cover_url ?? null,
  };
}

export async function fetchInventories() {
  const data = await request('/inventories');
  return data.data.map(inventoryFromApi);
}

export async function createInventory(row) {
  const data = await request('/inventories', {
    method: 'POST',
    body: JSON.stringify({ inventory: inventoryToApi(row) }),
  });
  return inventoryFromApi(data.data);
}

export async function updateInventory(id, row) {
  const data = await request(`/inventories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ inventory: inventoryToApi(row) }),
  });
  return inventoryFromApi(data.data);
}

export async function deleteInventory(id) {
  await request(`/inventories/${id}`, { method: 'DELETE' });
}

export async function searchGames(query) {
  const params = new URLSearchParams({ q: query });
  const data = await request(`/games/search?${params}`);
  return data.data.map(gameFromApi);
}
