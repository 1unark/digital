// app/feed/[...slug]/page.tsx
'use client';

import { useParams } from 'next/navigation';
import { useInfinitePosts } from '@/hooks/posts/useInfinitePosts';
import { VideoCard } from '@/components/feed/VideoCard';
import { Sidebar } from '@/components/feed/Sidebar';
import { useRef, useEffect } from 'react';

export default function FeedPage() {
  const params = useParams();
  const slug = params.slug as string[];
  
  // Parse URL: /feed/all, /feed/wip, /feed/wip/amv
  const mainCategory = slug?.[0] || 'all';
  const subCategory = slug?.[1];
  
  const { posts, loading, hasMore, loadMore, initialLoad, refetch } = useInfinitePosts(
    undefined,
    {
      main_category: mainCategory,
      category: subCategory
    }
  );
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
      <div className="flex justify-center px-4 pt-20">
        <div style={{ width: '800px', maxWidth: '100%' }}>
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