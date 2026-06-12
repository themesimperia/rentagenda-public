import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// Mock the auth context to control the "logged in" user.
const mockUser = { uid: 'u1' };
vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: mockUser, loading: false }),
}));

// Mock the Firestore data layer.
const getSavedListingIds = vi.fn();
const saveListing = vi.fn();
const unsaveListing = vi.fn();
vi.mock('@/lib/firestore', () => ({
  getSavedListingIds: (...a: unknown[]) => getSavedListingIds(...a),
  saveListing: (...a: unknown[]) => saveListing(...a),
  unsaveListing: (...a: unknown[]) => unsaveListing(...a),
}));

import { SavedListingsProvider, useSavedListings } from '@/lib/saved-listings-context';
import type { PublicListing } from '@/lib/types';

const fakeListing = { id: 'L1' } as PublicListing;

function Probe() {
  const { isSaved, toggleSave } = useSavedListings();
  return (
    <div>
      <span data-testid="state">{isSaved('L1') ? 'saved' : 'unsaved'}</span>
      <button onClick={() => toggleSave(fakeListing)}>toggle</button>
    </div>
  );
}

beforeEach(() => {
  getSavedListingIds.mockReset().mockResolvedValue(['L1']);
  saveListing.mockReset().mockResolvedValue(undefined);
  unsaveListing.mockReset().mockResolvedValue(undefined);
});

describe('SavedListingsProvider', () => {
  it('loads saved ids on mount', async () => {
    await act(async () => {
      render(<SavedListingsProvider><Probe /></SavedListingsProvider>);
    });
    expect(screen.getByTestId('state').textContent).toBe('saved');
  });

  it('toggleSave optimistically removes a saved listing', async () => {
    await act(async () => {
      render(<SavedListingsProvider><Probe /></SavedListingsProvider>);
    });
    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('state').textContent).toBe('unsaved');
    expect(unsaveListing).toHaveBeenCalledWith('u1', 'L1');
  });

  it('rolls back on a failed write', async () => {
    unsaveListing.mockRejectedValueOnce(new Error('nope'));
    await act(async () => {
      render(<SavedListingsProvider><Probe /></SavedListingsProvider>);
    });
    await act(async () => {
      screen.getByText('toggle').click();
    });
    expect(screen.getByTestId('state').textContent).toBe('saved');
  });
});
