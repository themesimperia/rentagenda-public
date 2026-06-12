import { describe, it, expect } from 'vitest';
import {
  computeKpis,
  savedByType,
  priceBuckets,
  buildActivity,
} from '@/lib/dashboard-metrics';
import type { SavedRow } from '@/lib/use-saved-listings-data';
import type { PublicListing } from '@/lib/types';
import type { SavedListing } from '@/lib/saved-listings';

function listing(overrides: Partial<PublicListing> = {}): PublicListing {
  return {
    id: 'L1', apartment_id: 'a1', owner_id: 'o1', title: 'Home', description: '',
    property_type: 'apartment', rental_term: 'long_term', address_public: 'City',
    lat: null, lng: null, price: 1000, currency: 'EUR', bedrooms: 2, bathrooms: 1,
    size_sqm: 60, amenities: [], photos: [], status: 'published',
    availability_summary: null, created_at: null, published_at: null, updated_at: null,
    availability_status: 'available', available_from: null,
    ...overrides,
  };
}

function saved(overrides: Partial<SavedListing> = {}): SavedListing {
  return {
    listing_id: 'L1', title: 'Home', thumbnail: null, price_at_save: 1000,
    currency: 'EUR', saved_at: 1000, ...overrides,
  };
}

function liveRow(l: Partial<PublicListing>, s: Partial<SavedListing> = {}): SavedRow {
  const id = l.id ?? 'L1';
  return { kind: 'live', listing: listing({ ...l, id }), saved: saved({ listing_id: id, ...s }) };
}
function goneRow(s: Partial<SavedListing>): SavedRow {
  return { kind: 'gone', saved: saved(s) };
}

describe('computeKpis', () => {
  it('counts saved (live + gone), available-now, avg price, and price drops', () => {
    const rows: SavedRow[] = [
      liveRow({ id: 'A', price: 1000, availability_status: 'available' }, { price_at_save: 1200 }), // drop
      liveRow({ id: 'B', price: 2000, availability_status: 'occupied' }, { price_at_save: 2000 }),
      goneRow({ listing_id: 'C', price_at_save: 800 }),
    ];
    expect(computeKpis(rows)).toEqual({
      savedCount: 3,
      availableNow: 1,
      avgPrice: 1500, // (1000 + 2000) / 2
      priceDrops: 1,
    });
  });

  it('returns null avgPrice and zeros for an empty list', () => {
    expect(computeKpis([])).toEqual({ savedCount: 0, availableNow: 0, avgPrice: null, priceDrops: 0 });
  });

  it('ignores null prices in the average', () => {
    const rows = [liveRow({ id: 'A', price: 1000 }), liveRow({ id: 'B', price: null })];
    expect(computeKpis(rows).avgPrice).toBe(1000);
  });
});

describe('savedByType', () => {
  it('counts live listings by label, descending', () => {
    const rows = [
      liveRow({ id: 'A', property_type: 'apartment' }),
      liveRow({ id: 'B', property_type: 'apartment' }),
      liveRow({ id: 'C', property_type: 'house' }),
    ];
    expect(savedByType(rows)).toEqual([
      { label: 'Apartment', count: 2 },
      { label: 'House', count: 1 },
    ]);
  });
});

describe('priceBuckets', () => {
  it('places prices into fixed buckets and keeps zero buckets', () => {
    const rows = [
      liveRow({ id: 'A', price: 400 }),   // < 500
      liveRow({ id: 'B', price: 500 }),   // 500–1000
      liveRow({ id: 'C', price: 1500 }),  // 1000–2000
      liveRow({ id: 'D', price: 4000 }),  // 3500+
    ];
    expect(priceBuckets(rows)).toEqual([
      { label: '< 500', count: 1 },
      { label: '500–1000', count: 1 },
      { label: '1000–2000', count: 1 },
      { label: '2000–3500', count: 0 },
      { label: '3500+', count: 1 },
    ]);
  });
});

describe('buildActivity', () => {
  it('builds items newest-first with price-drop detail', () => {
    const rows = [
      liveRow({ id: 'A', price: 900 }, { saved_at: 100, price_at_save: 1000 }),
      liveRow({ id: 'B', price: 2000 }, { saved_at: 300, price_at_save: 2000 }),
    ];
    const items = buildActivity(rows);
    expect(items.map(i => i.id)).toEqual(['B', 'A']); // sorted by savedAt desc
    expect(items[1].priceDrop).toEqual({ from: 1000, to: 900, currency: 'EUR' });
    expect(items[0].priceDrop).toBeNull();
    expect(items[0].href).toBe('/listing/B');
  });

  it('marks gone rows with a null href and treats null saved_at as oldest', () => {
    const rows = [goneRow({ listing_id: 'G', saved_at: null })];
    const items = buildActivity(rows);
    expect(items[0].href).toBeNull();
    expect(items[0].savedAt).toBe(0);
  });
});
