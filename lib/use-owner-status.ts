'use client';

import { useCallback, useEffect, useState } from 'react';
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

async function readPlan(uid: string): Promise<PlanId> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return (snap.exists() ? (snap.data().subscription_plan as PlanId | undefined) : undefined) ?? 'free';
  } catch {
    return 'free';
  }
}

/**
 * Reads the signed-in user's subscription_plan from the shared `users/{uid}`
 * doc (same Firebase project as App 1). `subscription_plan` is server-managed,
 * so it can be trusted as the source of truth for paid-owner access.
 *
 * Re-checks when the tab regains focus, so a plan activated in the App 1 tab is
 * picked up on return without a hard reload.
 */
export function useOwnerStatus(): OwnerStatus {
  const { user, loading: authLoading } = useAuth();
  const [plan, setPlan] = useState<PlanId | null>(user ? cache.get(user.uid) ?? null : null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (uid: string, useCache: boolean) => {
    if (useCache && cache.has(uid)) {
      setPlan(cache.get(uid)!);
      setLoading(false);
      return;
    }
    setLoading(true);
    const p = await readPlan(uid);
    cache.set(uid, p);
    setPlan(p);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { setPlan(null); setLoading(false); return; }

    let active = true;
    void refresh(user.uid, true);

    // Re-fetch (bypassing cache) when the user returns to this tab.
    function onVisible() {
      if (document.visibilityState === 'visible' && active && user) {
        void refresh(user.uid, false);
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      active = false;
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [user, authLoading, refresh]);

  return { plan, isPaidOwner: isPaidPlan(plan), loading: loading || authLoading };
}
