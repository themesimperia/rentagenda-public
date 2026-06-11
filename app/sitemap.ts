import type { MetadataRoute } from 'next';
import { getPublishedListings } from '@/lib/firestore';
import type { PublicListing } from '@/lib/types';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://rentagenda-public.vercel.app';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let listings: PublicListing[] = [];
  try {
    listings = await getPublishedListings();
  } catch (err) {
    console.error('sitemap: failed to load listings:', err);
  }

  const listingUrls: MetadataRoute.Sitemap = listings.map(l => ({
    url: `${SITE_URL}/listing/${l.id}`,
    lastModified: l.updated_at ? new Date(l.updated_at) : new Date(),
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    ...listingUrls,
  ];
}
