'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

type AuthMode = 'signin' | 'signup';

interface AuthModalValue {
  openAuth: (mode?: AuthMode) => void;
  closeAuth: () => void;
}

const AuthModalContext = createContext<AuthModalValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<AuthMode>('signin');

  const openAuth = useCallback((m: AuthMode = 'signin') => {
    setMode(m);
    setOpen(true);
  }, []);
  const closeAuth = useCallback(() => setOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ openAuth, closeAuth }}>
      {children}
      <AuthModal open={open} initialMode={mode} onClose={closeAuth} />
    </AuthModalContext.Provider>
  );
}

export function useAuthModal(): AuthModalValue {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within an AuthModalProvider');
  return ctx;
}
