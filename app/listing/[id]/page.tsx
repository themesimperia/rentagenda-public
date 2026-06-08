import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/ListingDetail';
import { getListing, getPublishedListings } from '@/lib/firestore';

export const revalidate = 300;

export async function generateStaticParams() {
  const listings = await getPublishedListings();
  return listings.map(l => ({ id: l.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: 'Listing not found' };

  const description = listing.description
    ? listing.description.slice(0, 160)
    : `${listing.property_type} in ${listing.address_public}`;

  return {
    title: listing.title,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.photos[0] ? [{ url: listing.photos[0] }] : [],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      description,
      images: listing.photos[0] ? [listing.photos[0]] : [],
    },
  };
}

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return <ListingDetail listing={listing} />;
}
