'use client';

import { useEffect, useState } from 'react';
import { Search, Bookmark } from 'lucide-react';
import { FilterPopover } from '@/components/ui/FilterPopover';
import { propertyTypeLabel, termLabel } from '@/lib/format';
import { summarizeFilters } from '@/lib/saved-searches';
import { saveSearch } from '@/lib/firestore';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import type { MarketplaceFilters } from '@/lib/filter';
import type { SortBy } from '@/components/BrowseTopBar';
import type { PropertyType, RentalTerm } from '@/lib/types';

const TERMS: RentalTerm[] = ['long_term', 'short_term'];

const BEDS: { label: string; value: number | null }[] = [
  { label: 'Any', value: null },
  { label: 'Studio', value: 0 },
  { label: '1+', value: 1 },
  { label: '2+', value: 2 },
  { label: '3+', value: 3 },
  { label: '4+', value: 4 },
];

const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Under $1,000', min: null, max: 1000 },
  { label: '$1,000 – $2,000', min: 1000, max: 2000 },
  { label: '$2,000 – $3,500', min: 2000, max: 3500 },
  { label: 'Over $3,500', min: 3500, max: null },
];

const AVAILABILITY_OPTIONS: { label: string; value: number | null }[] = [
  { label: 'Any time', value: null },
  { label: 'Available now', value: 0 },
  { label: 'Within 30 days', value: 30 },
  { label: 'Within 60 days', value: 60 },
  { label: 'Within 90 days', value: 90 },
];

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

interface FilterBarProps {
  value: MarketplaceFilters;
  onApply: (f: MarketplaceFilters) => void;
  types: PropertyType[];
  amenities: string[];
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
}

