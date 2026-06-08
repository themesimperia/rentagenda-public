'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Building2, MessageSquare, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { UserMenu } from '@/components/layout/UserMenu';

const NAV = [
  { href: '/', label: 'Home' },
  { href: '/listings', label: 'Browse' },
];

export function Header() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [search, setSearch] = useState('');

  function openAuth(mode: 'signin' | 'signup') {
    setAuthMode(mode);
    setAuthOpen(true);
  }

  function submitSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : '/listings');
  }

  return (
    <>
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

          {/* Search */}
          <form onSubmit={submitSearch} className="hidden flex-1 lg:block lg:max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search listings…"
                className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Icon buttons */}
          <div className="hidden shrink-0 items-center gap-1 sm:flex">
            <a
              href="https://rent-agenda.vercel.app/Inquiries"
              target="_blank"
              rel="noopener noreferrer"
              title="Messages"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <MessageSquare className="h-5 w-5" />
            </a>
            <a
              href="https://rent-agenda.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              title="Notifications"
              className="grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <Bell className="h-5 w-5" />
            </a>
          </div>

          {/* Auth area */}
          <div className="flex shrink-0 items-center gap-2">
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

      <AuthModal open={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />
    </>
  );
}
