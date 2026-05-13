// components/feed/ComparisonVideoCard.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

interface ComparisonAuthor {
  name: string;
  avatar: string | null;
}

interface ComparisonVideo {
  id: string;
  videoUrl: string;
  author: ComparisonAuthor;
  votes: number;
}

interface ComparisonVideoCardProps {
  leftVideo: ComparisonVideo;
  rightVideo: ComparisonVideo;
  createdAt: string;
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

export function ComparisonVideoCard({ leftVideo, rightVideo, createdAt }: ComparisonVideoCardProps) {
  const leftVideoRef = useRef<HTMLVideoElement | null>(null);
  const rightVideoRef = useRef<HTMLVideoElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  
  const [leftAspectRatio, setLeftAspectRatio] = useState<string>('9/16');
  const [rightAspectRatio, setRightAspectRatio] = useState<string>('9/16');
  const [currentPlaying, setCurrentPlaying] = useState<'left' | 'right'>('left');
  const [selectedWinner, setSelectedWinner] = useState<'left' | 'right' | null>(null);
  const [leftLoading, setLeftLoading] = useState(true);
  const [rightLoading, setRightLoading] = useState(true);

  useEffect(() => {
    const leftVid = leftVideoRef.current;
    const rightVid = rightVideoRef.current;
    if (!leftVid || !rightVid) return;

    const handleLeftMetadata = () => {
      setLeftAspectRatio(`${leftVid.videoWidth}/${leftVid.videoHeight}`);
      setLeftLoading(false);
    };

    const handleRightMetadata = () => {
      setRightAspectRatio(`${rightVid.videoWidth}/${rightVid.videoHeight}`);
      setRightLoading(false);
    };

    leftVid.addEventListener('loadedmetadata', handleLeftMetadata);
    rightVid.addEventListener('loadedmetadata', handleRightMetadata);
    
    return () => {
      leftVid.removeEventListener('loadedmetadata', handleLeftMetadata);
      rightVid.removeEventListener('loadedmetadata', handleRightMetadata);
    };
  }, []);

  useEffect(() => {
    const leftVid = leftVideoRef.current;
    const rightVid = rightVideoRef.current;
    if (!leftVid || !rightVid) return;

    const handleLeftEnded = () => {
      setCurrentPlaying('right');
      rightVid.play().catch(() => {});
    };

    const handleRightEnded = () => {
      setCurrentPlaying('left');
      leftVid.currentTime = 0;
      leftVid.play().catch(() => {});
    };

    leftVid.addEventListener('ended', handleLeftEnded);
    rightVid.addEventListener('ended', handleRightEnded);

    return () => {
      leftVid.removeEventListener('ended', handleLeftEnded);
      rightVid.removeEventListener('ended', handleRightEnded);
    };
  }, []);

  useEffect(() => {
    const leftVid = leftVideoRef.current;
    const rightVid = rightVideoRef.current;
    if (!leftVid || !rightVid) return;

    if (currentPlaying === 'left') {
      leftVid.play().catch(() => {});
      rightVid.pause();
    } else {
      rightVid.play().catch(() => {});
      leftVid.pause();
    }
  }, [currentPlaying]);

  useEffect(() => {
    const card = cardRef.current;
    const leftVid = leftVideoRef.current;
    const rightVid = rightVideoRef.current;
    if (!card || !leftVid || !rightVid) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            leftVid.play().catch(() => {});
          } else {
            leftVid.pause();
            rightVid.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(card);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleVote = (side: 'left' | 'right') => {
    setSelectedWinner(side);
    // Backend call will go here
  };

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
        <div className="min-w-0 flex-1 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path 
                d="M8 0L10.472 5.528L16 8L10.472 10.472L8 16L5.528 10.472L0 8L5.528 5.528L8 0Z" 
                fill="#ef4444"
              />
            </svg>
            <span 
              className="text-xs font-medium"
              style={{ color: '#ef4444' }}
            >
              Battle
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <p 
              className="text-xs leading-tight"
              style={{ color: 'var(--color-text-muted)' }}
            >
              {leftVideo.votes + rightVideo.votes} votes
            </p>
            <span 
              style={{ 
                color: 'var(--color-text-muted)',
                fontSize: '14px',
              }}
            >
              •
            </span>
            <p 
              className="text-xs leading-tight"
              style={{ color: 'var(--color-text-muted)' }}
            >
              3 days left
            </p>
          </div>
        </div>
      </header>

      <div 
        className="flex items-center justify-between gap-2 px-3 pb-2 pt-0"
      >
        {/* Left Author */}
        <Link 
          href={`/profile/${leftVideo.author.name}`}
          className="flex items-center gap-1.5 hover:underline flex-1 justify-center"
        >
          <div
            className="w-5 h-5 flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: '50%'
            }}
          >
            {leftVideo.author.avatar ? (
              <Image 
                src={leftVideo.author.avatar} 
                alt={leftVideo.author.name} 
                width={20}
                height={20}
                className="w-full h-full object-cover" 
                style={{ borderRadius: '50%' }}
                unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}
              />
            ) : (
              <span 
                className="text-xs"
                style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}
              >
                {leftVideo.author.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <p 
            className="text-xs leading-tight truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {leftVideo.author.name}
          </p>
        </Link>

        <span 
          className="text-xs"
          style={{ color: 'var(--color-text-muted)' }}
        >
          vs
        </span>

        {/* Right Author */}
        <Link 
          href={`/profile/${rightVideo.author.name}`}
          className="flex items-center gap-1.5 hover:underline flex-1 justify-center"
        >
          <div
            className="w-5 h-5 flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: 'var(--color-surface-elevated)',
              borderRadius: '50%'
            }}
          >
            {rightVideo.author.avatar ? (
              <Image 
                src={rightVideo.author.avatar} 
                alt={rightVideo.author.name} 
                width={20}
                height={20}
                className="w-full h-full object-cover" 
                style={{ borderRadius: '50%' }}
                unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}
              />
            ) : (
              <span 
                className="text-xs"
                style={{ color: 'var(--color-text-secondary)', fontSize: '10px' }}
              >
                {rightVideo.author.name[0].toUpperCase()}
              </span>
            )}
          </div>
          <p 
            className="text-xs leading-tight truncate"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {rightVideo.author.name}
          </p>
        </Link>
      </div>

      <div className="flex gap-0" style={{ position: 'relative' }}>
        {/* Left Video Section */}
        <div className="flex-1 relative">
          {/* Left Video */}
          <div 
            className="relative bg-black flex items-center justify-center"
            style={{
              aspectRatio: leftAspectRatio,
              maxHeight: '580px',
              width: '100%',
              borderTopLeftRadius: '0px',
              borderBottomLeftRadius: '0px',
              opacity: currentPlaying === 'left' ? 1 : 0.5,
              transition: 'opacity 0.3s'
            }}
          >
            {leftLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-primary)' }}
                />
              </div>
            )}
            
            <video 
              ref={leftVideoRef}
              src={leftVideo.videoUrl}
              preload="metadata"
              muted
              playsInline
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                opacity: leftLoading ? 0 : 1,
                transition: 'opacity 0.3s'
              }}
            />
          </div>
        </div>

        {/* Divider */}
        <div 
          style={{ 
            width: '1px', 
            backgroundColor: 'var(--color-border-default)',
            alignSelf: 'stretch'
          }} 
        />

        {/* Right Video Section */}
        <div className="flex-1 relative">
          {/* Right Video */}
          <div 
            className="relative bg-black flex items-center justify-center"
            style={{
              aspectRatio: rightAspectRatio,
              maxHeight: '580px',
              width: '100%',
              borderTopRightRadius: '0px',
              borderBottomRightRadius: '0px',
              opacity: currentPlaying === 'right' ? 1 : 0.5,
              transition: 'opacity 0.3s'
            }}
          >
            {rightLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: 'var(--color-primary)' }}
                />
              </div>
            )}
            
            <video 
              ref={rightVideoRef}
              src={rightVideo.videoUrl}
              preload="metadata"
              muted
              playsInline
              style={{ 
                maxWidth: '100%',
                maxHeight: '100%',
                width: 'auto',
                height: 'auto',
                opacity: rightLoading ? 0 : 1,
                transition: 'opacity 0.3s'
              }}
            />
          </div>
        </div>
      </div>

      <footer 
        className="px-2 py-1.5"
        style={{
          borderTop: '1px solid var(--color-border-muted)',
        }}
      >
        <div className="flex gap-0">
          {/* Left Vote Button */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => handleVote('left')}
              className="text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              style={{
                backgroundColor: selectedWinner === 'left' 
                  ? '#dc2626' 
                  : 'var(--color-surface-elevated)',
                color: selectedWinner === 'left' ? 'white' : 'var(--color-text-primary)',
                cursor: 'pointer',
                border: '1px solid var(--color-border-default)',
              }}
            >
              {selectedWinner === 'left' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              Vote
            </button>
          </div>

          {/* Right Vote Button */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => handleVote('right')}
              className="text-xs px-3 py-1 rounded-full transition-colors flex items-center gap-1"
              style={{
                backgroundColor: selectedWinner === 'right' 
                  ? '#dc2626' 
                  : 'var(--color-surface-elevated)',
                color: selectedWinner === 'right' ? 'white' : 'var(--color-text-primary)',
                cursor: 'pointer',
                border: '1px solid var(--color-border-default)',
              }}
            >
              {selectedWinner === 'right' && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              )}
              Vote
            </button>
          </div>
        </div>
      </footer>
    </article>
  );
}