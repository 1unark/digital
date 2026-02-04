// components/feed/VideoCard.tsx - Updated to use context
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';
import { Post } from '@/types/index';
import { VoteButtons } from './VoteButtons';
import { VideoControls } from './VideoControls';
import { useViewTracker } from '@/hooks/posts/useViewTracker';
import { userService } from '../../services/user.service';
import { postsService } from '../../services/posts.service';
import { useAuth } from '@/hooks/auth/useAuth';
import { useVideoPlayback } from '@/context/VideoPlaybackContext';

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
  if (diffDays < 28) return '3 weeks ago';
  
  return postDate.toLocaleDateString();
}

export function VideoCard({ post }: VideoCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<string>('16/9');
  const [showUnmuteButton, setShowUnmuteButton] = useState(true);
  const [isFollowing, setIsFollowing] = useState(post.author?.is_following || false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [videoLoading, setVideoLoading] = useState(true);

  const { user: currentUser } = useAuth();
  const { currentPlayingVideo, globalAudioEnabled, visibleVideos, cleanupVideo } = useVideoPlayback();
  
  const isOwner = currentUser && currentUser.username === post.author?.name;

  useViewTracker(post.id, videoRef);

  useEffect(() => {
    setIsFollowing(post.author?.is_following || false);
  }, [post.author?.is_following]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setAspectRatio(`${video.videoWidth}/${video.videoHeight}`);
      setVideoLoading(false);
    };

    const handleCanPlay = () => {
      setVideoLoading(false);
    };

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('canplay', handleCanPlay);
    
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !globalAudioEnabled.current;
  }, []);

  useEffect(() => {
    const handleAudioToggle = (e: CustomEvent) => {
      const video = videoRef.current;
      if (!video) return;
      
      globalAudioEnabled.current = e.detail.enabled;
      video.muted = !globalAudioEnabled.current;
      setShowUnmuteButton(!globalAudioEnabled.current);
    };

    window.addEventListener('globalAudioToggle' as any, handleAudioToggle);
    return () => {
      window.removeEventListener('globalAudioToggle' as any, handleAudioToggle);
    };
  }, []);

  const handleUnmute = () => {
    const video = videoRef.current;
    if (!video) return;

    globalAudioEnabled.current = true;
    video.muted = false;
    setShowUnmuteButton(false);

    window.dispatchEvent(new CustomEvent('globalAudioToggle', { 
      detail: { enabled: true } 
    }));
  };

  const handleFollowToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!post.author?.name || isFollowLoading) return;

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
      setIsFollowing(isFollowing);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post? This cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await postsService.deletePost(post.id);
      window.dispatchEvent(new CustomEvent('postDeleted', { 
        detail: { postId: post.id } 
      }));
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post. Please try again.');
      setIsDeleting(false);
    }
  };

  const updatePlayingVideo = () => {
    if (visibleVideos.current.size === 0) return;

    const screenCenterY = window.innerHeight / 2;
    let closestVideo: HTMLVideoElement | null = null;
    let smallestDistance = Infinity;

    visibleVideos.current.forEach((videoCenterY, video) => {
      const distanceFromCenter = Math.abs(videoCenterY - screenCenterY);
      
      if (distanceFromCenter < smallestDistance) {
        smallestDistance = distanceFromCenter;
        closestVideo = video;
      }
    });

    if (!closestVideo) return;

    visibleVideos.current.forEach((_, video) => {
      if (video === closestVideo) {
        if (currentPlayingVideo.current !== video) {
          video.play().catch(() => {});
          currentPlayingVideo.current = video;
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
            const rect = card.getBoundingClientRect();
            const videoCenterY = rect.top + (rect.height / 2);
            visibleVideos.current.set(video, videoCenterY);
            updatePlayingVideo();
          } else {
            visibleVideos.current.delete(video);
            if (currentPlayingVideo.current === video) {
              video.pause();
              currentPlayingVideo.current = null;
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
      if (video) {
        cleanupVideo(video);
      }
    };
  }, [post.id]);

  return (
    <article 
      ref={cardRef}
      className=""
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '20px',
      }}
    >
      <header 
        className="flex items-center gap-2 px-3 py-2 relative"
      >
        <Link 
          href={`/profile/${post.author?.name}`}
          className="w-6 h-6 flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--color-surface-elevated)',
            borderRadius: '50%'
          }}
        >
          {post.author?.avatar ? (
            <Image 
              src={post.author.avatar} 
              alt={post.author.name} 
              width={24}
              height={24}
              className="w-full h-full object-cover" 
              style={{ borderRadius: '50%' }}
              unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}
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
          <div className="flex items-center gap-2">
            <Link 
              href={`/profile/${post.author?.name}`}
              className="hover:underline"
            >
              <p 
                className="text-xs leading-tight truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {post.author?.name || 'Unknown'}
              </p>
            </Link>
            
            {!isOwner && (
              <button
                onClick={handleFollowToggle}
                disabled={isFollowLoading}
                className="text-xs px-2 py-0.5 rounded-full transition-colors"
                style={{
                  backgroundColor: isFollowing ? 'var(--color-surface-elevated)' : 'var(--color-primary)',
                  color: isFollowing ? 'var(--color-text-secondary)' : 'white',
                  border: '1px solid var(--color-border-default)',
                  cursor: isFollowLoading ? 'not-allowed' : 'pointer',
                  opacity: isFollowLoading ? 0.6 : 1,
                  fontSize: '11px'
                }}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </button>
            )}
            
            {post.feedbackWanted && (
              <div 
                className="ml-1 px-1.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap"
                style={{
                  backgroundColor: 'var(--color-action-primary)',
                  color: 'white',
                  fontSize: '12px'
                }}
              >
                Opinions Wanted
              </div>
            )}
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

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded transition-colors"
              style={{
                color: 'var(--color-text-secondary)',
                backgroundColor: showMenu ? 'var(--color-surface-elevated)' : 'transparent'
              }}
              onMouseEnter={(e) => {
                if (!showMenu) {
                  e.currentTarget.style.backgroundColor = 'var(--color-surface-elevated)';
                }
              }}
              onMouseLeave={(e) => {
                if (!showMenu) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/>
                <circle cx="12" cy="12" r="2"/>
                <circle cx="12" cy="19" r="2"/>
              </svg>
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-full mt-1 py-1 shadow-lg z-50"
                style={{
                  backgroundColor: 'var(--color-surface-elevated)',
                  border: '1px solid var(--color-border-default)',
                  borderRadius: '6px',
                  minWidth: '160px'
                }}
              >
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2"
                  style={{
                    color: '#ef4444',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    opacity: isDeleting ? 0.6 : 1
                  }}
                  onMouseEnter={(e) => {
                    if (!isDeleting) {
                      e.currentTarget.style.backgroundColor = 'var(--color-surface-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/>
                  </svg>
                  {isDeleting ? 'Deleting...' : 'Delete post'}
                </button>
              </div>
            )}
          </div>
        )}
      </header>

      {post.title && (
        <div 
          className="px-3 pb-2 pt-0"
        >
          <p 
            className="text-base font-medium leading-snug break-words"
            style={{ 
              color: 'var(--color-text-primary)',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
          >
            {post.title}
          </p>
        </div>
      )}

      {post.videoUrl && (
        <div 
          className="relative bg-black flex items-center justify-center"
          style={{
            aspectRatio: aspectRatio,
            maxHeight: '580px',
            width: '100%'
          }}
        >
          {videoLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div 
                className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                style={{ borderColor: 'var(--color-primary)' }}
              />
            </div>
          )}
          
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
              height: 'auto',
              opacity: videoLoading ? 0 : 1,
              transition: 'opacity 0.3s'
            }}
          />
          
          {showUnmuteButton && !videoLoading && (
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