'use client';

import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { FilterPopover } from '@/components/ui/FilterPopover';
import { propertyTypeLabel, termLabel } from '@/lib/format';
import type { MarketplaceFilters } from '@/lib/filter';
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

function toggle<T>(arr: T[], v: T): T[] {
  return arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v];
}

interface FilterBarProps {
  value: MarketplaceFilters;
  onApply: (f: MarketplaceFilters) => void;
  locations: string[];
  types: PropertyType[];
  amenities: string[];
}

export function FilterBar({ value, onApply, types, amenities }: FilterBarProps) {
  const [draft, setDraft] = useState<MarketplaceFilters>(value);
  useEffect(() => { setDraft(value); }, [value]);

  function set<K extends keyof MarketplaceFilters>(key: K, v: MarketplaceFilters[K]) {
    setDraft(d => ({ ...d, [key]: v }));
  }

  const termValue: RentalTerm | 'all' = draft.terms.length === 1 ? draft.terms[0] : 'all';
  const bedsLabel =
    draft.bedroomsMin == null
      ? 'Beds'
      : draft.bedroomsMin === 0
        ? 'Studio'
        : `${draft.bedroomsMin}+ Beds`;
  const typeLabel = draft.types.length ? `Type · ${draft.types.length}` : 'Property Type';
  const priceActive = draft.priceMin != null || draft.priceMax != null;
  const priceLabel = priceActive
    ? `$${draft.priceMin ?? 0} – ${draft.priceMax != null ? `$${draft.priceMax}` : 'Any'}`
    : 'Price';
  const sizeCount = (draft.sizeMin != null ? 1 : 0) + (draft.sizeMax != null ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2 overflow-x-auto rounded-2xl border border-slate-100 bg-white p-2 shadow-sm">
      {/* Rent (term) */}
      <FilterPopover label={termValue === 'all' ? 'Rent' : termLabel(termValue)} active={draft.terms.length > 0}>
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
      <FilterPopover label={bedsLabel} active={draft.bedroomsMin != null}>
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
      <FilterPopover label={typeLabel} active={draft.types.length > 0}>
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
      <FilterPopover label={priceLabel} active={priceActive}>
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

      {/* Features (amenities) */}
      <FilterPopover label="Features" active={draft.amenities.length > 0} count={draft.amenities.length}>
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
      <FilterPopover label="More" active={sizeCount > 0} count={sizeCount}>
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
    </div>
  );
}
