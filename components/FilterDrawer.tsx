'use client';

import { useState } from 'react';
import { X, SlidersHorizontal, Search, Bed, Bookmark } from 'lucide-react';
import { FilterSidebar } from '@/components/FilterSidebar';
import { EMPTY_FILTERS, countActiveFilters } from '@/lib/filter';
import { summarizeFilters } from '@/lib/saved-searches';
import { saveSearch } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import type { MarketplaceFilters } from '@/lib/filter';
import type { PropertyType } from '@/lib/types';
import type { SortBy } from '@/components/BrowseTopBar';

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: 'relevant', label: 'Most relevant' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'available_soon', label: 'Available soonest' },
];

const BEDS_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: 'Studio', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-4">
      <p className="mb-3 text-sm font-semibold text-slate-700">{title}</p>
      {children}
    </div>
  );
}

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  filters: MarketplaceFilters;
  onChange: (f: MarketplaceFilters) => void;
  locations: string[];
  types: PropertyType[];
  amenities: string[];
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  resultCount: number;
}

export function FilterDrawer({
  open,
  onClose,
  filters,
  onChange,
  locations,
  types,
  amenities,
  sortBy,
  onSortChange,
  resultCount,
}: FilterDrawerProps) {
  const activeCount = countActiveFilters(filters);
  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const [searchName, setSearchName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSaveSearch() {
    if (!user) { openAuth('signin'); return; }
    setSaving(true);
    try {
      await saveSearch(user.uid, searchName.trim() || summarizeFilters(filters), filters);
      setSaved(true);
      setSearchName('');
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-5 w-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Filters</h2>
            {activeCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
                {activeCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {activeCount > 0 && (
              <button
                type="button"
                onClick={() => onChange(EMPTY_FILTERS)}
                className="text-xs font-semibold text-blue-600 hover:underline"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close filters"
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="min-h-0 flex-1 overflow-y-auto">

          {/* Sort by */}
          <DrawerSection title="Sort by">
            <div className="space-y-2.5">
              {SORT_OPTIONS.map(opt => (
                <label key={opt.value} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                  <input
                    type="radio"
                    name="drawer-sort"
                    checked={sortBy === opt.value}
                    onChange={() => onSortChange(opt.value)}
                    className="h-4 w-4 border-slate-300 accent-blue-600"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </DrawerSection>

          {/* Keyword search */}
          <DrawerSection title="Search">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={filters.search}
                onChange={e => set('search', e.target.value)}
                placeholder="Keyword, location, description…"
                aria-label="Search properties"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </DrawerSection>

          {/* Bedrooms */}
          <DrawerSection title="Bedrooms">
            <div className="flex flex-wrap gap-2">
              {BEDS_OPTIONS.map(b => (
                <button
                  key={b.label}
                  type="button"
                  onClick={() => set('bedroomsMin', b.value)}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    filters.bedroomsMin === b.value
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </DrawerSection>

          {/* All other filter sections (Location, Price, Size, Type, Term, Availability, Amenities) */}
          <FilterSidebar
            bare
            filters={filters}
            onChange={onChange}
            locations={locations}
            types={types}
            amenities={amenities}
          />

          {/* Save Search */}
          <div className="border-b border-slate-100 px-4 py-4">
            <p className="mb-3 text-sm font-semibold text-slate-700">Save this search</p>
            {saved ? (
              <p className="text-sm font-medium text-emerald-600">Saved ✓</p>
            ) : (
              <>
                <p className="mb-2 text-xs text-slate-400">{summarizeFilters(filters)}</p>
                <input
                  value={searchName}
                  onChange={e => setSearchName(e.target.value)}
                  placeholder="Name this search (optional)"
                  aria-label="Saved search name"
                  className="mb-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm focus:border-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSaveSearch}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-60"
                >
                  <Bookmark className="h-3.5 w-3.5" />
                  Save search
                </button>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Show {resultCount} {resultCount === 1 ? 'property' : 'properties'}
          </button>
        </div>
      </div>
    </>
  );
}
