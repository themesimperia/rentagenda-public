'use client';

import Link from 'next/link';
import { Building2, LayoutDashboard, ArrowRight } from 'lucide-react';
import { useOwnerStatus } from '@/lib/use-owner-status';
import { planLabel } from '@/lib/plans';
import { OWNER_APP_URL } from '@/lib/config';

/** Profile card: routes non-owners to pricing, paid owners to AgendaRent. */
export function OwnerCta() {
  const { plan, isPaidOwner, loading } = useOwnerStatus();

  if (loading) {
    return <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />;
  }

  if (isPaidOwner) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-600 text-white">
            <LayoutDashboard className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              You’re on the {planLabel(plan)} plan
            </p>
            <p className="text-xs text-slate-500">Manage your properties in AgendaRent.</p>
          </div>
        </div>
        <a
          href={OWNER_APP_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Open
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    );
  }

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
      <Link
        href="/list-your-property"
        className="flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        List your property
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
