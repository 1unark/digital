// components/layout/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-surface-elevated backdrop-blur-xl border-b border-border-default z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 items-center">
          <div className="flex items-center gap-6">
            <Link href="/feed/all" className="text-text-secondary hover:text-text-primary font-medium transition-colors">
              Explore
            </Link>
            <Link href="/rankings" className="text-text-secondary hover:text-text-primary font-medium transition-colors">
              Rankings
            </Link>
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 border border-border-default rounded-sm focus:outline-none focus:border-focus-ring w-64 bg-surface-secondary text-text-primary text-sm transition-all placeholder:text-text-muted"
              />
            </form>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Link 
                  href="/upload"
                  className="px-4 py-1.5 bg-action-primary text-surface-primary rounded-sm hover:bg-action-primary-hover font-medium text-sm transition-all"
                >
                  Upload
                </Link>
                <Link href={`/profile/${user.username}`} className="text-text-primary hover:text-text-secondary font-medium text-sm transition-colors">
                  {user.username}
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-1.5 border border-border-default rounded-sm hover:bg-action-secondary-hover text-text-secondary font-medium text-sm transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-1.5 border border-border-default rounded-sm hover:bg-action-secondary-hover text-text-secondary font-medium text-sm transition-all"
                >
                  Login
                </Link>
                <Link 
                  href="/login"
                  className="px-4 py-1.5 bg-action-primary text-surface-primary rounded-sm hover:bg-action-primary-hover font-medium text-sm transition-all"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}