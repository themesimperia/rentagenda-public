import { CONTACT_META } from '@/lib/contact-meta';
import type { ListingContact } from '@/lib/types';

export function ContactLinks({ contacts }: { contacts: ListingContact[] }) {
  if (!contacts || contacts.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {contacts.map(({ type, href }) => {
        const meta = CONTACT_META[type];
        if (!meta) return null;
        const { label, Icon } = meta;
        const external = type !== 'phone';
        return (
          <a
            key={type}
            href={href}
            aria-label={label}
            title={label}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            className="grid h-8 w-8 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <Icon className="h-4 w-4" />
          </a>
        );
      })}
    </div>
  );
}
