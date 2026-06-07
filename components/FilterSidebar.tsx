'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { propertyTypeLabel } from '@/lib/format';
import {
  type MarketplaceFilters,
  EMPTY_FILTERS,
  isFiltered,
} from '@/lib/filter';
import type { PropertyType } from '@/lib/types';

interface FilterSidebarProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
  locations: string[];
  types: PropertyType[];
  amenities: string[];
}

const PRICE_PRESETS: { label: string; min: number | null; max: number | null }[] = [
  { label: 'Under $1,000', min: null, max: 1000 },
  { label: '$1,000 – $5,000', min: 1000, max: 5000 },
  { label: 'More than $5,000', min: 5000, max: null },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 px-4 py-4 last:border-0">
      <h3 className="mb-3 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

export function FilterSidebar({
  filters,
  onChange,
  locations,
  types,
  amenities,
}: FilterSidebarProps) {
  function set<K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  const activePreset = PRICE_PRESETS.findIndex(
    p => p.min === filters.priceMin && p.max === filters.priceMax,
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-base font-bold text-slate-900">Custom Filter</h2>
        {isFiltered(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs font-medium text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <Section title="Search">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={filters.search}
            onChange={e => set('search', e.target.value)}
            placeholder="Title, keyword…"
            className="pl-9"
          />
        </div>
      </Section>

      {locations.length > 0 && (
        <Section title="Location">
          <div className="space-y-2">
            {locations.map(loc => (
              <label key={loc} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(loc)}
                  onChange={() => set('locations', toggle(filters.locations, loc))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{loc}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      <Section title="Price Range">
        <div className="space-y-2">
          {PRICE_PRESETS.map((preset, i) => (
            <label key={preset.label} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
              <input
                type="radio"
                name="price"
                checked={activePreset === i}
                onChange={() => onChange({ ...filters, priceMin: preset.min, priceMax: preset.max })}
                className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              {preset.label}
            </label>
          ))}
          <div className="flex items-center gap-2 pt-1">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Min"
              value={filters.priceMin ?? ''}
              onChange={e => set('priceMin', e.target.value ? Number(e.target.value) : null)}
              className="h-9"
            />
            <span className="text-slate-400">–</span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Max"
              value={filters.priceMax ?? ''}
              onChange={e => set('priceMax', e.target.value ? Number(e.target.value) : null)}
              className="h-9"
            />
          </div>
        </div>
      </Section>

      {types.length > 0 && (
        <Section title="Type Of Place">
          <div className="space-y-2">
            {types.map(type => (
              <label key={type} className="flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => set('types', toggle(filters.types, type))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                {propertyTypeLabel(type)}
              </label>
            ))}
          </div>
        </Section>
      )}

      {amenities.length > 0 && (
        <Section title="Amenities">
          <div className="flex flex-wrap gap-2">
            {amenities.map(a => {
              const active = filters.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => set('amenities', toggle(filters.amenities, a))}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    active
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {a.replace(/_/g, ' ')}
                  {active && <X className="h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
