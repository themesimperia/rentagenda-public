import { describe, it, expect } from 'vitest';
import { filtersToParams, paramsToFilters } from '@/lib/filter-url';
import { EMPTY_FILTERS } from '@/lib/filter';

describe('filter-url', () => {
  it('round-trips a full filter set', () => {
    const f = {
      ...EMPTY_FILTERS,
      search: 'loft',
      locations: ['Chisinau', 'Iasi'],
      types: ['apartment', 'house'] as const,
      terms: ['long_term'] as const,
      amenities: ['wifi', 'parking'],
      priceMin: 500,
      priceMax: 2000,
      sizeMin: 40,
      sizeMax: 120,
      bedroomsMin: 2,
    };
    const params = filtersToParams(f as any);
    expect(paramsToFilters(params)).toEqual({
      search: 'loft',
      locations: ['Chisinau', 'Iasi'],
      types: ['apartment', 'house'],
      terms: ['long_term'],
      amenities: ['wifi', 'parking'],
      priceMin: 500,
      priceMax: 2000,
      sizeMin: 40,
      sizeMax: 120,
      bedroomsMin: 2,
    });
  });

  it('omits empty values', () => {
    expect(filtersToParams(EMPTY_FILTERS).toString()).toBe('');
  });

  it('parses legacy single-value links and rejects bad enums / NaN', () => {
    const params = new URLSearchParams('q=home&type=apartment&type=bogus&term=long_term&region=Cluj&priceMin=abc&beds=3');
    expect(paramsToFilters(params)).toEqual({
      search: 'home',
      types: ['apartment'],
      terms: ['long_term'],
      locations: ['Cluj'],
      bedroomsMin: 3,
    });
  });
});
