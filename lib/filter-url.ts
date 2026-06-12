import type { MarketplaceFilters } from '@/lib/filter';
import type { PropertyType, RentalTerm } from '@/lib/types';

const PROPERTY_TYPES: PropertyType[] = ['apartment', 'house', 'villa', 'office', 'vacation'];
const RENTAL_TERMS: RentalTerm[] = ['long_term', 'short_term'];

export function filtersToParams(f: MarketplaceFilters): URLSearchParams {
  const p = new URLSearchParams();
  if (f.search) p.set('q', f.search);
  for (const loc of f.locations) p.append('region', loc);
  for (const t of f.types) p.append('type', t);
  for (const t of f.terms) p.append('term', t);
  for (const a of f.amenities) p.append('amenity', a);
  if (f.priceMin != null) p.set('priceMin', String(f.priceMin));
  if (f.priceMax != null) p.set('priceMax', String(f.priceMax));
  if (f.sizeMin != null) p.set('sizeMin', String(f.sizeMin));
  if (f.sizeMax != null) p.set('sizeMax', String(f.sizeMax));
  if (f.bedroomsMin != null) p.set('beds', String(f.bedroomsMin));
  return p;
}

function num(v: string | null): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}

export function paramsToFilters(params: URLSearchParams): Partial<MarketplaceFilters> {
  const out: Partial<MarketplaceFilters> = {};

  const q = params.get('q');
  if (q) out.search = q;

  const regions = params.getAll('region');
  if (regions.length) out.locations = regions;

  const types = params.getAll('type').filter((t): t is PropertyType =>
    PROPERTY_TYPES.includes(t as PropertyType),
  );
  if (types.length) out.types = types;

  const terms = params.getAll('term').filter((t): t is RentalTerm =>
    RENTAL_TERMS.includes(t as RentalTerm),
  );
  if (terms.length) out.terms = terms;

  const amenities = params.getAll('amenity');
  if (amenities.length) out.amenities = amenities;

  const priceMin = num(params.get('priceMin')); if (priceMin != null) out.priceMin = priceMin;
  const priceMax = num(params.get('priceMax')); if (priceMax != null) out.priceMax = priceMax;
  const sizeMin = num(params.get('sizeMin')); if (sizeMin != null) out.sizeMin = sizeMin;
  const sizeMax = num(params.get('sizeMax')); if (sizeMax != null) out.sizeMax = sizeMax;
  const beds = num(params.get('beds')); if (beds != null) out.bedroomsMin = beds;

  return out;
}
