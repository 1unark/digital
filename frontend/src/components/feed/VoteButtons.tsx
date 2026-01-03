'use client';

import { useState } from 'react';
import { Post } from '@/types/index';
import { votesAPI } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface VoteButtonsProps {
  post: Post;
}

export function VoteButtons({ post }: VoteButtonsProps) {
  const [plusOneCount, setPlusOneCount] = useState(post.plus_one_count);
  const [plusTwoCount, setPlusTwoCount] = useState(post.plus_two_count);
  const { isAuthenticated } = useAuth();

  const handleVote = async (voteType: 1 | 2) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }

    try {
      await votesAPI.vote(post.id, voteType);
      if (voteType === 1) {
        setPlusOneCount((prev) => prev + 1);
      } else {
        setPlusTwoCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex gap-4 mt-4">
      <button
        onClick={() => handleVote(1)}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        +1 ({plusOneCount})
      </button>
      <button
        onClick={() => handleVote(2)}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
      >
        +2 ({plusTwoCount})
      </button>
      <span className="px-4 py-2">
        Score: {plusOneCount + plusTwoCount * 2}
      </span>
    </div>
  );
}