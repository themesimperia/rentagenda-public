const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Human-friendly relative time. Falls back to a short date a week or more out.
 *  `now` is injectable for deterministic tests. */
export function relativeTime(epochMs: number, now: number = Date.now()): string {
  const diff = now - epochMs;
  if (diff < MIN) return 'just now';
  if (diff < HOUR) {
    const n = Math.floor(diff / MIN);
    return `${n} minute${n === 1 ? '' : 's'} ago`;
  }
  if (diff < DAY) {
    const n = Math.floor(diff / HOUR);
    return `${n} hour${n === 1 ? '' : 's'} ago`;
  }
  if (diff < 7 * DAY) {
    const n = Math.floor(diff / DAY);
    return `${n} day${n === 1 ? '' : 's'} ago`;
  }
  return new Date(epochMs).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
