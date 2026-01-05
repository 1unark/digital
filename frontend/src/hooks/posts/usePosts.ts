import { useState, useEffect } from 'react';
import { postsService } from '../../services/posts.service';
import { Post } from '@/types/index';

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 1. Initialize hasMore as true
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        setLoading(true);
        const data = await postsService.getPosts();
        
        setPosts(data);
        
        // 2. Logic: If the data is empty, there's nothing more to show
        if (!data || data.length === 0) {
          setHasMore(false);
        }
        
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  // 3. Export hasMore
  return { posts, loading, error, hasMore };
}