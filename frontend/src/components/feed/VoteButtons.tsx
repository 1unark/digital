// components/feed/VoteButtons.tsx
'use client';

import { useState } from 'react';
import { Post } from '@/types/index';
import { votesService } from '../../services/votes.service';
import { useAuth } from '@/hooks/auth/useAuth';

interface VoteButtonsProps {
  post: Post;
}

export function VoteButtons({ post }: VoteButtonsProps) {
  const [plusOneCount, setPlusOneCount] = useState(post.likes);
  const [plusTwoCount, setPlusTwoCount] = useState(post.plusTwoCount);
  const [userVote, setUserVote] = useState<1 | 2 | null>(
    post.userVote === 1 || post.userVote === 2 ? post.userVote : null
  );
  const { user } = useAuth();

  const handleVote = async (voteType: 1 | 2) => {
    if (!user) {
      alert('Please login to vote');
      return;
    }

    if (userVote === voteType) {
      return;
    }

    try {
      await votesService.vote(post.id, voteType);
      
      if (userVote === null) {
        if (voteType === 1) {
          setPlusOneCount((prev) => prev + 1);
        } else {
          setPlusTwoCount((prev) => prev + 1);
        }
      } else {
        if (userVote === 1 && voteType === 2) {
          setPlusOneCount((prev) => prev - 1);
          setPlusTwoCount((prev) => prev + 1);
        } else if (userVote === 2 && voteType === 1) {
          setPlusTwoCount((prev) => prev - 1);
          setPlusOneCount((prev) => prev + 1);
        }
      }
      
      setUserVote(voteType); 
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => handleVote(1)}
        className={`px-4 py-2 rounded-lg ${
          userVote === 1 
            ? 'bg-blue-700 text-white' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        disabled={userVote === 1}
      >
        +1 ({plusOneCount})
      </button>
      <button
        onClick={() => handleVote(2)}
        className={`px-4 py-2 rounded-lg ${
          userVote === 2 
            ? 'bg-purple-700 text-white' 
            : 'bg-purple-500 text-white hover:bg-purple-600'
        }`}
        disabled={userVote === 2}
      >
        +2 ({plusTwoCount})
      </button>
      <span className="px-4 py-2">
        Score: {plusOneCount + plusTwoCount * 2}
      </span>
    </div>
  );
}