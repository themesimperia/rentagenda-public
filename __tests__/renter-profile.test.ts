import { describe, it, expect } from 'vitest';
import { normalizeRenterProfile, EMPTY_RENTER_PROFILE } from '@/lib/renter-profile';

describe('normalizeRenterProfile', () => {
  it('returns empty strings for null/undefined', () => {
    expect(normalizeRenterProfile(null)).toEqual(EMPTY_RENTER_PROFILE);
    expect(normalizeRenterProfile(undefined)).toEqual({ phone: '', city: '', bio: '' });
  });

  it('keeps string fields and ignores extra keys', () => {
    expect(normalizeRenterProfile({ phone: '123', city: 'Iasi', bio: 'hi', extra: 1 })).toEqual({
      phone: '123',
      city: 'Iasi',
      bio: 'hi',
    });
  });

  it('coerces non-string fields to empty strings', () => {
    expect(normalizeRenterProfile({ phone: 5, city: null, bio: undefined })).toEqual({
      phone: '',
      city: '',
      bio: '',
    });
  });
});
