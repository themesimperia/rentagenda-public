import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Bookmark } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';

describe('StatCard', () => {
  it('renders the label and value', () => {
    render(<StatCard icon={Bookmark} label="Saved listings" value={3} />);
    expect(screen.getByText('Saved listings')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
