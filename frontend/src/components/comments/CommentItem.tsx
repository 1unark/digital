// components/comments/CommentItem.tsx
'use client';

import { useState } from 'react';
import { PostComment } from '@/types/index';
import Image from 'next/image';
import Link from 'next/link';

interface CommentItemProps {
  comment: PostComment;
  onUpdate: (commentId: string, content: string) => Promise<PostComment>;
  onDelete: (commentId: string) => Promise<void>;
  onReply: (content: string, parentId: string) => Promise<PostComment | undefined>;
  repliesHook: {
    repliesMap: Record<string, PostComment[]>;
    loadingMap: Record<string, boolean>;
    fetchReplies: (parentId: string) => Promise<void>;
    addReply: (parentId: string, reply: PostComment) => void;
    updateReply: (parentId: string, replyId: string, updated: PostComment) => void;
    deleteReply: (parentId: string, replyId: string) => void;
  };
  isReply?: boolean;
}

export function CommentItem({ comment, onUpdate, onDelete, onReply, repliesHook, isReply = false }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const replies = repliesHook.repliesMap[comment.id] || [];
  const loadingReplies = repliesHook.loadingMap[comment.id] || false;

  // Safety check
  if (!comment.author) {
    console.error('Comment missing author:', comment);
    return null;
  }

  const handleEdit = async () => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdate(comment.id, editContent.trim());
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    
    try {
      await onDelete(comment.id);
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const newReply = await onReply(replyContent.trim(), comment.id);
      if (newReply) {
        repliesHook.addReply(comment.id, newReply);
        setReplyContent('');
        setIsReplying(false);
        setShowReplies(true);
      }
    } catch (err) {
      console.error('Failed to post reply:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleReplies = () => {
    if (!showReplies && replies.length === 0) {
      repliesHook.fetchReplies(comment.id);
    }
    setShowReplies(!showReplies);
  };

  return (
    <div className={`mb-4 ${isReply ? 'ml-8' : ''}`}>
      <div className="flex gap-2">
        <Link
          href={`/profile/${comment.author.name}`}
          className="w-8 h-8 flex items-center justify-center flex-shrink-0"
          style={{ 
            backgroundColor: 'var(--color-surface-secondary)',
            borderRadius: '50%'
          }}
        >
          {comment.author.avatar ? (
            <Image
              src={comment.author.avatar} 
              alt={comment.author.name}
              width={32}
              height={32}
              className="w-full h-full object-cover"
              style={{ borderRadius: '50%' }}
              unoptimized={process.env.NEXT_PUBLIC_UNOPTIMIZED_IMAGES === 'true'}

            />
          ) : (
            <span className="text-xs font-medium">
              {comment.author.name[0].toUpperCase()}
            </span>
          )}
        </Link>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/profile/${comment.author.name}`}
              className="font-medium text-sm hover:underline"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {comment.author.name}
            </Link>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {new Date(comment.created_at).toLocaleDateString()}
            </span>
            {comment.is_edited && (
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                (edited)
              </span>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-2 py-1 text-sm rounded"
                rows={2}
                disabled={isSubmitting}
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border-muted)',
                  color: 'var(--color-text-primary)',
                  resize: 'vertical'
                }}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleEdit}
                  disabled={isSubmitting}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                  disabled={isSubmitting}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-secondary)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p 
              className="text-sm mt-1"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              {comment.content}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2">
            {!isReply && (
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs"
                style={{ 
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer'
                }}
              >
                Reply
              </button>
            )}
            
            {comment.is_author && !isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs"
                  style={{ 
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="text-xs"
                  style={{ 
                    color: 'var(--color-text-muted)',
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </>
            )}

            {comment.reply_count > 0 && !isReply && (
              <button
                onClick={toggleReplies}
                className="text-xs"
                style={{ 
                  color: 'var(--color-primary)',
                  cursor: 'pointer'
                }}
              >
                {showReplies ? 'Hide' : `View ${comment.reply_count}`} {comment.reply_count === 1 ? 'reply' : 'replies'}
              </button>
            )}
          </div>

          {isReplying && (
            <div className="mt-2">
              <input
                type="text"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                disabled={isSubmitting}
                className="w-full px-2 py-1 text-sm rounded"
                style={{
                  backgroundColor: 'var(--color-surface-secondary)',
                  border: '1px solid var(--color-border-muted)',
                  color: 'var(--color-text-primary)'
                }}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleReply}
                  disabled={isSubmitting}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-primary)',
                    color: 'white',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    opacity: isSubmitting ? 0.6 : 1
                  }}
                >
                  Reply
                </button>
                <button
                  onClick={() => {
                    setIsReplying(false);
                    setReplyContent('');
                  }}
                  disabled={isSubmitting}
                  className="text-xs px-2 py-1 rounded"
                  style={{
                    backgroundColor: 'var(--color-surface-secondary)',
                    color: 'var(--color-text-secondary)',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {showReplies && (
            <div className="mt-3">
              {loadingReplies ? (
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  Loading replies...
                </p>
              ) : Array.isArray(replies) && replies.length > 0 ? (
                replies.map((reply) => (
                  <CommentItem
                    key={reply.id}
                    comment={reply}
                    onUpdate={(id, content) => {
                      return onUpdate(id, content).then(updated => {
                        repliesHook.updateReply(comment.id, id, updated);
                        return updated;
                      });
                    }}
                    onDelete={(id) => {
                      return onDelete(id).then(() => {
                        repliesHook.deleteReply(comment.id, id);
                      });
                    }}
                    onReply={onReply}
                    repliesHook={repliesHook}
                    isReply={true}
                  />
                ))
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}