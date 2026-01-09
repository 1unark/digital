// app/feed/[category]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useInfinitePosts } from '@/hooks/posts/useInfinitePosts';
import { VideoCard } from '@/components/feed/VideoCard';
import { useRef, useEffect } from 'react';

export default function CategoryFeedPage() {
  const params = useParams();
  const category = params.category as string;
  const { posts, loading, hasMore, loadMore, initialLoad } = useInfinitePosts(category);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && hasMore) {
          loadMore();
        }
      },
      { rootMargin: '600px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading, hasMore]); // Removed loadMore from dependencies

  if (initialLoad && loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: 'var(--color-text-secondary)' }}>No posts found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative">
      <div className="flex justify-center px-4 pt-20">
        <div style={{ width: '800px' }}>
          <div className="space-y-3 pb-20">
            {posts.map((post) => (
              <VideoCard key={post.id} post={post} />
            ))}
          </div>
          
          {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
          
          {!hasMore && posts.length > 0 && (
            <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
              No more posts
            </div>
          )}
        </div>
      </div>
    </div>
  );
}