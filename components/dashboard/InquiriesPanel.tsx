'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { MessageSquare, CalendarClock, Trash2, CheckSquare, Check, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth-context';
import { deleteInquiry } from '@/lib/firestore';
import { renterStatusLabel, inquiryTypeLabel } from '@/lib/inquiries';
import { relativeTime } from '@/lib/relative-time';
import type { Inquiry, InquiryStatus } from '@/lib/inquiries';
import { InquiryThread } from '@/components/dashboard/InquiryThread';

const STATUS_STYLE: Record<string, string> = {
  Sent: 'bg-slate-100 text-slate-600',
  Seen: 'bg-amber-50 text-amber-700',
  Replied: 'bg-emerald-50 text-emerald-700',
};

export function InquiriesPanel({
  filter,
  title,
}: {
  filter: 'all' | 'viewing';
  title: string;
}) {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [confirmId, setConfirmId] = useState<string | null>(null); // per-card delete confirm
  const [bulkConfirming, setBulkConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    setLoading(true);
    const q = query(
      collection(db, 'listing_inquiries'),
      where('renter_id', '==', user.uid),
      orderBy('created_at', 'desc'),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setInquiries(snap.docs.map(d => {
          const data = d.data();
          return {
            id: d.id,
            listing_id: data.listing_id ?? '',
            listing_title: data.listing_title ?? 'Listing',
            owner_id: data.owner_id ?? '',
            renter_id: data.renter_id ?? null,
            inquiry_type: data.inquiry_type === 'viewing' ? 'viewing' : 'message',
            message: data.message ?? null,
            status: (data.status ?? 'new') as InquiryStatus,
            created_at: data.created_at?.toMillis?.() ?? null,
            renter_unread: data.renter_unread ?? false,
            renter_unread_count: data.renter_unread_count ?? 0,
          };
        }));
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [user]);

  const visible = useMemo(
    () => (filter === 'viewing'
      ? inquiries.filter(i => i.inquiry_type === 'viewing')
      : inquiries),
    [inquiries, filter],
  );

  const toggleSelect = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });

  const allSelected = visible.length > 0 && visible.every(i => selected.has(i.id));
  const selectAll = () =>
    setSelected(prev => {
      const next = new Set(prev);
      if (allSelected) visible.forEach(i => next.delete(i.id));
      else visible.forEach(i => next.add(i.id));
      return next;
    });

  async function removeMany(ids: string[]) {
    setDeleting(true);
    try {
      await Promise.all(ids.map(deleteInquiry));
      setSelected(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });
      setBulkConfirming(false);
      setConfirmId(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-900">{title}</h1>
        {visible.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <CheckSquare className="h-4 w-4" />
              {allSelected ? 'Clear' : 'Select all'}
            </button>
            {bulkConfirming ? (
              <span className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Delete {selected.size}?</span>
                <button
                  type="button"
                  onClick={() => removeMany([...selected])}
                  disabled={deleting}
                  className="rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
                >
                  {deleting ? 'Deleting…' : 'Confirm'}
                </button>
                <button
                  type="button"
                  onClick={() => setBulkConfirming(false)}
                  disabled={deleting}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
              </span>
            ) : (
              <button
                type="button"
                onClick={() => setBulkConfirming(true)}
                disabled={selected.size === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete all ({selected.size})
              </button>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white py-20 text-center">
          {filter === 'viewing'
            ? <CalendarClock className="mb-3 h-10 w-10 text-slate-300" />
            : <MessageSquare className="mb-3 h-10 w-10 text-slate-300" />}
          <p className="font-medium text-slate-700">
            {filter === 'viewing' ? 'No viewing requests yet' : 'No inquiries yet'}
          </p>
          <Link href="/listings" className="mt-2 text-sm font-medium text-blue-600 hover:underline">
            Browse properties
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(inq => {
            const label = renterStatusLabel(inq.status);
            const unread = inq.renter_unread_count ?? 0;
            const isSelected = selected.has(inq.id);
            return (
              <div
                key={inq.id}
                className={`rounded-2xl border bg-white p-4 shadow-sm ${
                  isSelected ? 'border-blue-400 ring-2 ring-blue-200'
                    : unread > 0 ? 'border-blue-200 ring-1 ring-blue-100' : 'border-slate-100'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(inq.id)}
                      aria-label={`Select inquiry for ${inq.listing_title}`}
                      className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-blue-600"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/listing/${inq.listing_id}`}
                          className="truncate font-semibold text-slate-900 hover:text-blue-600"
                        >
                          {inq.listing_title}
                        </Link>
                        {unread > 0 && (
                          <span
                            title={`${unread} new message${unread === 1 ? '' : 's'} for this property`}
                            className="inline-flex shrink-0 items-center gap-1 rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white"
                          >
                            <MessageSquare className="h-3 w-3" />
                            {unread > 9 ? '9+' : unread}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="rounded-full border border-slate-200 px-2 py-0.5 text-xs text-slate-500">
                          {inquiryTypeLabel(inq.inquiry_type)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[label]}`}>
                          {label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-slate-400">
                      {inq.created_at ? relativeTime(inq.created_at) : ''}
                    </span>
                    {confirmId === inq.id ? (
                      <span className="flex items-center gap-1">
                        <button
                          type="button"
                          title="Confirm delete"
                          onClick={() => removeMany([inq.id])}
                          disabled={deleting}
                          className="grid h-7 w-7 place-items-center rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-60"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          title="Cancel"
                          onClick={() => setConfirmId(null)}
                          disabled={deleting}
                          className="grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    ) : (
                      <button
                        type="button"
                        title="Delete inquiry"
                        onClick={() => { setConfirmId(inq.id); setBulkConfirming(false); }}
                        className="grid h-7 w-7 place-items-center rounded-md text-slate-400 hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
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
                    openingAt={inq.created_at}
                    currentUserId={user.uid}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
