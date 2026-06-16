import type { PropertyType, RentalTerm, PublicListing } from './types';

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  office: 'Office',
  vacation: 'Vacation rental',
};

export const TERM_LABELS: Record<RentalTerm, string> = {
  long_term: 'Long term',
  short_term: 'Short term',
};

export function propertyTypeLabel(type: string): string {
  return PROPERTY_TYPE_LABELS[type as PropertyType] ?? type;
}

export function termLabel(term: string): string {
  return TERM_LABELS[term as RentalTerm] ?? term;
}

export function formatPrice(price: number | null, currency: string): string {
  if (price == null) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * Masks a display name for public privacy: keeps the first and last letter of
 * each word and replaces the middle with asterisks ("John Smith" → "J**n S***h").
 * Words of 1–2 characters are returned unchanged (nothing to safely hide).
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return '';
  return name
    .split(/(\s+)/) // keep whitespace separators so spacing is preserved
    .map(part => {
      if (part.length <= 2 || /^\s+$/.test(part)) return part;
      return part[0] + '*'.repeat(part.length - 2) + part[part.length - 1];
    })
    .join('');
}

/** OpenStreetMap embeddable iframe URL with a marker, no API key required. */
export function mapEmbedUrl(lat: number, lng: number): string {
  const d = 0.01;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
}

export interface Availability {
  available: boolean;
  /** 'green' = available now, 'amber' = occupied until a future date. */
  tone: 'green' | 'amber';
  /** Days until the unit frees up (0 when available now). */
  daysLeft: number;
  /** Formatted date the unit frees up, or null when available now. */
  freeDate: string | null;
  /** Short badge label: "Available now" or "N days left". */
  label: string;
}

const MS_PER_DAY = 86_400_000;

type AvailabilityInput = Pick<PublicListing, 'availability_status' | 'available_from'>;

/**
 * Interprets a listing's occupancy. `availability_status === 'occupied'` (or a
 * future `available_from`) means occupied — with a day countdown when the free
 * date is known, otherwise a plain "Occupied". Anything else is available now.
 */
export function availability(input: AvailabilityInput): Availability {
  const from = input.available_from;
  let daysLeft = 0;
  let freeDate: string | null = null;

  if (from) {
    const ts = new Date(from).getTime();
    if (!Number.isNaN(ts) && ts > Date.now()) {
      daysLeft = Math.ceil((ts - Date.now()) / MS_PER_DAY);
      freeDate = new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  }

  const occupied = input.availability_status === 'occupied' || freeDate != null;

  if (occupied) {
    return {
      available: false,
      tone: 'amber',
      daysLeft,
      freeDate,
      label: freeDate ? `${daysLeft} day${daysLeft === 1 ? '' : 's'} left` : 'Occupied',
    };
  }

  return { available: true, tone: 'green', daysLeft: 0, freeDate: null, label: 'Available now' };
}
