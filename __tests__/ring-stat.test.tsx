import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RingStat } from '@/components/dashboard/profile/RingStat';

describe('RingStat', () => {
  it('renders the value and label', () => {
    render(<RingStat label="Saved listings" value={7} total={10} tone="emerald" />);
    expect(screen.getByText('Saved listings')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });
});
