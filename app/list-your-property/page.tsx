import type { Metadata } from 'next';
import { PricingPlans } from '@/components/PricingPlans';

export const metadata: Metadata = {
  title: 'List your property',
  description:
    'Choose a plan to list your property on RentAgenda and manage everything from one dashboard. Reach renters directly with no agent fees.',
};

export default function ListYourPropertyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <PricingPlans />
    </div>
  );
}
