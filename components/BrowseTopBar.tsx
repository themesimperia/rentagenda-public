'use client';

import { useState } from 'react';
import { X, LayoutGrid, List } from 'lucide-react';
import { FilterPopover } from '@/components/ui/FilterPopover';
import { type MarketplaceFilters, EMPTY_FILTERS, isFiltered } from '@/lib/filter';

export type SortBy = 'relevant' | 'newest' | 'price_asc' | 'price_desc' | 'available_soon';
export type ViewMode = 'grid' | 'list';

const BEDS_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

const SORT_OPTIONS: { label: string; value: SortBy }[] = [
  { label: 'Relevant', value: 'relevant' },
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low – High', value: 'price_asc' },
  { label: 'Price: High – Low', value: 'price_desc' },
  { label: 'Available Soonest', value: 'available_soon' },
];


interface BrowseTopBarProps {
  filters: MarketplaceFilters;
  onFiltersChange: (f: MarketplaceFilters) => void;
  resultCount: number;
  loading: boolean;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
  cols: 2 | 3;
  onColsChange: (c: 2 | 3) => void;
}

export function BrowseTopBar({
  filters,
  onFiltersChange,
  resultCount,
  loading,
  sortBy,
  onSortChange,
  view,
  onViewChange,
  cols,
  onColsChange,
}: BrowseTopBarProps) {
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort by';
  const bedsLabel =
    filters.bedroomsMin != null ? `${filters.bedroomsMin}+ Bedrooms` : 'Bedrooms';

  function removeLocation(loc: string) {
    onFiltersChange({
      ...filters,
      locations: filters.locations.filter(l => l !== loc),
    });
  }

  return (
    <div className="space-y-3">
      {/* ── Top row ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Active location chips */}
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

        {/* Beds & Bath */}
        <FilterPopover label={bedsLabel} active={filters.bedroomsMin != null}>
          {close => (
            <>
              {BEDS_OPTIONS.map(opt => (
                <button
                  key={opt.label}
                  type="button"
                  onClick={() => {
                    onFiltersChange({ ...filters, bedroomsMin: opt.value });
                    close();
                  }}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                    filters.bedroomsMin === opt.value ? 'font-semibold text-blue-600' : 'text-slate-700'
                  }`}
                >
                  {opt.label}
                  {filters.bedroomsMin === opt.value && (
                    <span className="h-2 w-2 rounded-full bg-blue-600" />
                  )}
                </button>
              ))}
            </>
          )}
        </FilterPopover>

        {/* Clear all — only shown when filters are active */}
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

        {/* Spacer */}
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
        </div>
      </div>

      {/* ── Results + sort row ──────────────────────────────────── */}
      <div className="flex items-center gap-2 text-sm text-slate-500">
        {!loading && (
          <span>
            <strong className="text-slate-800">{resultCount}</strong>{' '}
            {resultCount === 1 ? 'property' : 'properties'} found
          </span>
        )}
        <span className="text-slate-300">·</span>
        <span>Sort by</span>
        <FilterPopover label={sortLabel}>
          {close =>
            SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onSortChange(opt.value); close(); }}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                  sortBy === opt.value ? 'font-semibold text-blue-600' : 'text-slate-700'
                }`}
              >
                {opt.label}
                {sortBy === opt.value && <span className="h-2 w-2 rounded-full bg-blue-600" />}
              </button>
            ))
          }
        </FilterPopover>
      </div>
    </div>
  );
}
