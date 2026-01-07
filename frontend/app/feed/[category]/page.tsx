// app/feed/[category]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { postsService } from '../../../src/services/posts.service';
import { Post } from '@/types/index';
import { VideoCard } from '@/components/feed/VideoCard';
import { Sidebar } from '@/components/feed/Sidebar';

export default function CategoryFeedPage() {
  const params = useParams();
  const category = params.category as string;
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      try {
        const data = await postsService.getPosts(category === 'all' ? undefined : category);
        setPosts(data);
      } catch (error) {
        console.error('Failed to load posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };
    loadPosts();
  }, [category]);

  return (
    <div className="min-h-screen relative">
      {/* Main feed - always centered in viewport */}
      <div className="flex justify-center px-4 pt-20">
        <div style={{ width: '800px' }}>
          {loading ? (
            <div style={{ color: 'var(--color-text-secondary)' }}></div>
          ) : posts.length === 0 ? (
            <div style={{ color: 'var(--color-text-secondary)' }}>No posts found in this category.</div>
          ) : (
            <div className="space-y-3 pb-20">
              {posts.map((post) => (
                <VideoCard key={post.id} post={post} />
              ))}
            </div>
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