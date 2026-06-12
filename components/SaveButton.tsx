'use client';

import { Bookmark } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useSavedListings } from '@/lib/saved-listings-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import type { PublicListing } from '@/lib/types';

export function SaveButton({
  listing,
  className = '',
}: {
  listing: PublicListing;
  className?: string;
}) {
  const { user } = useAuth();
  const { isSaved, toggleSave } = useSavedListings();
  const { openAuth } = useAuthModal();
  const saved = isSaved(listing.id);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      openAuth('signin');
      return;
    }
    void toggleSave(listing);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Saved' : 'Save listing'}
      title={saved ? 'Saved' : 'Save listing'}
      className={`grid place-items-center rounded-lg transition-colors ${
        saved ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
      } ${className}`}
    >
      <Bookmark className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
    </button>
  );
}
