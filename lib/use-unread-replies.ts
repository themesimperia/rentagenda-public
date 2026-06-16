'use client';

import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { useAuth } from './auth-context';

/**
 * Realtime count of unread owner replies across the signed-in renter's
 * inquiries. Each owner message bumps the inquiry's `renter_unread_count`;
 * opening the thread resets it to 0. So the total counts individual messages
 * (3 replies in one thread → 3), not threads. Legacy rows without the counter
 * fall back to the boolean `renter_unread` (counts as 1).
 */
export function useUnreadReplies(): number {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) { setCount(0); return undefined; }
    const q = query(collection(db, 'listing_inquiries'), where('renter_id', '==', user.uid));
    const unsub = onSnapshot(
      q,
      snap => {
        let total = 0;
        snap.forEach(d => {
          const data = d.data();
          if (typeof data.renter_unread_count === 'number') total += data.renter_unread_count;
          else if (data.renter_unread === true) total += 1;
        });
        setCount(total);
      },
      () => setCount(0),
    );
    return () => unsub();
  }, [user]);

  return count;
}
