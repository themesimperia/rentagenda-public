'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSavedListings } from '@/lib/saved-listings-context';
import { getSavedListings, getListing } from '@/lib/firestore';
import type { SavedListing } from '@/lib/saved-listings';
import type { PublicListing } from '@/lib/types';

export type SavedRow =
  | { kind: 'live'; saved: SavedListing; listing: PublicListing }
  | { kind: 'gone'; saved: SavedListing };

/** Resolves the signed-in user's saved-listing snapshots into live/gone rows.
 *  Filters by the live `savedIds` set so heart un-saves elsewhere reflect
 *  without a refetch. Mount only when a user is present (the dashboard shell
 *  gates on auth). */
export function useSavedListingsData(): { rows: SavedRow[]; loading: boolean } {
  const { user } = useAuth();
  const { savedIds } = useSavedListings();
  const [rows, setRows] = useState<SavedRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const saved = await getSavedListings(user.uid);
      const resolved = await Promise.all(
        saved.map(async (s): Promise<SavedRow> => {
          const listing = await getListing(s.listing_id).catch(() => null);
          return listing ? { kind: 'live', saved: s, listing } : { kind: 'gone', saved: s };
        }),
      );
      if (active) {
        setRows(resolved);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const visible = rows.filter(r => savedIds.has(r.saved.listing_id));
  return { rows: visible, loading };
}
