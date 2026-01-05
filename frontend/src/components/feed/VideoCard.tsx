// components/feed/VideoCard.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';
import { VideoControls } from './VideoControls';

interface VideoCardProps {
  post: Post;
}

export function VideoCard({ post }: VideoCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setAspectRatio(`${video.videoWidth}/${video.videoHeight}`);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  return (
    <article 
      ref={cardRef}
      className="overflow-hidden mx-auto"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-muted)',
        borderRadius: '6px',
        maxWidth: '800px'
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
        <div className="min-w-0 flex-1 flex items-center gap-2">
          <div className="min-w-0">
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
          {post.editingSoftware && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <span 
                style={{ 
                  color: 'var(--color-text-muted)',
                  fontSize: '18px',
                  lineHeight: '1'
                }}
              >
                •
              </span>
              <span 
                className="text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                {post.editingSoftware}
              </span>
            </div>
          )}
        </div>
      </header>

      {post.videoUrl && (
        <div 
          className="relative bg-black flex items-center justify-center"
          style={{
            aspectRatio: aspectRatio,
            maxHeight: '580px',
            width: '100%'
          }}
        >
          <video 
            ref={videoRef}
            src={post.videoUrl}
            preload="metadata"
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
          />
          <VideoControls videoRef={videoRef} />
        </div>
      )}

      <footer className="px-2 py-1.5">
        <VoteButtons post={post} videoCardRef={cardRef} />
      </footer>
    </article>
  );
}