import { InquiriesPanel } from '@/components/dashboard/InquiriesPanel';

export default function InquiriesPage() {
  return (
    <div className="space-y-6">
      <InquiriesPanel filter="all" title="My inquiries" />
    </div>
  );
}
