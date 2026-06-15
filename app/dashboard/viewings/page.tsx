import { InquiriesPanel } from '@/components/dashboard/InquiriesPanel';

export default function ViewingsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">Viewing requests</h1>
      <InquiriesPanel filter="viewing" />
    </div>
  );
}
