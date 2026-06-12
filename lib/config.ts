/** The owner/management app URL. Override per-environment with
 * NEXT_PUBLIC_OWNER_APP_URL; falls back to production. */
export const OWNER_APP_URL =
  process.env.NEXT_PUBLIC_OWNER_APP_URL ?? 'https://rent-agenda.vercel.app';
