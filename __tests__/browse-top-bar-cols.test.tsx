import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowseTopBar } from '@/components/BrowseTopBar';
import { EMPTY_FILTERS } from '@/lib/filter';

describe('BrowseTopBar column toggle', () => {
  it('calls onColsChange with the chosen column count', () => {
    const onColsChange = vi.fn();
    render(
      <BrowseTopBar
        filters={EMPTY_FILTERS}
        onFiltersChange={() => {}}
        resultCount={0}
        loading={false}
        sortBy="relevant"
        onSortChange={() => {}}
        view="grid"
        onViewChange={() => {}}
        cols={2}
        onColsChange={onColsChange}
      />,
    );
    fireEvent.click(screen.getByLabelText('3 columns'));
    expect(onColsChange).toHaveBeenCalledWith(3);
  });
});
