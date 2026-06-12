import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';
import { EMPTY_FILTERS } from '@/lib/filter';

describe('FilterBar', () => {
  it('emits the edited draft on Apply', () => {
    const onApply = vi.fn();
    render(
      <FilterBar
        value={EMPTY_FILTERS}
        onApply={onApply}
        locations={[]}
        types={['apartment']}
        amenities={[]}
      />,
    );
    fireEvent.change(screen.getByLabelText('Search by location'), {
      target: { value: 'Chisinau' },
    });
    fireEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledWith(expect.objectContaining({ search: 'Chisinau' }));
  });

  it('re-seeds the draft when the committed value changes', () => {
    const onApply = vi.fn();
    const { rerender } = render(
      <FilterBar value={EMPTY_FILTERS} onApply={onApply} locations={[]} types={[]} amenities={[]} />,
    );
    rerender(
      <FilterBar
        value={{ ...EMPTY_FILTERS, search: 'Bucharest' }}
        onApply={onApply}
        locations={[]}
        types={[]}
        amenities={[]}
      />,
    );
    expect((screen.getByLabelText('Search by location') as HTMLInputElement).value).toBe('Bucharest');
  });
});
