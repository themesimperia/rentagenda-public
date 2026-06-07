import type { PropertyType, RentalTerm } from './types';

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

/** OpenStreetMap embeddable iframe URL with a marker, no API key required. */
export function mapEmbedUrl(lat: number, lng: number): string {
  const d = 0.01;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`;
}

export interface Availability {
  available: boolean;
  label: string;
  /** 'green' = available now, 'amber' = occupied until a future date. */
  tone: 'green' | 'amber';
}

/**
 * Interprets a listing's `available_from` date into a display badge.
 * A null/absent or past date means the unit is available now.
 */
export function availability(availableFrom?: string | null): Availability {
  if (availableFrom) {
    const ts = new Date(availableFrom).getTime();
    if (!Number.isNaN(ts) && ts > Date.now()) {
      const label = new Date(ts).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      return { available: false, label: `Available ${label}`, tone: 'amber' };
    }
  }
  return { available: true, label: 'Available now', tone: 'green' };
}
