'use client';

import { X, LayoutGrid, List, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import { type MarketplaceFilters, EMPTY_FILTERS, isFiltered, countActiveFilters } from '@/lib/filter';

export type SortBy = 'relevant' | 'newest' | 'price_asc' | 'price_desc' | 'available_soon';
export type ViewMode = 'grid' | 'list' | 'map';

interface BrowseTopBarProps {
  filters: MarketplaceFilters;
  onFiltersChange: (f: MarketplaceFilters) => void;
  onFiltersOpen: () => void;
  filterBarOpen: boolean;
  resultCount: number;
  loading: boolean;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  cols: 2 | 3;
  onColsChange: (c: 2 | 3) => void;
}

export function BrowseTopBar({
  filters,
  onFiltersChange,
  onFiltersOpen,
  filterBarOpen,
  resultCount,
  loading,
  view,
  onViewChange,
  cols,
  onColsChange,
}: BrowseTopBarProps) {
  const activeCount = countActiveFilters(filters);
  function removeLocation(loc: string) {
    onFiltersChange({
      ...filters,
      locations: filters.locations.filter(l => l !== loc),
    });
  }

  const hasChipsRow = filters.locations.length > 0 || isFiltered(filters);

  return (
    <div className="space-y-3">
      {/* ── Active location chips + clear all ───────────────────── */}
      {hasChipsRow && (
        <div className="flex flex-wrap items-center gap-2">
          {filters.locations.map(loc => (
            <span
              key={loc}
              className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700"
            >
              {loc}
              <button
                type="button"
                onClick={() => removeLocation(loc)}
                aria-label={`Remove ${loc}`}
                className="ml-0.5 rounded-full text-blue-400 hover:text-blue-700"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {isFiltered(filters) && (
            <button
              type="button"
              onClick={() => onFiltersChange(EMPTY_FILTERS)}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              Clear all filters
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* ── Filters button + results count (left) + view controls (right) ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Filters button — blue when panel is open OR filters active */}
        <button
          type="button"
          onClick={onFiltersOpen}
          aria-expanded={filterBarOpen}
          className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            filterBarOpen || activeCount > 0
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {!loading && (
          <div className="text-sm text-slate-500">
            <strong className="text-slate-800">{resultCount}</strong>{' '}
            {resultCount === 1 ? 'property' : 'properties'} found
          </div>
        )}

        <div className="flex-1" />

        {/* Column count (grid view only) */}
        {view === 'grid' && (
          <div className="hidden items-center gap-1 rounded-full border border-slate-200 bg-white p-1 sm:flex">
            {([2, 3] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => onColsChange(c)}
                aria-label={`${c} columns`}
                className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors ${
                  cols === c ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1">
          <button
            type="button"
            onClick={() => onViewChange('list')}
            aria-label="List view"
            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
              view === 'list' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('grid')}
            aria-label="Grid view"
            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
              view === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewChange('map')}
            aria-label="Map view"
            className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${
              view === 'map' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            <MapIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
