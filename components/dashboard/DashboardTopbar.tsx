'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { UserMenu } from '@/components/layout/UserMenu';

export function DashboardTopbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const firstName = (user?.displayName || user?.email || 'there').split(/[\s@]/)[0];

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = search.trim();
    router.push(q ? `/listings?q=${encodeURIComponent(q)}` : '/listings');
  }

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b border-slate-100 bg-white px-4 sm:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm text-slate-500">Welcome back,</p>
        <p className="truncate font-semibold text-slate-900">{firstName}</p>
      </div>
      <form onSubmit={submit} className="hidden flex-1 sm:block sm:max-w-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            aria-label="Search listings"
            placeholder="Search listings…"
            className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none"
          />
        </div>
      </form>
      <UserMenu />
    </header>
  );
}
