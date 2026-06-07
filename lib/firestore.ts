import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { PublicListing, InquiryFormData } from './types';

export async function getPublishedListings(): Promise<PublicListing[]> {
  const q = query(
    collection(db, 'public_listings'),
    where('status', '==', 'published')
  );
  const snap = await getDocs(q);
  const listings = snap.docs.map(d => ({ id: d.id, ...d.data() } as PublicListing));
  return listings.sort((a, b) => {
    const aTime = a.published_at?.toMillis?.() ?? 0;
    const bTime = b.published_at?.toMillis?.() ?? 0;
    return bTime - aTime;
  });
}

export async function getListing(id: string): Promise<PublicListing | null> {
  const snap = await getDoc(doc(db, 'public_listings', id));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (data.status !== 'published') return null;
  return { id: snap.id, ...data } as PublicListing;
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
