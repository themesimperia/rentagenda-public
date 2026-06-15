'use client';

import { useEffect, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { getInquiryMessages, sendInquiryMessage } from '@/lib/firestore';
import { relativeTime } from '@/lib/relative-time';
import type { InquiryMessage, SenderRole } from '@/lib/inquiries';

function Bubble({ role, body, at }: { role: SenderRole; body: string; at?: number | null }) {
  const mine = role === 'renter';
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
          mine ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-800'
        }`}
      >
        <p className="whitespace-pre-wrap">{body}</p>
        {at != null && (
          <p className={`mt-1 text-[10px] ${mine ? 'text-blue-100' : 'text-slate-400'}`}>
            {relativeTime(at)}
          </p>
        )}
      </div>
    </div>
  );
}

export function InquiryThread({
  inquiryId,
  openingMessage,
  currentUserId,
}: {
  inquiryId: string;
  openingMessage: string | null;
  currentUserId: string;
}) {
  const [messages, setMessages] = useState<InquiryMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const m = await getInquiryMessages(inquiryId).catch(() => []);
      if (active) {
        setMessages(m);
        setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [inquiryId]);

  async function send() {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    try {
      await sendInquiryMessage(inquiryId, {
        sender_role: 'renter',
        sender_id: currentUserId,
        body: text,
      });
      setMessages(prev => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          sender_role: 'renter',
          sender_id: currentUserId,
          body: text,
          created_at: Date.now(),
        },
      ]);
      setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      <div className="space-y-2">
        {openingMessage && <Bubble role="renter" body={openingMessage} />}
        {loading ? (
          <p className="text-xs text-slate-400">Loading conversation…</p>
        ) : (
          messages.map(m => <Bubble key={m.id} role={m.sender_role} body={m.body} at={m.created_at} />)
        )}
        {!loading && !openingMessage && messages.length === 0 && (
          <p className="text-xs text-slate-400">No messages yet — say hello.</p>
        )}
      </div>

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
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
