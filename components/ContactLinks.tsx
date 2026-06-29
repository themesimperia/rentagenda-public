'use client';

import { useState } from 'react';
import { CONTACT_META } from '@/lib/contact-meta';
import type { ListingContact } from '@/lib/types';

/** Masks all but the last two digits, preserving the number's formatting
 * (spaces, +) so it still reads as a phone number, e.g. "+•• ••• ••• •00". */
function maskPhone(value: string): string {
  const total = (value.match(/\d/g) || []).length;
  let seen = 0;
  return value.replace(/\d/g, (d) => {
    seen += 1;
    return seen > total - 2 ? d : '•';
  });
}

const pillClass =
  'inline-flex h-8 items-center gap-1.5 rounded-full border border-slate-200 px-3 text-sm text-slate-600 transition-colors hover:border-blue-300 hover:text-blue-600';

/** Phone is hidden behind a click-to-reveal: a masked pill that, once clicked,
 * shows the real number as a tel: link. Reduces scraping of owner numbers. */
function PhoneContact({ value, href }: { value: string; href: string }) {
  const [revealed, setRevealed] = useState(false);
  const { label, Icon } = CONTACT_META.phone;

  if (!revealed) {
    return (
      <button
        type="button"
        onClick={() => setRevealed(true)}
        aria-label="Show phone number"
        title="Click to show the phone number"
        className={pillClass}
      >
        <Icon className="h-4 w-4" />
        <span>{maskPhone(value)}</span>
      </button>
    );
  }

  return (
    <a href={href} aria-label={label} title={label} className={pillClass}>
      <Icon className="h-4 w-4" />
      <span>{value}</span>
    </a>
  );
}

export function ContactLinks({ contacts }: { contacts: ListingContact[] }) {
  if (!contacts || contacts.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      {contacts.map((c) => {
        const meta = CONTACT_META[c.type];
        if (!meta) return null;

        if (c.type === 'phone') {
          return <PhoneContact key={c.type} value={c.value} href={c.href} />;
        }

        const { label, Icon } = meta;
        return (
          <a
            key={c.type}
            href={c.href}
            aria-label={label}
            title={label}
            target="_blank"
            rel="noopener noreferrer"
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
