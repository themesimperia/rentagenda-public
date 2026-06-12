import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PriceBucketsChart } from '@/components/dashboard/PriceBucketsChart';

describe('PriceBucketsChart', () => {
  it('renders a row per bucket with its label and count', () => {
    render(
      <PriceBucketsChart
        buckets={[
          { label: '< 500', count: 1 },
          { label: '500–1000', count: 3 },
        ]}
      />,
    );
    expect(screen.getByText('< 500')).toBeInTheDocument();
    expect(screen.getByText('500–1000')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
