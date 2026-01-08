// components/feed/VideoCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';
import { VideoControls } from './VideoControls';
import { useViewTracker } from '@/hooks/posts/useViewTracker';
import { userService } from '../../services/user.service';

interface VideoCardProps {
  post: Post;
}


function getRelativeTime(date: Date | string): string {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now.getTime() - postDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return '1 week ago';
  if (diffDays < 21) return '2 weeks ago';
  if (diffDays < 21) return '3 weeks ago';
  
  // More than 3 weeks, show normal date
  return postDate.toLocaleDateString();
}


// Global state to track which video should be playing and audio state
let currentPlayingVideo: HTMLVideoElement | null = null;
let globalAudioEnabled = false;

// Track all visible videos with their center position
const visibleVideos = new Map<HTMLVideoElement, number>();

export function VideoCard({ post }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const [showUnmuteButton, setShowUnmuteButton] = useState(true);
  const [isFollowing, setIsFollowing] = useState(post.author?.is_following || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // View tracking - pass videoRef to the hook
  useViewTracker(post.id, videoRef);

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

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!post.author?.name || isFollowLoading) return;

    // Optimistically update UI
    setIsFollowing(!isFollowing);
    setIsFollowLoading(true);
    
    try {
      if (isFollowing) {
        await userService.unfollowUser(post.author.name);
      } else {
        await userService.followUser(post.author.name);
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error);
      // Revert on error
      setIsFollowing(isFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };

  // Determine which video should play based on distance from screen center
  const updatePlayingVideo = () => {
    if (visibleVideos.size === 0) return;

    const screenCenterY = window.innerHeight / 2;
    
    // Find the video closest to the vertical center of the screen
    let closestVideo: HTMLVideoElement | null = null;
    let smallestDistance = Infinity;

    visibleVideos.forEach((videoCenterY, video) => {
      const distanceFromCenter = Math.abs(videoCenterY - screenCenterY);
      
      if (distanceFromCenter < smallestDistance) {
        smallestDistance = distanceFromCenter;
        closestVideo = video;
      }
    });

    if (!closestVideo) return;

    // Pause all videos except the one closest to center
    visibleVideos.forEach((_, video) => {
      if (video === closestVideo) {
        if (currentPlayingVideo !== video) {
          video.play().catch(() => {});
          currentPlayingVideo = video;
        }
      } else {
        video.pause();
      }
    });
  };

  useEffect(() => {
    const video = videoRef.current;
    const card = cardRef.current;
    if (!video || !card) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Calculate the center Y position of this video relative to viewport
            const rect = card.getBoundingClientRect();
            const videoCenterY = rect.top + (rect.height / 2);
            visibleVideos.set(video, videoCenterY);
            updatePlayingVideo();
          } else {
            // Remove from visible videos and pause
            visibleVideos.delete(video);
            if (currentPlayingVideo === video) {
              video.pause();
              currentPlayingVideo = null;
            }
            updatePlayingVideo();
          }
        });
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      }
    );

    observer.observe(card);
    
    return () => {
      observer.disconnect();
      visibleVideos.delete(video);
      if (currentPlayingVideo === video) {
        currentPlayingVideo = null;
      }
    };
  }, [post.id]);

  return (
    <article 
      ref={cardRef}
      className="overflow-hidden"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '6px',
      }}
    >
      {/* Header */}
      <header 
        className="flex items-center gap-2 px-3 py-2"
        style={{ 
          borderBottom: '1px solid var(--color-border-muted)',
        }}
      >
        <Link 
          href={`/profile/${post.author?.name}`}
          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--color-surface-elevated)',
            borderRadius: '50%'
          }}
        >
          {post.author?.avatar ? (
            <Image 
              src={post.author.avatar} 
              alt={post.author.name} 
              width={32}
              height={32}
              className="w-full h-full object-cover" 
              style={{ borderRadius: '50%' }}
              unoptimized
            />
          ) : (
            <span 
              className="text-xs"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {post.author?.name ? post.author.name[0].toUpperCase() : '?'}
            </span>
          )}
        </Link>
        
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <Link 
              href={`/profile/${post.author?.name}`}
              className="hover:underline"
            >
              <p 
                className="text-sm leading-tight truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {post.author?.name || 'Unknown'}
              </p>
            </Link>
            
            <button
              onClick={handleFollowToggle}
              disabled={isFollowLoading}
              className="text-xs px-3 py-1 rounded-full transition-colors"
              style={{
                backgroundColor: isFollowing ? 'var(--color-surface-elevated)' : 'var(--color-primary)',
                color: isFollowing ? 'var(--color-text-secondary)' : 'white',
                border: '1px solid var(--color-border-default)',
                cursor: isFollowLoading ? 'not-allowed' : 'pointer',
                opacity: isFollowLoading ? 0.6 : 1
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <p 
              className="text-xs leading-tight"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {post.createdAt ? getRelativeTime(post.createdAt) : 'Unknown date'}
            </p>
            
            {post.editingSoftware && (
              <>
                <span 
                  style={{ 
                    color: 'var(--color-text-muted)',
                    fontSize: '14px',
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
              </>
            )}
          </div>
        </div>
      </header>

      {/* Video */}
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
          
          {/* Unmute Button */}
          {showUnmuteButton && (
            <button
              onClick={handleUnmute}
              className="absolute top-4 right-4 z-10 transition-all duration-200"
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                padding: '10px',
                color: 'white',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
              </svg>
            </button>
          )}
                    
          <VideoControls videoRef={videoRef} />
        </div>
      )}

      {/* Footer */}
      <footer 
        className="px-2 py-1.5"
        style={{
          borderTop: '1px solid var(--color-border-muted)',
        }}
      >
        <VoteButtons post={post} videoCardRef={cardRef} />
      </footer>
    </article>
  );
}