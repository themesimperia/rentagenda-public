'use client';

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import {
  getSavedListingIds,
  saveListing,
  unsaveListing,
} from '@/lib/firestore';
import type { PublicListing } from '@/lib/types';

interface SavedListingsValue {
  savedIds: Set<string>;
  loading: boolean;
  isSaved: (listingId: string) => boolean;
  toggleSave: (listing: PublicListing) => Promise<void>;
}

const SavedListingsContext = createContext<SavedListingsValue | null>(null);

export function SavedListingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setSavedIds(new Set());
      return;
    }
    let active = true;
    setLoading(true);
    getSavedListingIds(user.uid)
      .then(ids => { if (active) setSavedIds(new Set(ids)); })
      .catch(() => { if (active) setSavedIds(new Set()); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  const isSaved = useCallback((id: string) => savedIds.has(id), [savedIds]);

  const toggleSave = useCallback(async (listing: PublicListing) => {
    if (!user) return;
    const id = listing.id;
    const wasSaved = savedIds.has(id);
    // Optimistic update.
    setSavedIds(prev => {
      const next = new Set(prev);
      if (wasSaved) next.delete(id); else next.add(id);
      return next;
    });
    try {
      if (wasSaved) await unsaveListing(user.uid, id);
      else await saveListing(user.uid, listing);
    } catch {
      // Roll back on failure.
      setSavedIds(prev => {
        const next = new Set(prev);
        if (wasSaved) next.add(id); else next.delete(id);
        return next;
      });
    }
  }, [user, savedIds]);

  return (
    <SavedListingsContext.Provider value={{ savedIds, loading, isSaved, toggleSave }}>
      {children}
    </SavedListingsContext.Provider>
  );
}

export function useSavedListings(): SavedListingsValue {
  const ctx = useContext(SavedListingsContext);
  if (!ctx) throw new Error('useSavedListings must be used within a SavedListingsProvider');
  return ctx;
}
