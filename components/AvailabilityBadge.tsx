'use client';

import { useEffect, useRef, useState } from 'react';
import { availability } from '@/lib/format';
import type { PublicListing } from '@/lib/types';

/**
 * Availability pill. When the unit is available now it's a plain badge.
 * When occupied it's clickable and reveals the exact free-up date + days left.
 * Wrap with a positioned parent (e.g. an absolute overlay) for card placement;
 * this component's own root is `relative` so its popover anchors correctly.
 */
export function AvailabilityBadge({
  listing,
}: {
  listing: Pick<PublicListing, 'availability_status' | 'available_from'>;
}) {
  const a = availability(listing);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const tone = a.tone === 'green' ? 'text-emerald-600' : 'text-amber-600';
  const pill = `rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold shadow-sm ${tone}`;

  if (a.available) {
    return <span className={pill}>{a.label}</span>;
  }

  const detail = a.freeDate
    ? `Available from ${a.freeDate} — ${a.daysLeft} day${a.daysLeft === 1 ? '' : 's'} left`
    : 'Currently occupied — availability date not set yet';

  return (
    <span ref={ref} className="relative inline-block">
      <span
        role="button"
        tabIndex={0}
        title={detail}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setOpen(o => !o); }}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            e.stopPropagation();
            setOpen(o => !o);
          }
        }}
        className={`${pill} cursor-pointer`}
      >
        {a.label}
      </span>
      {open && (
        <span
          onClick={e => { e.preventDefault(); e.stopPropagation(); }}
          className="absolute right-0 top-full z-50 mt-1 w-max max-w-[15rem] rounded-lg border border-slate-100 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 shadow-lg"
        >
          {detail}
        </span>
      )}
    </span>
  );
}
