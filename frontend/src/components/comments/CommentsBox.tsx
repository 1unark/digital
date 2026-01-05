// components/comments/CommentsSection.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  upvotes: number;
  userVote?: number;
}

interface CommentsSectionProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentsSection({ postId, isOpen, onClose }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, postId]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        const data = await response.json();
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVoteComment = async (commentId: string, currentVote?: number) => {
    if (!user) return;

    try {
      const isRemoving = currentVote === 1;
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: isRemoving ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: 1 }),
      });

      if (response.ok) {
        setComments(comments.map(comment => 
          comment.id === commentId
            ? {
                ...comment,
                upvotes: isRemoving ? comment.upvotes - 1 : comment.upvotes + 1,
                userVote: isRemoving ? undefined : 1
              }
            : comment
        ));
      }
    } catch (error) {
      console.error('Failed to vote comment:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      style={{
        width: '350px',
        height: '100%',
        backgroundColor: 'var(--color-surface-primary)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '6px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-border-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <h3 
          style={{ 
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-text-primary)',
            margin: 0
          }}
        >
          Comments
        </h3>
        <button
          onClick={onClose}
          style={{
            padding: '4px',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '4px'
          }}
        >
          <svg 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="var(--color-text-secondary)" 
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Comment Input */}
      {user && (
        <form onSubmit={handleSubmitComment} style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border-default)' }}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid var(--color-border-default)',
              borderRadius: '6px',
              resize: 'none',
              minHeight: '60px',
              fontSize: '13px',
              backgroundColor: 'var(--color-surface-secondary)',
              color: 'var(--color-text-primary)',
              fontFamily: 'inherit'
            }}
            disabled={isSubmitting}
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button
              type="submit"
              style={{
                padding: '6px 12px',
                fontSize: '13px',
                borderRadius: '6px',
                border: 'none',
                fontWeight: 500,
                cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                backgroundColor: newComment.trim() ? 'var(--color-action-primary)' : 'var(--color-action-secondary)',
                color: 'var(--color-surface-primary)',
                opacity: newComment.trim() ? 1 : 0.5
              }}
              disabled={!newComment.trim() || isSubmitting}
            >
              {isSubmitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              Loading...
            </p>
          </div>
        ) : comments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center' }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', margin: 0 }}>
              No comments yet
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div 
              key={comment.id} 
              style={{ 
                padding: '12px 16px',
                borderBottom: '1px solid var(--color-border-muted)'
              }}
            >
              <div style={{ display: 'flex', gap: '8px' }}>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-surface-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {comment.author.avatar ? (
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                    />
                  ) : (
                    <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
                      {comment.author.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                      {comment.author.name}
                    </span>
                    <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', margin: '0 0 8px 0', wordBreak: 'break-word' }}>
                    {comment.content}
                  </p>
                  <button
                    onClick={() => handleVoteComment(comment.id, comment.userVote)}
                    disabled={!user}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      border: 'none',
                      borderRadius: '4px',
                      backgroundColor: comment.userVote === 1 ? 'rgba(255, 69, 0, 0.1)' : 'transparent',
                      cursor: user ? 'pointer' : 'not-allowed'
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path 
                        d="M12 4 L20 20 L4 20 Z" 
                        fill={comment.userVote === 1 ? '#FF4500' : 'none'}
                        stroke={comment.userVote === 1 ? '#FF4500' : '#878A8C'}
                        strokeWidth="2"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span style={{ fontSize: '12px', fontWeight: 500, color: comment.userVote === 1 ? '#FF4500' : 'var(--color-text-secondary)' }}>
                      {comment.upvotes}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}