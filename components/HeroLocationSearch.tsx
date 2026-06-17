'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, X } from 'lucide-react';

/** Wraps the matching substring in a bold blue span. */
function HighlightMatch({ text, query }: { text: string; query: string }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className="font-bold text-blue-600">{text.slice(idx, idx + q.length)}</span>
      {text.slice(idx + q.length)}
    </>
  );
}

export function HeroLocationSearch({ regions }: { regions: string[] }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const suggestions = useMemo(() => {
    const q = text.trim().toLowerCase();
    if (!q) return [];
    return regions.filter(r => r.toLowerCase().includes(q)).slice(0, 8);
  }, [text, regions]);

  function go(query: string) {
    const q = query.trim();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : '/listings');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      if (e.key === 'Enter') go(text);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) { setText(suggestions[activeIdx]); setOpen(false); go(suggestions[activeIdx]); }
      else go(text);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl" ref={ref}>
      <div className="relative">
        <div className="flex items-stretch overflow-hidden rounded-full bg-white shadow-lg ring-1 ring-black/5">
          <div className="pointer-events-none flex items-center pl-5">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            value={text}
            onChange={e => { setText(e.target.value); setOpen(true); setActiveIdx(-1); }}
            onFocus={() => { if (text) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search city, district, or address…"
            aria-label="Search by location"
            aria-autocomplete="list"
            aria-expanded={open && suggestions.length > 0}
            className="min-w-0 flex-1 bg-transparent px-3 py-4 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none sm:text-base"
          />
          {text && (
            <button
              type="button"
              onClick={() => { setText(''); setOpen(false); }}
              aria-label="Clear search"
              className="flex items-center px-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => go(text)}
            className="m-1.5 flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            <Search className="h-4 w-4" />
            <span className="hidden sm:inline">Search</span>
          </button>
        </div>

        {/* Suggestions dropdown */}
        {open && suggestions.length > 0 && (
          <ul
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl bg-white py-1 text-left shadow-xl ring-1 ring-black/5"
          >
            {suggestions.map((loc, i) => (
              <li key={loc} role="option" aria-selected={i === activeIdx}>
                <button
                  type="button"
                  onMouseEnter={() => setActiveIdx(i)}
                  onMouseDown={e => { e.preventDefault(); setText(loc); setOpen(false); go(loc); }}
                  className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                    i === activeIdx ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                  <HighlightMatch text={loc} query={text} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
