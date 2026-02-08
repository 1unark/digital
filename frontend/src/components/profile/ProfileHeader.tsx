// components/profile/ProfileHeader.tsx
'use client';

import { useUserProfile } from '@/hooks/profile/useUserProfile';
import { useAuth } from '@/hooks/auth/useAuth';
import Image from 'next/image';
import Link from 'next/link';

interface ProfileHeaderProps {
  username: string;
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'https://cdn.simpleicons.org/instagram',
  tiktok: 'https://cdn.simpleicons.org/tiktok',
  youtube: 'https://cdn.simpleicons.org/youtube',
};

const FALLBACK_ICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';
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
  const socialLinks = profileUser.creatorprofile?.social_links || [];

  return (
    <div
      className="mt-15 px-6 py-5 mb-6"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '6px',
      }}
    >
      <div className="flex gap-6">
        {/* Left side - Profile info */}
        <div className="flex-1 min-w-0">
          <div className="flex gap-3 mb-3">
            <div 
              className="flex items-center justify-center flex-shrink-0"
              style={{ 
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--color-surface-elevated)',
                borderRadius: '50%',
              }}
            >
              {profileUser.avatar ? (
                <Image
                  src={profileUser.avatar}
                  alt={profileUser.username}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  style={{ borderRadius: '50%' }}
                />
              ) : (
                <span 
                  className="text-xl font-medium"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  {firstLetter}
                </span>
              )}
            </div>

            <div className="flex-1">
              <h1 
                className="text-xl font-semibold mb-0.5"
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
          </div>

          {/* Bio */}
          {profileUser.bio && (
            <p 
              className="text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {profileUser.bio}
            </p>
          )}
        </div>

        {/* Right side - Social links + Edit button */}
        <div className="flex flex-col gap-3 items-end">
          {isOwner && (
            <Link 
              href="/settings/profile"
              className="text-sm px-4 py-1.5 rounded-md transition-colors font-medium"
              style={{
                color: 'var(--color-text-primary)',
                border: '1px solid var(--color-border-default)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              Edit profile
            </Link>
          )}

          {socialLinks.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-end" style={{ maxWidth: '280px' }}>
              {socialLinks.map((link) => {
                const iconUrl = PLATFORM_ICONS[link.platform.toLowerCase()] || FALLBACK_ICON;
                
                let displayUsername = link.username;
                if (!displayUsername && link.url) {
                  try {
                    displayUsername = new URL(link.url).pathname.split('/').filter(Boolean).pop() || link.platform;
                  } catch {
                    displayUsername = link.platform;
                  }
                }
                
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors font-medium"
                    style={{
                      backgroundColor: 'var(--color-surface-elevated)',
                      border: '1px solid var(--color-border-default)',
                      color: 'var(--color-text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-text-muted)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-border-default)';
                    }}
                  >
                    <img
                      src={iconUrl}
                      alt={link.platform}
                      width={14}
                      height={14}
                      className="flex-shrink-0 opacity-70"
                    />
                    <span>{displayUsername}</span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}