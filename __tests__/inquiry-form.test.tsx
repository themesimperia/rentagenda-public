import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const createInquiry = vi.fn();
vi.mock('@/lib/firestore', () => ({
  createInquiry: (...a: unknown[]) => createInquiry(...a),
}));
vi.mock('@/lib/auth-context', () => ({ useAuth: () => ({ user: null }) }));

import { InquiryForm } from '@/components/InquiryForm';
import type { PublicListing } from '@/lib/types';

const listing = { id: 'L1', apartment_id: 'a1', owner_id: 'o1' } as PublicListing;

beforeEach(() => {
  createInquiry.mockReset().mockResolvedValue(undefined);
});

describe('InquiryForm', () => {
  it('passes the intent to createInquiry', async () => {
    render(<InquiryForm listing={listing} intent="viewing" />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }));
    await waitFor(() => expect(createInquiry).toHaveBeenCalled());
    expect(createInquiry).toHaveBeenCalledWith(listing, expect.any(Object), 'viewing', null);
  });

  it('defaults intent to message', async () => {
    render(<InquiryForm listing={listing} />);
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'jane@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: /send inquiry/i }));
    await waitFor(() => expect(createInquiry).toHaveBeenCalled());
    expect(createInquiry).toHaveBeenCalledWith(listing, expect.any(Object), 'message', null);
  });
});
