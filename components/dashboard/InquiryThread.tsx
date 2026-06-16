'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Loader2, Send, Check, CheckCheck } from 'lucide-react';
import {
  collection, query, orderBy, onSnapshot, addDoc, doc, setDoc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { relativeTime } from '@/lib/relative-time';
import type { InquiryMessage, SenderRole } from '@/lib/inquiries';

const TYPING_WINDOW_MS = 6000;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tsToMs(v: any): number | null {
  return v?.toMillis?.() ?? null;
}

function Bubble({
  mine,
  body,
  at,
  tick,
}: {
  mine: boolean;
  body: string;
  at: number | null;
  tick?: ReactNode;
}) {
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{body}</p>
        <span className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>
          {at != null && relativeTime(at)}
          {tick}
        </span>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex justify-start">
      <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-3 py-2.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />
      </div>
    </div>
  );
}

export function InquiryThread({
  inquiryId,
  openingMessage,
  openingAt,
  currentUserId,
}: {
  inquiryId: string;
  openingMessage: string | null;
  openingAt?: number | null;
  currentUserId: string;
}) {
  const myRole: SenderRole = 'renter';
  const otherRole: SenderRole = 'owner';

  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTypingAt, setOtherTypingAt] = useState<number | null>(null);
  const [otherReadAt, setOtherReadAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const lastTypingWrite = useRef(0);

  // Tick so the typing indicator expires.
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 2000);
    return () => clearInterval(t);
  }, []);

  // Live messages.
  useEffect(() => {
    const q = query(
      collection(db, 'listing_inquiries', inquiryId, 'messages'),
      orderBy('created_at', 'asc'),
    );
    const unsub = onSnapshot(
      q,
      snap => {
        setMessages(
          snap.docs.map(d => {
            const x = d.data();
            return {
              id: d.id,
              sender_role: x.sender_role === 'owner' ? 'owner' : 'renter',
              sender_id: x.sender_id ?? '',
              body: x.body ?? '',
              created_at: tsToMs(x.created_at),
            };
          }),
        );
        setLoading(false);
      },
      () => setLoading(false),
    );
    return () => unsub();
  }, [inquiryId]);

  // Other side's typing + read cursor.
  useEffect(() => {
    const unsubT = onSnapshot(doc(db, 'listing_inquiries', inquiryId, 'typing', otherRole), d =>
      setOtherTypingAt(tsToMs(d.data()?.at)),
    );
    const unsubR = onSnapshot(doc(db, 'listing_inquiries', inquiryId, 'reads', otherRole), d =>
      setOtherReadAt(tsToMs(d.data()?.at)),
    );
    return () => { unsubT(); unsubR(); };
  }, [inquiryId]);

  // Mark my read cursor when the thread opens and on new messages.
  useEffect(() => {
    setDoc(
      doc(db, 'listing_inquiries', inquiryId, 'reads', myRole),
      { sender_id: currentUserId, at: serverTimestamp() },
      { merge: true },
    ).catch(() => {});
    updateDoc(doc(db, 'listing_inquiries', inquiryId), { renter_unread: false }).catch(() => {});
  }, [inquiryId, currentUserId, messages.length]);

  function onType(value: string) {
    setBody(value);
    const t = Date.now();
    if (t - lastTypingWrite.current > 2000) {
      lastTypingWrite.current = t;
      setDoc(
        doc(db, 'listing_inquiries', inquiryId, 'typing', myRole),
        { sender_id: currentUserId, at: serverTimestamp() },
        { merge: true },
      ).catch(() => {});
    }
  }

  async function send() {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'listing_inquiries', inquiryId, 'messages'), {
        sender_role: myRole,
        sender_id: currentUserId,
        body: text,
        created_at: serverTimestamp(),
      });
      // Re-flag the thread so the owner gets a fresh "new" badge in App 1.
      updateDoc(doc(db, 'listing_inquiries', inquiryId), { owner_unread: true }).catch(() => {});
      setBody('');
      setDoc(
        doc(db, 'listing_inquiries', inquiryId, 'typing', myRole),
        { sender_id: currentUserId, at: null },
        { merge: true },
      ).catch(() => {});
    } finally {
      setSending(false);
    }
  }

  const otherTyping = otherTypingAt != null && now - otherTypingAt < TYPING_WINDOW_MS;

  function readTick(at: number | null): ReactNode {
    const read = at != null && otherReadAt != null && otherReadAt >= at;
    return read ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />;
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="space-y-2">
        {openingMessage && (
          <Bubble mine body={openingMessage} at={openingAt ?? null} tick={readTick(openingAt ?? null)} />
        )}
        {loading ? (
          <p className="text-xs text-slate-400">Loading conversation…</p>
        ) : (
          messages.map(m => (
            <Bubble
              key={m.id}
              mine={m.sender_role === myRole}
              body={m.body}
              at={m.created_at}
              tick={m.sender_role === myRole ? readTick(m.created_at) : undefined}
            />
          ))
        )}
        {otherTyping && <TypingDots />}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={body}
          onChange={e => onType(e.target.value)}
          placeholder="Write a reply…"
          aria-label="Reply"
          rows={2}
          className="min-w-0 flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="button"
          onClick={send}
          disabled={sending || !body.trim()}
          className="flex h-9 items-center gap-1.5 rounded-full bg-blue-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send
        </button>
      </div>
    </div>
  );
}
