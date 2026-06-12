import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

let mockUser: { uid: string } | null = { uid: 'u1' };
const toggleSave = vi.fn();
let saved = false;
const openAuth = vi.fn();

vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: mockUser }) }));
vi.mock('@/lib/saved-listings-context', () => ({
  useSavedListings: () => ({ isSaved: () => saved, toggleSave }),
}));
vi.mock('@/lib/auth-modal-context', () => ({ useAuthModal: () => ({ openAuth }) }));

import { SaveButton } from '@/components/SaveButton';
import type { PublicListing } from '@/lib/types';

const listing = { id: 'L1', title: 'X' } as PublicListing;

beforeEach(() => {
  mockUser = { uid: 'u1' };
  saved = false;
  toggleSave.mockReset();
  openAuth.mockReset();
});

describe('SaveButton', () => {
  it('reflects saved state via aria-pressed', () => {
    saved = true;
    render(<SaveButton listing={listing} />);
    expect(screen.getByRole('button').getAttribute('aria-pressed')).toBe('true');
  });

  it('logged-in click toggles save', () => {
    render(<SaveButton listing={listing} />);
    screen.getByRole('button').click();
    expect(toggleSave).toHaveBeenCalledWith(listing);
    expect(openAuth).not.toHaveBeenCalled();
  });

  it('logged-out click opens auth instead of saving', () => {
    mockUser = null;
    render(<SaveButton listing={listing} />);
    screen.getByRole('button').click();
    expect(openAuth).toHaveBeenCalledWith('signin');
    expect(toggleSave).not.toHaveBeenCalled();
  });
});
