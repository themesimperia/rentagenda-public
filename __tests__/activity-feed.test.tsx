import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import type { ActivityItem } from '@/lib/dashboard-metrics';

const items: ActivityItem[] = [
  { id: 'A', title: 'Sunny flat', href: '/listing/A', savedAt: Date.now(), priceDrop: { from: 1000, to: 900, currency: 'EUR' } },
  { id: 'B', title: 'City loft', href: '/listing/B', savedAt: Date.now(), priceDrop: null },
];

describe('ActivityFeed', () => {
  it('renders a price-drop entry and a saved entry', () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByText('Sunny flat')).toBeInTheDocument();
    expect(screen.getByText('City loft')).toBeInTheDocument();
    expect(screen.getByText(/Price dropped on/)).toBeInTheDocument();
    expect(screen.getByText(/You saved/)).toBeInTheDocument();
  });
});
