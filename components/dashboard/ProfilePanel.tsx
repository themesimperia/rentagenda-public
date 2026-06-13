'use client';

import { ProfileCard } from '@/components/dashboard/profile/ProfileCard';
import { ActivityStats } from '@/components/dashboard/profile/ActivityStats';
import { RecentlySaved } from '@/components/dashboard/profile/RecentlySaved';
import { SavedSearchesMini } from '@/components/dashboard/profile/SavedSearchesMini';

export function ProfilePanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_1fr_300px]">
      <ProfileCard />
      <div className="space-y-6">
        <ActivityStats />
        <RecentlySaved />
      </div>
      <SavedSearchesMini />
    </div>
  );
}
