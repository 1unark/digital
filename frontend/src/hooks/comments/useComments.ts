// hooks/comments/useComments.ts
import { useState, useEffect } from 'react';
import { commentsService } from '../../services/comments.service';
import { PostComment } from '@/types/index';

export function useComments(postId: string | null) {
  const [comments, setComments] = useState<PostComment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;

    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const commentsArray = await commentsService.getComments(postId);
        console.log('Parsed comments:', commentsArray);
        setComments(commentsArray);
      } catch (err) {
        setError('Failed to load comments');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [postId]);

  const addComment = async (content: string, parentId?: string) => {
    if (!postId) return;

    try {
      const newComment = await commentsService.createComment({
        post: postId,
        content,
        parent: parentId,
      });
      
      console.log('New comment from API:', newComment);
      
      if (parentId) {
        // Update reply count for parent comment
        setComments(prev => prev.map(c => 
          c.id === parentId 
            ? { ...c, reply_count: c.reply_count + 1 }
            : c
        ));
      } else {
        // Add new top-level comment
        setComments(prev => [newComment, ...prev]);
      }
      
      return newComment;
    } catch (err) {
      console.error('Error creating comment:', err);
      throw err;
    }
  };

  const updateComment = async (commentId: string, content: string) => {
    try {
      const updated = await commentsService.updateComment(commentId, { content });
      setComments(prev => prev.map(c => c.id === commentId ? updated : c));
      return updated;
    } catch (err) {
      console.error('Error updating comment:', err);
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      await commentsService.deleteComment(commentId);
      setComments(prev => prev.filter(c => c.id !== commentId));
    } catch (err) {
      console.error('Error deleting comment:', err);
      throw err;
    }
  };

  return {
    comments,
    loading,
    error,
    addComment,
    updateComment,
    deleteComment,
  };
}