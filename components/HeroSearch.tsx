'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';

type TermTab = 'all' | 'long_term' | 'short_term';

const TABS: { value: TermTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'long_term', label: 'Long term' },
  { value: 'short_term', label: 'Short term' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Property Type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'office', label: 'Office' },
  { value: 'vacation', label: 'Vacation rental' },
];

const fieldClass =
  'w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none';

export function HeroSearch({ regions }: { regions: string[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<TermTab>('all');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  function handleSearch() {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    if (tab !== 'all') params.set('term', tab);
    if (priceMin) params.set('priceMin', priceMin);
    if (priceMax) params.set('priceMax', priceMax);
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Term tabs */}
      <div className="mx-auto flex w-fit overflow-hidden rounded-t-lg bg-white/90 shadow-sm">
        {TABS.map(t => (
          <button
            key={t.value}
            type="button"
            onClick={() => setTab(t.value)}
            className={`px-6 py-2 text-sm font-medium transition-colors ${
              tab === t.value ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Search bar */}
      <div className="grid grid-cols-1 gap-3 rounded-lg rounded-tl-none bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[1.2fr_1.2fr_auto_auto_auto] lg:items-center">
        <select
          aria-label="Region"
          value={region}
          onChange={e => setRegion(e.target.value)}
          className={fieldClass}
        >
          <option value="">Region</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          aria-label="Property type"
          value={type}
          onChange={e => setType(e.target.value)}
          className={fieldClass}
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <input
          aria-label="Minimum price"
          type="number"
          inputMode="numeric"
          placeholder="Min Price"
          value={priceMin}
          onChange={e => setPriceMin(e.target.value)}
          className={`${fieldClass} lg:w-28`}
        />
        <input
          aria-label="Maximum price"
          type="number"
          inputMode="numeric"
          placeholder="Max Price"
          value={priceMax}
          onChange={e => setPriceMax(e.target.value)}
          className={`${fieldClass} lg:w-28`}
        />

        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}
