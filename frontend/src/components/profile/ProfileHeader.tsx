// components/profile/ProfileHeader.tsx
'use client';

import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useAuth } from '@/hooks/auth/useAuth';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileHeaderProps {
  username: string;
}

export function ProfileHeader({ username }: ProfileHeaderProps) {
  const { user: profileUser, loading, error } = useUserProfile(username);
  const { user: currentUser } = useAuth();

  if (loading) {
    return <div className="py-8">Loading...</div>;
  }

  if (error || !profileUser) {
    return <div className="py-8 text-gray-600">{error || 'User not found'}</div>;
  }

  const firstLetter = profileUser.username[0].toUpperCase();
  const isOwner = currentUser?.id === profileUser.id;

  return (
    <div className="mt-15 border border-gray-200 rounded p-6 mb-6">
      <div className="flex gap-4">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
          {profileUser.avatar ? (
            <Image
              src={profileUser.avatar}
              alt={profileUser.username}
              width={64}
              height={64}
              className="rounded-full"
              unoptimized
            />
          ) : (
            <span className="text-xl text-gray-500">{firstLetter}</span>
          )}
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-xl font-medium mb-1">{profileUser.username}</h1>
              
              {profileUser.total_points > 0 && (
                <div className="text-sm text-gray-600 mb-2">
                  {profileUser.total_points.toLocaleString()} points
                </div>
              )}
            </div>

            {isOwner && (
              <Link 
                href="/settings/profile"
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Edit
              </Link>
            )}
          </div>

          <p className="text-gray-700 text-sm whitespace-pre-wrap">
            {profileUser.bio || 'No bio'}
          </p>
        </div>
      </div>
    </div>
  );
}