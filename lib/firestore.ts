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
import type { Inquiry, InquiryStatus } from '@/lib/inquiries';
import { buildSavedSnapshot, type SavedListing } from './saved-listings';
import type { MarketplaceFilters } from '@/lib/filter';
import type { SavedSearch } from '@/lib/saved-searches';
import { EMPTY_RENTER_PROFILE, normalizeRenterProfile, type RenterProfile } from '@/lib/renter-profile';
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
  intent: InquiryIntent = 'message',
  renterId: string | null = null,
): Promise<void> {
  await addDoc(collection(db, 'listing_inquiries'), {
    listing_id: listing.id,
    apartment_id: listing.apartment_id,
    owner_id: listing.owner_id,
    listing_title: listing.title,
    renter_id: renterId,
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

export async function getMyInquiries(uid: string): Promise<Inquiry[]> {
  const q = query(
    collection(db, 'listing_inquiries'),
    where('renter_id', '==', uid),
    orderBy('created_at', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      listing_id: data.listing_id ?? '',
      listing_title: data.listing_title ?? 'Listing',
      owner_id: data.owner_id ?? '',
      renter_id: data.renter_id ?? null,
      inquiry_type: (data.inquiry_type === 'viewing' ? 'viewing' : 'message'),
      message: data.message ?? null,
      status: (data.status ?? 'new') as InquiryStatus,
      created_at: data.created_at?.toMillis?.() ?? null,
    };
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

export async function saveSearch(
  uid: string,
  name: string,
  filters: MarketplaceFilters,
): Promise<void> {
  await addDoc(collection(db, 'users', uid, 'saved_searches'), {
    name,
    filters,
    created_at: serverTimestamp(),
  });
}

export async function getSavedSearches(uid: string): Promise<SavedSearch[]> {
  const q = query(
    collection(db, 'users', uid, 'saved_searches'),
    orderBy('created_at', 'desc'),
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name ?? '',
      filters: data.filters as MarketplaceFilters,
      created_at: data.created_at?.toMillis?.() ?? null,
    };
  });
}

export async function deleteSavedSearch(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, 'users', uid, 'saved_searches', id));
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

export async function getRenterProfile(uid: string): Promise<RenterProfile> {
  const snap = await getDoc(doc(db, 'users', uid, 'renter_profile', 'main'));
  return snap.exists() ? normalizeRenterProfile(snap.data()) : EMPTY_RENTER_PROFILE;
}

export async function saveRenterProfile(uid: string, data: RenterProfile): Promise<void> {
  await setDoc(doc(db, 'users', uid, 'renter_profile', 'main'), data, { merge: true });
}
