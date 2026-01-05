// components/feed/VoteButtons.tsx
'use client';

import { useState, useRef } from 'react';
import { Post } from '@/types/index';
import { votesService } from '../../services/votes.service';
import { useAuth } from '@/hooks/auth/useAuth';
import { CommentsBox } from '../comments/CommentsBox';

interface VoteButtonsProps {
  post: Post;
  videoCardRef: React.RefObject<HTMLElement>;
}

export function VoteButtons({ post, videoCardRef }: VoteButtonsProps) {
  const [hasVoted, setHasVoted] = useState(post.userVote === 1);
  const [showComments, setShowComments] = useState(false);
  const { user } = useAuth();

  const handleVote = async () => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    try {
      if (hasVoted) {
        await votesService.removeVote(post.id);  // ✅ Call removeVote
        setHasVoted(false);
      } else {
        await votesService.vote(post.id, 1);
        setHasVoted(true);
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
      </div>

      {showComments && (
        <CommentsBox 
          postId={post.id} 
          onClose={() => setShowComments(false)}
          videoCardRef={videoCardRef}
        />
      )}
    </>
  );
}