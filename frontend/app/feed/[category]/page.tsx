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
      <div className="mx-auto px-4 pt-20" style={{ width: '800px' }}>
        {loading ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
        ) : posts.length === 0 ? (
          <div style={{ color: 'var(--color-text-secondary)' }}>No posts found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <VideoCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      
      <aside 
        className="hidden xl:block fixed w-56 z-10" 
        style={{
          left: 'calc(50% - 345px - 280px)',
          top: '80px'
        }}
      >
        <Sidebar />
      </aside>
    </div>
  );
}