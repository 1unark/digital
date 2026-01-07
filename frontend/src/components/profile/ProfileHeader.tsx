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
    return <div className="py-8">Loading...</div>;
  }

  if (error || !user) {
    return <div className="py-8 text-gray-600">{error || 'User not found'}</div>;
  }

  const firstLetter = user.username[0].toUpperCase();

  return (
    <div className="mt-15 border border-gray-200 rounded p-6 mb-6">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {user.avatar ? (
            <Image
              src={user.avatar}
              alt={user.username}
              width={64}
              height={64}
              className="rounded-full"
            />
          ) : (
            <span className="text-xl text-gray-500">{firstLetter}</span>
          )}
        </div>

        <div>
          <h1 className="text-xl font-medium mb-1">{user.username}</h1>
          
          {user.total_points > 0 && (
            <div className="text-sm text-gray-600 mb-2">
              {user.total_points.toLocaleString()} points
            </div>
          )}

          {user.bio && (
            <p className="text-gray-700 text-sm whitespace-pre-wrap">{user.bio}</p>
          )}
        </div>
      </div>
    </div>
  );
}