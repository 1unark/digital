'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  const [hasVoted, setHasVoted] = useState<boolean>(post.userVote === 1);
  const [optimisticScore, setOptimisticScore] = useState<number>(post.totalScore ?? 0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const { user } = useAuth();

  const handleVote = async () => {
    if (!user) return alert('Please login to vote');
    
    const previousVoteState = hasVoted;
    const previousScore = optimisticScore;
    
    // Optimistically update UI
    setHasVoted(!previousVoteState);
    setOptimisticScore(previousVoteState ? previousScore - 1 : previousScore + 1);
    
    try {
      if (previousVoteState) {
        await votesService.removeVote(post.id);
      } else {
        await votesService.vote(post.id, 1);
      }
    } catch (err) {
      // Revert on error
      setHasVoted(previousVoteState);
      setOptimisticScore(previousScore);
      console.error(err);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <button 
        onClick={handleVote} 
        className="flex items-center gap-1.5 pl-2.5 pr-3 h-9 rounded-full transition-colors hover:!bg-[hsl(0,0%,9%)]"
      >
        <motion.svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24"
          animate={hasVoted ? { y: [0, -4, 0] } : { y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <path 
            d="M12 4 L20 20 L4 20 Z" 
            fill={hasVoted ? 'hsl(0, 85%, 55%)' : 'none'}
            stroke={hasVoted ? 'hsl(0, 85%, 55%)' : 'hsl(0, 0%, 70%)'}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </motion.svg>
        {optimisticScore > 0 && (
          <span className="text-[14px] font-bold text-[hsl(0,0%,70%)]">
            {optimisticScore}
          </span>
        )}
      </button>

      <button 
        onClick={() => setShowComments(!showComments)} 
        className="flex items-center gap-1.5 pl-2.5 pr-3 h-9 rounded-full transition-colors hover:!bg-[hsl(0,0%,9%)]"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="hsl(0, 0%, 70%)" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        {post.commentCount > 0 && (
          <span className="text-[14px] font-bold text-[hsl(0,0%,70%)]">
            {post.commentCount}
          </span>
        )}
      </button>

      <button 
        onClick={() => setShowShare(!showShare)} 
        className="flex items-center gap-1.5 pl-2.5 pr-3 h-9 rounded-full transition-colors hover:!bg-[hsl(0,0%,9%)]"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="hsl(0, 0%, 70%)" 
          strokeWidth="2.2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M9 6L15 6 L15 2 L21 8 L15 14 L15 10 L9 10 C5.686 10 3 12.686 3 16 L3 18"/>
        </svg>
        <span className="text-[14px] font-bold text-[hsl(0,0%,70%)]">Share</span>
      </button>
    {showComments && (
      <CommentsBox 
        postId={post.id} 
        postCaption={post.title}
        postAuthor={post.author}
        onClose={() => setShowComments(false)}
        videoCardRef={videoCardRef}
      />
    )}
          {showShare && (
        <ShareModal postId={post.id} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}