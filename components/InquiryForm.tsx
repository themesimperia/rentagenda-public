'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { createInquiry } from '@/lib/firestore';
import type { PublicListing, InquiryFormData, InquiryIntent } from '@/lib/types';
import { CheckCircle2 } from 'lucide-react';

const EMPTY: InquiryFormData = {
  guest_name: '',
  guest_email: '',
  guest_phone: '',
  message: '',
};

export function InquiryForm({
  listing,
  intent = 'message',
}: {
  listing: PublicListing;
  intent?: InquiryIntent;
}) {
  const [form, setForm] = useState<InquiryFormData>(EMPTY);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');

  function set(key: keyof InquiryFormData, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.guest_name.trim() || !form.guest_email.trim()) {
      setError('Name and email are required.');
      return;
    }
    setError('');
    setStatus('submitting');
    try {
      await createInquiry(listing, form, intent);
      setStatus('success');
      setForm(EMPTY);
    } catch {
      setStatus('error');
      setError('Something went wrong. Please try again.');
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-500" />
        <p className="font-medium text-slate-900">Inquiry sent!</p>
        <p className="text-sm text-slate-500">The owner will get back to you soon.</p>
        <Button variant="outline" size="sm" onClick={() => setStatus('idle')}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={form.guest_name}
          onChange={e => set('guest_name', e.target.value)}
          placeholder="Your full name"
          required
        />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={form.guest_email}
          onChange={e => set('guest_email', e.target.value)}
          placeholder="you@example.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="phone">Phone (optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={form.guest_phone ?? ''}
          onChange={e => set('guest_phone', e.target.value)}
          placeholder="+1 555 000 0000"
        />
      </div>
      <div>
        <Label htmlFor="message">Message (optional)</Label>
        <Textarea
          id="message"
          value={form.message ?? ''}
          onChange={e => set('message', e.target.value)}
          placeholder="I'm interested in this property. When can I schedule a viewing?"
          rows={4}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" className="w-full" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending…' : 'Send inquiry'}
      </Button>
      <p className="text-center text-xs text-slate-400">
        Your details are only shared with the property owner.
      </p>
    </form>
  );
}
