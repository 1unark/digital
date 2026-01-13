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
    return <div className="py-8"></div>;
  }

  if (error || !profileUser) {
    return (
      <div 
        className="py-8"
        style={{ color: 'var(--color-danger-text)' }}
      >
        {error || 'User not found'}
      </div>
    );
  }

  const firstLetter = profileUser.username[0].toUpperCase();
  const isOwner = currentUser?.id === profileUser.id;

  return (
    <div
      className="mt-15 p-6 mb-6"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '6px',
      }}
    >
      <div className="flex gap-6">
        <div 
          className="flex items-center justify-center flex-shrink-0"
          style={{ 
            width: '80px',
            height: '80px',
            backgroundColor: 'var(--color-surface-elevated)',
            borderRadius: '50%',
            border: '1px solid var(--color-border-default)'
          }}
        >
          {profileUser.avatar ? (
            <Image
              src={profileUser.avatar}
              alt={profileUser.username}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <span 
              className="text-2xl font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {firstLetter}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 
                className="text-xl font-semibold mb-1"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {profileUser.username}
              </h1>
              
              {profileUser.total_points > 0 && (
                <div 
                  className="text-sm"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {profileUser.total_points.toLocaleString()} points
                </div>
              )}
            </div>

            {isOwner && (
              <Link 
                href="/settings/profile"
                className="text-sm px-3 py-1.5 rounded transition-colors"
                style={{
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-action-secondary)',
                  border: '1px solid var(--color-border-default)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
                }}
              >
                Edit Profile
              </Link>
            )}
          </div>

          <p 
            className="text-sm whitespace-pre-wrap"
            style={{ 
              color: profileUser.bio ? 'var(--color-text-secondary)' : 'var(--color-text-muted)'
            }}
          >
            {profileUser.bio || 'No bio'}
          </p>
        </div>
      </div>
    </div>
  );
}