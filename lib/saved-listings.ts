import type { PublicListing } from './types';

/** Light, denormalized snapshot stored on a saved-listing doc. Lets the
 * dashboard render even if the live listing is later unpublished, and seeds
 * the future price-history slice via `price_at_save`. */
export interface SavedSnapshot {
  listing_id: string;
  title: string;
  thumbnail: string | null;
  price_at_save: number | null;
  currency: string;
}

/** A saved-listing doc as read back for display (snapshot + when it was saved). */
export interface SavedListing extends SavedSnapshot {
  saved_at: number | null;
}

export function buildSavedSnapshot(listing: PublicListing): SavedSnapshot {
  return {
    listing_id: listing.id,
    title: listing.title,
    thumbnail: listing.photos[0] ?? null,
    price_at_save: listing.price,
    currency: listing.currency,
  };
}
