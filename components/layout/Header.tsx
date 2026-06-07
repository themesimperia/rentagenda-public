import Link from 'next/link';
import { Building2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-bold text-slate-900">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <span className="text-lg">RentAgenda</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full bg-slate-100 p-1 md:flex">
          <Link
            href="/"
            className="rounded-full px-4 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Home
          </Link>
          <Link
            href="/listings"
            className="rounded-full bg-white px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm"
          >
            Browse
          </Link>
        </nav>

        <Link
          href="/listings"
          className="hidden flex-1 items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-400 transition-colors hover:border-slate-300 lg:flex lg:max-w-xs"
        >
          <Search className="h-4 w-4" />
          Search properties…
        </Link>

        <Button asChild size="sm" className="shrink-0 bg-blue-600 hover:bg-blue-700">
          <a href="https://rent-agenda.vercel.app" target="_blank" rel="noopener noreferrer">
            List your property
          </a>
        </Button>
      </div>
    </header>
  );
}
