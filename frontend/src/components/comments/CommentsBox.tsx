// components/comments/CommentsBox.tsx
'use client';

import { useState, useEffect } from 'react';
import { useComments } from '@/hooks/comments/useComments';
import { useCommentReplies } from '@/hooks/comments/useCommentReplies';
import { CommentItem } from './CommentItem';
import Image from 'next/image';

interface CommentsBoxProps {
  postId: string;
  onClose: () => void;
  videoCardRef: React.RefObject<HTMLElement | null>;
}

export function CommentsBox({ postId, onClose, videoCardRef }: CommentsBoxProps) {
  const [newComment, setNewComment] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { comments, loading, error, addComment, updateComment, deleteComment } = useComments(postId);
  const repliesHook = useCommentReplies();

  useEffect(() => {
    const updatePosition = () => {
      if (videoCardRef.current) {
        const rect = videoCardRef.current.getBoundingClientRect();
        const navbarHeight = 60;
        const adjustedTop = Math.max(rect.top, navbarHeight + 10);
        
        setPosition({
          top: adjustedTop,
          left: rect.right + 20
        });
        setIsVisible(true);
      }
    };

    updatePosition();

    const handleScroll = () => {
      onClose();
    };

    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [videoCardRef, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await addComment(newComment.trim());
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div 
      className="fixed w-80 flex flex-col"
      style={{
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-muted)',
        borderRadius: '8px',
        zIndex: 50,
        top: `${position.top}px`,
        left: `${position.left}px`,
        height: '600px',
        maxHeight: 'calc(100vh - 80px)'
      }}
    >
      <div 
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border-muted)' }}
      >
        <h3 
          className="font-semibold text-base"
          style={{ color: 'var(--color-text-primary)' }}
        >
          Comments
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded transition-colors"
          style={{
            backgroundColor: 'transparent',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6 L6 18 M6 6 L18 18"/>
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <p 
            className="text-sm text-center mt-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
          </p>
        ) : error ? (
          <p 
            className="text-sm text-center mt-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            {error}
          </p>
        ) : !Array.isArray(comments) || comments.length === 0 ? (
          <p 
            className="text-sm text-center mt-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              onUpdate={updateComment}
              onDelete={deleteComment}
              onReply={addComment}
              repliesHook={repliesHook}
            />
          ))
        )}
      </div>
<form 
  onSubmit={handleSubmit}
  className="px-4 py-3 flex gap-2"
  style={{ borderTop: '1px solid var(--color-border-default)' }}
>
  <input
    type="text"
    value={newComment}
    onChange={(e) => setNewComment(e.target.value)}
    placeholder="Add a comment..."
    disabled={isSubmitting}
    className="flex-1 px-3 py-2 text-sm rounded"
    style={{
      backgroundColor: 'var(--color-surface-secondary)',
      border: '1px solid var(--color-border-muted)',
      color: 'var(--color-text-primary)',
      cursor: isSubmitting ? 'not-allowed' : 'text',
      opacity: isSubmitting ? 0.6 : 1,
      outline: 'none'
    }}
    onFocus={(e) => {
      e.currentTarget.style.border = '1px solid var(--color-border-default)';
    }}
    onBlur={(e) => {
      e.currentTarget.style.border = '1px solid var(--color-border-muted)';
    }}
  />
  <button
    type="submit"
    disabled={!newComment.trim() || isSubmitting}
    className="p-2.5 rounded transition-colors"
    style={{
      backgroundColor: newComment.trim() && !isSubmitting 
        ? 'var(--color-action-primary)' 
        : 'var(--color-state-disabled)',
      cursor: newComment.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
      opacity: newComment.trim() && !isSubmitting ? 0.8 : 0.3
    }}
    onMouseEnter={(e) => {
      if (newComment.trim() && !isSubmitting) {
        e.currentTarget.style.opacity = '1';
      }
    }}
    onMouseLeave={(e) => {
      if (newComment.trim() && !isSubmitting) {
        e.currentTarget.style.opacity = '0.8';
      }
    }}
  >
    <svg 
      width="18" 
      height="18" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
      style={{ color: 'var(--color-text-primary)' }}
    >
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
    </svg>
  </button>
</form>
    </div>
  );
}