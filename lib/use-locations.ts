'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Module-level cache so the locations are fetched only once per browser session,
// no matter how many components (e.g. the header on every page) request them.
let cachedLocations: string[] | null = null;
let inFlight: Promise<string[]> | null = null;

async function fetchLocations(): Promise<string[]> {
  if (cachedLocations) return cachedLocations;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const snap = await getDocs(
      query(collection(db, 'public_listings'), where('status', '==', 'published')),
    );
    const set = new Set<string>();
    for (const d of snap.docs) {
      const loc = (d.data().address_public as string | undefined)?.trim();
      if (loc) set.add(loc);
    }
    cachedLocations = [...set].sort();
    inFlight = null;
    return cachedLocations;
  })();

  return inFlight;
}

/** Distinct published-listing locations for search autocomplete. Cached per session. */
export function useLocations(): string[] {
  const [locations, setLocations] = useState<string[]>(cachedLocations ?? []);

  useEffect(() => {
    if (cachedLocations) {
      setLocations(cachedLocations);
      return;
    }
    let active = true;
    fetchLocations().then(locs => { if (active) setLocations(locs); });
    return () => { active = false; };
  }, []);

  return locations;
}
