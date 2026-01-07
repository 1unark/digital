// components/feed/VoteButtons.tsx
'use client';

import { useState, useRef } from 'react';
import { Post } from '@/types/index';
import { votesService } from '../../services/votes.service';
import { useAuth } from '@/hooks/auth/useAuth';
import { CommentsBox } from '../comments/CommentsBox';
import { ShareModal } from './ShareModal';

interface VoteButtonsProps {
  post: Post;
  videoCardRef: React.RefObject<HTMLElement | null>;
}

export function VoteButtons({ post, videoCardRef }: VoteButtonsProps) {
  const [hasVoted, setHasVoted] = useState(post.userVote === 1);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

  const handleVote = async () => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      if (hasVoted) {
        await votesService.removeVote(post.id);
        setHasVoted(false);
      } else {
        setIsAnimating(true);
        await votesService.vote(post.id, 1);
        setHasVoted(true);
        setTimeout(() => setIsAnimating(false), 300);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex items-center gap-3">
        <button
          onClick={handleVote}
          className="p-2 rounded-lg transition-all"
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent',
            transform: isAnimating ? 'scale(1.3)' : 'scale(1)',
            transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 69, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24">
            <path 
              d="M12 4 L20 20 L4 20 Z" 
              fill={hasVoted ? '#FF4500' : 'none'}
              stroke={hasVoted ? '#FF4500' : '#878A8C'}
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <button
          onClick={() => setShowComments(!showComments)}
          className="p-2 rounded-lg transition-colors"
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#878A8C" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>

        <button
          onClick={() => setShowShare(!showShare)}
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-colors"
          style={{
            cursor: 'pointer',
            backgroundColor: 'transparent'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="#878A8C" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 6L15 6 L15 2 L21 8 L15 14 L15 10 L9 10 C5.686 10 3 12.686 3 16 L3 18"/>
          </svg>
          <span style={{ color: '#878A8C', fontSize: '14px' }}>Share</span>
        </button>
      </div>

      {showComments && (
        <CommentsBox 
          postId={post.id} 
          onClose={() => setShowComments(false)}
          videoCardRef={videoCardRef}
        />
      )}

      {showShare && (
        <ShareModal 
          postId={post.id}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}