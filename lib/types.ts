import type { Timestamp } from 'firebase/firestore';

export type PropertyType = 'apartment' | 'house' | 'villa' | 'office' | 'vacation';
export type RentalTerm = 'long_term' | 'short_term';

export interface PublicListing {
  id: string;
  apartment_id: string;
  owner_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  rental_term: RentalTerm;
  address_public: string;
  lat: number | null;
  lng: number | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  size_sqm: number | null;
  amenities: string[];
  photos: string[];
  owner_name?: string | null;
  owner_avatar?: string | null;
  /** Explicit occupancy of the unit (derived from the apartment's status). */
  availability_status?: 'available' | 'occupied';
  /** ISO date (YYYY-MM-DD) the unit frees up; null/absent = unknown. */
  available_from?: string | null;
  status: 'published' | 'unpublished';
  availability_summary: null;
  created_at: Timestamp;
  published_at: Timestamp;
  updated_at: Timestamp;
}

export interface InquiryFormData {
  guest_name: string;
  guest_email: string;
  guest_phone?: string;
  message?: string;
}
