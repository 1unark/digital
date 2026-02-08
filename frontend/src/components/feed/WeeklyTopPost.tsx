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

export function WeeklyTopPost({ post }: WeeklyTopPostProps) {
  const { user, loading } = useUserProfile(post.author.name);
  const firstLetter = post.author.name[0].toUpperCase();

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
        className="px-4 py-3 border-b" 
        style={{ borderColor: 'var(--color-border-default)' }}
      >
        <div className="flex items-center gap-2 mb-3">
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
          <div className="flex items-start gap-3">
            <Link href={`/profile/${user.username}`}>
              <div 
                className="flex items-center justify-center flex-shrink-0"
                style={{ 
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                {user.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.username}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    style={{ borderRadius: '50%' }}
                  />
                ) : (
                  <span 
                    className="text-xl font-semibold"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {firstLetter}
                  </span>
                )}
              </div>
            </Link>
            
            <div className="flex-1 min-w-0 py-1">
              <Link href={`/profile/${user.username}`}>
                <div 
                  className="font-semibold mb-0.5" 
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {user.username}
                </div>
              </Link>
              <div 
                className="text-sm"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {user.bio || 'No bio yet'}
              </div>
            </div>
          </div>
        )}
      </div>

      <WeeklyTopPostCard post={post} />
    </div>
  );
}