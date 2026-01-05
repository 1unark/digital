// components/comments/CommentsBox.tsx
'use client';

import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  author: {
    name: string;
    avatar?: string;
  };
  content: string;
  createdAt: string;
}

interface CommentsBoxProps {
  postId: string;
  onClose: () => void;
  videoCardRef: React.RefObject<HTMLElement | null>;
}

export function CommentsBox({ postId, onClose, videoCardRef }: CommentsBoxProps) {
  const [comments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewComment('');
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
        {comments.length === 0 ? (
          <p 
            className="text-sm text-center mt-8"
            style={{ color: 'var(--color-text-muted)' }}
          >
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="mb-4">
              <div className="flex gap-2">
                <div 
                  className="w-8 h-8 flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: 'var(--color-surface-secondary)',
                    borderRadius: '50%'
                  }}
                >
                  {comment.author.avatar ? (
                    <img 
                      src={comment.author.avatar} 
                      alt={comment.author.name}
                      className="w-full h-full object-cover"
                      style={{ borderRadius: '50%' }}
                    />
                  ) : (
                    <span className="text-xs font-medium">
                      {comment.author.name[0].toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p 
                    className="font-medium text-sm"
                    style={{ color: 'var(--color-text-primary)' }}
                  >
                    {comment.author.name}
                  </p>
                  <p 
                    className="text-sm mt-1"
                    style={{ color: 'var(--color-text-secondary)' }}
                  >
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <form 
        onSubmit={handleSubmit}
        className="px-4 py-3"
        style={{ borderTop: '1px solid var(--color-border-muted)' }}
      >
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="w-full px-3 py-2 text-sm rounded"
          style={{
            backgroundColor: 'var(--color-surface-secondary)',
            border: '1px solid var(--color-border-muted)',
            color: 'var(--color-text-primary)'
          }}
        />
      </form>
    </div>
  );
}