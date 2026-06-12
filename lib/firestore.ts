import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PublicListing, InquiryFormData, InquiryIntent } from './types';
import { buildSavedSnapshot, type SavedListing } from './saved-listings';
import { cache } from 'react';

/** Firestore Timestamp (or anything) -> epoch millis, so listings are plain
 * serializable objects safe to pass from Server to Client Components. */
function toMillis(value: unknown): number | null {
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  return typeof value === 'number' ? value : null;
}

function toListing(id: string, data: DocumentData): PublicListing {
  return {
    ...data,
    id,
    photos: Array.isArray(data.photos) ? data.photos : [],
    amenities: Array.isArray(data.amenities) ? data.amenities : [],
    created_at: toMillis(data.created_at),
    published_at: toMillis(data.published_at),
    updated_at: toMillis(data.updated_at),
  } as PublicListing;
}

export const getPublishedListings = cache(async (): Promise<PublicListing[]> => {
  const q = query(
    collection(db, 'public_listings'),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const listings = snap.docs.map(d => toListing(d.id, d.data()));
  return listings.sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0));
});

export const getListing = cache(async (id: string): Promise<PublicListing | null> => {
  const snap = await getDoc(doc(db, 'public_listings', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== 'published') return null;
  return toListing(snap.id, data);
});

export async function createInquiry(
  listing: PublicListing,
  form: InquiryFormData,
  intent: InquiryIntent = 'message'
): Promise<void> {
  await addDoc(collection(db, 'listing_inquiries'), {
    listing_id: listing.id,
    apartment_id: listing.apartment_id,
    owner_id: listing.owner_id,
    guest_name: form.guest_name,
    guest_email: form.guest_email,
    guest_phone: form.guest_phone || null,
    message: form.message || null,
    inquiry_type: intent,
    created_at: serverTimestamp(),
    status: 'new',
    source: 'public_site',
  });
}

/** Listing IDs the user has saved (lightweight — for the save-state Set). */
export async function getSavedListingIds(uid: string): Promise<string[]> {
  const snap = await getDocs(collection(db, 'users', uid, 'saved_listings'));
  return snap.docs.map(d => d.id);
}

/** Full saved-listing snapshot docs, newest first (for the dashboard). */
export async function getSavedListings(uid: string): Promise<SavedListing[]> {
  const q = query(
    collection(db, 'users', uid, 'saved_listings'),
    orderBy('saved_at', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      listing_id: d.id,
      title: data.title ?? '',
      thumbnail: data.thumbnail ?? null,
      price_at_save: data.price_at_save ?? null,
      currency: data.currency ?? 'EUR',
      saved_at: toMillis(data.saved_at),
    };
  });
}

export async function saveListing(uid: string, listing: PublicListing): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'saved_listings', listing.id), {
    ...buildSavedSnapshot(listing),
    saved_at: serverTimestamp(),
  });
}

export async function unsaveListing(uid: string, listingId: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'saved_listings', listingId));
}