export function FilterBar({ value, onApply, types, amenities, sortBy, onSortChange }: FilterBarProps) {
  const [draft, setDraft] = useState<MarketplaceFilters>(value);
  // Re-seed the draft whenever the committed filters change so the bar reflects
  // live sidebar edits. Trade-off: editing the sidebar mid-edit discards any
  // un-applied bar changes (the live sidebar is the source of truth).
  useEffect(() => { setDraft(value); }, [value]);

  const { user } = useAuth();
  const { openAuth } = useAuthModal();
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(close: () => void) {
    if (!user) { openAuth('signin'); close(); return; }
    setSaving(true);
    try {
      // Apply the draft too, so the saved search matches the visible results.
      onApply(draft);
      await saveSearch(user.uid, name.trim() || summarizeFilters(draft), draft);
      setSaved(true);
      setName('');
      setTimeout(() => { setSaved(false); close(); }, 900);
    } finally {
      setSaving(false);
    }
  }

  function set<K extends keyof MarketplaceFilters>(key: K, v: MarketplaceFilters[K]) {
    setDraft(d => ({ ...d, [key]: v }));
  }

  // Labels stay fixed (the filter's name) so selecting a value never widens a
  // button and pushes the row to wrap. Selection is shown via the active
  // highlight + count badges instead.
  const termValue: RentalTerm | 'all' = draft.terms.length === 1 ? draft.terms[0] : 'all';
  const priceActive = draft.priceMin != null || draft.priceMax != null;
  const sizeCount = (draft.sizeMin != null ? 1 : 0) + (draft.sizeMax != null ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
      {/* Rent (term) */}
      <FilterPopover label="Rent" active={draft.terms.length > 0}>
        {close => (
          <>
            <button
              type="button"
              onClick={() => { set('terms', []); close(); }}
              className={`flex w-full px-4 py-2 text-sm hover:bg-slate-50 ${draft.terms.length === 0 ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
            >
              All
            </button>
            {TERMS.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => { set('terms', [t]); close(); }}
                className={`flex w-full px-4 py-2 text-sm hover:bg-slate-50 ${termValue === t ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
              >
                {termLabel(t)}
              </button>
            ))}
          </>
        )}
      </FilterPopover>

      {/* Search by location */}
      <div className="relative min-w-[180px] flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={draft.search}
          onChange={e => set('search', e.target.value)}
          placeholder="Search by location"
          aria-label="Search by location"
          className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Beds */}
      <FilterPopover label="Beds" active={draft.bedroomsMin != null}>
        {close =>
          BEDS.map(b => (
            <button
              key={b.label}
              type="button"
              onClick={() => { set('bedroomsMin', b.value); close(); }}
              className={`flex w-full px-4 py-2 text-sm hover:bg-slate-50 ${draft.bedroomsMin === b.value ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
            >
              {b.label}
            </button>
          ))
        }
      </FilterPopover>

      {/* Property type */}
      <FilterPopover label="Property Type" active={draft.types.length > 0}>
        {() => (
          <div className="px-2 py-1">
            {types.map(t => (
              <label key={t} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={draft.types.includes(t)}
                  onChange={() => set('types', toggle(draft.types, t))}
                  className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                />
                {propertyTypeLabel(t)}
              </label>
            ))}
          </div>
        )}
      </FilterPopover>

      {/* Price */}
      <FilterPopover label="Price" active={priceActive}>
        {close => (
          <div className="w-60 px-2 py-1">
            {PRICE_PRESETS.map(p => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setDraft(d => ({ ...d, priceMin: p.min, priceMax: p.max })); close(); }}
                className={`flex w-full px-2 py-1.5 text-sm hover:bg-slate-50 ${draft.priceMin === p.min && draft.priceMax === p.max ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
              >
                {p.label}
              </button>
            ))}
            <div className="my-2 border-t border-dashed border-slate-200" />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={draft.priceMin ?? ''}
                onChange={e => set('priceMin', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <span className="text-slate-300">—</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={draft.priceMax ?? ''}
                onChange={e => set('priceMax', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </FilterPopover>

      {/* Availability — occupancy window filter + soonest-available sort */}
      <FilterPopover
        label="Availability"
        active={draft.availabilityWithin != null || sortBy === 'available_soon'}
      >
        {close => (
          <div className="w-56">
            <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Show</p>
            {AVAILABILITY_OPTIONS.map(o => (
              <button
                key={o.label}
                type="button"
                onClick={() => {
                  // Apply immediately so the single-select takes effect without "Apply".
                  const next = { ...draft, availabilityWithin: o.value };
                  setDraft(next);
                  onApply(next);
                  close();
                }}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-slate-50 ${draft.availabilityWithin === o.value ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
              >
                {o.label}
                {draft.availabilityWithin === o.value && <span className="h-2 w-2 rounded-full bg-blue-600" />}
              </button>
            ))}
            <div className="my-1 border-t border-slate-100" />
            <p className="px-3 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sort</p>
            <button
              type="button"
              onClick={() => {
                onSortChange(sortBy === 'available_soon' ? 'relevant' : 'available_soon');
                close();
              }}
              className={`flex w-full items-center justify-between px-4 py-2 text-sm hover:bg-slate-50 ${sortBy === 'available_soon' ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
            >
              Available soonest first
              {sortBy === 'available_soon' && <span className="h-2 w-2 rounded-full bg-blue-600" />}
            </button>
          </div>
        )}
      </FilterPopover>

      {/* Features (amenities) */}
      <FilterPopover label="Features" active={draft.amenities.length > 0}>
        {() => (
          <div className="max-h-64 w-56 overflow-y-auto px-2 py-1">
            {amenities.length === 0 ? (
              <p className="px-2 py-1.5 text-sm text-slate-400">No features</p>
            ) : (
              amenities.map(a => (
                <label key={a} className="flex cursor-pointer items-center gap-2 px-2 py-1.5 text-sm capitalize text-slate-700">
                  <input
                    type="checkbox"
                    checked={draft.amenities.includes(a)}
                    onChange={() => set('amenities', toggle(draft.amenities, a))}
                    className="h-4 w-4 rounded border-slate-300 accent-blue-600"
                  />
                  {a.replace(/_/g, ' ')}
                </label>
              ))
            )}
          </div>
        )}
      </FilterPopover>

      {/* More (size) */}
      <FilterPopover label="More" active={sizeCount > 0}>
        {() => (
          <div className="w-56 px-3 py-2">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Size (m²)</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                placeholder="Min"
                value={draft.sizeMin ?? ''}
                onChange={e => set('sizeMin', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
              <span className="text-slate-300">—</span>
              <input
                type="number"
                min={0}
                placeholder="Max"
                value={draft.sizeMax ?? ''}
                onChange={e => set('sizeMax', e.target.value ? Number(e.target.value) : null)}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
              />
            </div>
          </div>
        )}
      </FilterPopover>

      {/* Apply */}
      <button
        type="button"
        onClick={() => onApply(draft)}
        className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
      >
        Apply
      </button>

      {/* Save Search */}
      <FilterPopover label="Save Search">
        {close => (
          <div className="w-64 px-3 py-2">
            {!user ? (
              <button
                type="button"
                onClick={() => { openAuth('signin'); close(); }}
                className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Sign in to save searches
              </button>
            ) : saved ? (
              <p className="px-1 py-2 text-sm font-medium text-emerald-600">Saved ✓</p>
            ) : (
              <>
                <p className="mb-2 text-xs text-slate-500">{summarizeFilters(draft)}</p>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Name this search"
                  aria-label="Saved search name"
                  className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSave(close)}
                  disabled={saving}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  <Bookmark className="h-3.5 w-3.5" /> Save search
                </button>
              </>
            )}
          </div>
        )}
      </FilterPopover>
    </div>
  );
}
