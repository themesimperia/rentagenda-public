import { SavedPanel } from '@/components/dashboard/SavedPanel';

export default function SavedPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Saved listings</h1>
      <SavedPanel />
    </div>
  );
}
