'use client';

import { useEffect, useState } from 'react';
import { BadgeCheck, Loader2, LogOut, Mail, MapPin, Phone, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/lib/auth-context';
import { getRenterProfile, saveRenterProfile } from '@/lib/firestore';
import { EMPTY_RENTER_PROFILE, type RenterProfile } from '@/lib/renter-profile';

function initials(s: string): string {
  const base = s.includes('@') ? s.split('@')[0] : s;
  return base.split(/[\s._-]+/).slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('');
}

export function ProfileCard() {
  const { user, updateDisplayName, signOutUser } = useAuth();
  const [profile, setProfile] = useState<RenterProfile>(EMPTY_RENTER_PROFILE);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [draft, setDraft] = useState<RenterProfile>(EMPTY_RENTER_PROFILE);

  useEffect(() => {
    if (!user) return;
    let active = true;
    setLoading(true);
    getRenterProfile(user.uid)
      .then(p => { if (active) setProfile(p); })
      .catch(() => { if (active) setProfile(EMPTY_RENTER_PROFILE); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user]);

  if (!user) return null;

  function startEdit() {
    setName(user.displayName ?? '');
    setDraft(profile);
    setEditing(true);
  }

  async function save() {
    setSaving(true);
    try {
      await updateDisplayName(name.trim());
      await saveRenterProfile(user.uid, draft);
      setProfile(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  const memberSince = user.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {user.photoURL ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.photoURL} alt="" className="h-20 w-20 rounded-full object-cover" />
        ) : (
          <span className="grid h-20 w-20 place-items-center rounded-full bg-blue-100 text-xl font-semibold text-blue-700">
            {initials(user.displayName || user.email || '?')}
          </span>
        )}
        <div className="mt-3 flex items-center gap-1.5">
          <p className="font-semibold text-slate-900">{user.displayName || 'Renter'}</p>
          {user.emailVerified && <BadgeCheck className="h-4 w-4 text-blue-600" />}
        </div>
        {memberSince && <p className="text-xs text-slate-400">Member since {memberSince}</p>}
      </div>

      {editing ? (
        <div className="mt-6 space-y-3">
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Display name" aria-label="Display name" />
          <Input value={draft.phone} onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} placeholder="Phone" aria-label="Phone" />
          <Input value={draft.city} onChange={e => setDraft(d => ({ ...d, city: e.target.value }))} placeholder="City" aria-label="City" />
          <textarea
            value={draft.bio}
            onChange={e => setDraft(d => ({ ...d, bio: e.target.value }))}
            placeholder="About me"
            aria-label="About me"
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving} className="flex-1 bg-blue-600 hover:bg-blue-700">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save
            </Button>
            <Button variant="outline" onClick={() => setEditing(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6 space-y-2.5 text-sm">
          <p className="flex items-center gap-2 text-slate-600">
            <Mail className="h-4 w-4 shrink-0 text-slate-400" />
            <span className="truncate">{user.email}</span>
          </p>
          {!loading && profile.phone && (
            <p className="flex items-center gap-2 text-slate-600">
              <Phone className="h-4 w-4 shrink-0 text-slate-400" />
              {profile.phone}
            </p>
          )}
          {!loading && profile.city && (
            <p className="flex items-center gap-2 text-slate-600">
              <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
              {profile.city}
            </p>
          )}
          {!loading && profile.bio && <p className="pt-1 text-slate-600">{profile.bio}</p>}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={startEdit} className="flex-1">
              <Pencil className="mr-2 h-4 w-4" /> Edit
            </Button>
            <Button variant="outline" onClick={() => signOutUser()} className="text-red-600 hover:bg-red-50">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
