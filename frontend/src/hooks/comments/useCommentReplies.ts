// hooks/comments/useCommentReplies.ts
import { useState } from 'react';
import { commentsService } from '../../services/comments.service';
import { PostComment } from '@/types/index';

// Define the possible response types
type RepliesResponse = PostComment[] | { results: PostComment[] };

export function useCommentReplies(postId: string) {
  const [repliesMap, setRepliesMap] = useState<Record<string, PostComment[]>>({});
  const [loadingMap, setLoadingMap] = useState<Record<string, boolean>>({});

  const fetchReplies = async (parentId: string) => {
    if (repliesMap[parentId]) return;

    setLoadingMap(prev => ({ ...prev, [parentId]: true }));
    try {
      const data = await commentsService.getReplies(postId, parentId) as RepliesResponse;
      console.log('Replies API response:', data);
      const repliesArray = Array.isArray(data) ? data : (data.results || []);
      console.log('Parsed replies:', repliesArray);
      setRepliesMap(prev => ({ ...prev, [parentId]: repliesArray }));
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