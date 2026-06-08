'use client';

import { useEffect, useRef, useState } from 'react';
import { X, ChevronDown, LayoutGrid, List } from 'lucide-react';
import { type MarketplaceFilters, EMPTY_FILTERS } from '@/lib/filter';

export type SortBy = 'relevant' | 'newest' | 'price_asc' | 'price_desc';
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
];

function Dropdown({
  label,
  active,
  children,
}: {
  label: string;
  active?: boolean;
  children: (close: () => void) => React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
          active
            ? 'border-blue-600 bg-blue-50 text-blue-700'
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
        }`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-30 mt-1.5 min-w-[180px] overflow-hidden rounded-xl border border-slate-100 bg-white py-1.5 shadow-lg">
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

interface BrowseTopBarProps {
  filters: MarketplaceFilters;
  onFiltersChange: (f: MarketplaceFilters) => void;
  resultCount: number;
  loading: boolean;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  view: ViewMode;
  onViewChange: (v: ViewMode) => void;
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
}: BrowseTopBarProps) {
  const sortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label ?? 'Sort by';
  const bedsLabel =
    filters.bedroomsMin != null ? `${filters.bedroomsMin}+ Beds` : 'Beds & Bath';

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
        <Dropdown label={bedsLabel} active={filters.bedroomsMin != null}>
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
        </Dropdown>

        {/* More Filters — clears everything back to sidebar */}
        <button
          type="button"
          onClick={() => onFiltersChange(EMPTY_FILTERS)}
          className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50"
        >
          More Filters
          <ChevronDown className="h-4 w-4" />
        </button>

        {/* Spacer */}
        <div className="flex-1" />

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
        <Dropdown label={sortLabel}>
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
        </Dropdown>
      </div>
    </div>
  );
}
