import { InquiriesPanel } from '@/components/dashboard/InquiriesPanel';

export default function ViewingsPage() {
  return (
    <div className="space-y-6">
      <InquiriesPanel filter="viewing" title="Viewing requests" />
    </div>
  );
}
