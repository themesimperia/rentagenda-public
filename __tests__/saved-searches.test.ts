import { describe, it, expect } from 'vitest';
import { buildSavedSearch, summarizeFilters } from '@/lib/saved-searches';
import { EMPTY_FILTERS } from '@/lib/filter';

describe('buildSavedSearch', () => {
  it('trims the name and keeps the filters', () => {
    const r = buildSavedSearch('  My search  ', { ...EMPTY_FILTERS, bedroomsMin: 2 });
    expect(r).toEqual({ name: 'My search', filters: { ...EMPTY_FILTERS, bedroomsMin: 2 } });
  });
});

describe('summarizeFilters', () => {
  it('returns "All properties" for empty filters', () => {
    expect(summarizeFilters(EMPTY_FILTERS)).toBe('All properties');
  });

  it('summarizes type, beds, price and location in order', () => {
    const s = summarizeFilters({
      ...EMPTY_FILTERS,
      types: ['apartment'],
      bedroomsMin: 2,
      priceMax: 1000,
      locations: ['Chisinau'],
    });
    expect(s).toBe('Apartment · 2+ beds · <$1000 · Chisinau');
  });

  it('shows Studio for bedroomsMin 0 and a range for min+max price', () => {
    const s = summarizeFilters({ ...EMPTY_FILTERS, bedroomsMin: 0, priceMin: 500, priceMax: 1500 });
    expect(s).toBe('Studio · $500–$1500');
  });
});
