import type { PublicListing, PropertyType, RentalTerm } from './types';

export interface MarketplaceFilters {
  search: string;
  locations: string[];
  types: PropertyType[];
  terms: RentalTerm[];
  amenities: string[];
  priceMin: number | null;
  priceMax: number | null;
  sizeMin: number | null;
  sizeMax: number | null;
  bedroomsMin: number | null;
}

export const EMPTY_FILTERS: MarketplaceFilters = {
  search: '',
  locations: [],
  types: [],
  terms: [],
  amenities: [],
  priceMin: null,
  priceMax: null,
  sizeMin: null,
  sizeMax: null,
  bedroomsMin: null,
};

export function applyFilters(
  listings: PublicListing[],
  f: MarketplaceFilters,
): PublicListing[] {
  return listings.filter(l => {
    if (f.search) {
      const q = f.search.toLowerCase();
      const haystack = `${l.title} ${l.address_public} ${l.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (f.locations.length && !f.locations.includes(l.address_public)) return false;
    if (f.types.length && !f.types.includes(l.property_type)) return false;
    if (f.terms.length && !f.terms.includes(l.rental_term)) return false;
    if (f.priceMin != null && (l.price == null || l.price < f.priceMin)) return false;
    if (f.priceMax != null && (l.price == null || l.price > f.priceMax)) return false;
    if (f.sizeMin != null && (l.size_sqm == null || l.size_sqm < f.sizeMin)) return false;
    if (f.sizeMax != null && (l.size_sqm == null || l.size_sqm > f.sizeMax)) return false;
    if (f.bedroomsMin != null && (l.bedrooms == null || l.bedrooms < f.bedroomsMin)) return false;
    if (f.amenities.length && !f.amenities.every(a => l.amenities.includes(a))) return false;
    return true;
  });
}

/** Distinct, non-empty location labels across the listing set, sorted. */
export function deriveLocations(listings: PublicListing[]): string[] {
  const set = new Set<string>();
  for (const l of listings) {
    if (l.address_public?.trim()) set.add(l.address_public.trim());
  }
  return [...set].sort();
}

/** Distinct property types present in the listing set. */
export function deriveTypes(listings: PublicListing[]): PropertyType[] {
  const set = new Set<PropertyType>();
  for (const l of listings) set.add(l.property_type);
  return [...set];
}

/** Distinct amenities across the listing set, sorted. */
export function deriveAmenities(listings: PublicListing[]): string[] {
  const set = new Set<string>();
  for (const l of listings) for (const a of l.amenities) set.add(a);
  return [...set].sort();
}

export function isFiltered(f: MarketplaceFilters): boolean {
  return (
    f.search !== '' ||
    f.locations.length > 0 ||
    f.types.length > 0 ||
    f.terms.length > 0 ||
    f.amenities.length > 0 ||
    f.priceMin != null ||
    f.priceMax != null ||
    f.sizeMin != null ||
    f.sizeMax != null ||
    f.bedroomsMin != null
  );
}
