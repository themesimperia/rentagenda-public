'use client';

import { useState } from 'react';
import { Bookmark, User as UserIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useAuthModal } from '@/lib/auth-modal-context';
import { SavedPanel } from '@/components/dashboard/SavedPanel';
import { ProfilePanel } from '@/components/dashboard/ProfilePanel';

type Tab = 'saved' | 'profile';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const { openAuth } = useAuthModal();
  const [tab, setTab] = useState<Tab>('saved');

  if (loading) {
    return (
      <div className="grid min-h-[60vh] place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto grid min-h-[60vh] max-w-md place-items-center px-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Your dashboard</h1>
          <p className="mt-2 text-slate-500">Sign in to see your saved homes.</p>
          <Button onClick={() => openAuth('signin')} className="mt-5 bg-blue-600 hover:bg-blue-700">
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Bookmark }[] = [
    { id: 'saved', label: 'Saved', icon: Bookmark },
    { id: 'profile', label: 'Profile', icon: UserIcon },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">My dashboard</h1>

      <div className="mb-6 flex w-fit gap-1 rounded-full bg-slate-100 p-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === 'saved' ? <SavedPanel /> : <ProfilePanel />}
    </div>
  );
}
