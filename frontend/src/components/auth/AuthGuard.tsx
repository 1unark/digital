// context/AuthGuard.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/login' 
}: AuthGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        router.push(redirectTo);
      } else if (!requireAuth && user) {
        // Redirect authenticated users away from auth pages
        router.push('/feed/all');
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
<div className="flex gap-1">
  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.1s]"></div>
  <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
</div>          <p className="mt-4 text-gray-600"></p>
        </div>
      </div>
    );
  }

  // If requiring auth and no user, don't render (redirect will happen)
  if (requireAuth && !user) {
    return null;
  }

  // If not requiring auth but user exists, don't render (redirect will happen)
  if (!requireAuth && user) {
    return null;
  }

  return <>{children}</>;
}