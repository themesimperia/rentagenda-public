import { describe, it, expect } from 'vitest';
import { relativeTime } from '@/lib/relative-time';

const NOW = new Date('2026-06-12T12:00:00Z').getTime();
const sec = 1000;
const min = 60 * sec;
const hour = 60 * min;
const day = 24 * hour;

describe('relativeTime', () => {
  it('returns "just now" under a minute', () => {
    expect(relativeTime(NOW - 30 * sec, NOW)).toBe('just now');
  });
  it('returns minutes', () => {
    expect(relativeTime(NOW - 5 * min, NOW)).toBe('5 minutes ago');
    expect(relativeTime(NOW - 1 * min, NOW)).toBe('1 minute ago');
  });
  it('returns hours', () => {
    expect(relativeTime(NOW - 3 * hour, NOW)).toBe('3 hours ago');
    expect(relativeTime(NOW - 1 * hour, NOW)).toBe('1 hour ago');
  });
  it('returns days under a week', () => {
    expect(relativeTime(NOW - 2 * day, NOW)).toBe('2 days ago');
    expect(relativeTime(NOW - 1 * day, NOW)).toBe('1 day ago');
  });
  it('returns a formatted date a week or more out', () => {
    // 10 days before 2026-06-12 = 2026-06-02
    expect(relativeTime(NOW - 10 * day, NOW)).toBe('Jun 2');
  });
});
