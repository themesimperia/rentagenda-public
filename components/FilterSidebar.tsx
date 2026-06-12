'use client';

import { MapPin, DollarSign, Maximize2, Building2, Sparkles, CalendarClock, X } from 'lucide-react';
import { propertyTypeLabel, termLabel } from '@/lib/format';
import { type MarketplaceFilters, EMPTY_FILTERS, isFiltered } from '@/lib/filter';
import type { PropertyType, RentalTerm } from '@/lib/types';

// ── Price slider constants ──────────────────────────────────────────────────
const PRICE_MAX = 10_000;
const PRICE_STEP = 100;

const PRICE_PRESETS = [
  { label: 'Under $1,000', min: null as number | null, max: 1_000 as number | null },
  { label: '$1,000 – $15,000', min: 1_000 as number | null, max: 15_000 as number | null },
  { label: 'More Than $15,000', min: 15_000 as number | null, max: null as number | null },
];

const RENTAL_TERMS: RentalTerm[] = ['long_term', 'short_term'];

// ── Helpers ────────────────────────────────────────────────────────────────
function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
}

function fmt(n: number | null, fallback: number): number {
  return n ?? fallback;
}

// ── Section wrapper ────────────────────────────────────────────────────────
function Section({
  icon: Icon,
  title,
  active,
  onClear,
  children,
}: {
  icon: React.ElementType;
  title: string;
  active: boolean;
  onClear: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-slate-100 px-4 py-4 last:border-0">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">{title}</span>
        </div>
        {active && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`Clear ${title}`}
            className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Dual-handle price range slider ─────────────────────────────────────────
function PriceSlider({
  min,
  max,
  onChange,
}: {
  min: number;
  max: number;
  onChange: (min: number, max: number) => void;
}) {
  const pctMin = (min / PRICE_MAX) * 100;
  const pctMax = (max / PRICE_MAX) * 100;

  return (
    <div className="px-1 pt-1">
      <div className="relative h-6">
        {/* Track background */}
        <div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200" />
        {/* Filled range */}
        <div
          className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-blue-600"
          style={{ left: `${pctMin}%`, width: `${pctMax - pctMin}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={min}
          onChange={e => {
            const v = Number(e.target.value);
            if (v < max) onChange(v, max);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600"
          style={{ zIndex: min > PRICE_MAX * 0.8 ? 5 : 3 }}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={0}
          max={PRICE_MAX}
          step={PRICE_STEP}
          value={max}
          onChange={e => {
            const v = Number(e.target.value);
            if (v > min) onChange(min, v);
          }}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent
            [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white
            [&::-webkit-slider-thumb]:bg-blue-600 [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:bg-blue-600"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="mt-1 flex justify-between text-xs font-medium text-slate-500">
        <span>${(min / 1000).toFixed(1)}K</span>
        <span>${(max / 1000).toFixed(1)}K</span>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
interface FilterSidebarProps {
  filters: MarketplaceFilters;
  onChange: (filters: MarketplaceFilters) => void;
  locations: string[];
  types: PropertyType[];
  amenities: string[];
}

export function FilterSidebar({ filters, onChange, locations, types, amenities }: FilterSidebarProps) {
  function set<K extends keyof MarketplaceFilters>(key: K, value: MarketplaceFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  // Determine if "Custom" price mode is active (not matching any preset)
  const presetIdx = PRICE_PRESETS.findIndex(
    p => p.min === filters.priceMin && p.max === filters.priceMax,
  );
  const isCustomPrice = presetIdx === -1 && (filters.priceMin != null || filters.priceMax != null);

  // Current slider values (fall back to sensible defaults when null)
  const sliderMin = fmt(filters.priceMin, 0);
  const sliderMax = fmt(filters.priceMax, PRICE_MAX);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <h2 className="text-base font-bold text-slate-900">Custom Filter</h2>
        {isFiltered(filters) && (
          <button
            type="button"
            onClick={() => onChange(EMPTY_FILTERS)}
            className="text-xs font-semibold text-blue-600 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Location */}
      {locations.length > 0 && (
        <Section
          icon={MapPin}
          title="Location"
          active={filters.locations.length > 0}
          onClear={() => set('locations', [])}
        >
          <div className="space-y-2.5">
            {locations.map(loc => (
              <label key={loc} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={filters.locations.includes(loc)}
                  onChange={() => set('locations', toggle(filters.locations, loc))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                />
                <span className="truncate">{loc}</span>
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Price Range */}
      <Section
        icon={DollarSign}
        title="Price Range"
        active={filters.priceMin != null || filters.priceMax != null}
        onClear={() => onChange({ ...filters, priceMin: null, priceMax: null })}
      >
        <div className="space-y-2.5">
          {PRICE_PRESETS.map((preset, i) => (
            <label key={preset.label} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
              <input
                type="radio"
                name="price-preset"
                checked={presetIdx === i}
                onChange={() => onChange({ ...filters, priceMin: preset.min, priceMax: preset.max })}
                className="h-4 w-4 border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
              />
              {preset.label}
            </label>
          ))}
          {/* Custom option */}
          <label className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
            <input
              type="radio"
              name="price-preset"
              checked={isCustomPrice || (filters.priceMin == null && filters.priceMax == null && false)}
              onChange={() => onChange({ ...filters, priceMin: 0, priceMax: PRICE_MAX })}
              className="h-4 w-4 border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
            />
            Custom
          </label>

          {isCustomPrice && (
            <PriceSlider
              min={sliderMin}
              max={sliderMax}
              onChange={(min, max) => onChange({ ...filters, priceMin: min, priceMax: max })}
            />
          )}
        </div>
      </Section>

      {/* Size */}
      <Section
        icon={Maximize2}
        title="Size (m²)"
        active={filters.sizeMin != null || filters.sizeMax != null}
        onClear={() => onChange({ ...filters, sizeMin: null, sizeMax: null })}
      >
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Min"
              value={filters.sizeMin ?? ''}
              onChange={e => set('sizeMin', e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">m²</span>
          </div>
          <span className="text-slate-300">—</span>
          <div className="relative flex-1">
            <input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="Max"
              value={filters.sizeMax ?? ''}
              onChange={e => set('sizeMax', e.target.value ? Number(e.target.value) : null)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">m²</span>
          </div>
        </div>
      </Section>

      {/* Type Of Place */}
      {types.length > 0 && (
        <Section
          icon={Building2}
          title="Type Of Place"
          active={filters.types.length > 0}
          onClear={() => set('types', [])}
        >
          <div className="space-y-2.5">
            {types.map(type => (
              <label key={type} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={filters.types.includes(type)}
                  onChange={() => set('types', toggle(filters.types, type))}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                />
                {propertyTypeLabel(type)}
              </label>
            ))}
          </div>
        </Section>
      )}

      {/* Rental term */}
      <Section
        icon={CalendarClock}
        title="Rental term"
        active={filters.terms.length > 0}
        onClear={() => set('terms', [])}
      >
        <div className="space-y-2.5">
          {RENTAL_TERMS.map(term => (
            <label key={term} className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.terms.includes(term)}
                onChange={() => set('terms', toggle(filters.terms, term))}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
              />
              {termLabel(term)}
            </label>
          ))}
        </div>
      </Section>

      {/* Amenities */}
      {amenities.length > 0 && (
        <Section
          icon={Sparkles}
          title="Amenities"
          active={filters.amenities.length > 0}
          onClear={() => set('amenities', [])}
        >
          <div className="flex flex-wrap gap-2">
            {amenities.map(a => {
              const active = filters.amenities.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => set('amenities', toggle(filters.amenities, a))}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {a.replace(/_/g, ' ')}
                </button>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
