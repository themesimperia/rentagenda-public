import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MapPin, Bed, Bath, Maximize2, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PhotoGallery } from '@/components/PhotoGallery';
import { InquiryForm } from '@/components/InquiryForm';
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

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment', house: 'House', villa: 'Villa',
  office: 'Office', vacation: 'Vacation rental',
};
const TERM_LABELS: Record<string, string> = {
  long_term: 'Long term', short_term: 'Short term',
};

function formatPrice(price: number | null, currency: string) {
  if (price == null) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency, maximumFractionDigits: 0,
  }).format(price);
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
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        {/* Left: photos + details */}
        <div className="lg:col-span-2 space-y-8">
          <PhotoGallery photos={listing.photos} title={listing.title} />

          <div>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge variant="secondary">
                {PROPERTY_TYPE_LABELS[listing.property_type] ?? listing.property_type}
              </Badge>
              <Badge variant="secondary">
                {TERM_LABELS[listing.rental_term] ?? listing.rental_term}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">{listing.title}</h1>

            <p className="mt-2 text-2xl font-semibold text-indigo-600">
              {formatPrice(listing.price, listing.currency)}
              <span className="text-base font-normal text-slate-500">/month</span>
            </p>

            {listing.address_public && (
              <p className="mt-2 flex items-center gap-1.5 text-slate-500">
                <MapPin className="h-4 w-4 shrink-0" /> {listing.address_public}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-6 text-slate-700">
              {listing.bedrooms != null && (
                <span className="flex items-center gap-2">
                  <Bed className="h-4 w-4 text-slate-400" />
                  {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
                </span>
              )}
              {listing.bathrooms != null && (
                <span className="flex items-center gap-2">
                  <Bath className="h-4 w-4 text-slate-400" />
                  {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}
                </span>
              )}
              {listing.size_sqm != null && (
                <span className="flex items-center gap-2">
                  <Maximize2 className="h-4 w-4 text-slate-400" />
                  {listing.size_sqm} m²
                </span>
              )}
            </div>
          </div>

          <Separator />

          {listing.description && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">About this property</h2>
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                {listing.description}
              </p>
            </div>
          )}

          {listing.amenities.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Amenities</h2>
              <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {listing.amenities.map(a => (
                  <li key={a} className="flex items-center gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {listing.lat != null && listing.lng != null && (
            <div>
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Approximate location</h2>
              <div className="overflow-hidden rounded-xl border">
                <iframe
                  title="Approximate location map"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng - 0.01},${listing.lat - 0.01},${listing.lng + 0.01},${listing.lat + 0.01}&layer=mapnik&marker=${listing.lat},${listing.lng}`}
                  width="100%"
                  height="300"
                  className="border-0"
                />
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Exact address shared after inquiry.
              </p>
            </div>
          )}
        </div>

        {/* Right: sticky inquiry form */}
        <div>
          <div className="sticky top-20 rounded-xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-900">Contact the owner</h2>
            <InquiryForm listing={listing} />
          </div>
        </div>
      </div>
    </div>
  );
}
