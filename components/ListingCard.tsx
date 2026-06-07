import Image from 'next/image';
import Link from 'next/link';
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PublicListing } from '@/lib/types';

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  apartment: 'Apartment',
  house: 'House',
  villa: 'Villa',
  office: 'Office',
  vacation: 'Vacation rental',
};

const TERM_LABELS: Record<string, string> = {
  long_term: 'Long term',
  short_term: 'Short term',
};

function formatPrice(price: number | null, currency: string): string {
  if (price == null) return 'Price on request';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function ListingCard({ listing }: { listing: PublicListing }) {
  const photo = listing.photos[0];

  return (
    <Link href={`/listing/${listing.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border bg-white shadow-sm transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] w-full bg-slate-100">
          {photo ? (
            <Image
              src={photo}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              No photo
            </div>
          )}
          <div className="absolute top-2 left-2 flex gap-1">
            <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs">
              {PROPERTY_TYPE_LABELS[listing.property_type] ?? listing.property_type}
            </Badge>
            <Badge variant="secondary" className="bg-white/90 text-slate-700 text-xs">
              {TERM_LABELS[listing.rental_term] ?? listing.rental_term}
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <p className="text-lg font-semibold text-indigo-600">
            {formatPrice(listing.price, listing.currency)}
            <span className="text-sm font-normal text-slate-500">/mo</span>
          </p>
          <h3 className="mt-0.5 font-medium text-slate-900 line-clamp-1">{listing.title}</h3>

          {listing.address_public && (
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {listing.address_public}
            </p>
          )}

          <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
            {listing.bedrooms != null && (
              <span className="flex items-center gap-1">
                <Bed className="h-3.5 w-3.5" /> {listing.bedrooms} bed
              </span>
            )}
            {listing.bathrooms != null && (
              <span className="flex items-center gap-1">
                <Bath className="h-3.5 w-3.5" /> {listing.bathrooms} bath
              </span>
            )}
            {listing.size_sqm != null && (
              <span className="flex items-center gap-1">
                <Maximize2 className="h-3.5 w-3.5" /> {listing.size_sqm} m²
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
