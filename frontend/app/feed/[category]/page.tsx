// app/feed/[category]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { postsService } from '../../../src/services/posts.service';
import { Post } from '@/types/index';
import { VideoCard } from '@/components/feed/VideoCard';
import { FeedLayout } from '@/components/feed/FeedLayout';

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
    <FeedLayout>
      {loading ? (
        <div style={{ color: 'var(--color-text-secondary)' }}>Loading...</div>
      ) : posts.length === 0 ? (
        <div style={{ color: 'var(--color-text-secondary)' }}>No posts found in this category.</div>
      ) : (
        <div className="space-y-4 pb-20">
          {posts.map((post) => (
            <VideoCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </FeedLayout>
  );
}