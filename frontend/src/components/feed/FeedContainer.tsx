// components/feed/FeedContainer.tsx
'use client';

import { usePosts } from '@/hooks/posts/usePosts';
import { VideoCard } from './VideoCard';

export function FeedContainer() {
  const { posts, loading, error } = usePosts();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: 'var(--color-action-primary)' }}
        ></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="text-center py-12 px-4 rounded-lg"
        style={{
          backgroundColor: 'var(--color-danger-bg)',
          color: 'var(--color-danger-text)',
          border: '1px solid var(--color-danger-border)'
        }}
      >
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <VideoCard key={post.id} post={post} />
      ))}
    </div>
  );
}