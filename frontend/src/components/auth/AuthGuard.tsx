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
        router.push('/feed');
      }
    }
  }, [user, loading, requireAuth, redirectTo, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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