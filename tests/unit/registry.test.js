import { loadStandards, clearStandardsCache, getCachedStates } from '../../src/standards/registry.js';

describe('standards registry', () => {
  beforeEach(() => {
    clearStandardsCache();
    global.fetch = jest.fn(async url => ({
      ok: true,
      json: async () => ({ meta: { state: url.includes('ca_') ? 'CA' : 'MI' }, standards: {}, practices: [] })
    }));
  });

  it('loads standards for a state', async () => {
    const ca = await loadStandards('CA');
    expect(ca.meta.state).toBe('CA');
    expect(fetch).toHaveBeenCalledWith('data/standards/ca_ccssm_geometry.json');
  });

  it('caches results for repeated calls', async () => {
    await loadStandards('MI');
    await loadStandards('MI');
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(getCachedStates()).toContain('MI');
  });

  it('throws for unsupported states', async () => {
    await expect(loadStandards('TX')).rejects.toThrow('Unsupported state');
  });
});
