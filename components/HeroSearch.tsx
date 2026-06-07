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

const PRICE_OPTIONS = [
  { label: 'Price', min: '', max: '' },
  { label: 'Under $1,000', min: '', max: '1000' },
  { label: '$1,000 – $5,000', min: '1000', max: '5000' },
  { label: 'Over $5,000', min: '5000', max: '' },
];

const selectClass =
  'w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none';

export function HeroSearch({ regions }: { regions: string[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<TermTab>('all');
  const [type, setType] = useState('');
  const [region, setRegion] = useState('');
  const [priceIdx, setPriceIdx] = useState(0);

  function handleSearch() {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (region) params.set('region', region);
    if (tab !== 'all') params.set('term', tab);
    const price = PRICE_OPTIONS[priceIdx];
    if (price.min) params.set('priceMin', price.min);
    if (price.max) params.set('priceMax', price.max);
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Term tabs */}
      <div className="mx-auto mb-0 flex w-fit overflow-hidden rounded-t-lg bg-white/90 shadow-sm">
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
      <div className="grid grid-cols-1 gap-3 rounded-lg rounded-tl-none bg-white p-4 shadow-xl sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]">
        <select
          aria-label="Property type"
          value={type}
          onChange={e => setType(e.target.value)}
          className={selectClass}
        >
          {TYPE_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        <select
          aria-label="Region"
          value={region}
          onChange={e => setRegion(e.target.value)}
          className={selectClass}
        >
          <option value="">Region</option>
          {regions.map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        <select
          aria-label="Price"
          value={priceIdx}
          onChange={e => setPriceIdx(Number(e.target.value))}
          className={selectClass}
        >
          {PRICE_OPTIONS.map((o, i) => (
            <option key={o.label} value={i}>{o.label}</option>
          ))}
        </select>

        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-lg bg-amber-400 px-8 py-3 text-sm font-semibold text-slate-900 transition-colors hover:bg-amber-500"
        >
          <Search className="h-4 w-4" />
          Search
        </button>
      </div>
    </div>
  );
}
