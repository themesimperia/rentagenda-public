'use client';

import { useEffect, useMemo, useState } from 'react';
import { SearchX, PanelLeftOpen } from 'lucide-react';
import { FilterSidebar } from '@/components/FilterSidebar';
import { FilterBar } from '@/components/FilterBar';
import { ListingCard } from '@/components/ListingCard';
import { DetailPanel } from '@/components/DetailPanel';
import { BrowseTopBar, type SortBy, type ViewMode } from '@/components/BrowseTopBar';
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
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [filterBarOpen, setFilterBarOpen] = useState(false);

  const locations = useMemo(() => deriveLocations(listings), [listings]);
  const types = useMemo(() => deriveTypes(listings), [listings]);
  const amenities = useMemo(() => deriveAmenities(listings), [listings]);

  const filtered = useMemo(
    () => sortListings(applyFilters(listings, filters), sortBy),
    [listings, filters, sortBy],
  );

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, sortBy]);

  const visible = filtered.slice(0, visibleCount);
  const selected = filtered.find(l => l.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="px-4 py-6 sm:px-6">
        <div className="flex items-start gap-6">

          {/* ── Left sidebar (desktop, slides in/out) ────────────── */}
          <div
            className="hidden lg:block shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
            style={{ width: sidebarOpen ? 260 : 0 }}
          >
            {/* Inner div keeps its width during the animation */}
            <div className="w-[260px]">
              <div className="sticky top-20">
                <FilterSidebar
                  filters={filters}
                  onChange={setFilters}
                  locations={locations}
                  types={types}
                  amenities={amenities}
                  onCollapse={() => setSidebarOpen(false)}
                />
              </div>
            </div>
          </div>

          {/* ── Main area (listings + detail panel) ──────────────── */}
          <div className="flex min-w-0 flex-1 flex-col gap-6 xl:flex-row xl:items-start">

            {/* Listings column */}
            <div className="min-w-0 flex-1 space-y-4">
              <div className="flex items-center gap-3">
                {/* Reopen sidebar button — visible only when sidebar is collapsed */}
                {!sidebarOpen && (
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Show filters sidebar"
                    className="hidden lg:flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
                  >
                    <PanelLeftOpen className="h-4 w-4" />
                    Filters
                  </button>
                )}
                <h1 className="text-xl font-bold text-slate-900">Browse properties</h1>
              </div>

              {/* Collapsible horizontal filter bar */}
              {filterBarOpen && (
                <FilterBar
                  value={filters}
                  onApply={setFilters}
                  types={types}
                  amenities={amenities}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
              )}

              {/* Results row */}
              <BrowseTopBar
                filters={filters}
                onFiltersChange={setFilters}
                onFiltersOpen={() => setFilterBarOpen(o => !o)}
                filterBarOpen={filterBarOpen}
                resultCount={filtered.length}
                loading={false}
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
                <div className="space-y-3">
                  {visible.map(listing => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      layout="list"
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

            {/* ── Detail panel ───────────────────────────────────── */}
            <aside className="xl:w-[420px] xl:shrink-0 xl:sticky xl:top-20 xl:self-start">
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
    </div>
  );
}
