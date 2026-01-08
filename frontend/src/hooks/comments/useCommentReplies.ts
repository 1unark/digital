// hooks/comments/useCommentReplies.ts
import { useState } from 'react';
import { commentsService } from '../../services/comments.service';
import { PostComment } from '@/types/index';

export function useCommentReplies() {
  const [repliesMap, setRepliesMap] = useState<Record<string, PostComment[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const fetchReplies = async (parentId: string) => {
    if (repliesMap[parentId]) return; // Already loaded

    setLoadingMap(prev => ({ ...prev, [parentId]: true }));
    try {
      const replies = await commentsService.getReplies(parentId);
      setRepliesMap(prev => ({ ...prev, [parentId]: replies }));
    } catch (err) {
      console.error('Error fetching replies:', err);
    } finally {
      setLoadingMap(prev => ({ ...prev, [parentId]: false }));
    }
  };

  const addReply = (parentId: string, reply: PostComment) => {
    setRepliesMap(prev => ({
      ...prev,
      [parentId]: [reply, ...(prev[parentId] || [])]
    }));
  };

  const updateReply = (parentId: string, replyId: string, updated: PostComment) => {
    setRepliesMap(prev => ({
      ...prev,
      [parentId]: prev[parentId]?.map(r => r.id === replyId ? updated : r) || []
    }));
  };

  const deleteReply = (parentId: string, replyId: string) => {
    setRepliesMap(prev => ({
      ...prev,
      [parentId]: prev[parentId]?.filter(r => r.id !== replyId) || []
    }));
  };

  return {
    repliesMap,
    loadingMap,
    fetchReplies,
    addReply,
    updateReply,
    deleteReply,
  };
}