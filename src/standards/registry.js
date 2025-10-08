const STATE_FILE = {
  CA: 'ca_ccssm_geometry.json',
  MI: 'mi_ccssm_geometry.json'
};

const cache = new Map();

/**
 * Fetches and caches standards metadata for a given state.
 * @param {string} state
 * @returns {Promise<{meta: object, standards: Record<string, object>, practices: string[]}>}
 */
export async function loadStandards(state = 'CA') {
  const key = String(state || 'CA').toUpperCase();
  if (!STATE_FILE[key]) {
    throw new Error(`Unsupported state '${state}'`);
  }
  if (cache.has(key)) {
    return cache.get(key);
  }
  const file = STATE_FILE[key];
  const response = await fetch(`data/standards/${file}`);
  if (!response.ok) {
    throw new Error(`Failed to load standards for ${key}`);
  }
  const json = await response.json();
  cache.set(key, json);
  return json;
}

/**
 * Clears the in-memory standards cache. Primarily used for tests.
 */
export function clearStandardsCache() {
  cache.clear();
}

export function getCachedStates() {
  return Array.from(cache.keys());
}
