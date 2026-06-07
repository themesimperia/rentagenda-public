import Link from 'next/link';
import { Building2 } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-700 font-medium">
            <Building2 className="h-4 w-4 text-indigo-600" />
            RentAgenda Marketplace
          </Link>
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} RentAgenda. All rights reserved.
          </p>
          <a
            href="https://rent-agenda.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            Manage your properties →
          </a>
        </div>
      </div>
    </footer>
  );
}
