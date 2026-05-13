// components/feed/WeeklyTopPost.tsx
'use client';
import { Post } from '@/types/index';
import { WeeklyTopPostCard } from './WeeklyTopPostCard';
import { useUserProfile } from '@/hooks/profile/useUserProfile';
import Image from 'next/image';
import Link from 'next/link';

interface WeeklyTopPostProps {
  post: Post;
}

const PLATFORM_ICONS: Record<string, string> = {
  instagram: 'https://cdn.simpleicons.org/instagram',
  tiktok: 'https://cdn.simpleicons.org/tiktok',
  youtube: 'https://cdn.simpleicons.org/youtube',
};

const FALLBACK_ICON = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>';

export function WeeklyTopPost({ post }: WeeklyTopPostProps) {
  const { user, loading } = useUserProfile(post.author.name);
  const firstLetter = post.author.name[0].toUpperCase();
  const socialLinks = user?.creatorprofile?.social_links || [];

  return (
    <div 
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '12px',
      }}
    >
      {/* Header */}
      <div 
        className="px-5 py-4 border-b" 
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path 
              d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" 
              fill="#ef4444"
            />
          </svg>
          <span 
            className="text-xs font-medium tracking-wide uppercase"
            style={{ color: '#ef4444' }}
          >
            Top Post This Week
          </span>
        </div> 

        {!loading && user && (
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <Link href={`/profile/${user.username}`}>
              <div 
                className="flex items-center justify-center flex-shrink-0"
                style={{ 
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: '50%' }}
                  />
                ) : (
                  <span 
                    className="text-2xl font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {firstLetter}
                  </span>
                )}
              </div>
            </Link>
            
            {/* User Info */}
            <div className="flex-1 min-w-0">
              <Link href={`/profile/${user.username}`}>
                <div 
                  className="font-semibold text-base mb-1" 
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {user.username}
                </div>
              </Link>
              
              {user.bio && (
                <div 
                  className="text-sm mb-3 leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {user.bio}
                </div>
              )}

              {/* Social Pills */}
              {socialLinks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.slice(0, 6).map((link) => {
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
                        className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all font-medium"
                        style={{
                          backgroundColor: 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border-default)',
                          color: 'var(--color-text-primary)',
                          fontSize: '14px',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.borderColor = 'var(--color-border-hover)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.borderColor = 'var(--color-border-default)';
                        }}
                      >
                        <img
                          src={iconUrl}
                          alt={link.platform}
                          width={18}
                          height={18}
                          className="flex-shrink-0"
                          style={{ opacity: 0.8 }}
                        />
                        <span>{displayUsername}</span>
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <WeeklyTopPostCard post={post} />
    </div>
  );
}