import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <Building2 className="h-5 w-5 text-indigo-600" />
          <span>RentAgenda</span>
          <span className="text-slate-400 font-normal">Marketplace</span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link
            href="/listings"
            className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
          >
            Browse listings
          </Link>
          <Button
            size="sm"
            onClick={() => window.open('https://rent-agenda.vercel.app', '_blank')}
          >
            List your property
          </Button>
        </nav>
      </div>
    </header>
  );
}
