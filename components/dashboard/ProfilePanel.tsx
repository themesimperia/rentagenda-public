'use client';

import { useState } from 'react';
import { Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';

function initials(s: string): string {
  const base = s.includes('@') ? s.split('@')[0] : s;
  return base.split(/[\s._-]+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export function ProfilePanel() {
  const { user, signOutUser, updateDisplayName } = useAuth();
  const [name, setName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function save() {
    setSaving(true);
    try {
      await updateDisplayName(name.trim());
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-md space-y-6">
      <div className="flex items-center gap-4">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-16 w-16 rounded-full object-cover" />
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-full bg-blue-100 text-lg font-semibold text-blue-700">
            {initials(user.displayName || user.email || '?')}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-900">{user.displayName || 'Renter'}</p>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="display-name" className="text-sm font-medium text-slate-700">
          Display name
        </label>
        <div className="flex gap-2">
          <Input id="display-name" value={name} onChange={e => setName(e.target.value)} />
          <Button onClick={save} disabled={saving || !name.trim()} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save
          </Button>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={() => signOutUser()}
        className="text-red-600 hover:bg-red-50"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </div>
  );
}
