import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SavedByTypeChart } from '@/components/dashboard/SavedByTypeChart';

describe('SavedByTypeChart', () => {
  it('renders a legend row per slice and the total', () => {
    render(<SavedByTypeChart slices={[{ label: 'Apartment', count: 2 }, { label: 'House', count: 1 }]} />);
    expect(screen.getByText('Apartment')).toBeInTheDocument();
    expect(screen.getByText('House')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument(); // total in center
  });
});
