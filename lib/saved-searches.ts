import { propertyTypeLabel, termLabel } from '@/lib/format';
import type { MarketplaceFilters } from '@/lib/filter';

export interface SavedSearch {
  id: string;
  name: string;
  filters: MarketplaceFilters;
  created_at: number | null; // epoch ms
}

export function buildSavedSearch(
  name: string,
  filters: MarketplaceFilters,
): { name: string; filters: MarketplaceFilters } {
  return { name: name.trim(), filters };
}

export function summarizeFilters(f: MarketplaceFilters): string {
  const parts: string[] = [];

  if (f.types.length) parts.push(f.types.map(propertyTypeLabel).join('/'));

  if (f.bedroomsMin != null) {
    parts.push(f.bedroomsMin === 0 ? 'Studio' : `${f.bedroomsMin}+ beds`);
  }

  if (f.priceMin != null || f.priceMax != null) {
    if (f.priceMin != null && f.priceMax != null) parts.push(`$${f.priceMin}–$${f.priceMax}`);
    else if (f.priceMax != null) parts.push(`<$${f.priceMax}`);
    else parts.push(`>$${f.priceMin}`);
  }

  if (f.terms.length) parts.push(f.terms.map(termLabel).join('/'));
  if (f.locations.length) parts.push(f.locations.join(', '));
  if (f.amenities.length) parts.push(`${f.amenities.length} feature${f.amenities.length === 1 ? '' : 's'}`);

  if (f.sizeMin != null || f.sizeMax != null) {
    const lo = f.sizeMin != null ? `${f.sizeMin}` : '0';
    const hi = f.sizeMax != null ? `${f.sizeMax}` : '∞';
    parts.push(`${lo}–${hi} m²`);
  }

  if (f.availabilityWithin != null) {
    parts.push(f.availabilityWithin === 0 ? 'Available now' : `≤${f.availabilityWithin} days`);
  }

  return parts.length ? parts.join(' · ') : 'All properties';
}
