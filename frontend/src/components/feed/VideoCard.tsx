// components/feed/VideoCard.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';
import { VideoControls } from './VideoControls';

interface VideoCardProps {
  post: Post;
}

// Global state to track which video should be playing and audio state
let currentPlayingVideo: HTMLVideoElement | null = null;
let globalAudioEnabled = false;

export function VideoCard({ post }: VideoCardProps) {
  const cardRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const [showUnmuteButton, setShowUnmuteButton] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setAspectRatio(`${video.videoWidth}/${video.videoHeight}`);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => video.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, []);

  // Sync mute state with global audio setting
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !globalAudioEnabled;
  }, []);

  // Listen for global audio state changes
  useEffect(() => {
    const handleAudioToggle = (e: CustomEvent) => {
      const video = videoRef.current;
      if (!video) return;
      
      globalAudioEnabled = e.detail.enabled;
      video.muted = !globalAudioEnabled;
      setShowUnmuteButton(!globalAudioEnabled);
    };

    window.addEventListener('globalAudioToggle' as any, handleAudioToggle);
    return () => {
      window.removeEventListener('globalAudioToggle' as any, handleAudioToggle);
    };
  }, []);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (!video) return;

    globalAudioEnabled = true;
    video.muted = false;
    setShowUnmuteButton(false);

    // Notify all other videos
    window.dispatchEvent(new CustomEvent('globalAudioToggle', { 
      detail: { enabled: true } 
    }));
  };

  // Intersection Observer to play the topmost fully visible video
  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card) return;

    const checkAndPlayTopVideo = () => {
      // Get all video cards on the page
      const allVideoCards = document.querySelectorAll('article');
      let topMostVideo: HTMLVideoElement | null = null;
      let topMostPosition = Infinity;

      allVideoCards.forEach((cardElement) => {
        const videoElement = cardElement.querySelector('video');
        if (!videoElement) return;

        const rect = cardElement.getBoundingClientRect();
        const viewportHeight = window.innerHeight;

        // Check if video is substantially visible (at least 70% visible)
        const visibleTop = Math.max(rect.top, 0);
        const visibleBottom = Math.min(rect.bottom, viewportHeight);
        const visibleHeight = visibleBottom - visibleTop;
        const visibilityRatio = visibleHeight / rect.height;

        // Video must be at least 70% visible
        if (visibilityRatio >= 0.7) {
          // This video is substantially visible, check if it's the topmost
          if (rect.top < topMostPosition) {
            topMostPosition = rect.top;
            topMostVideo = videoElement;
          }
        }
      });

      // Play the topmost video and pause all others
      allVideoCards.forEach((cardElement) => {
        const videoElement = cardElement.querySelector('video');
        if (videoElement) {
          if (videoElement === topMostVideo && videoElement !== currentPlayingVideo) {
            currentPlayingVideo = videoElement;
            videoElement.muted = !globalAudioEnabled;
            videoElement.play().catch((err) => {
              console.log('Autoplay prevented:', err);
            });
          } else if (videoElement !== topMostVideo) {
            videoElement.pause();
          }
        }
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          checkAndPlayTopVideo();
        }, 50);
      },
      {
        threshold: [0, 0.3, 0.5, 0.7, 1],
        rootMargin: '0px'
      }
    );

    observer.observe(card);

    // Check immediately on mount
    setTimeout(() => {
      checkAndPlayTopVideo();
    }, 100);

    // Also check on scroll for smoother updates
    const handleScroll = () => {
      checkAndPlayTopVideo();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <article 
      ref={cardRef}
      className="overflow-hidden"
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
            loop
            muted
            playsInline
            style={{ 
              maxWidth: '100%',
              maxHeight: '100%',
              width: 'auto',
              height: 'auto'
            }}
          />
          
          {/* Big Unmute Button */}
          {showUnmuteButton && (
            <button
              onClick={handleUnmute}
              className="absolute top-4 right-4 z-10 bg-black/40 hover:bg-black/60 text-white rounded-full p-1.5 transition-all duration-200 backdrop-blur-sm"
              style={{
                // Changed from 2px to 1px and reduced alpha from 0.3 to 0.15
                border: '1px solid rgba(255, 255, 255, 0.15)' 
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            </button>
          )}
                    
          <VideoControls videoRef={videoRef} />
        </div>
      )}

      <footer className="px-2 py-1.5">
        <VoteButtons post={post} videoCardRef={cardRef} />
      </footer>
    </article>
  );
}