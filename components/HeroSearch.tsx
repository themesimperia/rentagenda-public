'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, MapPin, LayoutGrid, DollarSign } from 'lucide-react';

type TermTab = 'all' | 'long_term' | 'short_term';

const TABS: { value: TermTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'long_term', label: 'Long term' },
  { value: 'short_term', label: 'Short term' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Any type' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'office', label: 'Office' },
  { value: 'vacation', label: 'Vacation rental' },
];

const PRICE_PRESETS = [0, 300, 500, 800, 1000, 1500, 2000, 3000];
const PRICE_MAX_SLIDER = 3000;

function useClickOutside(ref: React.RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [ref, onClose]);
}

export function HeroSearch({ regions }: { regions: string[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<TermTab>('all');
  const [region, setRegion] = useState('');
  const [type, setType] = useState('');
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);

  const [locationOpen, setLocationOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);

  const locationRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  useClickOutside(locationRef, () => setLocationOpen(false));
  useClickOutside(categoryRef, () => setCategoryOpen(false));
  useClickOutside(priceRef, () => setPriceOpen(false));

  function handleSearch() {
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (type) params.set('type', type);
    if (tab !== 'all') params.set('term', tab);
    if (priceMin) params.set('priceMin', String(priceMin));
    if (priceMax) params.set('priceMax', String(priceMax));
    const qs = params.toString();
    router.push(qs ? `/listings?${qs}` : '/listings');
  }

  const priceLabel =
    priceMin != null || priceMax != null
      ? `${priceMin != null ? `$${priceMin.toLocaleString()}` : 'Any'} – ${priceMax != null ? `$${priceMax.toLocaleString()}` : 'Any'}`
      : 'Select price range';

  const hasPrice = priceMin != null || priceMax != null;

  return (
    <div className="mx-auto w-full max-w-4xl">
      {/* Term tabs */}
      <div className="mx-auto flex w-fit overflow-hidden rounded-t-2xl bg-white/90 shadow-sm">
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
      <div className="flex items-stretch overflow-visible rounded-2xl rounded-tl-none bg-white shadow-xl">

        {/* ── Location ─────────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-0" ref={locationRef}>
          <button
            type="button"
            onClick={() => { setLocationOpen(o => !o); setCategoryOpen(false); setPriceOpen(false); }}
            className="flex h-full w-full flex-col justify-center gap-0.5 rounded-l-2xl px-6 py-4 text-left transition-colors hover:bg-slate-50"
          >
            <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <MapPin className="h-3.5 w-3.5 text-blue-500" />
              Location
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-500 truncate">
              <span className="truncate">{region || 'Any location'}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${locationOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {locationOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] max-h-64 overflow-y-auto rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
              {['', ...regions].map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => { setRegion(r); setLocationOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${region === r ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
                >
                  {r || 'Any location'}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="my-4 w-px shrink-0 bg-slate-200" />

        {/* ── Category ─────────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-0" ref={categoryRef}>
          <button
            type="button"
            onClick={() => { setCategoryOpen(o => !o); setLocationOpen(false); setPriceOpen(false); }}
            className="flex h-full w-full flex-col justify-center gap-0.5 px-6 py-4 text-left transition-colors hover:bg-slate-50"
          >
            <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <LayoutGrid className="h-3.5 w-3.5 text-blue-500" />
              Category
            </span>
            <span className="flex items-center gap-1 text-sm text-slate-500 truncate">
              <span className="truncate">{TYPE_OPTIONS.find(o => o.value === type)?.label ?? 'Any type'}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {categoryOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 min-w-[200px] overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
              {TYPE_OPTIONS.map(o => (
                <button
                  key={o.value}
                  type="button"
                  onClick={() => { setType(o.value); setCategoryOpen(false); }}
                  className={`w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${type === o.value ? 'font-semibold text-blue-600' : 'text-slate-700'}`}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="my-4 w-px shrink-0 bg-slate-200" />

        {/* ── Price Range ───────────────────────────────────────────── */}
        <div className="relative flex-1 min-w-0" ref={priceRef}>
          <button
            type="button"
            onClick={() => { setPriceOpen(o => !o); setLocationOpen(false); setCategoryOpen(false); }}
            className={`flex h-full w-full flex-col justify-center gap-0.5 px-6 py-4 text-left transition-colors ${priceOpen ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
          >
            <span className="flex items-center gap-1 text-xs font-bold text-slate-900">
              <DollarSign className="h-3.5 w-3.5 text-blue-500" />
              Price Range
            </span>
            <span className={`flex items-center gap-1 text-sm truncate ${hasPrice ? 'font-medium text-blue-600' : 'text-slate-500'}`}>
              <span className="truncate">{priceLabel}</span>
              <ChevronDown className={`h-3.5 w-3.5 shrink-0 transition-transform ${priceOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>

          {priceOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-2xl border border-slate-100 bg-white p-5 shadow-xl">
              {/* Min / Max inputs */}
              <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Minimum
                  </p>
                  <div className="rounded-xl border border-slate-200 px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min={0}
                        max={PRICE_MAX_SLIDER}
                        step={100}
                        value={priceMin ?? 0}
                        onChange={e => setPriceMin(Number(e.target.value) || null)}
                        className="h-1.5 w-full cursor-pointer accent-blue-600"
                      />
                    </div>
                    <p className="mt-1 text-xs font-medium text-slate-700">
                      {priceMin != null ? `$${priceMin.toLocaleString()}` : '$0'}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Maximum
                  </p>
                  <input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={priceMax ?? ''}
                    onChange={e => setPriceMax(e.target.value ? Number(e.target.value) : null)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="mb-3 border-t border-dashed border-slate-200" />

              {/* Preset prices */}
              <div className="grid grid-cols-2 gap-1">
                {PRICE_PRESETS.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriceMin(p === 0 ? null : p)}
                    className={`rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 hover:text-blue-700 ${
                      (priceMin ?? 0) === p ? 'bg-blue-50 font-semibold text-blue-600' : 'text-slate-700'
                    }`}
                  >
                    {p === 0 ? '$0' : `$${p.toLocaleString()}`}
                  </button>
                ))}
              </div>

              {hasPrice && (
                <button
                  type="button"
                  onClick={() => { setPriceMin(null); setPriceMax(null); }}
                  className="mt-3 w-full rounded-lg py-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors"
                >
                  Clear price range
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Search button ─────────────────────────────────────────── */}
        <div className="flex items-center p-3">
          <button
            type="button"
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Search className="h-4 w-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}
