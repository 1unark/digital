'use client';

import { usePosts } from '@/hooks/usePosts';
import { VideoCard } from './VideoCard';

export function FeedContainer() {
  const { posts, loading, error } = usePosts();

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <VideoCard key={post.id} post={post} />
      ))}
    </div>
  );
}