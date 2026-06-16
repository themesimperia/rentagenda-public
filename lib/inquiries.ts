import type { InquiryIntent } from '@/lib/types';

export type InquiryStatus = 'new' | 'read' | 'responded';

export interface Inquiry {
  id: string;
  listing_id: string;
  listing_title: string;
  owner_id: string;
  renter_id: string | null;
  inquiry_type: InquiryIntent;
  message: string | null;
  status: InquiryStatus;
  created_at: number | null; // epoch ms
  renter_unread?: boolean;
  /** Unread owner replies for this inquiry (per message). */
  renter_unread_count?: number;
}

/** Owner-side status → renter-facing label. */
export function renterStatusLabel(status: string): 'Sent' | 'Seen' | 'Replied' {
  if (status === 'responded') return 'Replied';
  if (status === 'read') return 'Seen';
  return 'Sent';
}

export function inquiryTypeLabel(type: string): 'Message' | 'Viewing request' {
  return type === 'viewing' ? 'Viewing request' : 'Message';
}

export type SenderRole = 'renter' | 'owner';

export interface InquiryMessage {
  id: string;
  sender_role: SenderRole;
  sender_id: string;
  body: string;
  created_at: number | null; // epoch ms
}
