// app/feed/[category]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useInfinitePosts } from '@/hooks/posts/useInfinitePosts';
import { VideoCard } from '@/components/feed/VideoCard';
import { Sidebar } from '@/components/feed/Sidebar';
import { useRef, useEffect } from 'react';
import { Post } from '@/types/index'

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
  }, [loading, hasMore]);

  return (
    <div className="min-h-screen relative">
      {/* Main feed - always centered in viewport */}
      <div className="flex justify-center px-4 pt-20">
        <div style={{ width: '800px' }}>
          {initialLoad && loading ? (
            <div style={{ color: 'var(--color-text-secondary)' }}></div>
          ) : posts.length === 0 ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>No posts found</div>
          ) : (
            <>
              <div className="space-y-3 pb-20">
                {posts.map((post) => (
                  <VideoCard key={post.id} post={post} />
                ))}
              </div>
              
              {hasMore && <div ref={sentinelRef} style={{ height: '1px' }} />}
              
              {!hasMore && (
                <div className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>
                  No more posts
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sidebar - positioned to the left with 50px gap, hidden when space is tight */}
      <aside 
        className="fixed w-64 z-10" 
        style={{
          left: 'calc(50% - 350px - 65px - 256px)',
          top: '80px'
        }}
      >
        <div className="hidden" style={{
          display: 'var(--show-sidebar, none)'
        }}>
          <Sidebar />
        </div>
      </aside>

      <style jsx>{`
        @media (min-width: 1306px) {
          aside > div {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}