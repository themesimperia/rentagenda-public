'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchX } from 'lucide-react';
import { FilterSidebar } from '@/components/FilterSidebar';
import { ListingCard } from '@/components/ListingCard';
import { DetailPanel } from '@/components/DetailPanel';
import { BrowseTopBar, type SortBy, type ViewMode } from '@/components/BrowseTopBar';
import { FilterBar } from '@/components/FilterBar';
import {
  type MarketplaceFilters,
  EMPTY_FILTERS,
  applyFilters,
  deriveLocations,
  deriveTypes,
  deriveAmenities,
} from '@/lib/filter';
import { availability } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

const PAGE_SIZE = 9;

/** Sort key: available now = 0, frees up in N days = N, occupied/unknown = last. */
function availabilityRank(l: PublicListing): number {
  const a = availability(l);
  if (a.available) return 0;
  if (a.freeDate != null) return a.daysLeft;
  return Number.POSITIVE_INFINITY;
}

function sortListings(listings: PublicListing[], sortBy: SortBy): PublicListing[] {
  const arr = [...listings];
  if (sortBy === 'newest') {
    arr.sort((a, b) => (b.published_at ?? 0) - (a.published_at ?? 0));
  } else if (sortBy === 'price_asc') {
    arr.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
  } else if (sortBy === 'price_desc') {
    arr.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
  } else if (sortBy === 'available_soon') {
    arr.sort((a, b) => availabilityRank(a) - availabilityRank(b));
  }
  return arr;
}

export function MarketplaceDashboard({
  initialListings,
  initialFilters,
}: {
  initialListings: PublicListing[];
  initialFilters?: Partial<MarketplaceFilters>;
}) {
  const listings = initialListings;
  const [filters, setFilters] = useState<MarketplaceFilters>({
    ...EMPTY_FILTERS,
    ...initialFilters,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>('relevant');
  const [view, setView] = useState<ViewMode>('grid');
  const [cols, setCols] = useState<2 | 3>(2);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const locations = useMemo(() => deriveLocations(listings), [listings]);
  const types = useMemo(() => deriveTypes(listings), [listings]);
  const amenities = useMemo(() => deriveAmenities(listings), [listings]);

  const filtered = useMemo(
    () => sortListings(applyFilters(listings, filters), sortBy),
    [listings, filters, sortBy],
  );

  // Reset to the first page whenever the result set changes.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, sortBy]);

  const visible = filtered.slice(0, visibleCount);

  const selected =
    filtered.find(l => l.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-[260px_1fr_420px]">

          {/* ── Sidebar filters ──────────────────────────────────── */}
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              locations={locations}
              types={types}
              amenities={amenities}
            />
          </aside>

          {/* ── Listing area ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Page title */}
            <h1 className="text-xl font-bold text-slate-900">Browse properties</h1>

            {/* Horizontal filter bar (deferred — commits on Apply) */}
            <FilterBar
              value={filters}
              onApply={setFilters}
              types={types}
              amenities={amenities}
            />

            {/* Top filter bar */}
            <BrowseTopBar
              filters={filters}
              onFiltersChange={setFilters}
              resultCount={filtered.length}
              loading={false}
              sortBy={sortBy}
              onSortChange={setSortBy}
              view={view}
              onViewChange={setView}
              cols={cols}
              onColsChange={setCols}
            />

            {/* Grid / list */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
                <SearchX className="mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-700">No properties match your filters</p>
                <button
                  type="button"
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="mt-2 text-sm font-medium text-blue-600 hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : view === 'grid' ? (
              <div
                className={`grid grid-cols-1 gap-5 ${
                  cols === 3 ? 'sm:grid-cols-2 xl:grid-cols-3' : 'sm:grid-cols-2'
                }`}
              >
                {visible.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    selected={selected?.id === listing.id}
                    onSelect={l => setSelectedId(l.id)}
                  />
                ))}
              </div>
            ) : (
              /* List view — single column with more info */
              <div className="space-y-3">
                {visible.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    selected={selected?.id === listing.id}
                    onSelect={l => setSelectedId(l.id)}
                  />
                ))}
              </div>
            )}

            {filtered.length > visibleCount && (
              <div className="flex flex-col items-center gap-3 pt-2">
                <p className="text-sm text-slate-500">
                  Showing {visible.length} of {filtered.length} properties
                </p>
                <button
                  type="button"
                  onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                  className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Load more
                </button>
              </div>
            )}
          </div>

          {/* ── Detail panel ─────────────────────────────────────── */}
          <aside className="lg:col-span-2 xl:col-span-1 xl:sticky xl:top-20 xl:self-start">
            {selected ? (
              <DetailPanel listing={selected} permalink={`/listing/${selected.id}`} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center text-sm text-slate-400">
                Select a property to see details
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
