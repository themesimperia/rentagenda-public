import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProfileCard } from '@/components/dashboard/profile/ProfileCard';

vi.mock('@/lib/firestore', () => ({
  getRenterProfile: vi.fn().mockResolvedValue({ phone: '', city: '', bio: '' }),
  saveRenterProfile: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/auth-context', () => ({
  useAuth: () => ({
    user: {
      uid: 'u1',
      displayName: 'Ada',
      email: 'ada@example.com',
      emailVerified: true,
      photoURL: null,
      metadata: {},
    },
    updateDisplayName: vi.fn().mockResolvedValue(undefined),
    signOutUser: vi.fn(),
  }),
}));

describe('ProfileCard', () => {
  it('reveals the edit inputs when Edit is clicked', () => {
    render(<ProfileCard />);
    fireEvent.click(screen.getByText('Edit'));
    expect(screen.getByLabelText('Phone')).toBeInTheDocument();
    expect(screen.getByLabelText('City')).toBeInTheDocument();
    expect(screen.getByLabelText('About me')).toBeInTheDocument();
  });
});
