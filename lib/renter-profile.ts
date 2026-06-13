export interface RenterProfile {
  phone: string;
  city: string;
  bio: string;
}

export const EMPTY_RENTER_PROFILE: RenterProfile = { phone: '', city: '', bio: '' };

/** Coerces an arbitrary Firestore doc into a RenterProfile (missing/non-string → ''). */
export function normalizeRenterProfile(
  data: Record<string, unknown> | null | undefined,
): RenterProfile {
  const str = (v: unknown): string => (typeof v === 'string' ? v : '');
  return {
    phone: str(data?.phone),
    city: str(data?.city),
    bio: str(data?.bio),
  };
}
