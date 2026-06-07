import type { Metadata } from 'next';
import { MarketplaceDashboard } from '@/components/MarketplaceDashboard';

export const metadata: Metadata = {
  title: 'Browse properties',
  description:
    'Filter apartments, houses, villas, offices, and vacation rentals published directly by verified owners.',
};

export default function ListingsPage() {
  return <MarketplaceDashboard />;
}
