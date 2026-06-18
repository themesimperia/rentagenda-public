'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { FALLBACK_PLANS, PLAN_ICONS, type Plan, type PlanIconKey } from './plans';

// Shared config document both apps read.
const PLANS_DOC = ['public_config', 'subscription_plans'] as const;

let cache: Plan[] | null = null;

/** Validate a Firestore plan row, falling back to safe defaults. */
function normalize(raw: unknown): Plan | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== 'string' || typeof r.name !== 'string') return null;
  const icon = (typeof r.icon === 'string' && r.icon in PLAN_ICONS ? r.icon : 'zap') as PlanIconKey;
  return {
    id: r.id as Plan['id'],
    name: r.name,
    icon,
    monthly: typeof r.monthly === 'number' ? r.monthly : 0,
    annual: typeof r.annual === 'number' ? r.annual : 0,
    description: typeof r.description === 'string' ? r.description : '',
    features: Array.isArray(r.features) ? r.features.filter((f): f is string => typeof f === 'string') : [],
    limitations: Array.isArray(r.limitations)
      ? r.limitations.filter((f): f is string => typeof f === 'string')
      : undefined,
    popular: r.popular === true,
  };
}

/**
 * Returns the subscription plans, read from the shared Firestore config so the
 * marketplace and App 1 stay in sync. Falls back to FALLBACK_PLANS when the doc
 * is missing or malformed, so the page always renders.
 */
export function usePlans(): Plan[] {
  const [plans, setPlans] = useState<Plan[]>(cache ?? FALLBACK_PLANS);

  useEffect(() => {
    if (cache) { setPlans(cache); return; }
    let active = true;
    getDoc(doc(db, ...PLANS_DOC))
      .then(snap => {
        if (!active) return;
        const arr = snap.exists() ? (snap.data().plans as unknown) : null;
        if (Array.isArray(arr)) {
          const parsed = arr.map(normalize).filter((p): p is Plan => p !== null);
          if (parsed.length) { cache = parsed; setPlans(parsed); return; }
        }
        cache = FALLBACK_PLANS;
      })
      .catch(() => { /* keep fallback */ });
    return () => { active = false; };
  }, []);

  return plans;
}
