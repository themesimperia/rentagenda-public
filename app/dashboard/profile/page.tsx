import { ProfilePanel } from '@/components/dashboard/ProfilePanel';
import { OwnerCta } from '@/components/dashboard/OwnerCta';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <OwnerCta />
      <ProfilePanel />
    </div>
  );
}
