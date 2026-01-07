// components/feed/ShareModal.tsx
'use client';

import { useState } from 'react';

interface ShareModalProps {
  postId: string;
  onClose: () => void;
}

export function ShareModal({ postId, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const postUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/post/${postId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 z-40"
        onClick={onClose}
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)' }}
      />
      
      <div 
        className="fixed z-50"
        style={{
          backgroundColor: 'var(--color-surface-primary)',
          border: '1px solid var(--color-border-muted)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '480px',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }}
      >
        <div 
          className="flex items-center justify-between"
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-muted)'
          }}
        >
          <h3 
            style={{ 
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: '500',
              margin: 0
            }}
          >
            Share Post
          </h3>
          <button
            onClick={onClose}
            className="rounded transition-colors"
            style={{ 
              color: 'var(--color-text-muted)',
              padding: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-action-secondary-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div style={{ padding: '16px' }}>
          <div className="flex gap-2">
            <input
              type="text"
              value={postUrl}
              readOnly
              style={{
                flex: 1,
                padding: '8px 10px',
                borderRadius: '4px',
                border: '1px solid var(--color-border-default)',
                backgroundColor: 'var(--color-surface-secondary)',
                color: 'var(--color-text-primary)',
                fontSize: '13px',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-focus-ring)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--color-border-default)';
              }}
            />
            <button
              onClick={handleCopy}
              className="transition-colors"
              style={{
                padding: '8px 14px',
                borderRadius: '4px',
                fontSize: '13px',
                fontWeight: '500',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: copied ? '#10B981' : 'var(--color-action-primary)',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-primary-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (!copied) {
                  e.currentTarget.style.backgroundColor = 'var(--color-action-primary)';
                }
              }}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}