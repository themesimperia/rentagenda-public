import { ListingCard } from './ListingCard';
import type { PublicListing } from '@/lib/types';

export function ListingGrid({ listings }: { listings: PublicListing[] }) {
  if (listings.length === 0) {
    return (
      <div className="py-20 text-center text-slate-500">
        <p className="text-lg">No listings found.</p>
        <p className="mt-1 text-sm">Try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map(listing => (
        <ListingCard key={listing.id} listing={listing} href={`/listing/${listing.id}`} />
      ))}
    </div>
  );
}
