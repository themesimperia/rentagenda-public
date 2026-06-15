'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, CalendarClock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getMyInquiries } from '@/lib/firestore';
import { renterStatusLabel, inquiryTypeLabel } from '@/lib/inquiries';
import { relativeTime } from '@/lib/relative-time';
import type { Inquiry } from '@/lib/inquiries';
import { InquiryThread } from '@/components/dashboard/InquiryThread';

const STATUS_STYLE: Record<string, string> = {
  Sent: 'bg-slate-100 text-slate-600',
  Seen: 'bg-amber-50 text-amber-700',
  Replied: 'bg-emerald-50 text-emerald-700',
};

export function InquiriesPanel({ filter }: { filter: 'all' | 'viewing' }) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      setLoading(true);
      const all = await getMyInquiries(user.uid).catch(() => []);
      if (active) {
        setInquiries(all);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [user]);

  const visible = filter === 'viewing'
    ? inquiries.filter(i => i.inquiry_type === 'viewing')
    : inquiries;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    const Icon = filter === 'viewing' ? CalendarClock : MessageSquare;
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
        <Icon className="mb-3 h-10 w-10 text-slate-300" />
        <p className="font-medium text-slate-700">
          {filter === 'viewing' ? 'No viewing requests yet' : 'No inquiries yet'}
        </p>
        <Link href="/listings" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
          Browse properties
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {visible.map(inq => {
        const label = renterStatusLabel(inq.status);
        return (
          <div key={inq.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={`/listing/${inq.listing_id}`}
                  className="block truncate font-semibold text-slate-900 hover:text-blue-600"
                >
                  {inq.listing_title}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                    {inquiryTypeLabel(inq.inquiry_type)}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[label]}`}>
                    {label}
                  </span>
                </div>
              </div>
              <span className="shrink-0 text-xs text-slate-400">
                {inq.created_at ? relativeTime(inq.created_at) : ''}
              </span>
            </div>
            {inq.message && <p className="mt-2 line-clamp-2 text-sm text-slate-600">{inq.message}</p>}
            <button
              type="button"
              onClick={() => setOpenId(openId === inq.id ? null : inq.id)}
              className="mt-2 text-sm font-medium text-blue-600 hover:underline"
            >
              {openId === inq.id ? 'Hide conversation' : 'View conversation'}
            </button>
            {openId === inq.id && user && (
              <InquiryThread
                inquiryId={inq.id}
                openingMessage={inq.message}
                currentUserId={user.uid}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
