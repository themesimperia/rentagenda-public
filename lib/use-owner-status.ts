'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';
import { isPaidPlan, type PlanId } from './plans';

export interface OwnerStatus {
  plan: PlanId | null;
  isPaidOwner: boolean;
  loading: boolean;
}

// Per-uid session cache so we don't re-hit Firestore on every component mount.
const cache = new Map<string, PlanId>();

/**
 * Reads the signed-in user's subscription_plan from the shared `users/{uid}`
 * doc (same Firebase project as App 1). `subscription_plan` is server-managed,
 * so it can be trusted as the source of truth for paid-owner access.
 */
export function useOwnerStatus(): OwnerStatus {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<PlanId | null>(user ? cache.get(user.uid) ?? null : null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPlan(null); setLoading(false); return; }

    const cached = cache.get(user.uid);
    if (cached) { setPlan(cached); setLoading(false); return; }

    let active = true;
    setLoading(true);
    getDoc(doc(db, 'users', user.uid))
      .then(snap => {
        if (!active) return;
        const p = (snap.exists() ? (snap.data().subscription_plan as PlanId | undefined) : undefined) ?? 'free';
        cache.set(user.uid, p);
        setPlan(p);
      })
      .catch(() => { if (active) setPlan('free'); })
      .finally(() => { if (active) setLoading(false); });

    return () => { active = false; };
  }, [user, authLoading]);

  return { plan, isPaidOwner: isPaidPlan(plan), loading: loading || authLoading };
}
