'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, Bell } from 'lucide-react';
import { useSavedListingsData, type SavedRow } from '@/lib/use-saved-listings-data';
import { useUnreadReplies } from '@/lib/use-unread-replies';
import { availability } from '@/lib/format';

const SOON_DAYS = 14;
type LiveRow = Extract<SavedRow, { kind: 'live' }>;

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[1rem] place-items-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
      {count > 9 ? '9+' : count}
    </span>
  );
}

export function HeaderNotifications() {
  const { rows } = useSavedListingsData();
  const unreadReplies = useUnreadReplies();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  const soon = rows
    .filter((r): r is LiveRow => r.kind === 'live')
    .map(r => ({ row: r, a: availability(r.listing) }))
    .filter(x => x.a.freeDate != null && x.a.daysLeft <= SOON_DAYS);

  return (
    <>
      {/* Messages */}
      <Link
        href="/dashboard/inquiries"
        title="Messages"
        className="relative hidden h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:grid"
      >
        <MessageSquare className="h-5 w-5" />
        <CountBadge count={unreadReplies} />
      </Link>

      {/* Bell + dropdown */}
      <div className="relative hidden sm:block" ref={bellRef}>
        <button
          type="button"
          title="Saved homes available soon"
          onClick={() => setBellOpen(o => !o)}
          className="relative grid h-9 w-9 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          <Bell className="h-5 w-5" />
          <CountBadge count={soon.length} />
        </button>
        {bellOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-slate-100 bg-white py-2 shadow-xl">
            <p className="px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
              Available soon
            </p>
            {soon.length === 0 ? (
              <p className="px-4 py-3 text-sm text-slate-500">
                No saved homes are freeing up in the next {SOON_DAYS} days.
              </p>
            ) : (
              soon.map(({ row, a }) => (
                <Link
                  key={row.listing.id}
                  href={`/listing/${row.listing.id}`}
                  onClick={() => setBellOpen(false)}
                  className="block px-4 py-2 hover:bg-slate-50"
                >
                  <span className="block truncate text-sm font-medium text-slate-800">
                    {row.listing.title}
                  </span>
                  <span className="block text-xs text-emerald-600">
                    Available in {a.daysLeft} day{a.daysLeft === 1 ? '' : 's'}
                    {a.freeDate ? ` · ${a.freeDate}` : ''}
                  </span>
                </Link>
              ))
            )}
            <Link
              href="/dashboard/saved"
              onClick={() => setBellOpen(false)}
              className="mt-1 block border-t border-slate-100 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-slate-50"
            >
              View saved homes →
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
