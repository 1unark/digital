// components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/feed" className="text-2xl font-bold text-blue-600">
            SocialVideo
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/upload"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Upload
                </Link>
                <Link href={`/profile/${user.id}`}>
                  <span className="font-medium">{user.username}</span>
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login"
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Login
                </Link>
                <Link 
                  href="/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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