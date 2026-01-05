'use client';

import { usePosts } from '@/hooks/posts/usePosts';
import { VideoCard } from './VideoCard';

export function FeedContainer() {
  // 1. Add 'hasMore' to your hook's return values
  const { posts, loading, error, hasMore } = usePosts();

  if (loading && posts.length === 0) {
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
    /* ... error UI ... */
  }

return (
    <div className="space-y-4 max-w-2xl mx-auto pb-20">

      {posts.map((post) => (
        <VideoCard key={post.id} post={post} />
      ))}

      {/* Show message only when loading is done and hasMore is false */}
      {!hasMore && !loading && (
        <div className="text-center py-10 border-t border-gray-100 mt-8">
          <p className="text-gray-500 font-medium">You're all caught up!</p>
          <p className="text-gray-400 text-sm">No more posts to show.</p>
        </div>
      )}
    </div>
  );
}