import { describe, it, expect } from 'vitest';
import { renterStatusLabel, inquiryTypeLabel } from '@/lib/inquiries';

describe('renterStatusLabel', () => {
  it('maps the owner status to a renter-facing label', () => {
    expect(renterStatusLabel('new')).toBe('Sent');
    expect(renterStatusLabel('read')).toBe('Seen');
    expect(renterStatusLabel('responded')).toBe('Replied');
  });
  it('defaults unknown/empty to Sent', () => {
    expect(renterStatusLabel('whatever')).toBe('Sent');
    expect(renterStatusLabel('')).toBe('Sent');
  });
});

describe('inquiryTypeLabel', () => {
  it('labels viewing vs message', () => {
    expect(inquiryTypeLabel('viewing')).toBe('Viewing request');
    expect(inquiryTypeLabel('message')).toBe('Message');
    expect(inquiryTypeLabel('anything')).toBe('Message');
  });
});
