import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { DetailPanel } from '@/components/DetailPanel';
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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <Link
          href="/listings"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-blue-600"
        >
          <ChevronLeft className="h-4 w-4" /> Back to all properties
        </Link>
        <DetailPanel listing={listing} />
      </div>
    </div>
  );
}
