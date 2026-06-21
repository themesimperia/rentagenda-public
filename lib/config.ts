/** The owner/management app URL. Override per-environment with
 * NEXT_PUBLIC_OWNER_APP_URL; falls back to production. */
export const OWNER_APP_URL =
  process.env.NEXT_PUBLIC_OWNER_APP_URL ?? 'https://rent-agenda.vercel.app';

/** App 1 subscription/upgrade screen — where marketplace plan CTAs send users. */
export const OWNER_SUBSCRIBE_URL = `${OWNER_APP_URL}/Subscriptions`;

/** App 1 public landing page — where a renter goes to create an owner account
 * and list a property. Payment/plans are handled entirely in App 1. The
 * `ref=marketplace` flag tells App 1 to show the landing page instead of
 * auto-redirecting an already-logged-in user to their dashboard. */
export const OWNER_LANDING_URL = `${OWNER_APP_URL}/Landing?ref=marketplace`;
