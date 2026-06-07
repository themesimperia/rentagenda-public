import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PublicListing, InquiryFormData } from './types';

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
    created_at: toMillis(data.created_at),
    published_at: toMillis(data.published_at),
    updated_at: toMillis(data.updated_at),
  } as PublicListing;
}

export async function getPublishedListings(): Promise<PublicListing[]> {
  const q = query(
    collection(db, 'public_listings'),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const listings = snap.docs.map(d => toListing(d.id, d.data()));
  return listings.sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0));
}

export async function getListing(id: string): Promise<PublicListing | null> {
  const snap = await getDoc(doc(db, 'public_listings', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== 'published') return null;
  return toListing(snap.id, data);
}

export async function createInquiry(
  listing: PublicListing,
  form: InquiryFormData
): Promise<void> {
  await addDoc(collection(db, 'listing_inquiries'), {
    listing_id: listing.id,
    apartment_id: listing.apartment_id,
    owner_id: listing.owner_id,
    guest_name: form.guest_name,
    guest_email: form.guest_email,
    guest_phone: form.guest_phone || null,
    message: form.message || null,
    created_at: serverTimestamp(),
    status: 'new',
    source: 'public_site',
  });
}
