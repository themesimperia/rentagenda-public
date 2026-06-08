import Link from 'next/link';
import { Building2 } from 'lucide-react';

const LINKS = {
  Marketplace: [
    { label: 'Browse Listings', href: '/listings' },
    { label: 'Home', href: '/' },
  ],
  Owners: [
    { label: 'List Your Property', href: 'https://rent-agenda.vercel.app', external: true },
    { label: 'Manage Properties', href: 'https://rent-agenda.vercel.app', external: true },
    { label: 'View Inquiries', href: 'https://rent-agenda.vercel.app/Inquiries', external: true },
  ],
  Company: [
    { label: 'About RentAgenda', href: '/' },
    { label: 'Contact Us', href: '/' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-[#52555c] text-slate-300">
      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">

          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-600">
                <Building2 className="h-5 w-5 text-white" />
              </span>
              <span className="text-lg font-bold">RentAgenda</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed">
              Find your next home directly from verified property owners — no agents, no hidden fees.
            </p>
          </div>

          {/* Link columns */}
          {(Object.entries(LINKS) as [string, { label: string; href: string; external?: boolean }[]][]).map(
            ([heading, items]) => (
              <div key={heading}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
                  {heading}
                </h3>
                <ul className="space-y-2.5">
                  {items.map(item => (
                    <li key={item.label}>
                      {item.external ? (
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm transition-colors hover:text-white"
                        >
                          {item.label}
                        </a>
                      ) : (
                        <Link href={item.href} className="text-sm transition-colors hover:text-white">
                          {item.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}

          {/* CTA column */}
          <div className="space-y-3">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">
              Ready to list?
            </h3>
            <a
              href="https://rent-agenda.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              List Your Property
            </a>
            <a
              href="https://rent-agenda.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full rounded-xl border border-slate-500 px-4 py-3 text-center text-sm font-semibold text-white transition-colors hover:border-slate-300 hover:text-white"
            >
              Owner Dashboard
            </a>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#3e4148]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 sm:flex-row sm:px-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} RentAgenda. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link href="/" className="transition-colors hover:text-white">Terms &amp; Conditions</Link>
            <span className="text-slate-500">·</span>
            <Link href="/" className="transition-colors hover:text-white">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
