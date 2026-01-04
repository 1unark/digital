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

        const mappedPosts: UIPost[] = apiPosts.map((p) => ({
          id: String(p.id),
          user: {
            id: 0,
            username: p.author.name,
            email: '',
            total_points: 0,
            bio: '',
            avatar: p.author.avatar || null,
          },
          video: p.videoUrl,
          thumbnail: p.thumbnailUrl || null,
          caption: p.title,
          status: 'ready',
          plus_one_count: p.likes,
          plus_two_count: p.plusTwoCount || 0,
          total_score: p.totalScore || 0,
          created_at: new Date(p.createdAt).toISOString(),
          userVote: p.userVote || null,
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