// lucide-react v1 doesn't ship social-brand icons (Instagram, Facebook, Linkedin, Twitter).
// We fall back to generic icons that are available in the installed version.
import {
  Phone,
  AtSign,   // instagram fallback
  Share2,   // facebook fallback
  Briefcase, // linkedin fallback
  Hash,     // X (twitter) fallback
  Send,
  Globe,
  type LucideIcon,
} from 'lucide-react';
import type { ContactType } from '@/lib/types';

export const CONTACT_META: Record<ContactType, { label: string; Icon: LucideIcon }> = {
  phone:     { label: 'Phone',     Icon: Phone },
  instagram: { label: 'Instagram', Icon: AtSign },
  facebook:  { label: 'Facebook',  Icon: Share2 },
  linkedin:  { label: 'LinkedIn',  Icon: Briefcase },
  x:         { label: 'X',         Icon: Hash },
  telegram:  { label: 'Telegram',  Icon: Send },
  website:   { label: 'Website',   Icon: Globe },
};
