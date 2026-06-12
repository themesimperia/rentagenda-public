import Link from 'next/link';
import { Bookmark, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { relativeTime } from '@/lib/relative-time';
import type { ActivityItem } from '@/lib/dashboard-metrics';

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-900">Recent activity</h3>
      <ul className="space-y-2">
        {items.map(item => {
          const Icon = item.priceDrop ? TrendingDown : Bookmark;
          const body = (
            <div className="flex items-start gap-3 rounded-lg p-1">
              <span
                className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  item.priceDrop ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-slate-700">
                  {item.priceDrop ? (
                    <>
                      Price dropped on{' '}
                      <span className="font-semibold text-slate-900">{item.title}</span> —{' '}
                      {formatPrice(item.priceDrop.from, item.priceDrop.currency)} →{' '}
                      {formatPrice(item.priceDrop.to, item.priceDrop.currency)}
                    </>
                  ) : (
                    <>
                      You saved <span className="font-semibold text-slate-900">{item.title}</span>
                    </>
                  )}
                </p>
                <p className="text-xs text-slate-400">{relativeTime(item.savedAt)}</p>
              </div>
            </div>
          );
          return (
            <li key={item.id}>
              {item.href ? (
                <Link href={item.href} className="block hover:bg-slate-50">
                  {body}
                </Link>
              ) : (
                body
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
