'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useSavedListingsData } from '@/lib/use-saved-listings-data';
import { computeKpis } from '@/lib/dashboard-metrics';
import { getSavedSearches } from '@/lib/firestore';
import { RingStat } from '@/components/dashboard/profile/RingStat';

export function ActivityStats() {
  const { user } = useAuth();
  const { rows, loading } = useSavedListingsData();
  const [searchesCount, setSearchesCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    let active = true;
    getSavedSearches(user.uid)
      .then(s => { if (active) setSearchesCount(s.length); })
      .catch(() => { if (active) setSearchesCount(0); });
    return () => { active = false; };
  }, [user]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  const kpis = computeKpis(rows);
  // Each ring fills relative to the largest metric (honest relative magnitude).
  // Summing would double-count: availableNow is a subset of savedCount.
  const total = Math.max(kpis.savedCount, searchesCount, kpis.availableNow, 1);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <RingStat label="Saved listings" value={kpis.savedCount} total={total} tone="emerald" />
      <RingStat label="Saved searches" value={searchesCount} total={total} tone="blue" />
      <RingStat label="Available now" value={kpis.availableNow} total={total} tone="amber" />
    </div>
  );
}
