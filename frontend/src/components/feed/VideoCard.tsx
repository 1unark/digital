// components/feed/VideoCard.tsx
'use client';

import { useRef } from 'react';
import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';

interface VideoCardProps {
  post: Post;
}

export function VideoCard({ post }: VideoCardProps) {
  const cardRef = useRef<HTMLElement>(null);

  return (
    <article 
      ref={cardRef}
      className="overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-muted)',
        borderRadius: '6px'
      }}
    >
      <header 
        className="flex items-center gap-2.5 px-3 py-2.5"
        style={{ borderBottom: '1px solid var(--color-border-muted)' }}
      >
        <div 
          className="w-9 h-9 flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--color-surface-secondary)',
            borderRadius: '50%'
          }}
        >
          {post.author?.avatar ? (
            <img 
              src={post.author.avatar} 
              alt={post.author.name} 
              className="w-full h-full object-cover" 
              style={{ borderRadius: '50%' }}
            />
          ) : (
            <span 
              className="text-sm font-medium"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {post.author?.name ? post.author.name[0].toUpperCase() : '?'}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p 
            className="font-medium text-sm leading-tight truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {post.author?.name || 'Unknown'}
          </p>
          <p 
            className="text-xs leading-tight"
            style={{ 
              color: 'var(--color-text-muted)',
              marginTop: '2px'
            }}
          >
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown date'}
          </p>
        </div>
      </header>

      {post.videoUrl && (
        <div 
          className="relative bg-black"
          style={{
            aspectRatio: '16/9',
            maxHeight: '580px'
          }}
        >
          <video 
            src={post.videoUrl} 
            controls 
            className="w-full h-full"
            style={{ objectFit: 'contain' }}
          />
        </div>
      )}

      <footer className="px-2 py-1.5">
        <VoteButtons post={post} videoCardRef={cardRef} />
      </footer>
    </article>
  );
}