import { ProfilePanel } from '@/components/dashboard/ProfilePanel';

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Profile</h1>
      <ProfilePanel />
    </div>
  );
}
