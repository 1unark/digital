import { useState, useEffect } from 'react';
import { postsService } from '../../services/posts.service';
import type { Post as UIPost, User } from '@/types/index';

export function usePosts() {
  const [posts, setPosts] = useState<UIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const apiPosts = await postsService.getPosts();

        // Map API Post → UI Post
        const mappedPosts: UIPost[] = apiPosts.map((p) => ({
          id: Number(p.id), // convert string to number if needed
          user: {
            id: 0, // placeholder if API doesn't provide
            username: p.author.name,
            email: '', // placeholder
            total_points: 0,
            bio: '',
            avatar: p.author.avatar || null,
          },
          video: p.videoUrl,
          thumbnail: p.thumbnailUrl || null,
          caption: p.title,
          status: 'ready', // default
          plus_one_count: p.likes,
          plus_two_count: 0,
          total_score: p.likes,
          created_at: new Date(p.createdAt).toISOString(),
        }));

        setPosts(mappedPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return { posts, loading, error };
}
