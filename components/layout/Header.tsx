'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Building2, Search, X, MapPin, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import { useOwnerStatus } from '@/lib/use-owner-status';
import { useSearchSuggestions } from '@/lib/use-search-suggestions';
import { OWNER_APP_URL, OWNER_LANDING_URL } from '@/lib/config';
import { UserMenu } from '@/components/layout/UserMenu';
import { HeaderNotifications } from '@/components/layout/HeaderNotifications';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Browse' },
];

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

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const { openAuth } = useAuthModal();
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const searchRef = useRef<HTMLFormElement>(null);
  const suggestions = useSearchSuggestions(search);
  const { isPaidOwner } = useOwnerStatus();

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Hooks must run before any early return.
  if (pathname.startsWith('/dashboard')) return null;

  function go(q: string) {
    const trimmed = q.trim();
    setOpen(false);
    router.push(trimmed ? `/listings?q=${encodeURIComponent(trimmed)}` : '/listings');
  }

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const picked = activeIdx >= 0 ? suggestions[activeIdx] : undefined;
    if (picked) { setSearch(picked.label); go(picked.label); }
    else go(search);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-lg">RentAgenda</span>
          </Link>

          {/* Nav (pill) */}
          <nav className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
            {NAV.map(item => {
              const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    active ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Search with location autocomplete */}
          <form onSubmit={submitSearch} ref={searchRef} className="relative hidden flex-1 lg:block lg:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setOpen(true); setActiveIdx(-1); }}
                onFocus={() => { if (search) setOpen(true); }}
                onKeyDown={handleKeyDown}
                placeholder="Search listings…"
                aria-label="Search listings"
                aria-autocomplete="list"
                aria-expanded={open && suggestions.length > 0}
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(''); setOpen(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Suggestions dropdown */}
            {open && suggestions.length > 0 && (
              <ul
                role="listbox"
                className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-2xl border border-slate-100 bg-white py-1 shadow-xl"
              >
                {suggestions.map((s, i) => (
                  <li key={`${s.kind}:${s.label}`} role="option" aria-selected={i === activeIdx}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIdx(i)}
                      onMouseDown={e => { e.preventDefault(); setSearch(s.label); go(s.label); }}
                      className={`flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors ${
                        i === activeIdx ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {s.kind === 'location' ? (
                        <MapPin className="h-4 w-4 shrink-0 text-blue-500" />
                      ) : (
                        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />
                      )}
                      <span className="min-w-0 flex-1 truncate">
                        <HighlightMatch text={s.label} query={search} />
                      </span>
                      <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-slate-300">
                        {s.kind === 'location' ? 'Area' : 'Listing'}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </form>

          {/* Auth area + icons */}
          <div className="flex shrink-0 items-center gap-1">
            {/* Single owner entry point. Paid owners → AgendaRent dashboard;
                everyone else → App 1 landing to create an account & list.
                Payment/plans are handled entirely in App 1. */}
            {isPaidOwner ? (
              <a
                href={OWNER_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-1 hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 sm:flex"
              >
                <LayoutDashboard className="h-4 w-4" />
                Go to AgendaRent
              </a>
            ) : (
              <a
                href={OWNER_LANDING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mr-1 hidden items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 sm:flex"
              >
                <Building2 className="h-4 w-4" />
                List your property
              </a>
            )}
            {user && <HeaderNotifications />}
            {loading ? (
              <div className="h-8 w-20 animate-pulse rounded-full bg-slate-100" />
            ) : user ? (
              <UserMenu />
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600"
                  onClick={() => openAuth('signin')}
                >
                  Sign in
                </Button>
                <Button
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => openAuth('signup')}
                >
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      </header>
  );
}
