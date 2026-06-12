import { describe, it, expect } from 'vitest';
import { buildSavedSnapshot } from '@/lib/saved-listings';
import type { PublicListing } from '@/lib/types';

function listing(overrides: Partial<PublicListing> = {}): PublicListing {
  return {
    id: 'abc',
    apartment_id: 'apt1',
    owner_id: 'o1',
    title: 'Cosy 2BR',
    description: '',
    property_type: 'apartment',
    rental_term: 'long_term',
    address_public: 'Chisinau',
    lat: null,
    lng: null,
    price: 500,
    currency: 'EUR',
    bedrooms: 2,
    bathrooms: 1,
    size_sqm: 60,
    amenities: [],
    photos: ['https://img/p1.jpg', 'https://img/p2.jpg'],
    status: 'published',
    availability_summary: null,
    created_at: null,
    published_at: null,
    updated_at: null,
    ...overrides,
  };
}

describe('buildSavedSnapshot', () => {
  it('captures id, title, first photo, price and currency', () => {
    expect(buildSavedSnapshot(listing())).toEqual({
      listing_id: 'abc',
      title: 'Cosy 2BR',
      thumbnail: 'https://img/p1.jpg',
      price_at_save: 500,
      currency: 'EUR',
    });
  });

  it('uses null thumbnail when there are no photos', () => {
    expect(buildSavedSnapshot(listing({ photos: [] })).thumbnail).toBeNull();
  });

  it('preserves a null price', () => {
    expect(buildSavedSnapshot(listing({ price: null })).price_at_save).toBeNull();
  });
});
