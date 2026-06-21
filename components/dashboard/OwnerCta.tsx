'use client';

import { Building2, ArrowRight } from 'lucide-react';
import { OWNER_LANDING_URL } from '@/lib/config';

/** Profile card: invites the renter to list a property. Sends them to App 1's
 *  landing page, where they decide whether to create an account. */
export function OwnerCta() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-100 text-blue-600">
          <Building2 className="h-5 w-5" />
        </span>
        <div>
          <p className="text-sm font-semibold text-slate-900">Own a property?</p>
          <p className="text-xs text-slate-500">List it on RentAgenda and reach renters directly.</p>
        </div>
      </div>
      <a
        href={OWNER_LANDING_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        List your property
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
