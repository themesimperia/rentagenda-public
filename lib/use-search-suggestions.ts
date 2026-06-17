'use client';

import { useEffect, useMemo, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

export type SuggestionKind = 'location' | 'listing';

export interface Suggestion {
  /** Text to search / display. */
  label: string;
  kind: SuggestionKind;
}

interface SearchIndex {
  locations: string[];
  titles: string[];
}

// Module-level cache so the index is fetched only once per browser session,
// no matter how many components (e.g. the header on every page) request it.
let cachedIndex: SearchIndex | null = null;
let inFlight: Promise<SearchIndex> | null = null;

async function fetchIndex(): Promise<SearchIndex> {
  if (cachedIndex) return cachedIndex;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const snap = await getDocs(
      query(collection(db, 'public_listings'), where('status', '==', 'published')),
    );
    const locations = new Set<string>();
    const titles = new Set<string>();
    for (const d of snap.docs) {
      const data = d.data();
      const loc = (data.address_public as string | undefined)?.trim();
      const title = (data.title as string | undefined)?.trim();
      if (loc) locations.add(loc);
      if (title) titles.add(title);
    }
    cachedIndex = {
      locations: [...locations].sort(),
      titles: [...titles].sort(),
    };
    inFlight = null;
    return cachedIndex;
  })();

  return inFlight;
}

/**
 * Returns search suggestions for a query, drawn from both listing locations
 * (streets/cities) and listing names (titles). Locations are listed first.
 * The underlying index is fetched once per session and cached.
 */
export function useSearchSuggestions(searchText: string, limit = 8): Suggestion[] {
  const [index, setIndex] = useState<SearchIndex>(cachedIndex ?? { locations: [], titles: [] });

  useEffect(() => {
    if (cachedIndex) {
      setIndex(cachedIndex);
      return;
    }
    let active = true;
    fetchIndex().then(idx => { if (active) setIndex(idx); });
    return () => { active = false; };
  }, []);

  return useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];

    const locs: Suggestion[] = index.locations
      .filter(l => l.toLowerCase().includes(q))
      .map(label => ({ label, kind: 'location' as const }));

    const names: Suggestion[] = index.titles
      .filter(t => t.toLowerCase().includes(q))
      .map(label => ({ label, kind: 'listing' as const }));

    // De-dupe in case a title equals a location string.
    const seen = new Set<string>();
    const merged: Suggestion[] = [];
    for (const s of [...locs, ...names]) {
      const key = `${s.kind}:${s.label.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);
      merged.push(s);
    }
    return merged.slice(0, limit);
  }, [searchText, index, limit]);
}
