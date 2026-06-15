import { InquiriesPanel } from '@/components/dashboard/InquiriesPanel';

export default function InquiriesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-slate-900">My inquiries</h1>
      <InquiriesPanel filter="all" />
    </div>
  );
}
