'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bookmark, Search, Play } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getSavedSearches } from '@/lib/firestore';
import { summarizeFilters } from '@/lib/saved-searches';
import { filtersToParams } from '@/lib/filter-url';
import type { SavedSearch } from '@/lib/saved-searches';

export function SavedSearchesMini() {
  const { user } = useAuth();
  const [searches, setSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getSavedSearches(user.uid)
      .then(s => { if (active) setSearches(s); })
      .catch(() => { if (active) setSearches([]); });
    return () => { active = false; };
  }, [user]);

  const shown = searches.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Saved searches</h3>
          {searches.length > 4 && (
            <Link href="/dashboard/searches" className="text-sm font-medium text-blue-600 hover:underline">
              View all →
            </Link>
          )}
        </div>
        {shown.length === 0 ? (
          <p className="text-sm text-slate-500">No saved searches yet.</p>
        ) : (
          <ul className="space-y-2">
            {shown.map(s => (
              <li key={s.id}>
                <Link
                  href={`/listings?${filtersToParams(s.filters).toString()}`}
                  className="flex items-center justify-between gap-2 rounded-lg px-2 py-2 hover:bg-slate-50"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {s.name || summarizeFilters(s.filters)}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {summarizeFilters(s.filters)}
                    </span>
                  </span>
                  <Play className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick links</h3>
        <div className="space-y-2">
          <Link
            href="/dashboard/saved"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Bookmark className="h-4 w-4 text-slate-400" /> Saved listings
          </Link>
          <Link
            href="/listings"
            className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            <Search className="h-4 w-4 text-slate-400" /> Browse properties
          </Link>
        </div>
      </div>
    </div>
  );
}
