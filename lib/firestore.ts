import {
  collection,
  query,
  where,
  orderBy,
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
    where('status', '==', 'published'),
    orderBy('published_at', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as PublicListing));
}

export async function getListing(id: string): Promise<PublicListing | null> {
  const snap = await getDoc(doc(db, 'public_listings', id));
  if (!snap.exists() || snap.data().status !== 'published') return null;
  return { id: snap.id, ...snap.data() } as PublicListing;
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
