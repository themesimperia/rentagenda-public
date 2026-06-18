import type { LucideIcon } from 'lucide-react';
import { Zap, Crown, Building2 } from 'lucide-react';

export type PlanId = 'free' | 'owner' | 'agency';
export type BillingCycle = 'monthly' | 'annual';

export interface Plan {
  id: PlanId;
  name: string;
  icon: LucideIcon;
  /** Price in whole dollars. */
  monthly: number;
  /** Annual total (2 months free vs monthly × 12). */
  annual: number;
  description: string;
  features: string[];
  limitations?: string[];
  popular?: boolean;
}

// Mirrors App 1 (src/pages/Subscriptions.jsx). Monthly prices match App 1;
// annual = monthly × 10 (two months free).
export const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    icon: Zap,
    monthly: 0,
    annual: 0,
    description: 'Perfect for getting started',
    features: [
      'Up to 1 apartment',
      'Basic rent tracking',
      'Tenant management',
      'Limited reports',
    ],
    limitations: [
      'No maintenance tracking',
      'No financial analytics',
      'No automated notifications',
    ],
  },
  {
    id: 'owner',
    name: 'Owner',
    icon: Crown,
    monthly: 29,
    annual: 290,
    description: 'Full access for property owners',
    features: [
      'Unlimited apartments',
      'Full maintenance tracking',
      'Advanced analytics',
      'Automated notifications',
      'Financial reports',
      'Email & Telegram messaging',
      'Priority support',
    ],
    popular: true,
  },
  {
    id: 'agency',
    name: 'Agency',
    icon: Building2,
    monthly: 99,
    annual: 990,
    description: 'For property management agencies',
    features: [
      'Everything in Owner',
      'Multi-branch management',
      'Custom commission rates',
      'Staff & user management',
      'White-label options',
      'API access',
      'Dedicated support',
    ],
  },
];

/** A user with this plan has paid owner access. */
export function isPaidPlan(plan: PlanId | null | undefined): boolean {
  return plan === 'owner' || plan === 'agency';
}

export function planLabel(plan: PlanId | null | undefined): string {
  return PLANS.find(p => p.id === plan)?.name ?? 'Free';
}
