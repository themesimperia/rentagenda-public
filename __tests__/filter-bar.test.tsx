import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FilterBar } from '@/components/FilterBar';
import { EMPTY_FILTERS } from '@/lib/filter';

vi.mock('@/lib/firestore', () => ({
  saveSearch: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: null, loading: false }),
}));

vi.mock('@/lib/auth-modal-context', () => ({
  useAuthModal: () => ({ openAuth: vi.fn(), closeAuth: vi.fn() }),
}));

describe('FilterBar', () => {
  it('emits the edited draft on Apply', () => {
    const onApply = vi.fn();
    render(
      <FilterBar
        value={EMPTY_FILTERS}
        onApply={onApply}
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
      <FilterBar value={EMPTY_FILTERS} onApply={onApply} types={[]} amenities={[]} />,
    );
    rerender(
      <FilterBar
        value={{ ...EMPTY_FILTERS, search: 'Bucharest' }}
        onApply={onApply}
        types={[]}
        amenities={[]}
      />,
    );
    expect((screen.getByLabelText('Search by location') as HTMLInputElement).value).toBe('Bucharest');
  });
});
