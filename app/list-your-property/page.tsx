import { redirect } from 'next/navigation';
import { OWNER_LANDING_URL } from '@/lib/config';

// The marketplace no longer hosts pricing/checkout. Listing a property and
// paying are handled entirely in App 1 — send anyone here to its landing page.
export default function ListYourPropertyPage() {
  redirect(OWNER_LANDING_URL);
}
