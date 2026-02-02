// app/post/[id]/PostPageClient.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation'; // ADD THIS BACK
import { postsService } from '../../../src/services/posts.service';
import { Post } from '@/types/index';
import { VideoCard } from '@/components/feed/VideoCard';

export default function PostPageClient() { // REMOVE postId prop
  const params = useParams();
  const postId = params.id as string; // ADD THIS BACK
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const data = await postsService.getPostById(postId);
        setPost(data);
      } catch (error) {
        console.error('Failed to load post:', error);
      } finally {
        setLoading(false);
      }
    };
    loadPost();
  }, [postId]);

  return (
    <div className="min-h-screen pt-20">
      <div className="flex justify-center px-4">
        <div style={{ width: '800px' }}>
          {loading ? (
            <div style={{ color: 'var(--color-text-secondary)' }}></div>
          ) : post ? (
            <VideoCard post={post} />
          ) : (
            <div style={{ color: 'var(--color-text-secondary)' }}>Post not found</div>
          )}
        </div>
      </div>
    </div>
  );
}