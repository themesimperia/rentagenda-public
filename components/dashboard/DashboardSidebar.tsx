'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Building2,
  LayoutDashboard,
  Bookmark,
  User,
  SlidersHorizontal,
  MessageSquare,
  CalendarClock,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/saved', label: 'Saved', icon: Bookmark },
  { href: '/dashboard/searches', label: 'Searches', icon: SlidersHorizontal },
  { href: '/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/dashboard/viewings', label: 'Viewings', icon: CalendarClock },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-slate-100 bg-white lg:w-60">
      <Link href="/" className="flex h-16 items-center gap-2 px-4 font-bold text-slate-900">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-600 text-white">
          <Building2 className="h-5 w-5" />
        </span>
        <span className="hidden text-lg lg:inline">RentAgenda</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        {NAV.map(item => {
          const Icon = item.icon;
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="hidden lg:inline">{item.label}</span>
            </Link>
          );
        })}

      </nav>
    </aside>
  );
}
