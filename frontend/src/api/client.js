const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function apiFetch(path) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request to ${path} failed with status ${res.status}${text ? ': ' + text : ''}`);
  }
  return res.json();
}

export async function fetchStocks() {
  return apiFetch('/api/stocks');
}

export async function fetchStock(ticker) {
  return apiFetch(`/api/stocks/${encodeURIComponent(ticker)}`);
}

export async function fetchStockHistory(ticker, range = '1M') {
  return apiFetch(`/api/stocks/${encodeURIComponent(ticker)}/history?range=${range}`);
}

export async function fetchMarketSummary() {
  return apiFetch('/api/market/summary');
}

export async function fetchSectors() {
  return apiFetch('/api/market/sectors');
}
