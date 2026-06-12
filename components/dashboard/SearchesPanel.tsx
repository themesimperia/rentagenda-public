'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Play, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSavedSearches, deleteSavedSearch } from '@/lib/firestore';
import { summarizeFilters } from '@/lib/saved-searches';
import { filtersToParams } from '@/lib/filter-url';
import type { SavedSearch } from '@/lib/saved-searches';

export function SearchesPanel() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const s = await getSavedSearches(user.uid).catch(() => []);
      if (active) { setSearches(s); setLoading(false); }
    })();
    return () => { active = false; };
  }, [user]);

  async function remove(id: string) {
    if (!user) return;
    setSearches(prev => prev.filter(s => s.id !== id));
    await deleteSavedSearch(user.uid, id).catch(() => {});
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (searches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <SlidersHorizontal className="mb-3 h-10 w-10 text-slate-300" />
        <p className="font-medium text-slate-700">No saved searches yet</p>
        <Link href="/listings" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
          Browse properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {searches.map(s => (
        <div
          key={s.id}
          className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
        >
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-900">{s.name}</p>
            <p className="truncate text-sm text-slate-500">{summarizeFilters(s.filters)}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href={`/listings?${filtersToParams(s.filters).toString()}`}
              className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Play className="h-3.5 w-3.5" /> Run
            </Link>
            <button
              type="button"
              onClick={() => remove(s.id)}
              aria-label="Delete saved search"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
