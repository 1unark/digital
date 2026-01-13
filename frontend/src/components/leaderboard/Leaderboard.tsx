// components/Leaderboard.tsx

"use client"

import { useLeaderboard } from '@/hooks/leaderboard/useLeaderboard';
import Image from 'next/image';
import Link from 'next/link';

export const Leaderboard = () => {
  const { leaderboard, loading, error } = useLeaderboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div 
          className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: 'var(--color-action-primary)' }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="p-4 rounded-md"
        style={{
          backgroundColor: 'var(--color-danger-bg)',
          border: '1px solid var(--color-danger-border)',
          color: 'var(--color-danger-text)'
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <div
        className="overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface-primary)',
          border: '1px solid var(--color-border-default)',
          borderRadius: '6px',
        }}
      >
        <header 
          className="px-5 py-4"
          style={{ 
            borderBottom: '1px solid var(--color-border-muted)',
            backgroundColor: 'var(--color-surface-primary)'
          }}
        >
          <div className="flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--color-action-primary)">
              <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
            </svg>
            <h1 
              className="text-base font-semibold tracking-tight"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Top Creators
            </h1>
          </div>
          <p 
            className="text-xs mt-1"
            style={{ color: 'var(--color-text-muted)' }}
          >
            Ranked by community ratings and engagement
          </p>
        </header>

      <ul>
        {leaderboard.map((entry, index) => (
          <li 
            key={entry.user.id}
            className="px-5 py-3.5 transition-all duration-200 cursor-pointer"
            style={{
              backgroundColor: 'transparent',
              borderBottom: index < leaderboard.length - 1 ? '1px solid var(--color-border-muted)' : 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-action-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div className="flex items-center gap-3.5">
              {/* Rank Badge */}
              <div 
                className="flex items-center justify-center flex-shrink-0 font-bold transition-all duration-200"
                style={{
                  width: index < 3 ? '36px' : '28px',
                  height: index < 3 ? '36px' : '28px',
                  backgroundColor: index < 3 ? 'var(--color-action-primary)' : 'transparent',
                  borderRadius: '50%',
                  fontSize: index < 3 ? '15px' : '13px',
                  color: index < 3 ? 'white' : 'var(--color-text-muted)',
                  fontWeight: index < 3 ? '700' : '600'
                }}
              >
                {index + 1}
              </div>

              {/* User Avatar */}
              <Link 
                href={`/profile/${entry.user.username}`}
                className="flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{ 
                  width: index < 3 ? '44px' : '40px',
                  height: index < 3 ? '44px' : '40px',
                  backgroundColor: 'var(--color-surface-elevated)',
                  borderRadius: '50%',
                  border: '1px solid var(--color-border-default)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                {entry.user.avatar ? (
                  <Image 
                    src={entry.user.avatar} 
                    alt={entry.user.username} 
                    width={44}
                    height={44}
                    className="w-full h-full object-cover" 
                    style={{ borderRadius: '50%' }}
                    unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}

                  />
                ) : (
                  <span 
                    className="font-medium"
                    style={{ 
                      color: 'var(--color-text-secondary)',
                      fontSize: index < 3 ? '15px' : '14px'
                    }}
                  >
                    {entry.user.username[0].toUpperCase()}
                  </span>
                )}
              </Link>

              {/* User Info */}
              <div className="flex-1 min-w-0 flex items-center gap-4">
                <div className="min-w-0">
                  <Link 
                    href={`/profile/${entry.user.username}`}
                    className="group"
                  >
                    <p 
                      className="text-sm font-medium truncate group-hover:text-action-primary transition-colors"
                      style={{ 
                        color: 'var(--color-text-primary)',
                        fontWeight: index < 3 ? '600' : '500'
                      }}
                    >
                      {entry.user.username}
                    </p>
                  </Link>
                  
                  <span 
                    className="text-xs mt-0.5 block"
                    style={{ color: 'var(--color-text-muted)' }}
                  >
                    {entry.work_count} {entry.work_count === 1 ? 'work' : 'works'}
                  </span>
                </div>

                {entry.user.bio && (
                  <>
                    <div 
                      style={{
                        width: '1px',
                        height: '32px',
                        backgroundColor: 'var(--color-border-default)'
                      }}
                    />
                    <span 
                      className="text-xs truncate"
                      style={{ color: 'var(--color-text-secondary)' }}
                    >
                      {entry.user.bio}
                    </span>
                  </>
                )}
              </div>

              {/* Rating Badge */}
              <div 
                className="text-right flex-shrink-0 px-3 py-1.5 transition-all duration-200"
                style={{
                  backgroundColor: 'var(--color-action-secondary)',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border-default)'
                }}
              >
                <p 
                  className="text-xs font-medium tracking-tight"
                  style={{ color: 'var(--color-text-muted)' }}
                >
                  Rating: <span style={{ color: 'var(--color-text-primary)', fontWeight: '600' }}>{entry.reputation_score.toFixed(2)}</span>
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
};