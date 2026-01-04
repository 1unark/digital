// components/profile/ProfileHeader.tsx
'use client';

import { useUserProfile } from '@/hooks/profile/useUserProfile';
import Image from 'next/image';

interface ProfileHeaderProps {
  username: string;
}

export function ProfileHeader({ username }: ProfileHeaderProps) {
  const { user, loading, error } = useUserProfile(username);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || 'User not found'}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 mb-6">
      <div className="flex items-start gap-6">
        <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-400">
              {user.username[0].toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user.username}
          </h1>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
              <span className="font-semibold">{user.total_points.toLocaleString()}</span>
              <span className="ml-1 text-sm">points</span>
            </div>
          </div>

          {user.bio && (
            <p className="text-gray-700 whitespace-pre-wrap">{user.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}